"use client";

import React from "react";

/**
 * ShrineDraw — the full chat-based 月神神社 draw flow, mirroring
 * components/ui/ChatInterface.tsx (the tarot flow) so both personas share
 * the same conversational shape:
 *
 *   idle/typing → draw (shake → pop) → revealed → reading → done
 *
 * The user first types their concern into the chat, then shakes the 籤筒
 * within the same thread, then asks the selected 解籤師 (see `avatar` prop,
 * sourced from lib/omikuji/avatars.ts) to interpret the drawn poem — the
 * interpretation is generated server-side (app/api/omikuji-reading) from
 * the user's actual question + the poem's real content, never generic.
 *
 * CLAUDE.md ritual-cushioning rule: the fold-and-hang-on-結籤架 action only
 * ever appears in the action row AFTER Tsukino's interpretation has been
 * read — never as a button on the bare poem reveal. This keeps every
 * 凶/兇 disclosure (which, per the scoped exception, may state the source's
 * negative content as objective fact) inside a containing ritual rather
 * than as an unmitigated prophecy.
 */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import type { OmikujiEntry } from "@/lib/omikuji/types";

import ChatReading from "@/components/ui/ChatReading";
import MusubiRack, { type MusubiKnot } from "./MusubiRack";
import OmikujiResultCard from "./OmikujiResultCard";
import OmikujiTube from "./OmikujiTube";

type Step = "idle" | "typing" | "stillness" | "draw" | "revealed" | "reading";
type TubePhase = "idle" | "shaking" | "popping";

const slideUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as number[] },
};

// ── 結籤架 reveal timing (after a 凶/兇 slip is actually hung) ───────────────
// 1. the curtain blurs in from nothing to fully clear, completely covering
//    the chat behind it
// 2. once clear, it holds briefly in silence
// 3. a short 逢凶化吉 blessing fades in over it
// 4. then everything clears back to the original conversation
// (trimmed down from an earlier pass that lingered too long overall)
const RACK_REVEAL_S = 1.8;
const RACK_HOLD_S = 2;
const BLESSING_S = 2.6;

// An original line rather than the stock idiom — same 逢凶化吉 idea (what's
// dark now doesn't stay dark), told through Tsukino's moon imagery instead.
const BLESSING_LINES = ["籤已摺起，安放架上。", "暗去的月，終會再圓。"];

export interface ShrineDrawAvatar {
  id: string;
  displayName: string;
  image: string;
  openingLines: string[];
  inputPlaceholder: string;
  suggestions: { icon: string; text: string }[];
  followUpInvite: string;
  followUpPlaceholder: string;
}

interface ShrineDrawProps {
  avatar: ShrineDrawAvatar;
}

