import { NextRequest, NextResponse } from "next/server";
import { completeLLM } from "@/lib/llm/complete";

export const maxDuration = 30;

const SYSTEM = `你是一位塔羅精準提問教練。你的工作是判斷使用者的問題是否需要優化，並在需要時提供三個更好的問法。

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

interface RefineResult {
  shouldRefine: boolean;
  issueLabel?: string;
  suggestions?: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let question: string;
  try {
    const body = await req.json();
    if (!body?.question || typeof body.question !== "string") {
      return NextResponse.json({ shouldRefine: false });
    }
    question = body.question.trim();
    if (question.length < 2) return NextResponse.json({ shouldRefine: false });
  } catch {
    return NextResponse.json({ shouldRefine: false });
  }

  try {
    const raw = await completeLLM(
      SYSTEM,
      [{ role: "user", content: `使用者的問題：「${question}」` }],
      300,
      0.3
    );

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed: RefineResult = JSON.parse(cleaned);

    if (!parsed.shouldRefine) return NextResponse.json({ shouldRefine: false });

    const suggestions = (parsed.suggestions ?? []).slice(0, 3).filter(Boolean);
    if (suggestions.length === 0) return NextResponse.json({ shouldRefine: false });

    return NextResponse.json({
      shouldRefine: true,
      issueLabel: parsed.issueLabel ?? "",
      suggestions,
    });
  } catch {
    // On any error, silently skip refinement
    return NextResponse.json({ shouldRefine: false });
  }
}
