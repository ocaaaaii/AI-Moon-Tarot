import { NextRequest, NextResponse } from "next/server";

const TO_EMAIL = "joannewu0314@gmail.com";

/**
 * Sender address.
 *
 * The default is Resend's shared sandbox domain, which every Resend account
 * can use without setup — and which, being shared by thousands of senders
 * with no SPF/DKIM of your own, Gmail files straight into spam. That is
 * exactly what happened here: the surveys were always being delivered, just
 * never seen.
 *
 * The real fix is a verified domain. Once one is verified in Resend, set
 * RESEND_FROM (e.g. `AI Tarot <survey@your-domain>`) in the Vercel project
 * and this switches over with no code change and no redeploy.
 */
const FROM = process.env.RESEND_FROM || "AI Tarot Survey <onboarding@resend.dev>";

interface SurveyAnswers {
  q1: string; q1r: string;
  q2: string; q2r: string;
  q3: string; q3r: string;
  q4chars: string; q4r: string;
  q5: string; q5r: string;
  q6: string; q6r: string;
  q7: string; q7r: string;
  ux: string;
  idea: string;
  extra: string;
}

/**
 * Everything a respondent types is attacker-controlled and ends up in an
 * email the owner opens and trusts. Mail clients strip <script>, but they do
 * render links and remote images — so unescaped answers are a free phishing
 * link, or a tracking pixel, inside a message that looks like it came from
 * your own app. Escape before interpolation, always.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string, reason?: string) {
  if (!value && !reason) return "";
  const reasonHtml = reason
    ? `<div style="margin-top:4px;color:#999;font-size:12px;padding-left:8px;border-left:2px solid #e0d8f0;white-space:pre-wrap">${esc(reason)}</div>`
    : "";
  return `
    <tr>
      <td style="padding:10px 0 2px;color:#6b4fa8;font-size:12px;font-weight:600;letter-spacing:.04em">${esc(label)}</td>
    </tr>
    <tr>
      <td style="padding:0 0 14px;font-size:13px;color:#333;white-space:pre-wrap">
        ${value ? esc(value) : '<span style="color:#bbb">（未回答）</span>'}
        ${reasonHtml}
      </td>
    </tr>`;
}

/** one question as plain text; empty answers are dropped by the caller */
function line(label: string, value: string, reason?: string): string {
  if (!value && !reason) return "";
  const body = value || "（未回答）";
  return reason ? `${label}\n  ${body}\n  ↳ ${reason}\n` : `${label}\n  ${body}\n`;
}

/** longest any single free-text answer may be before it is truncated */
const MAX_ANSWER = 2000;
/** the name goes into a mail header, so it gets a much tighter budget */
const MAX_NAME = 60;

/**
 * Coerce whatever arrived into a bounded, control-character-free string.
 *
 * Every field here is anonymous public input. Non-strings would crash `esc`,
 * control characters in the name are the classic mail-header-injection
 * primitive, and nothing else caps the body, so an unbounded answer is an
 * unbounded email.
 */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    if (out.length >= max) break;
    const code = ch.codePointAt(0) ?? 0;
    // keep tab, newline and carriage return; drop the other C0 controls
    // and DEL. Written as a loop rather than a regex because a character
    // class of literal control bytes is invisible in source and does not
    // survive every editor or encoding intact.
    const printable = code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    if (printable) out += ch;
  }
  return out.slice(0, max);
}

