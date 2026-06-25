"use client";

/**
 * TokenDisplay — shows the current 曜刻 balance with an 8-pointed star icon.
 * Listens to the "tsuki:token:change" custom event so it stays in sync
 * with any useTokens() caller on the same page without a shared context.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { readBalance } from "@/lib/tokens/useTokens";

export default function TokenDisplay() {
  const [balance, setBalance] = useState(0);
  const [pulse,   setPulse]   = useState(false);

  const refresh = () => {
    setBalance(readBalance());
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  useEffect(() => {
    setBalance(readBalance());
    window.addEventListener("tsuki:token:change", refresh);
    return () => window.removeEventListener("tsuki:token:change", refresh);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      title={`曜刻：${balance} 枚`}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full select-none"
      style={{
        background: "rgba(212,168,89,0.08)",
        border: "1px solid rgba(212,168,89,0.28)",
      }}
    >
      {/* 8-pointed star (八角星) */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L13.8 8.4H20.5L15.1 12.3L17.1 18.7L12 14.9L6.9 18.7L8.9 12.3L3.5 8.4H10.2Z"
          fill="rgba(212,168,89,0.85)"
        />
        <path
          d="M12 2V22M2 12H22M4.9 4.9L19.1 19.1M19.1 4.9L4.9 19.1"
          stroke="rgba(212,168,89,0.4)"
          strokeWidth="0.8"
        />
        <circle cx="12" cy="12" r="10" stroke="rgba(212,168,89,0.3)" strokeWidth="0.8" />
      </svg>
      <span
        style={{
          color: "rgba(212,168,89,0.9)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.04em",
          minWidth: "1ch",
        }}
      >
        {balance}
      </span>
    </motion.div>
  );
}
