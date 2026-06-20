# AI Tarot — 月之塔羅店鋪 × 月神神社

一個雙線占卜平台:西洋塔羅的「月之塔羅店鋪」與東方籤詩的「月神神社」。兩間店共享同一群「七位靈魂」,每位靈魂都有一個塔羅身分與一個神社身分,風格各異,但核心信念相同——**答案在你心裡,我們只是陪你一起看。**

## ✨ 特色

- **七位雙重身分 AI 角色**:每位「靈魂」在塔羅店與神社各有一個名字與人格(例如 Cynthia / 天城月乃),由你選擇想找誰對話。
- **互動式 3D 抽牌**:以 Three.js 打造的塔羅牌堆,支援 78 張牌的洗牌、展開與滑動瀏覽。
- **籤筒抽籤體驗**:神社端有手刻動畫的籤筒搖籤、倒出籤條,凶籤會摺起掛上結籤架,搭配祝福語安放。
- **追問式對話**:抽牌/抽籤後可以針對結果繼續提問,角色會延續同一次解讀的脈絡回覆。
- **截圖分享**:可將整段解讀畫面截圖儲存。
- **🔮 聖境 Sacred Realms**:神社六位靈魂各自的專屬場域小遊戲(潮音池、春之花園、黎明庭園、烈陽殿、智慧花園、夜星庭),每個都是「寫下一段心事 → AI 給一段簡短回應」的輕互動。
- **入口導覽**:首次進站可以看一段自動播放的介紹動畫,認識兩間店與七位靈魂。

## 🛠 技術棧

- **框架**:Next.js 14(App Router)+ TypeScript(strict mode)
- **動畫 / 3D**:motion(Framer Motion)、Three.js / @react-three/fiber
- **樣式**:Tailwind CSS(Morandi & Cream 色調)
- **AI**:Anthropic Claude API(`@anthropic-ai/sdk`)
- **其他**:gray-matter(讀取 Markdown 知識庫)、html2canvas(截圖分享)

## 📂 專案結構

```
/app                  Next.js 頁面與 API 路由
  /tarot              塔羅店鋪
  /shrine             月神神社
  /api                各角色的解讀 / 場域小遊戲 API
/components
  /ui                 共用 UI(角色選擇器、角色介紹卡、聊天介面)
  /three               3D 抽牌畫面
  /omikuji             籤筒、結籤架、場域小遊戲元件
/lib
  /tarot              塔羅角色資料庫 + 各角色 system prompt
  /omikuji            神社角色資料庫 + 各角色 system prompt + 場域 prompt
/wiki                 78 張塔羅牌知識庫(Markdown)
/wiki-omikuji         100 則淺草觀音寺籤詩知識庫(Markdown)
/public/assets        角色立繪、場景圖、卡牌素材
```

詳細的開發規範與角色設定請見 [`CLAUDE.md`](./CLAUDE.md)。

## 🚀 開始使用

### 安裝

```bash
npm install
```

### 設定環境變數

複製 `.env.example` 為 `.env.local`,填入你的 Anthropic API Key:

```bash
cp .env.example .env.local
```

```
ANTHROPIC_API_KEY=你的金鑰
```

### 本機開發

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

### 建置與型別檢查

```bash
npm run build
npm run type-check
```

### 部署

最快的方式是用 [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel login
vercel
```

部署後記得到 Vercel 專案設定的 Environment Variables 加入 `ANTHROPIC_API_KEY`,再重新部署一次。

## ⚠️ 已知限制

- 目前沒有帳號系統,`ENFORCE_MEMBERSHIP` 為測試用而關閉,所有角色都可自由試用。
- 場域小遊戲(Sacred Realms)沒有跨次對話的持久化(例如烈陽殿的「三天之約」只是文字,不會真的被追蹤)。
- 沒有 API 用量限制 / 速率限制,公開分享連結前請注意 API Key 的使用風險。

## 🌙 核心理念

> 一切都是月亮的安排——但真正的答案,永遠在你心裡。我們不做命定式預言,人生是一場可以玩得開心的遊戲。
