"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Background music for the portal, as a toggle in the nav.
 *
 * Off by default, and it cannot be otherwise: browsers block audible
 * autoplay without a user gesture, so "plays on arrival" is not a thing that
 * can be built. The choice is remembered, but even a remembered `on` only
 * takes effect once the visitor interacts with the page — the first click
 * anywhere resumes it.
 *
 * `preload="none"` matters: the track is 3.1 MB, several times the whole
 * first viewport. Nobody downloads a byte of it unless they ask for it.
 *
 * Fades rather than cuts, because a hard start on a 3-minute ambient pad is
 * jarring at exactly the moment you are trying to set a mood.
 */

const SRC = "/assets/music/The Hidden Sanctum.mp3";
const STORAGE_KEY = "moon-tarot:music";
const TARGET_VOLUME = 0.35;
const FADE_MS = 1400;

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  // read the remembered preference after mount — localStorage is not
  // available during SSR, and reading it in useState would desync hydration
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "on") setOn(true);
    } catch {
      // private mode, blocked storage — just start from off
    }
    setReady(true);
  }, []);

  const fadeTo = useCallback((to: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) window.clearInterval(fadeRef.current);

    const from = audio.volume;
    const start = performance.now();
    fadeRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / FADE_MS);
      audio.volume = from + (to - from) * t;
      if (t === 1) {
        if (fadeRef.current) window.clearInterval(fadeRef.current);
        fadeRef.current = null;
        onDone?.();
      }
    }, 40);
  }, []);

  // drive the element from state
  useEffect(() => {
    if (!ready) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (on) {
      audio.volume = 0;
      // a rejected play() is the normal no-gesture-yet case, not an error
      void audio.play().then(() => fadeTo(TARGET_VOLUME)).catch(() => undefined);
    } else {
      fadeTo(0, () => audio.pause());
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      // nothing to do — the toggle still works for this session
    }
  }, [on, ready, fadeTo]);

  // a remembered `on` cannot start until the visitor touches the page
  useEffect(() => {
    if (!ready || !on) return;
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    const resume = () => {
      void audio.play().then(() => fadeTo(TARGET_VOLUME)).catch(() => undefined);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [ready, on, fadeTo]);

  useEffect(() => () => {
    if (fadeRef.current) window.clearInterval(fadeRef.current);
  }, []);

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="none" />
      <button
        type="button"
        onClick={() => setOn(v => !v)}
        aria-pressed={on}
        aria-label={on ? "關閉背景音樂" : "播放背景音樂"}
        title={on ? "關閉背景音樂" : "播放背景音樂"}
        className="grid place-items-center w-8 h-8 rounded-full border transition-colors duration-300"
        style={{
          borderColor: on ? "rgba(212,168,89,0.5)" : "rgba(242,232,204,0.15)",
          background: on ? "rgba(212,168,89,0.12)" : "transparent",
          color: on ? "rgba(233,205,140,0.95)" : "rgba(242,232,204,0.5)",
        }}
      >
        <MusicIcon on={on} />
      </button>
    </>
  );
}

/** a moon-ish note: two waves when playing, struck through when not */
function MusicIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M11 5 L11 16" strokeLinecap="round" />
      <ellipse cx="8.4" cy="16.6" rx="2.6" ry="2.1" />
      <path d="M11 5 C14 5.6 16.4 6.4 17.6 7.6" strokeLinecap="round" />
      {on ? (
        <>
          <path d="M19.4 8.6 C20.4 9.8 20.4 12.2 19.4 13.4" strokeLinecap="round" opacity="0.75" />
          <path d="M21.4 6.8 C23.2 9 23.2 13 21.4 15.2" strokeLinecap="round" opacity="0.45" />
        </>
      ) : (
        <path d="M18.5 6.5 L22.5 15.5" strokeLinecap="round" opacity="0.8" />
      )}
    </svg>
  );
}
