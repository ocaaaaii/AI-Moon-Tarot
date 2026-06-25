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

export default function DrawnCards({ cards, cardMeta = {}, positions }: DrawnCardsProps) {
  const [flipped, setFlipped] = useState<boolean[]>(Array(cards.length).fill(false));

  useEffect(() => {
    cards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 300 + i * 380);
    });
  }, [cards]);

  return (
    <div className="flex justify-center gap-5 flex-wrap">
      {cards.map((card, i) => {
        const label = positions?.[i] ?? POSITION_LABELS[cards.length]?.[i] ?? "";
        const meta = cardMeta[card.id];
        const nameZh = meta?.name_zh ?? `#${card.id}`;
        const imageSrc = cardImagePath(card.id);

        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {label && (
              <span className="text-morandi-stone/70 text-xs tracking-widest">{label}</span>
            )}

            {/* 3D flip container */}
            <div style={{ width: 88, height: 154, perspective: "900px" }}>
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
                      transform: card.reversed ? "rotate(180deg)" : "none",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Name label */}
            {flipped[i] && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-cream-200/75 text-xs">{nameZh}</p>
                {card.reversed && (
                  <p className="text-morandi-rose/60 text-[10px]">逆位</p>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
