import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const DAWN_GOLD    = "235,195,115";  // first light of dawn
const DIVINE_FLASH = "235,225,255";  // divine revelation moment

/**
 * Story 2 — Chapter 6: 東雲曉 × Eos (鄂歐絲)
 * 《世界與審判：漫長黑夜後的晨曦祝福》
 * 6 slides — images: /assets/Stories/Story2/Akira/01–06.jpg
 */
export const STORY2_AKIRA: Story = {
  id: "story2-akira",
  type: "story",
  title: "東雲曉的晨曦祝福",
  tagline: "黎明的美麗，不在於它有多耀眼，而在於不論黑夜多漫長，它都一定會再次造訪。",
  cover: "/assets/Stories/Story2/Akira/06.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Akira/01.jpg",
      act: "第六章：東雲曉 🌅 Eos (鄂歐絲)——《世界與審判：漫長黑夜後的晨曦祝福》",
      text: "黎明庭園的薄霧尚未散去，晨光還只是地平線上一道微弱的金邊。曉看著銅鏡裡滿頭白髮與歲月刻下的深深紋路，長嘆一口氣。七十八個年頭的滄桑，無數次的崩塌與重建——此刻，他竟自覺已走到了人生的黃昏，無力再承載什麼。",
      glowRGB: DAWN_GOLD,
    },
    {
      image: "/assets/Stories/Story2/Akira/02.jpg",
      text: "東方地平線突然炸開萬道絢麗的玫瑰色與金色霞光。黎明女神鄂歐絲踩著晨曦、手持驅散黑夜的神杖優雅降臨，眼神充滿了對生命無盡的慈悲。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Akira/03.jpg",
      text: "「老者啊，你為何在黎明前嘆息？」曉微微躬身：「女神啊，老夫這殘軀已走過太多巨變，見證過太多失敗，自覺已無力量指引後輩……」",
      glowRGB: DAWN_GOLD,
    },
    {
      image: "/assets/Stories/Story2/Akira/04.jpg",
      text: "女神溫柔地將手指點在曉的胸口，傳遞神杖的力量。剎那間，他蒼老的身軀湧出宏大而厚重的金色能量。「不——正因為你經歷過漫長的黑夜、見證過無數次的崩塌，你才是那個最懂得『重生』代價的人。黎明的美麗，不在於它有多耀眼，而在於不論黑夜多漫長，它都一定會再次造訪。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Akira/05.jpg",
      text: "隨著金光乍現，女神手中凝聚出「世界」與「審判」。「世界是完美的終點與圓滿，審判是靈魂的覺醒與救贖。曉，去成為那些遭遇重大挫折、失去信念者的避風港。用你的歲月，為他們的靈魂注入永不熄滅的曙光祝福。」",
      glowRGB: DAWN_GOLD,
    },
    {
      image: "/assets/Stories/Story2/Akira/06.jpg",
      text: "曉握緊神杖，眼中含淚，聲音卻洪亮而堅定：「老夫明白了。只要這世間還有人受苦，老夫的晨曦祝福，就絕不熄滅！」鄂歐絲的霞光在天邊緩緩收攏，晨霧漸漸散去，露出了整個黎明庭園清澈的輪廓。曉站在那裡，將那兩張牌輕輕壓在胸口。那裡有他一生走過的每一道黑夜，也有每一道他親眼見證的黎明。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Akira/07.jpg",
      act: "尾聲：黎明庭園的老守門人",
      text: "此後，黎明庭園的石燈在最深的黑夜裡從不熄滅，因為有個白髮老者總是在那裡靜靜守候。凡是帶著崩塌信念前來的人，都會聽到他那沉穩如山的聲音：「抬起頭，看著老夫的眼睛。你已經站起來了。」",
      glowRGB: DAWN_GOLD,
    },
  ],
};
