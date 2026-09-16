/**
 * Landing page content registry — the single source of truth for every
 * string and image on the portal page.
 *
 * Same pattern as `lib/tarot/avatars.ts` and `lib/stories/stories.ts`:
 * changing copy means editing this file, never the section components.
 *
 * Character data is NOT duplicated here — `CharacterRoster` reads
 * `TAROT_AVATARS` directly and only looks up its thumbnail path below.
 * Note that `TarotAvatar.realName` must never be rendered on this page
 * (see CLAUDE.md: the dual-identity reveal belongs to the shrine profile).
 */

export type SectionId = "home" | "world" | "gates" | "characters" | "story";

export interface NavItem {
  id: SectionId;
  label: string;
}

export interface GateCard {
  href: string;
  titleEn: string;
  titleZh: string;
  tagline: string;
  image: string;
  /** rgba(...) used for the hover glow, matching that world's accent */
  glow: string;
}

/** Fixed-nav heights, shared by SiteNav and the sections' scroll-margin. */
export const NAV_HEIGHT = { mobile: 60, desktop: 72 } as const;

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "HOME" },
  { id: "world", label: "WORLD" },
  { id: "gates", label: "TAROT" },
  { id: "characters", label: "CHARACTERS" },
  { id: "story", label: "STORY" },
];

export const HERO_COPY = {
  kicker: "A GUIDE FOR YOUR HIDDEN SELF",
  /** vertical strip of text on the left edge (desktop only) */
  aside: "SOME ANSWERS LIVE INSIDE YOU ALREADY.",
  titleTop: "MOON",
  titleBottom: "Tarot",
  rule: "CARDS · ORACLE · DESTINY",
  /** C1-B, chosen 2026-09-16 */
  subtitleLines: ["你要的答案，從來不在牌裡，", "而在你翻開它的那一刻。"],
  ctaLabel: "ENTER THE WORLD",
  ctaHref: "/tarot",
} as const;

export const WORLD_COPY = {
  kicker: "THE WORLD",
  heading: "夜色之下",
  /** C2-C, chosen 2026-09-16 */
  body: "月亮升起的時候，這座城就醒了。燭火、紙牌、籤筒、星圖，全都只為了同一件事：讓你安靜下來，聽見自己。我們不告訴你該往哪走，只把整個夜晚留給你——待久一點，直到你自己想起答案。",
  image: "/assets/landing/world.jpg",
  ctaLabel: "✦ 與月神相約",
} as const;

export const GATES: GateCard[] = [
  {
    href: "/tarot",
    titleEn: "TAROT SHOP",
    titleZh: "月之塔羅店鋪",
    tagline: "燭光與紙牌 · 在故事裡看見自己",
    image: "/assets/landing/gate-tarot.jpg",
    glow: "rgba(184,168,200,0.35)",
  },
  {
    href: "/shrine",
    titleEn: "MOON SHRINE",
    titleZh: "月神神社",
    tagline: "籤詩與月光 · 在儀式裡安放心事",
    image: "/assets/landing/gate-shrine.jpg",
    glow: "rgba(212,168,89,0.35)",
  },
  {
    href: "/garden",
    titleEn: "THE DIVINE REALM",
    titleZh: "眾神之庭",
    tagline: "星象與神諭 · 在群星之下找到你的方向",
    image: "/assets/landing/gate-garden.jpg",
    glow: "rgba(120,80,220,0.40)",
  },
  {
    href: "/stories",
    titleEn: "STORIES",
    titleZh: "月神天啟",
    tagline: "群星與日常 · 在命運流轉中尋回羈絆",
    image: "/assets/landing/gate-stories.jpg",
    glow: "rgba(168,120,230,0.35)",
  },
];

export const CHARACTERS_COPY = {
  kicker: "THE SEVEN",
  heading: "七個靈魂，七種陪你的方式",
  body: "每一位都有自己的脾氣與說話方式。挑一個你此刻最想見的。",
  /** the cards expand — without this line most visitors never find out */
  hint: "點一下，聽聽他們怎麼說",
  /** faint plate behind the roster — atmosphere, not a picture to look at */
  backdrop: "/assets/landing/seven-backdrop.jpg",
} as const;

export const STORY_COPY = {
  kicker: "SACRED CHRONICLES",
  heading: "月神天啟",
  body: "神明也有日常。那些不在占卜裡的時刻，才是他們真正的樣子。",
  image: "/assets/landing/story-cover.jpg",
  ctaLabel: "翻開故事",
  ctaHref: "/stories",
} as const;

export const QUOTE_COPY = {
  en: "Every light sleeps, every heart dreams.",
  zh: "願每一個靈魂，都能在這裡找到屬於自己的答案。",
  background: "/assets/landing/footer-band.jpg",
} as const;

export const FOOTER_COPY = {
  band: "CARDS · HEALING · SELF · DESTINY",
  developer: { label: "CA", href: "https://ca-portfolio.app/" },
  copyright: "© 2026 AI MOON TAROT · All rights reserved.",
} as const;

/** avatar id (lib/tarot/avatars.ts) → 480px-wide thumbnail for the roster */
export const CHARACTER_THUMBS: Record<string, string> = {
  cynthia: "/assets/landing/characters/cynthia.jpg",
  eos: "/assets/landing/characters/eos.jpg",
  helios: "/assets/landing/characters/helios.jpg",
  athena: "/assets/landing/characters/athena.jpg",
  poseidon: "/assets/landing/characters/poseidon.jpg",
  nyx: "/assets/landing/characters/nyx.jpg",
  persephone: "/assets/landing/characters/persephone.jpg",
};
