"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { CardRequest } from "@/lib/tarot/types";
import { cardImagePath } from "@/lib/tarot/cardSlugs";

interface DrawnCardsProps {
  cards: CardRequest[];
  cardMeta?: Record<number, { name_zh: string; name_en: string; local_image: string }>;
  /** Per-card position labels (e.g. ["天（靈魂課題）","地（現實事件）","人（心態鏡子）"]) */
  positions?: string[];
}

const POSITION_LABELS: Record<number, Record<number, string>> = {
  1: { 0: "" },
  2: { 0: "過去", 1: "現在" },
  3: { 0: "過去", 1: "現在", 2: "未來" },
};

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

export default function DrawnCards({ cards, cardMeta = {}, positions }: DrawnCardsProps) {
  const [flipped, setFlipped] = useState<boolean[]>(Array(cards.length).fill(false));
  const isChakra = cards.length === 7;
  // Smaller cards for 7-card chakra spread
  const cardW = isChakra ? 72 : 110;
  const cardH = isChakra ? 125 : 192;

  useEffect(() => {
    cards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 300 + i * (isChakra ? 220 : 380));
    });
  }, [cards, isChakra]);

  return (
    <div className={`flex justify-center ${isChakra ? "gap-2 flex-wrap" : "gap-5 flex-wrap"}`}>
      {cards.map((card, i) => {
        const label = positions?.[i] ?? POSITION_LABELS[cards.length]?.[i] ?? "";
        const meta = cardMeta[card.id];
        const nameZh = meta?.name_zh ?? `#${card.id}`;
        const imageSrc = cardImagePath(card.id);
        const chakraColor = isChakra ? CHAKRA_COLORS[i] : undefined;

        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * (isChakra ? 0.08 : 0.12), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {label && (
              <div className="flex items-center gap-1">
                {chakraColor && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: chakraColor, display: "inline-block", flexShrink: 0 }} />
                )}
                <span className="text-morandi-stone/70 text-[10px] tracking-widest">{label}</span>
              </div>
            )}

            {/* 3D flip container */}
            <div style={{ width: cardW, height: cardH, perspective: "900px" }}>
              <div style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
              }}>
                {/* Card back */}
                <div
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  className="absolute inset-0 rounded-xl border border-morandi-lavender/25 flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-xl" style={{
                    background: "radial-gradient(ellipse at 35% 30%, rgba(176,160,184,0.18) 0%, rgba(22,13,38,0.97) 100%)",
                  }} />
                  <span className="relative z-10 text-morandi-lavender/25 text-xl">✦</span>
                </div>

                {/* Card face */}
                <div
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    ...(chakraColor && flipped[i] ? { boxShadow: `0 0 10px ${chakraColor}55` } : {}),
                  }}
                  className="absolute inset-0 rounded-xl overflow-hidden border border-morandi-lavender/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={nameZh}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                      transform: "scale(1.04)",
                    }}
                  />
                  {/* Reversed overlay */}
                  {cards[i]?.reversed && (
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-[9px] text-morandi-lavender/60 tracking-widest bg-black/50 px-2 py-0.5 rounded-full">
                        逆位
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card label — outside the fixed-height container so it doesn't overflow */}
            <div className="mt-2 text-center" style={{ width: cardW }}>
              {flipped[i] && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-cream-200/70 text-xs"
                >
                  {nameZh}
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
