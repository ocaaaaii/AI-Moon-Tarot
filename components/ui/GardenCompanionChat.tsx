"use client";

/**
 * GardenCompanionChat — 眾神之語 (Feature 3 of 眾神之庭)
 *
 * Plain back-and-forth chat with one persona in their 領地, distinct from
 * the divination flow (ChatInterface): no cards, no rituals, just talking.
 * Affection (turn count + soft memory) persists via useAffection/localStorage;
 * the conversation itself resets each visit (only the relationship persists).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { OmikujiAvatar } from "@/lib/omikuji/avatars";
import type { CompanionMeta } from "@/lib/garden/companionPersonas";
import { useAffection } from "@/lib/garden/affection";

const ACCENT_HEX: Record<string, string> = {
  lavender: "#b8a8c8",
  gold: "#d4a859",
  slate: "#8a96a8",
  rose: "#c9a8a0",
  sage: "#a0b0a0",
  mauve: "#b0a0b8",
  stone: "#a89880",
};

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

function truncate(s: string, n: number): string {
  const trimmed = s.trim();
  return trimmed.length > n ? trimmed.slice(0, n) + "…" : trimmed;
}

export default function GardenCompanionChat({
  avatar,
  meta,
}: {
  avatar: OmikujiAvatar;
  meta: CompanionMeta;
}) {
  const accentHex = ACCENT_HEX[avatar.accent] ?? "#b8a8c8";
  const { ready, turns, softMemory, level, recordTurn } = useAffection(meta.id);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Seed the opening greeting once affection state has loaded
  useEffect(() => {
    if (ready && messages.length === 0) {
      setMessages([{ role: "assistant", content: meta.openingLine }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const nextMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    recordTurn(truncate(text, 40));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/garden/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: meta.id,
          messages: nextMessages,
          levelIndex: level.index,
          softMemory,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "（連線發生問題，請重新整理頁面再試一次。）" };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break outer;
          try {
            const p = JSON.parse(payload) as { chunk?: string; error?: string };
            if (p.error) break outer;
            if (p.chunk) {
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: copy[copy.length - 1].content + p.chunk,
                };
                return copy;
              });
            }
          } catch {
            /* skip malformed line */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "（讀取中斷，請重新整理再試。）" };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, meta.id, level.index, softMemory, recordTurn]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse 100% 80% at 50% 0%, ${hexToRgba(accentHex, 0.14)} 0%, #0a0714 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px 24px",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 640, paddingTop: 28 }}>
        <Link
          href="/garden/companion"
          style={{ color: "rgba(184,168,200,0.5)", fontSize: 13, letterSpacing: "0.08em", textDecoration: "none" }}
        >
          ← 眾神之語
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, marginBottom: 6 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${accentHex}`,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image src={avatar.image} alt={avatar.displayName} fill className="object-cover object-top" sizes="52px" />
          </div>
          <div>
            <p style={{ color: "rgba(245,238,220,0.95)", fontSize: 18, fontWeight: 600, letterSpacing: "0.03em" }}>
              {avatar.displayName}
            </p>
            <p style={{ color: "rgba(180,165,200,0.55)", fontSize: 12.5, letterSpacing: "0.05em" }}>
              {meta.locationName} · {meta.mood}
            </p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 20,
                border: `1px solid ${hexToRgba(accentHex, 0.4)}`,
                color: accentHex,
                letterSpacing: "0.06em",
              }}
            >
              {level.label}
            </span>
            <p style={{ color: "rgba(180,165,200,0.35)", fontSize: 10.5, marginTop: 4 }}>已聊 {turns} 次</p>
          </div>
        </div>
        <p style={{ color: "rgba(180,165,200,0.4)", fontSize: 12, marginBottom: 4 }}>{meta.sceneDescription}</p>
      </div>

      {/* Message list */}
      <div style={{ width: "100%", maxWidth: 640, flex: 1, paddingTop: 18, paddingBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    borderRadius: 16,
                    borderTopLeftRadius: m.role === "assistant" ? 4 : 16,
                    borderTopRightRadius: m.role === "user" ? 4 : 16,
                    padding: "10px 14px",
                    background:
                      m.role === "user" ? "rgba(255,255,255,0.08)" : hexToRgba(accentHex, 0.1),
                    border: `1px solid ${m.role === "user" ? "rgba(255,255,255,0.1)" : hexToRgba(accentHex, 0.22)}`,
                  }}
                >
                  <p style={{ color: "rgba(238,230,215,0.92)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {m.content}
                    {isStreaming && i === messages.length - 1 && m.role === "assistant" && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
                        style={{ marginLeft: 2, color: accentHex }}
                      >
                        ▋
                      </motion.span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ width: "100%", maxWidth: 640, position: "sticky", bottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            borderRadius: 20,
            border: `1px solid ${hexToRgba(accentHex, 0.25)}`,
            background: "rgba(18,12,32,0.85)",
            backdropFilter: "blur(16px)",
            padding: "8px 10px 8px 16px",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={meta.inputPlaceholder}
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "rgba(238,230,215,0.92)",
              fontSize: 14,
              lineHeight: 1.6,
              maxHeight: 96,
              padding: "6px 0",
            }}
          />
          <button
            onClick={send}
            disabled={isStreaming || !input.trim()}
            style={{
              flexShrink: 0,
              borderRadius: 999,
              border: "none",
              padding: "8px 18px",
              background: isStreaming || !input.trim() ? "rgba(255,255,255,0.06)" : accentHex,
              color: isStreaming || !input.trim() ? "rgba(200,190,220,0.4)" : "#1a1228",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: isStreaming || !input.trim() ? "default" : "pointer",
              transition: "background 0.2s",
            }}
          >
            傳送
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
