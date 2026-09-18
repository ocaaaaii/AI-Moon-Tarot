/**
 * Card category helpers for 天地人 split-deck draws.
 *
 * Based on the wiki frontmatter (arcana field):
 *   major  → 天（靈魂課題）  IDs 0–21   (22 cards)
 *   minor  → 地（現實事件）  IDs 22–61  (40 cards)
 *   court  → 人（心態鏡子）  IDs 62–77  (16 cards)
 */

export const MAJOR_IDS: readonly number[] = Array.from({ length: 22 }, (_, i) => i);
export const MINOR_NUMBERED_IDS: readonly number[] = Array.from({ length: 40 }, (_, i) => i + 22);
export const COURT_IDS: readonly number[] = Array.from({ length: 16 }, (_, i) => i + 62);

// A `drawCategoryCards()` used to live here. Nothing ever called it, and it
// rolled `0.5` for reversed while every real draw rolled `0.35` — sitting in
// exactly the place someone would look when implementing an automatic 天地人
// draw. `autoDraw` in `lib/tarot/draw.ts` is the one to use; it shares its
// orientation roll with the manual fan. Re-pointing this one at that file
// would have made `cardCategories` and `draw` import each other.
