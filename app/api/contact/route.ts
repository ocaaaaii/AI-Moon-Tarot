import { NextRequest, NextResponse } from "next/server";

const TO_EMAIL = "joannewu0314@gmail.com";

interface SurveyAnswers {
  q1: string; q1r: string;
  q2: string; q2r: string;
  q3: string; q3r: string;
  q4chars: string; q4r: string;
  q5: string; q5r: string;
  q6: string; q6r: string;
  extra: string;
}

function row(label: string, value: string, reason?: string) {
  if (!value && !reason) return "";
  const reasonHtml = reason
    ? `<div style="margin-top:4px;color:#999;font-size:12px;padding-left:8px;border-left:2px solid #e0d8f0;white-space:pre-wrap">${reason}</div>`
    : "";
  return `
    <tr>
      <td style="padding:10px 0 2px;color:#6b4fa8;font-size:12px;font-weight:600;letter-spacing:.04em">${label}</td>
    </tr>
    <tr>
      <td style="padding:0 0 14px;font-size:13px;color:#333">
        ${value || '<span style="color:#bbb">（未回答）</span>'}
        ${reasonHtml}
      </td>
    </tr>`;
}

export async function POST(req: NextRequest) {
  const { name, answers } = await req.json() as { name: string; answers: SurveyAnswers };
  const displayName = name?.trim() || "匿名測試員";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[contact] Survey from:", displayName, JSON.stringify(answers, null, 2));
    return NextResponse.json({ ok: true });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:520px;padding:28px;color:#333;line-height:1.6">
      <h2 style="margin:0 0 4px;color:#6b4fa8;font-size:18px">AI Tarot v3.0 — 測試問卷回饋</h2>
      <p style="margin:0 0 24px;color:#999;font-size:12px">來自：<strong style="color:#555">${displayName}</strong></p>
      <table style="width:100%;border-collapse:collapse">
        ${row("Q1. 你覺得好玩嗎？", answers.q1, answers.q1r)}
        ${row("Q2. 角色個性差異明顯嗎？", answers.q2, answers.q2r)}
        ${row("Q3. 像在和真人對話嗎？", answers.q3, answers.q3r)}
        ${row("Q4. 最喜歡的角色", answers.q4chars || "", answers.q4r)}
        ${row("Q5. 神社 vs 塔羅店", answers.q5, answers.q5r)}
        ${row("Q6. 喜歡月神天啟故事嗎？", answers.q6, answers.q6r)}
        ${answers.extra ? row("還有話要說", answers.extra) : ""}
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#ccc;border-top:1px solid #eee;padding-top:12px">
        AI Tarot 首頁問卷自動寄出
      </p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "AI Tarot Survey <onboarding@resend.dev>",
      to: [TO_EMAIL],
      subject: `[AI Tarot 問卷] ${displayName}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error:", await res.text());
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
