/**
 * POST /api/omikuji-reading
 * Next.js App Router Route Handler — 天城月乃's Omikuji Reading API
 *
 * Accepts a question (the user's worry) + the drawn omikuji's id, plus
 * optional conversation history. Streams Tsukino's personalized
 * interpretation back as Server-Sent Events (SSE).
 *
 * The server re-loads the authoritative entry from /wiki-omikuji by id
 * rather than trusting any poem/level/details sent by the client — mirrors
 * app/api/reading/route.ts's loadCards() pattern.
 *
 * Request body:
 *   { question: string, omikujiId: number, history?: HistoryMessage[] }
 *
 * Response: text/event-stream
 *   data: {"chunk": "..."}\n\n
 *   data: [DONE]\n\n
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { buildUserMessage } from "@/lib/omikuji/contextBuilder";
import { getOmikujiAvatar } from "@/lib/omikuji/avatars";
import { loadOmikujiById } from "@/lib/omikuji/wikiLoader";
import type { ApiError, HistoryMessage, OmikujiReadingRequest } from "@/lib/omikuji/types";

// See app/api/reading/route.ts for why this is needed on Vercel.
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";
// See app/api/reading/route.ts — same fix, same reason (replies were
// occasionally getting cut off mid-sentence near the end).
const MAX_TOKENS = 3000;
const TEMPERATURE = 0.85;

// ─── Request validation ───────────────────────────────────────────────────────

function validateRequest(body: unknown): OmikujiReadingRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const req = body as Record<string, unknown>;

  if (!req.question || typeof req.question !== "string" || req.question.trim() === "") {
    throw new Error("`question` is required and must be a non-empty string");
  }

  if (
    typeof req.omikujiId !== "number" ||
    !Number.isInteger(req.omikujiId) ||
    req.omikujiId < 1 ||
    req.omikujiId > 100
  ) {
    throw new Error("`omikujiId` must be an integer between 1 and 100");
  }

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
    omikujiId: req.omikujiId,
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
  let request: OmikujiReadingRequest;
  try {
    const body = await req.json();
    request = validateRequest(body);
  } catch (err) {
    const error: ApiError = { error: (err as Error).message };
    return NextResponse.json(error, { status: 400 });
  }

  // 2. Load the authoritative omikuji entry by id
  const entry = loadOmikujiById(request.omikujiId);
  if (!entry) {
    const error: ApiError = { error: `Omikuji #${request.omikujiId} not found` };
    return NextResponse.json(error, { status: 404 });
  }
  const userMessage = buildUserMessage(request.question, entry);
  const avatar = getOmikujiAvatar(request.avatarId);

  // 3. Stream from Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" } satisfies ApiError,
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messages: Anthropic.MessageParam[] = [
          { role: "user", content: userMessage },
          ...(request.history ?? []).map((h) => ({
            role: h.role,
            content: h.content,
          })),
        ];

        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          system: avatar.systemPrompt,
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(sseChunk(event.delta.text));
          }
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
