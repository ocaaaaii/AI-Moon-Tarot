# Product Requirements Document: 首頁品牌化改版 v7.0

**Author**: CA
**Date**: 2026-09-16
**Status**: Draft
**Stakeholders**: CA（PO / 設計 / 開發）、Claude（實作）
**關聯文件**: [BRIEF-landing-v7.md](BRIEF-landing-v7.md)、[DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)、[CLAUDE.md](../CLAUDE.md)

---

## 1. Executive Summary

把 AI Tarot 的首頁 `/` 從「四張縮圖的功能入口」重做為「世界觀品牌首頁」：固定錨點導航、全幅 KV 主視覺、五個敘事區段、引言帶與頁尾。目標受眾是**第一次到站、還沒決定要不要玩的訪客**；成功的樣子是他們在進入任何功能之前，就已經相信「這是一個有人認真經營的世界」。

這是下期（付費方案 / 會員訂閱 / 曜刻儲值）的前置條件：先建立值得付費的觀感，再談收費。本期**不含任何金流或權限邏輯**。

## 2. Background & Context

**產品現況。** 專案已累積可觀的內容深度：7 位靈魂 × 雙身分（塔羅／神社）、6 個 Sacred Realms 迷你儀式、78 張塔羅 wiki、100 支淺草觀音籤、12 星座神諭與眾神之語聊天、Sacred Chronicles 故事 CG（story1–3）。

**問題。** `app/page.tsx`（298 行）把這一切壓成四張並排卡片 + 兩顆按鈕。它是一個**導覽列**，不是一個**首頁**：

- 沒有角色露出 — 七魂是本產品最大的差異化資產，首頁完全看不到。
- 沒有世界觀敘事 — 訪客無法在點進去之前理解「這裡在幹嘛」。
- 視覺份量與內容份量嚴重不匹配 — 看起來像 side project，不像可售商品。

**觸發點。** 使用者（CA）明確表示「我們要做出好看能賣的產品了」，並提供了一張目標稿：長捲軸、頂部導航、全幅 KV、拱門式入口、引言帶。

**先前經驗（專案內既有教訓，直接沿用）：**

- 大圖一律 JPEG q82–84 再上線（Sacred Realms 背景、story1 都吃過 PNG 過大的虧，壓縮後約省 85%）。**本次查證發現 `next.config.mjs` 設定 `images.unoptimized: true`，代表 `next/image` 不做任何壓縮，`/public` 的原始檔案是直接傳給使用者的** — 這條紀律在本專案是硬需求，不是最佳化建議。
- 資料驅動的註冊表模式（`lib/tarot/avatars.ts`、`lib/stories/stories.ts`）運作良好，本次區段資料沿用同一模式。
- **動畫庫決策已於 2026-09-16 由 PO 變更：** 先前（story viewer 時期）決定「全站只用 `motion/react`，不引入 GSAP」。本期 PO 明確要求以 GSAP 強化 hover、光影與氛圍。決策改為**雙庫並存但職責分離**（見 §6 決策 5），僅限首頁，且以動態載入避免影響其他頁面的 bundle。

**約束（來自 CLAUDE.md，不可違反）：**

- 首頁**絕對不得**揭露任何靈魂的雙重身分（Cynthia ↔ 月乃）。CHARACTERS 區只能用單一身分稱呼。
- TypeScript 嚴格模式，**禁用 `any`**。
- 禁止巨型元件；3D 邏輯與版面元件分離。

## 3. Objectives & Success Metrics

### Goals

1. **首頁能獨立傳達世界觀** — 訪客不需點進任何子頁，就能說出「這裡有塔羅、有神社、有星象、有故事，還有七個角色」。
2. **視覺水準達到可售級** — 首頁與目標稿的結構一致（導航／KV／區段／引言帶／頁尾），並完整套用 Morandi & Cream 設計系統。
3. **兩端同等精雕** — 桌機與手機各自為獨立設計，手機不是桌機的裁切版。
4. **不犧牲效能** — 視覺升級不得讓首屏變慢到勸退行動網路使用者。
5. **為下期金流鋪路** — 版面預留會員方案區塊的位置（不實作），下期只需填內容不需重排。

### Non-Goals（明確不做，用來擋 scope creep）