export default function ShrineDraw({ avatar }: ShrineDrawProps) {
  const [step, setStep] = useState<Step>("idle");
  const [question, setQuestion] = useState("");

  const [entries, setEntries] = useState<OmikujiEntry[]>([]);
  const [loadError, setLoadError] = useState(false);

  const [tubePhase, setTubePhase] = useState<TubePhase>("idle");
  const [current, setCurrent] = useState<OmikujiEntry | null>(null);

  const [interpretation, setInterpretation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [folding, setFolding] = useState(false);
  const [knots, setKnots] = useState<MusubiKnot[]>([]);
  const [showRack, setShowRack] = useState(false);
  const [showBlessing, setShowBlessing] = useState(false);

  const [isCapturing, setIsCapturing] = useState(false);

  // Follow-up conversation state
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [followUpRounds, setFollowUpRounds] = useState<{ question: string; answer: string }[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const [pendingFollowUpQ, setPendingFollowUpQ] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const followUpRef = useRef<HTMLTextAreaElement>(null);

  // Enter-to-send toggle — shared localStorage key with ChatInterface
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

  const abortRef = useRef<AbortController | null>(null);
  const stillnessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const foldTimersRef = useRef<number[]>([]);

  useEffect(() => {
    fetch("/api/omikuji")
      .then((r) => r.json())
      .then((data: OmikujiEntry[]) => setEntries(data))
      .catch(() => setLoadError(true));
  }, []);

  // Clear any pending rack-reveal timers + follow-up stream on unmount.
  useEffect(() => {
    return () => {
      foldTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [step, interpretation, tubePhase]);

  // ── Question → draw ─────────────────────────────────────────────────────────

  const handleSubmitQuestion = useCallback(() => {
    if (question.trim().length < 2 || entries.length === 0) return;
    setStep("stillness");
    stillnessTimerRef.current = setTimeout(() => {
      setStep("draw");
      setTubePhase("idle");
    }, 4000);
  }, [question, entries]);

  const handleSkipStillness = useCallback(() => {
    if (stillnessTimerRef.current) clearTimeout(stillnessTimerRef.current);
    setStep("draw");
    setTubePhase("idle");
  }, []);

  const handleStartShake = useCallback(() => {
    if (entries.length === 0 || tubePhase !== "idle") return;
    setTubePhase("shaking");
  }, [entries, tubePhase]);

  const handleShakeComplete = useCallback(() => {
    const picked = entries[Math.floor(Math.random() * entries.length)];
    setCurrent(picked);
    setTubePhase("popping");
  }, [entries]);

  const handlePopComplete = useCallback(() => {
    setStep("revealed");
  }, []);

  // ── Tsukino's interpretation ─────────────────────────────────────────────────

  const startInterpretation = useCallback(async () => {
    if (!current) return;
    setStep("reading");
    setInterpretation("");
    setIsStreaming(true);
    abortRef.current = new AbortController();
    let accumulated = "";

    try {
      const res = await fetch("/api/omikuji-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, omikujiId: current.id, avatarId: avatar.id }),
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
          if (payload === "[DONE]") break;
          try {
            const p = JSON.parse(payload) as { chunk?: string; error?: string };
            if (p.chunk) {
              accumulated += p.chunk;
              setInterpretation((t) => t + p.chunk);
            } else if (p.error) {
              // Route returns HTTP 200 even when the Anthropic call itself
              // fails mid-stream — surface it instead of staying silent.
              setInterpretation((t) => t + `（連線時發生錯誤：${p.error}）`);
            }
          } catch {
            /* skip */
          }
        }
      }
      // Save initial interpretation to history for follow-ups
      setConversationHistory([{ role: "assistant", content: accumulated }]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        // Show the actual error instead of a generic message — this used
        // to discard err.message (set above from the server's own
        // ApiError.error) and always show "連線出了點問題", which made
        // every failure look identical and impossible to diagnose.
        const detail = (err as Error).message;
        setInterpretation(detail ? `連線出了點問題：${detail}` : "連線出了點問題，請稍後再試。");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [current, question, avatar.id]);

  // ── Follow-up ────────────────────────────────────────────────────────────────

  const handleFollowUp = useCallback(async () => {
    const q = followUpInput.trim();
    if (!q || isFollowUpStreaming || !current) return;

    setFollowUpInput("");
    setPendingFollowUpQ(q);
    setFollowUpText("");
    setIsFollowUpStreaming(true);
    abortRef.current = new AbortController();

    const history: { role: "user" | "assistant"; content: string }[] = [
      ...conversationHistory,
      ...followUpRounds.flatMap((r) => [
        { role: "user" as const, content: r.question },
        { role: "assistant" as const, content: r.answer },
      ]),
      { role: "user" as const, content: q },
    ];

    let followAccumulated = "";
    try {
      const res = await fetch("/api/omikuji-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, omikujiId: current.id, avatarId: avatar.id, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Follow-up failed");
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
          if (payload === "[DONE]") break;
          try {
            const p = JSON.parse(payload) as { chunk?: string; error?: string };
            if (p.chunk) {
              followAccumulated += p.chunk;
              setFollowUpText((t) => t + p.chunk);
            } else if (p.error) {
              setFollowUpText((t) => t + `（連線時發生錯誤：${p.error}）`);
            }
          } catch { /* skip */ }
        }
      }
      setFollowUpRounds((prev) => [...prev, { question: q, answer: followAccumulated }]);
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
  }, [followUpInput, isFollowUpStreaming, current, conversationHistory, followUpRounds, question, avatar.id]);

  // ── Share ────────────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    if (!captureRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0f0a1a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${avatar.id}-omikuji-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  // ── Accept / fold-and-hang ───────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    foldTimersRef.current.forEach((id) => window.clearTimeout(id));
    foldTimersRef.current = [];
    abortRef.current?.abort();
    if (stillnessTimerRef.current) clearTimeout(stillnessTimerRef.current);
    setStep("idle");
    setQuestion("");
    setTubePhase("idle");
    setCurrent(null);
    setInterpretation("");
    setIsStreaming(false);
    setFolding(false);
    setShowRack(false);
    setShowBlessing(false);
    setConversationHistory([]);
    setFollowUpRounds([]);
    setPendingFollowUpQ(null);
    setFollowUpText("");
    setIsFollowUpStreaming(false);
    setFollowUpInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleAccept = useCallback(() => {
    if (!current) return;
    if (current.isBadFortune) {
      setFolding(true);
    } else {
      resetAll();
    }
  }, [current, resetAll]);

  const handleFoldComplete = useCallback(() => {
    if (current) {
      setKnots((prev) => [...prev, { id: current.id, key: `${current.id}-${Date.now()}` }]);
    }
    // Only once it's actually hung does the rack curtain surface — never
    // just because a bad fortune was drawn. Sequence: blur-to-clear reveal
    // → silent hold → 逢凶化吉 blessing fades in → back to the conversation.
    setShowRack(true);
    const t1 = window.setTimeout(
      () => setShowBlessing(true),
      (RACK_REVEAL_S + RACK_HOLD_S) * 1000
    );
    const t2 = window.setTimeout(
      () => resetAll(),
      (RACK_REVEAL_S + RACK_HOLD_S + BLESSING_S) * 1000
    );
    foldTimersRef.current.push(t1, t2);
  }, [current, resetAll]);

  const showActionArea = step === "reading" && !isStreaming && !isFollowUpStreaming && !pendingFollowUpQ && interpretation.length > 0;

  return (
    <div className="relative flex flex-col h-full">
      {/* ── 結籤架 reveal — a full curtain positioned absolutely so it never
          affects the message flow's layout/height, but stacked ABOVE the
          chat log (z-20 > the scroll area's z-10) and covering it
          completely once it appears, so it reads as a clear ritual takeover
          rather than a faint backdrop peeking through. It only fades in
          after a 凶/兇 slip has actually been hung (handleFoldComplete),
          never just because a bad fortune was drawn — and it's cleared by
          resetAll, so a redraw / next question never inherits it. ── */}
      <AnimatePresence>
        {showRack && (
          <motion.div
            key="rack-curtain"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-6 py-6 overflow-y-auto"
            style={{ background: "rgba(13, 9, 20, 0.93)" }}
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: RACK_REVEAL_S, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Capped well below MusubiRack's own max-w-md default — at
                full size the rack image alone could fill the whole panel
                and push the label/blessing text out of view entirely. */}
            <div className="w-full max-w-[260px] flex-shrink-0">
              <MusubiRack knots={knots} />
            </div>

            <AnimatePresence>
              {showBlessing && (
                <motion.div
                  key="blessing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  {BLESSING_LINES.map((line, i) => (
                    <p
                      key={line}
                      className={
                        i === 0
                          ? "font-serif text-cream-100 text-base tracking-wide"
                          : "text-amber-200/70 text-sm mt-2 tracking-wide"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable message area ── */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {loadError && (
          <p className="text-morandi-rose/70 text-xs">
            無法載入籤詩資料，請確認 /wiki-omikuji 已建立。
          </p>
        )}

        {/* Opening message */}
        <AnimatePresence>
          {(step === "idle" || step === "typing") && (
            <motion.div key="opening" {...slideUp}>
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background: "rgba(212,168,89,0.10)", border: "1px solid rgba(212,168,89,0.18)" }}
                >
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

        {/* ── 靜心時刻 ── */}
        <AnimatePresence>
          {step === "stillness" && (
            <motion.div
              key="stillness"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              {/* Breathing orb */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(212,168,89,0.5) 0%, transparent 70%)" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "radial-gradient(circle at 35% 35%, rgba(212,168,89,0.3) 0%, rgba(29,18,40,0.8) 100%)", border: "1px solid rgba(212,168,89,0.25)" }}
                >
                  ☽
                </motion.div>
              </div>

              {/* Text */}
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-cream-100/80 text-sm tracking-widest"
                >
                  靜下心，把這個問題放進心裡
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="text-morandi-stone/50 text-xs tracking-wider"
                >
                  月神正在聆聽…
                </motion.p>
              </div>

              {/* Skip */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                onClick={handleSkipStillness}
                className="text-morandi-stone/40 text-xs tracking-widest hover:text-morandi-stone/70 transition-colors"
              >
                略過
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User question bubble — shown only while shaking; once revealed,
            the capture-area block below renders its own copy so the
            question stays inside the screenshot without appearing twice */}
        <AnimatePresence>
          {(step === "stillness" || step === "draw") && (
            <motion.div key="question" {...slideUp}>
              <UserBubble text={question} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tube shake/pop */}
        <AnimatePresence>
          {step === "draw" && (
            <motion.div key="tube" {...slideUp} className="flex justify-center">
              <OmikujiTube
                phase={tubePhase}
                onStartShake={handleStartShake}
                onShakeComplete={handleShakeComplete}
                onPopComplete={handlePopComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revealed poem + interpretation — screenshot capture area */}
        {(step === "revealed" || step === "reading") && current && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div ref={captureRef} className="flex flex-col gap-3">
              <UserBubble text={question} />

              <div className="flex justify-center">
                <OmikujiResultCard
                  entry={current}
                  folding={folding}
                  onFoldComplete={handleFoldComplete}
                />
              </div>

              {/* Ask Tsukino to interpret */}
              {step === "revealed" && (
                <motion.div
                  className="mt-2 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <motion.button
                    onClick={startInterpretation}
                    whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(212,168,89,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 rounded-full border border-morandi-gold/40 bg-morandi-gold/10 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/20 hover:border-morandi-gold/60 transition-colors duration-300"
                  >
                    🔮 請{avatar.displayName}解籤
                  </motion.button>
                </motion.div>
              )}

              {/* The selected persona's interpretation */}
              {step === "reading" && (
                <ChatReading
                  text={interpretation}
                  isStreaming={isStreaming}
                  avatarSrc={avatar.image}
                  avatarAlt={avatar.displayName}
                />
              )}

              {/* Completed follow-up rounds */}
              {followUpRounds.map((round, i) => (
                <Fragment key={`shrine-round-${i}`}>
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

        {/* Follow-up input — shown after interpretation is done */}
        <AnimatePresence>
          {showActionArea && (
            <motion.div
              key="followup-shrine"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <AssistantBlock avatarImage={avatar.image} avatarAlt={avatar.displayName}>
                <p className="text-cream-200/60 text-sm mb-3 leading-relaxed">{avatar.followUpInvite}</p>
                <div className="relative rounded-2xl border border-morandi-gold/20 bg-mystic-purple/20 focus-within:border-morandi-gold/40 transition-colors">
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
                    className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-morandi-gold/20 border border-morandi-gold/30 flex items-center justify-center text-cream-200 disabled:opacity-20 hover:bg-morandi-gold/40 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </div>
              </AssistantBlock>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action row — only after the interpretation has been read */}
        <AnimatePresence>
          {showActionArea && current && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-2 justify-center flex-wrap"
            >
              <motion.button
                onClick={handleShare}
                disabled={isCapturing}
                whileHover={!isCapturing ? { scale: 1.04 } : {}}
                whileTap={!isCapturing ? { scale: 0.96 } : {}}
                className="px-6 py-2.5 rounded-full border border-morandi-lavender/25 text-morandi-stone/70 text-xs tracking-widest hover:border-morandi-lavender/55 hover:text-cream-200 transition-colors duration-300 disabled:opacity-40"
              >
                {isCapturing ? "截圖中..." : "✦ 分享這次抽籤"}
              </motion.button>

              {current.isBadFortune ? (
                <motion.button
                  onClick={handleAccept}
                  disabled={folding}
                  whileHover={!folding ? { scale: 1.04 } : {}}
                  whileTap={!folding ? { scale: 0.96 } : {}}
                  className="px-6 py-2.5 rounded-full border border-morandi-rose/40 text-morandi-rose text-xs tracking-widest hover:bg-morandi-rose/10 transition-all duration-300 disabled:opacity-50"
                >
                  🧎 摺起，掛上結籤架
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleAccept}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-2.5 rounded-full border border-morandi-lavender/40 bg-morandi-mauve/15 text-cream-100 text-xs tracking-widest hover:bg-morandi-mauve/30 transition-all duration-300"
                >
                  🙏 收下這份好運
                </motion.button>
              )}

              <motion.button
                onClick={resetAll}
                disabled={folding}
                whileHover={!folding ? { scale: 1.04 } : {}}
                whileTap={!folding ? { scale: 0.96 } : {}}
                className="px-6 py-2.5 rounded-full border border-morandi-stone/25 text-morandi-stone/55 text-xs tracking-widest hover:border-morandi-stone/45 hover:text-cream-200/80 transition-all duration-300 disabled:opacity-40"
              >
                🔄 重新抽籤
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
