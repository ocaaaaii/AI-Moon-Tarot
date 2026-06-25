"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CardRequest } from "@/lib/tarot/types";

interface CardDeckProps {
  spreadCount: 1 | 2 | 3;
  onComplete: (cards: CardRequest[]) => void;
}

function buildDeck(): number[] {
  return Array.from({ length: 78 }, (_, i) => i);
}

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CardDeck({ spreadCount, onComplete }: CardDeckProps) {
  const [deck, setDeck] = useState<number[]>(() => shuffle(buildDeck()));
  const [drawn, setDrawn] = useState<CardRequest[]>([]);
  const [leaving, setLeaving] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setTimeout(() => el.scrollBy({ left: 60, behavior: "smooth" }), 600);
  }, []);

  const handleDraw = useCallback(
    (deckIndex: number) => {
      if (drawn.length >= spreadCount || leaving !== null) return;

      const cardId = deck[deckIndex];
      const reversed = Math.random() < 0.35;

      setLeaving(cardId);

      setTimeout(() => {
        setLeaving(null);
        setDeck((prev) => prev.filter((_, i) => i !== deckIndex));
        const newDrawn: CardRequest[] = [...drawn, { id: cardId, reversed }];
        setDrawn(newDrawn);
        if (newDrawn.length === spreadCount) {
          setTimeout(() => onComplete(newDrawn), 350);
        }
      }, 400);
    },
    [deck, drawn, spreadCount, onComplete, leaving]
  );

  const remaining = spreadCount - drawn.length;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Counter */}
      <div className="text-center">
        <motion.div
          key={drawn.length}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline justify-center gap-1"
        >
          <span className="text-4xl font-light text-cream-100">
            {drawn.length < spreadCount ? drawn.length + 1 : spreadCount}
          </span>
          <span className="text-morandi-stone/60 text-lg font-light">
            / {spreadCount}
          </span>
        </motion.div>
        <p className="text-morandi-stone text-sm mt-1">
          {drawn.length < spreadCount ? `第 ${drawn.length + 1} 張` : "抽牌完成"}
        </p>
      </div>

      {/* Scrollable deck */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden select-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-2 px-6 py-4" style={{ width: "max-content" }}>
          <AnimatePresence initial={false}>
            {deck.map((cardId, idx) => (
              <motion.div
                key={cardId}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={
                  leaving === cardId
                    ? { opacity: 0, y: -36, scale: 0.9 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <CardBack
                  isDisabled={drawn.length >= spreadCount || leaving !== null}
                  onClick={() => handleDraw(idx)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-morandi-stone/50 text-xs tracking-widest">
        ← 左右滾動選擇 →
      </p>

      {/* Mini drawn preview */}
      <AnimatePresence>
        {drawn.length > 0 && (
          <motion.div
            key="drawn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-3 mt-2"
          >
            {drawn.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs text-morandi-lavender/70 border border-morandi-lavender/20 rounded-full px-3 py-1"
              >
                #{c.id} {c.reversed ? "逆" : "正"}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CardBack({
  isDisabled,
  onClick,
}: {
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { y: -8, scale: 1.04, boxShadow: "0 8px 24px rgba(184,168,200,0.25)" }}
      whileTap={isDisabled ? {} : { scale: 0.95, y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative flex-shrink-0 w-16 h-28 rounded-xl border
        ${isDisabled
          ? "opacity-30 cursor-default border-morandi-lavender/10"
          : "border-morandi-lavender/30 hover:border-morandi-lavender/60 cursor-pointer"
        }
      `}
      style={{
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(176,160,184,0.15) 0%, rgba(29,18,40,0.9) 100%)",
      }}
    >
      <div className="absolute inset-1.5 rounded-lg border border-morandi-lavender/10 flex items-center justify-center">
        <div
          className="w-6 h-6 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, #c9a8a0 0%, transparent 70%)" }}
        />
      </div>
      <span className="absolute top-2 right-2 text-[8px] opacity-30">✦</span>
      <span className="absolute bottom-2 left-2 text-[8px] opacity-20">✦</span>
    </motion.button>
  );
}
