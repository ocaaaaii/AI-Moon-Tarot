import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const SOLAR_AMBER  = "235,175,55";   // burning sun
const DIVINE_FLASH = "235,225,255";  // divine revelation moment

/**
 * Story 2 — Chapter 4: 日向陽真 × Helios (赫利奧斯)
 * 《正義與太陽：灼燒虛偽的熾熱理性》
 * 6 slides — images: /assets/Stories/Story2/Haruma/01–06.jpg
 */
export const STORY2_HARUMA: Story = {
  id: "story2-haruma",
  type: "story",
  title: "日向陽真的灼熱理性",
  tagline: "太陽不消滅黑暗——它只是讓真相無所遁形。",
  cover: "/assets/Stories/Story2/Haruma/06.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Haruma/01.jpg",
      act: "第四章：日向陽真 ☀️ Helios (赫利奧斯)——《正義與太陽：灼燒虛偽的熾熱理性》",
      text: "烈陽殿外，楓葉烈烈燃燒，黃金日光直逼屋頂。陽真盯著桌上那份虛假的香油錢帳目，冷笑著。他討厭這世界的偽善——每一分假惺惺，都讓他想把這一切燒成灰燼。就在此刻，大殿屋頂彷彿化為金色的火海，一股震天的轟鳴從高空刺破而來。",
      glowRGB: SOLAR_AMBER,
    },
    {
      image: "/assets/Stories/Story2/Haruma/02.jpg",
      text: "四匹噴火神駒拉著太陽戰車，轟然破空而降！車上站著一位渾身散發著耀眼金光、眼神高傲犀利的太陽神，強光刺得人無法直視。「凡人！你那雙眼睛看透了無數謊言——為什麼不敢用我的烈陽，把那些虛偽徹底燒成灰燼？」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Haruma/03.jpg",
      text: "陽真頂著強光，直視神明，眼神同樣傲慢不馴。「燒光了又怎樣？人類明天還是會編出新的謊言。」",
      glowRGB: SOLAR_AMBER,
    },
    {
      image: "/assets/Stories/Story2/Haruma/04.jpg",
      text: "赫利奧斯狂妄地大笑，神光大盛：「意義？太陽每天升起，不是為了消滅黑暗，而是為了告訴世界：真相，永遠在光芒之中！既然他們喜歡逃避現實，你就用最熾熱的邏輯，把他們的藉口狠狠戳破！痛楚，才是清醒的開始！」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Haruma/05.jpg",
      text: "烈日化作兩張燃燒的黃金牌：「正義」與「太陽」。「正義是絕對的理性與切斷謊言的利刃；太陽是無所隱藏的真相。陽真——用你的毒舌，把那些裝睡的靈魂給我電醒！」",
      glowRGB: SOLAR_AMBER,
    },
    {
      image: "/assets/Stories/Story2/Haruma/06.jpg",
      text: "陽真接過燙手的黃金牌，嘴角勾起一抹危險的笑：「正合我意。戳破別人的幻想，可是我最擅長的事。」陽真看著掌心那兩張微微燙手的牌，沉默了很久。他一直以為自己只是個喜歡挑人毛病的刻薄鬼——但原來，那份刻薄背後藏著的，是對真相最純粹的偏執與愛。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Haruma/07.jpg",
      act: "尾聲：烈陽殿的毒舌導師",
      text: "從那天起，烈陽殿的屋脊在每個晴天都閃著若有若無的金光。來到這裡的人，往往帶著一個不願正視的藉口，離開時卻帶走了一個讓自己無法繼續逃避的事實。「嘖——看著這張牌，你還要繼續裝睡嗎？」沒有人能在陽真的眼神下撒謊，太陽不說謊，正義不饒人。",
      glowRGB: SOLAR_AMBER,
    },
  ],
};