1. **不建新路由頁。** WORLD / CHARACTERS / STORY 一律是首頁錨點區段。理由：這些內容量還撐不起獨立頁，且會延長工期 2–3 倍。
2. **不改動四個子世界。** `/tarot`、`/shrine`、`/garden`、`/stories` 本期零改動。
3. **不做金流 / 會員牆 / 登入。** `ENFORCE_MEMBERSHIP` 維持 `false`。
4. **不做多語系切換。** 英文只是視覺造型，不建 i18n 架構。
5. **不上 3D / Three.js 到首頁。** 首屏效能優先。
6. **不重寫設計系統。** 沿用既有 token，本期只新增「大標字級」一組。
7. **不做 SEO / OG / 結構化資料最佳化。** 值得做，但屬於另一個工作項。
8. **不把 GSAP 擴散到首頁以外。** `/tarot`、`/shrine`、`/garden`、`/stories` 維持純 `motion/react`，本期不重構它們的動畫。
9. **不改 `images.unoptimized: true` 設定。** 已知它讓 `next/image` 不壓縮，但改動會影響全站四個世界的圖片行為，屬於獨立工作項；本期改以「上線前手動轉檔」達成效能目標。

### Success Metrics

⚠️ **前置問題：專案目前沒有安裝任何分析工具**（無 GA、無 Vercel Analytics、無 Plausible）。以下指標分兩類：

**可立即量測（工具內建，零成本）**

| Metric | Current | Target | Measurement |
|---|---|---|---|
| 行動版 Lighthouse Performance | 未測（基準待建） | ≥ 85 | `next build` 後跑 Lighthouse（mobile preset） |
| LCP（行動版，4G throttle） | 未測 | ≤ 2.5s | Lighthouse |
| 首頁圖片總傳輸量（首屏） | 未測 | ≤ 1.2 MB | DevTools Network，篩 `/assets` |
| Accessibility 分數 | 未測 | ≥ 90 | Lighthouse |
| `tsc --noEmit` / `next lint` | pass | pass（零新增 error） | CI 指令 |

**需要先裝分析工具才能量測（建議下期連同金流一起做）**

| Metric | 需要什麼 | 建議目標 |
|---|---|---|
| 首頁跳出率 | 分析工具 | 改版後 4 週下降 |
| 首頁 → 任一子世界的點擊率 | 事件追蹤 | 建立基準 |
| 平均捲動深度 | 事件追蹤 | ≥ 50% 訪客捲到 CHARACTERS 區 |

**決策：本期不為了指標而裝分析工具**（那是獨立工作項，且涉及隱私政策）。本期以「可立即量測」那組為驗收門檻，商業指標列為下期 §8 的前置作業。

## 4. Target Users & Segments

| 區隔 | 描述 | 這次改版怎麼服務他們 | 優先序 |
|---|---|---|---|
| **初訪者**（主要） | 從連結／分享點進來，對品牌零認知，30 秒內決定去留 | KV 首屏 + WORLD 敘事，讓他們在捲動中被說服 | P0 |
| **回訪玩家** | 已經玩過，知道要去哪 | 導航列的 ENTER 與四道門必須**一步可達**，不能被敘事擋路 | P0 |
| **潛在付費者**（下期） | 玩過免費角色，考慮解鎖其他六位 | CHARACTERS 區先讓他們「看見自己還沒認識的六個人」，製造慾望；不推銷 | P1 |
| **CA 自己（作品集用途）** | 拿這個站當作品展示 | 首頁要能單獨截圖當封面 | P1 |

**關鍵張力：** 初訪者要敘事，回訪者要捷徑。解法是導航列常駐 + ENTER 按鈕永遠在右上角，敘事只發生在捲動路徑上，不做強制引導動畫、不做開場 loading 動畫。

## 5. User Stories & Requirements

### P0 — Must Have

