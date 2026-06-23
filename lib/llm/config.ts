/**
 * lib/llm/config.ts
 *
 * Single place that reads LLM_PROVIDER from the environment and resolves
 * which model string to use. All API routes read this — nothing else needs
 * to know which SDK is active.
 *
 * .env / Vercel env vars:
 *   LLM_PROVIDER      = "anthropic" | "deepseek"   (default: "anthropic")
 *   ANTHROPIC_API_KEY = sk-ant-...
 *   DEEPSEEK_API_KEY  = sk-...
 *   DEEPSEEK_MODEL    = "deepseek-chat" | "deepseek-reasoner"  (default: "deepseek-chat")
 */

export type LLMProvider = "anthropic" | "deepseek";

export interface LLMConfig {
  provider: LLMProvider;
  /** The model string to pass to the SDK */
  model: string;
}

export function getLLMConfig(): LLMConfig {
  const raw = process.env.LLM_PROVIDER ?? "anthropic";
  const provider = raw === "deepseek" ? "deepseek" : "anthropic";

  if (provider === "deepseek") {
    return {
      provider: "deepseek",
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    };
  }

  return {
    provider: "anthropic",
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
  };
}
