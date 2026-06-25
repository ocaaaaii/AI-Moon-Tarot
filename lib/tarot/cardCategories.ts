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

function pickRandom(arr: readonly number[]): number {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Draw one card from each category for a 天地人 reading. */
export function drawCategoryCards(): Array<{ id: number; reversed: boolean }> {
  return [
    { id: pickRandom(MAJOR_IDS), reversed: Math.random() < 0.5 },
    { id: pickRandom(MINOR_NUMBERED_IDS), reversed: Math.random() < 0.5 },
    { id: pickRandom(COURT_IDS), reversed: Math.random() < 0.5 },
  ];
}
