"use client";

/**
 * CardMesh — Single tarot card in 3D space.
 * Hover: lift + glow. Click: fly-out animation.
 * Uses refs for animation state to avoid re-render jitter.
 */

import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Card physical dimensions (world units, portrait tarot ratio)
export const CARD_W = 0.65;
export const CARD_H = 1.14;
export const CARD_D = 0.022;

// Cards stand upright (no backward table-lean) — kept as a named constant,
// applied as each card's own rotation (orientation only, never via a
// wrapping group rotated around the scene origin, which would couple
// rotation to position and reintroduce the diagonal-slant bug).
export const CARD_TILT_X = 0;

// Entrance animation timing — shared shuffle phase, then each card deals
// out to its spread position staggered by index. CardFanScene uses these
// same constants to compute each card's stackPos/stackRotZ/dealDelay, so
// the two files agree on when the whole sequence finishes.
export const SHUFFLE_DURATION = 0.65; // seconds — whole deck jitters together
export const DEAL_STAGGER = 0.01;     // seconds added per card index

export interface CardInfo {
  deckId: number;
  basePos: THREE.Vector3;
  baseRotZ: number;
  reversed: boolean;
  /** where this card sits during the shuffle phase, before dealing out */
  stackPos: THREE.Vector3;
  stackRotZ: number;
  /** elapsed-time (seconds since mount) at which this card starts flying
   * from stackPos/stackRotZ to basePos/baseRotZ — staggered per card so
   * the deal cascades across the row instead of all 78 snapping at once */
  dealDelay: number;
}

interface CardMeshProps {
  info: CardInfo;
  texture: THREE.CanvasTexture;
  isDrawing: boolean;
  disabled: boolean;
  onDraw: (id: number, reversed: boolean) => void;
}

export default function CardMesh({ info, texture, isDrawing, disabled, onDraw }: CardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // All animation values as mutable refs — no setState to avoid re-renders
  const anim = useRef({ hover: 0, fly: 0, alpha: 1, entrance: 0 });
  // Per-card random phase so the shuffle jitter doesn't move every card in
  // perfect unison (which would look mechanical rather than shuffled).
  const jitterPhase = useRef(Math.sin(info.deckId * 12.9898) * 43758.5453 % (Math.PI * 2));

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const a = anim.current;
    const speed = Math.min(1, dt * 60); // frame-rate independent factor
    const elapsed = state.clock.getElapsedTime();

    // Hover
    const hTarget = (mesh.userData.hovered && !disabled) ? 1 : 0;
    a.hover += (hTarget - a.hover) * speed * 0.18;

    // Fly-out when card is drawn
    if (isDrawing) {
      a.fly += (1 - a.fly) * speed * 0.09;
      a.alpha += (0 - a.alpha) * speed * 0.07;
    }

    // Entrance: 0 while still parked in the shuffle stack, ramps to 1 once
    // this card's own dealDelay has passed, smoothly carrying it from
    // stackPos/stackRotZ to basePos/baseRotZ.
    const entranceTarget = elapsed >= info.dealDelay ? 1 : 0;
    a.entrance += (entranceTarget - a.entrance) * speed * 0.1;

    const h = a.hover;
    const f = a.fly;
    const e = a.entrance;

    // Shuffle jitter — only visible before/during dealing, fades out as
    // entrance approaches 1 so the card settles cleanly into its spot
    // instead of jittering forever.
    const jitterAmt = Math.max(0, 1 - e);
    const jitterX = Math.sin(elapsed * 14 + jitterPhase.current) * 0.018 * jitterAmt;
    const jitterRotZ = Math.sin(elapsed * 11 + jitterPhase.current * 1.3) * 0.12 * jitterAmt;

    const baseX = THREE.MathUtils.lerp(info.stackPos.x, info.basePos.x, e);
    const baseY = THREE.MathUtils.lerp(info.stackPos.y, info.basePos.y, e);
    const baseZ = THREE.MathUtils.lerp(info.stackPos.z, info.basePos.z, e);
    const baseRotZ = THREE.MathUtils.lerp(info.stackRotZ, info.baseRotZ, e);

    mesh.position.set(
      baseX + jitterX,
      baseY + h * 0.28 + f * 1.1,
      baseZ + h * 0.12 + f * 3.8,
    );
    mesh.rotation.set(CARD_TILT_X, 0, baseRotZ + jitterRotZ - h * 0.025);
    mesh.scale.setScalar(1 + h * 0.07 + f * 0.28);
    mat.opacity = a.alpha;
    mat.emissiveIntensity = 0.3 + h * 0.55;
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      if (!disabled && !isDrawing) onDraw(info.deckId, info.reversed);
    },
    [disabled, isDrawing, info, onDraw],
  );

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      if (meshRef.current) meshRef.current.userData.hovered = true;
      if (!disabled) document.body.style.cursor = "pointer";
    },
    [disabled],
  );

  const handlePointerOut = useCallback(() => {
    if (meshRef.current) meshRef.current.userData.hovered = false;
    document.body.style.cursor = "default";
  }, []);

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        transparent
        roughness={0.35}
        metalness={0.04}
        emissive="#6a4aa0"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}
