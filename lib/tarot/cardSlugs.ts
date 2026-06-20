/**
 * Static card slug lookup — mirrors agents/scraper/config.py
 * Used client-side to derive image paths without an API call.
 */
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
  62: "court-wands-page", 63: "court-wands-knight", 64: "court-wands-queen", 65: "court-wands-king",
  66: "court-cups-page", 67: "court-cups-knight", 68: "court-cups-queen", 69: "court-cups-king",
  70: "court-swords-page", 71: "court-swords-knight", 72: "court-swords-queen", 73: "court-swords-king",
  74: "court-pentacles-page", 75: "court-pentacles-knight",
  76: "court-pentacles-queen", 77: "court-pentacles-king",
};

/** Derives the local image path from card ID — no API call needed */
export function cardImagePath(id: number): string {
  const slug = CARD_SLUGS[id];
  if (!slug) return "";
  return `/assets/cards/${String(id).padStart(2, "0")}-${slug}.webp`;
}
