"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import AvatarProfile from "@/components/ui/AvatarProfile";
import AvatarSelector from "@/components/ui/AvatarSelector";
import ChatInterface from "@/components/ui/ChatInterface";
import { TAROT_AVATARS, getTarotAvatar } from "@/lib/tarot/avatars";

export default function TarotPage() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const avatar = confirmedId ? getTarotAvatar(confirmedId) : null;
  const previewAvatar = previewId ? getTarotAvatar(previewId) : null;
  const profileAvatar = avatar ?? previewAvatar;

  const handleChangeAvatar = () => {
    setConfirmedId(null);
    setPreviewId(null);
    setShowMobileInfo(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background: "radial-gradient(ellipse 100% 80% at 50% 20%, rgba(45,31,74,0.6) 0%, #0f0a1a 100%)",
      }}
    >
      <Link
        href="/"
        className="fixed top-4 left-4 z-20 px-3.5 py-1.5 rounded-full border border-morandi-lavender/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-morandi-lavender/50 text-xs tracking-widest transition-colors duration-300"
      >
        ← 回到入口
      </Link>

      {/* Brand header — mobile only */}
      <motion.div
        className="md:hidden text-center mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-lavender/60 text-xs tracking-[0.3em] uppercase">AI Tarot</p>
        <h1 className="font-serif text-2xl text-cream-100 mt-1">向內尋找</h1>
      </motion.div>

      {/* Main card */}
      <motion.div
        className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "rgba(18, 12, 32, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(184, 168, 200, 0.12)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,168,200,0.05)",
          height: "clamp(580px, 82vh, 780px)",
        }}
      >
        {/* Left: selected tarot master's profile — hidden until chosen, and
            hidden on mobile (same reasoning as before: redundant with the
            brand header + chat header bar, and would crowd the fixed-height
            card on small screens) */}
        <div
          className="hidden md:block md:w-72 flex-shrink-0 overflow-y-auto"
          style={{
            borderRight: "1px solid rgba(184,168,200,0.08)",
            background: "rgba(26, 18, 40, 0.6)",
          }}
        >
          {profileAvatar ? (
            <AvatarProfile avatar={profileAvatar} shopLabel="A I  T A R O T" />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <p className="text-morandi-stone/35 text-xs leading-relaxed">
                選一位塔羅師之後<br />這裡會顯示她的介紹
              </p>
            </div>
          )}
        </div>

        {/* Right: avatar picker, then chat once a master is chosen */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {avatar ? (
            <>
              {/* Header bar */}
              <motion.div
                className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ borderBottom: "1px solid rgba(184,168,200,0.08)" }}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-morandi-lavender/40 shadow-[0_0_12px_rgba(184,168,200,0.2)] flex-shrink-0">
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
                {/* Desktop already shows the full AvatarProfile in the left
                    column (hidden md:block there) — this button only
                    exists for phones, where that column has nowhere to go. */}
                <button
                  onClick={() => setShowMobileInfo(true)}
                  aria-label="角色介紹"
                  className="md:hidden w-8 h-8 flex-shrink-0 rounded-full border border-morandi-stone/25 bg-black/25 text-cream-200/75 hover:text-cream-100 hover:border-morandi-lavender/45 text-xs flex items-center justify-center transition-colors duration-200"
                >
                  ⓘ
                </button>
                <button
                  onClick={handleChangeAvatar}
                  className="px-3 py-1.5 rounded-full border border-morandi-stone/25 bg-black/25 text-cream-200/75 hover:text-cream-100 hover:border-morandi-lavender/45 text-[11px] tracking-wide transition-colors duration-200"
                >
                  換人
                </button>
              </motion.div>

              {/* Mobile-only profile sheet — same AvatarProfile component
                  the desktop left column uses, just shown as an overlay
                  instead of a permanent sidebar. */}
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
                      style={{ background: "#150f24", border: "1px solid rgba(184,168,200,0.15)" }}
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
                      <AvatarProfile avatar={avatar} shopLabel="A I  T A R O T" heroHeight={220} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat area */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface avatar={avatar} />
              </div>
            </>
          ) : (
            <AvatarSelector
              avatars={TAROT_AVATARS}
              heading="今天想找誰為你解牌？"
              subheading="選一位塔羅師"
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
