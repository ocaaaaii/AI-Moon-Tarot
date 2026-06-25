"use client";

/**
 * SaisenRitual — pre-draw ritual overlay for 月神神社.
 *
 * Shows the 月神賽錢箱 with falling gold star-sparks, spends 1 曜刻,
 * then calls onComplete. In quick mode: instant.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";

interface SaisenRitualProps {
  quickMode: boolean;
  onComplete: () => void;
  onInsufficient: () => void;
  spend: () => boolean;
}

// Positions for falling star-sparks (left%, delay s, size px)
const SPARKS: [number, number, number][] = [
  [28, 0.0, 10],
  [45, 0.15, 7],
  [55, 0.08, 9],
  [35, 0.3, 6],
  [62, 0.22, 8],
  [50, 0.4, 6],
  [40, 0.1, 7],
];

export default function SaisenRitual({ quickMode, onComplete, onInsufficient, spend }: SaisenRitualProps) {
  const spentRef  = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    if (!spentRef.current) {
      spentRef.current = true;
      if (!spend()) {
        failedRef.current = true;
        onInsufficient();
      }
    }
    if (failedRef.current) return;
    const t = setTimeout(onComplete, quickMode ? 300 : 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (quickMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 rounded-3xl overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(40,25,10,0.97) 0%, rgba(10,7,3,0.99) 100%)",
      }}
    >
      {/* Saisen box image + falling sparks */}
      <div className="relative">
        {/* Falling sparks */}
        {SPARKS.map(([left, delay, size], i) => (
          <motion.div
            key={i}
            className="absolute top-[-24px] pointer-events-none"
            style={{ left: `${left}%` }}
            initial={{ y: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: 60, opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
            transition={{ delay: 0.4 + delay, duration: 0.7, ease: "easeIn" }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L13.8 8.4H20.5L15.1 12.3L17.1 18.7L12 14.9L6.9 18.7L8.9 12.3L3.5 8.4H10.2Z"
                fill="rgba(212,168,89,0.9)"
              />
            </svg>
          </motion.div>
        ))}

        {/* Saisen box */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            width: "min(72vw, 280px)",
            aspectRatio: "1 / 1",
            border: "1px solid rgba(212,168,89,0.35)",
            boxShadow: "0 0 60px rgba(212,168,89,0.18), 0 0 120px rgba(180,130,50,0.1)",
          }}
        >
          <Image
            src="/assets/月神賽錢箱.jpg"
            alt="月神賽錢箱"
            fill
            className="object-cover"
            sizes="(max-width: 600px) 72vw, 280px"
          />
        </motion.div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2 px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ color: "rgba(240,225,190,0.9)", fontSize: 14, letterSpacing: "0.18em", fontWeight: 300 }}
        >
          聆聽，那是命運落下的聲音。
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          style={{ color: "rgba(212,168,89,0.5)", fontSize: 11, letterSpacing: "0.12em" }}
        >
          — 1 曜刻 —
        </motion.p>
      </div>
    </motion.div>
  );
}
