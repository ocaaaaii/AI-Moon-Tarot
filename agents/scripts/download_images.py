"""
Download tarot card images from nes-tarot.com.

Reads image_url from each wiki/*.md frontmatter,
downloads to public/assets/cards/{id:02d}-{slug}.jpg,
and updates local_image in the frontmatter.

Usage:
    python -m agents.scripts.download_images
    python -m agents.scripts.download_images --dry-run
"""

import argparse
import re
import sys
import time
import random
from pathlib import Path

import requests

BASE_URL = "https://nes-tarot.com"
WIKI_DIR = Path("wiki")
IMAGE_DIR = Path("public/assets/cards")
DELAY_RANGE = (2.0, 5.0)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
]


def random_delay() -> None:
    time.sleep(random.uniform(*DELAY_RANGE))


def build_headers() -> dict:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": BASE_URL,
    }


def extract_frontmatter(text: str) -> tuple[dict, str]:
    """Parse YAML-ish frontmatter (simple key: value, no nested)."""
    if not text.startswith("---"):
        return {}, text
    end = text.index("---", 3)
    fm_block = text[3:end].strip()
    body = text[end + 3:].strip()

    data: dict = {}
    for line in fm_block.splitlines():
        if ": " in line:
            k, v = line.split(": ", 1)
            data[k.strip()] = v.strip().strip("'\"")
        elif line.endswith(":"):
            data[line[:-1].strip()] = None
    return data, body


def update_local_image(md_path: Path, local_image_value: str) -> None:
    """Patch the local_image field in a wiki markdown file."""
    content = md_path.read_text(encoding="utf-8")
    new_content = re.sub(
        r"^local_image:.*$",
        f"local_image: '{local_image_value}'",
        content,
        flags=re.MULTILINE,
    )
    md_path.write_text(new_content, encoding="utf-8")


def download_one(md_path: Path, image_dir: Path, dry_run: bool = False) -> bool:
    content = md_path.read_text(encoding="utf-8")
    fm, _ = extract_frontmatter(content)

    image_url = fm.get("image_url", "")
    if not image_url:
        print(f"  ⚠  {md_path.name}: no image_url, skipping")
        return False

    # Derive output filename from wiki filename (e.g. 00-fool.md → 00-fool.jpg)
    stem = md_path.stem  # "00-fool"
    ext = Path(image_url).suffix or ".jpeg"
    out_name = f"{stem}{ext}"
    out_path = image_dir / out_name
    local_image_value = f"/assets/cards/{out_name}"

    # Already downloaded
    if out_path.exists():
        # Ensure frontmatter is patched
        update_local_image(md_path, local_image_value)
        print(f"  ✓  {out_name} already exists, skipped download")
        return True

    if dry_run:
        print(f"  [DRY] would download {BASE_URL + image_url} → {out_path}")
        return True

    full_url = BASE_URL + image_url
    try:
        random_delay()
        resp = requests.get(full_url, headers=build_headers(), timeout=20)
        resp.raise_for_status()
        out_path.write_bytes(resp.content)
        update_local_image(md_path, local_image_value)
        print(f"  ↓  {out_name} ({len(resp.content) // 1024} KB)")
        return True
    except Exception as exc:
        print(f"  ✗  {md_path.name}: {exc}")
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Download tarot card images")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen without downloading")
    args = parser.parse_args()

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    md_files = sorted(WIKI_DIR.glob("*.md"))

    if not md_files:
        print(f"No markdown files found in {WIKI_DIR}/")
        sys.exit(1)

    print(f"Found {len(md_files)} wiki files. Images → {IMAGE_DIR}/\n")

    ok = fail = skip = 0
    for md_path in md_files:
        result = download_one(md_path, IMAGE_DIR, dry_run=args.dry_run)
        if result:
            ok += 1
        else:
            fail += 1

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Done — ✓ {ok}  ✗ {fail}")


if __name__ == "__main__":
    main()
