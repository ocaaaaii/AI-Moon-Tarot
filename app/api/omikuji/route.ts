/**
 * GET /api/omikuji
 * Returns all 100 parsed omikuji entries:
 *   { id, shrine, level, poem, interpretation, details, isBadFortune }
 *
 * Used by the 月神神社 draw-flow frontend. The random draw itself happens
 * client-side (matches the existing /api/cards + client-side draw pattern
 * used by the tarot product line) — this endpoint just serves the static
 * wiki content.
 */
import { NextResponse } from "next/server";

import { loadAllOmikuji } from "@/lib/omikuji/wikiLoader";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = loadAllOmikuji();
  return NextResponse.json(entries, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