| # | User Story | Acceptance Criteria |
|---|---|---|
| P0-1 | 作為初訪者，我一進站就看到一張震撼的主視覺與一句話，知道這裡是什麼 | 首屏（無捲動）呈現：KV 圖、英文大標 `MOON Tarot`、kicker `A GUIDE FOR YOUR HIDDEN SELF`、中文詩句副標、主 CTA `ENTER THE WORLD`；**桌機與手機為兩套獨立版型（見 §6 決策 2），非同一版型換圖**；KV 圖以 `next/image` + `priority` 載入；文字與圖之間必須有可調的暗場漸層（scrim），確保任何一塊文字的對比度 ≥ 4.5:1 |
| P0-2 | 作為回訪者，我隨時能一步進入我要的世界 | `SiteNav` 固定於頂部；含 LOGO、5 個錨點、曜刻膠囊、ENTER 按鈕；捲動超過 80px 時背景加深 + 模糊；手機收合為漢堡選單（展開為全屏覆蓋層） |
| P0-3 | 作為訪客，我點導航能平滑捲到對應區段，且知道自己在哪 | 點擊錨點平滑捲動並補償固定導航高度；IntersectionObserver 做 scroll-spy，當前區段導航項高亮；`prefers-reduced-motion: reduce` 時改為瞬間跳轉 |
| P0-4 | 作為訪客，我能理解這個世界的概念 | WORLD 區：kicker + 60–100 字中文品牌文案 + 氛圍圖 + 次要 CTA「與月神相約」（開啟既有 `PortalTour`） |
| P0-5 | 作為訪客，我能清楚看到四個入口並選擇 | GATES 區：四張拱形卡（上緣圓弧），各含場景圖、英文副名、中文名、tagline；hover 時圖片緩慢放大 + accent 色內光暈；桌機四欄、平板二欄、手機單欄 |
| P0-6 | 作為訪客，我看到七位角色，產生「想認識他們」的慾望 | CHARACTERS 區：七張角色卡（頭像、單一身分名、既有 tagline、accent 色光暈）；桌機為可拖曳／捲動的橫向軌道，手機為 snap 橫向捲動；**不得出現任何雙重身分文字**；卡片點擊導向對應世界 |
| P0-7 | 作為行動網路使用者，我不用等太久 | **因 `images.unoptimized: true`，`/public` 的檔案就是實際傳輸量**。KV 必須從 PNG（桌機 2.9MB／手機 2.6MB）轉為 JPEG q82–84，各 ≤ 400KB；首屏圖片總量 ≤ 1.2MB；非首屏圖片 `loading="lazy"`；角色圖 ≤ 200KB／張；GSAP 以 `await import()` 動態載入，不進首屏關鍵路徑；LCP ≤ 2.5s（Lighthouse mobile） |
| P0-8 | 作為開發者，這份程式碼未來還能改 | `app/page.tsx` 只做區段組合，≤ 80 行；每個區段為 `components/landing/` 下的獨立元件；文案與區段資料集中在 `lib/landing/sections.ts`（型別明確，無 `any`）；`tsc --noEmit` 與 `next lint` 皆通過 |
| P0-9 | 作為既有使用者，我原本會用的功能都還在 | 曜刻膠囊（含說明彈窗）、使用教學 `UserGuide`、`PortalTour`、`DeveloperBubble`、`FullscreenButton` 全數保留且可正常開啟，樣式改為新視覺語言 |

### P1 — Should Have

| # | User Story | Acceptance Criteria |
|---|---|---|
| P1-1 | 作為訪客，我被引導去看故事 | STORY 區：`封面.jpg` + 引言 + CTA → `/stories` |
| P1-2 | 作為訪客，捲到底時得到一個情緒收尾 | QUOTE BAND：英文引言 + 月相圓點裝飾 + 中文祝福句，區塊上下有細分隔線 |
| P1-3 | 作為訪客，頁尾資訊完整 | FOOTER：`CARDS · HEALING · SELF · DESTINY` 字帶、使用教學入口、Developed by CA 連結、版權宣告；`DeveloperBubble` 收納於此 |
| P1-4 | 作為訪客，捲動過程有生命感 | 各區段以 `motion/react` 的 `whileInView` 做一次性淡入上移（`once: true`）；`prefers-reduced-motion` 時全部停用 |
| P1-5 | 作為 CA，我要能分享首頁截圖 | 桌機 1920×1080 與手機 390×844 各截一張，構圖完整無破版（人工驗收） |
| P1-6 | 作為訪客，我感覺到光在動、氛圍是活的（**GSAP 負責**） | 四組效果，全部經 `gsap.matchMedia()` 包裝並在 `prefers-reduced-motion` 時停用：① KV 光暈呼吸與星芒閃爍（無限 timeline，`will-change` 僅限該層）② 捲動時 KV 緩慢下沉＋暗化（ScrollTrigger `scrub`）③ 角色卡與門卡 hover 的 accent 光暈擴散＋圖片微推近（`quickTo`，60fps）④ 區段進場時一道斜向光掃過標題。桌機 hover 效果在觸控裝置一律不註冊 |
| P1-7 | 作為訪客，動畫不會打架也不會漏記憶體 | GSAP 與 `motion/react` **不得動到同一元素的同一屬性**；所有 GSAP 實例在 `useLayoutEffect` 內以 `gsap.context()` 建立並於 cleanup 呼叫 `ctx.revert()`；ScrollTrigger 在視窗改變時 `refresh()` |

