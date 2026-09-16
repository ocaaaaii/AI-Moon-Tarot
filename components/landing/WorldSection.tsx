"use client";

import { motion } from "motion/react";

import { WORLD_COPY } from "@/lib/landing/sections";
import { WORLD_SCENE } from "@/lib/landing/ambient";
import AmbientScene from "./AmbientScene";

interface Props {
  onOpenTour: () => void;
}

/** The brand narrative, set over the celestial-city plate. */
export default function WorldSection({ onOpenTour }: Props) {
  return (
    <section
      id="world"
      className="relative scroll-mt-[60px] md:scroll-mt-[72px] overflow-hidden"
      style={{ background: "#0a0712" }}
    >
      <div className="absolute inset-0">
        <img
          src={WORLD_COPY.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          // portrait source (0.56) in a wide band: centring the cover crop
          // lands on the desk, and the window and moon — the reason to use
          // this plate at all — end up off-frame above it
          style={{ objectPosition: "center 26%" }}
        />
        {/* dissolve both edges so the plate reads as part of the page, not a banner */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #0a0712 0%, rgba(10,7,18,0.55) 22%, rgba(10,7,18,0.55) 78%, #0a0712 100%)",
          }}
        />

        {/* centre pool of shadow to carry the copy */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 58% 62% at 50% 50%, rgba(10,7,18,0.82) 0%, rgba(10,7,18,0.25) 62%, transparent 100%)",
          }}
        />
        {/* ABOVE the scrims on purpose — underneath them a 0.82-alpha
            shadow pool simply swallowed the light and the whole effect read
            as "nothing is moving" */}
        <AmbientScene scene={WORLD_SCENE} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl mx-auto px-6 py-28 md:py-40 text-center"
      >
        <p className="font-display text-cream-200/50 text-[11px] tracking-[0.42em] uppercase">
          {WORLD_COPY.kicker}
        </p>

        <h2
          className="font-serif text-cream-50 mt-4"
          style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", letterSpacing: "0.12em" }}
        >
          {WORLD_COPY.heading}
        </h2>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-morandi-gold/35" />
          <span className="text-morandi-gold/45 text-xs">✦</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-morandi-gold/35" />
        </div>

        <p
          className="text-cream-100/78 text-sm md:text-base mt-8 mx-auto max-w-xl"
          style={{ lineHeight: 2.1, letterSpacing: "0.04em", textShadow: "0 2px 18px rgba(10,7,18,0.9)" }}
        >
          {WORLD_COPY.body}
        </p>

        <button
          onClick={onOpenTour}
          className="mt-10 px-7 py-3 rounded-full border border-cream-200/20 text-cream-200/70 text-sm tracking-[0.2em] hover:border-morandi-gold/50 hover:text-cream-100 hover:bg-morandi-gold/10 transition-colors duration-300"
        >
          {WORLD_COPY.ctaLabel}
        </button>
      </motion.div>
    </section>
  );
}
