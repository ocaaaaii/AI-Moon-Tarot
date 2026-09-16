import type { AvatarAccent } from "@/lib/tarot/avatars";

/**
 * Accent colours as bare `r,g,b` triples, for `rgba(${ACCENT_RGB[a]}, 0.4)`
 * in inline styles.
 *
 * Deliberately NOT Tailwind classes. `components/ui/AvatarProfile.tsx` solves
 * the same problem with a static class lookup because Tailwind's JIT cannot
 * see `text-morandi-${accent}`; on the landing page the accent drives glows
 * and border tints at varying alpha, which would need a class per alpha step.
 * Inline rgba sidesteps the whole issue.
 *
 * Values mirror the Morandi palette in tailwind.config.ts — keep in sync.
 */
export const ACCENT_RGB: Record<AvatarAccent, string> = {
  lavender: "184,168,200", // #b8a8c8
  gold: "212,168,89", // #d4a859
  slate: "138,150,168", // #8a96a8
  rose: "201,168,160", // #c9a8a0
  sage: "160,176,160", // #a0b0a0
  mauve: "176,160,184", // #b0a0b8
  stone: "168,152,128", // #a89880
};
