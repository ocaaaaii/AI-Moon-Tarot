/**
 * Where the light lives in each painted scene.
 *
 * Pure data, same registry pattern as `lib/landing/sections.ts` — the
 * AmbientScene component knows nothing about where any particular candle is.
 *
 * Coordinates are fractions of the plate (0..1), read off the artwork itself.
 * They are per-IMAGE, not per-section: the hero ships two different crops
 * (`kv-desktop.jpg` at 1.78 and `kv-mobile.jpg` at 0.89), so the same fraction
 * lands somewhere else on each. Hence two hero scenes.
 *
 * `size` is a fraction of the container's WIDTH; each point is square via
 * aspect-ratio, and centred with negative percentage margins (percentage
 * margins resolve against width, so one value centres both axes). Centring
 * this way rather than with a transform leaves `transform` entirely to GSAP.
 *
 * Two kinds of point:
 *   · no `sprite` — a soft radial bloom. Right for candle halos and moonlight,
 *     where the shape is already painted and we are only adding glow.
 *   · with `sprite` — a real cut-out from the PO's sprite sheets (star flares,
 *     galaxies). These read far more clearly than a gradient, which is what
 *     the first light-only pass was missing.
 *
 * Every sprite lives in the `screen`-blended layer, so its dark background
 * contributes nothing — the cut-outs do not need perfect keying.
 */

export type Behaviour = "breathe" | "flicker" | "twinkle" | "shimmer";

export interface LightPoint {
  /** 0..1 across the plate */
  x: number;
  /** 0..1 down the plate */
  y: number;
  /** fraction of container width */
  size: number;
  /** bare "r,g,b" — only used when there is no sprite */
  rgb: string;
  behaviour: Behaviour;
  /** peak opacity, 0..1 (default 0.5) */
  peak?: number;
  /** render on phones too — default false, so only the big lights survive */
  onMobile?: boolean;
  /** cut-out PNG; replaces the radial bloom */
  sprite?: string;
  /** slowly rotate the sprite (crystal balls, astrolabes) */
  spin?: boolean;
}

export interface AmbientScene {
  points: LightPoint[];
  /**
   * Drifting blossom petals; omit for scenes with no blossoms in frame.
   * `opacity` and `scale` let a quiet scene keep a couple of barely-there
   * petals instead of a snowfall — the footer needs restraint, the hero
   * can afford to be lush.
   */
  petals?: { desktop: number; mobile: number; opacity?: number; scale?: number };
}

/** warm candle flame */
const FLAME = "255,208,140";
/** cool moonlight / starlight */
const MOON = "249,243,227";
/** distant city + crystal */
const CITY = "196,208,255";

const FX = "/assets/landing/fx";
const STAR = [`${FX}/star-a.png`, `${FX}/star-b.png`, `${FX}/star-c.png`, `${FX}/star-d.png`];
const STAR_BIG = `${FX}/star-e.png`;
const STAR_RING = `${FX}/star-ring.png`;
const STAR_COOL = `${FX}/star-cool-a.png`;
const GALAXY = `${FX}/galaxy.png`;
const GALAXY_S = `${FX}/galaxy-small.png`;
const ORBIT = `${FX}/orbit-rings.png`;
const DOTTED = `${FX}/dotted-ring.png`;

export const PETAL_SPRITES = [
  `${FX}/petal-a.png`,
  `${FX}/petal-b.png`,
  `${FX}/petal-c.png`,
  `${FX}/petal-d.png`,
  `${FX}/petal-e.png`,
  `${FX}/petal-f.png`,
  `${FX}/blossom.png`,
];

