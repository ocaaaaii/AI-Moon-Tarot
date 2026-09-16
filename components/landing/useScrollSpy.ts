"use client";

import { useEffect, useState } from "react";

import { NAV_HEIGHT, type SectionId } from "@/lib/landing/sections";

/**
 * Tracks which portal section is currently in view.
 *
 * The bottom margin (-55%) means a section only counts as "current" once it
 * has reached the upper half of the viewport — without it, a tall section
 * entering from the bottom would steal the highlight from the one being read.
 */
export function useScrollSpy(ids: readonly SectionId[]): SectionId {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useEffect(() => {
    const visible = new Set<SectionId>();

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        // keep document order, not intersection-callback order
        const current = ids.find(id => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: `-${NAV_HEIGHT.desktop}px 0px -55% 0px` }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
