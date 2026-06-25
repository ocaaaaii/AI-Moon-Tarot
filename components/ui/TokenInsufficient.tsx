"use client";

/**
 * TokenInsufficient — soft-gate modal shown when the user has 0 曜刻.
 * Never hard-blocks; always gives an exit ("明日再來").
 */

import { motion, AnimatePresence } from "motion/react";
import { DAILY_AMOUNT } from "@/lib/tokens/useTokens";

interface TokenInsufficientProps {
  open: boolean;
  onClose: () => void;
}

function nextRefreshLabel(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const h = tomorrow.getHours().toString().padStart(2, "0");
  const m = tomorrow.getMinutes().toString().padStart(2, "0");
  // Always midnight
  return `明日 00:00 補充 ${DAILY_AMOUNT} 枚`;
}

export default function TokenInsufficient({ open, onClose }: TokenInsufficientProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="insufficient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(8,5,16,0.78)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-5 rounded-3xl p-8 max-w-xs w-full text-center"
            style={{
              background: "rgba(18,12,30,0.95)",
              border: "1px solid rgba(212,168,89,0.2)",
              boxShadow: "0 0 60px rgba(212,168,89,0.06), 0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(212,168,89,0.06)", border: "1px solid rgba(212,168,89,0.2)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.8 8.4H20.5L15.1 12.3L17.1 18.7L12 14.9L6.9 18.7L8.9 12.3L3.5 8.4H10.2Z"
                  fill="rgba(212,168,89,0.35)"
                />
                <path
                  d="M12 2V22M2 12H22M4.9 4.9L19.1 19.1M19.1 4.9L4.9 19.1"
                  stroke="rgba(212,168,89,0.2)"
                  strokeWidth="0.8"
                />
                <circle cx="12" cy="12" r="10" stroke="rgba(212,168,89,0.25)" strokeWidth="0.8" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: "rgba(240,225,190,0.9)" }}
              >
                月神輕聲嘆息……
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(166,153,130,0.7)" }}
              >
                你的曜刻已燃盡。<br />
                星芒需要時間重新凝聚。
              </p>
              <p
                className="text-[11px] mt-1"
                style={{
                  color: "rgba(212,168,89,0.55)",
                  background: "rgba(212,168,89,0.06)",
                  border: "1px solid rgba(212,168,89,0.15)",
                  borderRadius: 8,
                  padding: "6px 12px",
                }}
              >
                {nextRefreshLabel()}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={onClose}
              className="w-full rounded-xl py-3 text-sm tracking-widest transition-all duration-200"
              style={{
                color: "rgba(212,168,89,0.8)",
                border: "1px solid rgba(212,168,89,0.25)",
                background: "rgba(212,168,89,0.06)",
              }}
            >
              明日再來
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
