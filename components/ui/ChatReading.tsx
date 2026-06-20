"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface ChatReadingProps {
  text: string;
  isStreaming: boolean;
  avatarSrc?: string;
  avatarAlt?: string;
}

export default function ChatReading({
  text,
  isStreaming,
  avatarSrc = "/assets/Cynthia.png",
  avatarAlt = "Cynthia",
}: ChatReadingProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevParagraphCount = useRef(0);

  const paragraphs = splitIntoParagraphs(text);

  useEffect(() => {
    if (paragraphs.length > prevParagraphCount.current) {
      const diff = paragraphs.length - prevParagraphCount.current;
      prevParagraphCount.current = paragraphs.length;
      for (let i = 0; i < diff; i++) {
        setTimeout(() => setVisibleCount((c) => c + 1), i * 120);
      }
    }
  }, [paragraphs.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Streaming indicator */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 pl-1"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-morandi-lavender/30 flex-shrink-0">
              <Image src={avatarSrc} alt={avatarAlt} fill className="object-cover object-top" sizes="24px" />
            </div>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-morandi-lavender/60"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubbles */}
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {paragraphs.slice(0, visibleCount).map((para, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChatBubble text={para} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ text }: { text: string }) {
  const isHeading = text.startsWith("##");

  if (isHeading) {
    return (
      <p className="text-morandi-lavender text-sm font-medium mt-2">
        {text.replace(/^## /, "")}
      </p>
    );
  }

  return (
    <div className="rounded-2xl rounded-tl-sm bg-mystic-purple/50 border border-morandi-lavender/15 px-4 py-3 max-w-prose">
      <p className="text-cream-200/90 text-sm leading-relaxed font-light">
        {renderInline(text)}
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^[-*_]{2,}$/.test(p));
}

function renderInline(text: string): React.ReactNode[] {
  const cleaned = text.replace(/(?<!\*)\*(?!\*)/g, "");
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-cream-100 font-medium">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
