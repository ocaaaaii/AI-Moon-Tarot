"use client";

/**
 * lib/garden/affection.ts
 *
 * Client-side 好感累計系統 for 眾神之語 (Feature 3 of 眾神之庭).
 * localStorage-only (Phase-appropriate — no backend/auth exists yet, same
 * caveat as the rest of the project's localStorage-backed systems).
 *
 * Unit of progress: conversation turns (one user message = one turn).
 * Soft memory: a rolling window of the user's last 3 messages (truncated),
 * injected back into the system prompt next time so the persona can
 * reference "something you said before" without a real backend.
 */

import { useCallback, useEffect, useState } from "react";

export interface SoftMemoryEntry {
  date: string; // YYYY-MM-DD
  summary: string;
}

interface AffectionRecord {
  turns: number;
  softMemory: SoftMemoryEntry[];
}

export interface AffectionLevel {
  index: number;
  label: string;
  /** Lv.2+ unlocks a little more of the persona's private backstory; Lv.3
   * unlocks the warmest register. Purely a prompt-side signal today — no
   * separate unlockable content exists yet. */
  description: string;
}

const LEVELS: { min: number; label: string; description: string }[] = [
  { min: 0, label: "陌生人", description: "初次相遇，還在認識彼此" },
  { min: 5, label: "常客", description: "已經聊過幾次，帶點熟悉感" },
  { min: 15, label: "老朋友", description: "很熟了，可以聊更私人的話題" },
  { min: 30, label: "知己", description: "最深的信任，說話不用設防" },
];

function levelForTurns(turns: number): AffectionLevel {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (turns >= LEVELS[i].min) idx = i;
  }
  return { index: idx, label: LEVELS[idx].label, description: LEVELS[idx].description };
}

function storageKey(personaId: string): string {
  return `gardenAffection_${personaId}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useAffection(personaId: string) {
  const [record, setRecord] = useState<AffectionRecord>({ turns: 0, softMemory: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    try {
      const raw = window.localStorage.getItem(storageKey(personaId));
      if (raw) {
        const parsed = JSON.parse(raw) as AffectionRecord;
        setRecord({ turns: parsed.turns ?? 0, softMemory: parsed.softMemory ?? [] });
      } else {
        setRecord({ turns: 0, softMemory: [] });
      }
    } catch {
      setRecord({ turns: 0, softMemory: [] });
    }
    setReady(true);
  }, [personaId]);

  /** Call once per user message sent. `memorySummary` is a short excerpt of
   * what the user said, kept as the newest of the last 3 soft-memory entries. */
  const recordTurn = useCallback(
    (memorySummary?: string) => {
      setRecord((prev) => {
        const nextMemory = memorySummary
          ? [...prev.softMemory, { date: todayStr(), summary: memorySummary }].slice(-3)
          : prev.softMemory;
        const next: AffectionRecord = { turns: prev.turns + 1, softMemory: nextMemory };
        try {
          window.localStorage.setItem(storageKey(personaId), JSON.stringify(next));
        } catch {
          /* localStorage unavailable — affection just won't persist this session */
        }
        return next;
      });
    },
    [personaId]
  );

  return {
    ready,
    turns: record.turns,
    softMemory: record.softMemory,
    level: levelForTurns(record.turns),
    recordTurn,
  };
}
