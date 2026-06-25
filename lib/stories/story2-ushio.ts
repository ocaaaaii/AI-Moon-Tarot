import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const OCEAN_TEAL   = "85,165,195";   // deep ocean
const DIVINE_FLASH = "235,225,255";  // divine revelation moment

/**
 * Story 2 — Chapter 2: 汐見潮 × Poseidon (波賽頓)
 * 《倒吊人與節制：躺平在命運的潮汐》
 * 4 slides — images: /assets/Stories/Story2/Ushio/01–04.jpg
 */
export const STORY2_USHIO: Story = {
  id: "story2-ushio",
  type: "story",
  title: "汐見潮的躺平哲學",
  tagline: "對抗海浪的人會被粉碎，但順應海浪的人卻能征服海洋。",
  cover: "/assets/Stories/Story2/Ushio/04.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Ushio/01.jpg",
      act: "第二章：汐見潮 🌊 Poseidon (波賽頓)——《倒吊人與節制：躺平在命運的潮汐》",
      text: "那是潮剛來到神社的第三天。深夜，潮音池被暴風雨攪得翻湧不休，像極了他以前在科技廠天天爆肝、被焦慮淹沒的窒息感。他站在池邊，幾乎快被心魔吞噬...直到水面中央裂開，一尊手持黃金三叉戟、藍色長髮如海浪狂舞的巨神，破水而出，帶著毀天滅地的威壓。",
      glowRGB: OCEAN_TEAL,
    },
    {
      image: "/assets/Stories/Story2/Ushio/02.jpg",
      text: "「凡人！你在抗拒海浪？你在害怕被淹沒？」波賽頓的聲音如雷鳴。潮被水氣淋透，卻突然自嘲地笑出聲：「怕啊！我前半輩子都在跟風浪對抗，每天都快窒息了。這一次，老子不對抗了——大不了被淹死算了！」巨神的神眸裡，燃起讚賞的狂傲笑意。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Ushio/03.jpg",
      text: "「哈哈哈哈！好！對抗海浪的人會被粉碎，但順應海浪的人卻能征服海洋！焦慮是浪，痛苦也是浪，你要做的不是築牆擋水，而是躺在浪花上，讓它帶你前進！」波賽頓揮動三叉戟，水流在空中凝聚成一幅巨型的「倒吊人」與「節制」。",
      glowRGB: OCEAN_TEAL,
    },
    {
      image: "/assets/Stories/Story2/Ushio/04.jpg",
      text: "「倒吊人是用另一個視角看世界，順流而下，以靜制動；節制是水流的完美平衡。躺平，不是放棄，而是順應命運的潮汐。」潮接過流動著水光的牌，甩了甩頭髮，露出極致 Chill 的笑容：「謝啦，大叔。這堂衝浪課，我給滿分。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Ushio/05.jpg",
      act: "尾聲：潮音池的躺平導師",
      text: "從那天起，潮音池的水面永遠透著一股說不清楚的 Chill 感。帶著焦慮來的人，坐在池邊還沒開口，就覺得那口緊繃的氣先鬆了一半。「放輕鬆，不要跟浪對抗，順著水走。」這句話聽起來很簡單，但潮說它的方式，讓你真的相信：放手、放鬆，不是認輸，是另一種贏法。",
      glowRGB: OCEAN_TEAL,
    },
  ],
};
