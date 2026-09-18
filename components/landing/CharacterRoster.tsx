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
      {/* Plate behind the roster: this section was a flat black band between
          two rich scenes and read as "the page stopped".

          One lesson worth keeping from the first pass: 10% opacity under a
          0.55–0.8 shadow pool is simply invisible. "Faint" is not the same as
          "not there", and stacking two subtractions is how you get neither.

          It is atmosphere, not a picture to look at — the cards stay the
          brightest thing here. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={CHARACTERS_COPY.backdrop}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          // world.jpg is landscape, so a centred cover crop fits this band
          // cleanly — none of the zooming the portrait plate needed to push
          // its chopped-up edge cards out of frame
          style={{ objectPosition: "center 42%", opacity: 0.22, filter: "blur(2.5px)" }}
        />
        {/* Edges only. A radial pool on top of an already-transparent image is
            subtractive twice over — 0.38 opacity under a 0.6–0.9 shadow left
            nothing at all. This just dissolves the top and bottom seams into
            the neighbouring sections and lets the middle show. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #0a0712 0%, rgba(10,7,18,0.34) 16%, rgba(10,7,18,0.34) 84%, #0a0712 100%)",
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
          className="font-serif text-cream-50 mt-4 text-balance"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)", letterSpacing: "0.08em" }}
        >
          {CHARACTERS_COPY.heading}
        </h2>
        <p className="text-cream-100/60 text-sm mt-4 text-pretty">{CHARACTERS_COPY.body}</p>
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
