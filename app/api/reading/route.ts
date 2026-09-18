/**
 * POST /api/reading
 * Next.js App Router Route Handler — Tarot Reading API
 *
 * Accepts a question + 1–7 card draws (up to 7 for chakra spread),
 * plus optional conversation history.
 * Streams the persona's response back as Server-Sent Events (SSE).
 *
 * Request body:
 *   { question: string, cards: CardRequest[], history?: HistoryMessage[] }
 *
 * Response: text/event-stream
 *   data: {"chunk": "..."}\n\n
 *   data: [DONE]\n\n
 */
import { NextRequest, NextResponse } from "next/server";

import { buildUserMessage } from "@/lib/tarot/contextBuilder";
import { getTarotAvatar } from "@/lib/tarot/avatars";
import { loadCards } from "@/lib/tarot/wikiLoader";
import {
  getSpread,
  fallbackSpreadForCount,
  positionLabels,
  type TarotSpread,
} from "@/lib/tarot/spreads";
import type { ReadingRequest, ApiError, HistoryMessage, SpreadType } from "@/lib/tarot/types";
import { streamLLM, type LLMMessage } from "@/lib/llm/stream";
import { LIMITS, capText, capTail } from "@/lib/api/limits";

// Vercel Hobby plan defaults serverless functions to a 5–10s timeout —
// far too short for a streamed reading. Raise it to the Hobby plan's max
// (60s) so the function isn't killed mid-stream.
export const maxDuration = 60;

// Some personas (e.g. Athena's 4-chapter style) write long enough that
// 3000 wasn't always enough. Raised with headroom.
const MAX_TOKENS = 4096;
const TEMPERATURE = 0.85;

// ─── Request validation ───────────────────────────────────────────────────────

/** The validated request plus the spread it resolved to. */
interface ValidatedReading {
  request: ReadingRequest;
  spread: TarotSpread;
}

