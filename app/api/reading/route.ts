/**
 * POST /api/reading
 * Next.js App Router Route Handler — Cynthia's Tarot Reading API
 *
 * Accepts a question + 1–3 card draws, plus optional conversation history.
 * Streams Cynthia's response back as Server-Sent Events (SSE).
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
import type { ReadingRequest, ApiError, HistoryMessage } from "@/lib/tarot/types";
import { streamLLM, type LLMMessage } from "@/lib/llm/stream";

// Vercel Hobby plan defaults serverless functions to a 5–10s timeout —
// far too short for a streamed reading. Raise it to the Hobby plan's max
// (60s) so the function isn't killed mid-stream.
export const maxDuration = 60;

// Some personas (e.g. Athena's 4-chapter style) write long enough that
// 3000 wasn't always enough. Raised with headroom.
const MAX_TOKENS = 4096;
const TEMPERATURE = 0.85;

// ─── Request validation ───────────────────────────────────────────────────────

function validateRequest(body: unknown): ReadingRequest {
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

  if (req.cards.length > 3) {
    throw new Error("Maximum 3 cards per reading");
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
    history = (req.history as Array<{ role: unknown; content: unknown }>).map((h, i) => {
      if (h.role !== "user" && h.role !== "assistant") {
        throw new Error(`history[${i}].role must be "user" or "assistant"`);
      }
      if (typeof h.content !== "string") {
        throw new Error(`history[${i}].content must be a string`);
      }
      return { role: h.role, content: h.content };
    });
  }

  if (req.avatarId !== undefined && typeof req.avatarId !== "string") {
    throw new Error("`avatarId` must be a string if provided");
  }

  return {
    question: req.question.trim(),
    cards: (req.cards as Array<{ id: number; reversed?: boolean }>).map((c) => ({
      id: c.id,
      reversed: c.reversed ?? false,
    })),
    history,
    avatarId: req.avatarId as string | undefined,
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
  try {
    const body = await req.json();
    request = validateRequest(body);
  } catch (err) {
    const error: ApiError = { error: (err as Error).message };
    return NextResponse.json(error, { status: 400 });
  }

  // 2. Load wiki cards + resolve which tarot master is reading
  let userMessage: string;
  try {
    const cards = loadCards(request.cards);
    userMessage = buildUserMessage(request.question, cards);
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
        // Build multi-turn messages: initial context + optional follow-up history
        const messages: LLMMessage[] = [
          { role: "user", content: userMessage },
          ...(request.history ?? []).map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
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
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Handle preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
