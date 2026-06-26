"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface QuestionRefineProps {
  avatarImage: string;
  avatarName: string;
  originalQuestion: string;
  issueLabel: string;
  suggestions: string[];
  onSelect: (question: string) => void;
  onSkip: () => void;
}

export default function QuestionRefine({
  avatarImage,
  avatarName,
  originalQuestion,
  issueLabel,
  suggestions,
  onSelect,
  onSkip,
}: QuestionRefineProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState(originalQuestion);
  const [selected, setSelected] = useState<number | null>(null);

  const handlePick = (text: string, idx: number) => {
    setSelected(idx);
    setTimeout(() => onSelect(text), 260);
  };

  const handleCustomSubmit = () => {
    const t = customText.trim();
    if (t.length > 1) onSelect(t);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
          style={{ border: "1px solid rgba(184,168,200,0.5)", boxShadow: "0 0 18px rgba(184,168,200,0.3)" }}
        >
          <Image src={avatarImage} alt={avatarName} fill className="object-cover object-top" sizes="40px" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-cream-200 text-sm leading-relaxed font-medium">
            在抽牌之前，讓我幫你把這個問題說得更準確一點。
          </p>
          <p className="text-morandi-stone/65 text-xs leading-relaxed">
            問題越具體，牌就越能直擊你的狀況。
          </p>
          {issueLabel && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-3 py-1 w-fit"
              style={{ color: "rgba(184,168,200,0.9)", background: "rgba(184,168,200,0.12)", border: "1px solid rgba(184,168,200,0.3)" }}
            >
              ✶ {issueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Original question */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-morandi-stone/50 text-[10px] mb-1.5 tracking-[0.12em] uppercase">你問的是</p>
        <p className="text-cream-200/55 text-sm leading-relaxed italic">「{originalQuestion}」</p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-2.5">
        <p className="text-morandi-stone/70 text-xs tracking-widest">試試這樣問：</p>
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => handlePick(s, i)}
            initial={{ opacity: 0, x: -8 }}
            animate={selected === i ? { opacity: 0.4, scale: 0.97 } : { opacity: 1, x: 0 }}
            transition={{ delay: selected === i ? 0 : i * 0.09 + 0.15, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.975 }}
            className="text-left rounded-2xl px-5 py-4 transition-colors duration-200 group"
            style={{
              background: "linear-gradient(135deg, rgba(184,168,200,0.12) 0%, rgba(120,100,150,0.08) 100%)",
              border: "1px solid rgba(184,168,200,0.28)",
              boxShadow: "0 2px 12px rgba(120,100,150,0.08)",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="text-sm mt-0.5 flex-shrink-0 transition-colors duration-200"
                style={{ color: "rgba(184,168,200,0.65)" }}
              >
                ✶
              </span>
              <p className="text-cream-200/90 text-sm leading-relaxed group-hover:text-cream-200 transition-colors duration-200">
                {s}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Custom edit / skip */}
      <AnimatePresence mode="wait">
        {customMode ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2.5 overflow-hidden"
          >
            <textarea
              autoFocus
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              placeholder="用自己的方式說出你想問的..."
              className="w-full resize-none rounded-xl px-4 py-3 text-sm text-cream-200/90 placeholder:text-morandi-stone/35 focus:outline-none transition-colors"
              style={{ background: "rgba(60,40,80,0.5)", border: "1px solid rgba(184,168,200,0.35)" }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCustomSubmit}
                className="flex-1 rounded-xl py-3 text-sm font-medium transition-all duration-200"
                style={{
                  color: "rgba(235,225,245,0.95)",
                  background: "linear-gradient(135deg, rgba(184,168,200,0.25) 0%, rgba(140,120,170,0.2) 100%)",
                  border: "1px solid rgba(184,168,200,0.45)",
                }}
              >
                用這個問題抽牌
              </button>
              <button
                onClick={() => setCustomMode(false)}
                className="rounded-xl px-4 py-3 text-sm transition-colors duration-200"
                style={{ color: "rgba(160,148,175,0.55)", border: "1px solid rgba(184,168,200,0.2)" }}
              >
                取消
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 pt-1"
          >
            <button
              onClick={() => setCustomMode(true)}
              className="flex-1 rounded-xl py-3 text-sm transition-all duration-200 hover:bg-white/5"
              style={{ color: "rgba(220,210,235,0.8)", border: "1px solid rgba(184,168,200,0.32)" }}
            >
              自己改
            </button>
            <button
              onClick={onSkip}
              className="flex-1 rounded-xl py-3 text-sm transition-all duration-200 hover:bg-white/3"
              style={{ color: "rgba(160,148,175,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              保留原本的問題 →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
