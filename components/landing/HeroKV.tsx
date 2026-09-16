"use client";

import { useRef } from "react";
import Link from "next/link";

import { HERO_COPY } from "@/lib/landing/sections";
import { FX } from "@/lib/landing/fxProfile";
import { KV_DESKTOP_SCENE, KV_MOBILE_SCENE } from "@/lib/landing/ambient";
import { useGsapContext } from "@/lib/landing/useGsapContext";
import AmbientScene from "./AmbientScene";
import Wordmark from "./Wordmark";

/**
 * Hero / first viewport.
 *
 * Desktop and mobile are two different LAYOUTS, not one layout with a
 * swapped image: the mobile KV is 0.89 aspect, so covering a 0.46 phone
 * viewport would crop 48% of its width and lose the celestial city
 * entirely. Mobile therefore frames the art in a 62svh panel that fades
 * into the page, with the copy below it.
 *
 * The markup keeps ONE copy of the text (no duplicated <h1>): the image
 * container is in normal flow on mobile and absolutely positioned on
 * desktop, and the copy block mirrors that.
 *
 * `<picture>` rather than next/image — the project sets
 * `images.unoptimized: true`, so next/image would only add a wrapper while
 * still downloading BOTH KVs (a `hidden` <img> is still fetched). A native
 * <source media> lets the browser download exactly one.
 *
 * ── who owns which transform ────────────────────────────────────
 * Three animations touch this hero, so they are kept on separate elements:
 *   [data-hero-art]   yPercent  ← ScrollTrigger scrub (scroll-away)
 *   [data-hero-plate] x / y     ← pointer parallax
 *   AmbientScene's own layer     ← its own lights, plus a deeper parallax
 * Never move two of these onto one element (CLAUDE.md).
 * ────────────────────────────────────────────────────────────────
 */

/** tune these two together when the art changes — see P0-1 contrast rule */
const DESKTOP_SCRIM =
  "linear-gradient(to left, rgba(10,7,18,0.88) 0%, rgba(10,7,18,0.62) 26%, rgba(10,7,18,0.12) 52%, transparent 70%)";
/* The bottom eighth is fully solid, not merely dark. On mobile the copy is
   pulled up over this edge, and `svh` resolves differently in in-app browsers
   (Instagram, LINE) than the numbers suggest — a guaranteed black bed is what
   keeps the kicker legible there instead of sitting on lit blossoms. */
const BOTTOM_FADE =
  "linear-gradient(to top, #0a0712 0%, #0a0712 12%, rgba(10,7,18,0.72) 26%, rgba(10,7,18,0.2) 46%, transparent 64%)";

