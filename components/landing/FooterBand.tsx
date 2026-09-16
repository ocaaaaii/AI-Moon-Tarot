"use client";

import { QUOTE_COPY } from "@/lib/landing/sections";
import { FOOTER_SCENE } from "@/lib/landing/ambient";
import AmbientScene from "./AmbientScene";
import QuoteBand from "./QuoteBand";
import SiteFooter from "./SiteFooter";

interface Props {
  onOpenGuide: () => void;
}

/**
 * Closing band. The quote and the footer share ONE full-bleed plate
 * (`footer-band.jpg`) rather than two stacked images — that art has a wide
 * pool of shadow down the middle and candles anchoring both edges, so
 * splitting it would put a seam right through the composition.
 *
 * ── Phase 2 note ────────────────────────────────────────────────
 * The membership / pricing block goes directly ABOVE this component when
 * that ships. Nothing here needs to move; see docs/PRD-landing-v7.md §8.
 * Do not build it until there is a real account system.
 * ────────────────────────────────────────────────────────────────
 */
export default function FooterBand({ onOpenGuide }: Props) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#0a0712" }}>
      <div className="absolute inset-0">
        <img
          src={QUOTE_COPY.background}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        {/* fade the top edge into the story section above */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #0a0712 0%, rgba(10,7,18,0.6) 20%, rgba(10,7,18,0.55) 70%, rgba(10,7,18,0.85) 100%)",
          }}
        />

        {/* centre pool so both the quote and the footer text stay readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 60% at 50% 45%, rgba(10,7,18,0.8) 0%, rgba(10,7,18,0.2) 65%, transparent 100%)",
          }}
        />
        {/* ABOVE the scrims, or the shadow pool swallows it. Nothing is
            placed in the middle: that negative space belongs to the quote */}
        <AmbientScene scene={FOOTER_SCENE} />
      </div>

      <div className="relative z-10">
        <QuoteBand />
        <SiteFooter onOpenGuide={onOpenGuide} />
      </div>
    </section>
  );
}