export const KV_DESKTOP_SCENE: AmbientScene = {
  points: [
    // the crescent behind her — a bloom, not a sprite: the moon is already
    // painted and a second moon on top would fight the art
    { x: 0.48, y: 0.22, size: 0.3, rgb: MOON, behaviour: "breathe", peak: 0.5, onMobile: true },
    // sky
    { x: 0.29, y: 0.1, size: 0.07, rgb: MOON, behaviour: "twinkle", peak: 0.95, sprite: STAR_BIG },
    { x: 0.83, y: 0.12, size: 0.06, rgb: MOON, behaviour: "twinkle", peak: 0.85, sprite: STAR_RING },
    { x: 0.55, y: 0.06, size: 0.035, rgb: MOON, behaviour: "twinkle", peak: 0.8, sprite: STAR[0] },
    { x: 0.66, y: 0.28, size: 0.03, rgb: MOON, behaviour: "twinkle", peak: 0.7, sprite: STAR[1] },
    { x: 0.37, y: 0.05, size: 0.025, rgb: CITY, behaviour: "twinkle", peak: 0.7, sprite: STAR_COOL },
    { x: 0.62, y: 0.15, size: 0.18, rgb: CITY, behaviour: "breathe", peak: 0.22 },
    // celestial city
    { x: 0.8, y: 0.3, size: 0.12, rgb: CITY, behaviour: "breathe", peak: 0.4 },
    { x: 0.72, y: 0.45, size: 0.16, rgb: CITY, behaviour: "twinkle", peak: 0.3 },
    { x: 0.8, y: 0.63, size: 0.1, rgb: CITY, behaviour: "shimmer", peak: 0.24 },
    // left-hand table: lantern, crystal balls, orrery, candles
    { x: 0.045, y: 0.71, size: 0.07, rgb: FLAME, behaviour: "flicker", peak: 0.8 },
    { x: 0.086, y: 0.72, size: 0.05, rgb: CITY, behaviour: "shimmer", peak: 0.75, sprite: GALAXY_S, spin: true },
    { x: 0.115, y: 0.885, size: 0.062, rgb: CITY, behaviour: "shimmer", peak: 0.7, sprite: GALAXY, spin: true },
    { x: 0.04, y: 0.83, size: 0.075, rgb: MOON, behaviour: "shimmer", peak: 0.5, sprite: ORBIT, spin: true },
    { x: 0.075, y: 0.94, size: 0.08, rgb: FLAME, behaviour: "flicker", peak: 0.78, onMobile: true },
    { x: 0.26, y: 0.94, size: 0.06, rgb: FLAME, behaviour: "flicker", peak: 0.65 },
    // right-hand balcony: gold lantern + candles
    { x: 0.845, y: 0.8, size: 0.08, rgb: FLAME, behaviour: "flicker", peak: 0.82, onMobile: true },
    { x: 0.785, y: 0.85, size: 0.05, rgb: FLAME, behaviour: "flicker", peak: 0.65 },
    { x: 0.885, y: 0.93, size: 0.05, rgb: FLAME, behaviour: "flicker", peak: 0.6 },
  ],
  petals: { desktop: 7, mobile: 3 },
};

/** the 0.89-ratio crop: tighter on her, city pushed to the right edge */
export const KV_MOBILE_SCENE: AmbientScene = {
  points: [
    { x: 0.52, y: 0.2, size: 0.42, rgb: MOON, behaviour: "breathe", peak: 0.45, onMobile: true },
    { x: 0.42, y: 0.11, size: 0.1, rgb: MOON, behaviour: "twinkle", peak: 0.95, sprite: STAR_BIG, onMobile: true },
    { x: 0.89, y: 0.18, size: 0.09, rgb: MOON, behaviour: "twinkle", peak: 0.85, sprite: STAR_RING, onMobile: true },
    { x: 0.7, y: 0.07, size: 0.05, rgb: CITY, behaviour: "twinkle", peak: 0.75, sprite: STAR_COOL, onMobile: true },
    { x: 0.85, y: 0.5, size: 0.2, rgb: CITY, behaviour: "twinkle", peak: 0.3, onMobile: true },
    { x: 0.03, y: 0.57, size: 0.11, rgb: FLAME, behaviour: "flicker", peak: 0.78, onMobile: true },
    { x: 0.93, y: 0.79, size: 0.12, rgb: FLAME, behaviour: "flicker", peak: 0.78, onMobile: true },
  ],
  petals: { desktop: 4, mobile: 4 },
};

/**
 * world-library.jpg — the moonlit library: a gothic window with a full moon
 * over a spired city, a desk of candles, a crystal ball and an orrery.
 *
 * ⚠ These coordinates were rebuilt from scratch when the plate changed. The
 * previous set belonged to the celestial-city balcony and, reused here,
 * would have hung candle glows in mid-air — light positions are fractions of
 * THEIR OWN image (CLAUDE.md).
 *
 * The source is portrait (0.56) in a wide band, so `object-cover` keeps only
 * a horizontal strip. `WorldSection` pulls that strip to the top of the art,
 * which means the lights below live in the window half of the picture — the
 * desk candles further down are cropped away and are deliberately absent.
 */
