"""
TDD — Agent 2 (Librarian) Tests
Run: pytest tests/test_librarian.py -v
"""
import json
from pathlib import Path

import pytest
import yaml

from agents.librarian.cleaner import clean_card_data
from agents.librarian.markdown_writer import build_frontmatter, build_markdown_body, write_markdown
from agents.librarian.librarian_agent import LibrarianAgent


# ─── Sample raw data (as Agent 1 would produce) ──────────────────────────────

RAW_FOOL = {
    "id": 0,
    "slug": "fool",
    "name_en": "The Fool",
    "name_zh": "愚者",
    "arcana": "major",
    "suit": None,
    "number": 0,
    "keywords": ["旅程的起點", "冒險", "赤子之心", "新生兒", "主動性", "機會"],
    "summary": "一位穿著華麗的旅人，手持行囊，充滿好奇心，向前走。",
    "story": "愚者身穿畫有紅花的上衣，展開一場旅程。",
    "reflection": ["您願意冒險和跟隨自己的直覺嗎？", "您有跟隨您的夢想嗎？"],
    "upright_meanings": ["勇敢", "有探索精神", "一張白紙"],
    "reversed_meanings": ["冒失", "魯莽", "有風險"],
    "love_reading": "意念純淨、初戀的感覺",
    "career_reading": "多一點冒險精神，探索新領域",
    "image_url": "https://nes-tarot.com/wp-content/uploads/tarot/tarot-meanings-fool.jpeg",
    "local_image_path": "public/assets/cards/00-fool.jpeg",
    "source_url": "https://nes-tarot.com/tarot-meanings-fool/",
    "scraped_at": "2026-06-18",
}


# ─────────────────────────────────────────────
# Cleaner tests
# ─────────────────────────────────────────────

class TestCleaner:
    def test_clean_strips_html_tags(self):
        dirty = RAW_FOOL.copy()
        dirty["story"] = "<p>愚者身穿<strong>華麗</strong>衣裳。</p>"
        cleaned = clean_card_data(dirty)
        assert "<p>" not in cleaned["story"]
        assert "<strong>" not in cleaned["story"]
        assert "愚者身穿" in cleaned["story"]

    def test_clean_normalises_whitespace(self):
        dirty = RAW_FOOL.copy()
        dirty["summary"] = "  一位  旅人  \n\n  向前走  "
        cleaned = clean_card_data(dirty)
        assert cleaned["summary"] == "一位  旅人  向前走"

    def test_clean_preserves_required_fields(self):
        cleaned = clean_card_data(RAW_FOOL)
        for key in ("id", "name_en", "name_zh", "arcana", "keywords"):
            assert key in cleaned

    def test_clean_does_not_mutate_input(self):
        original_story = RAW_FOOL["story"]
        clean_card_data(RAW_FOOL)
        assert RAW_FOOL["story"] == original_story

    def test_clean_keywords_is_list(self):
        cleaned = clean_card_data(RAW_FOOL)
        assert isinstance(cleaned["keywords"], list)


# ─────────────────────────────────────────────
# Markdown writer tests
# ─────────────────────────────────────────────

class TestMarkdownWriter:
    def test_frontmatter_is_valid_yaml(self):
        fm = build_frontmatter(RAW_FOOL)
        # Strip --- delimiters
        inner = fm.strip().lstrip("---").split("---")[0]
        parsed = yaml.safe_load(inner)
        assert isinstance(parsed, dict)

    def test_frontmatter_contains_required_keys(self):
        fm = build_frontmatter(RAW_FOOL)
        inner = fm.strip().lstrip("---").split("---")[0]
        parsed = yaml.safe_load(inner)
        for key in ("id", "name", "name_zh", "arcana", "keywords", "source_url"):
            assert key in parsed, f"Missing key in frontmatter: {key}"

    def test_frontmatter_name_matches_english(self):
        fm = build_frontmatter(RAW_FOOL)
        inner = fm.strip().lstrip("---").split("---")[0]
        parsed = yaml.safe_load(inner)
        assert parsed["name"] == "The Fool"

    def test_body_contains_sections(self):
        body = build_markdown_body(RAW_FOOL)
        assert "## 牌義故事" in body or "## Story" in body
        assert "## 正位" in body or "## Upright" in body
        assert "## 逆位" in body or "## Reversed" in body

    def test_write_markdown_creates_file(self, tmp_path):
        out = write_markdown(RAW_FOOL, output_dir=tmp_path)
        assert out.exists()
        assert out.suffix == ".md"

    def test_filename_uses_id_and_slug(self, tmp_path):
        out = write_markdown(RAW_FOOL, output_dir=tmp_path)
        assert out.name == "00-fool.md"

    def test_file_starts_with_frontmatter_delimiter(self, tmp_path):
        out = write_markdown(RAW_FOOL, output_dir=tmp_path)
        content = out.read_text(encoding="utf-8")
        assert content.startswith("---")


# ─────────────────────────────────────────────
# LibrarianAgent integration test
# ─────────────────────────────────────────────

class TestLibrarianAgent:
    def test_process_creates_markdown_file(self, tmp_path):
        raw_dir = tmp_path / "raw"
        wiki_dir = tmp_path / "wiki"
        raw_dir.mkdir()
        wiki_dir.mkdir()

        raw_file = raw_dir / "00-fool.json"
        raw_file.write_text(json.dumps(RAW_FOOL), encoding="utf-8")

        agent = LibrarianAgent(raw_dir=raw_dir, wiki_dir=wiki_dir)
        agent.process_card(RAW_FOOL)

        output = wiki_dir / "00-fool.md"
        assert output.exists()

    def test_process_all_creates_file_per_card(self, tmp_path):
        raw_dir = tmp_path / "raw"
        wiki_dir = tmp_path / "wiki"
        raw_dir.mkdir()
        wiki_dir.mkdir()

        for i in range(3):
            card = RAW_FOOL.copy()
            card["id"] = i
            card["slug"] = f"card-{i}"
            (raw_dir / f"{i:02d}-card-{i}.json").write_text(
                json.dumps(card), encoding="utf-8"
            )

        agent = LibrarianAgent(raw_dir=raw_dir, wiki_dir=wiki_dir)
        agent.process_all()
        assert len(list(wiki_dir.glob("*.md"))) == 3

    def test_process_skips_already_existing_md(self, tmp_path):
        raw_dir = tmp_path / "raw"
        wiki_dir = tmp_path / "wiki"
        raw_dir.mkdir()
        wiki_dir.mkdir()

        raw_file = raw_dir / "00-fool.json"
        raw_file.write_text(json.dumps(RAW_FOOL), encoding="utf-8")

        # Pre-create the output file
        existing = wiki_dir / "00-fool.md"
        existing.write_text("pre-existing", encoding="utf-8")

        agent = LibrarianAgent(raw_dir=raw_dir, wiki_dir=wiki_dir)
        agent.process_all(overwrite=False)

        # Content should NOT be overwritten
        assert existing.read_text(encoding="utf-8") == "pre-existing"
