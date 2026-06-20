"""
TDD — Agent 1 (Scraper) Tests
Run: pytest tests/test_scraper.py -v
"""
import json
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from agents.scraper.config import CARD_LIST, BASE_URL, DELAY_RANGE, IMAGE_DIR
from agents.scraper.utils import random_delay, build_headers, extract_slug_from_url
from agents.scraper.scraper_agent import ScraperAgent


# ─────────────────────────────────────────────
# Config tests
# ─────────────────────────────────────────────

class TestConfig:
    def test_card_list_has_78_entries(self):
        assert len(CARD_LIST) == 78

    def test_card_ids_are_unique(self):
        ids = [c["id"] for c in CARD_LIST]
        assert len(ids) == len(set(ids))

    def test_card_ids_span_0_to_77(self):
        ids = sorted(c["id"] for c in CARD_LIST)
        assert ids == list(range(78))

    def test_each_card_has_required_keys(self):
        required = {"id", "slug", "url", "name_en", "name_zh", "arcana"}
        for card in CARD_LIST:
            assert required.issubset(card.keys()), f"Card {card.get('id')} missing keys"

    def test_urls_start_with_base_url(self):
        for card in CARD_LIST:
            assert card["url"].startswith(BASE_URL), f"Bad URL: {card['url']}"

    def test_major_arcana_has_22_cards(self):
        majors = [c for c in CARD_LIST if c["arcana"] == "major"]
        assert len(majors) == 22

    def test_minor_arcana_pip_has_40_cards(self):
        minors = [c for c in CARD_LIST if c["arcana"] == "minor"]
        assert len(minors) == 40

    def test_court_cards_has_16_cards(self):
        courts = [c for c in CARD_LIST if c["arcana"] == "court"]
        assert len(courts) == 16

    def test_delay_range_is_respectful(self):
        """Scraper must delay at least 2 seconds between requests."""
        assert DELAY_RANGE[0] >= 2.0
        assert DELAY_RANGE[1] >= DELAY_RANGE[0]

    def test_name_zh_is_non_empty_for_all_cards(self):
        for card in CARD_LIST:
            assert card["name_zh"], f"Card {card['id']} has empty name_zh"


# ─────────────────────────────────────────────
# Utils tests
# ─────────────────────────────────────────────

class TestUtils:
    def test_random_delay_within_range(self):
        """random_delay should sleep within DELAY_RANGE."""
        with patch("agents.scraper.utils.time.sleep") as mock_sleep:
            random_delay()
            called_with = mock_sleep.call_args[0][0]
            assert DELAY_RANGE[0] <= called_with <= DELAY_RANGE[1]

    def test_build_headers_returns_dict_with_user_agent(self):
        headers = build_headers()
        assert "User-Agent" in headers
        assert len(headers["User-Agent"]) > 10

    def test_build_headers_rotates(self):
        """Should not always return the exact same User-Agent."""
        agents = {build_headers()["User-Agent"] for _ in range(20)}
        assert len(agents) >= 2

    def test_extract_slug_from_url(self):
        url = "https://nes-tarot.com/tarot-meanings-fool/"
        assert extract_slug_from_url(url) == "fool"

    def test_extract_slug_from_url_court_card(self):
        url = "https://nes-tarot.com/tarot-meanings-court-wands-page/"
        assert extract_slug_from_url(url) == "court-wands-page"


# ─────────────────────────────────────────────
# ScraperAgent tests (mocked HTTP)
# ─────────────────────────────────────────────

FOOL_HTML = """
<html><body>
<article class="entry-content">
  <img src="https://nes-tarot.com/wp-content/uploads/tarot/tarot-meanings-fool.jpeg" alt="0 愚者 The Fool"/>
  <h1>0 愚者 / The Fool</h1>
  <p><strong>旅程的起點、冒險、赤子之心</strong></p>
  <p><strong>簡述</strong></p>
  <p>一位旅人，向前走。</p>
  <p><strong>解說</strong></p>
  <p>愚者身穿華麗衣裳。</p>
  <p><strong>思考重點</strong></p>
  <ul><li>您願意冒險嗎？</li></ul>
</article>
</body></html>
"""


class TestScraperAgent:
    @patch("agents.scraper.scraper_agent.requests.get")
    @patch("agents.scraper.scraper_agent.random_delay")
    def test_scrape_card_returns_dict(self, mock_delay, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = FOOL_HTML
        mock_response.content = b"fake-image-bytes"
        mock_get.return_value = mock_response

        agent = ScraperAgent(output_dir=Path("/tmp/test_raw"), image_dir=Path("/tmp/test_imgs"))
        card_info = CARD_LIST[0]  # The Fool
        result = agent.scrape_card(card_info)

        assert result["id"] == 0
        assert result["name_en"] == "The Fool"
        assert result["name_zh"] == "愚者"
        assert "keywords" in result
        assert "story" in result
        assert "summary" in result
        assert result["source_url"] == card_info["url"]

    @patch("agents.scraper.scraper_agent.requests.get")
    @patch("agents.scraper.scraper_agent.random_delay")
    def test_scrape_always_delays(self, mock_delay, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = FOOL_HTML
        mock_response.content = b""
        mock_get.return_value = mock_response

        agent = ScraperAgent(output_dir=Path("/tmp/test_raw"), image_dir=Path("/tmp/test_imgs"))
        agent.scrape_card(CARD_LIST[0])
        mock_delay.assert_called()

    @patch("agents.scraper.scraper_agent.requests.get")
    @patch("agents.scraper.scraper_agent.random_delay")
    def test_scrape_saves_raw_json(self, mock_delay, mock_get, tmp_path):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = FOOL_HTML
        mock_response.content = b""
        mock_get.return_value = mock_response

        raw_dir = tmp_path / "raw"
        img_dir = tmp_path / "imgs"
        raw_dir.mkdir()
        img_dir.mkdir()

        agent = ScraperAgent(output_dir=raw_dir, image_dir=img_dir)
        agent.scrape_card(CARD_LIST[0])

        saved = list(raw_dir.glob("*.json"))
        assert len(saved) == 1
        data = json.loads(saved[0].read_text(encoding="utf-8"))
        assert data["id"] == 0

    @patch("agents.scraper.scraper_agent.requests.get")
    @patch("agents.scraper.scraper_agent.random_delay")
    def test_http_error_raises(self, mock_delay, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.raise_for_status.side_effect = Exception("Rate limited")
        mock_get.return_value = mock_response

        agent = ScraperAgent(output_dir=Path("/tmp/x"), image_dir=Path("/tmp/y"))
        with pytest.raises(Exception):
            agent.scrape_card(CARD_LIST[0])
