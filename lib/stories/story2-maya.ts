import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const MIDNIGHT_VOID = "115,75,195";  // absolute night sky
const DIVINE_FLASH  = "235,225,255"; // divine revelation moment

/**
 * Story 2 — Chapter 3: 九条萬夜 × Nyx (紐克斯)
 * 《女祭司與月亮：隱藏在絲絨下的靈魂寶藏》
 * 6 slides — images: /assets/Stories/Story2/Maya/01–06.jpg
 */
export const STORY2_MAYA: Story = {
  id: "story2-maya",
  type: "story",
  title: "九条萬夜的午夜祕典",
  tagline: "光芒讓人看清世界，但唯有黑夜，能讓人看清自己。",
  cover: "/assets/Stories/Story2/Maya/05.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Maya/01.jpg",
      act: "第三章：九条萬夜 🌌 Nyx (紐克斯)——《女祭司與月亮：隱藏在絲絨下的靈魂寶藏》",
      text: "沒有一絲光線，連繁星都隱沒的夜星庭中，萬夜獨自坐在絕對的黑暗裡。她看透了太多人性的醜陋，那些潛意識裡的業力、恐懼與背叛，壓得她無法呼吸。她覺得自己是個被世界遺棄的影子。「黑夜，難道只是罪惡的遮羞布嗎？」",
      glowRGB: MIDNIGHT_VOID,
    },
    {
      image: "/assets/Stories/Story2/Maya/02.jpg",
      text: "黑暗中突然張開了一雙巨大的紫黑色羽翼，一位彷彿由星塵與虛無凝聚而成的古老女神緩緩降臨。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Maya/03.jpg",
      text: "紐克斯的懷抱無比冰冷，卻無比安全。祂輕輕將萬夜摟入懷中，剎那間，黑夜中亮起了漫天極光與業力漣漪，無聲地在黑暗裡流動。「光芒讓人看清世界，但唯有黑夜，能讓人看清自己。恐懼、夢境與前世的相遇，都是靈魂隱藏在絲絨下的寶藏。黑夜不是罪惡——黑夜是萬物最溫柔的子宮，治癒一切白晝受的傷。」",
      glowRGB: MIDNIGHT_VOID,
    },
    {
      image: "/assets/Stories/Story2/Maya/04.jpg",
      text: "女神抬手，「女祭司」與「月亮」帶著神秘紫光緩緩飄落。「月亮代表潛意識的迷霧，女祭司代表靜謐的直覺。萬夜，去成為深夜的阿卡西紀錄者。當凡人在迷茫中哭泣時，引導他們走進黑夜，在安靜中解開三世的結。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Maya/05.jpg",
      text: "萬夜看著手中沉靜的牌，眼底的冰霜，緩緩化作了星光。紐克斯的身影在紫色光芒中漸漸消散，留下的只有那兩張微微發光的牌，以及漫天盪漾的業力漣漪。萬夜久久坐在黑暗中，第一次沒有感到恐懼。她意識到，她一直以為是詛咒的能力，那份看穿黑暗的眼，其實是女神給她的神聖禮物。",
      glowRGB: MIDNIGHT_VOID,
    },
    {
      image: "/assets/Stories/Story2/Maya/06.jpg",
      act: "尾聲：夜星庭的守護者",
      text: "從此，每當凌晨的夜星庭燃起幽幽燭光，萬夜的身影便出現在那裡。她不再逃避那些湧來的情緒與夢境，而是將它們化為引路的星光。「黑夜不是敵人，安靜，也是一種答案。」這句話，成了她給每一個深夜迷途的靈魂，最溫柔的指引。",
      glowRGB: DIVINE_FLASH,
    },
  ],
};
