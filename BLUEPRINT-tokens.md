# 曜刻代幣系統 Blueprint

> 版本：v0.1 · 2026-06-25
> 狀態：規劃中（Phase 1 可立即實作；Phase 2–3 需後端）

---

## 一、世界觀速覽

| 幣種 | 名稱 | 定位 | 視覺 | 用途 |
|---|---|---|---|---|
| 主幣 | 🌟 曜刻 | 星體交會的瞬間・凡人與神明的橋樑 | 金色八角星盤，中刻月相浮雕 | 直接消費：占卜 / 抽籤 / 換取副幣 |
| 副幣A | 🔴 願之緒 | 硃砂紅絲線御守結 | 金色月亮墜飾・硃砂編織繩 | 神社抽卡（御守 / 特殊牌背） |
| 副幣B | 🌫️ 月朧 | 命運迷霧・月光核心光暈 | 黑金鏤空香薰球・深紫金霧 | 解鎖劇情 / 隱藏故事 / 節日事件 |
| 副幣C | 🩶 月華紗 | 月光編織薄紗・夜晚的陪伴 | 銀白透明絲巾・螢光碎屑 | 贈予角色、解鎖深夜對話 / 好感度 |

---

## 二、你沒有明確說到、但必須決定的事

### 2.1 曜刻從哪裡來？（獲取機制）
你的文件只設計了「花費」，沒有設計「收入」。玩家沒有代幣就什麼都做不了。

| 獲取管道 | 建議 | 備註 |
|---|---|---|
| 新用戶初始禮包 | 送 5 枚曜刻 | 首次開啟 App 時觸發「月神賜予」儀式 |
| 每日登入獎勵 | 每天送 1 枚（streak 累計加倍） | 需登入系統，Phase 2 |
| 完成初始引導 | 送 3 枚 | 看完 PortalTour、選擇第一位讀牌師後 |
| 付費購買 | 真實貨幣換曜刻 | Phase 3，需金流整合 |
| 成就獎勵 | 第一次占卜 / 完整閱讀一個故事 | Phase 2 |

> ⚠️ **Phase 1 建議**：不做真實購買，直接在 localStorage 給新用戶 **5 枚**，並每日登入補 1 枚（lastVisit 記錄）。讓用戶先感受到儀式感，代幣稀缺性之後再調整。

---

### 2.2 定價設計（單次消耗）

| 動作 | 消耗 |
|---|---|
| 塔羅占卜（任意牌陣） | 1 曜刻 |
| 神社抽籤（抽一支籤） | 1 曜刻 |
| 曜刻 → 願之緒（神社商店） | 3 曜刻 = 1 願之緒 |
| 曜刻 → 月朧（塔羅商店） | 5 曜刻 = 1 月朧 |
| 曜刻 → 月華紗（贈禮） | 2 曜刻 = 1 月華紗 |
| 神社 Sacred Realm 小儀式 | 0（免費，但需先完成一次占卜/抽籤解鎖） |

> 以上為初期建議，上線後根據留存數據調整。

---

### 2.3 餘額不足時怎麼辦？

**不能直接硬擋**（破壞體驗），建議採「軟門禁」：
- 點擊占卜/抽籤 → 觸發儀式動畫 → 偵測到餘額不足
- 出現「月神輕聲嘆息…你的曜刻已燃盡。」提示
- 呈現兩個出口：①每日免費補充（若已 24hr 未領）②「曜刻補充儀式」（即購買頁）
- Phase 1 先不做購買，直接顯示「明日再來，月神會為你準備新的曜刻。」

---

### 2.4 跨裝置 / 資料持久性

| 階段 | 儲存位置 | 問題 |
|---|---|---|
| Phase 1 | `localStorage` | 換裝置 / 清快取 = 代幣歸零。**必須在 UI 上告知用戶**（「代幣存於本機，登入後可同步」） |
| Phase 2 | 後端 DB（綁 email / Google） | 需完整 Auth 系統 |

