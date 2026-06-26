/**
 * GET /api/garden/horoscope?sign={slug}&week={YYYY-WNN}
 *
 * 1. Reads raw horoscope from wiki-horoscope/{week}-{sign}.md
 *    (auto-fetches from click108 and caches if the file is missing)
 * 2. Feeds raw content into Cynthia's horoscope rewrite prompt
 * 3. Streams the result as SSE
 *
 * SSE format: data: {"chunk":"text"}\n\n  …  data: [DONE]\n\n
 */

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { streamLLM } from "@/lib/llm/stream";
import { buildHoroscopePrompt } from "@/lib/garden/horoscopePrompt";
import { ZODIAC_LIST, type ZodiacSign, type RawHoroscope } from "@/lib/garden/types";

// ── SSE helpers ──────────────────────────────────────────────────────────────
function sseChunk(text: string): Uint8Array {
  return new TextEncoder().encode(
    `data: ${JSON.stringify({ chunk: text })}\n\n`
  );
}
const SSE_DONE = new TextEncoder().encode("data: [DONE]\n\n");

// ── click108 scraper (TypeScript port of agents/horoscopeScraper.py) ─────────
const CLICK108_BASE = "https://astro.click108.com.tw/weekly_0.php";
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.5",
  "Accept-Encoding": "identity",
  Referer: "https://astro.click108.com.tw/",
  Connection: "keep-alive",
};

function parseHoroscopeHtml(
  html: string,
  signZh: string
): RawHoroscope["sections"] | null {
  const flat = html.replace(/\s+/g, " ");

  const blockPat = new RegExp(
    `本周${escapeRe(signZh)}解析(整體運勢.+?)(?= \\[https?://fate\\.click108)`,
    "s"
  );
  const bm = flat.match(blockPat);
  if (!bm) return null;
  const block = bm[1];

  const sectionRe =
    /(整體運勢|愛情運勢|事業運勢|財運運勢)([★☆]{5})：/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(block)) !== null) {
    parts.push(block.slice(last, m.index), m[1], m[2]);
    last = m.index + m[0].length;
  }
  parts.push(block.slice(last));

  const sections: RawHoroscope["sections"] = {};
  // parts = ['', name1, stars1, content1, name2, stars2, content2, ...]
  for (let i = 1; i + 2 < parts.length; i += 3) {
    const name = parts[i] as keyof RawHoroscope["sections"];
    const stars = parts[i + 1];
    let content = parts[i + 2]
      .replace(/求愛秘笈：[^。]*。?/g, "")
      .replace(/速配星座：\S+/g, "")
      .trim();
    if (!content.endsWith("。")) content += "。";
    sections[name] = { stars, content };
  }

  return Object.keys(sections).length ? sections : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchAndCacheSign(
  signSlug: ZodiacSign,
  week: string,
  wikiDir: string
): Promise<RawHoroscope | null> {
  const meta = ZODIAC_LIST.find((z) => z.slug === signSlug);
  if (!meta) return null;

  const resp = await fetch(
    `${CLICK108_BASE}?iAstro=${meta.iAstro}&iType=1`,
    { headers: FETCH_HEADERS, cache: "no-store", redirect: "follow" }
  );
  if (!resp.ok) {
    console.error(`[horoscope] click108 returned ${resp.status} for ${signSlug}`);
    return null;
  }

  // Force UTF-8 decode — click108 may declare Big5 in Content-Type which
  // would cause resp.text() to garble Chinese characters and break the regex.
  const buffer = await resp.arrayBuffer();
  const html = new TextDecoder("utf-8").decode(buffer);
  const sections = parseHoroscopeHtml(html, meta.zh);
  if (!sections) {
    console.error(`[horoscope] parse failed for ${signSlug} — html length=${html.length}, snippet=${html.slice(0, 200)}`);
    return null;
  }

  const raw: RawHoroscope = {
    sign: signSlug,
    sign_zh: meta.zh,
    week,
    sections,
  };

  // Write to wiki-horoscope/ cache
  const lines = [
    "---",
    `sign: ${signSlug}`,
    `sign_zh: ${meta.zh}`,
    `week: ${week}`,
    `scraped_at: ${new Date().toISOString()}`,
    "source: astro.click108.com.tw",
    "---",
    "",
  ];
  const ORDER = ["整體運勢", "愛情運勢", "事業運勢", "財運運勢"] as const;
  for (const sec of ORDER) {
    const data = sections[sec];
    if (!data) continue;
    lines.push(`## ${sec} ${data.stars}`, "", data.content, "");
  }

  const filePath = path.join(wikiDir, `${week}-${signSlug}.md`);
  await fs.writeFile(filePath, lines.join("\n"), "utf-8");

  return raw;
}

// ── Markdown reader ──────────────────────────────────────────────────────────
async function readCachedHoroscope(
  filePath: string,
  signSlug: ZodiacSign
): Promise<RawHoroscope | null> {
  const meta = ZODIAC_LIST.find((z) => z.slug === signSlug);
  if (!meta) return null;

  const content = await fs.readFile(filePath, "utf-8");
  const sections: RawHoroscope["sections"] = {};

  const sectionRe = /^## (整體運勢|愛情運勢|事業運勢|財運運勢) ([★☆]{5})\s*\n\n([\s\S]+?)(?=\n## |\n---|\s*$)/gm;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(content)) !== null) {
    const name = m[1] as keyof RawHoroscope["sections"];
    sections[name] = { stars: m[2], content: m[3].trim() };
  }

  if (!Object.keys(sections).length) return null;

  // Extract week from frontmatter
  const weekMatch = content.match(/^week:\s*(.+)$/m);
  const week = weekMatch ? weekMatch[1].trim() : "";

  return { sign: signSlug, sign_zh: meta.zh, week, sections };
}

// ── ISO week string ───────────────────────────────────────────────────────────
function currentIsoWeek(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekNum =
    Math.floor(
      (now.getTime() - startOfWeek1.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse | Response> {
  const { searchParams } = new URL(req.url);
  const sign = (searchParams.get("sign") ?? "") as ZodiacSign;
  const week = searchParams.get("week") ?? currentIsoWeek();

  if (!ZODIAC_LIST.find((z) => z.slug === sign)) {
    return NextResponse.json({ error: "Invalid sign" }, { status: 400 });
  }

  const wikiDir = path.join(process.cwd(), "wiki-horoscope");
  if (!existsSync(wikiDir)) mkdirSync(wikiDir, { recursive: true });

  const filePath = path.join(wikiDir, `${week}-${sign}.md`);

  // Try cache first, auto-fetch if missing
  let raw: RawHoroscope | null = null;
  if (existsSync(filePath)) {
    raw = await readCachedHoroscope(filePath, sign);
  }
  if (!raw) {
    raw = await fetchAndCacheSign(sign, week, wikiDir);
  }

  if (!raw) {
    // Surface a user-friendly SSE error so the front-end can display it inline
    // (the client checks resp.ok, so a non-2xx stops the stream anyway —
    //  return 200 + an SSE error event so the error message reaches the UI)
    const errStream = new ReadableStream({
      start(c) {
        c.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: "本週星象資料尚未更新，請稍後再試。" })}

`
          )
        );
        c.close();
      },
    });
    return new Response(errStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Stream Cynthia's rewrite
  const systemPrompt = buildHoroscopePrompt(raw);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamLLM(
          systemPrompt,
          [{ role: "user", content: `請給出本週${raw!.sign_zh}的運勢。` }],
          600,
          0.75
        )) {
          controller.enqueue(sseChunk(chunk));
        }
        controller.enqueue(SSE_DONE);
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: String(err) })}

`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
