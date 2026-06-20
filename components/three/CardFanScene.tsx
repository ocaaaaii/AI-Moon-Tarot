"use client";

/**
 * CardFanScene — Cards stand upright, fanned out side by side at near
 * eye-level (no backward table-lean), with slight Z-layering and a small
 * random in-plane tilt per card for a natural, not-machine-perfect look.
 */

import { useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import type { CardRequest } from "@/lib/tarot/types";
import CardMesh, { type CardInfo } from "./CardMesh";

// ── Layout config ─────────────────────────────────────────────────────────────
export const SPREAD_COUNT = 78; // the full deck, always laid out for the user to browse
export const SPACING = 0.175;   // horizontal gap between card centers — CardDeckCanvas
                                 // mirrors this to size its scroll-pan range
// (the backward "table perspective" lean now lives in CardMesh's own
// rotation — see CARD_TILT_X there — so it can't couple to card position)

// ── Canvas texture for card back ──────────────────────────────────────────────
function makeCardBackTexture(): THREE.CanvasTexture {
  const W = 256, H = 448;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;

  const g = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H / 2, W);
  g.addColorStop(0, "rgba(180, 152, 224, 0.98)");
  g.addColorStop(0.55, "rgba(112, 84, 166, 0.98)");
  g.addColorStop(1, "rgba(70, 50, 104, 1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(184, 168, 200, 0.32)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(4, 4, W - 8, H - 8, 17);
  ctx.stroke();

  ctx.strokeStyle = "rgba(184, 168, 200, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(13, 13, W - 26, H - 26, 12);
  ctx.stroke();

  const corners = [[28, 28], [W - 28, 28], [28, H - 28], [W - 28, H - 28]] as const;
  ctx.fillStyle = "rgba(200, 184, 220, 0.22)";
  ctx.font = "16px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  corners.forEach(([cx, cy]) => ctx.fillText("✦", cx, cy));

  ctx.fillStyle = "rgba(210, 192, 230, 0.38)";
  ctx.font = "80px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦", W / 2, H / 2);

  return new THREE.CanvasTexture(cv);
}

// ── Seeded random (deterministic per card) ────────────────────────────────────
function seeded(n: number): number {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

// ── Flat spread builder ───────────────────────────────────────────────────────
function buildSpread(ids: number[]): CardInfo[] {
  const center = (ids.length - 1) / 2;
  return ids.map((deckId, i) => {
    const x = (i - center) * SPACING;
    // Z must stay symmetric around the center index. A one-directional
    // ramp (e.g. i * 0.012) still reads as a diagonal slant even with no
    // rotation trickery involved — under perspective from a camera above
    // eye-level, nearer cards project lower on screen than farther cards
    // at the same world height, so a steady left-to-right depth change
    // alone reproduces the same slope. Bowing outward from the center
    // keeps that effect symmetric (a gentle fan curve) instead.
    const z = Math.abs(i - center) * 0.01 + (seeded(deckId) * 0.04 - 0.02);
    const rotZ = seeded(deckId + 77) * 0.1 - 0.05; // ±2.9° tilt
    return {
      deckId,
      basePos: new THREE.Vector3(x, 0, z),
      baseRotZ: rotZ,
      reversed: Math.random() < 0.35,
    };
  });
}

function shuffleSlice(n: number): number[] {
  const arr = Array.from({ length: 78 }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// ── Scene ─────────────────────────────────────────────────────────────────────
interface CardFanSceneProps {
  /** how many cards the user must draw to complete this reading (1/2/3) —
   * NOT the number of cards laid out, which is always the full SPREAD_COUNT */
  spreadCount: number;
  onComplete: (cards: CardRequest[]) => void;
  /** world-space X offset for the whole row, driven by CardDeckCanvas's
   * scroll proxy so the camera can stay fixed (no FOV distortion) while
   * still letting the user pan across all 78 cards */
  panX?: number;
}

export default function CardFanScene({ spreadCount, onComplete, panX = 0 }: CardFanSceneProps) {
  const texture = useMemo(() => makeCardBackTexture(), []);
  const spreadCards = useMemo(() => buildSpread(shuffleSlice(SPREAD_COUNT)), []);

  const [drawn, setDrawn] = useState<CardRequest[]>([]);
  const [drawingId, setDrawingId] = useState<number | null>(null);

  const drawnIds = useMemo(() => new Set(drawn.map((d) => d.id)), [drawn]);
  const isDisabled = drawn.length >= spreadCount || drawingId !== null;

  const handleDraw = useCallback(
    (id: number, reversed: boolean) => {
      if (isDisabled) return;
      setDrawingId(id);
      setTimeout(() => {
        setDrawingId(null);
        setDrawn((prev) => {
          const next = [...prev, { id, reversed }];
          if (next.length >= spreadCount) {
            setTimeout(() => onComplete(next), 200);
          }
          return next;
        });
      }, 780);
    },
    [isDisabled, spreadCount, onComplete],
  );

  return (
    <>
      <ambientLight intensity={1.3} color="#d8cdec" />
      <directionalLight position={[1, 4, 3]} intensity={1.5} color="#f5f0fb" />
      <pointLight position={[0, 3, 2.5]} intensity={1.1} color="#b298e0" distance={12} />
      <pointLight position={[0, 1.2, 4]} intensity={0.6} color="#f0eaf8" distance={10} />

      {/* Only the row's position is offset here (never rotation) — a pure
          translation on a parent group is safe and doesn't reintroduce the
          earlier rotation/position-coupling slant bug. */}
      <group position={[panX, 0, 0]}>
        {spreadCards.map((info) => {
          if (drawnIds.has(info.deckId)) return null;
          return (
            <CardMesh
              key={info.deckId}
              info={info}
              texture={texture}
              isDrawing={drawingId === info.deckId}
              disabled={isDisabled}
              onDraw={handleDraw}
            />
          );
        })}
      </group>
    </>
  );
}
