"use client";

import { useRef } from "react";

import { PETAL_SPRITES, type AmbientScene as Scene, type LightPoint } from "@/lib/landing/ambient";
import { useGsapContext } from "@/lib/landing/useGsapContext";

/**
 * Additive light over a painted plate — "a living illustration".
 *
 * The art is a flat JPEG, so nothing here MOVES the picture; it adds light on
 * top and lets that light breathe, flicker and twinkle. Candle flames pulse,
 * the moon breathes, crystal balls turn and petals drift.
 *
 * ── two layers, two blend modes ─────────────────────────────────
 * LIGHT is `mix-blend-mode: screen`: it only ever brightens, and a sprite's
 * dark background contributes nothing, so the cut-outs need no perfect keying.
 * PETALS are physical objects and blend normally — screening them would turn
 * them into ghosts.
 * ────────────────────────────────────────────────────────────────
 *
 * Performance rules baked in here, because this is the easy place to burn a
 * laptop battery:
 *   · one blend-mode container, not one per light
 *   · only `opacity` and `transform` are animated — never `filter: blur`
 *   · every animation pauses while the section is off-screen
 *   · phones drop every light not marked `onMobile`
 *   · `prefers-reduced-motion` renders the lights at rest and builds no
 *     timelines at all
 */

/** fixed so server and client render the same thing (no hydration mismatch) */
const PETAL_LANES = [0.07, 0.19, 0.32, 0.45, 0.58, 0.71, 0.86];

interface Props {
  scene: Scene;
  /** restrict to one breakpoint — used by the hero, which has two crops */
  only?: "desktop" | "mobile";
  className?: string;
}

function pointStyle(point: LightPoint): React.CSSProperties {
  const half = `${(point.size / 2) * 100}%`;
  return {
    position: "absolute",
    left: `${point.x * 100}%`,
    top: `${point.y * 100}%`,
    width: `${point.size * 100}%`,
    aspectRatio: "1",
    // percentage margins resolve against WIDTH, and the box is square, so one
    // value centres both axes — and leaves `transform` free for GSAP
    marginLeft: `-${half}`,
    marginTop: `-${half}`,
    opacity: 0,
    willChange: "opacity, transform",
  };
}

