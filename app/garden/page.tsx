"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface Feature {
  href: string;
  icon: string;
  title: string;
  tagline: string;
  available: boolean;
  glow: string;
}

const FEATURES: Feature[] = [
  {
    href: "/garden/oracle",
    icon: "✦",
    title: "週神諭",
    tagline: "本週星座運勢 · Pick a Card 神諭",
    available: true,
    glow: "rgba(184,168,200,0.4)",
  },
  {
    href: "/garden/manifest",
    icon: "◈",
    title: "顯化願力",
    tagline: "眾神祝福 · 冥想與自我肯定",
    available: false,
    glow: "rgba(212,168,89,0.4)",
  },
  {
    href: "/garden/companion",
    icon: "♡",
    title: "眾神之語",
    tagline: "走入各個神明的領地 · 發展獨一無二的故事",
    available: false,
    glow: "rgba(168,120,230,0.4)",
  },
];

export default function GardenPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12"
      style={{
        background:
          "radial-gradient(ellipse 120% 90% at 50% 0%, rgba(30,18,60,0.9) 0%, #060410 65%)",
      }}
    >
      {/* Back nav */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-morandi-stone/50 hover:text-morandi-stone/80 text-sm tracking-widest transition-colors duration-200"
      >
        ← 回到入口
      </Link>

      {/* Stars overlay */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{ opacity: [null, Math.random() * 0.6 + 0.1] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-14 relative z-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-morandi-lavender/40 text-xs tracking-[0.35em] uppercase mb-3">
          第四扇門
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-cream-100 tracking-wide">
          眾神之庭
        </h1>
        <p className="text-morandi-stone/50 text-sm mt-4 tracking-wide">
          群星聚首之處，每一位神明都在等候你
        </p>
      </motion.div>

      {/* Feature cards */}
      <div className="w-full max-w-2xl flex flex-col gap-4 relative z-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.15 + i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {f.available ? (
              <Link href={f.href} className="group block">
                <FeatureCard feature={f} />
              </Link>
            ) : (
              <div className="cursor-not-allowed opacity-50">
                <FeatureCard feature={f} comingSoon />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.p
        className="mt-16 text-morandi-stone/30 text-xs tracking-widest relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        更多神明即將降臨
      </motion.p>
    </main>
  );
}

function FeatureCard({
  feature,
  comingSoon,
}: {
  feature: Feature;
  comingSoon?: boolean;
}) {
  return (
    <motion.div
      className="relative flex items-center gap-6 px-7 py-5 rounded-2xl border transition-all duration-300"
      style={{
        borderColor: "rgba(184,168,200,0.12)",
        background: "rgba(255,255,255,0.03)",
      }}
      whileHover={
        !comingSoon
          ? {
              borderColor: "rgba(184,168,200,0.28)",
              background: "rgba(255,255,255,0.06)",
              boxShadow: `0 0 40px ${feature.glow}`,
            }
          : {}
      }
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <span
        className="text-2xl w-10 text-center flex-shrink-0"
        style={{ color: "rgba(212,168,89,0.7)" }}
      >
        {feature.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-serif text-xl text-cream-100 tracking-wide">
          {feature.title}
        </p>
        <p className="text-morandi-stone/55 text-sm mt-1">{feature.tagline}</p>
      </div>

      {/* Arrow / Coming Soon */}
      {comingSoon ? (
        <span className="text-morandi-stone/35 text-xs tracking-widest flex-shrink-0">
          即將開放
        </span>
      ) : (
        <span className="text-morandi-stone/40 group-hover:text-morandi-stone/70 transition-colors duration-200 flex-shrink-0">
          →
        </span>
      )}
    </motion.div>
  );
}
