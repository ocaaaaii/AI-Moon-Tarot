"use client";

import { motion } from "motion/react";

import { QUOTE_COPY } from "@/lib/landing/sections";

/** new → waxing → gibbous → full, drawn with an inset shadow (no images) */
const PHASES = [0, 0.35, 0.7, 1];

export default function QuoteBand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 pt-24 md:pt-32 pb-16 text-center"
    >
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className="h-px w-16 md:w-28 bg-gradient-to-r from-transparent to-morandi-gold/25" />
        <span className="text-morandi-gold/40 text-xs">✦</span>
        <span className="h-px w-16 md:w-28 bg-gradient-to-l from-transparent to-morandi-gold/25" />
      </div>

      <p
        className="font-quote italic text-cream-100/85 mx-auto max-w-2xl"
        style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: 300, letterSpacing: "0.06em" }}
      >
        “{QUOTE_COPY.en}”
      </p>

      <div className="mt-8 flex items-center justify-center gap-4" aria-hidden>
        {PHASES.map(phase => (
          <span
            key={phase}
            className="block w-3 h-3 rounded-full"
            style={{
              border: "1px solid rgba(233,205,140,0.55)",
              // shifting the inset shadow sideways carves the crescent
              boxShadow: `inset ${(1 - phase) * 9}px 0 0 0 rgba(10,7,18,0.92)`,
              background: "rgba(233,205,140,0.8)",
            }}
          />
        ))}
      </div>

      <p className="text-cream-200/55 text-xs md:text-sm mt-8" style={{ letterSpacing: "0.14em" }}>
        {QUOTE_COPY.zh}
      </p>
    </motion.div>
  );
}