export default function AmbientScene({ scene, only, className = "" }: Props) {
  const scope = useRef<HTMLDivElement | null>(null);

  useGsapContext(scope, ({ gsap, ScrollTrigger }, root) => {
    const mm = gsap.matchMedia();
    const rand = gsap.utils.random;

    mm.add(
      {
        // a condition that matches at every width — without one, matchMedia
        // skips the callback entirely below 768px (CLAUDE.md)
        base: "(min-width: 0px)",
        isDesktop: "(min-width: 768px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      context => {
        const isDesktop = context.conditions?.isDesktop ?? false;
        const reduced = context.conditions?.reduced ?? false;

        if (only === "desktop" && !isDesktop) return;
        if (only === "mobile" && isDesktop) return;

        const lights = gsap.utils.toArray<HTMLElement>("[data-light]", root);
        const visible = lights.filter(el => isDesktop || el.dataset.mobile === "1");

        // reduced motion: show the light, animate nothing
        if (reduced) {
          for (const el of visible) {
            gsap.set(el, { opacity: Number(el.dataset.peak) * 0.75 });
          }
          return;
        }

        const anims: gsap.core.Animation[] = [];

        for (const el of visible) {
          const peak = Number(el.dataset.peak);

          switch (el.dataset.behaviour) {
            case "flicker": {
              // a candle. The irregularity is the whole point, so each repeat
              // re-rolls its own values via repeatRefresh — fixed keyframes
              // read as a mechanical loop within seconds
              const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, delay: rand(0, 2) });
              for (let i = 0; i < 5; i++) {
                tl.to(el, {
                  opacity: () => rand(peak * 0.45, peak),
                  scale: () => rand(0.88, 1.14),
                  duration: () => rand(0.1, 0.42),
                  ease: "sine.inOut",
                });
              }
              anims.push(tl);
              break;
            }

            case "twinkle": {
              anims.push(
                gsap.fromTo(
                  el,
                  { opacity: peak * 0.08, scale: 0.78, rotate: 0 },
                  {
                    opacity: () => rand(peak * 0.55, peak),
                    scale: () => rand(1.0, 1.18),
                    rotate: () => rand(-12, 12),
                    duration: () => rand(0.7, 2.1),
                    repeat: -1,
                    yoyo: true,
                    repeatRefresh: true,
                    delay: rand(0, 3),
                    ease: "sine.inOut",
                  }
                )
              );
              break;
            }

            case "shimmer": {
              const core = el.querySelector("[data-shimmer-core]");
              if (core) {
                anims.push(
                  gsap.to(core, {
                    rotate: el.dataset.spin === "1" ? 360 : 0,
                    duration: rand(26, 44),
                    repeat: -1,
                    ease: "none",
                  })
                );
              }
              anims.push(
                gsap.fromTo(
                  el,
                  { opacity: peak * 0.35 },
                  {
                    opacity: peak,
                    duration: rand(4, 7),
                    repeat: -1,
                    yoyo: true,
                    delay: rand(0, 4),
                    ease: "sine.inOut",
                  }
                )
              );
              break;
            }

            default: {
              // breathe
              anims.push(
                gsap.fromTo(
                  el,
                  { opacity: peak * 0.45, scale: 0.96 },
                  {
                    opacity: peak,
                    scale: 1.08,
                    duration: rand(6, 8.5),
                    repeat: -1,
                    yoyo: true,
                    delay: rand(0, 3.5),
                    ease: "sine.inOut",
                  }
                )
              );
            }
          }
        }

        // ── petals ──
        const petalCount = scene.petals ? (isDesktop ? scene.petals.desktop : scene.petals.mobile) : 0;
        const petalPeak = scene.petals?.opacity ?? 0.9;
        const allPetals = gsap.utils.toArray<HTMLElement>("[data-petal]", root);
        gsap.set(allPetals.slice(petalCount), { display: "none" });

        allPetals.slice(0, petalCount).forEach((petal, i) => {
          // a wide, staggered start so two petals never fall in lockstep
          const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, delay: i * rand(3, 9) });
          tl.fromTo(
            petal,
            { yPercent: -60, x: 0, rotate: 0, opacity: 0 },
            {
              yPercent: () => rand(900, 1600),
              x: () => rand(-90, 90),
              rotate: () => rand(-220, 220),
              duration: () => rand(16, 30),
              ease: "none",
            }
          )
            .to(petal, { opacity: () => rand(petalPeak * 0.5, petalPeak), duration: 3 }, 0)
            .to(petal, { opacity: 0, duration: 4.5 }, ">-4.5");
          anims.push(tl);
        });

        // ── stop everything while the section is off-screen ──
        // Both hooks matter: `onToggle` handles scrolling in and out, and
        // `onRefresh` sets the correct state at startup. Reading `isActive`
        // straight after create() is too early — ScrollTrigger has not
        // measured yet and reports false for a section that IS on screen,
        // which silently pauses every light on first paint.
        const setPlaying = (active: boolean) => {
          for (const a of anims) {
            if (active) a.play();
            else a.pause();
          }
        };

        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: self => setPlaying(self.isActive),
          onRefresh: self => setPlaying(self.isActive),
        });
      }
    );
  });

  return (
    <div
      ref={scope}
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* ── additive light ── */}
      <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
        {scene.points.map(point => (
          <div
            key={`${point.x}-${point.y}-${point.behaviour}`}
            data-light
            data-behaviour={point.behaviour}
            data-peak={point.peak ?? 0.5}
            data-mobile={point.onMobile ? "1" : "0"}
            data-spin={point.spin ? "1" : "0"}
            className={point.onMobile ? undefined : "hidden md:block"}
            style={{
              ...pointStyle(point),
              borderRadius: point.sprite ? undefined : "50%",
              background: point.sprite
                ? undefined
                : `radial-gradient(circle, rgba(${point.rgb},0.95) 0%, rgba(${point.rgb},0.4) 32%, transparent 70%)`,
            }}
          >
            {point.sprite && (
              <div data-shimmer-core className="w-full h-full">
                <img
                  src={point.sprite}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        ))}

      </div>

      {/* ── petals: real objects, so no screen blending ── */}
      {scene.petals && (
        <div className="absolute inset-0">
          {PETAL_LANES.map((lane, i) => (
            <img
              key={lane}
              data-petal
              src={PETAL_SPRITES[i % PETAL_SPRITES.length]}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute"
              style={{
                left: `${lane * 100}%`,
                top: 0,
                width: (20 + (i % 3) * 9) * (scene.petals?.scale ?? 1),
                opacity: 0,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
