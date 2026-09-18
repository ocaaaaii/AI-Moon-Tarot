# CLAUDE.md - AI Tarot Project Guidelines

## 🌟 Project Philosophy
- **Core Value:** "Look Inward." The true answers always lie within the user's heart. We do not promote fatalism. Life is a game to be played joyfully.
- **Vibe:** Highly ritualistic, immersive 3D/micro-animation interactive interfaces, and tender, story-driven AI tarot readings.

## 🛠 Tech Stack
- **Frontend Framework:** Next.js 14+ (App Router), TypeScript (Strict Mode)
- **Animation & 3D:** motion.dev (Micro-interactions, page transitions), Three.js / @react-three/fiber (3D card deck, shuffling, flipping), GSAP + ScrollTrigger (**landing page `/` only** — see 🎬 Animation libraries below)
- **Styling:** TailwindCSS (Theme color: Morandi & Cream palette)
- **Agent Framework:** FastAPI / Next.js Route Handlers + LangChain (Multi-Agent RAG flow)
- **Screenshot:** modern-screenshot / html2canvas

## 📂 Project Structure
- `/app`: Next.js App Router pages and API routes
  - `/app/tarot`: 月之塔羅店鋪 — single shared shop scene, avatar-switching via `AvatarSelector`
  - `/app/shrine`: 月神神社 — shared shrine scene by default; swaps to a per-persona Sacred Realms background + ritual for 6 of the 7 souls (see 🔮 Sacred Realms below)
  - `/app/stories`: 月神天啟 (Sacred Chronicles) — the third portal door, see 📖 Sacred Chronicles below
- `/components/ui`: Reusable UI components (buttons, cards, overlays), including the cross-shop persona system:
  - `AvatarSelector.tsx`: post-entry "choose your reader" screen (2 rows: 3 + 4, for 7 avatars per shop)
  - `AvatarProfile.tsx`: data-driven left-column character panel, themed by a 7-color accent palette (one per soul)
- `/components/three`: Three.js 3D canvas and card mesh components
- `/agents`: legacy multi-agent source code (Scraper, Librarian) — scraping/wiki-build only; persona reading logic now lives in `/lib` + `/app/api`, not here
- `/lib/tarot/avatars.ts`, `/lib/omikuji/avatars.ts`: **source of truth for every persona** — id, image, tagline, accent color, bio/traits/quote copy, opening message, input placeholder, suggested prompts, `isMember` flag, and the system prompt to use. Adding a new tarot master or 解籤師 means adding one entry here, not touching API routes or UI components.
- `/lib/tarot/*Prompt.ts`, `/lib/omikuji/*Prompt.ts`: one file per persona's system prompt (e.g. `cynthiaPrompt.ts`, `tsukinoPrompt.ts`)
- `/wiki`: Local knowledge base containing 78 tarot cards Markdown files
- `/wiki-omikuji`: Local knowledge base containing the 100 Asakusa Kannon (淺草觀音寺) omikuji fortune-slip Markdown files, for the 月神神社 (Moon God Shrine) product line
- `/public/assets`: Static assets — persona portraits, shop/region scene art, card back textures

## 🤖 Multi-Agent Specifications (data pipeline, not the reading personas)
1. **Agent 1 (Scraper Expert):** Crawls data from `nes-tarot.com`. Must mimic human behavior with random delays to protect the target server.
2. **Agent 2 (Tarot Librarian):** Cleans raw data and saves it into unified Markdown files in `/wiki/{id}-{card-name}.md` with proper frontmatter.

## 🎭 The Seven Souls — Persona Roster (dual-shop architecture)
Every persona exists as **one soul wearing two names** — a Western/tarot-shop identity and an Eastern/shrine identity. The shared identity is **never stated on the portal page** (`/app/page.tsx`); each soul's own shrine-side profile (`revealTemplate` field in `lib/omikuji/avatars.ts`) is the only place the connection is revealed. `Cynthia` and `Helios` etc. must never self-identify by their shrine name while in the tarot shop, and vice versa — see each prompt file's explicit instruction on this.

