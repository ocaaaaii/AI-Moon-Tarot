"use client";

/**
 * HoroscopeGrid — 星座週運勢 (Feature 1B of 眾神之庭 / 週神諭)
 *
 * 12-sign grid. User picks/remembers their own sign (localStorage), whose
 * card is visually emphasized and auto-expanded. Any card can be tapped to
 * expand; expanding streams Cynthia's rewritten weekly horoscope for that
 * sign from GET /api/garden/horoscope?sign={slug} (SSE). Results are cached
 * client-side per sign so re-opening a card doesn't re-stream.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ZODIAC_LIST, type ZodiacSign } from "@/lib/garden/types";

const STORAGE_KEY = "gardenZodiacSign";

// ─── Parsed block from Cynthia's streamed output ──────────────────────────────

interface HoroBlock {
  title: string | null;
  stars: string;
  body: string;
}

interface HoroCache {
  text: string;
  done: boolean;
  blocks: HoroBlock[];
  tagline: string | null;
}

function parseBlocks(raw: string): { blocks: HoroBlock[]; tagline: string | null } {
  const chunks = raw.split(/\n\n+/).filter(Boolean);
  const blocks: HoroBlock[] = [];
  let tagline: string | null = null;

  for (const chunk of chunks) {
    if (chunk.trim().startsWith("---")) {
      tagline = chunk.replace(/^-+\s*/, "").trim();
      continue;
    }
    const lines = chunk.split("\n");
    const headerMatch = lines[0].match(/^\*\*(.+?)\*\*\s*([★☆]{3,5})?/);
    if (headerMatch) {
      blocks.push({
        title: headerMatch[1],
        stars: headerMatch[2] ?? "",
        body: [lines[0].replace(/^\*\*(.+?)\*\*\s*([★☆]{3,5})?/, "").trim(), ...lines.slice(1)]
          .filter(Boolean)
          .join(" ")
          .trim(),
      });
    } else {
      blocks.push({ title: null, stars: "", body: chunk.trim() });
    }
  }

  return { blocks, tagline };
}

// ─── Zodiac card ───────────────────────────────────────────────────────────────

