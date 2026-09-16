"use client";

import { motion, useReducedMotion } from "motion/react";

import { TAROT_AVATARS } from "@/lib/tarot/avatars";
import { CHARACTER_THUMBS } from "@/lib/landing/sections";
import { ACCENT_RGB } from "@/lib/landing/accents";

/**
 * The seven souls, dealt as a hand of cards.
 *
 * Desktop (lg+) fans them out: each card rotates about its BOTTOM edge, the
 * outer ones sinking along an arc, overlapping their neighbours. Rotating
 * about the card's centre instead would read as a pinwheel, and without the
 * overlap it is just a row of thumbnails again.
 *
 * Below lg the fan is abandoned for the original snap-scroll track — seven
 * rotated cards cannot be laid out at 375px, and pretending otherwise only
 * produces horizontal overflow.
 *
 * Controlled: this component holds no state. Transforms belong to
 * motion/react alone here — adding GSAP would put two libraries on the same
 * `transform` (see CLAUDE.md).
 */

const MID = 3; // index of the middle card of seven

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function CharacterFan({ value, onChange }: Props) {
  const reduced = useReducedMotion();

  return (
    <>
      {/* ── fan (lg and up) ── */}
      <div className="hidden lg:block relative mt-12 h-[330px] overflow-hidden">
        <div className="absolute inset-x-0 bottom-6 flex justify-center items-end">
          {TAROT_AVATARS.map((avatar, i) => {
            const rgb = ACCENT_RGB[avatar.accent];
            const active = value === avatar.id;
            const offset = i - MID;
            const rest = {
              rotate: reduced ? 0 : offset * 6.5,
              y: reduced ? 0 : offset * offset * 6,
              scale: 1,
            };

            return (
              <motion.button
                key={avatar.id}
                type="button"
                onClick={() => onChange(avatar.id)}
                aria-current={active ? "true" : undefined}
                aria-controls="character-detail"
                aria-label={`${avatar.displayName} — ${avatar.bestFor}`}
                className="group relative shrink-0 w-[168px] focus:outline-none"
                style={{
                  transformOrigin: "bottom center",
                  // the overlap is what makes this read as a spread
                  marginLeft: i === 0 ? 0 : -28,
                  zIndex: active ? 40 : i,
                }}
                initial={false}
                animate={active ? { rotate: 0, y: -24, scale: 1.05 } : rest}
                whileHover={
                  active || reduced ? undefined : { rotate: rest.rotate / 2, y: rest.y - 14, scale: 1.02 }
                }
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden transition-shadow duration-400"
                  style={{
                    border: `1px solid rgba(${rgb},${active ? 0.8 : 0.24})`,
                    boxShadow: active
                      ? `0 0 38px rgba(${rgb},0.45), 0 18px 40px rgba(0,0,0,0.55)`
                      : "0 12px 28px rgba(0,0,0,0.45)",
                  }}
                >
                  <img
                    src={CHARACTER_THUMBS[avatar.id]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,7,18,0.94) 0%, rgba(10,7,18,0.4) 42%, transparent 74%)",
                    }}
                  />
                  {/* unselected cards sit back so the chosen one leads */}
                  <div
                    className="absolute inset-0 transition-opacity duration-400"
                    style={{ background: "#0a0712", opacity: active ? 0 : 0.34 }}
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-400"
                    style={{ boxShadow: `inset 0 0 48px rgba(${rgb},0.5)`, opacity: active ? 1 : 0 }}
                  />

                  {/* the affordance: nothing on screen said these open */}
                  {!active && (
                    <span
                      aria-hidden
                      className="absolute top-2.5 right-2.5 grid place-items-center w-5 h-5 rounded-full text-[11px] leading-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
                      style={{
                        color: `rgba(${rgb},0.95)`,
                        border: `1px solid rgba(${rgb},0.5)`,
                        background: "rgba(10,7,18,0.6)",
                      }}
                    >
                      ＋
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                    <p className="font-display text-cream-50 text-base tracking-[0.1em]">
                      {avatar.displayName}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: `rgba(${rgb},0.85)` }}>
                      {avatar.bestFor}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── snap track (below lg) ── */}
      <div
        className="lg:hidden relative mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {TAROT_AVATARS.map(avatar => {
          const rgb = ACCENT_RGB[avatar.accent];
          const active = value === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onChange(avatar.id)}
              aria-current={active ? "true" : undefined}
              aria-controls="character-detail"
              aria-label={`${avatar.displayName} — ${avatar.bestFor}`}
              className="shrink-0 snap-start w-[148px] text-left focus:outline-none"
            >
              <div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-400"
                style={{
                  border: `1px solid rgba(${rgb},${active ? 0.8 : 0.22})`,
                  boxShadow: active
                    ? `0 0 30px rgba(${rgb},0.4), 0 14px 32px rgba(0,0,0,0.5)`
                    : "0 10px 26px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={CHARACTER_THUMBS[avatar.id]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,7,18,0.94) 0%, rgba(10,7,18,0.4) 42%, transparent 74%)",
                  }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-400"
                  style={{ background: "#0a0712", opacity: active ? 0 : 0.34 }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-cream-50 text-base tracking-[0.1em]">
                    {avatar.displayName}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: `rgba(${rgb},0.85)` }}>
                    {avatar.bestFor}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
