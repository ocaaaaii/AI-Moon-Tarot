"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { TAROT_AVATARS } from "@/lib/tarot/avatars";
import { CHARACTERS_COPY } from "@/lib/landing/sections";
import CharacterFan from "./CharacterFan";
import CharacterDetail from "./CharacterDetail";

/**
 * THE SEVEN.
 *
 * Holds the only piece of state — who is currently chosen — and hands it to
 * two controlled children: the fan (the picker) and the moon (the detail,
 * which doubles as a carousel). Neither child keeps its own copy, so the two
 * can never disagree about who is selected.
 *
 * Opens on Cynthia rather than nothing: the section used to render as an
 * empty band until you clicked, which read as dead space, and Cynthia is the
 * free persona so she is the right first impression.
 */
export default function CharacterRoster() {
  const [selected, setSelected] = useState<string>(TAROT_AVATARS[0].id);

  return (
    <div className="relative">
      {/* Faint plate behind the roster. Kept at ~10% and blurred: this section
          was a flat black band between two rich scenes, and the gap read as
          "the page stopped". It is atmosphere, not a picture to look at — the
          cards must stay the brightest thing here. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={CHARACTERS_COPY.backdrop}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.1, filter: "blur(2px)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 58% at 50% 45%, rgba(10,7,18,0.55) 0%, rgba(10,7,18,0.8) 55%, #0a0712 100%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center px-6"
      >
        <p className="font-display text-cream-200/50 text-[11px] tracking-[0.42em] uppercase">
          {CHARACTERS_COPY.kicker}
        </p>
        <h2
          className="font-serif text-cream-50 mt-4"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)", letterSpacing: "0.08em" }}
        >
          {CHARACTERS_COPY.heading}
        </h2>
        <p className="text-cream-100/60 text-sm mt-4">{CHARACTERS_COPY.body}</p>
        <p className="text-morandi-gold/55 text-xs mt-3 tracking-[0.18em]">
          ✦ {CHARACTERS_COPY.hint}
        </p>
      </motion.div>

      <div className="relative">
        <CharacterFan value={selected} onChange={setSelected} />
        <CharacterDetail value={selected} onChange={setSelected} />
      </div>
    </div>
  );
}
