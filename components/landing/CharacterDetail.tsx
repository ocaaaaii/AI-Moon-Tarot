"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { TAROT_AVATARS } from "@/lib/tarot/avatars";
import { CHARACTER_THUMBS } from "@/lib/landing/sections";
import { ACCENT_RGB } from "@/lib/landing/accents";

/**
 * The chosen soul, framed as a moon.
 *
 * ⚠ Tarot-side identity ONLY. `realName` and `revealTemplate` exist on these
 * records and must never be rendered here — per CLAUDE.md the dual-identity
 * reveal belongs to that soul's shrine profile, never the portal page.
 *
 * The portrait is masked with a radial gradient so its edge dissolves into
 * the page rather than ending on a hard circle — that soft edge is what
 * makes it read as a moon hanging in the dark instead of a cropped avatar.
 *
 * Doubles as a carousel: arrows, dots and arrow keys step through all seven
 * without going back up to the fan. There is deliberately no "nothing
 * selected" state — a carousel showing nobody is just an empty box.
 */

/**
 * The portrait's edge dissolve.
 *
 * `closest-side` is the load-bearing word. A bare `radial-gradient(circle, …)`
 * sizes itself to the farthest CORNER, so in a square box 100% lands at r·√2
 * and the visible circle edge sits at 1/√2 ≈ 70.7% of the gradient. The old
 * stops faded from 70% to 100%, which meant the edge was still 97.6% opaque
 * where you could see it and the whole fade happened out in the corners —
 * corners that `rounded-full overflow-hidden` had already clipped away. The
 * soft edge was in the code and had never once rendered.
 *
 * With `closest-side`, 100% IS the circle's radius, so every stop below is a
 * real position on the visible disc. Solid to 58% keeps the face untouched;
 * the outer 42% is the dissolve.
 */
const MOON_MASK =
  "radial-gradient(circle closest-side, #000 0%, #000 58%, rgba(0,0,0,0.62) 78%, rgba(0,0,0,0.18) 92%, transparent 100%)";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function CharacterDetail({ value, onChange }: Props) {
  const reduced = useReducedMotion();
  const dirRef = useRef(1);

  const index = Math.max(0, TAROT_AVATARS.findIndex(a => a.id === value));
  const avatar = TAROT_AVATARS[index];
  const rgb = ACCENT_RGB[avatar.accent];

  const step = (delta: number) => {
    dirRef.current = delta;
    const next = (index + delta + TAROT_AVATARS.length) % TAROT_AVATARS.length;
    onChange(TAROT_AVATARS[next].id);
  };

  const slide = reduced ? 0 : 24 * dirRef.current;

  return (
    <div
      id="character-detail"
      className="relative px-6 mt-6 lg:mt-2"
      onKeyDown={event => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
      }}
    >
      <motion.div
        layout={!reduced}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-4xl"
      >
        {/* Keyed re-mount rather than AnimatePresence. `mode="wait"` holds the
            new content back until the old one's exit finishes, which stalls
            the panel whenever animation cannot progress — a background tab, a
            throttled rAF, or just rapid clicking through the dots. Swapping
            instantly and fading the new one in has none of that, and in a
            400ms crossfade the missing exit is not noticeable. */}
        <motion.div
          key={avatar.id}
          initial={{ opacity: 0, x: slide }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
            {/* ── moon ── */}
            <div className="shrink-0 relative">
              {/* outer bloom, behind the portrait */}
              <div
                aria-hidden
                className="absolute inset-[-18%] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(${rgb},0.3) 0%, rgba(${rgb},0.08) 45%, transparent 70%)`,
                }}
              />
              <div
                className="relative w-[220px] h-[220px] md:w-[290px] md:h-[290px] rounded-full overflow-hidden"
                style={{ maskImage: MOON_MASK, WebkitMaskImage: MOON_MASK }}
              >
                <img
                  src={CHARACTER_THUMBS[avatar.id]}
                  alt={avatar.displayName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Rim light, over the portrait. It brightens exactly the band
                  where the mask is handing the image back to the page, so the
                  edge reads as light rather than as an ending. `screen` means
                  it can only add — it never darkens the face. */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle closest-side, transparent 0%, transparent 60%, rgba(${rgb},0.20) 82%, rgba(${rgb},0.06) 94%, transparent 100%)`,
                  mixBlendMode: "screen",
                }}
              />
            </div>

            {/* ── text ── */}
            <div className="min-w-0 flex-1 text-center md:text-left">
              <h3 className="font-display text-cream-50 text-3xl md:text-4xl tracking-[0.12em]">
                {avatar.displayName}
              </h3>
              <p className="text-xs mt-2 tracking-wide" style={{ color: `rgba(${rgb},0.9)` }}>
                {avatar.tagline}
              </p>

              <div className="mt-6 space-y-1">
                {avatar.bioLines.map(line => (
                  <p key={line} className="text-cream-100/78 text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              <ul className="mt-5 flex flex-col gap-2 items-center md:items-start">
                {avatar.traits.map(trait => (
                  <li key={trait.label} className="flex items-center gap-2 text-cream-200/60 text-xs">
                    <span aria-hidden>{trait.icon}</span>
                    <span>{trait.label}</span>
                  </li>
                ))}
              </ul>

              <blockquote
                className="mt-6 pl-4 text-left mx-auto md:mx-0 max-w-md"
                style={{ borderLeft: `1px solid rgba(${rgb},0.4)` }}
              >
                {avatar.quoteLines.map(line => (
                  <p key={line} className="font-serif text-cream-100/70 text-sm italic leading-relaxed">
                    {line}
                  </p>
                ))}
              </blockquote>

              <Link
                href="/tarot"
                className="inline-block mt-7 px-6 py-2.5 rounded-full text-cream-100 text-sm tracking-[0.15em] transition-colors duration-300"
                style={{
                  border: `1px solid rgba(${rgb},0.5)`,
                  background: `rgba(${rgb},0.12)`,
                }}
              >
                找 {avatar.displayName} 占卜 →
              </Link>
            </div>
        </motion.div>
      </motion.div>

      {/* ── carousel controls ── */}
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="上一位"
          className="grid place-items-center w-9 h-9 rounded-full border border-cream-200/18 text-cream-200/55 text-sm hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-300"
        >
          ←
        </button>

        <div className="flex items-center gap-2.5">
          {TAROT_AVATARS.map((a, i) => {
            const dotRgb = ACCENT_RGB[a.accent];
            const on = i === index;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  dirRef.current = i > index ? 1 : -1;
                  onChange(a.id);
                }}
                aria-label={`選擇 ${a.displayName}`}
                aria-current={on ? "true" : undefined}
                className="rounded-full transition-all duration-300"
                style={{
                  width: on ? 22 : 7,
                  height: 7,
                  background: on ? `rgba(${dotRgb},0.95)` : `rgba(${dotRgb},0.3)`,
                  boxShadow: on ? `0 0 12px rgba(${dotRgb},0.6)` : "none",
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="下一位"
          className="grid place-items-center w-9 h-9 rounded-full border border-cream-200/18 text-cream-200/55 text-sm hover:border-cream-200/40 hover:text-cream-100 transition-colors duration-300"
        >
          →
        </button>
      </div>
    </div>
  );
}
