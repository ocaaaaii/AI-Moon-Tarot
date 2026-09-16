/**
 * Input ceilings for the public API routes.
 *
 * Every route under /app/api is reachable by anyone with curl — there is no
 * auth, and most of them spend real money at Anthropic or DeepSeek. Without a
 * ceiling, one request can carry an arbitrarily large prompt, so the cost of
 * a single call is attacker-controlled. These caps put a known upper bound on
 * what any one request can cost.
 *
 * They are deliberately generous: a real question is a sentence or two, and
 * nobody writing in good faith will meet them. Free text is truncated rather
 * than rejected so a long-winded visitor still gets a reading; structured
 * fields (ids, arrays) are bounded because oversized ones mean abuse, not
 * enthusiasm.
 *
 * The Sacred Realms rituals already reject at 150 characters in their own
 * routes and are left alone — that limit is part of their design (one short
 * confession), not a safety measure.
 */

export const LIMITS = {
  /** a tarot / omikuji question */
  question: 1000,
  /** the "what did you see first" answer before a reading */
  impression: 500,
  /** one chat turn */
  message: 2000,
  /** turns of history accepted from the client */
  historyTurns: 24,
  /** companion soft-memory entries */
  softMemory: 24,
  /** spread position labels */
  positions: 8,
  /** an identifier such as themeId or pileLabel */
  id: 80,
} as const;

/** Truncate to `max`; anything that is not a string becomes undefined. */
export function capText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/** Keep the most recent `max` entries — history matters at the tail. */
export function capTail<T>(value: T[] | undefined, max: number): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.slice(-max);
}
