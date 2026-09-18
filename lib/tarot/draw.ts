/**
 * How a card gets drawn — one definition, shared by both ways of drawing.
 *
 * The visitor can pick cards off the 3D fan, or ask the master to draw for
 * them. Those are two code paths to the same ritual, and the moment they
 * disagree about anything the difference is invisible but real: a deck that
 * is 35% reversed by hand and 50% reversed automatically would quietly give
 * two people different readings for the same question.
 *
 * `REVERSED_CHANCE` was already written out three times before this file
 * existed — 0.35 in `CardFanScene`, 0.35 again in two unused components, and
 * 0.5 in a `drawCategoryCards` nobody called. That last one is exactly the
 * landmine this file removes: it sat in the obvious place to look when
 * implementing an automatic 天地人 draw.
 */
import type { CardRequest } from "./types";
import type { TarotSpread } from "./spreads";
import { MAJOR_IDS, MINOR_NUMBERED_IDS, COURT_IDS } from "./cardCategories";

/** probability that any drawn card comes up reversed */
export const REVERSED_CHANCE = 0.35;

export function rollReversed(): boolean {
  return Math.random() < REVERSED_CHANCE;
}

const FULL_DECK: readonly number[] = Array.from({ length: 78 }, (_, i) => i);

/**
 * `count` distinct cards from `pool`, in random order, each with its own
 * orientation. Never mutates `pool`; asking for more than it holds gives the
 * whole pool rather than throwing — a spread that big does not exist, and a
 * short draw is a better failure than a blank screen.
 */
export function drawFrom(pool: readonly number[], count: number): CardRequest[] {
  const bag = [...pool];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag.slice(0, Math.min(count, bag.length)).map(id => ({ id, reversed: rollReversed() }));
}

/** 天地人 draws one card from each of these, in this order. */
export const CATEGORY_POOLS: readonly (readonly number[])[] = [
  MAJOR_IDS,
  MINOR_NUMBERED_IDS,
  COURT_IDS,
];

/**
 * Draw a whole spread without the visitor picking.
 *
 * Every pool restriction the manual path enforces is enforced here too — the
 * chakra spread stays inside the Major Arcana, 天地人 still takes one card
 * from each category in order. An automatic draw that ignored those would
 * produce a reading the persona's prompt cannot make sense of.
 */
export function autoDraw(spread: TarotSpread): CardRequest[] {
  switch (spread.drawMode) {
    case "chakra":
      return drawFrom(MAJOR_IDS, spread.positions.length);
    case "category":
      return CATEGORY_POOLS.map(pool => drawFrom(pool, 1)[0]);
    default:
      return drawFrom(FULL_DECK, spread.positions.length);
  }
}
