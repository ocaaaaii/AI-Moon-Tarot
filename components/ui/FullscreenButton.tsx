"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * FullscreenButton — toggles document.documentElement fullscreen.
 * Desktop-only (hidden on mobile via `hidden md:flex`).
 * Drop anywhere; it positions itself via the `className` prop.
 */
interface Props {
  className?: string;
  borderColor?: string; // Tailwind border colour token (without "border-")
}

export default function FullscreenButton({
  className = "fixed top-4 right-4 z-20",
  borderColor = "morandi-lavender",
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <button
      onClick={toggle}
      title={isFullscreen ? "退出全螢幕" : "全螢幕"}
      className={`hidden md:flex w-8 h-8 items-center justify-center rounded-full border bg-black/35 backdrop-blur-sm text-cream-200/60 hover:text-cream-100 transition-colors duration-300 border-${borderColor}/25 hover:border-${borderColor}/50 ${className}`}
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
  );
}
