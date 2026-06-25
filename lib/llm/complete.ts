/**
 * lib/llm/complete.ts
 *
 * Non-streaming LLM call — collects all chunks and returns the full text.
 * Use for short, fast requests that don't need SSE (e.g. question refinement).
 */

import { streamLLM, type LLMMessage } from "./stream";

export async function completeLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens = 512,
  temperature = 0.5
): Promise<string> {
  let result = "";
  for await (const chunk of streamLLM(systemPrompt, messages, maxTokens, temperature)) {
    result += chunk;
  }
  return result;
}
