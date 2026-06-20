/**
 * GET /api/cards
 * Returns lightweight metadata for all 78 cards:
 *   { id, name_en, name_zh, local_image }
 *
 * Used by the frontend to show card names and images after drawing.
 * Cached at the edge — data never changes after scraping.
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

interface CardMeta {
  id: number;
  name_en: string;
  name_zh: string;
  local_image: string;
}

function loadAllCardMeta(): CardMeta[] {
  const wikiDir = path.join(process.cwd(), "wiki");

  if (!fs.existsSync(wikiDir)) {
    return [];
  }

  const files = fs.readdirSync(wikiDir).filter((f) => f.endsWith(".md")).sort();

  return files.map((filename) => {
    const filepath = path.join(wikiDir, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data } = matter(raw);

    return {
      id: data.id ?? 0,
      name_en: data.name ?? "",
      name_zh: data.name_zh ?? "",
      local_image: data.local_image ?? "",
    };
  });
}

export async function GET() {
  const cards = loadAllCardMeta();
  return NextResponse.json(cards, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