function validateRequest(body: unknown): ValidatedReading {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const req = body as Record<string, unknown>;

  if (!req.question || typeof req.question !== "string" || req.question.trim() === "") {
    throw new Error("`question` is required and must be a non-empty string");
  }

  if (!Array.isArray(req.cards) || req.cards.length === 0) {
    throw new Error("`cards` must be a non-empty array");
  }

  // The spread decides how many cards are allowed and what the positions are
  // called. Both used to come from the caller: the count via a
  // `spreadType === "chakra" ? 7 : 3`, and the labels as a free-text array
  // that went straight into the prompt.
  let spread: TarotSpread | undefined;
  if (req.spreadId !== undefined) {
    if (typeof req.spreadId !== "string") {
      throw new Error("`spreadId` must be a string if provided");
    }
    spread = getSpread(req.spreadId);
    if (!spread) throw new Error(`Unknown spreadId: ${req.spreadId.slice(0, LIMITS.id)}`);
  } else {
    // A tab left open across a deploy still posts the old shape. Fall back to
    // the generic spread of that size rather than erroring mid-session.
    spread = fallbackSpreadForCount(req.cards.length);
    if (!spread) throw new Error("`spreadId` is required");
  }

  if (req.cards.length !== spread.positions.length) {
    throw new Error(
      `Spread "${spread.id}" takes ${spread.positions.length} cards, got ${req.cards.length}`
    );
  }

  for (const card of req.cards) {
    if (typeof card !== "object" || card === null) {
      throw new Error("Each card must be an object with `id` (number)");
    }
    const c = card as Record<string, unknown>;
    if (typeof c.id !== "number" || !Number.isInteger(c.id) || c.id < 0 || c.id > 77) {
      throw new Error("Card `id` must be an integer between 0 and 77");
    }
    if (c.reversed !== undefined && typeof c.reversed !== "boolean") {
      throw new Error("Card `reversed` must be a boolean if provided");
    }
  }

  // Validate optional history
  let history: HistoryMessage[] | undefined;
  if (req.history !== undefined) {
    if (!Array.isArray(req.history)) {
      throw new Error("`history` must be an array if provided");
    }
    // Bound the tail as well as the shape: the role check below stops a
    // forged system turn, but without a count and a per-turn length an
    // anonymous caller still decides how large — and so how expensive —
    // one request is.
    const turns = capTail(req.history as Array<{ role: unknown; content: unknown }>, LIMITS.historyTurns) ?? [];
    history = turns.map((h, i) => {
      if (h.role !== "user" && h.role !== "assistant") {
        throw new Error(`history[${i}].role must be "user" or "assistant"`);
      }
      if (typeof h.content !== "string") {
        throw new Error(`history[${i}].content must be a string`);
      }
      return { role: h.role, content: h.content.slice(0, LIMITS.message) };
    });
  }

  if (req.avatarId !== undefined && typeof req.avatarId !== "string") {
    throw new Error("`avatarId` must be a string if provided");
  }

  const firstImpression = capText(req.firstImpression, LIMITS.impression);

  return {
    request: {
      question: req.question.trim().slice(0, LIMITS.question),
      cards: (req.cards as Array<{ id: number; reversed?: boolean }>).map((c) => ({
        id: c.id,
        reversed: c.reversed ?? false,
      })),
      history,
      avatarId: req.avatarId as string | undefined,
      firstImpression: firstImpression || undefined,
      spreadId: spread.id,
    },
    spread,
  };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function sseChunk(text: string): Uint8Array {
  const data = JSON.stringify({ chunk: text });
  return new TextEncoder().encode(`data: ${data}\n\n`);
}

function sseDone(): Uint8Array {
  return new TextEncoder().encode("data: [DONE]\n\n");
}

function sseError(message: string): Uint8Array {
  const data = JSON.stringify({ error: message });
  return new TextEncoder().encode(`data: ${data}\n\n`);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Parse + validate request
  let request: ReadingRequest;
  let spread: TarotSpread;
  try {
    const body = await req.json();
    ({ request, spread } = validateRequest(body));
  } catch (err) {
    const error: ApiError = { error: (err as Error).message };
    return NextResponse.json(error, { status: 400 });
  }

  // 2. Load wiki cards + resolve which tarot master is reading
  let userMessage: string;
  try {
    const spreadType: SpreadType = spread.drawMode === "chakra" ? "chakra" : "normal";
    const cards = loadCards(request.cards, spread.positions.length);
    userMessage = buildUserMessage(
      request.question,
      cards,
      request.firstImpression,
      positionLabels(spread),
      spreadType
    );
  } catch (err) {
    const error: ApiError = {
      error: "Failed to load card data",
      details: (err as Error).message,
    };
    return NextResponse.json(error, { status: 500 });
  }
  const avatar = getTarotAvatar(request.avatarId);

  // 3. Stream from the active LLM provider (see lib/llm/stream.ts)
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Build multi-turn messages: initial context + optional follow-up history.
        // When history exists, the last entry is the follow-up question — append a note
        // so the persona replies conversationally instead of using the Chapter format.
        const historyMessages = (request.history ?? []).map((h, idx, arr) => {
          const isLastUser = idx === arr.length - 1 && h.role === "user";
          return {
            role: h.role as "user" | "assistant",
            content: isLastUser
              ? h.content + "\n\n（這是追問，請用你自己的語氣自然對話，不要使用 Chapter 1／2／3／4 格式。）"
              : h.content,
          };
        });

        const messages: LLMMessage[] = [
          { role: "user", content: userMessage },
          ...historyMessages,
        ];

        for await (const chunk of streamLLM(avatar.systemPrompt, messages, MAX_TOKENS, TEMPERATURE)) {
          controller.enqueue(sseChunk(chunk));
        }

        controller.enqueue(sseDone());
        controller.close();
      } catch (err) {
        controller.enqueue(sseError((err as Error).message));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
