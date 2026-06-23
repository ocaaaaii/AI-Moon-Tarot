/**
 * lib/llm/complete.ts
 *
 * Provider-agnostic non-streaming helper.
 * Used by the Sacred Realms mini-ritual routes (tide-pool, spring-garden,
 * dawn-courtyard, solar-palace, sandbox, midnight-courtyard) that return a
 * single JSON response rather than SSE.
 *
 * Usage:
 *   const text = await completeLLM(system, messages, maxTokens, temp);
 */

import { getLLMConfig } from "./config";
import type { LLMMessage } from "./stream";

export async function completeLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const config = getLLMConfig();

  if (config.provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not configured");

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content?.trim() ?? "";
  } else {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: config.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    });

    return response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  }
}
