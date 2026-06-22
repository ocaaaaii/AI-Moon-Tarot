# AI Tarot — Design System

不是正式 spec,是把目前程式碼裡已經在用、但散落各檔案的視覺規則整理成一份參考。一人工作室的「設計師文件」,給未來的自己(或真的設計師朋友)看。

## 品牌調性

Morandi & Cream——低飽和、霧霧的莫蘭迪色系配暖白,夜色背景。整體是「儀式感、溫柔、不浮誇」,拒絕高飽和的玄幻塔羅刻板印象(大紅大紫、霓虹光),走克制、靜謐的方向。

## 色彩

### 基底(背景/文字)

| Token | Hex | 用途 |
|---|---|---|
| `mystic-deep` | `#1a1228` | 全站底色 |
| `mystic-purple` | `#2d1f4a` | 漸層 / 卡片底 |
| `mystic-indigo` | `#1e2a4a` | 漸層輔助 |
| `cream-50` ~ `cream-400` | `#fdfaf4` → `#d9c28a` | 文字色階,50 最亮(幾乎白)→ 400 偏金,數字越大越深 |

實際背景幾乎不用純色塊,而是 `radial-gradient(ellipse ... rgba(45,31,74,0.5) 0%, #0a0712 70%)` 這種由中心微亮、往外沉入接近黑的漸層,營造「月光打在一小塊區域」的感覺。

### 莫蘭迪七色(每個靈魂一色)

這是整個 avatar 系統的核心——七位靈魂(塔羅/神社各一身分)各配一個 accent,寫在 `lib/tarot/avatars.ts` / `lib/omikuji/avatars.ts` 的 `accent` 欄位,`components/ui/AvatarProfile.tsx` 用一個靜態 lookup map(`ACCENT_CLASSES`)轉成對應的 class 與陰影色,**不要**用 `text-morandi-${accent}` 這種動態字串拼 class,Tailwind JIT 掃不到會直接沒有樣式。

| Accent | Hex | 靈魂 |
|---|---|---|
| `lavender` | `#b8a8c8` | 月之女神(Cynthia / Tsukino) |
| `gold` | `#d4a859` | 黎明之神(Eos / Akira)、品牌主色 |
| `slate` | `#8a96a8` | 太陽神(Helios / Haruma) |
| `rose` | `#c9a8a0` | 智慧女神(Athena / Iori) |
| `sage` | `#a0b0a0` | 海洋之神(Poseidon / Ushio) |
| `mauve` | `#b0a0b8` | 永夜女神(Nyx / Maya) |
| `stone` | `#a89880` | 春之女神(Persephone / Kanon) |

金色(`gold`)同時也是「品牌主色」,用在 CTA 按鈕、提示文字、跨角色的通用裝飾(分隔線星號、進度點)上。

### 透明度的用法

幾乎沒有看到純色文字——一律是 `cream-100/85`、`morandi-stone/45` 這種帶 opacity 的寫法,opacity 本身就是「視覺層級」的工具:

- 標題 / 主要內容:`/85` ~ `/100`
- 次要說明:`/45` ~ `/60`
- 裝飾性文字(kicker、分隔符號):`/22` ~ `/35`

## 字體

- **Serif**(`font-serif` → Noto Serif TC,400/600):標題、角色名、引言。撐起「儀式感」。
- **Sans**(`font-sans`,預設,Noto Sans TC,300/400/500):全站預設、body、UI 元件文字。

兩款都是思源系列的繁中字重,透過 Google Fonts `<link>` 載入(`app/layout.tsx`),CSS variable 在 `globals.css` 宣告,`tailwind.config.ts` 接上 `fontFamily.serif` / `fontFamily.sans`。

## 字級(實際在用的尺度,不是憑空定義)

| 角色 | Class 範例 | 用途 |
|---|---|---|
| Eyebrow / Kicker | `text-xs tracking-[0.3em] uppercase` | 標題上方的小標籤,如「西洋塔羅線」 |
| H1 | `font-serif text-3xl md:text-4xl` | 頁面主標,如「選一扇門」 |
| H2 | `font-serif text-2xl tracking-wide` | 卡片 / 區塊標題,如角色名 |
| Body | `text-sm leading-relaxed` | 一般說明文字 |
| Caption / 小字 | `text-xs` 或 `text-[11px]` | 次要資訊、tagline、徽章文字 |
| Button | `text-sm tracking-widest` | 所有按鈕文字一律加寬letter-spacing |

沒有獨立的「Design Token 檔」定義這些,是每個元件各自手寫 className,目前靠人工維持一致——如果之後要交給設計師,這張表就是該抽成 Tailwind 自訂字級的依據。

## 元件規則

### 卡片容器

```
rounded-3xl
bg: rgba(18,12,32,0.85) + backdropFilter: blur(24px)
border: 1px solid rgba(184,168,200,0.12)  /* 跟 accent 同色系、極低透明度 */
boxShadow: 0 32px 80px rgba(0,0,0,0.5)
```

### 按鈕(膠囊型,全站唯一按鈕語言)

```
rounded-full
border: 1px solid {accent}/40~50
bg: {accent}/10~15
text-sm tracking-widest
hover: bg 加深、border 加亮
```

### 疊在場景圖片上的文字/按鈕(重要,血淚教訓)

凡是文字或按鈕疊在會變動的背景圖(場域場景、角色立繪)上面,**一律要有自己的深色底**,不能只靠文字顏色深淺去對比背景——背景換了、變亮了,純文字就會被吃掉。標準寫法:

```
bg-black/25~40 + backdrop-blur-sm + rounded-full
```

這條規則是這次「春之花園」kicker 文字被背景吃掉之後修的,之前「跳過導覽」「回到入口」「換人」等按鈕也都犯過同一個錯誤——同一個 class 組合,直接套用就好,不用每次重新設計。

### 分隔線

```
flex-1 h-px bg-gradient-to-r from-transparent to-{accent}/15~20
中間夾一個 ✦ 字元
```

## 動態效果

- **Easing 曲線**:幾乎全站統一用 `[0.16, 1, 0.3, 1]`(類似 easeOutExpo),沒有例外。保持「緩入緩出、不彈跳」的儀式感。
- **Stagger**:列表類內容(traits、suggestions)用 `delay: base + i * 0.1` 做逐項浮現。
- **常用時長**:0.4–0.7s 是大多數進場動畫的範圍;0.2s 用在「應該感覺幾乎瞬間」的狀態切換(如導覽外層淡入)。
- **呼吸光暈**:重要 CTA(如「先帶我參觀一下」)用 `boxShadow` keyframe array + `repeat: Infinity` 做緩慢的呼吸感,而不是常駐陰影。

## 圖片

- 場景類大圖一律 JPEG(quality ~82),不要用未壓縮 PNG——同樣解析度可以差到 7 倍檔案大小。
- 人物立繪 / 需要透明背景的素材才用 PNG。
- 圓形頭像 / logo:統一用 Pillow 做超取樣(4x 放大後裁圓再縮小)避免邊緣鋸齒。

---

這份文件沒有自動化(改了 `tailwind.config.ts` 不會同步更新這裡),純粹是現況快照。如果之後真要交接給設計師,下一步應該是把「字級表」「色彩表」實際抽成 `tailwind.config.ts` 裡的自訂 token(`fontSize.h1` 之類),而不是讓每個元件各自手寫數字。
