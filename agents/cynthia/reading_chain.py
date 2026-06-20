"""
Agent 3 — Cynthia: Reading Chain (Python standalone version)
Combines wiki_loader + context_builder + Claude API for direct Python usage.
Useful for testing, CLI usage, and potential FastAPI endpoint.

For production Next.js usage, see: app/api/reading/route.ts
"""
from __future__ import annotations

import os
from collections.abc import Iterator
from pathlib import Path
from typing import Optional

from .context_builder import build_user_message
from .prompt import CYNTHIA_SYSTEM_PROMPT
from .wiki_loader import CardContext, load_cards


class CynthiaReadingChain:
    """Orchestrates a complete tarot reading using Claude API.

    Usage:
        chain = CynthiaReadingChain()

        # Non-streaming
        reading = chain.read(
            question="我和這個人有未來嗎？",
            cards=[{"id": 0, "reversed": False}, {"id": 12, "reversed": True}]
        )
        print(reading)

        # Streaming
        for chunk in chain.stream(question=..., cards=...):
            print(chunk, end="", flush=True)
    """

    def __init__(
        self,
        model: str = "claude-sonnet-4-6",
        temperature: float = 0.85,
        max_tokens: int = 1500,
        wiki_dir: Optional[Path] = None,
        api_key: Optional[str] = None,
    ) -> None:
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.wiki_dir = wiki_dir
        self._api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")

        if not self._api_key:
            raise EnvironmentError(
                "ANTHROPIC_API_KEY is not set. "
                "Set it in your environment or pass api_key= to CynthiaReadingChain."
            )

    def _get_client(self):  # type: ignore[return]
        """Lazy-import Anthropic client to avoid import error if SDK not installed."""
        try:
            import anthropic
        except ImportError as e:
            raise ImportError(
                "anthropic SDK is required: pip install anthropic"
            ) from e
        return anthropic.Anthropic(api_key=self._api_key)

    def _load_and_build(
        self, question: str, cards: list[dict]
    ) -> tuple[list[CardContext], str]:
        """Load cards from wiki and build the user message."""
        kwargs = {"card_requests": cards}
        if self.wiki_dir:
            kwargs["wiki_dir"] = self.wiki_dir
        loaded_cards = load_cards(**kwargs)
        user_message = build_user_message(question, loaded_cards)
        return loaded_cards, user_message

    def read(self, question: str, cards: list[dict]) -> str:
        """Perform a complete tarot reading (non-streaming).

        Args:
            question: The user's question in Traditional Chinese.
            cards: List of {"id": int, "reversed": bool} dicts (1–3 cards).

        Returns:
            Cynthia's full reading as a string.
        """
        _, user_message = self._load_and_build(question, cards)
        client = self._get_client()

        response = client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=CYNTHIA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text

    def stream(self, question: str, cards: list[dict]) -> Iterator[str]:
        """Perform a complete tarot reading as a streaming generator.

        Yields text chunks as they arrive from the Claude API.
        """
        _, user_message = self._load_and_build(question, cards)
        client = self._get_client()

        with client.messages.stream(
            model=self.model,
            max_tokens=self.max_tokens,
            system=CYNTHIA_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            for text in stream.text_stream:
                yield text


# ─── CLI quick-test ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    print("🔮 Cynthia AI Tarot — Test Reading\n")
    chain = CynthiaReadingChain()

    question = "我最近對未來感到迷惘，請問我該如何找到方向？"
    cards = [{"id": 0, "reversed": False}]   # The Fool, upright

    print(f"問題：{question}")
    print(f"牌卡：The Fool（愚者）正位\n")
    print("=" * 60)
    print()

    for chunk in chain.stream(question=question, cards=cards):
        print(chunk, end="", flush=True)

    print("\n" + "=" * 60)
