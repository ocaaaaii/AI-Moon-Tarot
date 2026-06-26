"use client";

/**
 * UserGuide — Spotlight 聚焦式使用教學
 *
 * DOM 元素存在時：高亮實際元素（box-shadow hole 技法）+ 旁邊浮動 tooltip
 * 其餘步驟：中央 zoom-in 卡片（scale 0.75 → 1）
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SpotlightStep {
  selector?: string;      // CSS selector for DOM spotlight
  padding?: number;       // padding around element (default 14)
  tooltipSide?: "top" | "bottom";
  title: string;
  description: string;
  tip?: string;
  icon: string;
  glowColor: string;      // rgba(...) string
}

function a(rgba: string, alpha: number): string {
  return rgba.replace(/[\d.]+\)$/, `${alpha})`);
}

const STEPS: SpotlightStep[] = [
  {
    icon: "🌙",
    glowColor: "rgba(184,168,200,0.7)",
    title: "歡迎來到月之神社",
    description:
      "這裡有四扇門：塔羅店鋪、月神神社、眾神之庭、月神天啟。每扇門都有七位個性截然不同的靈魂在等你。\n\n封測期間，所有功能完全免費開放，歡迎深入體驗！",
    tip: "封測截止：2026 年 7 月 3 日 · 填完問卷送 CA 一份愛 🙏",
  },
  {
    selector: 'a[href="/tarot"]',
    padding: 14,
    tooltipSide: "bottom",
    icon: "🔮",
    glowColor: "rgba(184,168,200,0.85)",
    title: "月之塔羅店鋪",
    description:
      "選一位塔羅師，輸入問題，翻牌啟動解讀。支援單張牌、天地人三張、七脈輪七張三種牌陣。",
    tip: "解讀後有追問框，可以繼續聊——不消耗曜刻",
  },
  {
    selector: 'a[href="/shrine"]',
    padding: 14,
    tooltipSide: "bottom",
    icon: "⛩️",
    glowColor: "rgba(212,168,89,0.85)",
    title: "月神神社",
    description:
      "抽出你的籤詩，七位解籤師給出個人化解讀。選好角色後可進「聖域」——每人有獨特的小儀式。",
    tip: "抽到凶籤？解籤師會邀你把它掛上結籤架，讓月神保管。解讀後有追問框，可以繼續聊——不消耗曜刻",
  },
  {
    selector: 'a[href="/garden"]',
    padding: 14,
    tooltipSide: "bottom",
    icon: "🌌",
    glowColor: "rgba(120,80,220,0.85)",
    title: "眾神之庭 · 週神諭",
    description:
      "每週三位神明輪流主持 Pick-a-Card 神諭占卜。選一個主題，翻開一疊牌，聽聽宇宙這週想對你說什麼。\n\n同一週選同一個主題的人，翻到的牌完全相同——這就是集體潛意識的共鳴。",
    tip: "進入主題消耗 1 曜刻 · 星座週運勢即將上線",
  },
  {
    selector: 'a[href="/stories"]',
    padding: 14,
    tooltipSide: "top",
    icon: "📖",
    glowColor: "rgba(168,120,230,0.85)",
    title: "月神天啟 · 角色故事",
    description:
      "七位靈魂的日常生活 CG 故事。點擊畫面左右三分之一或按方向鍵切換，光影色調跟著情緒流動。",
    tip: "觀看故事免費，不消耗曜刻",
  },
  {
    selector: 'button[aria-label="曜刻說明"]',
    padding: 16,
    tooltipSide: "bottom",
    icon: "✶",
    glowColor: "rgba(212,168,89,0.9)",
    title: "曜刻 · 時間貨幣",
    description:
      "每天 00:00 自動補充 +20 曜刻。塔羅占卜 / 神社抽籤 / 週神諭 Pick-a-Card 各 −1 曜刻。追問聊天、聖域儀式、觀看故事全部免費。",
    tip: "未用完自動累積 · 封測期間額度充足",
  },
  {
    icon: "📝",
    glowColor: "rgba(200,155,160,0.7)",
    title: "你的封測任務",
    description:
      "✦ 在塔羅店鋪占卜，試試追問功能\n✦ 在神社抽一支籤，探索一個聖域\n✦ 在眾神之庭翻開本週的 Pick-a-Card\n✦ 翻看月神天啟的任意一個故事\n✦ 完成後點右下角 CA 的頭像填問卷",
    tip: "每份回饋，CA 都認真讀 ✨",
  },
];

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UserGuideProps {
  onClose: () => void;
}

// ─── Sub-component: tooltip / center card content ───────────────────────────

function StepCard({
  step,
  index,
  total,
  isLast,
  onPrev,
  onNext,
  onClose,
  compact = false,
}: {
  step: SpotlightStep;
  index: number;
  total: number;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  compact?: boolean;
}) {
  const g = step.glowColor;
  return (
    <div
      className={`rounded-2xl overflow-hidden select-none w-full ${compact ? "max-w-[300px]" : "max-w-[340px]"}`}
      style={{
        background: "rgba(8,5,18,0.97)",
        border: `1px solid ${a(g, 0.28)}`,
        boxShadow: `0 0 0 1px ${a(g, 0.12)}, 0 24px 64px rgba(0,0,0,0.75)`,
      }}
    >
      {/* Top glow bar */}
      <div
        className="h-[3px]"
        style={{
          background: `linear-gradient(to right, transparent, ${a(g, 0.7)}, transparent)`,
        }}
      />

      <div className="px-5 py-4 flex flex-col gap-3.5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: a(g, 0.08),
              border: `1px solid ${a(g, 0.3)}`,
              boxShadow: `0 0 18px ${a(g, 0.35)}`,
            }}
          >
            {step.icon}
          </div>
          <div className="min-w-0">
            <p
              className="text-[9px] tracking-[0.28em] uppercase mb-0.5"
              style={{ color: a(g, 0.5) }}
            >
              {index + 1} / {total}
            </p>
            <h3 className="text-cream-100 text-[13.5px] font-medium leading-snug">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-cream-200/68 text-[12px] leading-relaxed whitespace-pre-line">
          {step.description}
        </p>

        {/* Tip */}
        {step.tip && (
          <div
            className="rounded-lg px-3 py-2"
            style={{
              background: a(g, 0.07),
              border: `1px solid ${a(g, 0.22)}`,
            }}
          >
            <p className="text-cream-200/58 text-[11px] leading-relaxed">
              <span style={{ color: a(g, 0.88) }} className="mr-1">
                ✦
              </span>
              {step.tip}
            </p>
          </div>
        )}

        {/* Dots + navigation */}
        <div className="flex items-center justify-between pt-0.5">
          {/* Step dots */}
          <div className="flex items-center gap-[5px]">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 14 : 4,
                  height: 4,
                  background:
                    i === index ? a(g, 0.85) : "rgba(255,255,255,0.13)",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="w-7 h-7 rounded-full border border-cream-200/15 text-cream-200/40 text-xs flex items-center justify-center hover:border-cream-200/35 hover:text-cream-200/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              ←
            </button>
            {isLast ? (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full text-[11px] tracking-widest text-cream-100 transition-colors duration-300"
                style={{
                  border: `1px solid ${a(g, 0.55)}`,
                  background: a(g, 0.12),
                }}
              >
                開始探索 ✦
              </button>
            ) : (
              <button
                onClick={onNext}
                className="w-7 h-7 rounded-full border border-cream-200/20 text-cream-200/55 text-xs flex items-center justify-center hover:border-cream-200/40 hover:text-cream-100 transition-colors"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function UserGuide({ onClose }: UserGuideProps) {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<HighlightBox | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const next = useCallback(() => setIndex((i) => Math.min(STEPS.length - 1, i + 1)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev, onClose]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Compute highlight box from DOM element
  useEffect(() => {
    if (!step.selector) { setBox(null); return; }
    const measure = () => {
      const el = document.querySelector(step.selector!);
      if (!el) { setBox(null); return; }
      const pad = step.padding ?? 14;
      const r = el.getBoundingClientRect();
      setBox({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [index, step.selector, step.padding]);

  const useDOMSpotlight = !!box && !isMobile;

  // Tooltip position relative to highlight box
  const tooltipStyle = (): React.CSSProperties => {
    if (!box) return {};
    const TW = 300;
    const GAP = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = box.left + box.width / 2 - TW / 2;
    left = Math.max(12, Math.min(left, vw - TW - 12));
    let top: number;
    if (step.tooltipSide === "top") {
      top = box.top - GAP - 220;
    } else {
      top = box.top + box.height + GAP;
    }
    top = Math.max(12, Math.min(top, vh - 280));
    return { position: "fixed", top, left, zIndex: 62, width: TW };
  };

  const g = step.glowColor;

  return (
    <>
      {/* ── Click interceptor / dark backdrop ── */}
      <motion.div
        className="fixed inset-0"
        style={{ zIndex: 49, background: useDOMSpotlight ? "transparent" : "rgba(6,4,12,0.88)", backdropFilter: useDOMSpotlight ? "none" : "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={useDOMSpotlight ? undefined : (e) => { if (e.target === e.currentTarget) onClose(); }}
      />

      {/* ── DOM spotlight highlight box ── */}
      <AnimatePresence>
        {useDOMSpotlight && box && (
          <motion.div
            key="spotlight-box"
            className="fixed pointer-events-none"
            style={{ zIndex: 50, borderRadius: 20 }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              boxShadow: `0 0 0 9999px rgba(6,4,12,0.86), 0 0 0 2px ${a(g, 0.75)}, 0 0 40px ${a(g, 0.55)}, 0 0 80px ${a(g, 0.25)}`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* ── Tooltip (DOM spotlight mode) ── */}
      <AnimatePresence mode="wait">
        {useDOMSpotlight && (
          <motion.div
            key={`tooltip-${index}`}
            style={tooltipStyle()}
            initial={{ opacity: 0, y: step.tooltipSide === "top" ? 8 : -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <StepCard
              step={step}
              index={index}
              total={STEPS.length}
              isLast={isLast}
              onPrev={prev}
              onNext={next}
              onClose={onClose}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Center zoom-in card (no selector / mobile) ── */}
      <AnimatePresence mode="wait">
        {!useDOMSpotlight && (
          <motion.div
            key={`card-${index}`}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 55, pointerEvents: "none" }}
          >
            <motion.div
              style={{ pointerEvents: "auto" }}
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.80 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Ambient glow behind card */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${a(g, 0.15)}, transparent)`,
                  filter: "blur(24px)",
                  transform: "scale(1.5)",
                }}
              />
              <StepCard
                step={step}
                index={index}
                total={STEPS.length}
                isLast={isLast}
                onPrev={prev}
                onNext={next}
                onClose={onClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Close button ── */}
      <motion.div
        className="fixed top-4 right-4"
        style={{ zIndex: 70 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-full border border-cream-200/20 bg-black/50 text-cream-200/80 hover:text-cream-100 hover:border-cream-200/40 text-xs tracking-widest transition-colors duration-200"
          >
            ✕ 關閉教學
          </button>
      </motion.div>
    </>
  );
}
