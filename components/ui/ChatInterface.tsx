"use client";

import { useState, useCallback, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import type { CardRequest, HistoryMessage } from "@/lib/tarot/types";
import DrawnCards from "./DrawnCards";
import ChatReading from "./ChatReading";

// Three.js canvas — client-only (no SSR: uses document/WebGL)
function DeckLoading() {
  return (
    <div style={{ height: "260px" }} className="flex items-center justify-center text-morandi-stone/30 text-xs">
      載入中...
    </div>
  );
}
const CardDeckCanvas = dynamic(
  () => import("@/components/three/CardDeckCanvas"),
  { ssr: false, loading: DeckLoading },
);

type Step = "idle" | "typing" | "spread" | "deck" | "reveal" | "reading";

interface CardMeta {
  id: number;
  name_en: string;
  name_zh: string;
  local_image: string;
}

interface FollowUpRound {
  question: string;
  answer: string;
}

const SPREAD_OPTIONS = [
  { count: 1 as const, label: "單張牌", sub: "聚焦當下" },
  { count: 2 as const, label: "雙張牌", sub: "過去 · 現在" },
  { count: 3 as const, label: "三張牌", sub: "過去 · 現在 · 未來" },
];

const slideUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as number[] },
};

export interface ChatInterfaceAvatar {
  id: string;
  displayName: string;
  image: string;
  openingLines: string[];
  inputPlaceholder: string;
  suggestions: { icon: string; text: string }[];
}

interface ChatInterfaceProps {
  avatar: ChatInterfaceAvatar;
}

