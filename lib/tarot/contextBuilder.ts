/**
 * Context Builder — TypeScript
 * Converts CardContext objects into a rich LLM-ready context string
 * for Cynthia's reading.
 */
import type { CardContext } from "./types";

// Spread position labels per total card count
const SPREAD_LABELS: Record<number, Record<number, string>> = {
  1: { 0: "" },
  2: { 0: "第 1 張（過去 / Past）", 1: "第 2 張（現在 / Present）" },
  3: {
    0: "第 1 張（過去 / Past）",
    1: "第 2 張（現在 / Present）",
    2: "第 3 張（未來 / Future）",
  },
};

function formatList(items: string[]): string {
  return items.length > 0 ? items.join("、") : "（無）";
}

/**
 * Format a single card into a rich context block for the LLM.
 */
export function buildCardContext(
  card: CardContext,
  position = 0,
  total = 1,
  customPositions?: string[]
): string {
  const posLabel = customPositions?.[position]
    ? `第 ${position + 1} 張（${customPositions[position]}）`
    : (SPREAD_LABELS[total]?.[position] ?? `第 ${position + 1} 張`);
  const header = [
    "===",
    posLabel ? `${posLabel} ` : "",
    `【${card.displayName}】${card.positionLabel}`,
    "===",
  ].join("");

  const lines: string[] = [
    header,
    `牌組：${card.arcana}${card.suit ? `（${card.suit}）` : ""}`,
    `關鍵字：${formatList(card.keywords)}`,
    "",
  ];

  if (card.summary) {
    lines.push("【牌面簡述】", card.summary, "");
  }

  if (card.story) {
    const storySnippet =
      card.story.length > 600
        ? card.story.slice(0, 600) + "…"
        : card.story;
    lines.push("【牌義故事與象徵】", storySnippet, "");
  }

  const activeLabel = card.isReversed ? "逆位核心意義" : "正位核心意義";
  lines.push(`【${activeLabel}】`, formatList(card.activeMeanings), "");

  if (card.reflection.length > 0) {
    lines.push("【思考重點】");
    card.reflection.forEach((p) => lines.push(`• ${p}`));
    lines.push("");
  }

  if (card.loveReading) {
    lines.push("【感情關係指引】", card.loveReading, "");
  }

  if (card.careerReading) {
    lines.push("【職場事業指引】", card.careerReading, "");
  }

  return lines.join("\n");
}

/**
 * Build the full context block for a multi-card reading.
 */
export function buildReadingContext(cards: CardContext[], customPositions?: string[]): string {
  return cards
    .map((card, i) => buildCardContext(card, i, cards.length, customPositions))
    .join("\n\n");
}

/**
 * Assemble the complete human message sent to Cynthia.
 */
export function buildUserMessage(
  question: string,
  cards: CardContext[],
  firstImpression?: string,
  spreadPositions?: string[]
): string {
  const cardContext = buildReadingContext(cards, spreadPositions);
  const cardNames = cards
    .map((c) => `【${c.displayName}${c.isReversed ? "（逆）" : ""}】`)
    .join("、");

  const impression = firstImpression?.trim();
  const impressionBlock = impression
    ? `

【使用者在看見這張牌的瞬間——他說】
「${impression}」
請在解讀中自然地回應或融入這個第一感受，讓他感覺到你真的在聽。`
    : "";

  return `使用者問題：「${question}」

本次抽到 ${cards.length} 張牌：${cardNames}

以下是牌卡資料，請嚴格以此為依據進行解讀：

${cardContext}

用你自己的風格解牌，不要照搬牌卡資料的文字，也不要照抄任何特定的章節標題格式——請依照你自己的人設與解牌流程來組織回覆。${impressionBlock}`;
}
