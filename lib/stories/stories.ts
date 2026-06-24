import type { Story, StorySeries, StoryEntry } from "./types";
import { STORY1 } from "./story1";
import { STORY2_KANON } from "./story2-kanon";
import { STORY2_USHIO } from "./story2-ushio";
import { STORY2_MAYA } from "./story2-maya";
import { STORY2_HARUMA } from "./story2-haruma";
import { STORY2_IORI } from "./story2-iori";
import { STORY2_AKIRA } from "./story2-akira";
import { STORY2_TSUKINO } from "./story2-tsukino";

/**
 * Registry of all top-level entries for the Sacred Chronicles selector.
 * Same single-source-of-truth pattern as lib/tarot/avatars.ts.
 *
 * TOP_LEVEL is what the /stories selector page renders. An entry can be:
 *   - Story       => clicking navigates to /stories/{id}  (slide viewer)
 *   - StorySeries => clicking navigates to /stories/{id}  (static sub-selector
 *       page that takes priority over [id] viewer in Next.js routing)
 *       See app/stories/story2/page.tsx.
 *
 * Individual stories inside a series are registered in ALL_STORIES so
 * the dynamic [id] viewer can find them by id.
 *
 * Adding a new standalone story: add import + entry to TOP_LEVEL + ALL_STORIES.
 * Adding a new series entry: add story imports + ALL_STORIES entries + update
 *   series storyIds + create its sub-selector page.
 */

// Story 2 series definition
const STORY2_SERIES: StorySeries = {
  id: "story2",
  type: "series",
  title: "神諭流轉時：\n塔羅牌背後的七重覺醒",
  tagline: "七位靈魂，七位神明，七次命運的相遇——\n一切都是月亮的安排。",
  cover: "/assets/Stories/Story2/封面.jpg",
  storyIds: [
    "story2-kanon",
    "story2-ushio",
    "story2-maya",
    "story2-haruma",
    "story2-iori",
    "story2-akira",
    "story2-tsukino",
  ],
};

// All individual stories — looked up by the [id] slide viewer
const ALL_STORIES: Story[] = [
  STORY1,
  STORY2_KANON,
  STORY2_USHIO,
  STORY2_MAYA,
  STORY2_HARUMA,
  STORY2_IORI,
  STORY2_AKIRA,
  STORY2_TSUKINO,
];

// Top-level selector entries (standalone stories + series)
export const TOP_LEVEL: StoryEntry[] = [
  STORY1,
  STORY2_SERIES,
];

/** Find a single Story by id (used by the [id] slide viewer). */
export function getStory(id: string): Story | undefined {
  return ALL_STORIES.find((s) => s.id === id);
}

/** Find a StorySeries by id (used by series sub-selector pages). */
export function getSeries(id: string): StorySeries | undefined {
  const entry = TOP_LEVEL.find((e) => e.id === id);
  if (entry && entry.type === "series") return entry as StorySeries;
  return undefined;
}

/** Get all individual Story entries that belong to a given series, in order. */
export function getSeriesStories(seriesId: string): Story[] {
  const series = getSeries(seriesId);
  if (!series) return [];
  return series.storyIds
    .map((sid) => ALL_STORIES.find((s) => s.id === sid))
    .filter((s): s is Story => s !== undefined);
}


/**
 * Find the id of the series that contains a given story, if any.
 * Used by the [id] viewer to route the "回到篇章列表" button back to
 * the series sub-selector instead of the top-level /stories page.
 */
export function getParentSeriesId(storyId: string): string | undefined {
  for (const entry of TOP_LEVEL) {
    if (entry.type === "series" && entry.storyIds.includes(storyId)) {
      return entry.id;
    }
  }
  return undefined;
}

// Legacy export so any existing import of STORIES keeps compiling.
// Prefer TOP_LEVEL for new code.
export const STORIES = TOP_LEVEL;
