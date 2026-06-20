"use client";

/**
 * CardSelector — Let the user draw 1–3 cards.
 *
 * Two modes:
 *   - Auto: randomly draw N cards with a shuffle animation
 *   - Manual: pick specific card IDs (dev/debug mode)
 */

import { useState, useCallback } from "react";
import type { CardRequest } from "@/lib/tarot/types";

interface CardSelectorProps {
  onSelect: (cards: CardRequest[]) => void;
}

const SPREAD_OPTIONS = [
  { count: 1, label: "單張牌", desc: "聚焦當下" },
  { count: 2, label: "雙張牌", desc: "過去 · 現在" },
  { count: 3, label: "三張牌", desc: "過去 · 現在 · 未來" },
] as const;

function randomCard(exclude: number[]): CardRequest {
  let id: number;
  do {
    id = Math.floor(Math.random() * 78);
  } while (exclude.includes(id));
  const reversed = Math.random() < 0.35; // 35% chance reversed
  return { id, reversed };
}

export default function CardSelector({ onSelect }: CardSelectorProps) {
  const [spreadCount, setSpreadCount] = useState<1 | 2 | 3>(3);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawn, setDrawn] = useState<CardRequest[]>([]);

  const handleDraw = useCallback(async () => {
    setIsShuffling(true);
    setDrawn([]);

    // Simulate shuffle delay
    await new Promise((r) => setTimeout(r, 1200));

    const cards: CardRequest[] = [];
    for (let i = 0; i < spreadCount; i++) {
      cards.push(randomCard(cards.map((c) => c.id)));
    }
    setDrawn(cards);
    setIsShuffling(false);
  }, [spreadCount]);

  const handleConfirm = useCallback(() => {
    if (drawn.length > 0) onSelect(drawn);
  }, [drawn, onSelect]);

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Spread selection */}
      <div className="flex gap-3">
        {SPREAD_OPTIONS.map(({ count, label, desc }) => (
          <button
            key={count}
            onClick={() => {
              setSpreadCount(count as 1 | 2 | 3);
              setDrawn([]);
            }}
            className={`flex flex-col items-center px-4 py-3 rounded-2xl border text-sm transition-all duration-300 ${
              spreadCount === count
                ? "border-morandi-lavender/70 bg-morandi-mauve/25 text-cream-100"
                : "border-morandi-lavender/20 text-morandi-stone hover:border-morandi-lavender/40"
            }`}
          >
            <span className="font-medium">{label}</span>
            <span className="text-xs opacity-60 mt-0.5">{desc}</span>
          </button>
        ))}
      </div>

      {/* Draw button */}
      {drawn.length === 0 && (
        <button
          onClick={handleDraw}
          disabled={isShuffling}
          className="relative w-32 h-32 rounded-2xl border border-morandi-lavender/30 bg-mystic-purple/40 flex flex-col items-center justify-center gap-2 hover:bg-mystic-purple/60 hover:border-morandi-lavender/60 hover:shadow-[0_0_30px_rgba(184,168,200,0.15)] transition-all duration-500 disabled:cursor-wait"
        >
          {isShuffling ? (
            <>
              <span className="text-3xl animate-spin" style={{ animationDuration: "1s" }}>
                🔮
              </span>
              <span className="text-morandi-stone text-xs">洗牌中⋯</span>
            </>
          ) : (
            <>
              <span className="text-3xl">🂠</span>
              <span className="text-cream-200/70 text-xs tracking-widest">點擊抽牌</span>
            </>
          )}
        </button>
      )}

      {/* Drawn cards display */}
      {drawn.length > 0 && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex gap-4 flex-wrap justify-center">
            {drawn.map((card, i) => (
              <DrawnCardPlaceholder key={i} card={card} position={i} total={drawn.length} />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDrawn([])}
              className="px-5 py-2 rounded-full border border-morandi-stone/30 text-morandi-stone text-sm hover:border-morandi-stone/60 transition-all"
            >
              重新抽牌
            </button>
            <button
              onClick={handleConfirm}
              className="px-7 py-2 rounded-full border border-morandi-lavender/50 bg-morandi-mauve/20 text-cream-100 text-sm tracking-widest hover:bg-morandi-mauve/35 hover:shadow-[0_0_20px_rgba(184,168,200,0.15)] transition-all duration-300"
            >
              ✨ 開始解讀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const POSITION_LABELS: Record<number, Record<number, string>> = {
  1: { 0: "" },
  2: { 0: "過去", 1: "現在" },
  3: { 0: "過去", 1: "現在", 2: "未來" },
};

function DrawnCardPlaceholder({
  card,
  position,
  total,
}: {
  card: CardRequest;
  position: number;
  total: number;
}) {
  const label = POSITION_LABELS[total]?.[position] ?? "";

  return (
    <div className="flex flex-col items-center gap-2 animate-[cardReveal_0.6s_ease-out_forwards]"
      style={{ animationDelay: `${position * 0.15}s`, opacity: 0 }}>
      {label && (
        <span className="text-morandi-stone text-xs tracking-widest">{label}</span>
      )}
      <div
        className={`w-20 h-32 rounded-xl border flex flex-col items-center justify-center gap-1 ${
          card.reversed
            ? "border-morandi-rose/50 bg-morandi-rose/10"
            : "border-morandi-lavender/40 bg-morandi-mauve/15"
        }`}
      >
        <span className={`text-2xl ${card.reversed ? "rotate-180" : ""}`}>🂠</span>
        <span className="text-cream-200/40 text-xs">#{card.id}</span>
        {card.reversed && (
          <span className="text-morandi-rose/70 text-[10px]">逆位</span>
        )}
      </div>
    </div>
  );
}