### P2 — Nice to Have / Future

| # | User Story | 備註 |
|---|---|---|
| P2-1 | KV 視差滾動（角色層與背景層不同速） | 需要素材 B1 分層檔；沒有就跳過 |
| P2-2 | 角色卡 hover 時播放該角色的簽名句動畫 | 需新素材 |
| P2-3 | 首頁預留「會員方案」區塊 | 本期**只保留版面位置與註解**，不實作內容 |
| P2-4 | OG image / meta 最佳化 | 分享到社群時的預覽圖，獨立工作項 |
| P2-5 | 安裝分析工具與事件追蹤 | 下期與金流一起做 |

## 6. Solution Overview

### 檔案結構（新增／修改）

```
app/page.tsx                          (重寫，≤80 行，純組合)
lib/landing/sections.ts               (新增：區段文案與資料的單一真實來源)
components/landing/
  SiteNav.tsx                         (固定導航 + scroll-spy + 手機漢堡選單)
  HeroKV.tsx                          (全幅 KV + 疊字 + 主 CTA)
  WorldSection.tsx                    (世界觀敘事)
  GateCards.tsx                       (四道拱門卡)
  CharacterRoster.tsx                 (七魂橫向群像)
  StorySection.tsx                    (月神天啟導引)
  QuoteBand.tsx                       (引言帶)
  SiteFooter.tsx                      (頁尾)
  useScrollSpy.ts                     (IntersectionObserver hook)
lib/landing/gsap.ts                   (新增：GSAP 動態載入與 plugin 註冊的單一入口)
lib/landing/useGsapContext.ts         (新增：gsap.context() 生命週期 hook)
tailwind.config.ts                    (微調：新增 display 字級與 arch 圓角)
package.json                          (新增依賴：gsap ^3)
public/assets/landing/                (新增：KV 與區段圖，全部 JPEG)
```

### 關鍵設計決策

1. **錨點而非路由。** 全部在 `/` 內，用 `id` + `scroll-margin-top` 處理固定導航遮擋。優點：零新頁面、分享單一網址、捲動即敘事。
2. **桌機與手機是兩套版型，不只是兩個檔案。** 已收到素材並實測（2026-09-16）：

   | | 檔案 | 尺寸 | 比例 | 版型 |
   |---|---|---|---|---|
   | 桌機 | `電腦版 - KV.png` | 1672×941 | 1.78 | **全幅鋪滿**（`object-cover`），文案疊在右上方星空區（該區夠暗，加輕 scrim 即可） |
   | 手機 | `KV.png` | 1184×1328 | 0.89 | **上方 62svh 畫框**，底緣長漸層溶入背景，文案落在漸層上 |

   **為何手機不能全屏鋪滿：** 以 390×844 的視窗 `object-cover` 這張 0.89 比例的圖，會裁掉 **48% 的畫面寬度**（iPhone SE 裁 37%，iPad 裁 16%）。保留人物臉、月亮、塔羅牌，但**天空城與瀑布會整片消失** — 那正是畫面中「世界觀」的部分，只剩人物特寫。改用畫框式版型可完整保留構圖，且不需要 PO 重新出圖。

   **既有限制（可接受，但記錄在案）：** 桌機 KV 寬 1672px，在 1920 視窗需放大約 15%，在 Retina 螢幕會略軟。以暗角與 scrim 可掩蓋；若 PO 日後能重算一版 ≥2560px，直接替換檔案即可，版型不需改。
