"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { GATES } from "@/lib/landing/sections";
import { FX } from "@/lib/landing/fxProfile";
import { useGsapContext } from "@/lib/landing/useGsapContext";

/**
 * The four doors, as gold-edged arches.
 *
 * ⚠ Each card MUST keep its `data-guide="gate-*"` attribute —
 * `components/ui/UserGuide.tsx` positions its spotlight from those
 * selectors, and an href alone is ambiguous now that SiteNav and the hero
 * also link to /tarot. Losing them breaks the tutorial silently.
 *
 * Hover is GSAP's (quickTo, so pointer moves don't re-render React);
 * the scroll-in reveal is motion/react's. They touch different elements.
 */

const ARCH_RADIUS = "50% 50% 10px 10px / 26% 26% 3% 3%";

export default function GateCards() {
  const scope = useRef<HTMLDivElement | null>(null);

  useGsapContext(scope, ({ gsap }, root) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        // `base` is a catch-all: matchMedia skips the callback entirely when
        // no condition matches, which would silently disable everything on
        // touch devices (see CLAUDE.md)
        base: "(min-width: 0px)",
        canHover: "(hover: hover) and (pointer: fine)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      context => {
        const { canHover, reduced } = context.conditions ?? {};
        if (!canHover || reduced) return;

        const cards = gsap.utils.toArray<HTMLElement>("[data-gate-card]", root);
        const teardown: Array<() => void> = [];

        for (const card of cards) {
          const art = card.querySelector("[data-gate-art]");
          const glow = card.querySelector("[data-gate-glow]");
          const edge = card.querySelector("[data-gate-edge]");
          if (!art || !glow || !edge) continue;

          const scaleTo = gsap.quickTo(art, "scale", { duration: FX.hover.duration, ease: "power2.out" });
          const glowTo = gsap.quickTo(glow, "opacity", { duration: FX.hover.duration, ease: "power2.out" });
          const edgeTo = gsap.quickTo(edge, "opacity", { duration: FX.hover.duration, ease: "power2.out" });
          const liftTo = gsap.quickTo(card, "y", { duration: FX.hover.duration, ease: "power2.out" });

          const enter = () => {
            scaleTo(FX.hover.imageScale);
            glowTo(FX.hover.glowOpacity);
            edgeTo(1);
            liftTo(FX.hover.lift);
          };
          const leave = () => {
            scaleTo(1);
            glowTo(0);
            edgeTo(0);
            liftTo(0);
          };

          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          card.addEventListener("focusin", enter);
          card.addEventListener("focusout", leave);
          teardown.push(() => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
            card.removeEventListener("focusin", enter);
            card.removeEventListener("focusout", leave);
          });
        }

        // gsap.context reverts tweens but not manual listeners — do it here
        return () => teardown.forEach(fn => fn());
      }
    );
  });

  return (
    <div ref={scope} className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-5 lg:grid-cols-4">
      {GATES.map((gate, i) => (
        <motion.div
          key={gate.href}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={gate.href}
            data-guide={`gate-${gate.href.slice(1)}`}
            data-gate-card
            className="block relative aspect-[3/4] overflow-hidden focus:outline-none"
            style={{
              borderRadius: ARCH_RADIUS,
              border: "1px solid rgba(212,168,89,0.34)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* art — GSAP scales this layer, never the card itself */}
            <div data-gate-art className="absolute inset-0 will-change-transform">
              <img
                src={gate.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>

            {/* accent glow bleeding in from the rim on hover */}
            <div
              data-gate-glow
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: `inset 0 0 70px 6px ${gate.glow}`, opacity: 0 }}
            />

            {/* brighter second gold line, faded in on hover */}
            <div
              data-gate-edge
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: ARCH_RADIUS,
                boxShadow: "inset 0 0 0 1px rgba(233,205,140,0.85)",
                opacity: 0,
              }}
            />

            {/* readability scrim + info bar.

                The mobile sizes are not cosmetic. Two columns at 375px leave
                each card 158px wide, and at the desktop type sizes every
                title hit its own `truncate` — the shop read as "月之…" and
                the kicker as "TAROT S…", which is worse than the tall stack
                this replaced. Measured at 158px, these sizes fit "月之塔羅店鋪"
                and "THE DIVINE REALM" whole. */}
            <div
              className="absolute inset-x-0 bottom-0 pt-10 pb-3 px-2.5 sm:pt-16 sm:pb-5 sm:px-5 flex items-end justify-between gap-3"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,7,18,0.95) 0%, rgba(10,7,18,0.72) 45%, transparent 100%)",
              }}
            >
              <div className="min-w-0">
                {/* `sm:truncate` only: the ellipsis is a guard for the wide
                    card, and below sm it is what caused the clipping */}
                <p className="font-display text-cream-200/60 text-[8px] tracking-[0.16em] sm:text-[10px] sm:tracking-[0.25em] uppercase sm:truncate">
                  {gate.titleEn}
                </p>
                <h3 className="font-serif text-cream-50 text-[15px] sm:text-lg tracking-wide mt-0.5 sm:mt-1 sm:truncate">
                  {gate.titleZh}
                </h3>
                <p className="text-cream-200/45 text-[9.5px] leading-normal mt-1 sm:text-[11px] sm:mt-1.5 sm:leading-snug">
                  {gate.tagline}
                </p>
              </div>

              {/* there is no hover on a phone, and at 158px this circle was
                  taking a quarter of the width from the titles */}
              <span
                aria-hidden
                className="hidden sm:grid shrink-0 place-items-center w-8 h-8 rounded-full text-cream-100/80 text-sm mb-0.5"
                style={{ border: "1px solid rgba(212,168,89,0.5)" }}
              >
                →
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
