/**
 * Shared TypeScript types for the Tarot reading system.
 * Used by both the Next.js API route and any front-end components.
 */

// ─── Request / Response ──────────────────────────────────────────────────────

export interface CardRequest {
  /** Card ID, 0–77 */
  id: number;
  /** Whether the card was drawn reversed (逆位) */
  reversed?: boolean;
}

/** A single turn in a multi-round conversation */
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export type SpreadType = "normal" | "chakra";

export interface ReadingRequest {
  /** The user's question in Traditional Chinese */
  question: string;
  /** 1–7 card draws (up to 7 for chakra spread) */
  cards: CardRequest[];
  /**
   * Optional conversation history for follow-up questions.
   * First element should be the assistant's initial reading.
   * Format: [assistant, user, assistant, user, ...]
   */
  history?: HistoryMessage[];
  /** Which tarot master is reading (see lib/tarot/avatars.ts). Omit to
   * fall back to the default free persona — keeps older clients working. */
  avatarId?: string;
  /** Optional: the user's first impression / image that flashed when the card appeared.
   * Collected by the pre-reading question step in ChatInterface. */
  firstImpression?: string;
  /**
   * Which spread this reading uses — an id from `lib/tarot/spreads.ts`.
   *
   * This replaced a `spreadPositions: string[]` the browser used to send.
   * Those labels went straight into the model's prompt, so the caller wrote
   * part of the prompt; an id is looked up against a server-side table
   * instead, and the card count is checked against it. Optional only so a tab
   * left open across a deploy still works — see `fallbackSpreadForCount`.
   */
  spreadId?: string;
}

// ─── Card Data ────────────────────────────────────────────────────────────────

export interface CardFrontmatter {
  id: number;
  name: string;
  name_zh: string;
  arcana: "major" | "minor" | "court";
  suit: string | null;
  number: number;
  keywords: string[];
  upright_meanings: string[];
  reversed_meanings: string[];
  local_image: string;
  image_url: string;
  source_url: string;
  scraped_at: string;
  /** Dominant colors in the RWS card image, e.g. ["red", "gold", "white"] */
  dominant_colors?: string[];
}

export interface CardContext {
  id: number;
  slug: string;
  name_en: string;
  name_zh: string;
  arcana: string;
  suit: string | null;
  number: number;
  keywords: string[];
  uprightMeanings: string[];
  reversedMeanings: string[];
  summary: string;
  story: string;
  reflection: string[];
  loveReading: string;
  careerReading: string;
  imageUrl: string;
  sourceUrl: string;
  isReversed: boolean;
  /** Returns the appropriate meanings based on orientation */
  activeMeanings: string[];
  /** e.g. "愚者 / The Fool" */
  displayName: string;
  /** e.g. "正位 (Upright)" or "逆位 (Reversed)" */
  positionLabel: string;
  /** Dominant colors in the RWS card image, e.g. ["red", "gold", "white"] */
  dominantColors: string[];
}

// ─── SSE Streaming ──────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
  details?: string;
}

export interface SseChunk {
  chunk?: string;
  error?: string;
}
