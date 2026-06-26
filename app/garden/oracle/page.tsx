"use client";

import Link from "next/link";
import { motion } from "motion/react";
import PickACardView from "@/components/ui/PickACardView";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OraclePage() {
  return (
    <main className="min-h-screen" style={{ color: "#e8e0f0" }}>

      {/* Back nav + title — narrow container */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-0">
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/garden"
            className="text-morandi-stone/50 hover:text-morandi-stone/80 text-sm tracking-widest transition-colors duration-200"
          >
            ← 眾神之庭
          </Link>
          <div className="flex-1 h-px" style={{ background: "rgba(184,168,200,0.08)" }} />
        </div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl text-cream-100 tracking-wide mb-2">
            週神諭
          </h1>
          <p className="text-morandi-stone/50 text-sm">
            每週一張牌 · 讓宇宙替你說出這週的字
          </p>
        </motion.div>
      </div>

      {/* Pick-a-Card — full viewport width, self-contained */}
      <PickACardView />

      {/* 星座功能 — 施工中 */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
        <motion.div
          className="w-full rounded-2xl flex flex-col items-center justify-center py-10 px-6 text-center"
          style={{ border: "1px dashed rgba(184,168,200,0.15)", background: "rgba(184,168,200,0.03)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-morandi-stone/40 text-xs tracking-[0.25em] mb-3">✦ COMING SOON ✦</p>
          <p className="text-cream-200/50 text-sm tracking-wide">星座週運勢</p>
          <p className="text-morandi-stone/35 text-xs mt-2 leading-relaxed max-w-xs">
            Cynthia 正在觀測星象，<br />這個功能即將在下一個版本與你見面。
          </p>
        </motion.div>
      </div>

    </main>
  );
}