---

### 2.5 儀式可否跳過？

重度用戶每天佔十幾次，強制儀式動畫會造成疲勞。建議：
- 儀式動畫預設播放（~1.5 秒）
- 右上角可選「快速模式」（偏好設定），跳過動畫、靜音，只顯示代幣扣除數字
- 快速模式 = 仍然消耗曜刻，只是無動畫

---

### 2.6 音效資源

文件提到「清脆音效」，但目前專案沒有音效系統。需要：
- `public/assets/sfx/coin-drop.mp3`（硬幣投入）
- `public/assets/sfx/card-glow.mp3`（牌面亮起）
- 使用 Web Audio API 播放（不需要第三方庫）
- 偏好設定中加入「音效開關」，與快速模式聯動

---

### 2.7 副幣的「功能對應物」目前不存在

| 副幣 | 當前狀態 | 需要建立的東西 |
|---|---|---|
| 願之緒 | 無實際用途 | 神社「御守抽卡」功能 + 特殊牌背系統 |
| 月朧 | 無實際用途 | Story 解鎖門禁（`Story.locked` 欄位已預留） |
| 月華紗 | 無實際用途 | 角色好感度系統 + 專屬對話觸發 |

> Phase 1 可以讓玩家「看到副幣」但標示「即將推出」，讓世界觀先建立。

---

### 2.8 現有 ENFORCE_MEMBERSHIP 的關係

目前 `isMember`/`ENFORCE_MEMBERSHIP=false` 控制角色解鎖。
曜刻系統**不應取代**會員系統，兩者平行：
- 免費用戶：每日有少量曜刻 + 只能用 Cynthia/Tsukino
- 付費會員：曜刻補充更多 + 所有角色解鎖

等 Auth 系統上線後，兩者一起啟用。

---

## 三、技術架構

### 3.1 核心 Hook：`lib/tokens/useTokens.ts`

```typescript
// localStorage key: "yokoku_balance"（不用中文 key，避免 encoding 問題）
// localStorage key: "yokoku_last_daily"（上次領取日期）

interface TokenState {
  yoKoku: number;    // 曜刻
  negaOri: number;   // 願之緒
  tsukiRo: number;   // 月朧
  tsukiShya: number; // 月華紗
}

interface UseTokensReturn {
  balance: TokenState;
  spend: (currency: keyof TokenState, amount: number) => boolean; // false = 不足
  earn: (currency: keyof TokenState, amount: number) => void;
  claimDaily: () => boolean; // false = 今天已領
  canAfford: (currency: keyof TokenState, amount: number) => boolean;
}
```

### 3.2 新增 Step：`"ritual"` 插入塔羅流程

現有：`idle → typing → stillness → refine → spread → deck → reveal → reading`
新增：`idle → typing → stillness → refine → **ritual** → spread → deck → reveal → reading`

`ritual` step 顯示「以星芒為引」儀式覆層，動畫播完 + 扣除 1 曜刻後，自動 advance 到 `spread`。

### 3.3 神社入口 Hook 點

在 `app/shrine/page.tsx` 裡，`ShrineDraw` 的 `onDraw` callback 前插入一個 `RitualOverlay`（賽錢箱投幣動畫），完成後再觸發抽籤。

---

## 四、元件清單

| 元件 / 檔案 | 職責 |
|---|---|
| `lib/tokens/useTokens.ts` | localStorage 代幣狀態 hook |
| `components/ui/TokenDisplay.tsx` | 右上角曜刻數字 + 星盤圖示（含光暈動畫） |
| `components/ui/TarotRitual.tsx` | 塔羅儀式覆層（蠟燭點燃・牌面由暗轉亮） |
| `components/ui/SaisenRitual.tsx` | 神社賽錢箱投幣儀式（金色星芒落下動畫） |
| `components/ui/TokenInsufficient.tsx` | 餘額不足提示（含每日補充 CTA） |
| `app/shop/page.tsx` | 授與所商店（副幣兌換，Phase 2） |
| `public/assets/sfx/coin-drop.mp3` | 硬幣音效資源 |
| `public/assets/sfx/card-glow.mp3` | 牌面光效音效 |

