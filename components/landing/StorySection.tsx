"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { STORY_COPY } from "@/lib/landing/sections";

/** Teaser for 月神天啟 — the CG story viewer at /stories. */
export default function StorySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-14"
    >
      <div className="w-full max-w-[280px] md:max-w-none md:w-[38%] shrink-0">
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(212,168,89,0.3)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          <img
            src={STORY_COPY.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(10,7,18,0.5) 0%, transparent 45%)" }}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center md:text-left">
        <p className="font-display text-cream-200/50 text-[11px] tracking-[0.42em] uppercase">
          {STORY_COPY.kicker}
        </p>
        <h2
          className="font-serif text-cream-50 mt-4"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)", letterSpacing: "0.1em" }}
        >
          {STORY_COPY.heading}
        </h2>

        <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-morandi-gold/35" />
          <span className="text-morandi-gold/45 text-xs">✦</span>
        </div>

        <p
          className="text-cream-100/72 text-sm md:text-base mt-6"
          style={{ lineHeight: 2, letterSpacing: "0.04em" }}
        >
          {STORY_COPY.body}
        </p>

        <Link
          href={STORY_COPY.ctaHref}
          className="inline-block mt-8 px-7 py-3 rounded-full border border-morandi-gold/40 bg-morandi-gold/10 text-cream-100 text-sm tracking-[0.18em] hover:bg-morandi-gold/20 hover:border-morandi-gold/65 transition-colors duration-300"
        >
          {STORY_COPY.ctaLabel} →
        </Link>
      </div>
    </motion.div>
  );
}
