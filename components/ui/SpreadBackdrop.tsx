"use client";

import type { BackdropId } from "@/lib/tarot/spreads";

/**
 * The faint figure under a spread's cards — a moon arc under 三段月相鏡像陣,
 * a sunburst under 烈陽破曉十字陣, and so on. Its whole job is to connect the
 * card positions, so it has to share their coordinate space.
 *
 * Inline SVG rather than artwork, for two reasons. It is tinted with the
 * active master's accent, so one file serves all seven; and `next.config.mjs`
 * sets `images.unoptimized: true`, which means any PNG here would ship at full
 * size to every visitor for something meant to be barely visible.
 *
 * **The viewBox carries the board's own aspect** — `0 0 100 H` where
 * `H = 100 / aspect` — with `preserveAspectRatio="none"`. That gives two
 * things at once: `x` is a percentage of board width and `y / H` is a
 * percentage of board height, so a figure drawn at a card's `x` and `y` lands
 * exactly on that card; and because the viewBox aspect equals the box aspect,
 * nothing is stretched, so circles stay circles. The first version used
 * `meet`, which fits the viewBox to the shorter side and letterboxes the rest
 * — the arc was drawn in a centred square and missed the outer cards.
 */
export default function SpreadBackdrop({
  id,
  rgb,
  aspect,
}: {
  id: BackdropId;
  rgb: string;
  aspect: number;
}) {
  if (id === "none") return null;

  const H = 100 / aspect;
  const line = `rgba(${rgb},0.32)`;
  const faint = `rgba(${rgb},0.17)`;
  const glow = `rgba(${rgb},0.10)`;
  /** y as a fraction of board height, in viewBox units */
  const y = (f: number) => f * H;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 100 ${H.toFixed(2)}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {id === "moon-phases" && (
        <>
          {/* A figure drawn at the card positions is a figure hidden behind
              the cards. Everything here lives in the negative space: a ring
              around the whole cluster, and the arc crossing the gaps. */}
          <ellipse cx="50" cy={y(0.5)} rx="46" ry={y(0.46)} fill="none" stroke={faint} strokeWidth="0.4" />
          <path d={`M 5 ${y(0.9)} Q 50 ${y(0.12)} 95 ${y(0.9)}`} fill="none" stroke={line} strokeWidth="0.5" />
          <circle cx="50" cy={y(0.85)} r="7" fill={glow} stroke={line} strokeWidth="0.45" />
          <path d={`M 50 ${y(0.85) - 7} A 7 7 0 0 0 50 ${y(0.85) + 7} A 10 10 0 0 1 50 ${y(0.85) - 7}`} fill={faint} />
          <circle cx="12" cy={y(0.16)} r="4" fill="none" stroke={line} strokeWidth="0.4" strokeDasharray="1.4 1.6" />
          <circle cx="88" cy={y(0.16)} r="4" fill={faint} />
        </>
      )}

      {id === "solar-cross" && (
        <>
          {/* The ring sits outside the centre card, so the burst reads instead
              of being covered by the card it is centred on. */}
          <ellipse cx="50" cy={y(0.62)} rx="45" ry={y(0.34)} fill="none" stroke={line} strokeWidth="0.45" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * Math.PI * 2) / 24;
            const rx0 = 46;
            const rx1 = i % 2 ? 52 : 58;
            const ry0 = y(0.35);
            const ry1 = i % 2 ? y(0.4) : y(0.44);
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * rx0}
                y1={y(0.62) + Math.sin(a) * ry0}
                x2={50 + Math.cos(a) * rx1}
                y2={y(0.62) + Math.sin(a) * ry1}
                stroke={faint}
                strokeWidth="0.4"
              />
            );
          })}
          {/* the shaft up to 曙光, through the gap between the two rows */}
          <line x1="50" y1={y(0.30)} x2="50" y2={y(0.46)} stroke={line} strokeWidth="0.5" />
          <circle cx="50" cy={y(0.38)} r="2.4" fill={glow} stroke={line} strokeWidth="0.4" />
        </>
      )}

      {id === "puzzle-grid" && (
        <>
          {[0.2, 0.4, 0.6, 0.8].map(f => (
            <line key={`h${f}`} x1="6" y1={y(f)} x2="94" y2={y(f)} stroke={faint} strokeWidth="0.35" />
          ))}
          {[20, 40, 60, 80].map(v => (
            <line key={`v${v}`} x1={v} y1={y(0.06)} x2={v} y2={y(0.94)} stroke={faint} strokeWidth="0.35" />
          ))}
          {/* one interlocking tab, so the grid reads as a puzzle, not graph paper */}
          <path
            d={`M 33 ${y(0.4)} h 11 a 3 3 0 0 1 0 6 h -11 v ${y(0.2) - 6} h 11 a 3 3 0 0 0 0 6 h -11 z`}
            fill="none"
            stroke={line}
            strokeWidth="0.5"
          />
          <circle cx="50" cy={y(0.5)} r="20" fill={glow} />
        </>
      )}

      {id === "tide-wave" && (
        <>
          {[0.28, 0.44, 0.6, 0.76].map((f, i) => (
            <path
              key={f}
              d={`M -5 ${y(f)} Q 18 ${y(f) - 8 + i} 40 ${y(f)} T 85 ${y(f)} T 130 ${y(f)}`}
              fill="none"
              stroke={i === 1 ? line : faint}
              strokeWidth="0.5"
            />
          ))}
        </>
      )}

      {id === "dawn-rays" && (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 11) * (Math.PI / 2.1);
            return (
              <line
                key={i}
                x1="8"
                y1={y(0.94)}
                x2={8 + Math.cos(a) * 120}
                y2={y(0.94) - Math.sin(a) * y(1.05)}
                stroke={faint}
                strokeWidth="0.4"
              />
            );
          })}
          <circle cx="8" cy={y(0.94)} r="15" fill={glow} />
          <path d={`M -6 ${y(0.94)} A 14 14 0 0 1 22 ${y(0.94)}`} fill="none" stroke={line} strokeWidth="0.6" />
        </>
      )}

      {id === "night-well" && (
        <>
          {[0.13, 0.31, 0.49, 0.67, 0.85].map((f, i) => (
            <ellipse
              key={f}
              cx="50"
              cy={y(f)}
              rx={34 - i * 5}
              ry={4.5 - i * 0.5}
              fill="none"
              stroke={i === 0 ? line : faint}
              strokeWidth="0.45"
            />
          ))}
          <line x1="16" y1={y(0.13)} x2="36" y2={y(0.85)} stroke={faint} strokeWidth="0.35" />
          <line x1="84" y1={y(0.13)} x2="64" y2={y(0.85)} stroke={faint} strokeWidth="0.35" />
          <ellipse cx="50" cy={y(0.85)} rx="14" ry="2.5" fill={glow} />
        </>
      )}

      {id === "bloom-vines" && (
        <>
          <path
            d={`M 6 ${y(0.98)} Q 26 ${y(0.7)} 20 ${y(0.45)} Q 15 ${y(0.2)} 40 ${y(0.1)}`}
            fill="none"
            stroke={faint}
            strokeWidth="0.55"
          />
          <path
            d={`M 94 ${y(0.98)} Q 74 ${y(0.74)} 80 ${y(0.5)} Q 86 ${y(0.26)} 62 ${y(0.14)}`}
            fill="none"
            stroke={faint}
            strokeWidth="0.55"
          />
          {[
            [20, 0.45],
            [40, 0.1],
            [80, 0.5],
            [62, 0.14],
          ].map(([cx, f]) => (
            <g key={`${cx}-${f}`}>
              <circle cx={cx} cy={y(f)} r="3.6" fill={glow} stroke={line} strokeWidth="0.4" />
              <circle cx={cx} cy={y(f)} r="1.1" fill={line} />
            </g>
          ))}
          <path d={`M 5 ${y(0.99)} Q 50 ${y(0.91)} 95 ${y(0.99)}`} fill="none" stroke={faint} strokeWidth="0.4" />
        </>
      )}
    </svg>
  );
}
