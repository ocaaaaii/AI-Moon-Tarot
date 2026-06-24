"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { getSeriesStories, getSeries } from "@/lib/stories/stories";

/**
 * Static sub-selector for the 《神諭流轉時：塔羅牌背後的七重覺醒》 series.
 *
 * This file lives at app/stories/story2/page.tsx — Next.js gives static
 * routes priority over the dynamic [id] route, so /stories/story2 renders
 * this sub-selector instead of trying to open a single slide viewer.
 *
 * Adding future series: duplicate this file into app/stories/storyN/page.tsx
 * and update the SERIES_ID constant. No router changes needed.
 */

const SERIES_ID = "story2";

// Soul accent colors — one per character, matching the 7-color palette
const CHARACTER_ACCENTS: Record<string, string> = {
  "story2-kanon":   "210,130,155",  // spring rose
  "story2-ushio":   "85,165,195",   // ocean teal
  "story2-maya":    "115,75,195",   // midnight void
  "story2-haruma":  "235,175,55",   // solar amber
  "story2-iori":    "125,165,230",  // wisdom blue
  "story2-akira":   "235,195,115",  // dawn gold
  "story2-tsukino": "195,185,225",  // moon silver
};

export default function Story2SelectorPage() {
  const series = getSeries(SERIES_ID);
  const stories = getSeriesStories(SERIES_ID);

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 md:p-8 pb-16"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 15%, rgba(74,50,120,0.45) 0%, #0a0712 100%)",
      }}
    >
      {/* Back button */}
      <Link
        href="/stories"
        className="fixed top-4 left-4 z-20 px-3.5 py-1.5 rounded-full border border-morandi-gold/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-morandi-gold/50 text-xs tracking-widest transition-colors duration-300"
      >
        ← 返回篇章
      </Link>

      {/* Series header */}
      <motion.div
        className="text-center mt-16 mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-gold/70 text-xs tracking-[0.3em] uppercase mb-4">
          月神天啟 · 第二部
        </p>
        <h1 className="font-serif text-2xl md:text-3xl text-cream-100 tracking-wide leading-snug mb-3">
          {series?.title ?? "神諭流轉時：塔羅牌背後的七重覺醒"}
        </h1>
        <p className="text-cream-200/50 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {series?.tagline}
        </p>
      </motion.div>

      {/* Character grid — 2 cols on mobile, 3-4 on wider screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
        {stories.map((story, i) => {
          const accentRGB = CHARACTER_ACCENTS[story.id] ?? "212,168,89";
          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.07,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link href={`/stories/${story.id}`} className="group block">
                <motion.div
                  className="relative w-full rounded-2xl overflow-hidden border"
                  style={{
                    aspectRatio: "3/4",
                    borderColor: `rgba(${accentRGB},0.22)`,
                    boxShadow: `0 0 0 0 rgba(${accentRGB},0)`,
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 0 28px 4px rgba(${accentRGB},0.22)`,
                    borderColor: `rgba(${accentRGB},0.5)`,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={story.cover}
                    alt={story.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, rgba(10,7,18,0.92) 0%, rgba(10,7,18,0.15) 55%, transparent 80%)`,
                    }}
                  />
                  {/* Accent glow at bottom */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(${accentRGB},0.28) 0%, transparent 70%)`,
                    }}
                  />
                  {/* Text */}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                    <h2 className="font-serif text-sm md:text-base text-cream-100 tracking-wide leading-tight">
                      {story.title}
                    </h2>
                    <p
                      className="text-[10px] mt-1.5 leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: `rgba(${accentRGB},0.9)` }}
                    >
                      {story.tagline}
                    </p>
                    <p
                      className="text-[10px] tracking-widest mt-2 opacity-55 group-hover:opacity-90 transition-opacity duration-300"
                      style={{ color: `rgba(${accentRGB},1)` }}
                    >
                      點擊閱讀
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
