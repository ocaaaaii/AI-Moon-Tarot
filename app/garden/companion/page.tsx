"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { getOmikujiAvatar } from "@/lib/omikuji/avatars";
import { COMPANION_META } from "@/lib/garden/companionPersonas";

const ACCENT_HEX: Record<string, string> = {
  lavender: "#b8a8c8",
  gold: "#d4a859",
  slate: "#8a96a8",
  rose: "#c9a8a0",
  sage: "#a0b0a0",
  mauve: "#b0a0b8",
  stone: "#a89880",
};

export default function CompanionSelectPage() {
  return (
    <main
      className="min-h-screen p-6 md:p-12"
      style={{
        background: "radial-gradient(ellipse 120% 90% at 50% 0%, rgba(30,18,60,0.9) 0%, #060410 65%)",
      }}
    >
      <Link
        href="/garden"
        className="text-morandi-stone/50 hover:text-morandi-stone/80 text-sm tracking-widest transition-colors duration-200"
      >
        ← 眾神之庭
      </Link>

      <motion.div
        className="text-center mt-10 mb-12"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-lavender/40 text-xs tracking-[0.3em] uppercase mb-3">眾神之語</p>
        <h1 className="font-serif text-3xl md:text-4xl text-cream-100 tracking-wide">選一位，去他的領地坐坐</h1>
        <p className="text-morandi-stone/50 text-sm mt-4">不是問事，也不是求解——只是純粹的聊聊天</p>
      </motion.div>

      <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
        {COMPANION_META.map((meta, i) => {
          const avatar = getOmikujiAvatar(meta.id);
          const accentHex = ACCENT_HEX[avatar.accent] ?? "#b8a8c8";
          return (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/garden/companion/${meta.id}`} className="group block">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid rgba(184,168,200,0.14)",
                    background: "rgba(26,16,46,0.55)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
                    <Image
                      src={avatar.image}
                      alt={avatar.displayName}
                      fill
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      sizes="200px"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, transparent 40%, rgba(10,7,20,0.85) 100%)",
                      }}
                    />
                  </div>
                  <div className="px-3 py-3">
                    <p style={{ color: "rgba(245,238,220,0.95)", fontSize: 14, fontWeight: 600 }}>
                      {avatar.displayName}
                    </p>
                    <p style={{ color: accentHex, fontSize: 11, letterSpacing: "0.04em", marginTop: 2 }}>
                      {meta.locationName}
                    </p>
                    <p style={{ color: "rgba(180,165,200,0.45)", fontSize: 10.5, marginTop: 2 }}>{meta.mood}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
