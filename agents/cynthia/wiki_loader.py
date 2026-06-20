"""
Agent 3 — Cynthia: Wiki Loader
Loads and parses /wiki/{id}-{slug}.md files for any given card ID.
Returns a structured CardContext dataclass ready for context building.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml

from ..scraper.config import CARD_LIST, WIKI_DIR
from ..scraper.utils import make_filename


@dataclass
class CardContext:
    """Structured representation of a single tarot card's wiki content."""
    id: int
    slug: str
    name_en: str
    name_zh: str
    arcana: str
    suit: Optional[str]
    number: int
    keywords: list[str]
    upright_meanings: list[str]
    reversed_meanings: list[str]
    summary: str
    story: str
    reflection: list[str]
    love_reading: str
    career_reading: str
    image_url: str
    source_url: str
    is_reversed: bool = False

    @property
    def display_name(self) -> str:
        return f"{self.name_zh} / {self.name_en}"

    @property
    def position_label(self) -> str:
        return "逆位 (Reversed)" if self.is_reversed else "正位 (Upright)"

    @property
    def active_meanings(self) -> list[str]:
        """Return the relevant meanings based on orientation."""
        return self.reversed_meanings if self.is_reversed else self.upright_meanings


def _parse_frontmatter(content: str) -> tuple[dict, str]:
    """Split a markdown file into its YAML frontmatter and body text.

    Returns (metadata_dict, body_string).
    """
    if not content.startswith("---"):
        return {}, content

    # Find the closing ---
    end = content.find("---", 3)
    if end == -1:
        return {}, content

    yaml_str = content[3:end].strip()
    body = content[end + 3:].strip()

    try:
        metadata = yaml.safe_load(yaml_str) or {}
    except yaml.YAMLError:
        metadata = {}

    return metadata, body


def _extract_section(body: str, heading: str) -> str:
    """Extract the text content of a specific ## heading section from markdown body."""
    pattern = rf"## {re.escape(heading)}\n+([\s\S]*?)(?=\n## |\Z)"
    match = re.search(pattern, body)
    if match:
        return match.group(1).strip()
    return ""


def _extract_list_section(body: str, heading: str) -> list[str]:
    """Extract a bullet-list section as a Python list."""
    raw = _extract_section(body, heading)
    if not raw:
        return []
    return [line.lstrip("- ").strip() for line in raw.splitlines() if line.strip().startswith("-")]


def load_card(card_id: int, reversed: bool = False, wiki_dir: Path = WIKI_DIR) -> CardContext:
    """Load a card's wiki Markdown file by ID and return a CardContext.

    Args:
        card_id:   Integer 0–77.
        reversed:  Whether the card was drawn reversed (逆位).
        wiki_dir:  Path to the wiki directory (default: wiki/).

    Raises:
        ValueError: If card_id is out of range.
        FileNotFoundError: If the wiki file does not exist.
    """
    if not 0 <= card_id <= 77:
        raise ValueError(f"card_id must be 0–77, got {card_id}")

    card_info = CARD_LIST[card_id]
    filename = make_filename(card_id, card_info["slug"], ".md")
    md_path = Path(wiki_dir) / filename

    if not md_path.exists():
        raise FileNotFoundError(
            f"Wiki file not found: {md_path}. "
            f"Run the scraper first: python -m agents.pipeline.orchestrator"
        )

    raw = md_path.read_text(encoding="utf-8")
    meta, body = _parse_frontmatter(raw)

    return CardContext(
        id=card_id,
        slug=card_info["slug"],
        name_en=meta.get("name", card_info["name_en"]),
        name_zh=meta.get("name_zh", card_info["name_zh"]),
        arcana=meta.get("arcana", card_info["arcana"]),
        suit=meta.get("suit"),
        number=meta.get("number", card_info.get("number", 0)),
        keywords=meta.get("keywords") or [],
        upright_meanings=meta.get("upright_meanings") or [],
        reversed_meanings=meta.get("reversed_meanings") or [],
        summary=_extract_section(body, "簡述 Summary"),
        story=_extract_section(body, "牌義故事 Story & Symbolism"),
        reflection=_extract_list_section(body, "思考重點 Reflection"),
        love_reading=_extract_section(body, "感情關係 Love & Relationships"),
        career_reading=_extract_section(body, "職場 Career & Work"),
        image_url=meta.get("image_url", ""),
        source_url=meta.get("source_url", ""),
        is_reversed=reversed,
    )


def load_cards(
    card_requests: list[dict],
    wiki_dir: Path = WIKI_DIR,
) -> list[CardContext]:
    """Load multiple cards at once.

    Args:
        card_requests: List of dicts with keys "id" (int) and "reversed" (bool).
                       Example: [{"id": 0, "reversed": False}, {"id": 12, "reversed": True}]
        wiki_dir:      Path to the wiki directory.

    Returns:
        List of CardContext objects in the same order as card_requests.

    Raises:
        ValueError: If more than 3 cards are requested (v1 limit).
    """
    if len(card_requests) > 3:
        raise ValueError(f"Maximum 3 cards per reading (got {len(card_requests)})")
    if len(card_requests) == 0:
        raise ValueError("At least 1 card is required")

    return [
        load_card(req["id"], reversed=req.get("reversed", False), wiki_dir=wiki_dir)
        for req in card_requests
    ]
