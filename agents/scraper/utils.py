"""
Scraper Agent — Utility functions
Rate-limiting, header rotation, URL helpers.
"""
import random
import re
import time
from urllib.parse import urlparse

from .config import DELAY_RANGE, USER_AGENTS


def random_delay() -> None:
    """Sleep for a random duration within DELAY_RANGE to mimic human browsing.

    This is a hard requirement: the scraper MUST always call this between
    requests to avoid overwhelming the target server.
    """
    duration = random.uniform(*DELAY_RANGE)
    time.sleep(duration)


def build_headers() -> dict[str, str]:
    """Return a realistic HTTP headers dict with a randomly chosen User-Agent."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
    }


def extract_slug_from_url(url: str) -> str:
    """Extract the card slug from a nes-tarot.com card URL.

    Examples:
        https://nes-tarot.com/tarot-meanings-fool/          → "fool"
        https://nes-tarot.com/tarot-meanings-court-wands-page/ → "court-wands-page"
    """
    path = urlparse(url).path.rstrip("/")
    # Remove the /tarot-meanings- prefix
    match = re.search(r"/tarot-meanings-(.+)$", path)
    if match:
        return match.group(1)
    # Fallback: return the last path segment
    return path.split("/")[-1]


def make_filename(card_id: int, slug: str, ext: str) -> str:
    """Build a zero-padded filename, e.g. '00-fool.json', '21-world.jpeg'."""
    return f"{card_id:02d}-{slug}{ext}"
