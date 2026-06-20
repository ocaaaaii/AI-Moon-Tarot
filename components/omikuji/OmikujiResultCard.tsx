"use client";

/**
 * OmikujiResultCard — pure display of the drawn omikuji entry.
 *
 * Per CLAUDE.md's scoped exception, bad-fortune (凶/兇) content is shown as
 * objective fact (not euphemized) — but the fold-and-hang ritual action now
 * lives in the surrounding chat flow (ShrineDraw), triggered only after
 * Tsukino's personalized interpretation has been read, so the negative
 * content is never left as a bare, unmitigated prophecy. This card just
 * renders the poem/level and plays the fold-collapse animation when asked.
 */

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import type { OmikujiEntry } from "@/lib/omikuji/types";

interface OmikujiResultCardProps {
  entry: OmikujiEntry;
  folding: boolean;
  onFoldComplete: () => void;
}

export default function OmikujiResultCard({
  entry,
  folding,
  onFoldComplete,
}: OmikujiResultCardProps) {
  const isBad = entry.isBadFortune;

  // motion/react's onAnimationComplete fires once per animated value in this
  // transition (scaleY, scaleX, rotate, opacity all animate together), so
  // without a guard, onFoldComplete would be invoked multiple times for a
  // single fold — this was duplicating knots on the 結籤架. Fire once per
  // fold cycle, reset when `folding` returns to false.
  const firedRef = useRef(false);
  useEffect(() => {
    if (!folding) firedRef.current = false;
  }, [folding]);

  return (
    <motion.div
      className="w-full max-w-sm rounded-2xl border overflow-hidden"
      style={{
        borderColor: isBad ? "rgba(201,168,160,0.4)" : "rgba(184,168,200,0.3)",
        background: "rgba(26,18,40,0.55)",
        backdropFilter: "blur(12px)",
        transformOrigin: "center 30%",
      }}
      initial={{ opacity: 0, scale: 0.85, rotateX: 90 }}
      animate={
        folding
          ? {
              scaleY: [1, 1.04, 0.4, 0.12],
              scaleX: [1, 0.96, 0.75, 0.6],
              rotate: [0, 1, 5, 9],
              opacity: [1, 1, 1, 0],
            }
          : { opacity: 1, scale: 1, rotateX: 0 }
      }
      transition={
        folding
          ? { duration: 0.75, ease: [0.6, 0, 0.4, 1], times: [0, 0.25, 0.65, 1] }
          : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }
      onAnimationComplete={() => {
        if (folding && !firedRef.current) {
          firedRef.current = true;
          onFoldComplete();
        }
      }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(184,168,200,0.12)" }}
      >
        <span className="text-cream-200/60 text-xs tracking-widest">第 {entry.id} 籤</span>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            isBad ? "text-morandi-rose bg-morandi-rose/15" : "text-morandi-sage bg-morandi-sage/15"
          }`}
        >
          {entry.level}
        </span>
      </div>

      <div
        className="px-5 py-4 text-center"
        style={{ borderBottom: "1px solid rgba(184,168,200,0.08)" }}
      >
        {entry.poem.map((line, i) => (
          <p key={i} className="font-serif text-cream-100 text-base leading-7 tracking-wider">
            {line}
          </p>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-cream-200/80 text-sm leading-relaxed">{entry.interpretation}</p>
        {entry.details.length > 0 && (
          <ul className="space-y-1">
            {entry.details.map((d, i) => (
              <li key={i} className="text-morandi-stone text-xs leading-relaxed">
                · {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
