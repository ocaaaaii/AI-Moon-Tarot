"""
Agent 1 — Scraper Expert
Crawls individual tarot card pages from nes-tarot.com, extracts bilingual
content (Chinese + English), downloads card images, and saves raw JSON.

Rate-limiting contract: random_delay() is called before EVERY HTTP request.
"""
import json
import logging
import re
from datetime import date
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup, Tag

from .config import (
    CARD_LIST,
    IMAGE_DIR,
    KNOWN_ZH_NAMES,
    MAX_RETRIES,
    RAW_DATA_DIR,
    REQUEST_TIMEOUT,
    RETRY_BACKOFF,
)
from .utils import build_headers, make_filename, random_delay

logger = logging.getLogger(__name__)


class ScraperAgent:
    """Scrapes a single tarot card page and persists the result as raw JSON.

    Args:
        output_dir: Where to save raw JSON files (defaults to data/raw/).
        image_dir:  Where to save downloaded card images (defaults to public/assets/cards/).
    """

    def __init__(
        self,
        output_dir: Path = RAW_DATA_DIR,
        image_dir: Path = IMAGE_DIR,
    ) -> None:
        self.output_dir = Path(output_dir)
        self.image_dir = Path(image_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.image_dir.mkdir(parents=True, exist_ok=True)

    # ─── Public API ───────────────────────────────────────────────────────────

    def scrape_card(self, card_info: dict) -> dict:
        """Fetch, parse, and save one card page.

        Always delays before fetching to respect the server.
        Retries up to MAX_RETRIES times on transient failures.

        Returns the parsed card data dict.
        Raises on non-retriable errors (e.g. 4xx status codes).
        """
        url = card_info["url"]
        logger.info(f"[{card_info['id']:02d}] Scraping: {url}")

        html = self._fetch_with_retry(url)
        data = self._parse_card_page(html, card_info)
        data["local_image_path"] = self._download_image(data["image_url"], card_info)
        self._save_raw_json(data, card_info)
        return data

    # ─── HTTP helpers ─────────────────────────────────────────────────────────

    def _fetch_with_retry(self, url: str) -> str:
        """GET url with exponential-ish backoff.  Always delays before each attempt."""
        last_exc: Optional[Exception] = None

        for attempt in range(1, MAX_RETRIES + 1):
            random_delay()  # ← ALWAYS delay; non-negotiable
            try:
                response = requests.get(
                    url,
                    headers=build_headers(),
                    timeout=REQUEST_TIMEOUT,
                )
                response.raise_for_status()
                return response.text
            except Exception as exc:
                last_exc = exc
                logger.warning(f"Attempt {attempt}/{MAX_RETRIES} failed for {url}: {exc}")
                if attempt < MAX_RETRIES:
                    import time
                    time.sleep(RETRY_BACKOFF * attempt)

        raise RuntimeError(f"All {MAX_RETRIES} attempts failed for {url}") from last_exc

    def _download_image(self, image_url: str, card_info: dict) -> str:
        """Download the card image and save it to image_dir.

        Returns the relative path string for storage in JSON.
        """
        if not image_url:
            return ""

        ext = "." + image_url.rsplit(".", 1)[-1].split("?")[0]  # .jpeg / .png / .webp
        filename = make_filename(card_info["id"], card_info["slug"], ext)
        dest = self.image_dir / filename

        if dest.exists():
            logger.debug(f"Image already exists, skipping download: {dest}")
            return str(dest)

        random_delay()
        try:
            response = requests.get(image_url, headers=build_headers(), timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            dest.write_bytes(response.content)
            logger.info(f"  → Image saved: {dest}")
        except Exception as exc:
            logger.warning(f"Image download failed for {image_url}: {exc}")
            return ""

        return str(dest)

    # ─── HTML parsing ─────────────────────────────────────────────────────────

    def _parse_card_page(self, html: str, card_info: dict) -> dict:
        """Extract all card data from a nes-tarot.com card page."""
        soup = BeautifulSoup(html, "html.parser")

        # WordPress pages wrap post content in .entry-content or article
        content = (
            soup.find(class_="entry-content")
            or soup.find("article")
            or soup.find("main")
            or soup.body
        )

        name_zh, name_en = self._parse_title(content, card_info)
        self._validate_chinese_name(name_en, name_zh)

        return {
            "id":              card_info["id"],
            "slug":            card_info["slug"],
            "name_en":         name_en,
            "name_zh":         name_zh,
            "arcana":          card_info["arcana"],
            "suit":            card_info.get("suit"),
            "number":          card_info.get("number"),
            "keywords":        self._parse_keywords(content),
            "summary":         self._parse_section(content, "簡述"),
            "story":           self._parse_section(content, "解說"),
            "reflection":      self._parse_reflection(content),
            "upright_meanings":  self._parse_cartomantic_list(content, ["正面意義", "As a positive"]),
            "reversed_meanings": self._parse_cartomantic_list(content, ["負面意義", "As a negative"]),
            "love_reading":    self._parse_cartomantic_text(content, ["感受性", "Feelings towards"]),
            "career_reading":  self._parse_cartomantic_text(content, ["轉職", "Career changes"]),
            "image_url":       self._parse_image_url(content),
            "source_url":      card_info["url"],
            "scraped_at":      date.today().isoformat(),
        }

    def _parse_title(self, content: Tag, card_info: dict) -> tuple[str, str]:
        """Extract Chinese and English names from the <h1> tag.

        Expected formats:
          "0 愚者 / The Fool"
          "權杖王牌 / Ace of Wands"
        Falls back to the pre-defined names in card_info if parsing fails.
        """
        h1 = content.find("h1") if content else None
        if not h1:
            return card_info["name_zh"], card_info["name_en"]

        text = h1.get_text(separator=" ", strip=True)

        # Pattern: optional number, Chinese name, separator (/), English name
        match = re.search(r"[\d]*\s*([^\d/]+?)\s*/\s*(.+)$", text)
        if match:
            name_zh = match.group(1).strip()
            name_en = match.group(2).strip()
            return name_zh, name_en

        return card_info["name_zh"], card_info["name_en"]

    def _parse_keywords(self, content: Tag) -> list[str]:
        """Extract the bold keyword line that appears directly under the h1."""
        if not content:
            return []

        # The keywords line is the first <strong> or <b> paragraph after h1
        h1 = content.find("h1")
        if not h1:
            return []

        for sibling in h1.find_next_siblings():
            text = sibling.get_text(strip=True)
            # Keywords line contains Chinese/English words separated by 、 or ,
            if "、" in text or ("," in text and len(text) < 200):
                raw = re.split(r"[、,，]", text)
                return [kw.strip() for kw in raw if kw.strip()]

        return []

    def _parse_section(self, content: Tag, heading: str) -> str:
        """Return the text of the paragraph(s) immediately following a bold heading."""
        if not content:
            return ""

        for elem in content.find_all(["p", "strong", "b"]):
            if heading in elem.get_text():
                texts: list[str] = []
                for sibling in elem.find_next_siblings():
                    sib_text = sibling.get_text(separator="\n", strip=True)
                    # Stop at the next section heading
                    if sibling.find(["strong", "b"]) and len(sib_text) < 30:
                        break
                    if sib_text:
                        texts.append(sib_text)
                    if len(texts) >= 5:
                        break
                return "\n\n".join(texts)

        return ""

    def _parse_reflection(self, content: Tag) -> list[str]:
        """Extract bullet points from the 思考重點 section."""
        if not content:
            return []

        for elem in content.find_all(["p", "strong", "b", "h3", "h4"]):
            if "思考重點" in elem.get_text():
                ul = elem.find_next("ul")
                if ul:
                    return [li.get_text(strip=True) for li in ul.find_all("li")]

        return []

    def _parse_cartomantic_list(self, content: Tag, headings: list[str]) -> list[str]:
        """Extract a bullet list from the 占卜牌義速查 table section."""
        if not content:
            return []

        for heading in headings:
            for elem in content.find_all(string=re.compile(re.escape(heading))):
                parent = elem.parent
                ul = parent.find_next("ul") if parent else None
                if ul:
                    return [li.get_text(strip=True) for li in ul.find_all("li")]

        return []

    def _parse_cartomantic_text(self, content: Tag, headings: list[str]) -> str:
        """Extract a short text value from the 占卜牌義速查 table section."""
        results = self._parse_cartomantic_list(content, headings)
        return "、".join(results) if results else ""

    def _parse_image_url(self, content: Tag) -> str:
        """Find the first <img> that looks like a tarot card image."""
        if not content:
            return ""

        for img in content.find_all("img"):
            src = img.get("src", "")
            if "tarot-meanings" in src or "/tarot/" in src:
                return src

        return ""

    # ─── Validation ───────────────────────────────────────────────────────────

    def _validate_chinese_name(self, name_en: str, name_zh: str) -> None:
        """Warn if the scraped Chinese name differs from the known-correct translation."""
        expected = KNOWN_ZH_NAMES.get(name_en)
        if expected and expected != name_zh:
            logger.warning(
                f"Chinese name mismatch for '{name_en}': "
                f"scraped='{name_zh}', expected='{expected}'"
            )

    # ─── Persistence ──────────────────────────────────────────────────────────

    def _save_raw_json(self, data: dict, card_info: dict) -> Path:
        filename = make_filename(card_info["id"], card_info["slug"], ".json")
        dest = self.output_dir / filename
        dest.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        logger.info(f"  → Raw JSON saved: {dest}")
        return dest
