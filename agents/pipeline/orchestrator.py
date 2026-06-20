"""
Pipeline Orchestrator — Resume-capable (斷點續爬)
Coordinates Agent 1 (Scraper) → Agent 2 (Librarian) for all 78 cards.

Resume strategy: before scraping a card, check if its raw JSON already exists
in data/raw/. If it does, skip the HTTP request entirely. This means the
pipeline can be interrupted at any point and re-started without re-scraping
cards that were already fetched (saving server bandwidth and time).

Usage:
    python -m agents.pipeline.orchestrator
    python -m agents.pipeline.orchestrator --resume      # skip already-scraped
    python -m agents.pipeline.orchestrator --no-resume   # re-scrape everything
    python -m agents.pipeline.orchestrator --start-id 10 # start from card ID 10
    python -m agents.pipeline.orchestrator --dry-run     # show plan, don't fetch
"""
import argparse
import logging
import sys
from pathlib import Path

from ..scraper.config import CARD_LIST, RAW_DATA_DIR, WIKI_DIR, IMAGE_DIR
from ..scraper.scraper_agent import ScraperAgent
from ..scraper.utils import make_filename
from ..librarian.librarian_agent import LibrarianAgent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


class Orchestrator:
    """Runs Scraper then Librarian for each card, with resume support.

    Args:
        raw_dir:    Directory for raw JSON (default: data/raw/).
        wiki_dir:   Directory for wiki Markdown (default: wiki/).
        image_dir:  Directory for card images (default: public/assets/cards/).
        resume:     If True, skip cards whose raw JSON already exists.
    """

    def __init__(
        self,
        raw_dir: Path = RAW_DATA_DIR,
        wiki_dir: Path = WIKI_DIR,
        image_dir: Path = IMAGE_DIR,
        resume: bool = True,
    ) -> None:
        self.raw_dir = Path(raw_dir)
        self.wiki_dir = Path(wiki_dir)
        self.image_dir = Path(image_dir)
        self.resume = resume

        self.scraper = ScraperAgent(output_dir=self.raw_dir, image_dir=self.image_dir)
        self.librarian = LibrarianAgent(raw_dir=self.raw_dir, wiki_dir=self.wiki_dir)

    # ─── Public API ───────────────────────────────────────────────────────────

    def run(self, start_id: int = 0, dry_run: bool = False) -> None:
        """Run the full pipeline from start_id to card 77.

        Args:
            start_id: First card ID to process (useful for manual resume).
            dry_run:  If True, print the plan without making any HTTP requests.
        """
        cards_to_process = [c for c in CARD_LIST if c["id"] >= start_id]
        skipped: list[int] = []
        scraped: list[int] = []
        failed: list[int] = []

        logger.info(f"{'[DRY RUN] ' if dry_run else ''}Pipeline starting: {len(cards_to_process)} cards to check.")
        logger.info(f"Resume mode: {'ON' if self.resume else 'OFF'}")

        for card in cards_to_process:
            raw_path = self.raw_dir / make_filename(card["id"], card["slug"], ".json")

            if self.resume and raw_path.exists():
                logger.info(f"[{card['id']:02d}] ✓ Already scraped: {card['name_en']} — skipping")
                skipped.append(card["id"])
                continue

            if dry_run:
                logger.info(f"[{card['id']:02d}] Would scrape: {card['name_en']} ({card['url']})")
                continue

            # ── Scrape ──────────────────────────────────────────────────────
            try:
                logger.info(f"[{card['id']:02d}/{len(CARD_LIST)-1}] Scraping: {card['name_en']} ({card['name_zh']})")
                raw_data = self.scraper.scrape_card(card)
                scraped.append(card["id"])
            except Exception as exc:
                logger.error(f"[{card['id']:02d}] Scrape FAILED: {exc}")
                failed.append(card["id"])
                continue

            # ── Convert → Markdown immediately ──────────────────────────────
            try:
                self.librarian.process_card(raw_data)
            except Exception as exc:
                logger.error(f"[{card['id']:02d}] Librarian FAILED: {exc}")
                # Don't add to failed — raw JSON was saved, librarian can retry

        # ── Summary ─────────────────────────────────────────────────────────
        if not dry_run:
            total_wiki = len(list(self.wiki_dir.glob("*.md")))
            logger.info("=" * 60)
            logger.info(f"Pipeline complete.")
            logger.info(f"  Scraped this run : {len(scraped)}")
            logger.info(f"  Skipped (resume) : {len(skipped)}")
            logger.info(f"  Failed           : {len(failed)}")
            logger.info(f"  Wiki files total : {total_wiki}/78")
            if failed:
                logger.warning(f"  Failed card IDs  : {failed}")
            logger.info("=" * 60)


# ─── CLI entry point ──────────────────────────────────────────────────────────

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="AI Tarot scraper pipeline (Agent 1 → Agent 2)"
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--resume",    action="store_true", default=True,
                       help="Skip cards already scraped (default)")
    group.add_argument("--no-resume", dest="resume", action="store_false",
                       help="Re-scrape every card regardless of existing files")
    parser.add_argument("--start-id", type=int, default=0,
                        help="Start processing from this card ID (0–77)")
    parser.add_argument("--dry-run",  action="store_true",
                        help="Print plan without making HTTP requests")
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    orchestrator = Orchestrator(resume=args.resume)
    orchestrator.run(start_id=args.start_id, dry_run=args.dry_run)
