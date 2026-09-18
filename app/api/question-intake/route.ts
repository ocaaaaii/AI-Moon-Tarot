/**
 * POST /api/question-intake
 *
 * One look at the question before the reading starts, answering two things:
 *
 *   1. does this question need sharpening, and if so how?
 *   2. which spread suits it?
 *
 * The client makes one request, fired during the four-second stillness
 * animation, so the answer is waiting when the animation ends. It was
 * `/api/refine-question` when it only did the first job.
 *
 * **Two model calls, not one, and they run in parallel.** Merging both jobs
 * into a single prompt was tried first and measurably degraded the
 * refinement: asked to also pick a spread, the model started inventing
 * issueLabels ("問題編碼異常") and writing suggestions about relationships for
 * a question about career. Two single-purpose prompts each do their own job,
 * and `Promise.allSettled` means the latency is the slower of the two rather
 * than the sum — which is what the stillness window actually cares about. The
 * second call is small next to the 4096-token reading that follows.
 *
 * Every failure path returns `{ shouldRefine: false }` rather than an error:
 * this is an optional assist in front of the real reading, and a visitor whose
 * intake failed should simply get the plain spread picker.
 */
import { NextRequest, NextResponse } from "next/server";
import { completeLLM } from "@/lib/llm/complete";
import { LIMITS } from "@/lib/api/limits";
import { getSpread, spreadsFor, type TarotSpread } from "@/lib/tarot/spreads";

export const maxDuration = 30;

/** the recommendation's one-line reason, shown in the picker */
const MAX_REASON = 60;

/**
 * Unchanged from the route's refine-only days, deliberately. It is known to
 * produce good rewrites; every attempt to give it a second job made it worse.
 */
const REFINE_SYSTEM = `你是一位塔羅精準提問教練。你的工作是判斷使用者的問題是否需要優化，並在需要時提供三個更好的問法。

判斷標準（符合其中一項就需要優化）：
- 鬼打牆：「他愛不愛我」「他是什麼意思」「他在想什麼」——單純回答是/否無法解決焦慮
- 太籠統：「事業運怎樣」「感情運好嗎」「運氣如何」——沒有具體目標
- 命定論：「我會不會成功」「真命天子何時出現」「我們有沒有緣分」——把答案交給命運
- 缺時間框架：完全沒有時間範圍的問題

如果問題已夠具體（有時間範圍、有具體目標、有行動導向、問的是「我該如何」而非「會不會」），回覆 shouldRefine: false。

優化原則：
- 加入時間框架（未來三個月、這半年、這一週）
- 從「他會不會...」改為「我可以如何...」
- 從「結果導向」改為「行動導向」
- 保留使用者原本問題的核心關切
- 【決策類問題專項】若問題是在猶豫要不要做某件事（例如：要不要離職、要不要告白、要不要離開），三個建議問法中應包含一組「對照組」：一個問採取行動的發展，一個問維持現狀可能面臨的風險——讓使用者同時看見兩條路的訊息，而非只引導單一方向

輸出格式（嚴格 JSON，絕對不要加 markdown code block）：
{"shouldRefine":true,"issueLabel":"問題太籠統，沒有具體方向","suggestions":["優化問法1","優化問法2","優化問法3"]}
或：
{"shouldRefine":false}`;

function recommendSystem(spreads: TarotSpread[]): string {
  const menu = spreads
    .map(s => `- ${s.signatureOf ? "★ " : ""}${s.id}｜${s.label}（${s.positions.length} 張）：${s.bestFor}`)
    .join("\n");

  return `你是塔羅牌陣顧問。讀完使用者的問題，從下面的清單挑一個最適合的牌陣。

只能使用清單裡的 id，絕對不要自己發明：
${menu}

挑選步驟，照順序做：
1. 先看標了 ★ 的專屬牌陣——那是這位塔羅師最擅長的儀式。把它的「使用時機」和使用者當下的情緒處境對照，只要對得上就選它。
2. 只有在專屬牌陣明顯不適合時，才從其他牌陣裡挑。

看的是問題背後真正的情緒與處境，不是字面關鍵字。
reason 用一句話對使用者說明為什麼這個牌陣適合他，25 字以內，不要複述牌陣名稱。

輸出格式（嚴格 JSON，絕對不要加 markdown code block）：
{"spreadId":"清單裡的 id","reason":"推薦理由"}`;
}

interface IntakeResponse {
  shouldRefine: boolean;
  issueLabel?: string;
  suggestions?: string[];
  recommendedSpreadId?: string;
  reason?: string;
}

const NO_OP: IntakeResponse = { shouldRefine: false };

/** Models wrap JSON in fences no matter how firmly you ask them not to. */
function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim()) as T;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let question: string;
  let avatarId: string | undefined;
  let skipRefine = false;

  try {
    const body = await req.json();
    if (!body?.question || typeof body.question !== "string") {
      return NextResponse.json(NO_OP);
    }
    question = body.question.trim().slice(0, LIMITS.question);
    if (question.length < 2) return NextResponse.json(NO_OP);
    avatarId = typeof body.avatarId === "string" ? body.avatarId.slice(0, LIMITS.id) : undefined;
    skipRefine = body.skipRefine === true;
  } catch {
    return NextResponse.json(NO_OP);
  }

  // The menu the model may choose from is built here, not accepted from the
  // caller — the same reason the reading route stopped taking position labels.
  const { signature, generic } = spreadsFor(avatarId ?? "");
  const available = signature ? [signature, ...generic] : generic;
  const allowed = new Set(available.map(s => s.id));

  const userTurn = [{ role: "user" as const, content: `使用者的問題：「${question}」` }];

  const [refineOutcome, recommendOutcome] = await Promise.allSettled([
    skipRefine
      ? Promise.resolve("")
      : completeLLM(REFINE_SYSTEM, userTurn, 300, 0.3),
    completeLLM(recommendSystem(available), userTurn, 160, 0.3),
  ]);

  const response: IntakeResponse = { shouldRefine: false };

  if (!skipRefine && refineOutcome.status === "fulfilled") {
    const parsed = parseJson<{ shouldRefine?: boolean; issueLabel?: string; suggestions?: string[] }>(
      refineOutcome.value
    );
    const suggestions = (parsed?.suggestions ?? [])
      .slice(0, 3)
      .filter((s): s is string => typeof s === "string" && s.length > 0);
    if (parsed?.shouldRefine === true && suggestions.length > 0) {
      response.shouldRefine = true;
      response.issueLabel = parsed.issueLabel ?? "";
      response.suggestions = suggestions;
    }
  }

  if (recommendOutcome.status === "fulfilled") {
    const parsed = parseJson<{ spreadId?: string; reason?: string }>(recommendOutcome.value);
    // A model will happily invent an id that looks plausible, so the answer is
    // only used when it names a spread this master actually offers.
    const id = parsed?.spreadId;
    if (typeof id === "string" && allowed.has(id) && getSpread(id)) {
      response.recommendedSpreadId = id;
      const reason = typeof parsed?.reason === "string" ? parsed.reason.trim().slice(0, MAX_REASON) : "";
      if (reason) response.reason = reason;
    }
  }

  return NextResponse.json(response);
}
