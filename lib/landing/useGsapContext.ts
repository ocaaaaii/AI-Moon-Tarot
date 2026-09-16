"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import { loadGsap, type GsapBundle } from "./gsap";

/** useLayoutEffect warns during SSR; this component tree is still prerendered. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type GsapSetup = (bundle: GsapBundle, scope: HTMLElement) => void;

/**
 * Runs GSAP work scoped to `ref`, cleaned up on unmount.
 *
 * Every GSAP call on this page must go through here: `gsap.context()` +
 * `ctx.revert()` is what stops ScrollTriggers from piling up each time the
 * user navigates into a world and back to the portal.
 */
export function useGsapContext(ref: RefObject<HTMLElement | null>, setup: GsapSetup): void {
  // keep the latest setup without making it an effect dependency — the
  // callback is redefined on every render, which would thrash the context
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useIsomorphicLayoutEffect(() => {
    const scope = ref.current;
    if (!scope) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    void loadGsap().then(bundle => {
      if (cancelled) return;
      const ctx = bundle.gsap.context(() => setupRef.current(bundle, scope), scope);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [ref]);
}
