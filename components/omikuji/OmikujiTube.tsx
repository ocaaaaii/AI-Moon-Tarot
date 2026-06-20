"use client";

/**
 * OmikujiTube — 籤筒
 * The shake-the-tube ritual that precedes every draw.
 *
 * Phases (controlled by the parent ShrineDraw state machine):
 *   idle    → waiting for the user to tap "搖籤筒" — sticks stay fully
 *             hidden inside the tube, nothing pokes out
 *   shaking → a slow, clearly-staged two-beat shake: up-and-down, then
 *             left-and-right (not one chaotic blur of motion)
 *   popping → a brisk tip to horizontal ("反過來") and, once tipped,
 *             one stick slides out of the opening and falls away
 *             ("倒出來一支籤"), before the tube rights itself
 *
 * Each stage is timed explicitly (see the *_MS constants below) and phase
 * transitions are driven by setTimeout rather than onAnimationComplete —
 * with several CSS properties animating together on staggered delays,
 * relying on the animation-complete callback would fire more than once
 * per stage, so a single timer keyed to the total stage duration is used
 * instead to guarantee onShakeComplete / onPopComplete fire exactly once.
 */

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

interface OmikujiTubeProps {
  phase: "idle" | "shaking" | "popping";
  onStartShake: () => void;
  onShakeComplete: () => void;
  onPopComplete: () => void;
}

// ── Shake stage timing — 上下搖 then 左右搖, back to back ──────────────────
const UPDOWN_S = 1.05;
const LEFTRIGHT_S = 1.05;
const SHAKE_TOTAL_MS = (UPDOWN_S + LEFTRIGHT_S) * 1000;

// ── Pop stage timing — 反過來 (flip) then 倒出來一支籤 (pour) ───────────────
// FLIP_S is how long it takes the tube to tip to horizontal (not a full
// inversion — that read as too strange); POUR_S is how long the stick
// takes to slide out and fall once it's tipped. Kept brisk per feedback.
const FLIP_S = 0.65;
const POUR_S = 0.85;
const POP_TOTAL_S = FLIP_S + POUR_S;
const POP_TOTAL_MS = POP_TOTAL_S * 1000;

export default function OmikujiTube({
  phase,
  onStartShake,
  onShakeComplete,
  onPopComplete,
}: OmikujiTubeProps) {
  const isShaking = phase === "shaking";
  const isPopping = phase === "popping";
  const isIdle = phase === "idle";

  useEffect(() => {
    if (phase !== "shaking") return;
    const t = window.setTimeout(onShakeComplete, SHAKE_TOTAL_MS);
    return () => window.clearTimeout(t);
  }, [phase, onShakeComplete]);

  useEffect(() => {
    if (phase !== "popping") return;
    const t = window.setTimeout(onPopComplete, POP_TOTAL_MS);
    return () => window.clearTimeout(t);
  }, [phase, onPopComplete]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ambient halo — separate from the tube image's own baked-in glow,
          breathes gently at rest and flares while shaking */}
      <motion.div
        className="relative w-32 h-52 flex items-start justify-center overflow-visible"
        animate={isShaking ? { y: [0, -2, 1, -3, 2, -1, 0] } : { y: 0 }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,168,89,0.35) 0%, rgba(212,168,89,0.12) 45%, transparent 72%)",
          }}
          animate={
            isIdle
              ? { opacity: [0.5, 0.85, 0.5], scale: [0.96, 1.04, 0.96] }
              : isShaking
                ? { opacity: [0.6, 1, 0.6, 1, 0.6], scale: [1, 1.08, 1, 1.08, 1] }
                : { opacity: [0.9, 1, 0.7], scale: [1.1, 1.2, 1] }
          }
          transition={
            isIdle
              ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
              : isShaking
                ? { duration: SHAKE_TOTAL_MS / 1000, ease: "easeInOut" }
                : { duration: POP_TOTAL_S, ease: "easeInOut" }
          }
        />

        <motion.div
          className="relative w-full h-full"
          style={{
            transformOrigin: "50% 88%",
            filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.5))",
          }}
          animate={
            isShaking
              ? {
                  // Stage 1 — 上下搖 (plays during the first UPDOWN_S)
                  y: [0, -18, 7, -18, 7, -9, 0],
                  // Stage 2 — 左右搖 (starts only after UPDOWN_S has elapsed)
                  x: [0, -20, 17, -20, 17, -8, 0],
                  rotate: [0, -6, 5, -6, 5, -2, 0],
                }
              : isPopping
                ? {
                    // Stage 3 — 反過來: a brisk tip to horizontal (not a
                    // full inversion — that read as too strange). Stage 4
                    // holds that tipped position (tiny settle wobble)
                    // while the stick pours out, then rights itself.
                    rotate: [0, -90, -82, 0],
                    x: [0, -5, -3, 0],
                  }
                : { rotate: [0, -1.5, 0, 1.5, 0], x: 0, y: 0, scale: 1 }
          }
          transition={
            isShaking
              ? {
                  y: { duration: UPDOWN_S, ease: "easeInOut" },
                  x: { duration: LEFTRIGHT_S, delay: UPDOWN_S, ease: "easeInOut" },
                  rotate: { duration: LEFTRIGHT_S, delay: UPDOWN_S, ease: "easeInOut" },
                }
              : isPopping
                ? {
                    duration: POP_TOTAL_S,
                    ease: [0.45, 0, 0.4, 1],
                    times: [0, FLIP_S / POP_TOTAL_S, 0.78, 1],
                  }
                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* The sticks live entirely inside the tube — nothing renders
              here while idle or shaking, by design. They only ever
              appear during the pour, below. */}

          <Image
            src="/assets/籤筒-去背.png"
            alt="籤筒"
            fill
            className="object-contain select-none pointer-events-none"
            sizes="128px"
            priority
          />

          {/* the one stick that pours out of the opening once the tube
              has finished tipping over — starts only after FLIP_S has
              elapsed, so it visibly waits for the "反過來" beat to land */}
          {isPopping && (
            <motion.span
              className="absolute w-[4px] h-11 rounded-full bg-cream-100"
              style={{
                top: "8%",
                left: "50%",
                boxShadow: "0 0 10px rgba(255,250,230,0.8)",
                transformOrigin: "top center",
              }}
              initial={{ x: "-50%", y: 0, rotate: 0, opacity: 0 }}
              animate={{
                x: ["-50%", "-32%", "8%", "65%"],
                y: [0, 5, 28, 80],
                rotate: [0, 10, 42, 90],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: POUR_S,
                delay: FLIP_S,
                times: [0, 0.3, 0.62, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )}
        </motion.div>
      </motion.div>

      <motion.button
        onClick={onStartShake}
        disabled={phase !== "idle"}
        whileHover={isIdle ? { scale: 1.04, boxShadow: "0 0 20px rgba(184,168,200,0.2)" } : {}}
        whileTap={isIdle ? { scale: 0.96 } : {}}
        className="px-7 py-2 rounded-full border border-morandi-lavender/50 bg-morandi-mauve/20 text-cream-100 text-sm tracking-widest hover:bg-morandi-mauve/35 transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait"
      >
        {phase === "idle" ? "🙏 搖籤筒" : phase === "shaking" ? "搖晃中…" : "籤已出"}
      </motion.button>
    </div>
  );
}
