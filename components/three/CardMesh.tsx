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

export interface CardInfo {
  deckId: number;
  basePos: THREE.Vector3;
  baseRotZ: number;
  reversed: boolean;
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
  const anim = useRef({ hover: 0, fly: 0, alpha: 1 });

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const a = anim.current;
    const speed = Math.min(1, dt * 60); // frame-rate independent factor

    // Hover
    const hTarget = (mesh.userData.hovered && !disabled) ? 1 : 0;
    a.hover += (hTarget - a.hover) * speed * 0.18;

    // Fly-out when card is drawn
    if (isDrawing) {
      a.fly += (1 - a.fly) * speed * 0.09;
      a.alpha += (0 - a.alpha) * speed * 0.07;
    }

    const h = a.hover;
    const f = a.fly;

    mesh.position.set(
      info.basePos.x,
      info.basePos.y + h * 0.28 + f * 1.1,
      info.basePos.z + h * 0.12 + f * 3.8,
    );
    mesh.rotation.set(CARD_TILT_X, 0, info.baseRotZ - h * 0.025);
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
