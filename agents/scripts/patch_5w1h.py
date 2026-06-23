"""
patch_5w1h.py — 補抓所有缺少 5W1H 區塊的塔羅牌 wiki 檔案。

用法（在專案根目錄執行）：
    python agents/scripts/patch_5w1h.py

會自動：
1. 掃描 /wiki/*.md，找出沒有「5W1H」的檔案
2. 從每張牌的 source_url 爬取 5W1H 區塊
3. 把內容 append 到 wiki 檔案末尾
4. 每次請求間隨機延遲 2–5 秒，避免打垮目標伺服器

需要先安裝：
    pip install requests beautifulsoup4
"""

import re
import sys
import time
import random
import logging
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

WIKI_DIR = Path(__file__).parents[2] / "wiki"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def random_delay() -> None:
    """2–5 秒隨機延遲，保護目標伺服器。"""
    delay = random.uniform(2.0, 5.0)
    logger.debug(f"  Sleeping {delay:.1f}s …")
    time.sleep(delay)


def get_source_url(md_path: Path) -> str | None:
    """從 frontmatter 取出 source_url。"""
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"^source_url:\s*(.+)$", text, re.MULTILINE)
    return m.group(1).strip() if m else None


def has_5w1h(md_path: Path) -> bool:
    return "5W1H" in md_path.read_text(encoding="utf-8")


def fetch_html(url: str) -> str | None:
    random_delay()
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        return r.text
    except Exception as e:
        logger.error(f"  Fetch failed: {e}")
        return None


def extract_5w1h(html: str) -> str | None:
    """
    從 HTML 提取 5W1H 區塊。

    nes-tarot.com 的 5W1H 區塊用 <h3> 或 <h2> 標記，
    每個子標題（是什麼/為什麼/是誰…）通常用 <strong> 或 <h4>。
    我們直接取從「5W1H」開始到頁面結束或下一個主要 h2 之間的純文字。
    """
    soup = BeautifulSoup(html, "html.parser")
    content = (
        soup.find(class_="entry-content")
        or soup.find("article")
        or soup.find("main")
        or soup.body
    )
    if not content:
        return None

    # Find the element containing "5W1H"
    start_elem = None
    for elem in content.find_all(["h2", "h3", "h4", "p", "strong", "b"]):
        if "5W1H" in elem.get_text():
            start_elem = elem
            break

    if not start_elem:
        return None

    # Collect all text from start_elem onwards until we hit an unrelated h2
    lines: list[str] = []
    lines.append(f"## {start_elem.get_text(strip=True)}")

    for sib in start_elem.find_next_siblings():
        tag = sib.name

        # Stop if we hit a clearly unrelated section (comments, footer, etc.)
        if tag in ("footer", "nav", "aside"):
            break
        if tag == "h2":
            # Some pages have a comments h2 at the end — stop there
            text = sib.get_text(strip=True)
            if any(kw in text for kw in ["留言", "Comment", "回覆", "Reply"]):
                break
            # Otherwise it might be a new real section — stop too
            break

        # Sub-headings (h3/h4) → markdown ##/###
        if tag in ("h3", "h4"):
            lines.append(f"\n## {sib.get_text(strip=True)}")
            continue

        # <ul> / <ol> → markdown list
        if tag in ("ul", "ol"):
            for li in sib.find_all("li"):
                lines.append(f"- {li.get_text(strip=True)}")
            continue

        # <strong>/<b> inside a <p> often acts as a sub-heading
        if tag == "p":
            inner_strong = sib.find(["strong", "b"])
            text = sib.get_text(separator="\n", strip=True)
            if not text:
                continue
            if inner_strong and len(text) < 60:
                lines.append(f"\n## {text}")
            else:
                lines.append(text)
            continue

        # Everything else — grab plain text
        text = sib.get_text(separator="\n", strip=True)
        if text:
            lines.append(text)

    result = "\n".join(lines).strip()
    return result if len(result) > 20 else None


def append_to_wiki(md_path: Path, section: str) -> None:
    original = md_path.read_text(encoding="utf-8")
    updated = original.rstrip() + "\n\n" + section + "\n"
    md_path.write_text(updated, encoding="utf-8")


def main() -> None:
    md_files = sorted(WIKI_DIR.glob("*.md"))
    missing = [f for f in md_files if not has_5w1h(f)]

    logger.info(f"Found {len(missing)} wiki files missing 5W1H (out of {len(md_files)} total)")

    success = 0
    failed: list[str] = []

    for md_path in missing:
        url = get_source_url(md_path)
        if not url:
            logger.warning(f"  [{md_path.name}] No source_url found — skipping")
            failed.append(md_path.name)
            continue

        logger.info(f"[{md_path.name}] Fetching {url}")
        html = fetch_html(url)
        if not html:
            failed.append(md_path.name)
            continue

        section = extract_5w1h(html)
        if not section:
            logger.warning(f"  [{md_path.name}] 5W1H section not found on page")
            failed.append(md_path.name)
            continue

        append_to_wiki(md_path, section)
        logger.info(f"  ✓ Appended {len(section)} chars to {md_path.name}")
        success += 1

    logger.info(f"\n=== Done: {success} patched, {len(failed)} failed ===")
    if failed:
        logger.info("Failed files:")
        for name in failed:
            logger.info(f"  - {name}")


if __name__ == "__main__":
    main()
