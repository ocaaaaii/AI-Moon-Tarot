"""
Agent 2 — Tarot Librarian
Reads raw JSON files from data/raw/, cleans the data, and writes
structured Markdown files to wiki/.

This agent is intentionally decoupled from the scraper: it can be re-run
independently if the cleaning or MD format logic changes.
"""
import json
import logging
from pathlib import Path

from .cleaner import clean_card_data
from .markdown_writer import write_markdown
from ..scraper.config import RAW_DATA_DIR, WIKI_DIR

logger = logging.getLogger(__name__)


class LibrarianAgent:
    """Converts raw JSON card data into structured Markdown wiki files.

    Args:
        raw_dir:  Directory containing raw JSON files (default: data/raw/).
        wiki_dir: Output directory for Markdown files (default: wiki/).
    """

    def __init__(
        self,
        raw_dir: Path = RAW_DATA_DIR,
        wiki_dir: Path = WIKI_DIR,
    ) -> None:
        self.raw_dir = Path(raw_dir)
        self.wiki_dir = Path(wiki_dir)
        self.wiki_dir.mkdir(parents=True, exist_ok=True)

    # ─── Public API ───────────────────────────────────────────────────────────

    def process_card(self, raw_data: dict, overwrite: bool = True) -> Path:
        """Clean one card's raw data and write its wiki Markdown file.

        Returns the path of the written .md file.
        """
        from ..scraper.utils import make_filename
        filename = make_filename(raw_data["id"], raw_data["slug"], ".md")
        dest = self.wiki_dir / filename

        if dest.exists() and not overwrite:
            logger.info(f"Skipping (already exists): {dest.name}")
            return dest

        cleaned = clean_card_data(raw_data)
        out = write_markdown(cleaned, output_dir=self.wiki_dir)
        logger.info(f"  → Wiki page written: {out.name}")
        return out

    def process_all(self, overwrite: bool = True) -> list[Path]:
        """Process all raw JSON files found in raw_dir.

        Processes in ID order (filename sort) so progress is predictable.
        Returns the list of written Markdown file paths.
        """
        raw_files = sorted(self.raw_dir.glob("*.json"))
        if not raw_files:
            logger.warning(f"No raw JSON files found in {self.raw_dir}")
            return []

        written: list[Path] = []
        for raw_file in raw_files:
            try:
                raw_data = json.loads(raw_file.read_text(encoding="utf-8"))
                out = self.process_card(raw_data, overwrite=overwrite)
                written.append(out)
            except Exception as exc:
                logger.error(f"Failed to process {raw_file.name}: {exc}")

        logger.info(f"Librarian complete: {len(written)}/{len(raw_files)} files written.")
        return written
