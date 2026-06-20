"use client";

/**
 * CardDeckCanvas — R3F Canvas wrapper for the 3D tarot card spread.
 * Imported with dynamic({ ssr: false }) to avoid SSR issues with document/WebGL.
 *
 * The full 78-card deck (CardFanScene.SPREAD_COUNT) is always laid out, but
 * the camera only frames a slice of it at once. Rather than rendering a
 * giant, heavily-distorted wide-FOV canvas to fit all 78 cards in one shot,
 * the camera stays fixed and the *row itself* pans in world space — driven
 * by a thin scroll-proxy strip below the canvas. Scrolling that strip (native
 * DOM overflow, not the canvas) updates panX, which CardFanScene applies to
 * a translate-only group around the cards.
 */

import { useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { CardRequest } from "@/lib/tarot/types";
import CardFanScene, { SPREAD_COUNT, SPACING } from "./CardFanScene";

interface CardDeckCanvasProps {
  spreadCount: 1 | 2 | 3;
  onComplete: (cards: CardRequest[]) => void;
}

const CANVAS_HEIGHT = 400;
const SCROLLBAR_GUTTER = 16;

// How much of the row the camera frames at once, in the same world units as
// SPACING — tuned to roughly match the current camera distance/fov. If the
// camera's position/fov in this file changes, this should be re-tuned too.
const VISIBLE_WORLD_WIDTH = 3.6;

const TOTAL_WORLD_WIDTH = SPREAD_COUNT * SPACING;
const MAX_PAN = Math.max(0, (TOTAL_WORLD_WIDTH - VISIBLE_WORLD_WIDTH) / 2);

export default function CardDeckCanvas({ spreadCount, onComplete }: CardDeckCanvasProps) {
  const [panX, setPanX] = useState(MAX_PAN); // start scrolled to the left edge of the deck
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0; // 0 = left edge, 1 = right edge
    setPanX(MAX_PAN - progress * MAX_PAN * 2);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          height: CANVAS_HEIGHT,
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(184, 168, 200, 0.08)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.1, 2.6], fov: 45 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: "transparent" }}
        >
          <CardFanScene spreadCount={spreadCount} onComplete={onComplete} panX={panX} />
        </Canvas>
      </div>

      {/* Proxy scrollbar — renders no visible cards itself, just a spacer
          sized relative to how much wider the full deck is than one
          camera-frame's worth, so scrolling it pans panX above. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="card-deck-scroll"
        style={{
          width: "100%",
          height: SCROLLBAR_GUTTER,
          overflowX: "auto",
          overflowY: "hidden",
          marginTop: "4px",
        }}
      >
        <div style={{ width: `${(TOTAL_WORLD_WIDTH / VISIBLE_WORLD_WIDTH) * 100}%`, height: 1 }} />
      </div>

      <style jsx>{`
        .card-deck-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(184, 168, 200, 0.4) transparent;
        }
        .card-deck-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .card-deck-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }
        .card-deck-scroll::-webkit-scrollbar-thumb {
          background: rgba(184, 168, 200, 0.4);
          border-radius: 8px;
        }
        .card-deck-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(184, 168, 200, 0.65);
        }
      `}</style>
    </div>
  );
}
