"use client";

/**
 * RegionRitual — generic Sacred Realms ritual overlay (see CLAUDE.md
 * 🔮 Future Vision). One component, configured per region via props,
 * instead of six near-duplicate components. Each region still gets its
 * own focused system prompt + API route (lib/omikuji/*Prompt.ts,
 * app/api/<region>/route.ts) — only the UI shell is shared.
 *
 * Flow: type something → it dissolves with a short animation (always at
 * least DISSOLVE_MS, so it never feels rushed even if the model is fast)
 * → a generated reply appears. Two special cases, both opt-in via props:
 *   - `twoPath`: the reply is expected to contain "|||" splitting two
 *     path descriptions (智慧花園/Iori) — rendered as two cards; falls
 *     back to one block if the delimiter is missing.
 *   - a "gated" server response (currently only 夜星庭/Maya's time gate)
 *     shows the server's own message instead of a fallback line — that
 *     distinction matters: a gate is intentional, not a failure.
 */

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Phase = "input" | "dissolving" | "response" | "gated";

interface RegionRitualProps {
  title: string;
  subheading: string;
  placeholder: string;
  releaseLabel: string;
  restartLabel: string;
  apiEndpoint: string;
  /** "R,G,B" — used to build rgba() accents inline, since this component
   * is shared across personas with different accent colors and Tailwind's
   * JIT scanner can't pick up dynamically-built class names. */
  accentRGB: string;
  twoPath?: boolean;
  fallbackResponses?: string[];
  onClose: () => void;
}

const DISSOLVE_MS = 1500;
const DEFAULT_FALLBACKS = ["這次連結不太順——要不要再試一次？"];

export default function RegionRitual({
  title,
  subheading,
  placeholder,
  releaseLabel,
  restartLabel,
  apiEndpoint,
  accentRGB,
  twoPath = false,
  fallbackResponses = DEFAULT_FALLBACKS,
  onClose,
}: RegionRitualProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [gateMessage, setGateMessage] = useState("");

  const handleRelease = useCallback(async () => {
    const worry = text.trim();
    if (worry.length < 2) return;
    setPhase("dissolving");

    const minDelay = new Promise<void>((resolve) => window.setTimeout(resolve, DISSOLVE_MS));

    const outcome = fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worry }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { response?: string; error?: string; gated?: boolean };
        if (!res.ok) {
          if (data.gated) {
            return { kind: "gated" as const, message: data.error ?? "" };
          }
          throw new Error(data.error ?? "request failed");
        }
        if (!data.response) throw new Error("empty response");
        return { kind: "ok" as const, message: data.response };
      })
      .catch(() => ({
        kind: "ok" as const,
        message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      }));

    const [, result] = await Promise.all([minDelay, outcome]);

    if (result.kind === "gated") {
      setGateMessage(result.message);
      setPhase("gated");
    } else {
      setResponse(result.message);
      setPhase("response");
    }
  }, [text, apiEndpoint, fallbackResponses]);

  const handleRestart = useCallback(() => {
    setText("");
    setResponse("");
    setGateMessage("");
    setPhase("input");
  }, []);

  const accent = (alpha: number) => `rgba(${accentRGB}, ${alpha})`;
  const paths = twoPath ? response.split("|||").map((p) => p.trim()).filter(Boolean) : [];
  const showTwoPaths = twoPath && paths.length === 2;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "rgba(8, 10, 16, 0.88)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full border border-cream-200/20 bg-black/35 backdrop-blur-sm text-cream-200/80 hover:text-cream-100 hover:border-cream-200/40 text-xs tracking-widest transition-colors duration-200"
      >
        ✕ 離開{title}
      </button>

      <div className="text-center">
        <p style={{ color: accent(0.6) }} className="text-xs tracking-[0.3em] uppercase mb-1">
          {title}
        </p>
        <h2 className="font-serif text-lg text-cream-100">{subheading}</h2>
      </div>

      <AnimatePresence mode="wait">
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm flex flex-col gap-3"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={3}
              maxLength={150}
              className="w-full rounded-2xl bg-black/20 text-cream-100 placeholder-morandi-stone/40 text-sm p-4 resize-none focus:outline-none transition-colors leading-relaxed"
              style={{ border: `1px solid ${accent(0.25)}` }}
            />
            <motion.button
              onClick={handleRelease}
              disabled={text.trim().length < 2}
              whileHover={text.trim().length >= 2 ? { scale: 1.03 } : {}}
              whileTap={text.trim().length >= 2 ? { scale: 0.97 } : {}}
              className="px-6 py-2.5 rounded-full text-cream-100 text-sm tracking-widest transition-colors duration-300 disabled:opacity-40"
              style={{ border: `1px solid ${accent(0.4)}`, background: accent(0.1) }}
            >
              {releaseLabel}
            </motion.button>
          </motion.div>
        )}

        {phase === "dissolving" && (
          <motion.div
            key="dissolving"
            className="w-full max-w-sm text-center flex flex-col items-center gap-5"
          >
            <motion.p
              className="text-cream-200/80 text-sm leading-relaxed"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(6px)", y: 18 }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.6, 1] }}
            >
              {text}
            </motion.p>
            <motion.div
              className="flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent(0.6) }}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {phase === "response" && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md flex flex-col items-center gap-5"
          >
            {showTwoPaths ? (
              <div className="w-full flex flex-col sm:flex-row gap-3">
                {paths.map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-2xl p-4"
                    style={{ border: `1px solid ${accent(0.25)}`, background: accent(0.06) }}
                  >
                    <p className="text-[11px] tracking-widest mb-2" style={{ color: accent(0.7) }}>
                      {i === 0 ? "A 路線" : "B 路線"}
                    </p>
                    <p className="text-cream-100 text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-cream-100 text-sm leading-relaxed text-center italic">
                「{response}」
              </p>
            )}
            <motion.button
              onClick={handleRestart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-full text-morandi-stone/60 text-xs tracking-widest hover:text-cream-200 transition-colors duration-300"
              style={{ border: `1px solid ${accent(0.3)}` }}
            >
              {restartLabel}
            </motion.button>
          </motion.div>
        )}

        {phase === "gated" && (
          <motion.div
            key="gated"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm flex flex-col items-center gap-4 text-center"
          >
            <p className="text-cream-200/80 text-sm leading-relaxed">{gateMessage}</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-morandi-stone/60 text-xs tracking-widest hover:text-cream-200 transition-colors duration-300"
              style={{ border: `1px solid ${accent(0.3)}` }}
            >
              我知道了
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
