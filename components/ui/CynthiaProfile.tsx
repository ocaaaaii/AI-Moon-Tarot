"use client";

import Image from "next/image";
import { motion } from "motion/react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as number[], delay },
});

export default function CynthiaProfile() {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Hero image ── */}
      <motion.div
        className="relative w-full flex-shrink-0"
        style={{ height: "360px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Image
          src="/assets/Cynthia.png"
          alt="Cynthia"
          fill
          className="object-cover object-top"
          sizes="288px"
          priority
        />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to bottom, rgba(12,7,22,0.1) 0%, rgba(12,7,22,0) 30%, rgba(12,7,22,0.55) 72%, rgba(12,7,22,1) 100%)",
        }} />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to right, rgba(12,7,22,0.35) 0%, transparent 25%, transparent 75%, rgba(12,7,22,0.35) 100%)",
        }} />

        <motion.div
          className="absolute bottom-5 left-0 right-0 text-center z-10 px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-morandi-lavender/40 text-[9px] tracking-[0.45em] uppercase mb-2">
            A I &nbsp; T A R O T
          </p>
          <h2 className="font-serif text-2xl text-cream-100 tracking-[0.15em]"
            style={{ textShadow: "0 2px 20px rgba(184,168,200,0.4)" }}>
            Cynthia
          </h2>
          <p className="text-cream-300/50 text-[11px] tracking-widest mt-1.5 font-light">
            月之女神 · 以牌為鏡
          </p>
        </motion.div>
      </motion.div>

      {/* ── Description ── */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-5">
        <motion.p
          className="text-cream-200/55 text-xs leading-[1.9] font-light text-center"
          {...fadeUp(0.65)}
        >
          我不預言，我只陪你<br />
          一起看清楚已經在你心裡的事。
        </motion.p>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-morandi-lavender/15" />
          <span className="text-morandi-lavender/25 text-xs">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-morandi-lavender/15" />
        </motion.div>

        {/* Moon phase traits — stagger */}
        <div className="flex flex-col gap-2">
          {[
            { icon: "🌑", label: "看見你藏在黑暗裡的部分" },
            { icon: "🌓", label: "以故事帶你穿過混沌" },
            { icon: "🌕", label: "把力量還回你手中" },
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

        <motion.div className="mt-auto pt-2" {...fadeUp(1.1)}>
          <p className="text-morandi-stone/22 text-[11px] italic text-center leading-relaxed">
            「月亮從不評判潮汐<br />它只是如實照亮」
          </p>
        </motion.div>
      </div>
    </div>
  );
}
