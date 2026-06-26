"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import PortalTour from "@/components/ui/PortalTour";
import UserGuide from "@/components/ui/UserGuide";
import FullscreenButton from "@/components/ui/FullscreenButton";
import DeveloperBubble from "@/components/ui/DeveloperBubble";
import TokenDisplay from "@/components/ui/TokenDisplay";

interface Door {
  href: string;
  title: string;
  tagline: string;
  image?: string;
  gradient?: string;
  glow: string;
}

const DOORS: Door[] = [
  {
    href: "/tarot",
    title: "月之塔羅店鋪",
    tagline: "燭光與紙牌 · 在故事裡看見自己",
    image: "/assets/月之塔羅店鋪.png",
    glow: "rgba(184,168,200,0.35)",
  },
  {
    href: "/shrine",
    title: "月神神社",
    tagline: "籤詩與月光 · 在儀式裡安放心事",
    image: "/assets/月神神社.jpg",
    glow: "rgba(212,168,89,0.35)",
  },
  {
    href: "/garden",
    title: "眾神之庭",
    tagline: "星象與神諭 · 在群星之下找到你的方向",
    image: "/assets/眾神之庭.jpg",
    glow: "rgba(120,80,220,0.40)",
  },
  {
    href: "/stories",
    title: "月神天啟",
    tagline: "群星與日常．在命運流轉中尋回羈絆",
    image: "/assets/Stories/封面.jpg",
    glow: "rgba(168,120,230,0.35)",
  },
];

const STAR_POSITIONS = [
  { left: "48%", top: "7%",  size: 1.5, opacity: 0.26 },
  { left: "85%", top: "60%", size: 1,   opacity: 0.19 },
  { left: "12%", top: "33%", size: 2,   opacity: 0.33 },
  { left: "63%", top: "18%", size: 1,   opacity: 0.12 },
  { left: "31%", top: "74%", size: 1.5, opacity: 0.19 },
  { left: "77%", top: "42%", size: 1,   opacity: 0.26 },
  { left: "24%", top: "15%", size: 2,   opacity: 0.12 },
  { left: "91%", top: "28%", size: 1,   opacity: 0.33 },
  { left: "55%", top: "65%", size: 1.5, opacity: 0.19 },
  { left: "8%",  top: "52%", size: 1,   opacity: 0.26 },
  { left: "70%", top: "80%", size: 2,   opacity: 0.12 },
  { left: "40%", top: "38%", size: 1,   opacity: 0.33 },
  { left: "16%", top: "88%", size: 1.5, opacity: 0.19 },
  { left: "82%", top: "10%", size: 1,   opacity: 0.26 },
  { left: "35%", top: "55%", size: 2,   opacity: 0.12 },
  { left: "60%", top: "25%", size: 1,   opacity: 0.33 },
  { left: "5%",  top: "70%", size: 1.5, opacity: 0.19 },
  { left: "93%", top: "45%", size: 1,   opacity: 0.26 },
  { left: "28%", top: "12%", size: 2,   opacity: 0.12 },
  { left: "74%", top: "58%", size: 1,   opacity: 0.33 },
];

