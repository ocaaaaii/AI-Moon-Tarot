/**
 * Wiki Loader — TypeScript
 * Reads /wiki/{id}-{slug}.md files directly from the filesystem
 * and returns structured CardContext objects.
 *
 * Uses gray-matter for YAML frontmatter parsing.
 * Install: npm install gray-matter
 */
import fs from "fs";
import path from "path";

import matter from "gray-matter";

import type { CardContext, CardFrontmatter, CardRequest } from "./types";

// ─── Card slug lookup table (matches agents/scraper/config.py) ───────────────
// Maps card ID → slug for filename resolution without importing Python config.
const CARD_SLUGS: Record<number, string> = {
  0: "fool", 1: "magician", 2: "high-priestess", 3: "empress",
  4: "emperor", 5: "hierophant", 6: "lovers", 7: "chariot",
  8: "strength", 9: "hermit", 10: "wheel-of-fortune", 11: "justice",
  12: "hanged-man", 13: "death", 14: "temperance", 15: "devil",
  16: "tower", 17: "star", 18: "moon", 19: "sun",
  20: "judgement", 21: "world",
  // Minor Arcana — Wands
  22: "wands-ace", 23: "wands-two", 24: "wands-three", 25: "wands-four",
  26: "wands-five", 27: "wands-six", 28: "wands-seven", 29: "wands-eight",
  30: "wands-nine", 31: "wands-ten",
  // Minor Arcana — Cups
  32: "cups-ace", 33: "cups-two", 34: "cups-three", 35: "cups-four",
  36: "cups-five", 37: "cups-six", 38: "cups-seven", 39: "cups-eight",
  40: "cups-nine", 41: "cups-ten",
  // Minor Arcana — Swords
  42: "swords-ace", 43: "swords-two", 44: "swords-three", 45: "swords-four",
  46: "swords-five", 47: "swords-six", 48: "swords-seven", 49: "swords-eight",
  50: "swords-nine", 51: "swords-ten",
  // Minor Arcana — Pentacles
  52: "pentacles-ace", 53: "pentacles-two", 54: "pentacles-three", 55: "pentacles-four",
  56: "pentacles-five", 57: "pentacles-six", 58: "pentacles-seven", 59: "pentacles-eight",
  60: "pentacles-nine", 61: "pentacles-ten",
  // Court Cards — Wands
  62: "court-wands-page", 63: "court-wands-knight", 64: "court-wands-queen", 65: "court-wands-king",
  // Court Cards — Cups
  66: "court-cups-page", 67: "court-cups-knight", 68: "court-cups-queen", 69: "court-cups-king",
  // Court Cards — Swords
  70: "court-swords-page", 71: "court-swords-knight", 72: "court-swords-queen", 73: "court-swords-king",
  // Court Cards — Pentacles
  74: "court-pentacles-page", 75: "court-pentacles-knight",
  76: "court-pentacles-queen", 77: "court-pentacles-king",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFilename(id: number, slug: string): string {
  return `${String(id).padStart(2, "0")}-${slug}.md`;
}

function getWikiDir(): string {
  // In Next.js: process.cwd() is the project root
  return path.join(process.cwd(), "wiki");
}

function extractSection(body: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`## ${escaped}\\n+([\\s\\S]*?)(?=\\n## |$)`);
  const match = body.match(pattern);
  return match ? match[1].trim() : "";
}

function extractListSection(body: string, heading: string): string[] {
  const raw = extractSection(body, heading);
  if (!raw) return [];
  return raw
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^- /, "").trim());
}

// ─── Core loader ─────────────────────────────────────────────────────────────

/**
 * Load a single tarot card's wiki file by ID.
 *
 * @param id        Card ID (0–77)
 * @param reversed  Whether the card is drawn reversed
 * @returns         Parsed CardContext object
 */
export function loadCard(id: number, reversed = false): CardContext {
  if (id < 0 || id > 77) {
    throw new RangeError(`Card ID must be 0–77, received: ${id}`);
  }

  const slug = CARD_SLUGS[id];
  if (!slug) {
    throw new Error(`No slug found for card ID ${id}`);
  }

  const filename = makeFilename(id, slug);
  const filepath = path.join(getWikiDir(), filename);

  if (!fs.existsSync(filepath)) {
    throw new Error(
      `Wiki file not found: ${filepath}. ` +
      `Run the Python scraper first: python -m agents.pipeline.orchestrator`
    );
  }

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content: body } = matter(raw);
  const fm = data as Partial<CardFrontmatter>;

  const uprightMeanings = fm.upright_meanings ?? [];
  const reversedMeanings = fm.reversed_meanings ?? [];
  const activeMeanings = reversed ? reversedMeanings : uprightMeanings;
  const nameEn = fm.name ?? slug;
  const nameZh = fm.name_zh ?? "";
  const displayName = `${nameZh} / ${nameEn}`;
  const positionLabel = reversed ? "逆位 (Reversed)" : "正位 (Upright)";

  return {
    id,
    slug,
    name_en: nameEn,
    name_zh: nameZh,
    arcana: fm.arcana ?? "major",
    suit: fm.suit ?? null,
    number: fm.number ?? 0,
    keywords: fm.keywords ?? [],
    uprightMeanings,
    reversedMeanings,
    summary: extractSection(body, "簡述 Summary"),
    story: extractSection(body, "牌義故事 Story & Symbolism"),
    reflection: extractListSection(body, "思考重點 Reflection"),
    loveReading: extractSection(body, "感情關係 Love & Relationships"),
    careerReading: extractSection(body, "職場 Career & Work"),
    imageUrl: fm.image_url ?? "",
    sourceUrl: fm.source_url ?? "",
    isReversed: reversed,
    activeMeanings,
    displayName,
    positionLabel,
    dominantColors: fm.dominant_colors ?? [],
  };
}

/**
 * Load multiple cards at once (1–7 cards).
 * chakra spreads allow up to 7; normal spreads allow up to 3.
 *
 * @param requests   Array of { id, reversed? }
 * @param isChakra   When true, lifts the limit to 7 cards
 * @returns          Array of CardContext in the same order
 */
export function loadCards(requests: CardRequest[], isChakra = false): CardContext[] {
  if (requests.length === 0) {
    throw new Error("At least 1 card is required");
  }
  const maxCards = isChakra ? 7 : 3;
  if (requests.length > maxCards) {
    throw new Error(`Max ${maxCards} cards allowed (got ${requests.length})`);
  }
  return requests.map((r) => loadCard(r.id, r.reversed));
}
