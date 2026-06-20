"use client";

import Image from "next/image";
import { motion } from "motion/react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as number[], delay },
});

/**
 * TsukinoProfile — the shrine's left-column character panel, mirroring
 * components/ui/CynthiaProfile.tsx's structure (hero portrait, bio, trait
 * list, closing quote) so /tarot and /shrine share the same level of polish.
 *
 * This is the one place in the app where the Cynthia ↔ 天城月乃 shared-identity
 * lore is allowed to surface — the portal page (app/page.tsx) deliberately
 * keeps it hidden, but here, inside her own shrine introduction, the reveal
 * belongs.
 */
export default function TsukinoProfile() {
  return (
    <div className="flex flex-col">

      {/* ── Hero image ── */}
      <motion.div
        className="relative w-full flex-shrink-0"
        style={{ height: "300px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Image
          src="/assets/Tsukino.png"
          alt="天城月乃"
          fill
          className="object-cover object-top"
          sizes="288px"
          priority
        />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to bottom, rgba(15,10,26,0.1) 0%, rgba(15,10,26,0) 30%, rgba(15,10,26,0.55) 72%, rgba(15,10,26,1) 100%)",
        }} />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to right, rgba(15,10,26,0.35) 0%, transparent 25%, transparent 75%, rgba(15,10,26,0.35) 100%)",
        }} />

        <motion.div
          className="absolute bottom-5 left-0 right-0 text-center z-10 px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber-200/40 text-[9px] tracking-[0.45em] uppercase mb-2">
            月 神 神 社
          </p>
          <h2 className="font-serif text-2xl text-cream-100 tracking-[0.15em]"
            style={{ textShadow: "0 2px 20px rgba(212,168,89,0.4)" }}>
            天城月乃
          </h2>
          <p className="text-cream-300/50 text-[11px] tracking-widest mt-1.5 font-light">
            🌙 籤詩問事 · 神社的解籤人
          </p>
        </motion.div>
      </motion.div>

      {/* ── Description ── */}
      <div className="px-6 pt-4 pb-5 flex flex-col gap-4">
        <motion.p
          className="text-cream-200/55 text-xs leading-[1.9] font-light text-center"
          {...fadeUp(0.65)}
        >
          我不算命，我陪你<br />
          把心裡已經知道的答案，慢慢說出來。
        </motion.p>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-morandi-gold/20" />
          <span className="text-morandi-gold/35 text-xs">⛩</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-morandi-gold/20" />
        </motion.div>

        {/* Personality traits — stagger */}
        <div className="flex flex-col gap-2">
          {[
            { icon: "🍵", label: "說話慢慢的，像泡開的一壺茶" },
            { icon: "📜", label: "用最簡單的故事，說懂最複雜的籤詩" },
            { icon: "🌙", label: "把答案，留在你自己心裡" },
          ].map(({ icon, label }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-sm opacity-55">{icon}</span>
              <span className="text-morandi-stone/55 text-xs">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* The Cynthia ↔ 天城月乃 reveal — lives only here */}
        <motion.div className="pt-1" {...fadeUp(1.05)}>
          <p className="text-morandi-stone/40 text-[11px] leading-relaxed text-center">
            她在月之塔羅店鋪以「Cynthia」之名說故事，那是月亮女神的稱號；
            走進這座神社才會知道，她真正的名字是<span className="text-amber-200/60">天城 月乃</span>。
          </p>
        </motion.div>

        <motion.div className="pt-1" {...fadeUp(1.2)}>
          <p className="text-morandi-stone/22 text-[11px] italic text-center leading-relaxed">
            「籤詩不是命運的判決<br />是月光暫時借你的一面鏡子」
          </p>
        </motion.div>
      </div>
    </div>
  );
}
