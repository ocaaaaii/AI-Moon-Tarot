"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

const CHARACTERS = [
  "天城月乃", "汐見潮", "九条萬夜",
  "日向陽真", "神樂祈織", "東雲曉", "天城花音",
];

interface Question {
  id: string;
  label: string;
  options: string[];
  reasonPlaceholder: string;
}

const QUESTIONS: Question[] = [
  { id:"q1", label:"1. 你覺得好玩嗎？",          options:["好玩 🎉","普普 🤔","不好玩 😐"],             reasonPlaceholder:"想說說原因嗎？（可不填）" },
  { id:"q2", label:"2. 你覺得角色個性差異明顯嗎？", options:["很明顯 ✨","有一點","感覺都差不多"],           reasonPlaceholder:"想說說原因嗎？（可不填）" },
  { id:"q3", label:"3. 和角色聊天，感覺像…",       options:["在和真人對話 💫","介於之間","明顯是 AI 🤖"],  reasonPlaceholder:"想說說原因嗎？（可不填）" },
  { id:"q5", label:"5. 你更喜歡哪個？",            options:["月神神社 ⛩️","塔羅店鋪 🔮","都喜歡 💜"],      reasonPlaceholder:"想說說原因嗎？（可不填）" },
  { id:"q6", label:"6. 你喜歡看月神天啟故事嗎？",  options:["喜歡 📖","還沒看","不喜歡"],                 reasonPlaceholder:"想說說原因嗎？（可不填）" },
  { id:"q7", label:"7. 這次的新首頁，你的感覺？",  options:["很有氛圍 🌙","還好","有點太多了"],            reasonPlaceholder:"哪個部分讓你這樣覺得？（可不填）" },
];

interface Answers {
  [key: string]: string;
  q1:string; q1r:string; q2:string; q2r:string; q3:string; q3r:string;
  q4chars:string; q4r:string; q5:string; q5r:string; q6:string; q6r:string;
  q7:string; q7r:string;
  /** open-ended: friction to fix, and features to build next */
  ux:string; idea:string;
  name:string; extra:string;
}

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Answers = {
  q1:"",q1r:"",q2:"",q2r:"",q3:"",q3r:"",
  q4chars:"",q4r:"",q5:"",q5r:"",q6:"",q6r:"",q7:"",q7r:"",
  ux:"",idea:"",
  name:"",extra:"",
};

function Opt({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button type="button" onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11px] transition-all duration-150 text-left"
      style={{
        background: active ? "rgba(184,168,200,0.28)" : "rgba(255,255,255,0.04)",
        border:     active ? "1px solid rgba(184,168,200,0.55)" : "1px solid rgba(184,168,200,0.12)",
        color:      active ? "rgba(225,215,240,0.95)" : "rgba(180,165,200,0.55)",
      }}>
      {label}
    </button>
  );
}

function Reason({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) {
  return (
    <textarea value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} rows={2}
      className="w-full rounded-lg px-2.5 py-1.5 text-[11px] text-cream-100/80 placeholder-morandi-stone/30 outline-none resize-none"
      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(184,168,200,0.10)" }}
      onFocus={(e)=>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.35)"; }}
      onBlur={(e) =>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.10)"; }}
    />
  );
}

