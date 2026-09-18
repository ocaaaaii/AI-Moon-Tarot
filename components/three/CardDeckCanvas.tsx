"use client";

/**
 * CardDeckCanvas — R3F Canvas wrapper for the 3D tarot card spread.
 *
 * You pan the row by dragging the cards themselves. That replaced a scrubber
 * bar under the canvas, which had three problems on a phone:
 *
 *   · it mapped the finger's ABSOLUTE x to a position in the row, so a tap
 *     teleported you and a 5px wobble jumped a whole card — the track was
 *     ~378px standing in for 78 cards, about 0.2 cards per pixel;
 *   · a hidden native-scroll proxy underneath was supposed to supply
 *     momentum, but the visible track called `setPointerCapture`, and pointer
 *     events cover touch too, so the proxy never saw a finger;
 *   · nothing set `touch-action`, so dragging sideways also scrolled the page
 *     up and down — the "screen won't stay still" complaint.
 *
 * `touch-action: pan-y` is the fix for the last one: horizontal is ours,
 * vertical still belongs to the page, so a visitor can scroll past the deck
 * by swiping up as usual.
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import type { CardRequest } from "@/lib/tarot/types";
import CardFanScene, { SPREAD_COUNT, SPACING } from "./CardFanScene";

interface CardDeckCanvasProps {
  /** how many cards to draw — comes from the spread's `positions.length`,
   *  so it is no longer a fixed set of sizes */
  spreadCount: number;
  onComplete: (cards: CardRequest[]) => void;
  /** Position labels for the spread (e.g. ["過去","現在","未來"]) */
  spreadPositions?: string[];
  /** When set, only cards in this set are shown (天地人 category mode) */
  allowedIds?: ReadonlySet<number>;
}

/** capped in px so a tall desktop window doesn't give the deck the whole page */
const CANVAS_HEIGHT = "min(46svh, 400px)";
const VISIBLE_WORLD_WIDTH = 3.6;

/** movement past this many px means "browsing", not "picking this card" */
const DRAG_THRESHOLD = 10;
/** per-frame velocity decay while coasting */
const FRICTION = 0.94;
/** below this (world units per ms) the glide has effectively stopped */
const MIN_VELOCITY = 0.00004;

