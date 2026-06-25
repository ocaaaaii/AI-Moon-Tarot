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

export interface ReadingRequest {
  /** The user's question in Traditional Chinese */
  question: string;
  /** 1–3 card draws */
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
  /** Named position labels for the spread, e.g. ["過去","現在","未來"].
   * When present, contextBuilder uses these instead of the default generic labels. */
  spreadPositions?: string[];
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
}

// ─── SSE Streaming ────────────────────────────────────────────────────────────

export interface StreamChunk {
  chunk: string;
}

export interface StreamDone {
  done: true;
}

export type StreamEvent = StreamChunk | StreamDone;

// ─── Errors ────────────────────────�

export interface ApiError {
  error: string;
  details?: string;
}
