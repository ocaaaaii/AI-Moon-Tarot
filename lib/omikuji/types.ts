/**
 * Shared TypeScript types for the 月神神社 (Moon God Shrine) omikuji system.
 * Mirrors lib/tarot/types.ts conventions for the tarot product line.
 */

export interface OmikujiFrontmatter {
  id: number;
  shrine: string;
  level: string;
  poem: string[];
  source: string;
  scraped_at: string;
}

export interface OmikujiEntry {
  id: number;
  shrine: string;
  /** e.g. 大吉 / 吉 / 半吉 / 末吉 / 小吉 / 末小吉 / 凶 / 兇 */
  level: string;
  poem: string[];
  interpretation: string;
  details: string[];
  /** true when level is 凶 or 兇 — subject to the 結籤架 ritual (see CLAUDE.md scoped exception) */
  isBadFortune: boolean;
}

// ─── Reading request / streaming (mirrors lib/tarot/types.ts) ────────────────

/** A single turn in a multi-round conversation with 天城月乃 */
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OmikujiReadingRequest {
  /** The user's question / worry, in Traditional Chinese */
  question: string;
  /** The drawn omikuji's id (1–100) — server re-loads the authoritative entry from this */
  omikujiId: number;
  /**
   * Optional conversation history for follow-up questions.
   * First element should be the assistant's initial reading.
   * Format: [assistant, user, assistant, user, ...]
   */
  history?: HistoryMessage[];
  /** Which 解籤師 is reading (see lib/omikuji/avatars.ts). Omit to fall
   * back to the default free persona — keeps older clients working. */
  avatarId?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