3. **資料驅動區段。** 沿用 avatar registry 的成功模式：改文案只改 `lib/landing/sections.ts`，不碰元件。
4. **CHARACTERS 區的資料來源。** 讀取 `lib/tarot/avatars.ts` 既有的 `name` / `tagline` / `accent` / `image`，**不新建一份角色資料**。accent 色透過既有的靜態 lookup map 轉 class（**不可**用 `text-morandi-${accent}` 動態拼字串，Tailwind JIT 掃不到會直接沒樣式）。
5. **雙動畫庫，職責切開（2026-09-16 決策變更）。** PO 要求導入 GSAP 做 hover 與光影。兩者混用同一元素是效能與除錯災難的來源，因此立下明確分界：

   | | 負責什麼 | 為什麼 |
   |---|---|---|
   | **`motion/react`** | 元件進場／離場、`AnimatePresence`（`UserGuide`／`PortalTour` 覆蓋層）、區段 `whileInView` 淡入、手機選單展開 | 與 React 生命週期綁定，宣告式，已是全站語言 |
   | **GSAP（+ ScrollTrigger）** | 捲動連動（KV 視差與暗化）、無限循環的光暈／星芒、hover 的光暈擴散與位移（`quickTo`） | timeline 控制與 scrub 是 GSAP 的強項；`quickTo` 的 hover 追蹤比 React state 重繪省得多 |

   **硬性規則：** 同一個 DOM 元素的同一個屬性（尤其 `transform`／`opacity`）只能由其中一方控制。做法是分層 — 外層 `<motion.div>` 管進場，內層 `<div ref>` 交給 GSAP。

   GSAP 僅在首頁使用，以 `await import("gsap")` 動態載入（core ~23KB gz + ScrollTrigger ~11KB gz），不進首屏關鍵路徑，也不影響其他四個世界。所有效果以 `gsap.matchMedia()` 分別註冊桌機／手機／`prefers-reduced-motion`，觸控裝置不註冊 hover 效果。

6. **首屏不做進場遮罩、不做 loading 動畫。** 任何延遲看到 KV 的設計都會傷 LCP 與初訪者耐心 — 氛圍靠光影的「持續呼吸」營造，不靠開場秀。

7. **效能策略。** KV `priority`；其餘 `lazy`；因 `images.unoptimized: true`，**所有圖片在放進 `/public` 之前就要壓好**（環境已確認有 Python + Pillow 12.3，可直接批次轉檔）；角色圖另存 ≤200KB 的小尺寸版本，不直接用 2.7–3.5MB 的原始 PNG。

### 視覺規範增補

| 項目 | 規格 |
|---|---|
| 英文大標 | `font-serif`，`clamp(3.5rem, 8vw, 6rem)`，`tracking-[0.02em]`，cream-50 |
| 英文 kicker | `text-[11px] tracking-[0.4em] uppercase`，cream-200/45 |
| 中文副標 | `font-serif text-base md:text-lg`，`leading-loose`，cream-100/80 |
| 拱形卡圓角 | 上緣 `border-radius: 50% 50% 0 0 / 22% 22% 0 0`，下緣 `rounded-b-2xl` |
| 區段間距 | 桌機 `py-28`，手機 `py-20` |
| 導航高度 | 桌機 72px，手機 60px（對應 `scroll-margin-top`） |

### 實作順序（每步可獨立驗收，符合 CLAUDE.md 的微任務原則）

0. 圖片前處理：兩張 KV 轉 JPEG q82–84，七張角色圖轉 ≤200KB 小圖，輸出到 `public/assets/landing/`（Python + Pillow）
1. `lib/landing/sections.ts` + `app/page.tsx` 骨架（純文字版，無圖，先確認結構與捲動）
2. `SiteNav` + `useScrollSpy`（含手機選單）
3. `HeroKV` 桌機版 + 手機版兩套版型（**素材已到位**）
4. 安裝 GSAP、建立 `lib/landing/gsap.ts` 與 `useGsapContext`，先只做 KV 的光暈呼吸與捲動視差（作為雙庫共存的可行性驗證點）
5. `GateCards` + `WorldSection`（**WorldSection 需要素材 A3 氛圍圖**）
6. `CharacterRoster` + `StorySection`（含 GSAP hover 光暈）
7. `QuoteBand` + `SiteFooter` + 舊元件回歸整合
8. 效能與 RWD 驗收（Lighthouse、兩端截圖、`tsc`／`lint`、reduced-motion 實測）

## 7. Open Questions

