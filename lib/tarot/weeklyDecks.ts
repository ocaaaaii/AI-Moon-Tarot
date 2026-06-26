/**
 * Weekly Deck Definitions — Pick-a-Card Oracle system
 *
 * Client-safe (no `fs` imports).
 * Defines the three weekly themes, pile configs, card image paths,
 * and shuffle utilities.
 */

// ─── Card slug map (mirrors wikiLoader, needed client-side) ──────────────────
export const CARD_SLUGS: Record<number, string> = {
  0: "fool", 1: "magician", 2: "high-priestess", 3: "empress",
  4: "emperor", 5: "hierophant", 6: "lovers", 7: "chariot",
  8: "strength", 9: "hermit", 10: "wheel-of-fortune", 11: "justice",
  12: "hanged-man", 13: "death", 14: "temperance", 15: "devil",
  16: "tower", 17: "star", 18: "moon", 19: "sun",
  20: "judgement", 21: "world",
  22: "wands-ace", 23: "wands-two", 24: "wands-three", 25: "wands-four",
  26: "wands-five", 27: "wands-six", 28: "wands-seven", 29: "wands-eight",
  30: "wands-nine", 31: "wands-ten",
  32: "cups-ace", 33: "cups-two", 34: "cups-three", 35: "cups-four",
  36: "cups-five", 37: "cups-six", 38: "cups-seven", 39: "cups-eight",
  40: "cups-nine", 41: "cups-ten",
  42: "swords-ace", 43: "swords-two", 44: "swords-three", 45: "swords-four",
  46: "swords-five", 47: "swords-six", 48: "swords-seven", 49: "swords-eight",
  50: "swords-nine", 51: "swords-ten",
  52: "pentacles-ace", 53: "pentacles-two", 54: "pentacles-three", 55: "pentacles-four",
  56: "pentacles-five", 57: "pentacles-six", 58: "pentacles-seven", 59: "pentacles-eight",
  60: "pentacles-nine", 61: "pentacles-ten",
  62: "court-wands-page", 63: "court-wands-knight",
  64: "court-wands-queen", 65: "court-wands-king",
  66: "court-cups-page", 67: "court-cups-knight",
  68: "court-cups-queen", 69: "court-cups-king",
  70: "court-swords-page", 71: "court-swords-knight",
  72: "court-swords-queen", 73: "court-swords-king",
  74: "court-pentacles-page", 75: "court-pentacles-knight",
  76: "court-pentacles-queen", 77: "court-pentacles-king",
};

/** Public URL for a card's face image. */
export function cardImagePath(id: number): string {
  const slug = CARD_SLUGS[id] ?? "fool";
  return `/assets/cards/${String(id).padStart(2, "0")}-${slug}.webp`;
}

// ─── Card display names ───────────────────────────────────────────────────────

const MAJOR_NAMES: Record<number, string> = {
  0: "The Fool", 1: "The Magician", 2: "The High Priestess", 3: "The Empress",
  4: "The Emperor", 5: "The Hierophant", 6: "The Lovers", 7: "The Chariot",
  8: "Strength", 9: "The Hermit", 10: "Wheel of Fortune", 11: "Justice",
  12: "The Hanged Man", 13: "Death", 14: "Temperance", 15: "The Devil",
  16: "The Tower", 17: "The Star", 18: "The Moon", 19: "The Sun",
  20: "Judgement", 21: "The World",
};

const SUIT_NAMES = ["Wands", "Cups", "Swords", "Pentacles"];
const NUMBER_NAMES = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const COURT_NAMES = ["Page", "Knight", "Queen", "King"];

/**
 * Human-readable card name for display below revealed cards.
 * e.g. cardDisplayName(8) → "Strength"
 *      cardDisplayName(32) → "Ace of Cups"
 *      cardDisplayName(65) → "King of Wands"
 */
