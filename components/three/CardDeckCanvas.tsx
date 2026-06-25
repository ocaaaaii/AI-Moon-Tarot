"use client";

/**
 * CardDeckCanvas — R3F Canvas wrapper for the 3D tarot card spread.
 *
 * A hidden proxy div below the canvas provides native touch-scroll momentum.
 * A fully custom scrubber overlays it so users always see a clear, thick,
 * draggable track — the native scrollbar is hidden on every browser.
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import type { CardRequest } from "@/lib/tarot/types";
import CardFanScene, { SPREAD_COUNT, SPACING } from "./CardFanScene";

interface CardDeckCanvasProps {
  spreadCount: 1 | 2 | 3;
  onComplete: (cards: CardRequest[]) => void;
  /** Position labels for the spread (e.g. ["過去","現在","未來"]) */
  spreadPositions?: string[];
  /** When set, only cards in this set are shown (天地人 category mode) */
  allowedIds?: ReadonlySet<number>;
}

const CANVAS_HEIGHT = 400;
const PROXY_HEIGHT  = 56;
const VISIBLE_WORLD_WIDTH = 3.6;

export default function CardDeckCanvas({ spreadCount, onComplete, spreadPositions, allowedIds }: CardDeckCanvasProps) {
  const actualCardCount   = allowedIds?.size ?? SPREAD_COUNT;
  const TOTAL_WORLD_WIDTH = actualCardCount * SPACING;
  const MAX_PAN           = Math.max(0, (TOTAL_WORLD_WIDTH - VISIBLE_WORLD_WIDTH) / 2);

  const [panX,       setPanX]       = useState(MAX_PAN);
  const [scrollPct,  setScrollPct]  = useState(0);
  const [drawnCount, setDrawnCount] = useState(0);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);

  // Sync 3D pan from native scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pct = max > 0 ? el.scrollLeft / max : 0;
    setScrollPct(pct);
    setPanX(MAX_PAN - pct * MAX_PAN * 2);
  }, [MAX_PAN]);

  // Pointer-drag on the custom track → update proxy scroll
  const scrubTo = useCallback((clientX: number) => {
    const track = trackRef.current;
    const proxy = scrollRef.current;
    if (!track || !proxy) return;
    const { left, width } = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - left) / width));
    const max = proxy.scrollWidth - proxy.clientWidth;
    proxy.scrollLeft = pct * max;
    setScrollPct(pct);
    setPanX(MAX_PAN - pct * MAX_PAN * 2);
  }, [MAX_PAN]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragging.current) scrubTo(e.clientX); };
    const onUp   = () => { dragging.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [scrubTo]);

  // Thumb width & position
  const thumbPct  = Math.max(8, Math.min(60, (VISIBLE_WORLD_WIDTH / TOTAL_WORLD_WIDTH) * 100));
  const thumbLeft = scrollPct * (100 - thumbPct);

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

      {/* 3D canvas */}
      <div style={{ width: "100%", height: CANVAS_HEIGHT, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(184,168,200,0.08)" }}>
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
          />
        </Canvas>
      </div>

      {/* Scrubber zone */}
      <div style={{ position: "relative", width: "100%", height: PROXY_HEIGHT, marginTop: 6 }}>

        {/* Hidden proxy — native touch scroll drives panX */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            position: "absolute", inset: 0,
            overflowX: "auto", overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
          className="cdeck-proxy"
        >
          <div style={{ width: `${(TOTAL_WORLD_WIDTH / VISIBLE_WORLD_WIDTH) * 100}%`, height: 1 }} />
        </div>

        {/* Custom track — pointer events here for mouse/pen drag; touch falls through to proxy */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6px", gap: 6 }}>
          <div
            ref={trackRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = true;
              scrubTo(e.clientX);
            }}
            style={{
              position: "relative", width: "100%", height: 8, borderRadius: 8,
              background: "rgba(184,168,200,0.12)", cursor: "pointer",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: `${thumbLeft}%`, width: `${thumbPct}%`,
              height: "100%", borderRadius: 8,
              background: "linear-gradient(90deg, rgba(184,168,200,0.6), rgba(200,180,220,0.75))",
              boxShadow: "0 0 8px rgba(184,168,200,0.25)",
              transition: dragging.current ? "none" : "left 0.06s linear",
            }} />
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: "rgba(166,153,185,0.38)", letterSpacing: "0.12em", margin: 0 }}>
            {`← 左右滑動，瀏覽全部 ${actualCardCount} 張 →`}
          </p>
        </div>
      </div>

      <style jsx>{`
        .cdeck-proxy::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
