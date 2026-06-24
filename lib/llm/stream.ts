/**
 * lib/llm/stream.ts
 *
 * Provider-agnostic streaming helper.
 * Yields raw text chunks as an AsyncGenerator so the caller can pipe them
 * into an SSE ReadableStream without knowing which SDK is behind it.
 *
 * Usage (in an API route):
 *   for await (const chunk of streamLLM(system, messages, maxTokens, temp)) {
 *     controller.enqueue(sseChunk(chunk));
 *   }
 */

import { getLLMConfig } from "./config";
import { WRITING_RULES } from "@/lib/shared/writingRules";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export async function* streamLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number
): AsyncGenerator<string> {
  const config = getLLMConfig();
  // Append shared writing rules to every system prompt so all personas
  // avoid AI-ish phrasing patterns. Defined once in lib/shared/writingRules.ts.
  const fullSystemPrompt = systemPrompt + WRITING_RULES;

  if (config.provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) yield text;
    }
  } else {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const anthropicStream = client.messages.stream({
      model: config.model,
      max_tokens: maxTokens,
      temperature,
      system: fullSystemPrompt,
      messages,
    });

    for await (const event of anthropicStream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }
}