export function cardDisplayName(id: number): string {
  if (id <= 21) return MAJOR_NAMES[id] ?? "Unknown";
  if (id <= 61) {
    const suitIndex = Math.floor((id - 22) / 10);
    const numIndex = (id - 22) % 10;
    return `${NUMBER_NAMES[numIndex]} of ${SUIT_NAMES[suitIndex]}`;
  }
  // Court cards 62–77: 4 suits × 4 courts
  const courtOffset = id - 62;
  const suitIndex = Math.floor(courtOffset / 4);
  const courtIndex = courtOffset % 4;
  return `${COURT_NAMES[courtIndex]} of ${SUIT_NAMES[suitIndex]}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type PileId = "A" | "B" | "C" | "D";

export interface PileConfig {
  id: PileId;
  symbol: string;   // emoji displayed on the face-down pile
  label: string;    // e.g. "玫瑰"
  glowColor: string; // rgba for hover glow + selection accent
}

export interface DeckTheme {
  id: string;
  themeTitle: string;       // "愛神給你的戀愛指南"
  themeSubtitle: string;    // one-line teaser
  hostPersonaId: string;    // "persephone"
  hostDisplayName: string;  // "Persephone"
  hostImage: string;        // "/assets/Persephone.png"
  accentColor: string;      // rgba for page-level theming
  piles: PileConfig[];
}

// ─── Pile card assignment ─────────────────────────────────────────────────────

/** Simple string hash → unsigned 32-bit integer. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Seeded Fisher-Yates shuffle using a simple LCG PRNG.
 * Same seed → same output every time (deterministic).
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Assign 4 cards to each of 4 piles, seeded by (weekNumber, deckId).
 * Every user who opens the same deck in the same week gets the same layout —
 * collective unconscious: same card for everyone.
 */
export function generatePileCardsSeeded(
  weekNumber: number,
  deckId: string
): Record<PileId, number[]> {
  const seed = (weekNumber * 99991) ^ hashString(deckId);
  const ids = seededShuffle(Array.from({ length: 78 }, (_, i) => i), seed);
  return { A: ids.slice(0, 4), B: ids.slice(4, 8), C: ids.slice(8, 12), D: ids.slice(12, 16) };
}

/** @deprecated Use generatePileCardsSeeded for deterministic weekly cards. */
export function generatePileCards(): Record<PileId, number[]> {
  return generatePileCardsSeeded(
    Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),
    "default"
  );
}

// ─── Theme registry ───────────────────────────────────────────────────────────

export const WEEKLY_DECKS: DeckTheme[] = [
  {
    id: "persephone-love",
    themeTitle: "愛神給你的戀愛指南",
    themeSubtitle: "你在愛裡的一切，她都看見了",
    hostPersonaId: "persephone",
    hostDisplayName: "Persephone",
    hostImage: "/assets/Persephone.png",
    accentColor: "rgba(200,140,160,0.85)",
    piles: [
      { id: "A", symbol: "🌹", label: "玫瑰",   glowColor: "rgba(210,80,110,0.65)" },
      { id: "B", symbol: "🦋", label: "蝴蝶",   glowColor: "rgba(155,100,210,0.65)" },
      { id: "C", symbol: "🌙", label: "月光",   glowColor: "rgba(120,80,200,0.65)" },
      { id: "D", symbol: "🌸", label: "花語",   glowColor: "rgba(200,120,160,0.65)" },
    ],
  },
  {
    id: "eos-dawn",
    themeTitle: "黎明的重大抉擇",
    themeSubtitle: "老將軍直指你的核心",
    hostPersonaId: "eos",
    hostDisplayName: "Eos",
    hostImage: "/assets/Eos.png",
    accentColor: "rgba(212,168,89,0.85)",
    piles: [
      { id: "A", symbol: "🌅", label: "晨曦",   glowColor: "rgba(255,160,50,0.65)" },
      { id: "B", symbol: "⭐", label: "北極星", glowColor: "rgba(180,200,255,0.65)" },
      { id: "C", symbol: "🔥", label: "烽火",   glowColor: "rgba(255,80,30,0.65)" },
      { id: "D", symbol: "⚡", label: "雷電",   glowColor: "rgba(160,120,255,0.65)" },
    ],
  },
  {
    id: "nyx-depth",
    themeTitle: "永夜女神的深淵問答",
    themeSubtitle: "潛意識裡的真實答案",
    hostPersonaId: "nyx",
    hostDisplayName: "Nyx",
    hostImage: "/assets/Nyx.png",
    accentColor: "rgba(160,140,190,0.85)",
    piles: [
      { id: "A", symbol: "🌌", label: "星河",   glowColor: "rgba(100,60,180,0.65)" },
      { id: "B", symbol: "🕯️", label: "燭光",   glowColor: "rgba(200,160,100,0.65)" },
      { id: "C", symbol: "🌙", label: "殘月",   glowColor: "rgba(140,120,200,0.65)" },
      { id: "D", symbol: "⭐", label: "流星",   glowColor: "rgba(180,160,220,0.65)" },
    ],
  },
];

export function getDeckTheme(id: string): DeckTheme | undefined {
  return WEEKLY_DECKS.find((d) => d.id === id);
}