export default function CardDeckCanvas({ spreadCount, onComplete, spreadPositions, allowedIds }: CardDeckCanvasProps) {
  const actualCardCount   = allowedIds?.size ?? SPREAD_COUNT;
  const TOTAL_WORLD_WIDTH = actualCardCount * SPACING;
  const MAX_PAN           = Math.max(0, (TOTAL_WORLD_WIDTH - VISIBLE_WORLD_WIDTH) / 2);

  const [panX,       setPanX]       = useState(MAX_PAN);
  const [drawnCount, setDrawnCount] = useState(0);

  const stageRef   = useRef<HTMLDivElement>(null);
  const panRef     = useRef(MAX_PAN);
  const dragging   = useRef(false);
  const dragged    = useRef(false);
  const startX     = useRef(0);
  const startPan   = useRef(MAX_PAN);
  const velocity   = useRef(0);
  const lastX      = useRef(0);
  const lastT      = useRef(0);
  const glideRef   = useRef<number | null>(null);
  const captured   = useRef(false);

  const clamp = useCallback((v: number) => Math.max(-MAX_PAN, Math.min(MAX_PAN, v)), [MAX_PAN]);

  const applyPan = useCallback((v: number) => {
    const next = clamp(v);
    panRef.current = next;
    setPanX(next);
    return next;
  }, [clamp]);

  /** screen px → world units, using the stage's actual rendered width */
  const worldPerPx = useCallback(() => {
    const w = stageRef.current?.clientWidth ?? 1;
    return VISIBLE_WORLD_WIDTH / w;
  }, []);

  const stopGlide = useCallback(() => {
    if (glideRef.current !== null) {
      cancelAnimationFrame(glideRef.current);
      glideRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    stopGlide();
    // NOTE: deliberately no setPointerCapture here — see onPointerMove.
    dragging.current = true;
    dragged.current  = false;
    startX.current   = e.clientX;
    startPan.current = panRef.current;
    lastX.current    = e.clientX;
    lastT.current    = performance.now();
    velocity.current = 0;
  }, [stopGlide]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;

    // Set the moment the threshold is crossed, which is always BEFORE the
    // pointerup that R3F synthesises its click from — so the ordering of the
    // two listeners never matters.
    //
    // Capturing happens HERE and not on pointerdown. Pointer capture
    // retargets every later event for that pointer to the capturing element,
    // so capturing on pointerdown sent the pointerup to this div instead of
    // to the <canvas> underneath — R3F never saw it, never synthesised its
    // click, and tapping a card did nothing at all. Capture only once the
    // gesture is definitely a drag: a plain click is then never captured and
    // reaches the canvas untouched.
    if (!dragged.current && Math.abs(dx) > DRAG_THRESHOLD) {
      dragged.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
        captured.current = true;
      } catch {
        /* keep dragging without capture — it only helps past the edge */
      }
    }

    applyPan(startPan.current + dx * worldPerPx());

    const now = performance.now();
    const dt  = now - lastT.current;
    if (dt > 0) velocity.current = ((e.clientX - lastX.current) * worldPerPx()) / dt;
    lastX.current = e.clientX;
    lastT.current = now;
  }, [applyPan, worldPerPx]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (captured.current) {
      captured.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released implicitly */
      }
    }
    if (!dragged.current) return;

    let v = velocity.current;
    let prev = performance.now();
    const step = () => {
      const now = performance.now();
      const dt  = now - prev;
      prev = now;
      v *= Math.pow(FRICTION, dt / 16);
      const landed = applyPan(panRef.current + v * dt);
      // stop at the ends rather than grinding against them
      const atEdge = landed <= -MAX_PAN || landed >= MAX_PAN;
      if (Math.abs(v) < MIN_VELOCITY || atEdge) {
        glideRef.current = null;
        return;
      }
      glideRef.current = requestAnimationFrame(step);
    };
    glideRef.current = requestAnimationFrame(step);
  }, [applyPan, MAX_PAN]);

  useEffect(() => stopGlide, [stopGlide]);

  /** read by CardFanScene so a drag that ends over a card doesn't draw it */
  const shouldIgnoreTap = useCallback(() => dragged.current, []);

  const progress    = MAX_PAN > 0 ? (MAX_PAN - panX) / (MAX_PAN * 2) : 0;
  const thumbPct    = Math.max(8, Math.min(60, (VISIBLE_WORLD_WIDTH / TOTAL_WORLD_WIDTH) * 100));
  const thumbLeft   = progress * (100 - thumbPct);
  const nextPosition = spreadPositions?.[drawnCount] ?? null;

  return (
    <div style={{ width: "100%" }}>
      {/* Progress counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 300, color: "rgba(240,230,255,0.95)", lineHeight: 1 }}>
            {drawnCount < spreadCount ? drawnCount + 1 : spreadCount}
          </span>
          <span style={{ fontSize: 14, color: "rgba(166,153,185,0.55)", fontWeight: 300 }}>
            / {spreadCount}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 11, color: "rgba(166,153,185,0.7)", letterSpacing: "0.08em" }}>
            {drawnCount < spreadCount ? `第 ${drawnCount + 1} 張` : "抽牌完成"}
          </span>
          {nextPosition && drawnCount < spreadCount && (
            <span style={{ fontSize: 11, color: "rgba(212,168,89,0.7)", letterSpacing: "0.06em" }}>
              {nextPosition}
            </span>
          )}
        </div>
      </div>

      {/* 3D canvas — this is the drag surface now */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: "100%",
          height: CANVAS_HEIGHT,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(184,168,200,0.08)",
          // horizontal is ours, vertical stays with the page
          touchAction: "pan-y",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.1, 2.6], fov: 45 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: "transparent" }}
        >
          <CardFanScene
            spreadCount={spreadCount}
            onComplete={onComplete}
            onCardDrawn={setDrawnCount}
            panX={panX}
            allowedIds={allowedIds}
            shouldIgnoreTap={shouldIgnoreTap}
          />
        </Canvas>
      </div>

      {/* Progress indicator — display only. It used to be the control; now it
          just answers "where am I in 78 cards". */}
      <div style={{ marginTop: 10, padding: "0 6px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ position: "relative", width: "100%", height: 4, borderRadius: 8, background: "rgba(184,168,200,0.12)" }}>
          <div style={{
            position: "absolute", top: 0, left: `${thumbLeft}%`, width: `${thumbPct}%`,
            height: "100%", borderRadius: 8,
            background: "linear-gradient(90deg, rgba(184,168,200,0.6), rgba(200,180,220,0.75))",
            boxShadow: "0 0 8px rgba(184,168,200,0.25)",
          }} />
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(166,153,185,0.38)", letterSpacing: "0.12em", margin: 0 }}>
          {`← 在牌上左右滑動，瀏覽全部 ${actualCardCount} 張 →`}
        </p>
      </div>
    </div>
  );
}
