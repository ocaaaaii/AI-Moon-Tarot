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
];

interface Answers {
  [key: string]: string;
  q1:string; q1r:string; q2:string; q2r:string; q3:string; q3r:string;
  q4chars:string; q4r:string; q5:string; q5r:string; q6:string; q6r:string;
  name:string; extra:string;
}

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Answers = {
  q1:"",q1r:"",q2:"",q2r:"",q3:"",q3r:"",
  q4chars:"",q4r:"",q5:"",q5r:"",q6:"",q6r:"",
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

export default function DeveloperBubble() {
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
    <div ref={panelRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">

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
                <Image src="/assets/CA.jpg" alt="CA" fill className="object-cover object-top" sizes="32px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream-100 text-xs font-medium leading-snug">開發者 CA</p>
                <p className="text-morandi-stone/40 text-[10px]">AI Tarot v3.0 測試版</p>
              </div>
              <button onClick={()=>setOpen(false)}
                className="text-morandi-stone/35 hover:text-cream-200/60 transition-colors text-sm leading-none flex-shrink-0">✕</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto" style={{ maxHeight:"76vh" }}>

              {/* Intro message */}
              <div className="px-4 py-4" style={{ borderBottom:"1px solid rgba(184,168,200,0.07)" }}>
                <p className="text-cream-200/82 text-[12.5px] leading-relaxed">
                  Dear All，我是開發者 <span className="text-morandi-lavender/90 font-medium">CA</span>！
                </p>
                <p className="text-cream-200/70 text-[12px] leading-relaxed mt-2">
                  這是此產品的測試版 <span className="text-morandi-lavender/80 font-medium">v3.0</span>。
                  各位測試員所看到的許多功能將來都會上鎖，需要加入會員付費。請在測試期間盡情體驗！
                </p>
                <p className="text-cream-200/60 text-[12px] leading-relaxed mt-2">
                  以下有幾個簡單的小問題想請各位填寫～感謝每一份回饋 🌙
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
              作者有話要說！✨
              <span className="absolute -bottom-[7px] right-3 w-3 h-3 rotate-45"
                style={{ background:"rgba(22,16,36,0.95)", borderRight:"1px solid rgba(184,168,200,0.22)", borderBottom:"1px solid rgba(184,168,200,0.22)" }} />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          onClick={()=>{ setOpen((v)=>!v); if(status==="error") setStatus("idle"); }}
          whileHover={{ scale:1.1 }} whileTap={{ scale:0.92 }} title="作者有話要說！"
          className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow:"0 4px 20px rgba(0,0,0,0.5),0 0 0 2px rgba(184,168,200,0.35)" }}>
          <Image src="/assets/CA.jpg" alt="CA" fill className="object-cover object-top" sizes="48px" />
          {!open && (
            <motion.span className="absolute inset-0 rounded-full"
              animate={{ scale:[1,1.4], opacity:[0.5,0] }}
              transition={{ duration:2, repeat:Infinity, ease:"easeOut", delay:0.5 }}
              style={{ border:"2px solid rgba(184,168,200,0.6)" }} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
