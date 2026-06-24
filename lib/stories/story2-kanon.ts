import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const SPRING_ROSE  = "210,130,155";  // cherry blossom / spring earth
const DIVINE_FLASH = "235,225,255";  // divine revelation moment

/**
 * Story 2 — Chapter 1: 天城花音 × Persephone (泊瑟芬)
 * 《愚者與死神：春天的破土前奏》
 * 4 slides — images: /assets/Stories/Story2/Kanon/01–04.jpg
 */
export const STORY2_KANON: Story = {
  id: "story2-kanon",
  type: "story",
  title: "天城花音的破土前奏",
  tagline: "心碎不是終點——那是靈魂為了開出更強大的花朵，所必須經歷的破土。",
  cover: "/assets/Stories/Story2/Kanon/04.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Kanon/01.jpg",
      act: "第一章：天城花音 🌸 Persephone (泊瑟芬)——《愚者與死神：春天的破土前奏》",
      text: "暴風雨過後，春之花園一片狼藉，玫瑰的花瓣散落在泥濘之中。天城花音跪在溼透的土地上，看著被打爛的花，眼淚順著臉頰滑落。「我好沒用……我拯救不了它們，就像我救不了那些心碎的人一樣……」",
      glowRGB: SPRING_ROSE,
    },
    {
      image: "/assets/Stories/Story2/Kanon/02.jpg",
      text: "就在這時，泥土裡突然冒出一道溫暖的綠光——一位頭戴石榴花冠、雙眸如大地般深邃的女神，從光芒中緩緩走來。泊瑟芬輕輕捧起一束枯枝，枯枝在祂手中化為飛灰，而泥土裡，悄悄冒出了一抹新綠。「傻孩子。在冥界的那半年，我也曾以為生命徹底結束了。」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Kanon/03.jpg",
      text: "「但你必須明白——『死亡』只是另一種形式的沉睡，而『心碎』是靈魂為了開出更強大的花朵，所必須經歷的破土過程。」女神輕輕一指，一張「愚者」與「死神」的塔羅牌，懸浮在花音面前，散發著春日的溫柔金光。死神不是終點，而是春天的前奏。",
      glowRGB: SPRING_ROSE,
    },
    {
      image: "/assets/Stories/Story2/Kanon/04.jpg",
      text: "「花音，去告訴那些心碎的人，他們的痛苦正在泥土裡發芽，而你，將是帶給他們春天的風。」花音接過發光的牌，眼中的淚光漸漸變成了星光，眼神第一次變得無比堅定：「……我懂了。我不怕黑夜了，我要幫他們種下重生的種子！」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Kanon/05.jpg",
      act: "尾聲：春之花園的永恆陪伴",
      text: "從那天起，春之花園的角落裡永遠擺著一瓶鮮花，不管什麼季節都有花開著。每一個帶著碎裂心情走進神社的人，都會被花音那雙帶著溫柔星光的眼睛輕輕接住，聽見她說：「花音在這裡喔。不管多難過，都可以說出來。」——冬天真的會過去，花音讓每一個路過的人都真的相信了這件事。",
      glowRGB: SPRING_ROSE,
    },
  ],
};
