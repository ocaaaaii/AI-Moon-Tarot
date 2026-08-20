/**
 * POST /api/garden/companion
 *
 * 眾神之語 (Feature 3) chat endpoint — daily companionship, not a reading.
 * Body: { personaId, messages: {role, content}[], levelIndex, softMemory }
 * Streams the reply as SSE: data: {"chunk":"text"}\n\n … data: [DONE]\n\n
 */

import { NextRequest, NextResponse } from "next/server";
import { streamLLM, type LLMMessage } from "@/lib/llm/stream";
import { OMIKUJI_AVATARS } from "@/lib/omikuji/avatars";
import { buildCompanionPrompt } from "@/lib/garden/companionPrompt";
import { getCompanionMeta } from "@/lib/garden/companionPersonas";
import type { SoftMemoryEntry } from "@/lib/garden/affection";

const LEVEL_LABELS = [
  { label: "陌生人", description: "初次相遇，還在認識彼此" },
  { label: "常客", description: "已經聊過幾次，帶點熟悉感" },
  { label: "老朋友", description: "很熟了，可以聊更私人的話題" },
  { label: "知己", description: "最深的信任，說話不用設防" },
];

function sseChunk(text: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ chunk: text })}\n\n`);
}
const SSE_DONE = new TextEncoder().encode("data: [DONE]\n\n");

interface RequestBody {
  personaId?: string;
  messages?: LLMMessage[];
  levelIndex?: number;
  softMemory?: SoftMemoryEntry[];
}

export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { personaId, messages, softMemory } = body;
  const levelIndex = Math.min(Math.max(body.levelIndex ?? 0, 0), LEVEL_LABELS.length - 1);

  const meta = getCompanionMeta(personaId);
  if (!meta || !OMIKUJI_AVATARS.some((a) => a.id === personaId)) {
    return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const level = { index: levelIndex, ...LEVEL_LABELS[levelIndex] };
  const systemPrompt = buildCompanionPrompt(meta, level, softMemory ?? []);

  // Cap history sent to the model — companion chat can run long over many visits.
  const recentMessages = messages.slice(-24);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamLLM(systemPrompt, recentMessages, 300, 0.9)) {
          controller.enqueue(sseChunk(chunk));
        }
        controller.enqueue(SSE_DONE);
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
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