export default function ChatInterface({ avatar }: ChatInterfaceProps) {
  const [step, setStep] = useState<Step>("idle");
  const [question, setQuestion] = useState("");
  const [spreadCount, setSpreadCount] = useState<1 | 2 | 3>(3);
  const [drawnCards, setDrawnCards] = useState<CardRequest[]>([]);
  const [cardMeta, setCardMeta] = useState<Record<number, CardMeta>>({});
  const [metaReady, setMetaReady] = useState(false);
  const [readingText, setReadingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Follow-up conversation state
  const [conversationHistory, setConversationHistory] = useState<HistoryMessage[]>([]);
  const [followUpRounds, setFollowUpRounds] = useState<FollowUpRound[]>([]);
  const [pendingFollowUpQ, setPendingFollowUpQ] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [followUpInput, setFollowUpInput] = useState("");

  // Share
  const [isCapturing, setIsCapturing] = useState(false);
  const readingAreaRef = useRef<HTMLDivElement>(null);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const followUpRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((cards: CardMeta[]) => {
        const map: Record<number, CardMeta> = {};
        cards.forEach((c) => { map[c.id] = c; });
        setCardMeta(map);
        setMetaReady(true);
      })
      .catch(() => setMetaReady(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, readingText, followUpText, followUpRounds]);

  const handleSubmitQuestion = useCallback(() => {
    if (question.trim().length < 2) return;
    setStep("spread");
  }, [question]);

  const handleCardsDrawn = useCallback((cards: CardRequest[]) => {
    setDrawnCards(cards);
    setStep("reveal");
  }, []);

  // ── Initial reading ──────────────────────────────────────────────────────────

  const startReading = useCallback(async () => {
    setStep("reading");
    setReadingText("");
    setIsStreaming(true);
    abortRef.current = new AbortController();
    let accumulated = "";

    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, cards: drawnCards, avatarId: avatar.id }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Reading failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { break; }
          try {
            const p = JSON.parse(payload) as { chunk?: string; error?: string };
            if (p.chunk) {
              accumulated += p.chunk;
              setReadingText((t) => t + p.chunk);
            } else if (p.error) {
              // The route returns HTTP 200 even when the Anthropic call
              // itself fails (the stream had already started) — without
              // this branch, an upstream error (bad API key, rate limit,
              // etc.) was silently swallowed and the persona just never
              // spoke, with no clue why.
              accumulated += `（連線時發生錯誤：${p.error}）`;
              setReadingText((t) => t + `（連線時發生錯誤：${p.error}）`);
            }
          } catch { /* skip */ }
        }
      }
      // Save initial reading to history for follow-ups
      setConversationHistory([{ role: "assistant", content: accumulated }]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setReadingText("連線出了點問題，請稍後再試。");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [question, drawnCards, avatar.id]);

  // ── Follow-up ────────────────────────────────────────────────────────────────

  const handleFollowUp = useCallback(async () => {
    const q = followUpInput.trim();
    if (!q || isFollowUpStreaming) return;

    setFollowUpInput("");
    setPendingFollowUpQ(q);
    setFollowUpText("");
    setIsFollowUpStreaming(true);
    abortRef.current = new AbortController();

    // Build history: initial reading + any previous follow-up rounds + new question
    const history: HistoryMessage[] = [
      ...conversationHistory,
      ...followUpRounds.flatMap((r) => [
        { role: "user" as const, content: r.question },
        { role: "assistant" as const, content: r.answer },
      ]),
      { role: "user" as const, content: q },
    ];

    let accumulated = "";
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, cards: drawnCards, history, avatarId: avatar.id }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Follow-up failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { break; }
          try {
            const p = JSON.parse(payload) as { chunk?: string; error?: string };
            if (p.chunk) {
              accumulated += p.chunk;
              setFollowUpText((t) => t + p.chunk);
            } else if (p.error) {
              accumulated += `（連線時發生錯誤：${p.error}）`;
              setFollowUpText((t) => t + `（連線時發生錯誤：${p.error}）`);
            }
          } catch { /* skip */ }
        }
      }

      setFollowUpRounds((prev) => [...prev, { question: q, answer: accumulated }]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setFollowUpText("連線出了點問題，請稍後再試。");
        setFollowUpRounds((prev) => [...prev, { question: q, answer: "連線出了點問題，請稍後再試。" }]);
      }
    } finally {
      setIsFollowUpStreaming(false);
      setPendingFollowUpQ(null);
      setFollowUpText("");
    }
  }, [followUpInput, isFollowUpStreaming, conversationHistory, followUpRounds, question, drawnCards, avatar.id]);

  // ── Share ────────────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    if (!readingAreaRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(readingAreaRef.current, {
        backgroundColor: "#0f0a1a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `cynthia-tarot-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  // ── Reset ────────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setStep("idle");
    setQuestion("");
    setDrawnCards([]);
    setReadingText("");
    setIsStreaming(false);
    setConversationHistory([]);
    setFollowUpRounds([]);
    setPendingFollowUpQ(null);
    setFollowUpText("");
    setIsFollowUpStreaming(false);
    setFollowUpInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const showFollowUpArea =
    step === "reading" &&
    !isStreaming &&
    !isFollowUpStreaming &&
    !pendingFollowUpQ &&
    readingText.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* ── Scrollable message area ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

        {/* Opening message */}
        <AnimatePresence>
          {(step === "idle" || step === "typing") && (
            <motion.div key="opening" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background: "rgba(176,160,184,0.12)", border: "1px solid rgba(184,168,200,0.12)" }}>
                  <p className="text-cream-200/80 text-sm leading-[1.85] font-light">
                    {avatar.openingLines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < avatar.openingLines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </AssistantBlock>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User question bubble — shown outside screenshot during spread/deck/reveal only */}
        <AnimatePresence>
          {(step === "spread" || step === "deck" || step === "reveal") && (
            <motion.div key="question" {...slideUp}>
              <UserBubble text={question} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spread picker */}
        <AnimatePresence>
          {step === "spread" && (
            <motion.div key="spread" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <p className="text-cream-200/80 text-sm mb-4">選一個牌陣吧</p>
                <div className="flex gap-2 flex-wrap">
                  {SPREAD_OPTIONS.map(({ count, label, sub }, i) => (
                    <motion.button
                      key={count}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSpreadCount(count); setStep("deck"); }}
                      className="flex flex-col items-center px-5 py-3 rounded-xl border border-morandi-lavender/25 hover:border-morandi-lavender/60 hover:bg-morandi-mauve/20 text-sm transition-colors duration-200"
                    >
                      <span className="text-cream-200/90">{label}</span>
                      <span className="text-morandi-stone/60 text-xs mt-0.5">{sub}</span>
                    </motion.button>
                  ))}
                </div>
              </AssistantBlock>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card deck — Three.js 3D spread */}
        <AnimatePresence>
          {step === "deck" && (
            <motion.div key="deck" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <p className="text-cream-200/80 text-sm mb-1">
                  深呼吸——感覺哪張牌在等你
                </p>
                <p className="text-morandi-stone/40 text-[11px] mb-4 tracking-wider">
                  hover 查看 · 點擊抽取
                </p>
                <CardDeckCanvas spreadCount={spreadCount} onComplete={handleCardsDrawn} />
              </AssistantBlock>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card reveal + reading — no AssistantBlock wrapper so bubbles use full width */}
        {(step === "reveal" || step === "reading") && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Screenshot capture area — includes question + cards + reading */}
            <div ref={readingAreaRef} className="flex flex-col gap-3">
              {/* Question bubble — inside screenshot */}
              <UserBubble text={question} />

              {/* Cards — centered */}
              <div className="flex justify-center">
                <DrawnCards key={metaReady ? "ready" : "loading"} cards={drawnCards} cardMeta={cardMeta} />
              </div>

              {/* Begin reading button */}
              {step === "reveal" && (
                <motion.div
                  className="mt-2 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <motion.button
                    onClick={startReading}
                    whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(184,168,200,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 rounded-full border border-morandi-lavender/40 bg-morandi-mauve/15 text-cream-100 text-sm tracking-widest hover:bg-morandi-mauve/30 hover:border-morandi-lavender/60 transition-colors duration-300"
                  >
                    ✨ 開始解讀
                  </motion.button>
                </motion.div>
              )}

              {/* Initial reading — full width */}
              {step === "reading" && (
                <ChatReading text={readingText} isStreaming={isStreaming} />
              )}

              {/* Completed follow-up rounds */}
              {followUpRounds.map((round, i) => (
                <Fragment key={`round-${i}`}>
                  <UserBubble text={round.question} />
                  <ChatReading text={round.answer} isStreaming={false} />
                </Fragment>
              ))}

              {/* Actively streaming follow-up */}
              {pendingFollowUpQ && (
                <>
                  <UserBubble text={pendingFollowUpQ} />
                  <ChatReading text={followUpText} isStreaming={isFollowUpStreaming} />
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Follow-up input + action buttons */}
        <AnimatePresence>
          {showFollowUpArea && (
            <motion.div
              key="followup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3"
            >
              {/* Follow-up input */}
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <div className="relative rounded-2xl border border-morandi-lavender/20 bg-mystic-purple/20 focus-within:border-morandi-lavender/40 transition-colors">
                  <textarea
                    ref={followUpRef}
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFollowUp();
                    }}
                    placeholder={`還有想追問 ${avatar.displayName} 的嗎？`}
                    rows={2}
                    maxLength={200}
                    className="w-full bg-transparent text-cream-100 placeholder-morandi-stone/35 text-sm p-3 pr-10 resize-none focus:outline-none leading-relaxed"
                  />
                  <motion.button
                    disabled={followUpInput.trim().length < 2}
                    onClick={handleFollowUp}
                    whileHover={followUpInput.trim().length >= 2 ? { scale: 1.1 } : {}}
                    whileTap={followUpInput.trim().length >= 2 ? { scale: 0.92 } : {}}
                    className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-morandi-mauve/30 border border-morandi-lavender/30 flex items-center justify-center text-cream-200 disabled:opacity-20 hover:bg-morandi-mauve/60 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </div>
              </AssistantBlock>

              {/* Reset + Share */}
              <div className="flex gap-2 justify-center">
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-2.5 rounded-full border border-morandi-lavender/25 text-morandi-stone/70 text-xs tracking-widest hover:border-morandi-lavender/55 hover:text-cream-200 transition-colors duration-300"
                >
                  ↺ 重新占卜
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  disabled={isCapturing}
                  whileHover={!isCapturing ? { scale: 1.04 } : {}}
                  whileTap={!isCapturing ? { scale: 0.96 } : {}}
                  className="px-6 py-2.5 rounded-full border border-morandi-lavender/25 text-morandi-stone/70 text-xs tracking-widest hover:border-morandi-lavender/55 hover:text-cream-200 transition-colors duration-300 disabled:opacity-40"
                >
                  {isCapturing ? "截圖中..." : "✦ 分享這次解讀"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <AnimatePresence>
        {(step === "idle" || step === "typing") && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-morandi-lavender/10 p-4 flex flex-col gap-3"
          >
            <div className="relative rounded-2xl border border-morandi-lavender/20 bg-mystic-purple/30 focus-within:border-morandi-lavender/50 transition-colors">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setStep(e.target.value ? "typing" : "idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitQuestion();
                }}
                placeholder={avatar.inputPlaceholder}
                rows={3}
                maxLength={300}
                className="w-full bg-transparent text-cream-100 placeholder-morandi-stone/40 text-sm p-4 pr-12 resize-none focus:outline-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-morandi-stone/30 text-xs">{question.length}/300</span>
                <motion.button
                  disabled={question.trim().length < 2}
                  onClick={handleSubmitQuestion}
                  whileHover={question.trim().length >= 2 ? { scale: 1.1 } : {}}
                  whileTap={question.trim().length >= 2 ? { scale: 0.92 } : {}}
                  className="w-8 h-8 rounded-full bg-morandi-mauve/30 border border-morandi-lavender/30 flex items-center justify-center text-cream-200 disabled:opacity-20 hover:bg-morandi-mauve/60 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Moon-phase suggestions */}
            <AnimatePresence>
              {step === "idle" && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1.5"
                >
                  <p className="text-morandi-stone/30 text-[11px] tracking-widest mb-0.5">或者讓月亮引路 ——</p>
                  {avatar.suggestions.map(({ icon, text }, i) => (
                    <motion.button
                      key={text}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      onClick={() => { setQuestion(text); setStep("typing"); inputRef.current?.focus(); }}
                      className="flex items-center gap-2.5 text-left group transition-all duration-200"
                    >
                      <span className="text-base opacity-50 group-hover:opacity-90 transition-opacity">{icon}</span>
                      <span className="text-morandi-stone/45 text-xs group-hover:text-cream-200/70 transition-colors border-b border-transparent group-hover:border-morandi-lavender/30">
                        {text}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-morandi-lavender/20 border border-morandi-lavender/20 px-4 py-3">
        <p className="text-cream-100 text-sm">{text}</p>
      </div>
    </div>
  );
}

function AssistantBlock({
  children,
  avatarImage,
  avatarAlt,
}: {
  children: React.ReactNode;
  avatarImage: string;
  avatarAlt: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-morandi-lavender/35 flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(184,168,200,0.15)]">
        <Image
          src={avatarImage}
          alt={avatarAlt}
          fill
          className="object-cover object-top"
          sizes="32px"
        />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