| Soul | Tarot identity | Shrine identity | Accent color | Best for | Signature line |
|---|---|---|---|---|---|
| 🌙 月之女神 | Cynthia | 天城月乃 (Tsukino) | lavender / gold | 迷茫、十字路口、渴望窺探命運 | 「一切都是月亮的安排。」 |
| 🌅 黎明之神 | Eos | 東雲曉 (Akira) | gold / slate | 重大挫折、信仰崩塌、需要定海神針 | 「抬起頭，看著老夫的眼睛。」 |
| ☀️ 太陽神 | Helios | 日向陽真 (Haruma) | slate / lavender | 逃避現實、自欺欺人、需要被一針見血點醒 | 「看著這張牌，你還要繼續裝睡嗎？」 |
| 🦉 智慧女神 | Athena | 神樂祈織 (Iori) | rose | 焦慮卡關、思緒混亂、把問題看得太嚴重 | 「把這個難關，當成有趣的小拼圖吧！」 |
| 🌊 海洋之神 | Poseidon | 汐見潮 (Ushio) | sage | 精神內耗、過度緊繃、渴望被溫柔包容 | 「放輕鬆，不要跟浪對抗，順著水走。」 |
| 🌌 永夜女神 | Nyx | 九条萬夜 (Maya) | mauve | 深層恐懼、自我懷疑、需要走入潛意識 | 「黑夜不是敵人，安靜，也是一種答案。」 |
| 🌸 春之女神 | Persephone | 天城花音 (Kanon) | stone | 失戀痛哭、憂鬱低潮、渴望重新開始 | 「花會開的，冬天真的會過去。」 |

Kanon is 天城月乃's younger sister — the same shared-identity pattern, revealed only on her shrine profile.

**Membership (not yet enforced):** `isMember` on each registry entry marks the free persona (Cynthia / Tsukino) vs. the other six (member-only). There is no auth/payment system yet, so this currently only drives the 🔒 badge in `AvatarSelector` — `ENFORCE_MEMBERSHIP` is hardcoded `false` in that component so testing isn't blocked. The intended policy once auth ships: non-members get one persona trial per day; members get the full roster. Do not flip `ENFORCE_MEMBERSHIP` to `true` until there's an actual account system behind it — it would lock people out with no way to upgrade.

## 🚫 Strict Restrictions & Anti-Patterns (Never Do)
- **NEVER** output fatalistic, absolute, or negative prophecies (e.g., "You will fail", "Breakup is inevitable"). **This rule is absolute for every tarot-shop persona (Cynthia, Eos, Helios, Athena, Poseidon, Nyx, Persephone) — no exceptions, regardless of how blunt/sharp/cold that persona's voice is.** A persona may be honest and direct about present pain (Helios's "嘖" bluntness, Nyx's cold clarity); none may claim an unchangeable future.
- **SCOPED EXCEPTION (月神神社 / 籤詩 only, NOT tarot):** Bad-fortune omikuji (凶/兇) may state the source text's negative content as objective fact (e.g. "疾病：危險吧" / "旅行：壞吧") rather than being softened or suppressed — 籤詩 are a real-world documented system, and euphemizing them would misrepresent the source. This exception is conditional and applies to **every shrine persona** (Tsukino, Akira, Haruma, Iori, Ushio, Maya, Kanon): every 凶/兇 reveal MUST be paired with ritual cushioning in the UI (the fold-and-hang-on-結籤架 animation) **and** the active persona's system prompt must explicitly instruct them to invite that fold — this was missing from every single persona's first draft so far and had to be added by hand each time; when writing a new shrine persona prompt, check for this instruction before treating the prompt as done. Never pair 凶/兇 text with fear-mongering framing, and never extend this exception to any tarot-shop persona.
- **NEVER** let a persona self-identify by their other-shop name/identity (e.g. Cynthia saying "我是月乃", Persephone saying "我是花音"). The shared-identity reveal belongs only on that soul's shrine-side profile panel (`revealTemplate`), never in chat, never on the portal page.
- **NEVER** use the `any` type in TypeScript.
- **NEVER** build monolithic UI components; keep 3D logic (`Three.js`) separate from standard layout components.
- **NEVER** run Scraper Agent without rate-limiting (`time.sleep` or delay utilities).
- **DO NOT** rewrite existing markdown utility tools or constants without permission.
- **DO NOT** invent mechanisms that don't exist in the underlying API (e.g. there is no way to "weight" part of a system prompt by a percentage) — route between personas by swapping the full system prompt via `avatarId`, not by trying to blend prompts numerically.

