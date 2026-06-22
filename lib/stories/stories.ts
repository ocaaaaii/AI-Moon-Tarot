import type { Story } from "./types";
import { STORY1 } from "./story1";

/**
 * Registry of all 月神天啟 stories — same single-source-of-truth pattern as
 * lib/tarot/avatars.ts / lib/omikuji/avatars.ts. Adding a new story later
 * means adding one entry here (plus its own lib/stories/storyN.ts file),
 * not touching the selector page or the viewer component.
 */
export const STORIES: Story[] = [STORY1];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}
