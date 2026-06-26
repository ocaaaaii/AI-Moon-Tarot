"use client";

/**
 * PickACardView — Pick-a-Card Oracle system UI
 *
 * Phases:
 *   "theme"   → choose one of 3 weekly Oracle themes
 *   "pile"    → choose one of 4 face-down piles
 *   "reveal"  → selected pile's 4 cards flip face-up (staggered 3D)
 *   "reading" → Oracle reading streams in below the revealed cards
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  WEEKLY_DECKS,
  generatePileCardsSeeded,
  cardImagePath,
  cardDisplayName,
  type PileId,
  type DeckTheme,
  type PileConfig,
} from "@/lib/tarot/weeklyDecks";
import { useTokens, COST_PER_USE } from "@/lib/tokens/useTokens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentWeekIndex(): number {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return weekNumber % WEEKLY_DECKS.length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** CSS-only card back face — used in the pile stacks */
function CardBackFace({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" }) {
  const w = size === "sm" ? 80 : 110;
  const h = size === "sm" ? 138 : 190;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 10,
        background:
          "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(80,55,130,0.9) 0%, rgba(18,10,38,0.98) 100%)",
        border: "1.5px solid rgba(184,168,200,0.3)",
        boxShadow: "inset 0 0 24px rgba(180,140,255,0.08), 0 4px 20px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: w - 16,
          height: h - 20,
          border: "1px solid rgba(184,168,200,0.18)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(180,140,255,0.04)",
        }}
      >
        <span style={{ fontSize: size === "sm" ? 22 : 30, lineHeight: 1 }}>{symbol}</span>
      </div>
    </div>
  );
}

/** A single flipping card (front vs back) + name label */
function FlipCard({
  cardId,
  symbol,
  revealed,
  delay,
}: {
  cardId: number;
  symbol: string;
  revealed: boolean;
  delay: number;
}) {
  const W = 130;
  const H = 224;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{ perspective: "900px", width: W, height: H }}>
        <motion.div
          style={{
            width: W,
            height: H,
            position: "relative",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Front face — card image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(184,168,200,0.25)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <Image
              src={cardImagePath(cardId)}
              alt="Oracle card"
              fill
              className="object-cover"
              sizes="130px"
            />
          </div>
          {/* Back face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Scale up the back face to match new card size */}
            <div style={{ width: W, height: H, background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(80,55,130,0.9) 0%, rgba(18,10,38,0.98) 100%)", border: "1.5px solid rgba(184,168,200,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: W - 18, height: H - 22, border: "1px solid rgba(184,168,200,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(180,140,255,0.04)" }}>
                <span style={{ fontSize: 34, lineHeight: 1 }}>{symbol}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card name — fades in after reveal */}
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 4 }}
        transition={{ duration: 0.4, delay: delay + 0.5 }}
        style={{
          color: "rgba(220,210,240,0.75)",
          fontSize: 11,
          letterSpacing: "0.07em",
          textAlign: "center",
          maxWidth: W,
          lineHeight: 1.4,
        }}
      >
        {cardDisplayName(cardId)}
      </motion.p>
    </div>
  );
}

/** One pile — stacked cards visual + label */
function PileCard({
  pile,
  onSelect,
  disabled,
}: {
  pile: PileConfig;
  onSelect: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={disabled ? undefined : onSelect}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.22 }}
      style={{
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {/* Stacked pile */}
      <div
        style={{
          position: "relative",
          width: 110,
          height: 190,
          transition: "filter 0.25s",
          filter: hovered ? `drop-shadow(0 0 18px ${pile.glowColor})` : "none",
        }}
      >
        {/* Shadow cards behind */}
        {[12, 6].map((offset, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -offset / 2,
              left: offset / 2,
              opacity: 0.45 - i * 0.1,
            }}
          >
            <CardBackFace symbol={pile.symbol} />
          </div>
        ))}
        {/* Top card */}
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <CardBackFace symbol={pile.symbol} />
        </div>
        {/* Glow ring on hover */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 14,
              border: `1.5px solid ${pile.glowColor}`,
              pointerEvents: "none",
              transition: "opacity 0.2s",
            }}
          />
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "rgba(245,238,220,0.92)", fontSize: 14, fontWeight: 500, letterSpacing: "0.06em" }}>
          {pile.symbol} {pile.label}
        </p>
        <p style={{ color: "rgba(180,165,200,0.5)", fontSize: 11, letterSpacing: "0.08em", marginTop: 2 }}>
          牌組 {pile.id}
        </p>
      </div>
    </motion.button>
  );
}

