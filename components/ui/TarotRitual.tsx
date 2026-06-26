"use client";

/**
 * TarotRitual — entry ritual for 月之塔羅店鋪.
 *
 * Two-phase sequence:
 *   Phase 0 (1.8 s): 塔羅收款箱 — spend 1 曜刻, falling star sparks
 *   Phase 1 (1.6 s): 塔羅敞開大門 — doors open, enter the shop
 *
 * In quick mode the whole thing resolves in 0.4 s.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface TarotRitualProps {
  quickMode: boolean;
  onComplete: () => void;
  onInsufficient: () => void;
  spend: () => boolean;
}

const SPARKS: [number, number, number][] = [
  [30, 0.0, 9],
  [44, 0.12, 7],
  [56, 0.06, 10],
  [38, 0.25, 6],
  [63, 0.18, 8],
  [50, 0.35, 7],
  [42, 0.08, 6],
];

export default function TarotRitual({ quickMode, onComplete, onInsufficient, spend }: TarotRitualProps) {
  const spentRef  = useRef(false);
  const failedRef = useRef(false);
  const [phase, setPhase] = useState<0 | 1>(0);

  useEffect(() => {
    if (!spentRef.current) {
      spentRef.current = true;
      if (!spend()) {
        failedRef.current = true;
        onInsufficient();
      }
    }
    if (failedRef.current) return;

    if (quickMode) {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }

    // Phase 0 → Phase 1 after 1.9 s
    const t1 = setTimeout(() => setPhase(1), 2500);
    // Phase 1 → complete after additional 1.7 s
    const t2 = setTimeout(onComplete, 2500 + 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (quickMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 rounded-3xl overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(22,12,40,0.98) 0%, rgba(6,3,14,0.99) 100%)",
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── Phase 0: 收款箱 ── */}
        {phase === 0 && (
          <motion.div
            key="phase-box"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Sparks + image */}
            <div className="relative">
              {SPARKS.map(([left, delay, size], i) => (
                <motion.div
                  key={i}
                  className="absolute top-[-28px] pointer-events-none"
                  style={{ left: `${left}%` }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: 70, opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.7] }}
                  transition={{ delay: 0.35 + delay, duration: 0.65, ease: "easeIn" }}
                >
                  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.8 8.4H20.5L15.1 12.3L17.1 18.7L12 14.9L6.9 18.7L8.9 12.3L3.5 8.4H10.2Z" fill="rgba(212,168,89,0.92)" />
                  </svg>
                </motion.div>
              ))}

              <motion.div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: "min(60vw, 220px)", aspectRatio: "1 / 1",
                  border: "1px solid rgba(184,140,60,0.35)",
                  boxShadow: "0 0 48px rgba(212,168,89,0.18)",
                }}
              >
                <Image src="/assets/塔羅收款箱.jpg" alt="投入曜刻" fill className="object-cover" sizes="(max-width: 600px) 60vw, 220px" />
              </motion.div>
            </div>

            {/* Text */}
            <div className="flex flex-col items-center gap-2 text-center px-8">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{ color: "rgba(240,225,190,0.9)", fontSize: 15, letterSpacing: "0.18em", fontWeight: 300 }}
              >
                以星芒為引，窺探命運的軌跡。
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                style={{ color: "rgba(212,168,89,0.5)", fontSize: 11, letterSpacing: "0.12em" }}
              >
                — 1 曜刻 —
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ── Phase 1: 大門敞開 ── */}
        {phase === 1 && (
          <motion.div
            key="phase-door"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden"
              style={{
                width: "min(88vw, 380px)", aspectRatio: "1 / 1",
                border: "1px solid rgba(184,168,200,0.3)",
                boxShadow: "0 0 80px rgba(184,140,220,0.22), 0 0 160px rgba(140,100,200,0.12)",
              }}
              initial={{ scale: 0.88 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src="/assets/塔羅敞開大門.jpg" alt="塔羅大門" fill className="object-cover" sizes="(max-width: 600px) 88vw, 380px" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ color: "rgba(220,210,235,0.85)", fontSize: 14, letterSpacing: "0.2em", fontWeight: 300 }}
            >
              命運的門，為你敞開。
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
