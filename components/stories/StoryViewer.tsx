"use client";

/**
 * StoryViewer — the cinematic slideshow for 月神天啟 (Sacred Chronicles).
 * All three motion effects requested are built on motion/react alone (no
 * GSAP) — the project's one existing animation library already covers
 * everything here, so there's no reason to add a second one:
 *
 *   1. Zoom & fade transition — outgoing image scales up slightly while
 *      fading out (like a dream dissolving); incoming image starts at
 *      scale 0.95 + a soft star-glow burst, settling to scale 1.
 *   2. Parallax text — the dialogue box animates in ~0.2s *after* the
 *      image, easing up from blur(8px) to blur(0), so image and text
 *      move at different speeds (the actual source of the parallax
 *      depth feeling, not a literal 3D offset).
 *   3. Ambient glow sync — a radial-gradient glow behind everything
 *      smoothly retunes its color per-slide (warm gold for cozy beats,
 *      starry purple for divine ones), via `glowRGB` on each slide.
 *
 * Manual pacing on purpose — unlike PortalTour (which auto-advances
 * because it's a sales pitch you can skip), this is narrative content the
 * reader should move through at their own pace. Tap the left/right thirds
 * of the image, the prev/next buttons, or arrow keys.
 */

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import type { Story } from "@/lib/stories/types";

interface StoryViewerProps {
  story: Story;
  /** Where "← 返回篇章" and "回到篇章列表" should link. Defaults to /stories. */
  backHref?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as number[];

export default function StoryViewer({ story, backHref = "/stories" }: StoryViewerProps) {
  const [index, setIndex] = useState(0);
  const slide = story.slides[index];
  const isFirst = index === 0;
  const isLast = index === story.slides.length - 1;

  const next = useCallback(() => {
    setIndex((i) => Math.min(story.slides.length - 1, i + 1));
  }, [story.slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard nav for desktop readers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Warm the next/prev images so advancing never shows a blank flash —
  // same lesson learned from PortalTour's slow-image complaint.
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const s = story.slides[i];
      if (s) {
        const img = new window.Image();
        img.src = s.image;
      }
    });
  }, [index, story.slides]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-mystic-deep">
      {/* Ambient glow sync — retunes color smoothly per slide via a plain
          CSS transition on the gradient (animating a gradient string
          directly isn't supported by motion's animate, so a long
          transition-[background] duration does the same "breathing" job). */}
      <div
        className="absolute inset-0 transition-[background] duration-[1400ms] ease-in-out"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 30%, rgba(${slide.glowRGB},0.28) 0%, #0a0712 75%)`,
        }}
      />

      <Link
        href={backHref}
        className="fixed top-4 left-4 z-30 px-3.5 py-1.5 rounded-full border border-morandi-lavender/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-morandi-lavender/50 text-xs tracking-widest transition-colors duration-300"
      >
        ← 返回篇章
      </Link>

      <p className="fixed top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm text-cream-200/60 text-xs tracking-wide">
        {index + 1} / {story.slides.length}
      </p>

      {/* Stage — image fills most of the viewport, dialogue box overlays
          its lower portion */}
      <div className="relative w-full max-w-3xl mx-auto" style={{ height: "min(86vh, 860px)" }}>
        <AnimatePresence>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 860px"
              quality={92}
              priority={index === 0}
            />
            {/* soft star-glow burst on entry — quick, fades fast, never
                lingers once the image has settled */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              style={{
                background: `radial-gradient(circle at 50% 38%, rgba(255,255,255,0.5) 0%, rgba(${slide.glowRGB},0.15) 35%, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,6,14,0.92) 0%, rgba(8,6,14,0.45) 38%, rgba(8,6,14,0.05) 65%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Tap zones — left/right thirds advance the story, mirroring a
            visual-novel reader; buttons below cover the same actions for
            anyone who'd rather click/tap a labeled control. */}
        <button
          aria-label="上一段"
          onClick={prev}
          disabled={isFirst}
          className="absolute inset-y-0 left-0 w-1/3 z-10 disabled:cursor-default"
        />
        <button
          aria-label="下一段"
          onClick={next}
          disabled={isLast}
          className="absolute inset-y-0 right-0 w-1/3 z-10 disabled:cursor-default"
        />

        {/* Dialogue box — parallax: starts 0.2s after the image, eases up
            from a blur, so it visibly trails the image's own motion. */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
              className="flex flex-col gap-2"
            >
              {slide.act && (
                <p className="text-amber-200/80 text-[11px] tracking-[0.25em] uppercase">
                  {slide.act}
                </p>
              )}
              <div
                className="rounded-2xl px-4 py-3 sm:px-5 sm:py-4"
                style={{
                  // Lighter than before (was 0.78) — let more of the CG art
                  // show through behind the text instead of fully masking
                  // it. The text-shadow below keeps legibility now that
                  // the backing is mostly see-through.
                  background: "rgba(18,12,32,0.38)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid rgba(${slide.glowRGB},0.25)`,
                }}
              >
                <p
                  className="text-cream-100 text-sm sm:text-base leading-relaxed"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
                >
                  {slide.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {story.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`第 ${i + 1} 段`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? "16px" : "6px",
                  height: "6px",
                  background: i === index ? `rgba(${slide.glowRGB},0.9)` : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>

          {/* explicit controls, mirrored under the tap zones for clarity */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={prev}
              disabled={isFirst}
              className="px-4 py-2 rounded-full border border-cream-200/20 text-cream-200/60 text-xs tracking-widest hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-200 disabled:opacity-30"
            >
              ← 上一段
            </button>
            {isLast ? (
              <Link
                href={backHref}
                className="px-6 py-2.5 rounded-full border border-morandi-gold/50 bg-morandi-gold/15 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/25 transition-colors duration-300"
              >
                回到篇章列表
              </Link>
            ) : (
              <button
                onClick={next}
                className="px-4 py-2 rounded-full border border-cream-200/20 text-cream-200/60 text-xs tracking-widest hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-200"
              >
                下一段 →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
