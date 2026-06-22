# CLAUDE.md - AI Tarot Project Guidelines

## 🌟 Project Philosophy
- **Core Value:** "Look Inward." The true answers always lie within the user's heart. We do not promote fatalism. Life is a game to be played joyfully.
- **Vibe:** Highly ritualistic, immersive 3D/micro-animation interactive interfaces, and tender, story-driven AI tarot readings.

## 🛠 Tech Stack
- **Frontend Framework:** Next.js 14+ (App Router), TypeScript (Strict Mode)
- **Animation & 3D:** motion.dev (Micro-interactions, page transitions), Three.js / @react-three/fiber (3D card deck, shuffling, flipping)
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
- **Viewer:** `components/stories/StoryViewer.tsx` — manual-paced (not auto-advancing like `PortalTour`, since this is narrative content the reader should move through at their own speed: tap the left/right thirds of the image, the prev/next buttons, or arrow keys). Three motion effects, **all built on `motion/react` alone, no GSAP** (explicitly decided — the project has one animation library, and motion/react already covers everything asked for): (1) zoom & fade crossfade between slides, (2) the dialogue-box text parallaxes in ~0.2s after the image with a blur-to-clear ease, (3) a radial ambient glow behind the whole stage retunes color per-slide via each slide's `glowRGB` (warm gold for cozy beats, starry purple for divine ones).
- **Assets:** images live in `/public/assets/Storys/封面.jpg` (cover, shown on the portal door + selector card) and `/public/assets/Storys/StoryN/NN.jpg`. Source files arrive as multi-MB unoptimized PNGs — always re-encode to JPEG (quality ~82-84) before wiring up a new story; this cut story1's images by ~85% with no visible quality loss (same lesson as the Sacred Realms region backgrounds and the portal tour photos).
- **Monetization (月幣 → 御守 → unlock) is NOT built.** There's no currency/wallet/payment system anywhere in this project. `Story.locked` exists as a field for future use but nothing reads it yet — every story is freely viewable today. Do not invent a fake unlock mechanism; when a real account/payment system exists, gate `/app/stories/[id]/page.tsx` on it then.