export async function POST(req: NextRequest) {
  let raw: { name?: unknown; answers?: unknown };
  try {
    raw = (await req.json()) as { name?: unknown; answers?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const input = (raw.answers && typeof raw.answers === "object" ? raw.answers : {}) as Record<string, unknown>;
  const field = (key: string) => clean(input[key], MAX_ANSWER);

  const answers: SurveyAnswers = {
    q1: field("q1"), q1r: field("q1r"),
    q2: field("q2"), q2r: field("q2r"),
    q3: field("q3"), q3r: field("q3r"),
    q4chars: field("q4chars"), q4r: field("q4r"),
    q5: field("q5"), q5r: field("q5r"),
    q6: field("q6"), q6r: field("q6r"),
    q7: field("q7"), q7r: field("q7r"),
    ux: field("ux"),
    idea: field("idea"),
    extra: field("extra"),
  };

  // newlines are legal in a body but not in a Subject header
  const displayName = clean(raw.name, MAX_NAME).replace(/[\r\n]/g, " ").trim() || "匿名測試員";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // This used to log and return ok:true. That is how weeks of closed-beta
    // feedback went missing without anyone noticing: the form said "sent ✨",
    // nothing was sent, and the only record was a Vercel log line that ages
    // out. A survey that cannot be delivered must fail loudly.
    // `.env.local` is gitignored, so setting the key locally does nothing for
    // production — it has to exist in the Vercel project settings too.
    console.error(
      "[contact] RESEND_API_KEY is not set — survey NOT sent. Raw answers:",
      displayName,
      JSON.stringify(answers)
    );
    return NextResponse.json({ error: "email not configured" }, { status: 500 });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:520px;padding:28px;color:#333;line-height:1.6">
      <h2 style="margin:0 0 4px;color:#6b4fa8;font-size:18px">AI Tarot v7.0 — 測試問卷回饋</h2>
      <p style="margin:0 0 24px;color:#999;font-size:12px">來自：<strong style="color:#555">${esc(displayName)}</strong></p>
      <table style="width:100%;border-collapse:collapse">
        ${row("Q1. 你覺得好玩嗎？", answers.q1, answers.q1r)}
        ${row("Q2. 角色個性差異明顯嗎？", answers.q2, answers.q2r)}
        ${row("Q3. 像在和真人對話嗎？", answers.q3, answers.q3r)}
        ${row("Q4. 最喜歡的角色", answers.q4chars || "", answers.q4r)}
        ${row("Q5. 神社 vs 塔羅店", answers.q5, answers.q5r)}
        ${row("Q6. 喜歡月神天啟故事嗎？", answers.q6, answers.q6r)}
        ${row("Q7. 新首頁的感覺", answers.q7, answers.q7r)}
        ${answers.ux ? row("使用體驗卡卡的地方", answers.ux) : ""}
        ${answers.idea ? row("想看到的新功能", answers.idea) : ""}
        ${answers.extra ? row("還有話要說", answers.extra) : ""}
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#ccc;border-top:1px solid #eee;padding-top:12px">
        AI Tarot 首頁問卷自動寄出
      </p>
    </div>
  `;

  const text = [
    `AI Tarot v7.0 — 測試問卷回饋`,
    `來自：${displayName}`,
    ``,
    line("Q1. 你覺得好玩嗎？", answers.q1, answers.q1r),
    line("Q2. 角色個性差異明顯嗎？", answers.q2, answers.q2r),
    line("Q3. 像在和真人對話嗎？", answers.q3, answers.q3r),
    line("Q4. 最喜歡的角色", answers.q4chars, answers.q4r),
    line("Q5. 神社 vs 塔羅店", answers.q5, answers.q5r),
    line("Q6. 喜歡月神天啟故事嗎？", answers.q6, answers.q6r),
    line("Q7. 新首頁的感覺", answers.q7, answers.q7r),
    line("使用體驗卡卡的地方", answers.ux),
    line("想看到的新功能", answers.idea),
    line("還有話要說", answers.extra),
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO_EMAIL],
      reply_to: TO_EMAIL,
      subject: `AI Tarot 問卷回饋 — ${displayName}`,
      html,
      // A plain-text alternative matters more than it looks: HTML-only mail
      // scores worse with spam filters, and this survey was landing in Gmail's
      // spam folder. It also makes the mail readable on a watch or in a
      // text-only client.
      text,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error:", await res.text());
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
