"use client";

import { useId } from "react";

import { HERO_COPY } from "@/lib/landing/sections";

/**
 * The hero wordmark.
 *
 * Settled with the PO (2026-09-16), after comparing five faces on the live
 * page: Cinzel, thin, with a moonlight-metal gradient and the two O's drawn
 * as a waxing/waning moon pair.
 *
 * Cinzel is an all-caps Roman face — its "lowercase" are small caps, which is
 * why `Tarot` reads as large-T + small caps rather than true mixed case. That
 * is intentional; it is what was chosen.
 */

/** one source of truth for the moonlight gold, used by both CSS and SVG */
const GOLD_STOPS = [
  { offset: "0%", color: "#fdfaf4" },
  { offset: "26%", color: "#f2e8cc" },
  { offset: "52%", color: "#d4a859" },
  { offset: "74%", color: "#f9f3e3" },
  { offset: "100%", color: "#d9c28a" },
];

const GOLD_CSS = `linear-gradient(168deg, ${GOLD_STOPS.map(s => `${s.color} ${s.offset}`).join(", ")})`;

const metallic: React.CSSProperties = {
  backgroundImage: GOLD_CSS,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  // background-clip:text kills text-shadow, so lift the mark off the art
  // with a drop-shadow filter on the element instead
  filter: "drop-shadow(0 4px 28px rgba(10,7,18,0.9))",
};

/**
 * An `O` drawn as a hairline ring with a slim crescent inside — the two of
 * them read as a moon phase pair.
 *
 * Kept deliberately thin: a thick ring or a solid crescent reads as a gold
 * blob rather than a letter.
 */
function MoonO({ waning }: { waning?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const maskId = `moon-mask-${uid}`;
  const gradId = `moon-grad-${uid}`;
  const paint = `url(#${gradId})`;
  const cx = waning ? 37 : 63;

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
      style={{
        width: "0.76em",
        height: "0.76em",
        display: "inline-block",
        verticalAlign: "-0.05em",
        margin: "0 -0.01em",
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0.4" y2="1">
          {GOLD_STOPS.map(s => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <mask id={maskId}>
          <circle cx="50" cy="50" r="40" fill="#fff" />
          {/* nearly the same radius, nudged sideways → a slim sliver */}
          <circle cx={cx} cy="46" r="38" fill="#000" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="40" fill="none" stroke={paint} strokeWidth="2.4" opacity="0.9" />
      <circle cx="50" cy="50" r="40" fill={paint} mask={`url(#${maskId})`} opacity="0.78" />
    </svg>
  );
}

export default function Wordmark() {
  return (
    <div>
      <p className="font-display text-cream-200/55 text-[11px] md:text-xs tracking-[0.42em]">
        {HERO_COPY.kicker}
      </p>

      <h1
        className="font-display mt-2 md:mt-3 leading-[1.05] select-none"
        style={{
          fontWeight: 400,
          fontSize: "calc(clamp(3.25rem, 8.5vw, 6.5rem) * 0.88)",
          letterSpacing: "0.09em",
        }}
      >
        <span className="block" style={metallic}>
          M
          <MoonO />
          <MoonO waning />
          N
        </span>

        {/* ✦ ─ Tarot ─ ✦ */}
        <span className="flex items-center justify-center md:justify-end gap-3 mt-1 md:mt-2">
          <span className="h-px w-8 md:w-10 bg-gradient-to-r from-transparent to-morandi-gold/45" />
          <span className="text-morandi-gold/50 text-[0.16em]">✦</span>
          <span
            style={{
              ...metallic,
              fontSize: "clamp(1.35rem, 2.8vw, 2.1rem)",
              letterSpacing: "0.22em",
              fontWeight: 400,
            }}
          >
            {HERO_COPY.titleBottom}
          </span>
          <span className="text-morandi-gold/50 text-[0.16em]">✦</span>
          <span className="h-px w-8 md:w-10 bg-gradient-to-l from-transparent to-morandi-gold/45" />
        </span>
      </h1>

      <div className="mt-4 flex items-center justify-center md:justify-end gap-3">
        <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-r from-transparent to-morandi-gold/30" />
        <span className="font-display text-morandi-gold/70 text-[11px] md:text-xs tracking-[0.32em]">
          {HERO_COPY.rule}
        </span>
      </div>
    </div>
  );
}
