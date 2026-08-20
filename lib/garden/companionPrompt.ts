/**
 * lib/garden/companionPrompt.ts
 *
 * Builds the system prompt for 眾神之語 (Feature 3, 純聊天 · 好感累計系統).
 * Each persona has its own dedicated companion-chat prompt (lib/omikuji/
 * *CompanionPrompt.ts) — written fresh for daily conversation, NOT the full
 * omikuji-reading prompt with an instruction layered on top. This mirrors
 * the Sacred Realms region-prompt convention (see CLAUDE.md): one focused,
 * standalone prompt per persona per interaction mode.
 *
 * This file only adds what's dynamic per user/session: the affection-level
 * intimacy note and the rolling soft-memory block. Voice, catchphrases, and
 * everything persona-specific lives in the dedicated prompt files.
 */

import { TSUKINO_COMPANION_PROMPT } from "@/lib/omikuji/tsukinoCompanionPrompt";
import { AKIRA_COMPANION_PROMPT } from "@/lib/omikuji/akiraCompanionPrompt";
import { HARUMA_COMPANION_PROMPT } from "@/lib/omikuji/harumaCompanionPrompt";
import { IORI_COMPANION_PROMPT } from "@/lib/omikuji/ioriCompanionPrompt";
import { USHIO_COMPANION_PROMPT } from "@/lib/omikuji/ushioCompanionPrompt";
import { KANON_COMPANION_PROMPT } from "@/lib/omikuji/kanonCompanionPrompt";
import type { CompanionPersonaId, CompanionMeta } from "./companionPersonas";
import type { AffectionLevel, SoftMemoryEntry } from "./affection";

const BASE_COMPANION_PROMPTS: Record<CompanionPersonaId, string> = {
  tsukino: TSUKINO_COMPANION_PROMPT,
  akira: AKIRA_COMPANION_PROMPT,
  haruma: HARUMA_COMPANION_PROMPT,
  iori: IORI_COMPANION_PROMPT,
  ushio: USHIO_COMPANION_PROMPT,
  kanon: KANON_COMPANION_PROMPT,
};

export function buildCompanionPrompt(
  meta: CompanionMeta,
  level: AffectionLevel,
  softMemory: SoftMemoryEntry[]
): string {
  const base = BASE_COMPANION_PROMPTS[meta.id];

  const memoryBlock = softMemory.length
    ? `\n你記得使用者最近說過的事（不用每次都提，但如果自然的話可以主動提起其中一件，讓對方感覺被記得）：\n${softMemory
        .map((m) => `- ${m.date}：${m.summary}`)
        .join("\n")}\n`
    : "";

  return `${base}

【你們現在的關係階段：${level.label}】（${level.description}）
${intimacyNote(level.index)}
${memoryBlock}`;
}

function intimacyNote(levelIndex: number): string {
  switch (levelIndex) {
    case 0:
      return "還在互相認識的階段，保持你原本的個性去聊天就好，不用刻意拉近距離，也不用刻意保持距離。";
    case 1:
      return "使用者已經來找你聊過幾次了，你對這個人有點熟悉感，說話可以比第一次見面更放鬆自然一點。";
    case 2:
      return "你們已經很熟了，可以聊更私人一點的話題，順著對話自然帶出一點你自己的背景故事片段——不用刻意炫耀式地說，像朋友閒聊時自然提到一樣。";
    case 3:
    default:
      return "你們的關係已經很深了，可以用最真實、最不設防的方式跟對方說話，情感表達可以更直接、更少保留。";
  }
}
