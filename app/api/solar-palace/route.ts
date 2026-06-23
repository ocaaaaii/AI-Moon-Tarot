/**
 * POST /api/solar-palace
 * Sacred Realms region — 烈陽殿 (Haruma)'s single-reply ritual endpoint.
 * See app/api/tide-pool/route.ts for the pattern this mirrors.
 *
 * Request body: { worry: string }
 * Response: { response: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { completeLLM } from "@/lib/llm/complete";

import { SOLAR_PALACE_SYSTEM_PROMPT } from "@/lib/omikuji/solarPalacePrompt";
import type { ApiError } from "@/lib/omikuji/types";

// See app/api/reading/route.ts for why this is needed on Vercel.
export const maxDuration = 60;

const MAX_TOKENS = 250;
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
      SOLAR_PALACE_SYSTEM_PROMPT,
      [{ role: "user", content: `使用者承認正在逃避、或騙自己的事：「${worry}」` }],
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
