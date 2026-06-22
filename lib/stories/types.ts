/**
 * 月神天啟 (Sacred Chronicles) — the third "door" alongside the tarot shop
 * and shrine. A cinematic slideshow of each soul's daily-life story, told
 * through CG stills + narration text.
 *
 * Monetization (月幣 → 御守 → unlock) is explicitly NOT built yet — there's
 * no currency/wallet system in this project at all. Every story here is
 * freely viewable for now, same posture as `isMember`/`ENFORCE_MEMBERSHIP`
 * elsewhere: the data model has room for it (`locked` flag below), but
 * nothing actually gates on it until a real account/payment system exists.
 * Do not invent a fake unlock mechanism — when that's ready, gate here.
 */

export interface StorySlide {
  /** image path under /public, e.g. "/assets/Storys/Story1/01.jpg" */
  image: string;
  /** narration text for this beat — 1:1 with story1.md's numbered lines */
  text: string;
  /** small kicker shown above the text, e.g. "第一幕：夢境與天啟的呢喃" —
   * only set on the first slide of each act, so it reads as a chapter
   * marker rather than repeating on every single slide */
  act?: string;
  /**
   * "R,G,B" ambient glow color for this beat, synced to the container's
   * background glow as the slideshow advances — warm gold for cozy daily
   * life beats, deep starry purple for divine/mythic beats. Same
   * "R,G,B" inline-rgba() convention as RegionRitual's accentRGB.
   */
  glowRGB: string;
}

export interface Story {
  id: string;
  title: string;
  /** one-line hook shown on the story's selector card */
  tagline: string;
  cover: string;
  /** not enforced yet — see file header */
  locked?: boolean;
  slides: StorySlide[];
}
