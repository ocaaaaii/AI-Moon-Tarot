"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import TokenDisplay from "@/components/ui/TokenDisplay";
import { NAV_ITEMS, HERO_COPY, type SectionId } from "@/lib/landing/sections";
import AmbientAudio from "./AmbientAudio";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_IDS: readonly SectionId[] = NAV_ITEMS.map(item => item.id);

/**
 * Anchors scroll from JS rather than `scroll-behavior: smooth`, because
 * ScrollTrigger mis-measures while a CSS smooth scroll is running.
 * `scrollIntoView` still honours each section's `scroll-margin-top`, so the
 * fixed header never covers a heading.
 */
function scrollToSection(id: SectionId): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

interface Props {
  onOpenGuide: () => void;
}

export default function SiteNav({ onOpenGuide }: Props) {
  const active = useScrollSpy(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-40 h-[60px] md:h-[72px] transition-colors duration-500"
        style={{
          // unscrolled, the bar floats over the KV's bright blossoms — a soft
          // top-down scrim keeps the wordmark and anchors readable there
          background: scrolled
            ? "rgba(10,7,18,0.82)"
            : "linear-gradient(to bottom, rgba(10,7,18,0.62) 0%, rgba(10,7,18,0.28) 55%, transparent 100%)",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid rgba(184,168,200,${scrolled ? 0.1 : 0})`,
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* ── wordmark ── */}
          <a
            href="#home"
            onClick={e => {
              e.preventDefault();
              scrollToSection("home");
            }}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <span className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden shadow-[0_0_16px_rgba(212,168,89,0.3)]">
              <Image src="/assets/landing/logo-mark.png" alt="" fill className="object-cover" sizes="36px" />
            </span>
            <span className="font-serif text-cream-100/85 text-sm md:text-base tracking-[0.22em] group-hover:text-cream-50 transition-colors duration-300">
              MOON TAROT
            </span>
          </a>

          {/* ── anchors (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map(item => {
              const on = active === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={e => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className="relative py-1 text-[11px] tracking-[0.28em] transition-colors duration-300"
                  style={{ color: on ? "rgba(249,243,227,0.9)" : "rgba(242,232,204,0.45)" }}
                >
                  {item.label}
                  <span
                    className="absolute left-0 -bottom-0.5 h-px bg-morandi-gold/70 transition-all duration-300"
                    style={{ width: on ? "100%" : "0%" }}
                  />
                </a>
              );
            })}
          </nav>

          {/* ── right cluster ── */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setTokenOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300/20 bg-black/25 hover:border-amber-300/40 transition-colors duration-200"
                aria-label="曜刻說明"
              >
                <TokenDisplay />
                <span className="text-amber-300/50 text-[10px] tracking-widest">?</span>
              </button>

              <AnimatePresence>
                {tokenOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl px-5 py-4 text-center"
                    style={{
                      background: "rgba(22,14,8,0.94)",
                      border: "1px solid rgba(212,168,89,0.18)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <p className="text-amber-300/95 text-sm tracking-widest mb-3">✶ 曜刻 ✶</p>
                    <p className="text-cream-100/90 text-sm leading-relaxed" style={{ letterSpacing: "0.06em" }}>
                      星體交會、命運閃耀的瞬間。
                      <br />
                      在月之神社的世界裡，時間不是流逝的，
                      <br />
                      而是凝聚成一枚枚散發微光的金色星芒，
                      <br />
                      用來與神明、命運交換指引。
                    </p>
                    <div className="mt-3 pt-3 flex flex-col gap-1" style={{ borderTop: "1px solid rgba(212,168,89,0.12)" }}>
                      <p className="text-amber-300/90 text-sm tracking-wide">每日 00:00 補充 +24 曜刻</p>
                      <p className="text-cream-200/65 text-xs">塔羅占卜 / 神社抽籤 各 −1 曜刻</p>
                      <p className="text-cream-200/45 text-xs">未用完自動累積</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AmbientAudio />

            <button
              onClick={onOpenGuide}
              className="hidden md:block px-3 py-1.5 rounded-full border border-cream-200/15 text-cream-200/55 text-xs tracking-widest hover:border-cream-200/35 hover:text-cream-200/80 transition-colors duration-300"
            >
              📖 使用教學
            </button>

            <Link
              href={HERO_COPY.ctaHref}
              className="hidden md:block px-5 py-1.5 rounded-full border border-morandi-gold/45 text-cream-100/90 text-xs tracking-[0.2em] hover:bg-morandi-gold/15 hover:border-morandi-gold/70 transition-colors duration-300"
            >
              ENTER ✦
            </Link>

            {/* ── hamburger (mobile) ── */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex flex-col justify-center gap-[5px] w-9 h-9 items-center"
              aria-label="開啟選單"
            >
              <span className="block w-4 h-px bg-cream-100/65" />
              <span className="block w-4 h-px bg-cream-100/65" />
              <span className="block w-4 h-px bg-cream-100/65" />
            </button>
          </div>
        </div>
      </header>

      {/* ── mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 lg:hidden"
            style={{ background: "rgba(10,7,18,0.96)", backdropFilter: "blur(18px)" }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-5 text-cream-100/50 text-2xl leading-none"
              aria-label="關閉選單"
            >
              ×
            </button>

            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={e => {
                  e.preventDefault();
                  setMenuOpen(false);
                  scrollToSection(item.id);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-cream-100/85 text-lg tracking-[0.3em]"
              >
                {item.label}
              </motion.a>
            ))}

            <div className="mt-2 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenGuide();
                }}
                className="px-5 py-2 rounded-full border border-cream-200/15 text-cream-200/60 text-sm tracking-widest"
              >
                📖 使用教學
              </button>
              <Link
                href={HERO_COPY.ctaHref}
                onClick={() => setMenuOpen(false)}
                className="px-7 py-2.5 rounded-full border border-morandi-gold/50 bg-morandi-gold/14 text-cream-100 text-sm tracking-[0.2em]"
              >
                ENTER ✦
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