export const WORLD_SCENE: AmbientScene = {
  points: [
    // the full moon in the window — the anchor of this composition
    { x: 0.565, y: 0.3, size: 0.17, rgb: MOON, behaviour: "breathe", peak: 0.44, onMobile: true },
    // the spired city glowing under it
    { x: 0.52, y: 0.62, size: 0.16, rgb: CITY, behaviour: "twinkle", peak: 0.26, onMobile: true },
    { x: 0.62, y: 0.55, size: 0.1, rgb: CITY, behaviour: "breathe", peak: 0.2 },
    // stars in the window's upper panes
    { x: 0.61, y: 0.1, size: 0.05, rgb: MOON, behaviour: "twinkle", peak: 0.85, sprite: STAR[2], onMobile: true },
    { x: 0.44, y: 0.16, size: 0.035, rgb: MOON, behaviour: "twinkle", peak: 0.7, sprite: STAR[3] },
    { x: 0.79, y: 0.12, size: 0.032, rgb: CITY, behaviour: "twinkle", peak: 0.6, sprite: STAR_COOL },
    // the tall lit candle to the right of the window
    { x: 0.845, y: 0.36, size: 0.055, rgb: FLAME, behaviour: "flicker", peak: 0.8, onMobile: true },
    // the gold orrery on the right shelf
    { x: 0.9, y: 0.62, size: 0.075, rgb: MOON, behaviour: "shimmer", peak: 0.42, sprite: DOTTED, spin: true },
    // the small hanging lantern top-right
    { x: 0.77, y: 0.05, size: 0.04, rgb: FLAME, behaviour: "flicker", peak: 0.6 },
  ],
  petals: { desktop: 3, mobile: 2, opacity: 0.5, scale: 0.8 },
};

/**
 * 底部.png — candles and books left, orrery and crystal balls right.
 * Nothing is placed in the middle: that negative space carries the pull
 * quote and the footer text, and the PO was explicit that the animation
 * serves the UI rather than competing with it.
 */
export const FOOTER_SCENE: AmbientScene = {
  points: [
    // Candles only, plus two faint moons. The right-hand side of this plate
    // (orrery, crystal balls) is already the most detailed thing in frame —
    // an earlier pass laid galaxy and orbit-ring sprites over it and the PO
    // rightly called it unnatural: two layers of ornament fighting. The fix
    // is to let what is painted there simply breathe, not to add anything.
    { x: 0.09, y: 0.68, size: 0.07, rgb: FLAME, behaviour: "flicker", peak: 0.8, onMobile: true },
    { x: 0.055, y: 0.86, size: 0.05, rgb: FLAME, behaviour: "flicker", peak: 0.55 },
    { x: 0.955, y: 0.28, size: 0.06, rgb: FLAME, behaviour: "flicker", peak: 0.78, onMobile: true },
    // the big crystal ball: a slow bloom, no sprite inside it
    { x: 0.93, y: 0.7, size: 0.075, rgb: CITY, behaviour: "breathe", peak: 0.26 },
    // the orrery: the faintest lift so it is not dead, nothing drawn on top
    { x: 0.855, y: 0.42, size: 0.1, rgb: MOON, behaviour: "breathe", peak: 0.16 },
    { x: 0.185, y: 0.05, size: 0.05, rgb: MOON, behaviour: "breathe", peak: 0.4 },
    { x: 0.735, y: 0.07, size: 0.05, rgb: MOON, behaviour: "breathe", peak: 0.36 },
    // two small star flares, left side only, well away from the quote
    { x: 0.235, y: 0.14, size: 0.035, rgb: MOON, behaviour: "twinkle", peak: 0.6, sprite: STAR[0], onMobile: true },
    { x: 0.31, y: 0.24, size: 0.024, rgb: CITY, behaviour: "twinkle", peak: 0.5, sprite: STAR_COOL },
  ],
  // a couple of petals drifting, not a snowfall
  petals: { desktop: 2, mobile: 1, opacity: 0.4, scale: 0.7 },
};
