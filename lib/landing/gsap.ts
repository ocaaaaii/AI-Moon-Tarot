/**
 * The one place GSAP enters this codebase.
 *
 * Loaded dynamically so it never sits in the first-paint critical path, and
 * imported only by landing-page components — the four worlds (/tarot,
 * /shrine, /garden, /stories) stay on motion/react alone.
 *
 * Division of labour (see docs/PRD-landing-v7.md §6 decision 5):
 *   motion/react → mount/unmount, AnimatePresence, whileInView
 *   GSAP         → scroll-linked motion, infinite light loops, hover
 * Never let both drive the same property on the same element.
 */

type Gsap = (typeof import("gsap"))["gsap"];
type ScrollTriggerType = (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];

export interface GsapBundle {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
}

let pending: Promise<GsapBundle> | null = null;

/** Loads gsap + ScrollTrigger once and caches the promise. Client only. */
export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([core, plugin]) => {
        const { gsap } = core;
        const { ScrollTrigger } = plugin;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      }
    );
  }
  return pending;
}
