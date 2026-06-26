"""
Horoscope Scraper — Weekly Zodiac Fetcher
Fetches all 12 signs from astro.click108.com.tw (server-rendered PHP, safe to scrape).
Saves raw content to /wiki-horoscope/YYYY-WNN-{sign}.md for consumption by the API route.

Usage:
    python agents/horoscopeScraper.py

Intended to run weekly (Monday morning) via scheduled task.
Rate-limited with 1.5s delays between requests.
"""

import re
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path

# ── Sign mapping: iAstro param → (slug, Chinese name) ──────────────────────
SIGNS: list[tuple[int, str, str]] = [
    (0,  "aries",       "牡羊座"),
    (1,  "taurus",      "金牛座"),
    (2,  "gemini",      "雙子座"),
    (3,  "cancer",      "巨蟹座"),
    (4,  "leo",         "獅子座"),
    (5,  "virgo",       "處女座"),
    (6,  "libra",       "天秤座"),
    (7,  "scorpio",     "天蠍座"),
    (8,  "sagittarius", "射手座"),
    (9,  "capricorn",   "魔羯座"),
    (10, "aquarius",    "水瓶座"),
    (11, "pisces",      "雙魚座"),
]

BASE_URL = "https://astro.click108.com.tw/weekly_0.php"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9",
    "Referer": "https://astro.click108.com.tw/",
}


def get_iso_week(dt: datetime | None = None) -> str:
    """Return ISO week string like '2026-W26'."""
    if dt is None:
        dt = datetime.now()
    year, week, _ = dt.isocalendar()
    return f"{year}-W{week:02d}"


def fetch_sign_html(iAstro: int) -> str:
    """Fetch the weekly horoscope page for one sign."""
    resp = requests.get(
        BASE_URL,
        params={"iAstro": iAstro, "iType": 1},
        headers=HEADERS,
        timeout=20,
    )
    resp.raise_for_status()
    resp.encoding = "utf-8"
    return resp.text


def parse_horoscope(html: str, sign_zh: str) -> dict[str, dict[str, str]]:
    """
    Extract the four horoscope sections from the page HTML.

    The data lives on one long line (~line 126), formatted as:
        本周{sign}解析整體運勢★★★☆☆：text愛情運勢★★★★☆：text...
        ... 財運運勢★★☆☆☆：text [https://fate.click108.com.tw/...]

    Returns:
        {
          "整體運勢": {"stars": "★★★☆☆", "content": "..."},
          "愛情運勢": {"stars": "★★★★☆", "content": "..."},
          "事業運勢": {"stars": "★★★☆☆", "content": "..."},
          "財運運勢": {"stars": "★★☆☆☆", "content": "..."},
        }
    """
    # Collapse all whitespace so the one-line block is reliably on one line
    text = " ".join(html.split())

    # Isolate the horoscope block between 本周X解析 ... and the following URL marker
    block_pat = (
        rf"本周{re.escape(sign_zh)}解析"
        r"(整體運勢.+?)"
        r"(?= \[https?://fate\.click108)"
    )
    m = re.search(block_pat, text)
    if not m:
        return {}

    block = m.group(1)

    # Split on section headers (name + star-rating + colon)
    section_re = re.compile(r"(整體運勢|愛情運勢|事業運勢|財運運勢)([★☆]{5})：")
    parts = section_re.split(block)
    # parts = ['', '整體運勢', '★★★☆☆', 'content1', '愛情運勢', '★★★★☆', 'content2', ...]

    result: dict[str, dict[str, str]] = {}
    i = 1  # skip leading empty string
    while i + 2 < len(parts):
        name   = parts[i]
        stars  = parts[i + 1]
        raw    = parts[i + 2]

        # Strip dating-advice addenda embedded in 愛情運勢
        content = re.sub(r"求愛秘笈：[^。]*。?", "", raw)
        content = re.sub(r"速配星座：\S+", "", content)
        content = content.strip().rstrip("。") + "。"  # normalize trailing period

        result[name] = {"stars": stars, "content": content}
        i += 3

    return result


def save_markdown(
    sign_en: str,
    sign_zh: str,
    week: str,
    sections: dict[str, dict[str, str]],
    output_dir: Path,
) -> Path:
    """Write one sign's weekly horoscope as a Markdown file."""
    filename = output_dir / f"{week}-{sign_en}.md"

    lines: list[str] = [
        "---",
        f"sign: {sign_en}",
        f"sign_zh: {sign_zh}",
        f"week: {week}",
        f"scraped_at: {datetime.now().isoformat()}",
        "source: astro.click108.com.tw",
        "---",
        "",
    ]

    SECTION_ORDER = ["整體運勢", "愛情運勢", "事業運勢", "財運運勢"]
    for section_name in SECTION_ORDER:
        if section_name not in sections:
            continue
        data = sections[section_name]
        lines += [
            f"## {section_name} {data['stars']}",
            "",
            data["content"],
            "",
        ]

    filename.write_text("\n".join(lines), encoding="utf-8")
    return filename


def main(week: str | None = None) -> None:
    """Scrape all 12 signs and save to wiki-horoscope/."""
    if week is None:
        week = get_iso_week()

    # Resolve output dir relative to project root (one level up from agents/)
    project_root = Path(__file__).resolve().parent.parent
    output_dir = project_root / "wiki-horoscope"
    output_dir.mkdir(exist_ok=True)

    print(f"[horoscopeScraper] Week: {week}  →  {output_dir}")

    for iAstro, sign_en, sign_zh in SIGNS:
        target_file = output_dir / f"{week}-{sign_en}.md"
        if target_file.exists():
            print(f"  ✓ {sign_zh} already cached — skipping")
            continue

        print(f"  ↓ {sign_zh} (iAstro={iAstro})…", end=" ", flush=True)
        try:
            html     = fetch_sign_html(iAstro)
            sections = parse_horoscope(html, sign_zh)
            if sections:
                path = save_markdown(sign_en, sign_zh, week, sections, output_dir)
                print(f"saved → {path.name}")
            else:
                print(f"WARN: could not parse {sign_zh}")
        except Exception as exc:
            print(f"ERROR: {exc}")

        time.sleep(1.5)  # be polite to the server

    print("[horoscopeScraper] Done.")


if __name__ == "__main__":
    main()
