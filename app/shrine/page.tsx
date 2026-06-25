"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import AvatarProfile from "@/components/ui/AvatarProfile";
import AvatarSelector from "@/components/ui/AvatarSelector";
import ShrineDraw from "@/components/omikuji/ShrineDraw";
import TokenDisplay from "@/components/ui/TokenDisplay";
import SaisenRitual from "@/components/ui/SaisenRitual";
import TokenInsufficient from "@/components/ui/TokenInsufficient";
import { useTokens, useQuickMode } from "@/lib/tokens/useTokens";
import RegionRitual from "@/components/omikuji/RegionRitual";
import { OMIKUJI_AVATARS, getOmikujiAvatar } from "@/lib/omikuji/avatars";

export default function ShrinePage() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [showRegionRitual, setShowRegionRitual] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [shrineRitualDone, setShrineRitualDone] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const { spend, canAfford } = useTokens();
  const { quickMode } = useQuickMode();
  const avatar = confirmedId ? getOmikujiAvatar(confirmedId) : null;
  const previewAvatar = previewId ? getOmikujiAvatar(previewId) : null;
  const profileAvatar = avatar ?? previewAvatar;

  const handleChangeAvatar = () => {
    setConfirmedId(null);
    setPreviewId(null);
    setShowRegionRitual(false);
    setShowMobileInfo(false);
    setShrineRitualDone(false);
  };

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(74,61,31,0.45) 0%, #0f0a1a 100%)",
      }}
    >
      {/* Sacred Realms region background */}
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
        {"←"} {"回到入口"}
      </Link>

      {/* Fullscreen toggle — desktop only */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "退出全螢幕" : "全螢幕"}
        className="hidden md:flex fixed top-4 right-4 z-20 w-8 h-8 items-center justify-center rounded-full border border-amber-300/25 bg-black/35 backdrop-blur-sm text-cream-200/60 hover:text-cream-100 hover:border-amber-300/50 transition-colors duration-300"
      >
        {isFullscreen ? (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 1H1v4M9 1h4v4M5 13H1V9M9 13h4V9"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/>
          </svg>
        )}
      </button>

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
        {/* Left: selected resolver's profile */}
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
                <TokenDisplay />
                {avatar.region && (
                  <button
                    onClick={() => setShowRegionRitual(true)}
                    className="px-3 py-1.5 rounded-full border border-amber-300/25 bg-black/25 text-cream-200/85 hover:text-cream-100 hover:border-amber-300/45 text-[11px] tracking-wide transition-colors duration-200"
                  >
                    {avatar.region.buttonLabel}
                  </button>
                )}
                <button
                  onClick={() => setShowMobileInfo(true)}
                  aria-label="角色介紹"
                  className="md:hidden w-8 h-8 flex-shrink-0 rounded-full border border-morandi-stone/25 bg-black/25 text-cream-200/75 hover:text-cream-100 hover:border-amber-300/45 text-xs flex items-center justify-center transition-colors duration-200"
                >
                  ⓘ
                </button>
                <button
                  onClick={handleChangeAvatar}
                  className="px-3 py-1.5 rounded-full border border-morandi-stone/25 bg-black/25 text-cream-200/75 hover:text-cream-100 hover:border-amber-300/45 text-[11px] tracking-wide transition-colors duration-200"
                >
                  換人
                </button>
              </motion.div>

              {/* Mobile-only profile sheet */}
              <AnimatePresence>
                {showMobileInfo && (
                  <motion.div
                    className="md:hidden fixed inset-0 z-40 flex items-end justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(8,6,14,0.7)" }}
                      onClick={() => setShowMobileInfo(false)}
                    />
                    <motion.div
                      className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl"
                      style={{ background: "#1a1410", border: "1px solid rgba(212,168,89,0.15)" }}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        onClick={() => setShowMobileInfo(false)}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-cream-200/80 text-sm flex items-center justify-center"
                      >
                        ✕
                      </button>
                      <AvatarProfile avatar={avatar} shopLabel="月 神 神 社" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saisen ritual — shown immediately after avatar confirmed, before chat */}
              {!shrineRitualDone ? (
                <div className="relative flex-1 overflow-hidden rounded-b-3xl">
                  <SaisenRitual
                    quickMode={quickMode}
                    spend={spend}
                    onComplete={() => setShrineRitualDone(true)}
                    onInsufficient={() => {
                      setShowInsufficient(true);
                      setConfirmedId(null);
                      setShrineRitualDone(false);
                    }}
                  />
                </div>
              ) : (
                <ShrineDraw avatar={avatar} />
              )}
            </>
          ) : (
            <AvatarSelector
              avatars={OMIKUJI_AVATARS}
              heading="選擇你的解籤師"
              subheading="每一位都有不同的靈魂頻率——先感受看看吧"
              selectedId={previewId}
              onPick={(id) => setPreviewId(id)}
              onConfirm={(id) => { setConfirmedId(id); setPreviewId(null); setShrineRitualDone(false); }}
            />
          )}
        </div>
      </motion.div>

      {/* Sacred Realms overlay */}
      <AnimatePresence>
        {showRegionRitual && avatar?.region && (
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
      {/* Insufficient balance modal */}
      <TokenInsufficient open={showInsufficient} onClose={() => setShowInsufficient(false)} />
    </main>
  );
}
