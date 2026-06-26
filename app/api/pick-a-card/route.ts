/**
 * POST /api/pick-a-card
 *
 * Pick-a-Card Oracle reading API.
 * Accepts the selected theme + pile label + 4 card IDs,
 * loads card contexts from the wiki, builds an Oracle system prompt,
 * and streams the reading back in SSE format.
 *
 * Request body:
 *   { themeId: string, pileLabel: string, cardIds: number[] }
 *
 * Response: text/event-stream
 *   data: {"chunk": "..."}\n\n
 *   data: [DONE]\n\n
 */

import { NextRequest } from "next/server";

import { loadCards } from "@/lib/tarot/wikiLoader";
import { buildOraclePrompt } from "@/lib/tarot/pickACardOraclePrompts";
import { streamLLM } from "@/lib/llm/stream";

export const maxDuration = 60;

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function sseChunk(text: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ chunk: text })}\n\n`);
}

function sseDone(): Uint8Array {
  return new TextEncoder().encode("data: [DONE]\n\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { themeId?: string; pileLabel?: string; cardIds?: number[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { themeId, pileLabel, cardIds } = body;

  if (!themeId || !pileLabel || !Array.isArray(cardIds) || cardIds.length !== 4) {
    return new Response("Missing or invalid fields: themeId, pileLabel, cardIds (array of 4)", {
      status: 400,
    });
  }

  // Validate card IDs
  if (cardIds.some((id) => typeof id !== "number" || id < 0 || id > 77)) {
    return new Response("cardIds must be integers 0–77", { status: 400 });
  }

  // Randomly assign reversed (30% chance) for variety
  const cardRequests = cardIds.map((id) => ({
    id,
    reversed: Math.random() < 0.3,
  }));

  // Load card contexts (synchronous filesystem read).
  // Pass isChakra=true to lift the 3-card limit to 7 — Oracle readings use 4 cards.
  const cards = loadCards(cardRequests, true);

  // Build Oracle system prompt
  const systemPrompt = buildOraclePrompt(themeId, pileLabel, cards);

  // Stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamLLM(
          systemPrompt,
          [{ role: "user", content: "請開始你的神諭解讀。" }],
          1400,
          0.85
        )) {
          controller.enqueue(sseChunk(chunk));
        }
        controller.enqueue(sseDone());
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(sseChunk(`\n\n[讀取中斷：${msg}]`));
        controller.enqueue(sseDone());
      } finally {
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