## 🔄 Development Workflow (Vibe Coding SOP)
1. **Plan Mode First:** Before writing code for any sub-task, switch to Plan Mode to output blueprint, data flow, and file lists. Do not modify files until approved.
2. **TDD Pattern:** Write tests (Unit/Integration) for logic, scraping, and AI prompt validation before writing implementation code.
3. **Micro Tasks:** Break features down into 3-5 independent sub-tasks. One thing at a time.

## 🔮 Sacred Realms — Shrine Regions (BUILT, see caveats below)
Every soul except Tsukino (the shared default home base) now has a `region` config in `lib/omikuji/avatars.ts` — a scene background (`/public/assets`) plus a small standalone ritual overlay, opened from a header button on `/app/shrine`. The shared UI shell is `components/omikuji/RegionRitual.tsx`; each region supplies its own focused system prompt (`lib/omikuji/*Prompt.ts`, separate from that persona's full omikuji-reading prompt) and its own API route (`app/api/<region>/route.ts`):

| Region | Soul | Gimmick | Route | Notes |
|---|---|---|---|---|
| 潮音池 Tide Pool | Ushio | type a worry → dissolve animation → short AI reply | `/api/tide-pool` | the original pilot |
| 春之花園 Spring Garden | Kanon | "plant" a heartbreak → short AI reply | `/api/spring-garden` | |
| 黎明庭園 Dawn Courtyard | Akira | write a self-doubt → "blessing" AI reply | `/api/dawn-courtyard` | |
| 烈陽殿 Solar Palace | Haruma | confess an avoidance → blunt callout + a rhetorical "3-day bet" | `/api/solar-palace` | **the bet is just text** — no persistence/auth exists, so nothing actually tracks 3 days later |
| 智慧花園 Athena's Sandbox | Iori | a two-choice dilemma → A-path/B-path reply | `/api/sandbox` | model returns `"A|||B"`; `RegionRitual`'s `twoPath` prop splits it, falls back to one block if the delimiter is missing |
| 夜星庭 Midnight Courtyard | Maya | a recurring dream → one-line reply | `/api/midnight-courtyard` | **really time-gated**: the route checks the server's own clock (23:00–05:00 Taipei), not a client-supplied time — don't "fix" this by trusting the browser's clock |
| 月之塔羅店鋪 (unchanged) | Tsukino | daily moon-phase check-in | — | still just the shared home base, no region/ritual of its own |

None of these mini-rituals draw an omikuji, so the CLAUDE.md scoped 凶/兇 exception does **not** apply to any of their prompts — they follow the same no-fatalism standard as the tarot side.

**Still genuinely unbuilt / explicitly out of scope today:**
- Any persistence across sessions (Haruma's bet isn't tracked, nothing remembers what you planted in 春之花園 yesterday).
- Membership gating on these regions — same caveat as the Membership note above, no auth exists yet.
- Anything beyond "type something → one short AI reply" — e.g. a real puzzle UI for 智慧花園, an actual akashic-record RAG for 夜星庭. The current build deliberately kept every region's *interaction* simple (one text box, one generated reply) so six regions could ship as variations on one component; if a region's concept later needs a genuinely different interaction shape, build that as its own feature, not a `RegionRitual` prop.

## 📖 Sacred Chronicles (月神天啟) — third portal door (BUILT, story1 only)
A cinematic slideshow of each soul's daily-life story (CG stills + narration), entered via a third door on the portal page (`/stories`) alongside the tarot shop and shrine.

- **Data:** `/lib/stories/types.ts` (`Story`/`StorySlide` shape), `/lib/stories/storyN.ts` (one file per story, transcribed from that story's own `.md` source in `/public/assets/Storys/StoryN/`), `/lib/stories/stories.ts` (registry — `STORIES` array + `getStory(id)`). Same single-source-of-truth pattern as the avatar registries: adding story2 means adding `story2.ts` + one line in `stories.ts`, not touching the selector page or the viewer.
- **Routes:** `/app/stories` (selector grid, reads `STORIES`), `/app/stories/[id]` (renders `StoryViewer` for that story, 404s via `notFound()` if the id isn't in the registry).
- **Viewer:** `components/stories/StoryViewer.tsx` — manual-paced (not auto-advancing like `PortalTour`, since this is narrative content the reader should move through at their own speed: tap the left/right thirds of the image, the prev/next buttons, or arrow keys). Three motion effects, **all built on `motion/react` alone, no GSAP** (still true for this viewer; GSAP's 2026-09-16 arrival is scoped to `/` only — see 🎬 below): (1) zoom & fade crossfade between slides, (2) the dialogue-box text parallaxes in ~0.2s after the image with a blur-to-clear ease, (3) a radial ambient glow behind the whole stage retunes color per-slide via each slide's `glowRGB` (warm gold for cozy beats, starry purple for divine ones).
- **Assets:** images live in `/public/assets/Storys/封面.jpg` (cover, shown on the portal door + selector card) and `/public/assets/Storys/StoryN/NN.jpg`. Source files arrive as multi-MB unoptimized PNGs — always re-encode to JPEG (quality ~82-84) before wiring up a new story; this cut story1's images by ~85% with no visible quality loss (same lesson as the Sacred Realms region backgrounds and the portal tour photos).
- **Monetization (月幣 → 御守 → unlock) is NOT built.** There's no currency/wallet/payment system anywhere in this project. `Story.locked` exists as a field for future use but nothing reads it yet — every story is freely viewable today. Do not invent a fake unlock mechanism; when a real account/payment system exists, gate `/app/stories/[id]/page.tsx` on it then.
## 🎬 Animation libraries — two of them, with a hard boundary (since 2026-09-16)

The project ran on `motion/react` alone until the v7.0 landing-page rebuild, when the PO asked for GSAP-driven hover and light work. **Do not "clean this up" by removing GSAP** — it is a deliberate, scoped decision, not drift.

| | Owns | Where |
|---|---|---|
| `motion/react` | mount/unmount, `AnimatePresence` overlays, `whileInView` section reveals, menus | everywhere, including `/` |
| GSAP + ScrollTrigger | scroll-linked motion (`scrub`), infinite light/glow loops, hover (`quickTo`) | **`/` only** |

Rules that are not negotiable:

- **One property, one owner.** GSAP and `motion/react` must never animate the same property on the same element. The pattern is an outer `<motion.div>` for entrance and an inner `<div ref>` for GSAP.
- **All GSAP goes through `lib/landing/useGsapContext.ts`**, which wraps `gsap.context()` and calls `ctx.revert()` on unmount. Skipping it leaks ScrollTriggers every time a user goes into a world and comes back.
- **`lib/landing/gsap.ts` is the only import site**, and it loads via `await import()` so GSAP stays out of the first-paint path and out of the other four worlds' bundles.
- **`gsap.matchMedia()` needs a condition that matches at every width.** A gotcha that cost real debugging time: `mm.add({ isDesktop, reduced }, cb)` only runs the callback while at least one condition is true, so below 768px with no reduced-motion preference *nothing ran at all*. Always include an `isMobile` condition.
- **Never put `scroll-behavior: smooth` on `html`/`body`.** ScrollTrigger mis-measures while a CSS smooth scroll is in flight. Anchor navigation scrolls from JS instead (`scrollToSection` in `components/landing/SiteNav.tsx`), which still honours each section's `scroll-margin-top`.
- `lib/landing/fxProfile.ts` holds the settled motion constants (`FX`). The earlier `subtle`/`vivid` pair and its `?fx=` switch are gone — the PO chose one on 2026-09-16.
- `components/landing/Wordmark.tsx` is settled: **Cinzel**, weight 400, moonlight-metal gradient (`background-clip: text`), and the two `O`s drawn as a waxing/waning moon pair in inline SVG. The five-face `?wm=` comparison switch has been removed. Cinzel is an all-caps Roman face — `Tarot` rendering as large-T + small caps is intentional. The English pull quote uses `font-quote` (Cormorant Garamond italic) because Cinzel has no italic and a synthesised slant looks cheap.

## ✨ Ambient light — the "living illustration" layer

`components/landing/AmbientScene.tsx` + `lib/landing/ambient.ts` make the painted scenes feel alive: candles flicker, the moon breathes, crystal balls turn and blossom petals drift. Mounted on the hero, the WORLD plate and the footer band.

**It adds light; it does not move the picture.** The art is a flat JPEG, so every effect is an additive glow positioned over a feature in the painting. Making the orrery actually rotate, or a real flame actually waver, would need the scene itself de-composited into layers — deliberately **not built**.

**Two layers, two blend modes.** The light layer is `mix-blend-mode: screen`, so it only ever brightens *and* a sprite's dark background contributes nothing — cut-outs need no perfect keying. Petals are physical objects in a normally-blended sibling layer; screening them turns them into ghosts.

**Sprites.** `public/assets/landing/fx/` holds 20 cut-outs (star flares, galaxies, orbit rings, blossom petals) extracted from the PO's sprite sheets — the originals are the `*素材*.png` files in `/public/assets`. A `LightPoint` with a `sprite` renders that PNG; one without renders a soft radial bloom. Use a bloom where the shape is already painted (candle halos, moonlight over the painted crescent) and a sprite where you want a shape that reads clearly. **A gradient-only pass looked like nothing was moving** — that was the lesson that prompted the sprites.

**No video backgrounds.** Beyond the cheap-AI-video look, `images.unoptimized: true` means a 1080p loop would ship at full size and blow the page budget on its own.

Rules:

- Light positions are **fractions of their own image**, so each crop needs its own set. The hero ships two (`kv-desktop.jpg` at 1.78, `kv-mobile.jpg` at 0.89) and therefore has `KV_DESKTOP_SCENE` and `KV_MOBILE_SCENE`. Reusing one set across both puts candle glows in mid-air.
- Lights are centred with **negative percentage margins**, not a transform — percentage margins resolve against width, and the box is square, so one value centres both axes. This leaves `transform` entirely to GSAP. Anywhere GSAP animates an element, its tilt/offset must be set through GSAP too, because a CSS `transform` will just be overwritten.
- Candle `flicker` uses `repeatRefresh: true` with function-valued durations and opacities, re-rolled every cycle. Fixed keyframes read as a mechanical loop within seconds.
- **Put the ambient layer ABOVE the section's darkening scrims.** Underneath them a 0.8-alpha shadow pool simply swallows the light, and the whole effect reads as "nothing is happening" — this cost a round of confused debugging.
- **Everything pauses off-screen**, via ScrollTrigger `onToggle` *and* `onRefresh`. Reading `trigger.isActive` straight after `create()` is too early — ScrollTrigger has not measured yet and reports false for a section that is on screen, which silently pauses every light on first paint.
- Only `opacity` and `transform` are animated. Never animate `filter: blur`.
- Phones drop every point not marked `onMobile` and halve the petals.
- There is no shooting star. It was built, and removed on the PO's call: a streak crossing a candlelit table read as an intruder, not as atmosphere. Do not add it back without being asked.
- `prefers-reduced-motion` renders the lights at rest and builds no timelines at all.
- The hero has three animations on three separate elements, on purpose: `[data-hero-art]` `yPercent` (scroll scrub), `[data-hero-plate]` `x`/`y` (pointer parallax), and the ambient layer's own offset. Never merge two onto one element.

**Verifying animation in the in-app Browser pane:** when the pane is hidden the browser throttles `requestAnimationFrame`, GSAP's ticker stops, and every animated value reads as frozen. That is the harness, not a bug — check `document.visibilityState` before concluding anything is broken.

## 🎴 Drawing cards — you pan by dragging the cards

`components/three/CardDeckCanvas.tsx` owns `panX` and the drag; the row is a
plain translated `<group>` in `CardFanScene`.

- **`touch-action: pan-y` on the drag surface is load-bearing.** Without it a
  sideways drag also scrolls the page, which is what "the screen won't stay
  still" meant. `pan-y` keeps vertical scrolling with the container and gives
  horizontal to us. Nothing else in this project sets `touch-action`; this is
  the one place that needs it.
- **Never go back to an absolute-position scrubber.** The old bar mapped the
  finger's absolute x onto the row, so a tap teleported you, and ~378px
  standing in for 78 cards meant roughly 0.2 cards per pixel — a 5px wobble
  skipped a card. Drag is relative, which is why it feels calm.
- **`shouldIgnoreTap` must be set during `pointermove`, not on `pointerup`.**
  R3F synthesises its click from pointerup, so a flag set in our own pointerup
  would race it. Setting it the moment the drag passes 10px is ordering-proof.
- A hidden native-scroll proxy used to sit under the canvas for momentum. It
  never fired on a phone: the visible track called `setPointerCapture`, and
  pointer events cover touch, so the proxy never saw a finger. Momentum is now
  an explicit rAF decay. Do not reintroduce the proxy.
- **Never call `setPointerCapture` on `pointerdown`.** Capture retargets every
  later event for that pointer to the capturing element, so capturing the
  moment a press starts sent the `pointerup` to the stage div instead of to
  the `<canvas>` under it — R3F never saw it, never synthesised its click, and
  **clicking a card on a desktop did nothing at all** (shipped in 8acd9d3,
  fixed after a user report). Capture belongs in `pointermove`, at the moment
  the 10px threshold is crossed: a plain click is then never captured and
  reaches the canvas untouched, while a real drag still works past the edge of
  the box. Proven by live reproduction — with capture on pointerdown the
  canvas receives `pointerdown` and then nothing; without it, `pointerup` and
  `click` both arrive.
- `setPointerCapture` is wrapped in try/catch — it throws for synthetic events
  and in some embedded webviews, and capture is a nicety, not a requirement.
- The deck height is `min(46svh, 400px)`. The page itself does not scroll here;
  the chat panel does.

## 🎯 Spreads live in one table

`lib/tarot/spreads.ts` is the single source of truth for every spread — the
same pattern as `avatars.ts` and `lib/stories/stories.ts`. Adding a spread is
one entry there; nothing in the route or the UI needs touching.

Three facts used to be kept in step by hand, and the client owned two of them:

- **Card count.** It was a `1 | 2 | 3 | 7` union in `ChatInterface` and a
  `maxCards = isChakra ? 7 : 3` in the reading route. It is `positions.length`
  now, so a 4- or 5-card spread needs no code change.
- **Position labels.** The browser sent a `spreadPositions: string[]` that went
  straight into the model's prompt via `contextBuilder` — anyone with curl
  wrote part of the prompt. The client sends a `spreadId`; the server looks the
  labels up. **Do not add a request field that reaches the prompt as free
  text.**
- **Whether it is the chakra spread.** Inferred from `cards.length === 7`,
  which would misfire the moment a second 7-card spread existed. It is
  `drawMode` now.

`ChatInterface` keeps one `spread: TarotSpread | null` where it used to hold
five pieces of state (`spreadCount`, `spreadPositions`, `spreadType`,
`isCategorySpread`, `isChakraSpread`). They were all facts about the spread, so
they are all read off it.

`spreadId` is optional on the wire purely so a tab left open across a deploy
still works — `fallbackSpreadForCount` resolves the generic spread of that
size. Unknown ids and mismatched card counts are rejected with a 400.

**The `isChakra ? 7 : 3` rule had a third copy**, inside `loadCards`
(`wikiLoader.ts`). Removing the route's copy left it, so every 4- and 5-card
signature spread passed validation and then threw `Max 3 cards allowed` at
load time — found by curling all seven signature spreads, not by reading. That
parameter is now a plain `maxCards` defaulting to `MAX_SPREAD_CARDS`, derived
from the registry so it cannot drift again; the reading route passes
`spread.positions.length`, which is exact. `pick-a-card` used to pass
`isChakra: true` purely to lift the limit for its 4 cards, and now passes `4`.
When adding a spread size, curl the route — a count rule can hide anywhere
downstream of validation.

## 🎲 One definition of "draw a card"

`lib/tarot/draw.ts` owns `REVERSED_CHANCE` and every pool rule. Picking off
the 3D fan and "let the master draw for me" are two paths to the same ritual,
and the moment they disagree the difference is invisible but real — a deck 35%
reversed by hand and 50% reversed automatically gives two people different
readings for the same question.

- `REVERSED_CHANCE` was written out four times before this file existed: 0.35
  in `CardFanScene`, 0.35 again in two components nothing imports
  (`CardDeck.tsx`, `CardSelector.tsx` — both dead), and **0.5 in a
  `drawCategoryCards` nobody called**, sitting in the obvious place to look
  when implementing an automatic 天地人 draw. That one is gone; a comment in
  `cardCategories.ts` says where it went and why it could not simply import
  the new file (`cardCategories` and `draw` would import each other).
- `autoDraw(spread)` enforces every pool restriction the manual path does:
  chakra stays inside the Major Arcana, 天地人 takes one card from each
  category in order. An automatic draw that ignored those produces a reading
  the persona's prompt cannot make sense of.
- The shuffle pause before the cards appear is deliberate. Cards that arrive
  the instant you ask for them feel generated, not drawn. It is 300ms under
  `prefers-reduced-motion`.
- `drawFrom` never mutates the pool it is given.

Verified by a throwaway route over 4000 draws per spread: counts, no
duplicates, ids in range, pools respected, reversed rate 0.341–0.358. If you
change this file, do that again rather than eyeballing a few draws — a pool
leak shows up once in fifty.

## 🎬 Question intake — one request, two model calls

`/api/question-intake` (was `/api/refine-question`) runs during the four-second
stillness animation and answers two things: does the question need sharpening,
and which spread suits it.

**It makes two model calls, in parallel, on purpose. Do not merge them.** The
merged version was written first and measurably degraded the refinement: asked
to also pick a spread, the model invented issueLabels ("問題編碼異常"), wrote
coaching instructions instead of copy-able questions, and picked generic
spreads over the master's own. Two single-purpose prompts each do their job,
and `Promise.allSettled` makes the latency the slower of the two rather than
the sum — measured at 1.3–2.9s, inside the animation.

- `REFINE_SYSTEM` is the old refine-only prompt **verbatim**. Every attempt to
  give it a second job made it worse.
- The spread menu is built server-side from `spreadsFor(avatarId)`, and the
  returned id is only used when it is in that master's own menu. A model will
  invent a plausible id.
- `skipRefine` (client sends it past `LONG_QUESTION_CHARS`, 60) skips the
  refine call entirely — someone who typed that much has already said where
  they are, and offering three rewrites reads as being corrected.
- Every failure path returns `{ shouldRefine: false }`. This is an optional
  assist in front of the real reading; a failed intake should just give the
  plain picker, never an error.

**Known, pre-existing:** the refine prompt's examples are heavily
romance-flavoured (他愛不愛我 / 真命天子 / 感情運), and it sometimes rewrites
an unrelated question into a relationship one — 「我還會不會有翻身的一天」 came
back with suggestions about 感情吸引力. This predates the intake split and is
a prompt-content fix, not a wiring one.

## 🔒 API surface — everything under /app/api is public

There is no auth, no rate limiting and no origin check on any route, and
twelve of the fifteen spend real money at Anthropic or DeepSeek. Treat every
request body as hostile, anonymous input.

- **Bound every text field that reaches a model.** `lib/api/limits.ts` holds
  the ceilings (`LIMITS`) and two helpers: `capText` truncates free text,
  `capTail` keeps the most recent N of an array. Without a ceiling the caller
  decides how large a prompt is, and therefore how much one anonymous request
  costs. Capping a history's turn *count* is not enough on its own — cap the
  length of each turn too.
- **The Sacred Realms rituals reject at 150 characters in their own routes.**
  That is a design choice (one short confession), not a safety cap; leave it.
- **`history[].role` must stay restricted to `user` / `assistant`.** Accepting
  a client-supplied `system` turn would let anyone rewrite the persona.
- **The 曜刻 quota is `localStorage` only** (`lib/tokens/useTokens.ts`). It is
  a display, not an limit — two lines in a console change it, and calling the
  API directly skips it entirely. Do not describe it as enforcement until the
  Phase 2 account system puts it server-side.
- **Escape anything user-typed before it enters the survey email**
  (`app/api/contact/route.ts`). Mail clients strip `<script>` but happily
  render links and remote images, so an unescaped answer is a phishing link
  inside a message the owner trusts. The name is additionally stripped of
  control characters — CR/LF in a Subject is header injection.
- Secrets are server-side only: no `NEXT_PUBLIC_` keys, no `process.env` in
  any client component, `.env.local` gitignored. Keep it that way.

**Still open:** rate limiting. It is the single highest-value fix and needs a
decision on Vercel Firewall vs Upstash. Until it exists, anyone with curl can
run the LLM routes in a loop on your bill.

## 🖼 Image weight is a hard requirement, not an optimisation

`next.config.mjs` sets `images.unoptimized: true`, so **`next/image` does no compression and the file in `/public` is exactly what ships to the user**. Every image must be compressed *before* it is committed (JPEG q82–84; Python + Pillow is available locally).

Two traps already found by measurement, both worth re-checking whenever a new asset lands:

- A 1.9 MB `logo-circle.png` and a 2.2 MB `CA.jpg` were being shipped to render at **36px and 32px**. Downscaled copies live in `/public/assets/landing/` (`logo-mark.png` 35KB, `ca-avatar.jpg` 8KB) and cut the portal's first viewport from 4.4 MB to 475 KB. If you add an avatar or icon, ship a thumbnail, not the source art.
- For art-directed hero images, use a native `<picture>` with `<source media>` rather than two `next/image`s toggled by `hidden`/`md:block` — a hidden `<img>` is still downloaded, so the breakpoint trick silently doubles the transfer.

## 🃏 THE SEVEN — fan + moon carousel

`CharacterRoster.tsx` (state only) composes `CharacterFan.tsx` (the picker) and `CharacterDetail.tsx` (the moon + carousel). Both children are controlled — the roster owns the single `selected` id, so the two can never disagree.

- **`motion/react` owns every transform here.** These are React-state-driven, which is motion's domain; adding GSAP would put two libraries on the same `transform`.
- **Desktop fans the cards about their BOTTOM edge** (`transform-origin: bottom center`) with a negative margin overlap. Rotating about the centre reads as a pinwheel; without the overlap it is a row of thumbnails again.
- **Below `lg` the fan is abandoned** for a snap-scroll track. Seven rotated cards cannot be laid out at 375px, and trying produces horizontal overflow — check `document.documentElement.scrollWidth` against `innerWidth` after any change here.
- **It opens on Cynthia, never on nothing.** The section used to render as an empty band until clicked, which read as dead space, and Cynthia is the free persona.
- **Do not reintroduce `AnimatePresence mode="wait"` for the panel swap.** It holds the new content back until the old one's exit animation finishes, so the panel stalls whenever animation cannot progress — a background tab, a throttled rAF, or just rapid clicking through the dots. A keyed re-mount with a fade-in has none of that.
- The seven dots use each soul's own accent, which is also how the roster says "seven personalities" rather than "seven thumbnails".
- **The moon portrait's mask must say `circle closest-side`** (`MOON_MASK` in `CharacterDetail.tsx`). A bare `radial-gradient(circle, …)` sizes to the farthest CORNER, so in a square box the visible edge sits at 1/√2 ≈ 70.7% of the gradient — the original `#000 70%, transparent 100%` was therefore still 97.6% opaque where you could see it, and spent its entire fade in corners that `rounded-full overflow-hidden` had already clipped. The soft edge was in the code for weeks and had never once rendered. With `closest-side`, 100% is the circle's radius and every stop is a real position on the disc.
- The rim light over the portrait is `mix-blend-mode: screen`, so it only ever adds — it brightens the band where the mask is fading out, which is what makes the edge read as light rather than as an ending, and it can never darken the face. There is no hard 1px ring any more; a crisp circle inside a dissolving edge was the thing that looked cropped.

Landing-page copy and section data live in `lib/landing/sections.ts` (same single-source-of-truth pattern as the avatar and story registries). Character cards read `TAROT_AVATARS` directly and only look up a thumbnail path — do not fork a second copy of the roster, and never render `realName` on the portal page.

## 🚪 The four gates — 2×2 on phones, not a stack

`GateCards.tsx` starts at `grid-cols-2` from 0px, not `sm:grid-cols-2`. One
column put four `aspect-[3/4]` cards in a 2008px stack at 375px — 2.5 screens,
a third of the whole page, for the site's four main entry points.

- **The mobile type scale is load-bearing, not decoration.** Two columns leave
  each card 158px wide, and at the desktop sizes every title hit its own
  `truncate`: the shop read as "月之…" and the kicker as "TAROT S…". The
  measured sizes (8px kicker / 15px title / 9.5px tagline, `px-2.5`) fit
  "月之塔羅店鋪" and "THE DIVINE REALM" whole. Raising them re-clips the titles.
- **`sm:truncate`, never bare `truncate`.** The ellipsis is a guard for the wide
  card; below `sm` it is what did the clipping.
- **The `→` circle is hidden below `sm`.** There is no hover on a phone, and at
  158px it took a quarter of the width away from the titles.
- A horizontal carousel was considered and rejected: these are the site's four
  doors, and it would show ~1.2 of them at a time. THE SEVEN already owns that
  pattern below `lg`.
- Keep every `data-guide="gate-*"` attribute — `UserGuide.tsx` positions its
  spotlight from them, and the layout change does not alter that contract.
