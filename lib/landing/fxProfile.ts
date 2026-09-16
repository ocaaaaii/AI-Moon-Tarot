/**
 * Motion constants for the landing page.
 *
 * Tuned to the intensity the PO picked on 2026-09-16 — "a living
 * illustration": you notice it if you look, it never competes with the copy.
 * The earlier `subtle` / `vivid` pair and its `?fx=` switch are gone now that
 * the choice is made.
 *
 * Ambient light (candles, moon, crystal balls, petals) lives in
 * `lib/landing/ambient.ts`; this file is the hero's scroll behaviour and the
 * gate-card hover.
 */

export const FX = {
  /** hero art sinking + dimming as it scrolls away (ScrollTrigger scrub) */
  parallax: { yPercent: 8, darken: 0.45 },
  /** pointer parallax on the hero — px at the extremes */
  pointer: { plate: 8, light: 14 },
  /** gate-card hover */
  hover: { lift: -5, imageScale: 1.05, glowOpacity: 0.55, duration: 0.5 },
} as const;
