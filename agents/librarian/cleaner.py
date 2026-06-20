"""
Agent 2 — Tarot Librarian: Data Cleaner
Cleans raw scraped data: strips HTML, normalises whitespace, validates fields.
"""
import copy
import re
from html.parser import HTMLParser


class _HTMLStripper(HTMLParser):
    """Minimal HTML tag stripper (avoids heavy dependency like lxml)."""

    def __init__(self) -> None:
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)

    def get_text(self) -> str:
        return "".join(self._parts)


def strip_html(text: str) -> str:
    """Remove all HTML tags from a string."""
    if not text or "<" not in text:
        return text
    stripper = _HTMLStripper()
    stripper.feed(text)
    return stripper.get_text()


def normalise_whitespace(text: str) -> str:
    """Collapse runs of whitespace into single spaces; strip leading/trailing."""
    if not text:
        return text
    # Replace newlines / tabs with a single space
    text = re.sub(r"[\r\n\t]+", " ", text)
    # Collapse multiple spaces (preserve single space)
    text = re.sub(r" {3,}", "  ", text)
    return text.strip()


def _clean_str(value: str) -> str:
    return normalise_whitespace(strip_html(value))


def _clean_list(items: list[str]) -> list[str]:
    return [_clean_str(item) for item in items if item and item.strip()]


def clean_card_data(raw: dict) -> dict:
    """Return a cleaned copy of raw card data (does NOT mutate the input).

    Cleaning steps:
    1. Strip HTML tags from all string fields.
    2. Normalise whitespace (collapse extra spaces/newlines).
    3. Ensure list fields are proper lists.
    4. Preserve all non-string/list fields unchanged.
    """
    data = copy.deepcopy(raw)

    # String fields that may contain HTML or irregular whitespace
    text_fields = (
        "name_en", "name_zh", "summary", "story",
        "love_reading", "career_reading",
    )
    for field in text_fields:
        if field in data and isinstance(data[field], str):
            data[field] = _clean_str(data[field])

    # List-of-strings fields
    list_fields = (
        "keywords", "reflection",
        "upright_meanings", "reversed_meanings",
    )
    for field in list_fields:
        if field in data:
            if isinstance(data[field], list):
                data[field] = _clean_list(data[field])
            elif isinstance(data[field], str):
                # Fallback: split on common delimiters
                raw_list = re.split(r"[、,，\n]", data[field])
                data[field] = _clean_list(raw_list)

    return data
