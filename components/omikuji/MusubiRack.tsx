"use client";

/**
 * MusubiRack — 結籤架
 * The knot-rack that accumulates folded bad-fortune (凶/兇) slips across
 * the session. Each entry that completes its fold animation lands here as
 * a small, gently swaying knot — the ritual container for the negative
 * content allowed by CLAUDE.md's scoped omikuji exception.
 */

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export interface MusubiKnot {
  id: number;
  key: string;
}

interface MusubiRackProps {
  knots: MusubiKnot[];
}

// Approximate (left%, top%) positions along the three rope lines in
// /assets/結籤架.png, in the order knots should fill them.
const ROPE_SLOTS: Array<{ left: string; top: string }> = [
  { left: "30%", top: "39%" }, { left: "50%", top: "39%" }, { left: "70%", top: "39%" },
  { left: "22%", top: "53%" }, { left: "38%", top: "53%" }, { left: "62%", top: "53%" }, { left: "78%", top: "53%" },
  { left: "30%", top: "66%" }, { left: "50%", top: "66%" }, { left: "70%", top: "66%" },
];

export default function MusubiRack({ knots }: MusubiRackProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-morandi-stone/50 text-xs tracking-widest">
        結籤架 · 已寄放 {knots.length} 籤
      </p>
      <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden">
        <Image
          src="/assets/結籤架.png"
          alt="結籤架"
          fill
          className="object-cover select-none pointer-events-none"
          sizes="400px"
        />

        <AnimatePresence initial={false}>
          {knots.map((k, i) => {
            const slot = ROPE_SLOTS[i % ROPE_SLOTS.length];
            return (
              <motion.div
                key={k.key}
                className="absolute"
                style={{ left: slot.left, top: slot.top, transform: "translate(-50%, -50%)" }}
                initial={{ opacity: 0, y: -20, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="select-none"
                  style={{ transformOrigin: "top center" }}
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (k.id % 5) * 0.3,
                  }}
                >
                  {/* a small folded paper slip, tied at the top */}
                  <div className="w-[2px] h-2 bg-cream-100/50 mx-auto" />
                  <div
                    className="w-3.5 h-5 rounded-[1px]"
                    style={{
                      background: "linear-gradient(180deg, #f6efdd 0%, #e3d3ab 100%)",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.55)",
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {knots.length === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-4">
            <p className="text-cream-100/70 text-xs bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              凶籤會摺好掛在這裡，靜靜安放
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