---

## 五、Phase 分期

### ✅ Phase 1（無後端，可立即開始）
- [ ] `useTokens` hook（localStorage）
- [ ] 新用戶初始化 5 曜刻
- [ ] 每日登入補 1 曜刻（LocalStorage lastVisit 判斷）
- [ ] `TokenDisplay` 放入塔羅頁 + 神社頁 header
- [ ] `TarotRitual` 覆層 + 插入 ChatInterface `"ritual"` step
- [ ] `SaisenRitual` 覆層 + 插入 shrine/page.tsx draw flow
- [ ] `TokenInsufficient` 提示（無購買 CTA，只顯示「明日再來」）
- [ ] 偏好設定：快速模式 toggle（跳過動畫）
- [ ] 偏好設定：音效 toggle
- [ ] `public/assets/sfx/coin-drop.mp3` 資源（需準備音效）

### 🔜 Phase 2（需 Auth 系統）
- [ ] 後端 token balance API（綁用戶帳號）
- [ ] 副幣顯示（顯示但標「即將推出」）
- [ ] 每日登入 streak 系統
- [ ] 成就解鎖贈幣

### 🔮 Phase 3（需金流）
- [ ] 真實貨幣購買曜刻（授與所商店）
- [ ] 副幣兌換功能啟用（願之緒 / 月朧 / 月華紗 正式可用）
- [ ] Story.locked 門禁 × 月朧 解鎖
- [ ] 角色好感度系統 × 月華紗

---

## 六、儀式動畫規格

### 塔羅（TarotRitual）
```
觸發：stillness/refine 結束後，用戶選擇牌陣前
時長：約 1.8 秒（快速模式：0.3 秒淡出）
動作序列：
  1. 全屏半透明覆層漸入（0.3s）
  2. 蠟燭圖示點燃（使用 CSS filter: brightness()）
  3. 文案打字機顯示（0.6s）：「以星芒為引，窺探命運的軌跡。」
  4. 右上角曜刻數字閃爍 → -1（0.3s）
  5. 覆層漸出，進入 spread step（0.3s）
動畫庫：motion/react（已有，不引入新依賴）
```

### 神社（SaisenRitual）
```
觸發：用戶確認角色 + 點擊「抽籤」前
時長：約 2.0 秒
動作序列：
  1. 賽錢箱圖（月神賽錢箱.jpg）縮放居中（0.3s）
  2. 金色星芒粒子從上方落下（motion/react keyframes，6-8 個粒子）
  3. 音效播放（coin-drop.mp3）
  4. 文案：「聆聽，那是命運落下的聲音。」（0.5s）
  5. 曜刻 -1，覆層漸出，進入抽籤
技術：粒子用 position:absolute + random delay motion.div
圖片：/public/assets/月神賽錢箱.jpg（已存在）
```

---

## 七、曜刻圖示設計規格（SVG inline）

> 不需要新圖片資源，用 SVG + CSS 實現「金色星盤」圖示：
```
- 外圓：金色描邊（stroke: #D4A84B）
- 八角星芒：旋轉 22.5°的兩個疊加正方形
- 中心：月相弧形（新月到滿月的弧線）
- 光暈：用 drop-shadow CSS filter，餘額 > 10 時光暈加強
- 動態：每次 earn / spend 時，做一次 scale 1→1.25→1 pulse
```

已有圖片 `public/assets/曜刻.jpg` 可作為設計參考，但 UI 圖示建議用 SVG 保持清晰度。

---

*接下來請確認 Phase 1 的優先順序，可直接開始實作 `useTokens` + 兩個儀式覆層。*