export default function HeroKV() {
  const scope = useRef<HTMLElement | null>(null);

  useGsapContext(scope, ({ gsap }, root) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        // every breakpoint needs a condition that matches: gsap.matchMedia
        // only runs the callback while at least ONE condition is true, so
        // omitting `isMobile` would silently kill everything below 768px
        base: "(min-width: 0px)",
        isDesktop: "(min-width: 768px)",
        canHover: "(hover: hover) and (pointer: fine)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      context => {
        const { isDesktop, canHover, reduced } = context.conditions ?? {};
        if (reduced) return;

        // ── the art sinks and dims as the hero scrolls away ──
        const depth = isDesktop ? FX.parallax.yPercent : FX.parallax.yPercent * 0.5;
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
          })
          .to("[data-hero-art]", { yPercent: depth, ease: "none" }, 0)
          .to("[data-hero-darken]", { opacity: FX.parallax.darken, ease: "none" }, 0);

        // ── pointer parallax (desktop pointers only) ──
        if (!canHover) return;

        const plate = root.querySelector("[data-hero-plate]");
        const lights = root.querySelector("[data-hero-lights]");
        if (!plate) return;

        const opts = { duration: 0.9, ease: "power3.out" };
        const plateX = gsap.quickTo(plate, "x", opts);
        const plateY = gsap.quickTo(plate, "y", opts);
        const lightX = lights ? gsap.quickTo(lights, "x", opts) : null;
        const lightY = lights ? gsap.quickTo(lights, "y", opts) : null;

        const onMove = (event: PointerEvent) => {
          // -1..1 from the centre of the viewport
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          plateX(-nx * FX.pointer.plate);
          plateY(-ny * FX.pointer.plate);
          lightX?.(-nx * FX.pointer.light);
          lightY?.(-ny * FX.pointer.light);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        // gsap.context reverts tweens but not listeners — remove it here
        return () => window.removeEventListener("pointermove", onMove);
      }
    );
  });

  return (
    <section
      id="home"
      ref={scope}
      className="relative flex flex-col md:block min-h-[100svh] scroll-mt-[60px] md:scroll-mt-[72px] overflow-hidden"
      style={{ background: "#0a0712" }}
    >
      {/* ── art layer: flow panel on mobile, full bleed on desktop ── */}
      {/* overflow-hidden is load-bearing: the plate below is inset -10px so
          pointer parallax never exposes an edge, and without clipping that
          10px band of undimmed art hangs below the scrims. On desktop the
          section hides it; on mobile this panel is only 62svh and in normal
          flow, so the overhang landed on the copy as a hard bright seam
          straight through the wordmark. */}
      <div data-hero-art className="relative w-full h-[62svh] overflow-hidden md:absolute md:inset-0 md:h-full">
        {/* inner plate exists purely so pointer parallax has its own element */}
        <div data-hero-plate className="absolute inset-[-10px]">
          <picture>
            <source media="(min-width: 768px)" srcSet="/assets/landing/kv-desktop.jpg" />
            <img
              src="/assets/landing/kv-mobile.jpg"
              alt="月神在星夜的陽台上舉起一張塔羅牌"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-top md:object-center"
            />
          </picture>
        </div>

        {/* ── ambient light: two crops, two coordinate sets ── */}
        <div data-hero-lights className="absolute inset-0">
          <AmbientScene scene={KV_DESKTOP_SCENE} only="desktop" className="hidden md:block" />
          <AmbientScene scene={KV_MOBILE_SCENE} only="mobile" className="md:hidden" />
        </div>

        {/* desktop: darken the right half so the headline stays legible */}
        <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ background: DESKTOP_SCRIM }} />
        {/* both: dissolve the bottom edge into the page */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: BOTTOM_FADE }} />
        {/* scrub-driven dimming as the hero scrolls away */}
        <div
          data-hero-darken
          className="absolute inset-0 pointer-events-none"
          style={{ background: "#0a0712", opacity: 0 }}
        />
      </div>

      {/* ── vertical aside (desktop only, decorative) ── */}
      <p
        aria-hidden
        className="hidden md:block absolute left-[3vw] top-1/2 -translate-y-1/2 text-cream-200/35 text-[10px] tracking-[0.42em]"
        style={{ writingMode: "vertical-rl" }}
      >
        {HERO_COPY.aside}
      </p>

      {/* ── copy: below the art on mobile, right side on desktop ── */}
      <div className="relative z-10 -mt-14 px-6 pb-16 text-center md:mt-0 md:pb-0 md:px-0 md:absolute md:right-[7vw] md:top-1/2 md:-translate-y-1/2 md:w-[min(30rem,42vw)] md:text-right">
        <Wordmark />

        <div className="mt-7 font-serif text-base md:text-lg text-cream-100/80 leading-loose">
          {HERO_COPY.subtitleLines.map(line => (
            <p key={line} style={{ textShadow: "0 2px 18px rgba(10,7,18,0.9)" }}>
              {line}
            </p>
          ))}
        </div>

        <Link
          href={HERO_COPY.ctaHref}
          className="inline-block mt-8 px-8 py-3 rounded-full border border-morandi-gold/45 bg-morandi-gold/12 text-cream-100 text-sm tracking-[0.2em] hover:bg-morandi-gold/22 hover:border-morandi-gold/70 transition-colors duration-300"
          style={{ backdropFilter: "blur(2px)" }}
        >
          ✦ {HERO_COPY.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
