"use client";

import { FOOTER_COPY } from "@/lib/landing/sections";

interface Props {
  onOpenGuide: () => void;
}

export default function SiteFooter({ onOpenGuide }: Props) {
  return (
    <footer className="px-6 pb-12 text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="h-px flex-1 max-w-[5rem] bg-gradient-to-r from-transparent to-cream-200/12" />
        <p className="font-display text-cream-200/45 text-[10px] md:text-[11px] tracking-[0.34em]">
          {FOOTER_COPY.band}
        </p>
        <span className="h-px flex-1 max-w-[5rem] bg-gradient-to-l from-transparent to-cream-200/12" />
      </div>

      <button
        onClick={onOpenGuide}
        className="mt-8 px-5 py-2 rounded-full border border-cream-200/14 text-cream-200/50 text-xs tracking-[0.18em] hover:border-cream-200/32 hover:text-cream-200/75 transition-colors duration-300"
      >
        📖 使用教學
      </button>

      <p className="mt-8 text-morandi-stone/55 text-[11px] tracking-wide leading-relaxed">
        Developed by{" "}
        <a
          href={FOOTER_COPY.developer.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-morandi-stone/80 transition-colors duration-200"
        >
          {FOOTER_COPY.developer.label}
        </a>
        <br />
        {FOOTER_COPY.copyright}
      </p>
    </footer>
  );
}
