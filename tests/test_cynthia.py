"""
TDD — Agent 3 (Cynthia) Tests
Tests wiki_loader and context_builder against the actual wiki files.
Run: pytest tests/test_cynthia.py -v
"""
import pytest
from pathlib import Path

WIKI_DIR = Path(__file__).parent.parent / "wiki"
WIKI_EXISTS = WIKI_DIR.exists() and any(WIKI_DIR.glob("*.md"))

pytestmark = pytest.mark.skipif(
    not WIKI_EXISTS,
    reason="wiki/ folder is empty — run the scraper first."
)

from agents.cynthia.wiki_loader import load_card, load_cards, CardContext
from agents.cynthia.context_builder import (
    build_card_context,
    build_reading_context,
    build_user_message,
)
from agents.cynthia.prompt import CYNTHIA_SYSTEM_PROMPT


# ─────────────────────────────────────────────
# WikiLoader tests
# ─────────────────────────────────────────────

class TestWikiLoader:
    def test_load_fool_returns_card_context(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert isinstance(card, CardContext)
        assert card.id == 0
        assert "Fool" in card.name_en
        assert card.name_zh == "愚者"

    def test_load_card_upright_by_default(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert card.is_reversed is False

    def test_load_card_reversed(self):
        card = load_card(0, reversed=True, wiki_dir=WIKI_DIR)
        assert card.is_reversed is True

    def test_load_card_has_keywords(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert isinstance(card.keywords, list)
        assert len(card.keywords) >= 1

    def test_load_card_has_story(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert len(card.story) > 50

    def test_load_card_has_summary(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert len(card.summary) > 10

    def test_load_card_upright_meanings(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert isinstance(card.upright_meanings, list)
        assert len(card.upright_meanings) >= 1

    def test_load_card_reversed_meanings(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert isinstance(card.reversed_meanings, list)
        assert len(card.reversed_meanings) >= 1

    def test_active_meanings_upright(self):
        card = load_card(0, reversed=False, wiki_dir=WIKI_DIR)
        assert card.active_meanings == card.upright_meanings

    def test_active_meanings_reversed(self):
        card = load_card(0, reversed=True, wiki_dir=WIKI_DIR)
        assert card.active_meanings == card.reversed_meanings

    def test_load_card_invalid_id_raises(self):
        with pytest.raises(ValueError):
            load_card(78, wiki_dir=WIKI_DIR)

    def test_load_card_negative_id_raises(self):
        with pytest.raises(ValueError):
            load_card(-1, wiki_dir=WIKI_DIR)

    def test_load_cards_single(self):
        cards = load_cards([{"id": 0}], wiki_dir=WIKI_DIR)
        assert len(cards) == 1
        assert cards[0].id == 0

    def test_load_cards_three(self):
        cards = load_cards(
            [{"id": 0}, {"id": 12, "reversed": True}, {"id": 21}],
            wiki_dir=WIKI_DIR,
        )
        assert len(cards) == 3
        assert cards[1].is_reversed is True

    def test_load_cards_too_many_raises(self):
        with pytest.raises(ValueError, match="Maximum 3"):
            load_cards([{"id": i} for i in range(4)], wiki_dir=WIKI_DIR)

    def test_load_cards_empty_raises(self):
        with pytest.raises(ValueError):
            load_cards([], wiki_dir=WIKI_DIR)

    def test_load_all_78_cards(self):
        """All 78 wiki files must be loadable without error."""
        for card_id in range(78):
            card = load_card(card_id, wiki_dir=WIKI_DIR)
            assert card.id == card_id
            assert card.name_en
            assert card.name_zh

    def test_display_name_format(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        assert "/" in card.display_name
        assert card.name_zh in card.display_name
        assert card.name_en in card.display_name


# ─────────────────────────────────────────────
# ContextBuilder tests
# ─────────────────────────────────────────────

class TestContextBuilder:
    def test_build_card_context_contains_name(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        context = build_card_context(card, position=0, total=1)
        assert "The Fool" in context or "愚者" in context

    def test_build_card_context_contains_keywords(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        context = build_card_context(card)
        assert any(kw in context for kw in card.keywords)

    def test_build_card_context_reversed_shows_label(self):
        card = load_card(0, reversed=True, wiki_dir=WIKI_DIR)
        context = build_card_context(card)
        assert "逆位" in context

    def test_build_card_context_upright_shows_label(self):
        card = load_card(0, reversed=False, wiki_dir=WIKI_DIR)
        context = build_card_context(card)
        assert "正位" in context

    def test_build_card_context_contains_story(self):
        card = load_card(0, wiki_dir=WIKI_DIR)
        context = build_card_context(card)
        # Story should be at least partially present
        assert len(context) > 200

    def test_build_reading_context_three_cards(self):
        cards = load_cards(
            [{"id": 0}, {"id": 12, "reversed": True}, {"id": 21}],
            wiki_dir=WIKI_DIR,
        )
        context = build_reading_context(cards)
        assert "過去" in context or "第 1 張" in context
        assert "現在" in context or "第 2 張" in context
        assert "未來" in context or "第 3 張" in context

    def test_build_reading_context_single_card_no_position_label(self):
        cards = load_cards([{"id": 0}], wiki_dir=WIKI_DIR)
        context = build_reading_context(cards)
        # Single card should not have confusing "第 X 張" labels
        assert "愚者" in context or "The Fool" in context

    def test_build_user_message_includes_question(self):
        cards = load_cards([{"id": 0}], wiki_dir=WIKI_DIR)
        question = "我最近的事業方向在哪裡？"
        msg = build_user_message(question, cards)
        assert question in msg

    def test_build_user_message_includes_card_name(self):
        cards = load_cards([{"id": 0}], wiki_dir=WIKI_DIR)
        msg = build_user_message("測試問題", cards)
        assert "Fool" in msg or "愚者" in msg

    def test_build_user_message_includes_instruction(self):
        cards = load_cards([{"id": 0}], wiki_dir=WIKI_DIR)
        msg = build_user_message("測試問題", cards)
        assert "Chapter" in msg or "解牌" in msg


# ─────────────────────────────────────────────
# Prompt tests
# ─────────────────────────────────────────────

class TestCynthiaPrompt:
    def test_prompt_is_non_empty(self):
        assert len(CYNTHIA_SYSTEM_PROMPT) > 500

    def test_prompt_contains_chapter_structure(self):
        assert "Chapter 1" in CYNTHIA_SYSTEM_PROMPT
        assert "Chapter 2" in CYNTHIA_SYSTEM_PROMPT
        assert "Chapter 3" in CYNTHIA_SYSTEM_PROMPT
        assert "Chapter 4" in CYNTHIA_SYSTEM_PROMPT

    def test_prompt_contains_forbidden_patterns_warning(self):
        assert "Forbidden" in CYNTHIA_SYSTEM_PROMPT or "NEVER" in CYNTHIA_SYSTEM_PROMPT

    def test_prompt_specifies_traditional_chinese(self):
        assert "Traditional Chinese" in CYNTHIA_SYSTEM_PROMPT or "繁體中文" in CYNTHIA_SYSTEM_PROMPT

    def test_prompt_contains_cynthia_identity(self):
        assert "Cynthia" in CYNTHIA_SYSTEM_PROMPT
