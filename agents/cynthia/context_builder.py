"""
Agent 3 — Cynthia: Context Builder
Converts CardContext objects into a clean LLM context string
that Cynthia uses to ground her reading in accurate card meanings.
"""
from __future__ import annotations

from .wiki_loader import CardContext

# Spread position labels for 1-3 card readings
_SPREAD_LABELS: dict[int, dict[int, str]] = {
    1: {0: ""},
    2: {0: "第 1 張（過去 / Past）", 1: "第 2 張（現在 / Present）"},
    3: {
        0: "第 1 張（過去 / Past）",
        1: "第 2 張（現在 / Present）",
        2: "第 3 張（未來 / Future）",
    },
}


def _format_list(items: list[str]) -> str:
    return "、".join(items) if items else "（無）"


def build_card_context(card: CardContext, position: int = 0, total: int = 1) -> str:
    """Format a single CardContext into a rich, LLM-readable context block.

    The format is designed to be:
    - Unambiguous about card identity and orientation
    - Rich enough for Cynthia to weave a story
    - Concise enough to fit comfortably within the context window
    """
    position_label = _SPREAD_LABELS.get(total, {}).get(position, f"第 {position + 1} 張")
    header = f"=== {position_label + ' ' if position_label else ''}【{card.display_name}】{card.position_label} ==="

    lines = [
        header,
        f"牌組：{card.arcana}{'（' + card.suit + '）' if card.suit else ''}",
        f"關鍵字：{_format_list(card.keywords)}",
        "",
    ]

    if card.summary:
        lines += ["【牌面簡述】", card.summary, ""]

    if card.story:
        lines += ["【牌義故事與象徵】", card.story[:600] + ("…" if len(card.story) > 600 else ""), ""]

    active_label = "逆位核心意義" if card.is_reversed else "正位核心意義"
    lines += [f"【{active_label}】", _format_list(card.active_meanings), ""]

    if card.reflection:
        lines += ["【思考重點】"]
        for point in card.reflection:
            lines.append(f"• {point}")
        lines.append("")

    if card.love_reading:
        lines += ["【感情關係指引】", card.love_reading, ""]

    if card.career_reading:
        lines += ["【職場事業指引】", card.career_reading, ""]

    return "\n".join(lines)


def build_reading_context(cards: list[CardContext]) -> str:
    """Build the full context block for a multi-card reading.

    Returns a string that will be injected into the user message
    alongside the user's question.
    """
    total = len(cards)
    blocks = [
        build_card_context(card, position=i, total=total)
        for i, card in enumerate(cards)
    ]
    return "\n\n".join(blocks)


def build_user_message(question: str, cards: list[CardContext]) -> str:
    """Assemble the complete human message that will be sent to Cynthia.

    Structure:
      1. User's question
      2. Card count header
      3. Per-card context blocks (from build_reading_context)
      4. Reading instruction
    """
    card_context = build_reading_context(cards)
    card_names = "、".join(f"【{c.display_name}{'（逆）' if c.is_reversed else ''}】" for c in cards)

    return f"""使用者問題：「{question}」

本次抽到 {len(cards)} 張牌：{card_names}

以下是牌卡資料，請嚴格以此為依據進行解讀：

{card_context}

請依照你的解牌架構（四個 Chapter），以辛西亞的語氣與風格，為這位使用者進行一次完整、溫柔、富有詩意的塔羅解讀。"""
