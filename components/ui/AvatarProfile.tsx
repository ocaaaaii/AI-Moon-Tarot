"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * AvatarProfile — the shared left-column character panel for both shops.
 * Generalizes what used to be two separate, near-identical components
 * (CynthiaProfile.tsx, TsukinoProfile.tsx) into one data-driven renderer,
 * so adding a new tarot master / 解籤師 means adding a registry entry
 * (lib/tarot/avatars.ts or lib/omikuji/avatars.ts), not a new component.
 *
 * Accent colors are looked up from a static map (ACCENT_CLASSES below)
 * rather than built with template-string class names — Tailwind's JIT
 * scanner only picks up literal class strings in source, so
 * `text-morandi-${accent}` would silently fail to generate any CSS.
 */

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as number[], delay },
});

type Accent = "lavender" | "gold" | "slate" | "rose" | "sage" | "mauve" | "stone";

const ACCENT_CLASSES: Record<
  Accent,
  {
    label: string;
    nameShadow: string;
    dividerFrom: string;
    dividerChar: string;
    revealHighlight: string;
  }
> = {
  lavender: {
    label: "text-morandi-lavender/40",
    nameShadow: "0 2px 20px rgba(184,168,200,0.4)",
    dividerFrom: "to-morandi-lavender/15",
    dividerChar: "text-morandi-lavender/25",
    revealHighlight: "text-morandi-lavender/70",
  },
  gold: {
    label: "text-amber-200/40",
    nameShadow: "0 2px 20px rgba(212,168,89,0.4)",
    dividerFrom: "to-morandi-gold/20",
    dividerChar: "text-morandi-gold/35",
    revealHighlight: "text-amber-200/60",
  },
  slate: {
    label: "text-morandi-slate/45",
    nameShadow: "0 2px 20px rgba(138,150,168,0.4)",
    dividerFrom: "to-morandi-slate/20",
    dividerChar: "text-morandi-slate/35",
    revealHighlight: "text-morandi-slate/70",
  },
  rose: {
    label: "text-morandi-rose/45",
    nameShadow: "0 2px 20px rgba(201,168,160,0.4)",
    dividerFrom: "to-morandi-rose/20",
    dividerChar: "text-morandi-rose/35",
    revealHighlight: "text-morandi-rose/70",
  },
  sage: {
    label: "text-morandi-sage/45",
    nameShadow: "0 2px 20px rgba(160,176,160,0.4)",
    dividerFrom: "to-morandi-sage/20",
    dividerChar: "text-morandi-sage/35",
    revealHighlight: "text-morandi-sage/70",
  },
  mauve: {
    label: "text-morandi-mauve/45",
    nameShadow: "0 2px 20px rgba(176,160,184,0.4)",
    dividerFrom: "to-morandi-mauve/20",
    dividerChar: "text-morandi-mauve/35",
    revealHighlight: "text-morandi-mauve/70",
  },
  stone: {
    label: "text-morandi-stone/45",
    nameShadow: "0 2px 20px rgba(168,152,128,0.4)",
    dividerFrom: "to-morandi-stone/20",
    dividerChar: "text-morandi-stone/35",
    revealHighlight: "text-morandi-stone/70",
  },
};

export interface AvatarProfileData {
  displayName: string;
  image: string;
  tagline: string;
  /** one-line specialty, e.g. "拆解焦慮卡關" — shown under the tagline so
   * visitors can tell who's best for what before they start chatting. */
  bestFor?: string;
  accent: Accent;
  bioLines: string[];
  traits: { icon: string; label: string }[];
  quoteLines: string[];
  revealTemplate?: { prefix: string; suffix: string };
}

interface AvatarProfileProps {
  avatar: AvatarProfileData;
  /** small uppercase line above the name — shop-level, not persona-level
   * (e.g. "A I  T A R O T" or "月 神 神 社") */
  shopLabel: string;
  heroHeight?: number;
}

export default function AvatarProfile({
  avatar,
  shopLabel,
  heroHeight = 340,
}: AvatarProfileProps) {
  const c = ACCENT_CLASSES[avatar.accent];

  return (
    <div className="flex flex-col">
      {/* ── Hero image ── */}
      <motion.div
        className="relative w-full flex-shrink-0"
        style={{ height: `${heroHeight}px` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Image
          src={avatar.image}
          alt={avatar.displayName}
          fill
          className="object-cover object-top"
          sizes="288px"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(12,7,22,0.1) 0%, rgba(12,7,22,0) 30%, rgba(12,7,22,0.55) 72%, rgba(12,7,22,1) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(12,7,22,0.35) 0%, transparent 25%, transparent 75%, rgba(12,7,22,0.35) 100%)",
          }}
        />

        <motion.div
          className="absolute bottom-5 left-0 right-0 text-center z-10 px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={`${c.label} text-[9px] tracking-[0.45em] uppercase mb-2`}>
            {shopLabel}
          </p>
          <h2
            className="font-serif text-2xl text-cream-100 tracking-[0.15em]"
            style={{ textShadow: c.nameShadow }}
          >
            {avatar.displayName}
          </h2>
          <p className="text-cream-200/70 text-xs tracking-widest mt-1.5 font-light">
            {avatar.tagline}
          </p>
          {avatar.bestFor && (
            <p className={`${c.revealHighlight} text-xs tracking-wide mt-2`}>
              ✦ 擅長：{avatar.bestFor}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* ── Description ── */}
      <div className="px-6 pt-4 pb-5 flex flex-col gap-4">
        <motion.p
          className="text-cream-200/82 text-[13px] leading-[1.9] font-light text-center"
          {...fadeUp(0.65)}
        >
          {avatar.bioLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < avatar.bioLines.length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${c.dividerFrom}`} />
          <span className={`${c.dividerChar} text-xs`}>✦</span>
          <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${c.dividerFrom}`} />
        </motion.div>

        {/* Traits — stagger */}
        <div className="flex flex-col gap-2">
          {avatar.traits.map(({ icon, label }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-sm opacity-70">{icon}</span>
              <span className="text-cream-200/80 text-[13px]">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* The hidden-identity reveal — only some avatars have one */}
        {avatar.revealTemplate && (
          <motion.div className="pt-1" {...fadeUp(1.05)}>
            <p className="text-cream-200/72 text-xs leading-relaxed text-center">
              {avatar.revealTemplate.prefix}
              <span className={c.revealHighlight}>{avatar.displayName}</span>
              {avatar.revealTemplate.suffix}
            </p>
          </motion.div>
        )}

        <motion.div className="pt-1" {...fadeUp(1.2)}>
          <p className="text-cream-200/55 text-xs italic text-center leading-relaxed">
            「{avatar.quoteLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < avatar.quoteLines.length - 1 && <br />}
              </span>
            ))}」
          </p>
        </motion.div>
      </div>
    </div>
  );
}
