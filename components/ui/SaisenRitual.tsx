"use client";

/**
 * SaisenRitual — entry ritual for 月神神社.
 *
 * Two-phase sequence:
 *   Phase 0 (2.0 s): 月神賽錢箱 — spend 1 曜刻, falling star-sparks
 *   Phase 1 (1.6 s): 神社大門敞開 — gates open, enter the shrine
 *
 * In quick mode the whole thing resolves in 0.3 s.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface SaisenRitualProps {
  quickMode: boolean;
  onComplete: () => void;
  onInsufficient: () => void;
  spend: () => boolean;
}

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
      const t = setTimeout(onComplete, 300);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(onComplete, 2000 + 2000);
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
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 rounded-3xl overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(40,25,10,0.98) 0%, rgba(6,4,2,0.99) 100%)",
      }}
    >
      <AnimatePresence mode="wait">

        {/* Phase 0: Saisen box */}
        {phase === 0 && (
          <motion.div
            key="phase-saisen"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              {SPARKS.map(([left, delay, size], i) => (
                <motion.div
                  key={i}
                  className="absolute top-[-28px] pointer-events-none"
                  style={{ left: `${left}%` }}
                  initial={{ y: 0, opacity: 0, scale: 0.6 }}
                  animate={{ y: 70, opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }}
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
                  alt="投入曜刻"
                  fill
                  className="object-cover"
                  sizes="(max-width: 600px) 72vw, 280px"
                />
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2 px-8 text-center">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{ color: "rgba(240,225,190,0.9)", fontSize: 15, letterSpacing: "0.18em", fontWeight: 300 }}
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
        )}

        {/* Phase 1: Gate opens */}
        {phase === 1 && (
          <motion.div
            key="phase-gate"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden"
              style={{
                width: "min(88vw, 380px)",
                aspectRatio: "1 / 1",
                border: "1px solid rgba(212,168,89,0.25)",
                boxShadow: "0 0 80px rgba(212,168,89,0.2), 0 0 160px rgba(180,130,50,0.1)",
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/assets/神社大門敞開.jpg"
                alt="神社大門"
                fill
                className="object-cover"
                sizes="(max-width: 600px) 88vw, 380px"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ color: "rgba(240,225,190,0.85)", fontSize: 14, letterSpacing: "0.2em", fontWeight: 300 }}
            >
              神明已備妥香火，恭候。
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
