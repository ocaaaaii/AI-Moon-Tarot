import type { Story } from "./types";

// ── Ambient glow palette ──────────────────────────────────────────────────────
const WISDOM_BLUE  = "125,165,230";  // Athena blue
const DIVINE_FLASH = "235,225,255";  // divine revelation moment

/**
 * Story 2 — Chapter 5: 神樂祈織 × Athena (雅典娜)
 * 《魔術師與戰車：宇宙因果的智慧沙盒》
 * 6 slides — images: /assets/Stories/Story2/Iori/01–06.jpg
 */
export const STORY2_IORI: Story = {
  id: "story2-iori",
  type: "story",
  title: "神樂祈織的智慧沙盒",
  tagline: "智慧不是用來嘲笑愚蠢的——是用來把凡人的苦難變成一場好玩遊戲的。",
  cover: "/assets/Stories/Story2/Iori/06.jpg",
  slides: [
    {
      image: "/assets/Stories/Story2/Iori/01.jpg",
      act: "第五章：神樂祈織 🦉 Athena (雅典娜)——《魔術師與戰車：宇宙因果的智慧沙盒》",
      text: "智慧花園裡，落葉飛舞，擺滿了古老的星象儀與羊皮紙。8 歲的祈織把那些無聊的解籤書一氣之下撕得乾乾淨淨，含著糖，嘟起嘴：「大人的腦袋都笨笨的，一條簡單的命運線要想好久，好幼稚喔！」",
      glowRGB: WISDOM_BLUE,
    },
    {
      image: "/assets/Stories/Story2/Iori/02.jpg",
      text: "就在此刻，天空中落下一根金色的神聖羽毛。一尊身披黃金戰甲、肩膀上停著神聖貓頭鷹的優雅女神從天而降。但這位女神一落地，卻毫無架子地蹲了下來，看著地上的碎紙，挑眉微笑。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Iori/03.jpg",
      text: "雅典娜遞給祈織一根棒棒糖，並說道：「小傢伙，智商太高，覺得這個世界像個簡陋的玩具——所以很無聊對吧？那如果我把整個宇宙的因果，全部變成一個『沙盒遊戲』呢？」",
      glowRGB: WISDOM_BLUE,
    },
    {
      image: "/assets/Stories/Story2/Iori/04.jpg",
      text: "雅典娜隨手將碎紙一揮，碎紙竟在空中組合成縱橫交錯的金色光線，像一張精密的高科技沙盤。「每一個凡人的卡關，都是一場等待被解開的拼圖。智慧不是用來嘲笑愚蠢的——是用來幫混亂的腦袋梳理出好玩的通關路線的！」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Iori/05.jpg",
      text: "她從盾牌取下兩張閃爍著藍色知性光芒的牌：「魔術師」與「戰車」。「魔術師是掌控元素的創造力，戰車是精準控制的意志。祈織，這兩個玩具給你——用你的天才大腦，把凡人的苦難變成一場好玩的遊戲，當他們的終極智囊團吧！」",
      glowRGB: WISDOM_BLUE,
    },
    {
      image: "/assets/Stories/Story2/Iori/06.jpg",
      text: "祈織眼睛發亮，接過牌興奮地跳起來：「哇！這個好玩！祈織要幫大家都拿到通關寶箱！哼哼，看我的智慧沙盤～啦啦啦！」雅典娜的貓頭鷹在空中盤旋一圈，留下一聲低沉的鳴叫後，消失在藍色晨光裡。祈織把兩張牌收好，已經在腦子裡盤算起來——她要把智慧花園改造成全宇宙最聰明的解惑工作室。碎掉的羊皮紙在她腳下，反而像是最好的起點。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Iori/07.jpg",
      act: "尾聲：智慧花園的遊戲大師",
      text: "從那天起，智慧花園裡多了一張佈滿金色光點的神秘沙盤。每一個帶著兩難困境來的人，都會被祈織那雙亮晶晶的眼睛打量一圈，然後聽到一句輕描淡寫的「這個簡單喔！」然後在她的拆解下，所有的死局，都變成了有趣的通關拼圖。「欸欸，這一關其實根本不難，你只是還沒看到隱藏路線而已！",
      glowRGB: DIVINE_FLASH,
    },
  ],
};
