"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import PortalTour from "@/components/ui/PortalTour";

/**
 * Portal — the entry point. Two doors, two personas, one world left
 * deliberately unexplained: the shared identity behind Cynthia and 月乃 is
 * never stated here. The visitor simply chooses where to look inward.
 *
 * An optional guided tour (PortalTour) walks visitors through both shops
 * and all six Sacred Realms before they pick a door — explicitly
 * opt-in (a button, not an auto-play-on-load takeover) so repeat visitors
 * aren't forced through it every time.
 */

interface Door {
  href: string;
  title: string;
  tagline: string;
  image: string;
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
    image: "/assets/月神神社.png",
    glow: "rgba(212,168,89,0.35)",
  },
];

export default function PortalPage() {
  const [showTour, setShowTour] = useState(false);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 15%, rgba(45,31,74,0.5) 0%, #0a0712 70%)",
      }}
    >
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-[0_0_28px_rgba(212,168,89,0.35)]">
          <Image src="/assets/logo-circle.png" alt="Moon Tarot" fill className="object-cover" sizes="96px" priority />
        </div>
        <p className="text-morandi-lavender/50 text-xs tracking-[0.3em] uppercase">
          夜色之下
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-cream-100 mt-2">
          選一扇門
        </h1>
        <p className="text-morandi-stone/45 text-sm mt-3">
          兩個能讓你向內尋找答案的地方
        </p>
        <motion.button
          onClick={() => setShowTour(true)}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: [
              "0 0 0px rgba(212,168,89,0)",
              "0 0 22px rgba(212,168,89,0.35)",
              "0 0 0px rgba(212,168,89,0)",
            ],
          }}
          transition={{
            opacity: { delay: 0.45, duration: 0.5 },
            y: { delay: 0.45, duration: 0.5 },
            boxShadow: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 26px rgba(212,168,89,0.45)" }}
          whileTap={{ scale: 0.97 }}
          className="mt-5 px-7 py-3 rounded-full border border-morandi-gold/45 bg-morandi-gold/12 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/22 hover:border-morandi-gold/65 transition-colors duration-300"
        >
          🪄 先帶我參觀一下
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showTour && <PortalTour onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-5 md:gap-6">
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
                <Image
                  src={door.image}
                  alt={door.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i === 0}
                />

                {/* legibility gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,7,18,0.92) 0%, rgba(10,7,18,0.35) 45%, rgba(10,7,18,0.05) 70%)",
                  }}
                />

                {/* hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 80px ${door.glow}`,
                  }}
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
    </main>
  );
}
