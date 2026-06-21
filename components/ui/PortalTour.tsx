"use client";

/**
 * PortalTour — a guided, auto-advancing tour shown from the portal page
 * before the visitor picks a door. Walks through both shops (group
 * photos) and all six Sacred Realms ("這裡的主人是...") so the locked,
 * member-only souls get a proper introduction before anyone hits a 🔒
 * badge in the avatar selector — the tour is the sales pitch for why
 * membership is worth it.
 *
 * Realm slide content is derived from lib/omikuji/avatars.ts (each
 * persona's own image/tagline/quote), not duplicated here — adding an
 * 8th soul later means it shows up in the tour automatically as long as
 * it has a `region`.
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import { OMIKUJI_AVATARS } from "@/lib/omikuji/avatars";

interface Slide {
  image: string;
  kicker: string;
  title: string;
  body: string;
  portrait?: string;
  isMember?: boolean;
  /** romanized name shown alongside the Chinese display name, e.g.
   * "天城月乃（Tsukino）" — pulled from each avatar's own `englishName`
   * field, never the cross-shop alias. Shop-intro slides have none. */
  englishName?: string;
  /** one-line specialty, e.g. "療癒焦慮內耗" — from `bestFor`. */
  bestFor?: string;
}

const SHOP_SLIDES: Slide[] = [
  {
    image: "/assets/月之塔羅店合照.png",
    kicker: "西洋塔羅線",
    title: "月之塔羅店鋪",
    body: "在向內尋找答案之前，先來看看這裡。七位風格迥異的塔羅師輪流坐鎮——有人溫柔，有人犀利，但沒有一位會替你下命運的判決。",
  },
  {
    image: "/assets/月神神社大合照.png",
    kicker: "東方神社線",
    title: "月神神社",
    body: "穿過鳥居往裡走，是月神神社。七位解籤師各自守著一方天地，用籤詩回應每個深夜捎來的心事。",
  },
];

// Tsukino has no `region` (she's the shared default home base, not one of
// the six Sacred Realms) but she's the shrine's actual host — introduce
// her by name, right after the shrine's group photo, before the six
// souls who serve alongside her. Pulled from her own registry entry
// (not fabricated copy) so it stays in sync if her bio ever changes.
const tsukino = OMIKUJI_AVATARS.find((a) => a.id === "tsukino");
const tsukinoSlide: Slide[] = tsukino
  ? [
      {
        image: "/assets/月神神社.png",
        kicker: "月神的化身 · 神社主人",
        title: `這裡的主人是 ${tsukino.displayName}`,
        body: `${tsukino.tagline} ——「${tsukino.quoteLines.join("")}」`,
        portrait: tsukino.image,
        englishName: tsukino.englishName,
        bestFor: tsukino.bestFor,
      },
    ]
  : [];

const realmSlides: Slide[] = OMIKUJI_AVATARS.filter((a) => a.region).map((a) => ({
  image: a.region!.image,
  kicker: a.region!.title,
  title: `這裡的主人是 ${a.displayName}`,
  body: `${a.tagline} ——「${a.quoteLines.join("")}」`,
  portrait: a.image,
  isMember: a.isMember,
  englishName: a.englishName,
  bestFor: a.bestFor,
}));

const SLIDES: Slide[] = [...SHOP_SLIDES, ...tsukinoSlide, ...realmSlides];
const AUTO_ADVANCE_MS = 7000;

interface PortalTourProps {
  onClose: () => void;
}

export default function PortalTour({ onClose }: PortalTourProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const next = useCallback(() => {
    setIndex((i) => (i + 1 >= SLIDES.length ? i : i + 1));
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-advance, reset whenever the slide changes (manual nav included)
  useEffect(() => {
    if (isLast) return;
    const t = window.setTimeout(next, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [index, isLast, next]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#08060e" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* solid backdrop so the portal page never peeks through during the
          mid-crossfade moment where the outgoing slide has faded to 0
          opacity and the incoming one hasn't faded in yet. Outer wrapper's
          own fade is now quick (0.2s) — it used to fade in parallel with
          the first slide's own 0.7s fade, and since opacity multiplies,
          that doubled up into a noticeably slow reveal on open. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(8,6,14,0.95) 0%, rgba(8,6,14,0.55) 45%, rgba(8,6,14,0.25) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 px-3.5 py-1.5 rounded-full border border-cream-200/25 bg-black/35 backdrop-blur-sm text-cream-200/80 hover:text-cream-100 hover:border-cream-200/45 text-xs tracking-widest transition-colors duration-200"
      >
        ✕ 跳過導覽
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-6 px-6 pb-12 pt-24 sm:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl flex flex-col items-center text-center gap-3"
          >
            {slide.portrait && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-cream-200/30 shadow-[0_0_20px_rgba(255,255,255,0.15)] mb-1">
                <Image src={slide.portrait} alt={slide.title} fill className="object-cover object-top" sizes="64px" />
              </div>
            )}
            <p className="text-cream-300/55 text-[11px] tracking-[0.3em] uppercase flex items-center gap-2">
              {slide.kicker}
              {slide.isMember && (
                <span className="text-amber-200/80 bg-black/40 rounded-full px-2 py-0.5 text-[10px] tracking-wide">
                  🔒 會員限定
                </span>
              )}
            </p>
            <h2 className="font-serif text-2xl text-cream-100">
              {slide.title}
              {slide.englishName && (
                <span className="text-cream-200/45 font-sans text-base tracking-wide ml-2">
                  ({slide.englishName})
                </span>
              )}
            </h2>
            {slide.bestFor && (
              <p className="text-amber-200/70 text-xs tracking-wide">✦ 擅長：{slide.bestFor}</p>
            )}
            <p className="text-cream-200/75 text-sm leading-relaxed max-w-md">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* progress dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? "18px" : "6px",
                height: "6px",
                background: i === index ? "rgba(212,168,89,0.9)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={index === 0}
            className="px-4 py-2 rounded-full border border-cream-200/20 text-cream-200/60 text-xs tracking-widest hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-200 disabled:opacity-30"
          >
            ← 上一個
          </button>
          {isLast ? (
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-full border border-morandi-gold/50 bg-morandi-gold/15 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/25 transition-colors duration-300"
            >
              選一扇門，開始你的旅程
            </motion.button>
          ) : (
            <button
              onClick={next}
              className="px-4 py-2 rounded-full border border-cream-200/20 text-cream-200/60 text-xs tracking-widest hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-200"
            >
              下一個 →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
