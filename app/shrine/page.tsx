"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import AvatarProfile from "@/components/ui/AvatarProfile";
import AvatarSelector from "@/components/ui/AvatarSelector";
import ShrineDraw from "@/components/omikuji/ShrineDraw";
import RegionRitual from "@/components/omikuji/RegionRitual";
import { OMIKUJI_AVATARS, getOmikujiAvatar } from "@/lib/omikuji/avatars";

/**
 * 月神神社 (Moon God Shrine) omikuji draw flow.
 * Mirrors app/tarot/page.tsx's split layout — a left character panel
 * (AvatarProfile) and a right chat column (header bar + ShrineDraw) — so
 * both product lines share the same level of visual polish, and the same
 * avatar-selector-before-chat flow.
 *
 * Sacred Realms (CLAUDE.md 🔮 Future Vision): when the active persona has
 * a `region` config, the page background swaps to that persona's scene
 * art, and a header button opens `RegionRitual` configured for that
 * region. Six of the seven souls have one now (everyone but Tsukino, the
 * shared default home base) — all driven by lib/omikuji/avatars.ts, no
 * per-persona branching here.
 */
export default function ShrinePage() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [showRegionRitual, setShowRegionRitual] = useState(false);
  const avatar = confirmedId ? getOmikujiAvatar(confirmedId) : null;
  const previewAvatar = previewId ? getOmikujiAvatar(previewId) : null;
  const profileAvatar = avatar ?? previewAvatar;

  const handleChangeAvatar = () => {
    setConfirmedId(null);
    setPreviewId(null);
    setShowRegionRitual(false);
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(74,61,31,0.45) 0%, #0f0a1a 100%)",
      }}
    >
      {/* Sacred Realms — region background, only when the active persona
          has one. Sits behind everything else (z-0); the gradient above
          still shows through where the scene art doesn't cover. */}
      {avatar?.region && (
        <>
          <Image
            src={avatar.region.image}
            alt=""
            fill
            className="object-cover z-0 opacity-60"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(10,20,22,0.55) 0%, rgba(8,10,16,0.88) 100%)",
            }}
          />
        </>
      )}

      <Link
        href="/"
        className="fixed top-4 left-4 z-20 px-3.5 py-1.5 rounded-full border border-amber-300/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-amber-300/50 text-xs tracking-widest transition-colors duration-300"
      >
        ← 回到入口
      </Link>

      {/* Brand header — mobile only */}
      <motion.div
        className="relative z-10 md:hidden text-center mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-amber-300/60 text-xs tracking-[0.3em] uppercase">月神神社</p>
        <h1 className="font-serif text-2xl text-cream-100 mt-1">籤詩問事</h1>
      </motion.div>

      {/* Main card */}
      <motion.div
        className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "rgba(18, 12, 32, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(212, 168, 89, 0.14)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,89,0.05)",
          height: "clamp(580px, 82vh, 780px)",
        }}
      >
        {/* Left: selected 解籤師's profile — hidden until chosen / on mobile */}
        <div
          className="hidden md:block md:w-72 flex-shrink-0 overflow-y-auto"
          style={{
            borderRight: "1px solid rgba(212,168,89,0.10)",
            background: "rgba(26, 20, 14, 0.5)",
          }}
        >
          {profileAvatar ? (
            <AvatarProfile avatar={profileAvatar} shopLabel="月 神 神 社" />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <p className="text-morandi-stone/35 text-xs leading-relaxed">
                選一位解籤師之後<br />這裡會顯示他的介紹
              </p>
            </div>
          )}
        </div>

        {/* Right: avatar picker, then draw + chat once chosen */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {avatar ? (
            <>
              {/* Header bar */}
              <motion.div
                className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ borderBottom: "1px solid rgba(212,168,89,0.10)" }}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-300/40 shadow-[0_0_12px_rgba(212,168,89,0.25)] flex-shrink-0">
                  <Image
                    src={avatar.image}
                    alt={avatar.displayName}
                    fill
                    className="object-cover object-top"
                    sizes="36px"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-cream-100 text-sm font-medium tracking-wide">{avatar.displayName}</p>
                  <p className="text-morandi-stone/45 text-xs">{avatar.tagline}</p>
                </div>
                {avatar.region && (
                  <button
                    onClick={() => setShowRegionRitual(true)}
                    className="px-3 py-1.5 rounded-full border border-amber-300/25 bg-black/25 text-cream-200/85 hover:text-cream-100 hover:border-amber-300/45 text-[11px] tracking-wide transition-colors duration-200"
                  >
                    {avatar.region.buttonLabel}
                  </button>
                )}
                <button
                  onClick={handleChangeAvatar}
                  className="px-3 py-1.5 rounded-full border border-morandi-stone/25 bg-black/25 text-cream-200/75 hover:text-cream-100 hover:border-amber-300/45 text-[11px] tracking-wide transition-colors duration-200"
                >
                  換人
                </button>
              </motion.div>

              {/* Draw + chat area */}
              <div className="flex-1 overflow-hidden">
                <ShrineDraw avatar={avatar} />
              </div>

              {/* Sacred Realms gimmick — overlays this column only */}
              <AnimatePresence>
                {showRegionRitual && avatar.region && (
                  <RegionRitual
                    title={avatar.region.title}
                    subheading={avatar.region.subheading}
                    placeholder={avatar.region.placeholder}
                    releaseLabel={avatar.region.releaseLabel}
                    restartLabel={avatar.region.restartLabel}
                    apiEndpoint={avatar.region.apiEndpoint}
                    accentRGB={avatar.region.accentRGB}
                    twoPath={avatar.region.twoPath}
                    onClose={() => setShowRegionRitual(false)}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <AvatarSelector
              avatars={OMIKUJI_AVATARS}
              heading="今晚想找誰為你解籤？"
              subheading="選一位解籤師"
              selectedId={previewId}
              onPick={setPreviewId}
              onConfirm={setConfirmedId}
            />
          )}
        </div>
      </motion.div>
    </main>
  );
}
