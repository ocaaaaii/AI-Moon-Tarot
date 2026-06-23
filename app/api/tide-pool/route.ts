/**
 * POST /api/tide-pool
 * Sacred Realms pilot — 潮音池's single-reply ritual endpoint (see
 * CLAUDE.md 🔮 Future Vision). Distinct from /api/omikuji-reading: this
 * is a short, single-turn, non-streaming response with no omikuji draw
 * involved, so it uses its own focused prompt
 * (lib/omikuji/tidePoolPrompt.ts) rather than Ushio's full reading prompt.
 *
 * Request body: { worry: string }
 * Response: { response: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { completeLLM } from "@/lib/llm/complete";

import { TIDE_POOL_SYSTEM_PROMPT } from "@/lib/omikuji/tidePoolPrompt";
import type { ApiError } from "@/lib/omikuji/types";

// See app/api/reading/route.ts for why this is needed on Vercel.
export const maxDuration = 60;

const MAX_TOKENS = 200;
const TEMPERATURE = 0.9;

function validateWorry(body: unknown): string {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }
  const req = body as Record<string, unknown>;
  if (typeof req.worry !== "string" || req.worry.trim() === "") {
    throw new Error("`worry` is required and must be a non-empty string");
  }
  if (req.worry.length > 150) {
    throw new Error("`worry` must be 150 characters or fewer");
  }
  return req.worry.trim();
}

export async function POST(req: NextRequest): Promise<Response> {
  let worry: string;
  try {
    const body = await req.json();
    worry = validateWorry(body);
  } catch (err) {
    const error: ApiError = { error: (err as Error).message };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    const text = await completeLLM(
      TIDE_POOL_SYSTEM_PROMPT,
      [{ role: "user", content: `使用者剛剛寫下、放進水裡的煩惱：「${worry}」` }],
      MAX_TOKENS,
      TEMPERATURE
    );

    if (!text) {
      throw new Error("Empty response from model");
    }

    return NextResponse.json({ response: text });
  } catch (err) {
    const error: ApiError = {
      error: "Failed to generate response",
      details: (err as Error).message,
    };
    return NextResponse.json(error, { status: 500 });
  }
}

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
