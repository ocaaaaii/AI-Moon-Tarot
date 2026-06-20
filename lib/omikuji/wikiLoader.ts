/**
 * Omikuji Wiki Loader — TypeScript
 * Reads /wiki-omikuji/{id}-{poem-first-line}.md files directly from the
 * filesystem and returns structured OmikujiEntry objects.
 *
 * Mirrors lib/tarot/wikiLoader.ts conventions for the tarot product line.
 */
import fs from "fs";
import path from "path";

import matter from "gray-matter";

import type { OmikujiEntry, OmikujiFrontmatter } from "./types";

const BAD_FORTUNE_LEVELS = ["凶", "兇"];

function getOmikujiDir(): string {
  return path.join(process.cwd(), "wiki-omikuji");
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
    .map((line) => line.replace(/^- /, "").trim())
    .filter((line) => line.length > 0 && line !== "（無詳解資料）");
}

function parseEntry(filepath: string): OmikujiEntry {
  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content: body } = matter(raw);
  const fm = data as Partial<OmikujiFrontmatter>;

  const level = fm.level ?? "";

  return {
    id: fm.id ?? 0,
    shrine: fm.shrine ?? "",
    level,
    poem: fm.poem ?? [],
    interpretation: extractSection(body, "籤意解說 Interpretation"),
    details: extractListSection(body, "詳解 Details"),
    isBadFortune: BAD_FORTUNE_LEVELS.includes(level),
  };
}

/**
 * Load all 100 omikuji entries from /wiki-omikuji, sorted by id.
 */
export function loadAllOmikuji(): OmikujiEntry[] {
  const dir = getOmikujiDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  return files
    .map((f) => parseEntry(path.join(dir, f)))
    .sort((a, b) => a.id - b.id);
}

/**
 * Load a single omikuji entry by id (1–100).
 */
export function loadOmikujiById(id: number): OmikujiEntry | null {
  const all = loadAllOmikuji();
  return all.find((e) => e.id === id) ?? null;
}