/** Theme selection card */
function ThemeCard({
  deck,
  isFeatured,
  onSelect,
}: {
  deck: DeckTheme;
  isFeatured: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22 }}
      style={{
        background: "rgba(26,16,46,0.75)",
        border: `1px solid ${isFeatured ? deck.accentColor : "rgba(184,168,200,0.12)"}`,
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
        backdropFilter: "blur(8px)",
        boxShadow: isFeatured
          ? `0 0 40px ${deck.accentColor.replace("0.85", "0.25")}, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 4px 20px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {isFeatured && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 10,
            letterSpacing: "0.1em",
            color: deck.accentColor,
            background: `${deck.accentColor.replace("0.85", "0.15")}`,
            border: `1px solid ${deck.accentColor.replace("0.85", "0.4")}`,
            borderRadius: 20,
            padding: "2px 8px",
          }}
        >
          本週
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${deck.accentColor}`,
            flexShrink: 0,
          }}
        >
          <Image
            src={deck.hostImage}
            alt={deck.hostDisplayName}
            width={46}
            height={46}
            className="object-cover object-top"
          />
        </div>
        <div>
          <p style={{ color: "rgba(245,238,220,0.5)", fontSize: 11, letterSpacing: "0.12em" }}>
            {deck.hostDisplayName}
          </p>
          <p style={{ color: "rgba(245,238,220,0.92)", fontSize: 15, fontWeight: 600, marginTop: 1 }}>
            {deck.themeTitle}
          </p>
        </div>
      </div>

      <p style={{ color: "rgba(180,165,200,0.65)", fontSize: 12.5, lineHeight: 1.6 }}>
        {deck.themeSubtitle}
      </p>
    </motion.button>
  );
}

// ─── Oracle reading text renderer ─────────────────────────────────────────────

