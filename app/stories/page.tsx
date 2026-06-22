"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { STORIES } from "@/lib/stories/stories";

/**
 * 月神天啟 (Sacred Chronicles) — story selector. Lists whatever's in
 * lib/stories/stories.ts; adding story2/story3 later means adding a
 * registry entry there, not touching this page.
 *
 * 月幣/御守 unlock flow is intentionally not built — see lib/stories/types.ts.
 * Every story here is freely viewable for now.
 */
export default function StoriesPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background: "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(74,61,31,0.4) 0%, #0a0712 100%)",
      }}
    >
      <Link
        href="/"
        className="fixed top-4 left-4 z-20 px-3.5 py-1.5 rounded-full border border-morandi-gold/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-morandi-gold/50 text-xs tracking-widest transition-colors duration-300"
      >
        ← 回到入口
      </Link>

      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-gold/55 text-xs tracking-[0.3em] uppercase">月神天啟</p>
        <h1 className="font-serif text-3xl md:text-4xl text-cream-100 mt-2">神諭篇章</h1>
        <p className="text-morandi-stone/45 text-sm mt-3">群星與日常．在命運流轉中尋回羈絆</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {STORIES.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/stories/${story.id}`} className="group block">
              <motion.div
                className="relative w-full rounded-3xl overflow-hidden border"
                style={{ aspectRatio: "3/4", borderColor: "rgba(212,168,89,0.18)" }}
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={story.cover}
                  alt={story.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(10,7,18,0.92) 0%, rgba(10,7,18,0.3) 50%, transparent 75%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                  <h2 className="font-serif text-xl text-cream-100 tracking-wide">{story.title}</h2>
                  <p className="text-cream-200/60 text-xs mt-2 leading-relaxed">{story.tagline}</p>
                  <p className="text-morandi-gold/70 text-[11px] tracking-widest mt-3">
                    點擊閱讀
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
