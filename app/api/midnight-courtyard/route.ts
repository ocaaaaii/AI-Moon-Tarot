/**
 * POST /api/midnight-courtyard
 * Sacred Realms region — 夜星庭 (Maya)'s single-reply ritual endpoint.
 * See app/api/tide-pool/route.ts for the pattern this mirrors.
 *
 * This region is time-gated to 23:00–05:00 Taipei time (UTC+8). The gate
 * is enforced HERE, server-side, using the server's own clock — not a
 * client-supplied timestamp, which a user could trivially fake. The
 * client (components/omikuji/RegionRitual.tsx) only renders whatever this
 * route decides; it does not independently judge the time itself.
 *
 * Request body: { worry: string }
 * Response: { response: string } | { error: string, gated: true }
 */
import { NextRequest, NextResponse } from "next/server";
import { completeLLM } from "@/lib/llm/complete";

import { MIDNIGHT_COURTYARD_SYSTEM_PROMPT } from "@/lib/omikuji/midnightCourtyardPrompt";
import type { ApiError } from "@/lib/omikuji/types";

// See app/api/reading/route.ts for why this is needed on Vercel.
export const maxDuration = 60;

const MAX_TOKENS = 150;
const TEMPERATURE = 0.95;

function isMidnightWindowNow(): boolean {
  const now = new Date();
  const taipeiHour = (now.getUTCHours() + 8) % 24;
  return taipeiHour >= 23 || taipeiHour < 5;
}

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
  if (!isMidnightWindowNow()) {
    return NextResponse.json(
      { error: "夜星庭只在深夜（23:00–05:00）開放，子時之後再來吧。", gated: true },
      { status: 403 }
    );
  }

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
      MIDNIGHT_COURTYARD_SYSTEM_PROMPT,
      [{ role: "user", content: `使用者寫下反覆出現的夢，或揮之不去的宿命感：「${worry}」` }],
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
