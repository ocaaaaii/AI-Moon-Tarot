"""
convert-story2.py
=================
Prepares images in public/assets/Stories/Story2/{Name}/ subfolders and
renames them sequentially: 01.jpg, 02.jpg, 03.jpg, ...

Strategy (in priority order):
  1. PNG sources  -> convert to JPEG quality 92, delete original PNG
  2. JPG sources  -> rename only (no re-encoding, preserves original quality)

Re-encoding a JPEG degrades quality every pass, so JPGs are never
re-compressed — only renamed.  PNGs get one high-quality conversion.

Run from the project root:
  python scripts/convert-story2.py

Requires: Pillow  ->  pip install Pillow (only needed when PNG sources exist)
"""

import shutil
from pathlib import Path

STORY2_DIR = Path(__file__).parent.parent / "public" / "assets" / "Stories" / "Story2"
PNG_QUALITY = 92  # only used when converting PNG -> JPEG


def convert_folder(folder: Path) -> None:
    all_images = sorted(
        [f for f in folder.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg")],
        key=lambda f: f.name,
    )

    if not all_images:
        print(f"  [skip] {folder.name}/ — no images found")
        return

    # Prefer PNGs if any exist (means first-time setup with raw assets)
    pngs = [f for f in all_images if f.suffix.lower() == ".png"]
    sources = pngs if pngs else all_images

    print(f"\n  {folder.name}/  ({len(sources)} files)")

    # Use temp names first to avoid collisions when renaming in-place
    temp_files: list[Path] = []
    for i, src in enumerate(sources, start=1):
        tmp = folder / f"__tmp_{i:02d}{src.suffix}"
        src.rename(tmp)
        temp_files.append((tmp, src.suffix.lower(), i))

    for tmp, suffix, i in temp_files:
        dest = folder / f"{i:02d}.jpg"
        if suffix == ".png":
            from PIL import Image  # lazy import — only needed for PNGs
            img = Image.open(tmp).convert("RGB")
            img.save(dest, "JPEG", quality=PNG_QUALITY, optimize=True)
            tmp.unlink()
            print(f"    (PNG converted) -> {dest.name}")
        else:
            # JPG: rename only, no re-encode
            tmp.rename(dest)
            print(f"    (JPG renamed)   -> {dest.name}")


def main() -> None:
    if not STORY2_DIR.exists():
        print(f"ERROR: {STORY2_DIR} does not exist. Run from the project root.")
        return

    print(f"Processing images in: {STORY2_DIR}\n")
    for item in sorted(STORY2_DIR.iterdir()):
        if item.is_dir():
            convert_folder(item)

    print("\nDone.")


if __name__ == "__main__":
    main()
