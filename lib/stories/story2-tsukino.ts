import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const MOON_SILVER  = "195,185,225";  // full moonlight
const DIVINE_FLASH = "235,225,255";  // divine revelation moment
const WARM_GOLD    = "212,168,89";   // cozy daily-life beats

/**
 * Story 2 — Chapter 7: 天城月乃 × Cynthia (辛西亞)
 * 《命運之輪與星星：順應天時的佛系神啟》
 * 7 slides — images: /assets/Stories/Story2/Tsukino/01–07.jpg
 */
export const STORY2_TSUKINO: Story = {
  id: "story2-tsukino",
  type: "story",
  title: "天城月乃的佛系神啟",
  tagline: "玄學的最高境界，就是「順應天時，隨遇而安」嘛。",
  cover: "/assets/Stories/Story2/Tsukino/07.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Tsukino/01.jpg",
      act: "第七章：天城月乃 🌙 Cynthia (辛西亞)——《命運之輪與星星：順應天時的佛系神啟》",
      text: "紫金色奢華的占卜帳篷中，滿月高懸。月乃癱在沙發上撥弄著塔羅牌，瞇著眼抱怨：「當神明代理人好累喔，每天看運勢流年，我都快長黑眼圈了……」",
      glowRGB: MOON_SILVER,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/02.jpg",
      text: "突然，水晶球光芒大盛——月光中走出一位一頭銀色長髮、身披月光輕紗的女神，手上還拿著一杯和月乃一模一樣的特製奶茶。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/03.jpg",
      text: "月神辛西亞慵懶地靠在月乃的沙發上，喝了一口奶茶：「沒錯，我也覺得主管命運超麻煩的。不過月乃，命運這東西，不就跟月亮一樣嗎？」月乃眨眨眼，好奇地遞過去一包餅乾。",
      glowRGB: MOON_SILVER,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/04.jpg",
      text: "女神隨手一揮，帳篷頂端浮現出新月、滿月、弦月的軌跡，如同一首寫在天上的古老樂曲。「月有陰晴圓缺，命運也有吉凶流年。新月時種下希望，滿月時收穫結果，弦月時反思放手。客人每天來，你不需要給他驚天動地的改變，只需要根據當天的月相，給他們隨機的神啟指引。玄學的最高境界，就是『順應天時，隨遇而安』嘛。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/05.jpg",
      text: "女神將牌輕輕洗過，整副牌散發出完美的銀色月光——最上方是「命運之輪」與「星星」。",
      glowRGB: MOON_SILVER,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/06.jpg",
      text: "「命運之輪在轉動，星星代表永恆的希望。月乃，這家店就交給你了。你繼續保持你慵懶自在的態度就是最好的～因為只有在最放鬆的狀態下，你的靈感神啟才是最準確的。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/07.jpg",
      act: "尾聲：隨遇而安的自在哲學",
      text: "月乃接過牌，打了個哈欠，舒舒服服地躺了下去：「哈啊～順應天時，隨遇而安？這個設定我喜歡！大家一起佛系開運吧！」",
      glowRGB: WARM_GOLD,
    },
  ],
};
