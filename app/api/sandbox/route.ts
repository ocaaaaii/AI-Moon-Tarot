/**
 * POST /api/sandbox
 * Sacred Realms region — 智慧花園 (Iori)'s single-reply ritual endpoint.
 * See app/api/tide-pool/route.ts for the pattern this mirrors. The model
 * is instructed (in sandboxPrompt.ts) to return two "|||"-separated path
 * descriptions instead of one line — the client splits on that delimiter.
 *
 * Request body: { worry: string }
 * Response: { response: string }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { SANDBOX_SYSTEM_PROMPT } from "@/lib/omikuji/sandboxPrompt";
import type { ApiError } from "@/lib/omikuji/types";

const MODEL = "claude-sonnet-4-6";
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" } satisfies ApiError,
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: SANDBOX_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `使用者丟出的二選一難題：「${worry}」` },
      ],
    });

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

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