export default function PortalPage() {
  const [showTour, setShowTour] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 15%, rgba(45,31,74,0.5) 0%, #0a0712 70%)",
      }}
    >
      <FullscreenButton borderColor="morandi-lavender" />

      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-[0_0_28px_rgba(212,168,89,0.35)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Image src="/assets/logo-circle.png" alt="Moon Tarot" fill className="object-cover" sizes="96px" priority />
        </motion.div>
        <p className="text-morandi-lavender/50 text-xs tracking-[0.3em] uppercase">
          夜色之下
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-cream-100 mt-2">
          選一扇門
        </h1>
        <p className="text-morandi-stone/45 text-sm mt-3">
          這裡是讓你向內尋找答案的地方
        </p>

        <motion.div
          className="mt-4 flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <button
            onClick={() => setShowTokenInfo(v => !v)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/20 bg-black/20 hover:border-amber-300/40 hover:bg-black/30 transition-colors duration-200"
            aria-label="曜刻說明"
          >
            <TokenDisplay />
            <span className="text-amber-300/50 text-[10px] tracking-widest ml-0.5">?</span>
          </button>

          <AnimatePresence>
            {showTokenInfo && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-1 max-w-xs rounded-2xl px-5 py-4 text-center"
                style={{
                  background: "rgba(22,14,8,0.92)",
                  border: "1px solid rgba(212,168,89,0.18)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <p className="text-amber-300/95 text-sm tracking-widest mb-3">✶ 曜刻 ✶</p>
                <p className="text-cream-100/90 text-sm leading-relaxed" style={{ letterSpacing: "0.06em" }}>
                  星體交會、命運閃耀的瞬間。<br />
                  在月之神社的世界裡，時間不是流逝的，<br />
                  而是凝聚成一枚枚散發微光的金色星芒，<br />
                  用來與神明、命運交換指引。
                </p>
                <div className="mt-3 pt-3 flex flex-col gap-1" style={{ borderTop: "1px solid rgba(212,168,89,0.12)" }}>
                  <p className="text-amber-300/90 text-sm tracking-wide">每日 00:00 補充 +20 曜刻</p>
                  <p className="text-cream-200/65 text-xs">塔羅占卜 / 神社抽籤 各 −1 曜刻</p>
                  <p className="text-cream-200/45 text-xs">未用完自動累積</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-5 flex items-center gap-3 flex-wrap justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowGuide(true)}
            animate={{
              boxShadow: [
                "0 0 0px rgba(212,168,89,0)",
                "0 0 22px rgba(212,168,89,0.40)",
                "0 0 0px rgba(212,168,89,0)",
              ],
            }}
            transition={{ boxShadow: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 26px rgba(212,168,89,0.50)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3 rounded-full border border-morandi-gold/50 bg-morandi-gold/14 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/24 hover:border-morandi-gold/70 transition-colors duration-300"
          >
            📖 使用教學
          </motion.button>
          <motion.button
            onClick={() => setShowTour(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-3 rounded-full border border-cream-200/18 text-cream-200/55 text-sm tracking-widest hover:border-cream-200/35 hover:text-cream-200/80 transition-colors duration-300"
          >
            ✦ 與月神相約
          </motion.button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showTour && <PortalTour onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-5 md:gap-6">
        {DOORS.map((door, i) => (
          <motion.div
            key={door.href}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.15 + i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-1"
          >
            <Link href={door.href} className="group block">
              <motion.div
                className="relative w-full rounded-3xl overflow-hidden border"
                style={{
                  height: "min(60vh, 480px)",
                  borderColor: "rgba(184,168,200,0.15)",
                }}
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {door.image ? (
                  <Image
                    src={door.image}
                    alt={door.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: door.gradient }}
                  >
                    {STAR_POSITIONS.map((star, si) => (
                      <div
                        key={si}
                        className="absolute rounded-full bg-white"
                        style={{
                          width: star.size,
                          height: star.size,
                          left: star.left,
                          top: star.top,
                          opacity: star.opacity,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,7,18,0.92) 0%, rgba(10,7,18,0.35) 45%, rgba(10,7,18,0.05) 70%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 80px ${door.glow}` }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                  <h2 className="font-serif text-2xl text-cream-100 tracking-wide">
                    {door.title}
                  </h2>
                  <p className="text-cream-200/60 text-sm mt-2">{door.tagline}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="mt-10 text-center text-morandi-stone/65 text-[11px] tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Developed by{" "}
        <a
          href="https://ca-portfolio.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-morandi-stone/60 transition-colors duration-200"
        >
          CA
        </a>
        <br />
        © 2026 AI MOON TAROT · All rights reserved.
      </motion.p>

      <DeveloperBubble hidden={showGuide || showTour} />
    </main>
  );
}
