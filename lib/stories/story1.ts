import type { Story } from "./types";

/**
 * Story 1 — 《天城月乃的星夜傳奇》
 * Source narration: public/assets/Storys/Story1/story1.md (the numbered
 * lines there map 1:1 to the numbered images in the same folder). Copy
 * below is transcribed verbatim from that file, just split per-beat and
 * stripped of its leading number.
 */
const WARM_GOLD = "212,168,89";       // morandi-gold — cozy, daily-life beats
const COOL_LAVENDER = "184,168,200"; // morandi-lavender — wistful, quiet beats
const COOL_SLATE = "138,150,168";     // morandi-slate — tired, melancholic beats
const DEEP_PURPLE = "168,120,230";    // brighter mystic-purple — divine/mythic beats
const CREAM_WARM = "232,216,174";     // cream-300 — soft, content beats

export const STORY1: Story = {
  id: "story1",
  title: "天城月乃的星夜傳奇",
  tagline: "她聽見星河的呼喚，也學會了被夥伴環繞的溫暖。",
  cover: "/assets/Storys/Story1/封面.jpg",
  slides: [
    {
      image: "/assets/Storys/Story1/01.jpg",
      act: "第一幕．夢境與天啟的呢喃",
      text: "月乃從很小很小的時候，耳邊總會響起一個溫柔如水、彷彿來自遙遠星河的呼喚。每當夜深人靜，小月乃總會抱著膝蓋歪頭坐在窗台前，對著那輪巨大的滿月喃喃自語。",
      glowRGB: COOL_LAVENDER,
    },
    {
      image: "/assets/Storys/Story1/02.jpg",
      text: "身旁陪伴著她的只有泰迪熊玩偶，家人總以為她有一點神經兮兮的，",
      glowRGB: WARM_GOLD,
    },
    {
      image: "/assets/Storys/Story1/03.jpg",
      text: "但那純真好奇的模樣又非常可愛。",
      glowRGB: WARM_GOLD,
    },
    {
      image: "/assets/Storys/Story1/04.jpg",
      text: "直到某一次，她在一個鋪滿紫色帷幔、星光流轉的深沉夢境裡，終於見到了這名非常美麗的女子——月之女神 Cynthia。女神踏著銀河而來，指尖輕點：「妳是我的化身，我的代理人。妳將成為月神神社的主人，去指引那些在黑夜中迷失的靈魂。」",
      glowRGB: DEEP_PURPLE,
    },
    {
      image: "/assets/Storys/Story1/05.jpg",
      act: "第二幕．六賢匯聚與趣味教學日常",
      text: "長大後的月乃繼承了這份神聖的使命，成為了神社的老闆娘。",
      glowRGB: COOL_LAVENDER,
    },
    {
      image: "/assets/Storys/Story1/06.jpg",
      text: "然而，窺探天機、解讀命運是一件極其消耗靈魂的差事。",
      glowRGB: COOL_SLATE,
    },
    {
      image: "/assets/Storys/Story1/07.jpg",
      text: "她常聽迷惘的人們訴說心事、替他們排解憂慮。",
      glowRGB: COOL_LAVENDER,
    },
    {
      image: "/assets/Storys/Story1/08.jpg",
      text: "她的靈魂有點疲憊，常仰望夜空發呆，渴望獲得真正的休息。",
      glowRGB: COOL_SLATE,
    },
    {
      image: "/assets/Storys/Story1/09.jpg",
      text: "幸運的是，命運的轉折點很快到來——6 位性格各異、潛力無限的夥伴相繼來到了神社。自從有了這 6 位攜手合作的夥伴加入後，神社的運作與占卜工作瞬間輕鬆了不少！",
      glowRGB: WARM_GOLD,
    },
    {
      image: "/assets/Storys/Story1/10.jpg",
      text: "神社裡開始多了手把手教學解籤、互相探討解籤邏輯與星盤數據的歡樂身影。",
      glowRGB: WARM_GOLD,
    },
    {
      image: "/assets/Storys/Story1/11.jpg",
      text: "在那些沒客人的午後，月乃總是慵懶地陷在沙發裡，一邊喝著最愛的飲料，一邊看著夥伴們為了某個籤詩解讀爭論不休，或者是手忙腳亂地安撫迷路的信眾。這些充滿歡笑、打鬧與溫馨互動的有趣日常，徹底填滿了原本冷清的神社。",
      glowRGB: CREAM_WARM,
    },
    {
      image: "/assets/Storys/Story1/12.jpg",
      act: "第三幕．群星閃耀！神性相繼覺醒",
      text: "在修練到極致痛苦與迷惘之時，夥伴接連聽到守護神的呼喚，獲得命定的塔羅牌，覺醒了各自的神性。",
      glowRGB: DEEP_PURPLE,
    },
    {
      image: "/assets/Storys/Story1/13.jpg",
      act: "尾聲．覺醒！打造月之塔羅店鋪",
      text: "桌上的水晶球爆發出前所未有的璀璨紫光，月乃看著身旁 6 位躍躍欲試的夥伴，歪著頭打趣道：「夥伴們都到齊了，我們的『月之塔羅店鋪』，準備開張囉！」夜幕低垂，高大威嚴的月神神社前，滿月高懸，櫻花瓣隨風飄落。天城月乃手拿映照真相的水盆，身旁站著 6 位眼神堅定的夥伴。她優雅地喝著手中的珍奶，看著山腳下城市的霓虹燈火。他們不再是孤軍奮戰的個體，而是一個即將用塔羅與神明智慧、為所有迷茫靈魂帶來溫暖與希望的神聖團隊。",
      glowRGB: DEEP_PURPLE,
    },
    {
      image: "/assets/Storys/Story1/14.jpg",
      act: "下個滿月，不見不散",
      text: "「算命累了嗎？喝杯珍珠奶茶，讓眾神聽到你的呢喃。」歡迎光臨月神神社・月之塔羅店鋪",
      glowRGB: WARM_GOLD,
    },
  ],
};