export default function DeveloperBubble({ hidden }: { hidden?: boolean }) {
  const [open,    setOpen]    = useState(false);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [status,  setStatus]  = useState<Status>("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-reset 2.5 s after successful send
  useEffect(() => {
    if (status !== "sent") return;
    const t = setTimeout(() => { setStatus("idle"); setAnswers(EMPTY); }, 2500);
    return () => clearTimeout(t);
  }, [status]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const set = (key: keyof Answers, val: string) => setAnswers((p) => ({ ...p, [key]: val }));

  const toggleChar = (name: string) => {
    const current = answers.q4chars ? answers.q4chars.split(",") : [];
    const next = current.includes(name) ? current.filter((c)=>c!==name) : [...current, name];
    set("q4chars", next.join(","));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: answers.name || "匿名測試員", answers }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const selectedChars = answers.q4chars ? answers.q4chars.split(",") : [];
  const isDone = status === "sent";

  return (
    <div ref={panelRef} className={`fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 transition-opacity duration-200 ${hidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

      {/* Survey panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:14, scale:0.95 }}
            animate={{ opacity:1, y:0,  scale:1    }}
            exit={{   opacity:0, y:10,  scale:0.95 }}
            transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
            className="w-[340px] rounded-2xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.65),0_0_0_1px_rgba(184,168,200,0.12)]"
            style={{ background:"rgba(18,13,30,0.98)", backdropFilter:"blur(20px)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3 flex-shrink-0"
              style={{ borderBottom:"1px solid rgba(184,168,200,0.10)" }}>
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-morandi-lavender/40">
                <Image src="/assets/landing/ca-avatar.jpg" alt="CA" fill className="object-cover object-top" sizes="32px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream-100 text-xs font-medium leading-snug">開發者 CA</p>
                <p className="text-morandi-stone/40 text-[10px]">AI Tarot v7.1.0 · 2026/9/18 更新</p>
              </div>
              <button onClick={()=>setOpen(false)}
                className="text-morandi-stone/35 hover:text-cream-200/60 transition-colors text-sm leading-none flex-shrink-0">✕</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto" style={{ maxHeight:"76vh" }}>

              {/* Intro message */}
              <div className="px-4 py-4" style={{ borderBottom:"1px solid rgba(184,168,200,0.07)" }}>
                <p className="text-cream-200/82 text-[12.5px] leading-relaxed">
                  Dear All，我是開發者 <span className="text-morandi-lavender/90 font-medium">CA</span>！歡迎來到 v7.1 🌙
                </p>

                {/* Newest first. v7.1 is a handling pass on top of v7.0's new
                    homepage, and almost all of it came from survey answers —
                    so it is worth showing that feedback actually lands. */}
                <div
                  className="mt-3 rounded-xl px-3 py-2.5"
                  style={{ background:"rgba(184,168,200,0.06)", border:"1px solid rgba(184,168,200,0.14)" }}
                >
                  <p className="text-morandi-gold/85 text-[11px] tracking-widest mb-2">✦ 本次更新 v7.1.0 · 9/18</p>
                  <ul className="flex flex-col gap-1.5">
                    {[
                      "🃏 抽牌改成「直接在牌面上左右滑」，下面那條窄窄的拉桿退休了",
                      "📱 手機上滑牌時畫面不再跟著上下抖動",
                      "✍️ 修掉中文標題和說明文字「一個字掉到下一行」的排版",
                      "💌 問卷信件寄送修復，之前的回饋我都有收到（在垃圾信匣裡找到了 😅）",
                    ].map((item) => (
                      <li key={item} className="text-cream-200/72 text-[11.5px] leading-relaxed" style={{ textWrap:"pretty" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-cream-200/45 text-[11px] leading-relaxed mt-2.5">
                    抽牌手感是這次最想請你試的一項——滑順不順、會不會滑過頭、會不會不小心誤抽，都跟我說 🙏
                  </p>
                </div>

                <p className="text-cream-200/60 text-[12px] leading-relaxed mt-3">
                  <span className="text-morandi-stone/50">上一版 v7.0 ·</span> 大改動是<span className="text-morandi-gold/85 font-medium">全新首頁</span>——把原本四張縮圖的入口頁，重做成有主視覺、世界觀、七魂群像與故事導引的完整世界。燭火會搖、月亮會呼吸，七位神明攤開成一副牌陣讓你一位位翻看。右上角有顆小喇叭，想要的話可以<span className="text-morandi-gold/85 font-medium">配上音樂</span>再逛一次 🎵。
                </p>
                <p className="text-cream-200/60 text-[12px] leading-relaxed mt-2">
                  接下來預計實作：<span className="text-morandi-lavender/85">推薦牌組</span>、<span className="text-morandi-lavender/85">自動抽牌</span>、以及眾神之庭的<span className="text-morandi-lavender/85">顯化願力</span>。
                </p>
                <p className="text-cream-200/60 text-[12px] leading-relaxed mt-2">
                  星座週運勢目前品質還不到我想要的樣子，先收起來重做，請見諒 🙇
                </p>
                <p className="text-cream-200/60 text-[12px] leading-relaxed mt-2">
                  持續開發測試中，有四扇門等著你，希望你都能進去看看：
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {[
                    "🔮 塔羅店鋪：占卜 + 追問聊天 + 七脈輪牌陣",
                    "⛩️ 月神神社：抽籤 + 解籤 + 聖域儀式",
                    "🌌 眾神之庭：眾神之語陪伴聊天（週神諭整修中）",
                    "📖 月神天啟：七位角色的日常故事劇場",
                  ].map((item) => (
                    <li key={item} className="text-cream-200/55 text-[11px] flex items-start gap-1.5">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-cream-200/50 text-[11.5px] leading-relaxed mt-3">
                  玩完之後填下面的問卷，每一份回饋都超重要 ✨ 謝謝你 🙏
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-4">

                {/* 你是誰 */}
                <div>
                  <label className="text-morandi-stone/45 text-[10px] tracking-widest uppercase block mb-1.5">你是誰</label>
                  <input type="text" value={answers.name} onChange={(e)=>set("name",e.target.value)}
                    placeholder="名字 / 暱稱（可不填）" disabled={isDone}
                    className="w-full rounded-lg px-3 py-1.5 text-xs text-cream-100 placeholder-morandi-stone/30 outline-none"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(184,168,200,0.12)" }}
                    onFocus={(e)=>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.4)"; }}
                    onBlur={(e) =>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.12)"; }}
                  />
                </div>

                <div style={{ borderTop:"1px solid rgba(184,168,200,0.07)" }} />

                {/* Q1–Q3, Q5–Q6 */}
                {QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <p className="text-cream-200/75 text-[11.5px] mb-2">{q.label}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {q.options.map((opt) => (
                        <Opt key={opt} label={opt} active={answers[q.id]===opt} onClick={()=>set(q.id,opt)} />
                      ))}
                    </div>
                    <Reason value={answers[`${q.id}r`]} onChange={(v)=>set(`${q.id}r`,v)} placeholder={q.reasonPlaceholder} />
                  </div>
                ))}

                {/* Q4 multi-select */}
                <div>
                  <p className="text-cream-200/75 text-[11.5px] mb-2">4. 你最喜歡的角色？（可複選）</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CHARACTERS.map((name) => (
                      <Opt key={name} label={name} active={selectedChars.includes(name)} onClick={()=>toggleChar(name)} />
                    ))}
                  </div>
                  <Reason value={answers.q4r} onChange={(v)=>set("q4r",v)} placeholder="喜歡的原因？（外表、個性、說話方式…）" />
                </div>

                <div style={{ borderTop:"1px solid rgba(184,168,200,0.07)" }} />

                {/* The two that actually drive the roadmap — kept open-ended
                    on purpose: multiple-choice can only confirm what CA
                    already suspects, and these are the ones meant to surprise. */}
                <div>
                  <label className="text-morandi-stone/45 text-[10px] tracking-widest uppercase block mb-1.5">使用體驗有哪裡卡卡的？</label>
                  <textarea value={answers.ux} onChange={(e)=>set("ux",e.target.value)}
                    placeholder="哪一步讓你猶豫、找不到、或覺得等太久？再小的都值得說 🙏" rows={3} disabled={isDone}
                    className="w-full rounded-lg px-2.5 py-2 text-[11px] text-cream-100/80 placeholder-morandi-stone/30 outline-none resize-none"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(184,168,200,0.12)" }}
                    onFocus={(e)=>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.38)"; }}
                    onBlur={(e) =>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.12)"; }}
                  />
                </div>

                <div>
                  <label className="text-morandi-stone/45 text-[10px] tracking-widest uppercase block mb-1.5">想看到什麼新功能？</label>
                  <textarea value={answers.idea} onChange={(e)=>set("idea",e.target.value)}
                    placeholder="想要什麼玩法、什麼角色、什麼調整方向？天馬行空也沒關係 ✨" rows={3} disabled={isDone}
                    className="w-full rounded-lg px-2.5 py-2 text-[11px] text-cream-100/80 placeholder-morandi-stone/30 outline-none resize-none"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(184,168,200,0.12)" }}
                    onFocus={(e)=>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.38)"; }}
                    onBlur={(e) =>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.12)"; }}
                  />
                </div>

                <div style={{ borderTop:"1px solid rgba(184,168,200,0.07)" }} />

                {/* Extra freeform */}
                <div>
                  <label className="text-morandi-stone/45 text-[10px] tracking-widest uppercase block mb-1.5">還有話要說嗎？</label>
                  <textarea value={answers.extra} onChange={(e)=>set("extra",e.target.value)}
                    placeholder="什麼都可以說～CA 都會認真看的 👀" rows={3} disabled={isDone}
                    className="w-full rounded-lg px-2.5 py-2 text-[11px] text-cream-100/80 placeholder-morandi-stone/30 outline-none resize-none"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(184,168,200,0.12)" }}
                    onFocus={(e)=>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.38)"; }}
                    onBlur={(e) =>{ e.currentTarget.style.borderColor="rgba(184,168,200,0.12)"; }}
                  />
                </div>

                {/* Submit / status */}
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.p key="sent" initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }}
                      className="text-[11px] text-center py-2 text-morandi-sage/80">
                      ✓ 收到囉！超感謝你的回饋 🌙
                    </motion.p>
                  ) : (
                    <motion.button key="btn" type="submit" disabled={status==="sending"}
                      className="w-full py-2 rounded-lg text-xs tracking-widest transition-all duration-200 disabled:opacity-40"
                      style={{
                        background:"linear-gradient(135deg,rgba(184,168,200,0.22) 0%,rgba(140,120,180,0.18) 100%)",
                        border:"1px solid rgba(184,168,200,0.28)", color:"rgba(225,215,240,0.9)",
                      }}>
                      {status==="sending" ? "傳送中..." : "送出回饋 ✦"}
                    </motion.button>
                  )}
                </AnimatePresence>

                {status==="error" && (
                  <p className="text-[11px] text-center text-rose-400/70 -mt-2">送出失敗，請稍後再試 🙏</p>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger row */}
      <div className="flex items-end gap-2">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ opacity:0, x:8, scale:0.9 }} animate={{ opacity:1, x:0, scale:1 }} exit={{ opacity:0, x:8, scale:0.9 }}
              transition={{ duration:0.2 }} onClick={()=>setOpen(true)}
              className="relative px-3 py-2 rounded-2xl rounded-br-sm text-[11.5px] font-medium tracking-wide cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
              style={{ background:"rgba(22,16,36,0.95)", border:"1px solid rgba(184,168,200,0.22)", color:"rgba(220,210,238,0.92)", backdropFilter:"blur(12px)" }}>
              作者有話要說！v7.1 ✨
              <span className="absolute -bottom-[7px] right-3 w-3 h-3 rotate-45"
                style={{ background:"rgba(22,16,36,0.95)", borderRight:"1px solid rgba(184,168,200,0.22)", borderBottom:"1px solid rgba(184,168,200,0.22)" }} />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          onClick={()=>{ setOpen((v)=>!v); if(status==="error") setStatus("idle"); }}
          whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
          className="w-11 h-11 rounded-full overflow-hidden border-2 shadow-[0_4px_20px_rgba(0,0,0,0.50)] flex-shrink-0"
          style={{ borderColor: open ? "rgba(184,168,200,0.55)" : "rgba(184,168,200,0.28)" }}
        >
          <Image src="/assets/landing/ca-avatar.jpg" alt="CA" width={44} height={44} className="object-cover object-top w-full h-full" />
        </motion.button>
      </div>
    </div>
  );
}