| # | Question | Owner | 需要時間點 |
|---|---|---|---|
| ~~Q1~~ | ~~KV 圖橫＋直兩版？~~ **已解決 2026-09-16**：兩張都已提供，版型策略見 §6 決策 2 | — | — |
| ~~Q7~~ | ~~桌機 KV 要不要重算 ≥2560px？~~ **已處理 2026-09-16**：PO 指示「都試試」。已產出 `kv-desktop.jpg`（429KB）與 Lanczos 放大的 `kv-desktop-2560.jpg`（773KB）兩版，於 M2 實機並排比對後擇一。**技術註記：放大版無法增加真實細節**，只會多 344KB；若比對後仍覺得軟，唯一有效解是重新算圖，不是放大。 | — | M2 比對 |
| ~~Q8~~ | ~~WORLD 區氛圍圖~~ **已解決**：`World.png` 已提供並轉為 `world.jpg`。另意外取得 `底部.png` → `footer-band.jpg`，用於引言帶與頁尾通欄底圖。 | — | — |
| ~~Q9~~ | ~~光影強度克制還是明顯？~~ **已處理 2026-09-16**：PO 指示「都試試」。實作 `lib/landing/fxProfile.ts` 兩組參數（`subtle` / `vivid`），以 `?fx=vivid` query 切換，於實機比對後刪去落選者、將勝出者設為預設。 | — | 步驟 4 |
| Q10 | `底部.png` 的用途：只當引言帶背景，還是整個頁尾區（引言帶＋footer）共用一張通欄底圖？（建議後者，收尾更完整） | CA | 步驟 7 之前 |
| Q2 | CHARACTERS 區角色卡點擊後：導向 `/tarot` 選角頁，還是先展開一張介紹卡？（建議先導向，降低複雜度） | CA | 步驟 5 之前 |
| Q3 | 首頁的角色要用塔羅身分（Cynthia…）還是神社身分（月乃…）？CLAUDE.md 只禁止「同時揭露」，沒規定用哪一套。建議統一用塔羅身分，因為它對應免費入口。 | CA | 步驟 5 之前 |
| Q4 | 曜刻膠囊放進導航列後，說明彈窗要保留現在的長文案，還是縮短成 tooltip？ | CA | 步驟 2 之前 |
| Q5 | 中文詩句副標（C1）與 WORLD 文案（C2）你自己寫，還是要我先出三組草稿給你挑？ | CA | 步驟 1 之前 |
| Q6 | 現有首頁的 `/garden`（眾神之庭）在 CLAUDE.md 中沒有記載，改版後是否順手補上文件？ | CA | 收尾 |

## 8. Timeline & Phasing

### Phase 1 — 本期：品牌化首頁（本 PRD 範圍）

| 里程碑 | 內容 | 依賴 |
|---|---|---|
| M1 結構可捲動 | 步驟 0–2：圖片前處理、資料層、骨架、導航、scroll-spy | 無 |
| M2 主視覺與動畫基礎 | 步驟 3–4：HeroKV 雙版型、GSAP 接入與 KV 光影 | 無（KV 素材已到位） |
| M3 內容區完成 | 步驟 5–7：四道門、世界觀、角色、故事、引言帶、頁尾、舊元件整合 | WORLD 區阻擋於素材 A3（見 Q8） |
| M4 驗收 | RWD 兩端截圖、Lighthouse、`tsc --noEmit`、`next lint`、reduced-motion | M3 |

**關鍵路徑已解除。** KV 素材到位後，M1→M2 可連續開工，唯一剩下的素材缺口是 WORLD 區氛圍圖（A3），而該區可先以既有場景圖頂替、不阻擋進度。

### Phase 2 — 下期：變現（僅規劃，不在本期實作）

本期已在版面上預留位置，下期不需重排。需要處理的項目：

1. **帳號系統** — 目前完全沒有 auth。這是所有後續項目的前置條件。
2. **會員訂閱** — 對應既有的 `isMember` 旗標；解鎖其餘六位靈魂。`ENFORCE_MEMBERSHIP` 在真正有帳號與升級路徑之前**不得**翻成 `true`（會把人鎖在門外且無法升級）。
3. **曜刻儲值** — 目前曜刻是每日 +24 的免費機制，付費版需要決定：儲值包？訂閱附贈？兩者並存？
4. **首頁方案區塊** — 在 QUOTE BAND 之前插入定價卡片區。
5. **分析與事件追蹤** — 沒有數據就無法優化轉換漏斗；與金流同期上線。
6. **隱私政策／付款條款** — 收費即觸發法遵需求。

**Phase 2 不在本期承諾範圍內，本 PRD 僅記錄其需求與相依性。**
