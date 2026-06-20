/**
 * Context Builder — TypeScript
 * Converts an OmikujiEntry into a rich LLM-ready context string for
 * 天城月乃's (Tsukino's) reading. Mirrors lib/tarot/contextBuilder.ts.
 */
import type { OmikujiEntry } from "./types";

function formatList(items: string[]): string {
  return items.length > 0 ? items.join("、") : "（無）";
}

/**
 * Format a single omikuji entry into a context block for the LLM.
 */
export function buildOmikujiContext(entry: OmikujiEntry): string {
  const lines: string[] = [
    `=== 第 ${entry.id} 籤 · ${entry.shrine} ===`,
    `等級：${entry.level}${entry.isBadFortune ? "（凶籤／兇籤）" : ""}`,
    "",
    "【籤詩】",
    ...entry.poem,
    "",
  ];

  if (entry.interpretation) {
    lines.push("【籤意解說】", entry.interpretation, "");
  }

  if (entry.details.length > 0) {
    lines.push("【詳解】");
    entry.details.forEach((d) => lines.push(`• ${d}`));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Assemble the complete human message sent to Tsukino.
 */
export function buildUserMessage(question: string, entry: OmikujiEntry): string {
  const omikujiContext = buildOmikujiContext(entry);

  return `使用者的心事：「${question}」

本次抽到第 ${entry.id} 籤，等級：${entry.level}${entry.isBadFortune ? "（凶籤／兇籤）" : ""}

以下是這支籤的資料，請嚴格以此為依據進行解籤：

${omikujiContext}

用你自己的風格解籤，不要照搬籤詩資料的文字，也不要照抄任何特定的章節標題格式——請依照你自己的人設與解籤流程來組織回覆。記住：${
    entry.isBadFortune
      ? "這是凶籤／兇籤，可以客觀陳述籤詩對應問題面向的負面內容，但不可恐嚇渲染，且務必邀請對方把籤摺起掛上結籤架。"
      : "這是好籤，正常溫暖鼓勵，不要說宿命論的話。"
  }`;
}
