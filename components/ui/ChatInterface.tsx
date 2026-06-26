"use client";

import React, { useState, useCallback, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import type { CardRequest, HistoryMessage, SpreadType } from "@/lib/tarot/types";
import { MAJOR_IDS, MINOR_NUMBERED_IDS, COURT_IDS } from "@/lib/tarot/cardCategories";
import DrawnCards from "./DrawnCards";
import ChatReading from "./ChatReading";
import QuestionRefine from "./QuestionRefine";

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

type Step = "idle" | "typing" | "stillness" | "refine" | "spread" | "deck" | "reveal" | "reading";

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

const PHASE_CONFIG = [
  { label: "天（靈魂課題）", desc: "大牌 · 22 張", allowedIds: new Set(MAJOR_IDS) },
  { label: "地（現實事件）", desc: "數字牌 · 40 張", allowedIds: new Set(MINOR_NUMBERED_IDS) },
  { label: "人（心態鏡子）", desc: "宮廷牌 · 16 張", allowedIds: new Set(COURT_IDS) },
] as const;

interface SpreadOption {
  count: 1 | 2 | 3 | 7;
  label: string;
  sub: string;
  positions: string[];
  /** 天地人分類抽牌：自動從大牌/數字牌/宮廷牌各抽一張，跳過手動挑牌 */
  categoryDraw?: boolean;
  /** 七脈輪牌陣：只用 22 張大阿爾克納，spreadType → "chakra" */
  chakraDraw?: boolean;
}

const CHAKRA_POSITIONS = ["海底輪", "臍輪", "太陽神經叢", "心輪", "喉輪", "眉心輪", "頂輪"];

const SPREAD_OPTIONS: SpreadOption[] = [
  { count: 1 as const, label: "單張指引", sub: "當下最需要的訊息", positions: ["當下訊息"] },
  { count: 2 as const, label: "時間軸", sub: "過去 · 現在", positions: ["過去", "現在"] },
  { count: 2 as const, label: "選擇牌陣", sub: "選項 A · 選項 B", positions: ["選項 A", "選項 B"] },
  { count: 3 as const, label: "過去現在未來", sub: "過去 · 現在 · 未來", positions: ["過去", "現在", "未來"] },
  { count: 3 as const, label: "情況挑戰建議", sub: "情況 · 挑戰 · 建議", positions: ["情況", "挑戰", "建議"] },
  { count: 3 as const, label: "心身靈", sub: "心 · 身 · 靈", positions: ["心", "身", "靈"] },
  { count: 3 as const, label: "天地人診斷", sub: "課題 · 事件 · 心態", positions: ["天（靈魂課題）", "地（現實事件）", "人（心態鏡子）"], categoryDraw: true },
  { count: 7 as const, label: "七脈輪掃描", sub: "22 大牌 · 能量全身掃描", positions: CHAKRA_POSITIONS, chakraDraw: true },
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
  followUpInvite: string;
  followUpPlaceholder: string;
}

interface ChatInterfaceProps {
  avatar: ChatInterfaceAvatar;
}

export default function ChatInterface({ avatar }: ChatInterfaceProps) {
  const [step, setStep] = useState<Step>("idle");
  const [question, setQuestion] = useState("");
  const [spreadCount, setSpreadCount] = useState<1 | 2 | 3 | 7>(3);
  const [spreadPositions, setSpreadPositions] = useState<string[]>([]);
  const [spreadType, setSpreadType] = useState<SpreadType>("normal");
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

  // Stillness step auto-advance
  const stillnessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refine-question step state
  const [refineSuggestions, setRefineSuggestions] = useState<string[]>([]);
  const [refineIssueLabel, setRefineIssueLabel] = useState("");
  const refineResultRef = useRef<{ shouldRefine: boolean; issueLabel?: string; suggestions?: string[] } | null>(null);
  const refineWaitCountRef = useRef(0);

  // Enter-to-send preference (persisted in localStorage)
  const [enterToSend, setEnterToSend] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("enterToSend");
    if (saved === "true") setEnterToSend(true);
  }, []);
  const toggleEnterToSend = () => {
    setEnterToSend((v) => {
      localStorage.setItem("enterToSend", String(!v));
      return !v;
    });
  };

  // Share
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCategorySpread, setIsCategorySpread] = useState(false);
  const [isChakraSpread, setIsChakraSpread] = useState(false);
  const [categoryCards, setCategoryCards] = useState<CardRequest[]>([]);
  // Derive current phase from how many cards have been collected (no separate state needed)
  const categoryPhase = Math.min(categoryCards.length, 2) as 0 | 1 | 2;
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



  const advanceFromStillness = useCallback(() => {
    if (stillnessTimerRef.current) clearTimeout(stillnessTimerRef.current);
    const result = refineResultRef.current;
    if (result && result.shouldRefine && result.suggestions && result.suggestions.length > 0) {
      setRefineSuggestions(result.suggestions);
      setRefineIssueLabel(result.issueLabel ?? "");
      setStep("refine");
    } else {
      setStep("spread");
    }
    refineResultRef.current = null;
    refineWaitCountRef.current = 0;
  }, []);

  const handleSubmitQuestion = useCallback(() => {
    if (question.trim().length < 2) return;
    setStep("stillness");
    refineResultRef.current = null;
    refineWaitCountRef.current = 0;

    // Fire refine-question API in parallel with stillness animation
    fetch("/api/refine-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim() }),
    })
      .then((r) => r.json())
      .then((data: { shouldRefine: boolean; issueLabel?: string; suggestions?: string[] }) => {
        refineResultRef.current = data;
      })
      .catch(() => {
        refineResultRef.current = { shouldRefine: false };
      });

    // Auto-advance to spread/refine after 4 s
    stillnessTimerRef.current = setTimeout(() => advanceFromStillness(), 4000);
  }, [question, advanceFromStillness]);

  const handleCardsDrawn = useCallback((cards: CardRequest[]) => {
    setDrawnCards(cards);
    setStep("reveal");
  }, []);

  const handleCategoryPhaseComplete = useCallback((cards: CardRequest[]) => {
    setCategoryCards((prev) => {
      const next = [...prev, ...cards];
      if (next.length >= 3) {
        // All 3 phases done — proceed to reveal
        setDrawnCards(next);
        setStep("reveal");
      }
      return next;
    });
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
        body: JSON.stringify({ question, cards: drawnCards, avatarId: avatar.id, spreadPositions, spreadType }),
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
        const detail = (err as Error).message;
        setReadingText(detail ? `連線出了點問題：${detail}` : "連線出了點問題，請稍後再試。");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [question, drawnCards, avatar.id, spreadPositions, spreadType]);

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
        body: JSON.stringify({ question, cards: drawnCards, history, avatarId: avatar.id, spreadType }),
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
        const detail = (err as Error).message;
        const msg = detail ? `連線出了點問題：${detail}` : "連線出了點問題，請稍後再試。";
        setFollowUpText(msg);
        setFollowUpRounds((prev) => [...prev, { question: q, answer: msg }]);
      }
    } finally {
      setIsFollowUpStreaming(false);
      setPendingFollowUpQ(null);
      setFollowUpText("");
    }
  }, [followUpInput, isFollowUpStreaming, conversationHistory, followUpRounds, question, drawnCards, avatar.id, spreadType]);

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
    if (stillnessTimerRef.current) clearTimeout(stillnessTimerRef.current);
    setStep("idle");
    setQuestion("");
    setIsCategorySpread(false);
    setIsChakraSpread(false);
    setSpreadType("normal");
    setCategoryCards([]);
    setRefineSuggestions([]);
    setRefineIssueLabel("");
    refineResultRef.current = null;
    refineWaitCountRef.current = 0;
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
    <div className="relative flex flex-col h-full">
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


        {/* ── 靜心時刻 ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {step === "stillness" && (
            <motion.div
              key="stillness"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 py-12 px-6 text-center"
            >
              {/* Breathing orb */}
              <div className="relative flex items-center justify-center">
                {/* Outer glow ring */}
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.45, 0.2] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-36 h-36 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(184,168,200,0.3) 0%, transparent 70%)" }}
                />
                {/* Inner orb */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 38% 32%, rgba(200,184,220,0.22) 0%, rgba(29,18,40,0.85) 100%)",
                    border: "1px solid rgba(184,168,200,0.25)",
                    boxShadow: "0 0 40px rgba(184,168,200,0.12), inset 0 0 20px rgba(184,168,200,0.06)",
                  }}
                >
                  <span className="text-3xl select-none">🌙</span>
                </motion.div>
              </div>

              {/* Sequential guiding text */}
              <div className="flex flex-col gap-3">
                {[
                  { text: "靜下心……", delay: 0.4 },
                  { text: "把這個問題放進心裡……", delay: 1.2 },
                  { text: "感受它。", delay: 2.2 },
                ].map(({ text, delay }) => (
                  <motion.p
                    key={text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-cream-200/70 text-sm tracking-[0.15em] font-light"
                  >
                    {text}
                  </motion.p>
                ))}
              </div>

              {/* Skip button — appears after 1.5 s */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                onClick={() => {
                  if (stillnessTimerRef.current) clearTimeout(stillnessTimerRef.current);
                  advanceFromStillness();
                }}
                className="text-morandi-stone/35 text-[11px] tracking-widest hover:text-cream-200/55 transition-colors duration-300 border-b border-morandi-stone/20 hover:border-morandi-stone/40 pb-0.5"
              >
                我準備好了 →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User question bubble — shown outside screenshot during spread/deck/reveal/prereading only */}
        <AnimatePresence>
          {(step === "refine" || step === "spread" || step === "deck") && (
            <motion.div key="question" {...slideUp}>
              <UserBubble text={question} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spread picker */}
        <AnimatePresence>
          {step === "refine" && (
            <motion.div key="refine" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <QuestionRefine
                  avatarImage={avatar.image}
                  avatarName={avatar.displayName}
                  originalQuestion={question}
                  issueLabel={refineIssueLabel}
                  suggestions={refineSuggestions}
                  onSelect={(refined) => {
                    setQuestion(refined);
                    setStep("spread");
                  }}
                  onSkip={() => setStep("spread")}
                />
              </AssistantBlock>
            </motion.div>
          )}

          {step === "spread" && (
            <motion.div key="spread" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <p className="text-cream-200/80 text-sm mb-4">選一個牌陣吧</p>
                <div className="flex gap-2 flex-wrap">
                  {SPREAD_OPTIONS.map((option, i) => (
                    <motion.button
                      key={`${option.count}-${option.label}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSpreadCount(option.count); setSpreadPositions(option.positions); setIsCategorySpread(option.categoryDraw ?? false); setIsChakraSpread(option.chakraDraw ?? false); setSpreadType(option.chakraDraw ? "chakra" : "normal"); setCategoryCards([]); setStep("deck"); }}
                      className="flex flex-col items-center px-5 py-3 rounded-xl border border-morandi-lavender/25 hover:border-morandi-lavender/60 hover:bg-morandi-mauve/20 text-sm transition-colors duration-200"
                    >
                      <span className="text-cream-200/90">{option.label}</span>
                      <span className="text-morandi-stone/60 text-xs mt-0.5">{option.sub}</span>
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
                {isCategorySpread ? (
                  <div className="flex flex-col gap-3 w-full">
                    {/* Phase progress dots */}
                    <div className="flex items-center gap-2 mb-1">
                      {PHASE_CONFIG.map((phase, i) => (
                        <Fragment key={phase.label}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-300"
                              style={{
                                background: i < categoryPhase
                                  ? "rgba(184,168,200,0.6)"
                                  : i === categoryPhase
                                    ? "rgba(184,168,200,0.2)"
                                    : "rgba(184,168,200,0.06)",
                                border: i === categoryPhase
                                  ? "1px solid rgba(184,168,200,0.6)"
                                  : "1px solid rgba(184,168,200,0.15)",
                                color: i <= categoryPhase ? "rgba(235,225,245,0.9)" : "rgba(184,168,200,0.3)",
                              }}
                            >
                              {i < categoryPhase ? "✓" : i + 1}
                            </div>
                            <span className="text-[9px] tracking-wider" style={{ color: i === categoryPhase ? "rgba(212,168,89,0.8)" : "rgba(166,153,185,0.35)" }}>
                              {phase.label.split("（")[0]}
                            </span>
                          </div>
                          {i < 2 && <div className="flex-1 h-px mt-[-10px]" style={{ background: i < categoryPhase ? "rgba(184,168,200,0.4)" : "rgba(184,168,200,0.1)" }} />}
                        </Fragment>
                      ))}
                    </div>
                    {/* Current phase label */}
                    <div className="flex flex-col gap-0.5 mb-1">
                      <p className="text-cream-200/90 text-sm">
                        {PHASE_CONFIG[categoryPhase].label}
                      </p>
                      <p className="text-morandi-stone/45 text-[11px] tracking-wider">
                        {PHASE_CONFIG[categoryPhase].desc} · 感覺哪張牌在等你
                      </p>
                    </div>
                    {/* Filtered deck — key forces remount on phase change */}
                    <CardDeckCanvas
                      key={`category-phase-${categoryPhase}`}
                      spreadCount={1}
                      onComplete={handleCategoryPhaseComplete}
                      spreadPositions={[PHASE_CONFIG[categoryPhase].label]}
                      allowedIds={PHASE_CONFIG[categoryPhase].allowedIds}
                    />
                  </div>
                ) : isChakraSpread ? (
                  <>
                    <p className="text-cream-200/80 text-sm mb-1">深呼吸——讓每個脈輪的大牌浮現</p>
                    <p className="text-morandi-stone/40 text-[11px] mb-4 tracking-wider">22 大阿爾克納 · 依序選出 7 張</p>
                    <CardDeckCanvas
                      spreadCount={7}
                      onComplete={handleCardsDrawn}
                      spreadPositions={CHAKRA_POSITIONS}
                      allowedIds={new Set(MAJOR_IDS)}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-cream-200/80 text-sm mb-1">
                      深呼吸——感覺哪張牌在等你
                    </p>
                    <p className="text-morandi-stone/40 text-[11px] mb-4 tracking-wider">
                      hover 查看 · 點擊抽取
                    </p>
                    <CardDeckCanvas spreadCount={spreadCount} onComplete={handleCardsDrawn} spreadPositions={spreadPositions} />
                  </>
                )}
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
              <div className="flex justify-center pb-10">
                <DrawnCards key={metaReady ? "ready" : "loading"} cards={drawnCards} cardMeta={cardMeta} positions={spreadPositions} />
              </div>

              {/* Begin reading button */}
              {step === "reveal" && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <motion.button
                    onClick={() => startReading()}
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
                <ChatReading text={readingText} isStreaming={isStreaming} avatarSrc={avatar.image} avatarAlt={avatar.displayName} />
              )}

              {/* Completed follow-up rounds */}
              {followUpRounds.map((round, i) => (
                <Fragment key={`round-${i}`}>
                  <UserBubble text={round.question} />
                  <ChatReading text={round.answer} isStreaming={false} avatarSrc={avatar.image} avatarAlt={avatar.displayName} />
                </Fragment>
              ))}

              {/* Actively streaming follow-up */}
              {pendingFollowUpQ && (
                <>
                  <UserBubble text={pendingFollowUpQ} />
                  <ChatReading text={followUpText} isStreaming={isFollowUpStreaming} avatarSrc={avatar.image} avatarAlt={avatar.displayName} />
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
                <p className="text-cream-200/60 text-sm mb-3 leading-relaxed">{avatar.followUpInvite}</p>
                <div className="relative rounded-2xl border border-morandi-lavender/20 bg-mystic-purple/20 focus-within:border-morandi-lavender/40 transition-colors">
                  <textarea
                    ref={followUpRef}
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (enterToSend && !e.shiftKey) { e.preventDefault(); handleFollowUp(); }
                        else if (e.metaKey || e.ctrlKey) handleFollowUp();
                      }
                    }}
                    placeholder={avatar.followUpPlaceholder}
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
                  if (e.key === "Enter") {
                    if (enterToSend && !e.shiftKey) { e.preventDefault(); handleSubmitQuestion(); }
                    else if (e.metaKey || e.ctrlKey) handleSubmitQuestion();
                  }
                }}
                placeholder={avatar.inputPlaceholder}
                rows={3}
                maxLength={300}
                className="w-full bg-transparent text-cream-100 placeholder-morandi-stone/40 text-sm p-4 pr-12 resize-none focus:outline-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
{/* Enter-to-send toggle */}
                <button
                  onClick={toggleEnterToSend}
                  title={enterToSend ? "Enter 發送（點擊關閉）" : "點擊開啟 Enter 直接發送"}
                  className={`text-[11px] px-2 py-0.5 rounded-md border font-mono transition-all duration-200 ${
                    enterToSend
                      ? "border-morandi-lavender/55 text-morandi-lavender/90 bg-morandi-mauve/25 shadow-[0_0_8px_rgba(184,168,200,0.15)]"
                      : "border-morandi-stone/40 text-morandi-stone/65 hover:border-morandi-lavender/45 hover:text-morandi-lavender/70 hover:bg-morandi-mauve/10"
                  }`}
                >
                  ↵
                </button>
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
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-0.5">
                    <p className="text-morandi-stone/60 text-[11px] tracking-widest">或者讓月亮引路</p>
                    {enterToSend ? (
                      <span className="px-1.5 py-0.5 rounded border border-morandi-lavender/40 bg-morandi-mauve/20 text-morandi-lavender/80 text-[10px] font-mono">
                        ↵ Enter 發送中
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded border border-morandi-stone/30 bg-morandi-stone/8 text-morandi-stone/65 font-mono">Shift+Enter</span>
                        <span className="text-morandi-stone/45">換行</span>
                        <span className="text-morandi-stone/30 mx-0.5">·</span>
                        <span className="px-1.5 py-0.5 rounded border border-morandi-stone/30 bg-morandi-stone/8 text-morandi-stone/65 font-mono">↵</span>
                        <span className="text-morandi-stone/45">點擊開啟 Enter 發送</span>
                      </span>
                    )}
                  </div>
                  {avatar.suggestions.map(({ icon, text }, i) => (
                    <motion.button
                      key={text}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      onClick={() => { setQuestion(text); setStep("typing"); inputRef.current?.focus(); }}
                      className="flex items-center gap-2.5 text-left group transition-all duration-200"
                    >                      <span className="text-morandi-stone/50 text-sm mr-0.5">{icon}</span>
                      <span className="text-morandi-stone/65 text-xs leading-relaxed">{text}</span>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssistantBlock({
  avatarImage,
  avatarAlt,
  children,
}: {
  avatarImage: string;
  avatarAlt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-morandi-lavender/20">
        <Image src={avatarImage} alt={avatarAlt} fill className="object-cover object-top" sizes="32px" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-cream-100/90 leading-relaxed"
        style={{ background: "rgba(120,90,160,0.22)", border: "1px solid rgba(184,168,200,0.15)" }}
      >
        {text}
      </div>
    </div>
  );
}
