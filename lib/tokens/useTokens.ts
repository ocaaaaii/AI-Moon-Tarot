"use client";

import { useCallback, useEffect, useState } from "react";

// ─── localStorage keys (ASCII only to avoid encoding issues) ──────────────────
const KEY_BALANCE    = "tsuki_yokokku_balance";
const KEY_LAST_GRANT = "tsuki_yokokku_last_grant";
const KEY_QUICK_MODE = "tsuki_quick_mode";

export const DAILY_AMOUNT  = 20; // v5 launch: 20 per day
export const COST_PER_USE  = 1;  // 1 曜刻 per divination / draw

function todayStr(): string {
  // YYYY-MM-DD in local time
  return new Date().toLocaleDateString("en-CA");
}

export function readBalance(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(KEY_BALANCE);
  return v !== null ? Math.max(0, parseInt(v, 10)) : 0;
}

/** Dispatch so any TokenDisplay on the page re-reads localStorage. */
export function dispatchTokenChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tsuki:token:change"));
  }
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useTokens() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Grant daily tokens if this is a new day
    const today  = todayStr();
    const last   = localStorage.getItem(KEY_LAST_GRANT) ?? "";
    let current  = readBalance();

    if (last !== today) {
      current += DAILY_AMOUNT;
      localStorage.setItem(KEY_BALANCE,    String(current));
      localStorage.setItem(KEY_LAST_GRANT, today);
      dispatchTokenChange();
    }
    setBalance(current);
  }, []);

  /** Attempt to spend `amount` tokens. Returns false if insufficient. */
  const spend = useCallback((amount: number = COST_PER_USE): boolean => {
    const current = readBalance();
    if (current < amount) return false;
    const next = current - amount;
    localStorage.setItem(KEY_BALANCE, String(next));
    setBalance(next);
    dispatchTokenChange();
    return true;
  }, []);

  /** Non-mutating affordability check. */
  const canAfford = useCallback((amount: number = COST_PER_USE): boolean => {
    return readBalance() >= amount;
  }, []);

  return { balance, spend, canAfford };
}

// ─── Quick-mode preference ────────────────────────────────────────────────────

export function useQuickMode() {
  const [quickMode, setQuickMode] = useState(false);

  useEffect(() => {
    setQuickMode(localStorage.getItem(KEY_QUICK_MODE) === "true");
  }, []);

  const toggleQuickMode = () => {
    setQuickMode((v) => {
      const next = !v;
      localStorage.setItem(KEY_QUICK_MODE, String(next));
      return next;
    });
  };

  return { quickMode, toggleQuickMode };
}