function ZodiacCard({
  meta,
  isUserSign,
  isExpanded,
  onToggle,
  cache,
  loading,
}: {
  meta: (typeof ZODIAC_LIST)[number];
  isUserSign: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  cache: HoroCache | undefined;
  loading: boolean;
}) {
  return (
    <motion.div
      layout
      style={{
        gridColumn: isExpanded ? "1 / -1" : undefined,
        borderRadius: 18,
        border: isUserSign
          ? "1px solid rgba(212,168,89,0.55)"
          : "1px solid rgba(184,168,200,0.14)",
        background: isUserSign
          ? "rgba(212,168,89,0.06)"
          : "rgba(26,16,46,0.55)",
        boxShadow: isUserSign
          ? "0 0 24px rgba(212,168,89,0.18), 0 8px 28px rgba(0,0,0,0.35)"
          : "0 4px 18px rgba(0,0,0,0.25)",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={onToggle}
      whileHover={{ y: -2 }}
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div
        style={{
          padding: isUserSign ? "18px 18px 14px" : "14px 14px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: isUserSign ? 26 : 20,
            color: isUserSign ? "rgba(212,168,89,0.95)" : "rgba(200,185,225,0.7)",
            lineHeight: 1,
          }}
        >
          {meta.symbol}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: isUserSign ? "rgba(245,238,220,0.98)" : "rgba(230,222,240,0.85)",
              fontSize: isUserSign ? 16 : 14,
              fontWeight: isUserSign ? 700 : 500,
              letterSpacing: "0.04em",
            }}
          >
            {meta.zh}
            {isUserSign && (
              <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(212,168,89,0.85)" }}>★ 我的星座</span>
            )}
          </p>
          {!isExpanded && (
            <p
              style={{
                marginTop: 2,
                fontSize: 11,
                color: "rgba(180,165,200,0.5)",
                letterSpacing: "0.04em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cache?.tagline ?? "點開看看這週的訊息"}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ padding: "0 18px 22px" }}
          >
            {!cache && loading && (
              <motion.p
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ color: "rgba(180,165,200,0.5)", fontSize: 12.5, letterSpacing: "0.08em" }}
              >
                Cynthia 正在觀星…
              </motion.p>
            )}

            {cache?.blocks.map((b, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                {b.title && (
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(212,168,89,0.9)",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    {b.title} <span style={{ color: "rgba(220,210,240,0.6)" }}>{b.stars}</span>
                  </p>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(238,230,215,0.88)" }}>
                  {b.body}
                  {loading && !cache.done && i === cache.blocks.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
                      style={{ marginLeft: 2, color: "rgba(184,168,200,0.6)" }}
                    >
                      ▋
                    </motion.span>
                  )}
                </p>
              </div>
            ))}

            {cache?.tagline && (
              <p
                style={{
                  marginTop: 8,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(184,168,200,0.12)",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "rgba(212,168,89,0.85)",
                  letterSpacing: "0.03em",
                }}
              >
                「{cache.tagline}」
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function HoroscopeGrid() {
  const [userSign, setUserSign] = useState<ZodiacSign | null>(null);
  const [expandedSign, setExpandedSign] = useState<ZodiacSign | null>(null);
  const [cache, setCache] = useState<Partial<Record<ZodiacSign, HoroCache>>>({});
  const [loadingSign, setLoadingSign] = useState<ZodiacSign | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore saved sign on mount
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ZodiacSign | null;
    if (saved && ZODIAC_LIST.some((z) => z.slug === saved)) {
      setUserSign(saved);
      setExpandedSign(saved);
    }
  }, []);

  const fetchHoroscope = useCallback((sign: ZodiacSign) => {
    setCache((prev) => {
      if (prev[sign]?.done) return prev;
      return prev;
    });

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingSign(sign);
    setCache((prev) => ({ ...prev, [sign]: { text: "", done: false, blocks: [], tagline: null } }));

    (async () => {
      try {
        const res = await fetch(`/api/garden/horoscope?sign=${sign}`, { signal: controller.signal });
        if (!res.ok || !res.body) {
          setCache((prev) => ({
            ...prev,
            [sign]: { text: "", done: true, blocks: [{ title: null, stars: "", body: "本週星象資料尚未更新，請稍後再試。" }], tagline: null },
          }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break outer;
            try {
              const p = JSON.parse(payload) as { chunk?: string; error?: string };
              if (p.error) {
                full = p.error;
                break outer;
              }
              if (p.chunk) {
                full += p.chunk;
                const { blocks, tagline } = parseBlocks(full);
                setCache((prev) => ({ ...prev, [sign]: { text: full, done: false, blocks, tagline } }));
              }
            } catch {
              /* skip malformed line */
            }
          }
        }

        const { blocks, tagline } = parseBlocks(full);
        setCache((prev) => ({ ...prev, [sign]: { text: full, done: true, blocks, tagline } }));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCache((prev) => ({
            ...prev,
            [sign]: { text: "", done: true, blocks: [{ title: null, stars: "", body: "讀取中斷，請重新整理再試。" }], tagline: null },
          }));
        }
      } finally {
        setLoadingSign((cur) => (cur === sign ? null : cur));
      }
    })();
  }, []);

  // Auto-fetch the user's own sign once known
  useEffect(() => {
    if (userSign && !cache[userSign]) {
      fetchHoroscope(userSign);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSign]);

  function handlePickSign(sign: ZodiacSign) {
    setUserSign(sign);
    setExpandedSign(sign);
    window.localStorage.setItem(STORAGE_KEY, sign);
  }

  function handleToggle(sign: ZodiacSign) {
    if (expandedSign === sign) {
      setExpandedSign(null);
      return;
    }
    setExpandedSign(sign);
    if (!cache[sign]) fetchHoroscope(sign);
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        padding: "0 4px 16px",
      }}
    >
      {/* Sign picker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <label style={{ color: "rgba(180,165,200,0.55)", fontSize: 12.5, letterSpacing: "0.08em" }}>
          你的星座
        </label>
        <select
          value={userSign ?? ""}
          onChange={(e) => handlePickSign(e.target.value as ZodiacSign)}
          style={{
            background: "rgba(26,16,46,0.85)",
            border: "1px solid rgba(184,168,200,0.25)",
            borderRadius: 10,
            color: "rgba(240,232,215,0.92)",
            fontSize: 13,
            padding: "6px 12px",
            letterSpacing: "0.04em",
          }}
        >
          <option value="" disabled>
            選一個
          </option>
          {ZODIAC_LIST.map((z) => (
            <option key={z.slug} value={z.slug}>
              {z.symbol} {z.zh}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3"
        style={{ gap: 12 }}
      >
        {ZODIAC_LIST.map((meta) => (
          <ZodiacCard
            key={meta.slug}
            meta={meta}
            isUserSign={meta.slug === userSign}
            isExpanded={meta.slug === expandedSign}
            onToggle={() => handleToggle(meta.slug)}
            cache={cache[meta.slug]}
            loading={loadingSign === meta.slug}
          />
        ))}
      </div>
    </div>
  );
}
