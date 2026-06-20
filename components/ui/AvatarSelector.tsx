"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

/**
 * AvatarSelector — shown after entering a shop, before any chat starts.
 * Shared between /tarot and /shrine; the page passes its own avatar list
 * (lib/tarot/avatars.ts or lib/omikuji/avatars.ts — both satisfy
 * AvatarOption structurally).
 *
 * Flow is two steps, controlled by the parent page:
 *   1. tap a card → onPick(id) → parent shows that persona's profile in
 *      the left column as a preview, this card highlights, a confirm
 *      button appears
 *   2. tap "確認，開始對話" → onConfirm(id) → parent commits and starts
 *      the actual chat
 * Tapping a different card before confirming just swaps the preview.
 */

export interface AvatarOption {
  id: string;
  displayName: string;
  realName?: string;
  image: string;
  tagline: string;
  isMember: boolean;
}

interface AvatarSelectorProps {
  avatars: AvatarOption[];
  heading: string;
  subheading: string;
  selectedId: string | null;
  onPick: (avatarId: string) => void;
  onConfirm: (avatarId: string) => void;
}

// Membership isn't enforced yet — there's no auth/payment system live, and
// the product is still in testing. Flip this to true once that ships;
// locked avatars will then block confirmation instead of just wearing a
// badge.
const ENFORCE_MEMBERSHIP = false;

export default function AvatarSelector({
  avatars,
  heading,
  subheading,
  selectedId,
  onPick,
  onConfirm,
}: AvatarSelectorProps) {
  const selected = avatars.find((a) => a.id === selectedId) ?? null;
  const blocked = ENFORCE_MEMBERSHIP && !!selected?.isMember;

  const renderCard = (avatar: AvatarOption, i: number) => {
    const isSelected = avatar.id === selectedId;
    return (
      <motion.button
        key={avatar.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick(avatar.id)}
        className="relative rounded-2xl overflow-hidden aspect-[3/4] text-left transition-all duration-300 w-full"
        style={{
          border: isSelected
            ? "2px solid rgba(212,168,89,0.75)"
            : "1px solid rgba(184,168,200,0.15)",
          boxShadow: isSelected ? "0 0 0 1px rgba(212,168,89,0.2)" : "none",
        }}
      >
        <Image
          src={avatar.image}
          alt={avatar.displayName}
          fill
          className="object-cover object-top"
          sizes="200px"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 38%, rgba(10,7,18,0.92) 100%)",
          }}
        />

        {avatar.isMember && (
          <div className="absolute top-2 right-2 bg-black/55 backdrop-blur-sm rounded-full px-2.5 py-1">
            <span className="text-[10px] text-amber-200/85 tracking-wide">🔒 會員限定</span>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className="text-cream-100 text-sm font-medium">{avatar.displayName}</p>
          <p className="text-cream-300/50 text-[10px] mt-0.5 leading-relaxed">{avatar.tagline}</p>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-stone/45 text-xs tracking-[0.3em] uppercase mb-1">{subheading}</p>
        <h2 className="font-serif text-xl text-cream-100">{heading}</h2>
      </motion.div>

      {/* Explicit two-row layout — first 3, then the rest. Each row is a
          CSS grid with a fixed column count (grid-cols-3 / grid-cols-4),
          not flex-wrap — Tailwind's grid-cols-N is repeat(N, minmax(0,1fr)),
          so columns shrink to fit the available width instead of wrapping.
          flex-wrap was wrapping the 4-card row into 3+1 whenever the
          container wasn't quite wide enough for all 4 at a fixed card
          width; grid guarantees the row count regardless of width. */}
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
        <div className="grid grid-cols-3 gap-4 w-full">
          {avatars.slice(0, 3).map((avatar, i) => renderCard(avatar, i))}
        </div>
        {avatars.length > 3 && (
          <div className="grid grid-cols-4 gap-4 w-full">
            {avatars.slice(3).map((avatar, i) => renderCard(avatar, i + 3))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2"
          >
            {blocked ? (
              <p className="text-morandi-rose/70 text-xs text-center max-w-xs">
                {selected.displayName} 是會員限定角色，升級會員即可解鎖對話。
              </p>
            ) : (
              <motion.button
                onClick={() => onConfirm(selected.id)}
                whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(212,168,89,0.2)" }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-full border border-morandi-gold/40 bg-morandi-gold/10 text-cream-100 text-sm tracking-widest hover:bg-morandi-gold/20 hover:border-morandi-gold/60 transition-colors duration-300"
              >
                確認，開始對話
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
