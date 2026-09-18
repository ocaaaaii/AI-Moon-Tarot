"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { CardRequest } from "@/lib/tarot/types";
import type { TarotSpread } from "@/lib/tarot/spreads";
import { cardImagePath } from "@/lib/tarot/cardSlugs";
import SpreadBackdrop from "./SpreadBackdrop";

interface DrawnCardsProps {
  cards: CardRequest[];
  cardMeta?: Record<number, { name_zh: string; name_en: string; local_image: string }>;
  /**
   * The spread these cards were drawn for. Without one the cards fall back to
   * the old centred row — which is what a reading restored from an older shape
   * would get.
   */
  spread?: TarotSpread | null;
  /** `r,g,b` for the active master, tinting the board's backdrop */
  accentRgb?: string;
}

/** height ÷ width of a tarot card image */
const CARD_RATIO = 192 / 110;

// Chakra colors — one per position (海底輪 → 頂輪)
const CHAKRA_COLORS = [
  "#ef4444", // 海底輪 red
  "#f97316", // 臍輪 orange
  "#eab308", // 太陽神經叢 yellow
  "#22c55e", // 心輪 green
  "#3b82f6", // 喉輪 blue
  "#6366f1", // 眉心輪 indigo
  "#a855f7", // 頂輪 purple
];

/**
 * The drawn spread, laid out as a board.
 *
 * Every label lives INSIDE its own card — the position as a pill on the top
 * edge, the card name and its hint as a caption over the bottom. That is not a
 * style choice: the layouts put cards as little as 9px apart, and any text
 * hanging outside a card would collide with its neighbour in the tighter
 * spreads. Inside the card's own footprint it cannot, whatever the geometry.
 */
export default function DrawnCards({ cards, cardMeta = {}, spread, accentRgb = "184,168,200" }: DrawnCardsProps) {
  const [flipped, setFlipped] = useState<boolean[]>(() => Array(cards.length).fill(false));

  // "is this the chakra spread" reads the spread, not `cards.length === 7`,
  // which would paint chakra colours onto any future seven-card spread.
  const isChakra = spread?.id === "chakra";
  const stagger = isChakra ? 260 : 420;

  useEffect(() => {
    const timers = cards.map((_, i) =>
      setTimeout(() => {
        setFlipped(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 420 + i * stagger)
    );
    return () => timers.forEach(clearTimeout);
  }, [cards, stagger]);

  function card(i: number, widthPx: number | string, label: string, hint: string) {
    const c = cards[i];
    const meta = cardMeta[c.id];
    const nameZh = meta?.name_zh ?? `#${c.id}`;
    const chakraColor = isChakra ? CHAKRA_COLORS[i] : undefined;
    const isUp = flipped[i];

    return (
      <div style={{ width: widthPx, aspectRatio: "110 / 192", perspective: "900px", position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1)",
            transform: isUp ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* back */}
          <div
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            className="absolute inset-0 rounded-xl border border-morandi-lavender/25 flex items-center justify-center overflow-hidden"
          >
            <div
              className="absolute inset-0 rounded-xl"
              style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(176,160,184,0.18) 0%, rgba(22,13,38,0.97) 100%)" }}
            />
            <span className="relative z-10 text-morandi-lavender/25 text-xl">✦</span>
          </div>

          {/* face */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              ...(chakraColor && isUp ? { boxShadow: `0 0 12px ${chakraColor}55` } : {}),
            }}
            className="absolute inset-0 rounded-xl overflow-hidden border border-morandi-lavender/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImagePath(c.id)}
              alt={nameZh}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transform: "scale(1.04)" }}
            />

            {c.reversed && (
              <span className="absolute top-1.5 right-1.5 text-[8px] text-morandi-lavender/80 tracking-widest bg-black/55 px-1.5 py-0.5 rounded-full">
                逆位
              </span>
            )}

            {isUp && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 bottom-0 px-2 pt-6 pb-1.5 text-center"
                style={{ background: "linear-gradient(to top, rgba(10,7,18,0.94) 35%, transparent 100%)" }}
              >
                <p className="text-cream-100/95 text-[11px] leading-tight">{nameZh}</p>
                {/* clamped: a long hint on a 70px card would otherwise creep
                    up over the art it is supposed to caption */}
                {hint && (
                  <p className="text-cream-200/50 text-[8.5px] leading-snug mt-0.5 line-clamp-2" style={{ textWrap: "pretty" }}>
                    {hint}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* position pill, straddling the top edge */}
        {label && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: "rgba(14,9,26,0.92)", border: `1px solid rgba(${accentRgb},0.30)` }}
          >
            {chakraColor && (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: chakraColor, flexShrink: 0 }} />
            )}
            <span className="text-morandi-stone/75 text-[9px] tracking-widest">{label}</span>
          </div>
        )}
      </div>
    );
  }

  // ── fallback: no spread, so no geometry — the old centred row ──────────────
  if (!spread) {
    return (
      <div className="w-full flex justify-center gap-5 flex-wrap pt-3">
        {cards.map((_, i) => (
          <motion.div
            key={i}
            className="relative"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {card(i, 110, "", "")}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    // `w-full`: this sits inside another flex row, so without it the wrapper
    // shrink-wraps and the board's own `width: 100%` resolves against zero.
    <div className="w-full flex justify-center">
      <div
        className="relative"
        style={{
          width: "100%",
          maxWidth: spread.maxWidth,
          aspectRatio: `${spread.maxWidth} / ${Math.round(spread.maxWidth / spread.aspect)}`,
        }}
      >
        <SpreadBackdrop id={spread.backdrop} rgb={accentRgb} aspect={spread.aspect} />

        {cards.map((_, i) => {
          const pos = spread.positions[i];
          if (!pos) return null;
          return (
            // Outer box owns the static centring transform; the inner motion
            // div owns the entrance. One element, one transform owner.
            <div
              key={i}
              className="absolute"
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                width: `${spread.cardScale * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * (stagger / 1000) * 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {card(i, "100%", pos.label, pos.hint)}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CARD_RATIO };