function OracleText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>
      {paragraphs.map((para, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            color: "rgba(240,232,215,0.9)",
            fontSize: 15,
            lineHeight: 1.9,
            letterSpacing: "0.03em",
            marginBottom: i < paragraphs.length - 1 ? 20 : 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {para}
          {isStreaming && i === paragraphs.length - 1 && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
              style={{ color: "rgba(184,168,200,0.6)", marginLeft: 2 }}
            >
              ▋
            </motion.span>
          )}
        </motion.p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "theme" | "pile" | "reveal" | "reading";

export default function PickACardView() {
  const [phase, setPhase] = useState<Phase>("theme");
  const [selectedDeck, setSelectedDeck] = useState<DeckTheme | null>(null);
  const [pileCards, setPileCards] = useState<Record<PileId, number[]> | null>(null);
  const [selectedPile, setSelectedPile] = useState<PileId | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [readingText, setReadingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  const { spend } = useTokens();
  const weekIndex = getCurrentWeekIndex();
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

  // After pile is selected → animate reveal, then stream
  useEffect(() => {
    if (phase !== "reveal" || !selectedDeck || !selectedPile || !pileCards) return;

    // Short delay, then flip cards
    const flipTimer = setTimeout(() => setRevealed(true), 300);

    // After cards finish flipping (stagger 4 cards × 0.15s delay + 0.65s anim = ~1.4s)
    const streamTimer = setTimeout(() => {
      setPhase("reading");
      startStreaming();
    }, 1800);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(streamTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startStreaming = useCallback(async () => {
    if (!selectedDeck || !selectedPile || !pileCards) return;

    const pile = selectedDeck.piles.find((p) => p.id === selectedPile);
    if (!pile) return;

    const cardIds = pileCards[selectedPile];

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsStreaming(true);
    setReadingText("");

    try {
      const res = await fetch("/api/pick-a-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: selectedDeck.id,
          pileLabel: pile.label,
          cardIds,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        setReadingText("（連線發生問題，請重新整理頁面再試一次。）");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break outer;
          try {
            const p = JSON.parse(payload) as { chunk?: string };
            if (p.chunk) setReadingText((t) => t + p.chunk);
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setReadingText("（讀取中斷，請重新整理再試。）");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [selectedDeck, selectedPile, pileCards]);

  // Scroll reading into view once it starts
  useEffect(() => {
    if (phase === "reading" && readingRef.current) {
      setTimeout(() => readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    }
  }, [phase]);

  function handleThemeSelect(deck: DeckTheme) {
    if (!spend()) {
      setTokenError(true);
      setTimeout(() => setTokenError(false), 2800);
      return;
    }
    setTokenError(false);
    setSelectedDeck(deck);
    setPileCards(generatePileCardsSeeded(weekNumber, deck.id));
    setPhase("pile");
    setSelectedPile(null);
    setRevealed(false);
    setReadingText("");
  }

  function handlePileSelect(pileId: PileId) {
    setSelectedPile(pileId);
    setPhase("reveal");
  }

  function handleReset() {
    abortRef.current?.abort();
    setPhase("theme");
    setSelectedDeck(null);
    setPileCards(null);
    setSelectedPile(null);
    setRevealed(false);
    setReadingText("");
    setIsStreaming(false);
  }

  const currentPile = selectedDeck && selectedPile
    ? selectedDeck.piles.find((p) => p.id === selectedPile)
    : null;
  const currentCardIds = pileCards && selectedPile ? pileCards[selectedPile] : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(40,25,80,0.7) 0%, #0a0714 100%)",
        padding: "0 16px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          paddingTop: 56,
          paddingBottom: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <p
          style={{
            color: "rgba(180,160,220,0.55)",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Oracle · 週神諭
        </p>
        <AnimatePresence mode="wait">
          {phase === "theme" && (
            <motion.h1
              key="title-theme"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              style={{
                color: "rgba(245,238,220,0.95)",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textAlign: "center",
                fontFamily: "serif",
              }}
            >
              選擇你的神諭主題
            </motion.h1>
          )}
          {(phase === "pile" || phase === "reveal" || phase === "reading") && selectedDeck && (
            <motion.h1
              key={`title-${selectedDeck.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              style={{
                color: "rgba(245,238,220,0.95)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textAlign: "center",
                fontFamily: "serif",
              }}
            >
              {selectedDeck.themeTitle}
            </motion.h1>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {phase === "pile" && (
            <motion.p
              key="inst-pile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ color: "rgba(180,165,200,0.55)", fontSize: 13, letterSpacing: "0.06em" }}
            >
              選擇一疊牌，讓能量引導你
            </motion.p>
          )}
          {phase === "reveal" && (
            <motion.p
              key="inst-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ color: "rgba(180,165,200,0.55)", fontSize: 13, letterSpacing: "0.06em" }}
            >
              {currentPile?.symbol} {currentPile?.label}，翻牌中…
            </motion.p>
          )}
          {phase === "reading" && (
            <motion.p
              key="inst-reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ color: "rgba(180,165,200,0.55)", fontSize: 13, letterSpacing: "0.06em" }}
            >
              {currentPile?.symbol} {currentPile?.label} · 神諭解讀中
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Theme selection ── */}
      <AnimatePresence mode="wait">
        {phase === "theme" && (
          <motion.div
            key="phase-theme"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: 560,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 28,
            }}
          >
            <p style={{ color: "rgba(180,160,220,0.40)", fontSize: 11, letterSpacing: "0.15em", textAlign: "center", marginBottom: 2 }}>
              選擇主題後消耗 {COST_PER_USE} 曜刻
            </p>
            {WEEKLY_DECKS.map((deck, i) => (
              <ThemeCard
                key={deck.id}
                deck={deck}
                isFeatured={i === weekIndex}
                onSelect={() => handleThemeSelect(deck)}
              />
            ))}
            <AnimatePresence>
              {tokenError && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  style={{ color: "rgba(240,120,100,0.85)", fontSize: 12, textAlign: "center", letterSpacing: "0.06em", marginTop: 4 }}
                >
                  曜刻不足，明日 00:00 自動補充 ✦
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Pile selection ── */}
        {phase === "pile" && (
          <motion.div
            key="phase-pile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 48 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "32px 28px",
              }}
            >
              {selectedDeck?.piles.map((pile) => (
                <PileCard
                  key={pile.id}
                  pile={pile}
                  onSelect={() => handlePileSelect(pile.id)}
                  disabled={false}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Reveal + Reading ── */}
        {(phase === "reveal" || phase === "reading") && selectedDeck && currentPile && (
          <motion.div
            key="phase-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 40,
              marginTop: 36,
            }}
          >
            {/* Revealed cards row */}
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {currentCardIds.map((cardId, i) => (
                <FlipCard
                  key={cardId}
                  cardId={cardId}
                  symbol={currentPile.symbol}
                  revealed={revealed}
                  delay={i * 0.15}
                />
              ))}
            </div>

            {/* Divider */}
            {phase === "reading" && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(184,168,200,0.2), transparent)",
                  transformOrigin: "center",
                }}
              />
            )}

            {/* Reading text */}
            {phase === "reading" && (
              <motion.div
                ref={readingRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={{
                  width: "100%",
                  padding: "0 4px",
                }}
              >
                {readingText ? (
                  <OracleText text={readingText} isStreaming={isStreaming} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <motion.span
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      style={{ color: "rgba(180,165,200,0.5)", fontSize: 13, letterSpacing: "0.1em" }}
                    >
                      神諭正在凝聚…
                    </motion.span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action buttons ── */}
      <AnimatePresence>
        {phase !== "theme" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            style={{
              marginTop: 56,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {phase === "pile"&& (
              <button
                onClick={() => { setPhase("theme"); setSelectedDeck(null); setPileCards(null); }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 40,
                  border: "1px solid rgba(184,168,200,0.2)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(200,185,225,0.65)",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                ← 換個主題
              </button>
            )}
            <button
              onClick={handleReset}
              style={{
                padding: "10px 28px",
                borderRadius: 40,
                border: "1px solid rgba(184,168,200,0.28)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(220,210,240,0.80)",
                fontSize: 13,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              再抽一次
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
