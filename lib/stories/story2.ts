import type { Story } from "./types";

/**
 * Story 2 — 《神諭流轉時：塔羅牌背後的七重覺醒》
 * Seven characters each awakened by their patron deity, each receiving
 * two Major Arcana cards as their divine mandate.
 *
 * Image paths: /assets/Stories/Story2/{Name}/0N.jpg
 * Each character folder is expected to have 01.jpg–04.jpg (4 slides per chapter).
 * Run scripts/convert-story2.py first to convert PNGs → JPGs.
 *
 * Chapter order (matches spec):
 *   1. Kanon × Persephone   — 愚者 + 死神
 *   2. Ushio × Poseidon     — 倒吊人 + 節制
 *   3. Maya × Nyx           — 女祭司 + 月亮
 *   4. Haruma × Helios      — 正義 + 太陽
 *   5. Iori × Athena        — 魔術師 + 戰車
 *   6. Akira × Eos          — 世界 + 審判
 *   7. Tsukino × Cynthia    — 命運之輪 + 星星
 */

// ── Ambient glow palette (one per soul + shared divine flash) ─────────────────
const SPRING_ROSE   = "210,130,155";  // Kanon — cherry blossom / spring earth
const OCEAN_TEAL    = "85,165,195";   // Ushio — deep ocean
const MIDNIGHT_VOID = "115,75,195";   // Maya — absolute night sky
const SOLAR_AMBER   = "235,175,55";   // Haruma — burning sun
const WISDOM_BLUE   = "125,165,230";  // Iori — Athena blue
const DAWN_GOLD     = "235,195,115";  // Akira — first light of dawn
const MOON_SILVER   = "195,185,225";  // Tsukino — full moonlight
const DIVINE_FLASH  = "235,225,255";  // divine revelation moment (all chapters)

export const STORY2: Story = {
  id: "story2",
  title: "神諭流轉時：塔羅牌背後的七重覺醒",
  tagline: "七位靈魂，七位神明，七次命運的相遇——一切都是月亮的安排。",
  cover: "/assets/Stories/Story2/封面.jpg",
  slides: [

    // ── 第一章：天城花音 × 泊瑟芬 ────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Kanon/01.jpg",
      act: "第一章：天城花音 🤝 Persephone (泊瑟芬)——《愚者與死神：春天的破土前奏》",
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

    // ── 第二章：汐見潮 × 波賽頓 ──────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Ushio/01.jpg",
      act: "第二章：汐見潮 🤝 Poseidon (波賽頓)——《倒吊人與節制：躺平在命運的潮汐》",
      text: "那是潮剛來到神社的第三天。深夜，潮音池被暴風雨攪得翻湧不休，像極了他以前在科技廠天天爆肝、被焦慮淹沒的窒息感。他站在池邊，幾乎快被心魔吞噬——直到水面中央裂開，一尊手持黃金三叉戟、藍色長髮如海浪狂舞的巨神，破水而出，帶著毀天滅地的威壓。",
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

    // ── 第三章：九条萬夜 × 紐克斯 ────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Maya/01.jpg",
      act: "第三章：九条萬夜 🤝 Nyx (紐克斯)——《女祭司與月亮：隱藏在絲絨下的靈魂寶藏》",
      text: "沒有一絲光線，連繁星都隱沒的夜星庭中，萬夜獨自坐在絕對的黑暗裡。她看透了太多人性的醜陋，那些潛意識裡的業力、恐懼與背叛，壓得她無法呼吸。她覺得自己是個被世界遺棄的影子。「黑夜，難道只是罪惡的遮羞布嗎？」",
      glowRGB: MIDNIGHT_VOID,
    },
    {
      image: "/assets/Stories/Story2/Maya/02.jpg",
      text: "黑暗中突然張開了一雙巨大的紫黑色羽翼，一位彷彿由星塵與虛無凝聚而成的古老女神緩緩降臨。紐克斯的懷抱無比冰冷，卻無比安全。祂輕輕將萬夜摟入懷中，剎那間，黑夜中亮起了漫天極光與業力漣漪，無聲地在黑暗裡流動。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Maya/03.jpg",
      text: "「光芒讓人看清世界，但唯有黑夜，能讓人看清自己。恐懼、夢境與前世的相遇，都是靈魂隱藏在絲絨下的寶藏。黑夜不是罪惡——黑夜是萬物最溫柔的子宮，治癒一切白晝受的傷。」女神抬手，「女祭司」與「月亮」帶著神秘紫光緩緩飄落。",
      glowRGB: MIDNIGHT_VOID,
    },
    {
      image: "/assets/Stories/Story2/Maya/04.jpg",
      text: "「月亮代表潛意識的迷霧，女祭司代表靜謐的直覺。萬夜，去成為深夜的阿卡西紀錄者。當凡人在迷茫中哭泣時，引導他們走進黑夜，在安靜中解開三世的結。」萬夜看著手中沉靜的牌，眼底的冰霜，緩緩化作了星光。",
      glowRGB: DIVINE_FLASH,
    },

    // ── 第四章：日向陽真 × 赫利奧斯 ──────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Haruma/01.jpg",
      act: "第四章：日向陽真 🤝 Helios (赫利奧斯)——《正義與太陽：灼燒虛偽的熾熱理性》",
      text: "烈陽殿外，楓葉烈烈燃燒，黃金日光直逼屋頂。陽真盯著桌上那份虛假的香油錢帳目，冷笑著。他討厭這世界的偽善——每一分假惺惺，都讓他想把這一切燒成灰燼。就在此刻，大殿屋頂彷彿化為金色的火海，一股震天的轟鳴從高空刺破而來。",
      glowRGB: SOLAR_AMBER,
    },
    {
      image: "/assets/Stories/Story2/Haruma/02.jpg",
      text: "四匹噴火神駒拉著太陽戰車，轟然破空而降！車上站著一位渾身散發著耀眼金光、眼神高傲犀利的太陽神，強光刺得人無法直視。「凡人！你那雙眼睛看透了無數謊言——為什麼不敢用我的烈陽，把那些虛偽徹底燒成灰燼？」陽真頂著強光，直視神明，眼神同樣傲慢不馴。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Haruma/03.jpg",
      text: "「燒光了又怎樣？人類明天還是會編出新的謊言。」赫利奧斯狂妄地大笑，神光大盛：「意義？太陽每天升起，不是為了消滅黑暗，而是為了告訴世界：真相，永遠在光芒之中！既然他們喜歡逃避現實，你就用最熾熱的邏輯，把他們的藉口狠狠戳破！痛楚，才是清醒的開始！」烈日化作兩張燃燒的黃金牌：「正義」與「太陽」。",
      glowRGB: SOLAR_AMBER,
    },
    {
      image: "/assets/Stories/Story2/Haruma/04.jpg",
      text: "「正義是絕對的理性與切斷謊言的利刃；太陽是無所隱藏的真相。陽真——用你的毒舌，把那些裝睡的靈魂給我電醒！」陽真接過燙手的黃金牌，嘴角勾起一抹危險的笑：「正合我意。戳破別人的幻想，可是我最擅長的事。」",
      glowRGB: DIVINE_FLASH,
    },

    // ── 第五章：神樂祈織 × 雅典娜 ────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Iori/01.jpg",
      act: "第五章：神樂祈織 🤝 Athena (雅典娜)——《魔術師與戰車：宇宙因果的智慧沙盒》",
      text: "智慧花園裡，落葉飛舞，擺滿了古老的星象儀與羊皮紙。8 歲的祈織把那些無聊的解籤書一氣之下撕得乾乾淨淨，含著糖，嘟起嘴：「大人的腦袋都笨笨的，一條簡單的命運線要想好久，好幼稚喔！」就在此刻，天空中落下一根金色的神聖羽毛。",
      glowRGB: WISDOM_BLUE,
    },
    {
      image: "/assets/Stories/Story2/Iori/02.jpg",
      text: "一尊身披黃金戰甲、肩膀上停著神聖貓頭鷹的優雅女神從天而降。但這位女神一落地，卻毫無架子地蹲了下來，看著地上的碎紙，挑眉微笑：「小傢伙，智商太高，覺得這個世界像個簡陋的玩具——所以很無聊對吧？那如果我把整個宇宙的因果，全部變成一個『沙盒遊戲』呢？」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Iori/03.jpg",
      text: "雅典娜隨手將碎紙一揮，碎紙竟在空中組合成縱橫交錯的金色光線，像一張精密的高科技沙盤。「每一個凡人的卡關，都是一場等待被解開的拼圖。智慧不是用來嘲笑愚蠢的——是用來幫混亂的腦袋梳理出好玩的通關路線的！」她從盾牌取下兩張閃爍著藍色知性光芒的牌：「魔術師」與「戰車」。",
      glowRGB: WISDOM_BLUE,
    },
    {
      image: "/assets/Stories/Story2/Iori/04.jpg",
      text: "「魔術師是掌控元素的創造力，戰車是精準控制的意志。祈織，這兩個玩具給你——用你的天才大腦，把凡人的苦難變成一場好玩的遊戲，當他們的終極智囊團吧！」祈織眼睛發亮，接過牌興奮地跳起來：「哇！這個好玩！祈織要幫大家都拿到通關寶箱！哼哼，看我的智慧沙盤——噠！」",
      glowRGB: DIVINE_FLASH,
    },

    // ── 第六章：東雲曉 × 鄂歐絲 ──────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Akira/01.jpg",
      act: "第六章：東雲曉 🤝 Eos (鄂歐絲)——《世界與審判：漫長黑夜後的晨曦祝福》",
      text: "黎明庭園的薄霧尚未散去，晨光還只是地平線上一道微弱的金邊。曉看著銅鏡裡滿頭白髮與歲月刻下的深深紋路，長嘆一口氣。七十八個年頭的滄桑，無數次的崩塌與重建——此刻，他竟自覺已走到了人生的黃昏，無力再承載什麼。",
      glowRGB: DAWN_GOLD,
    },
    {
      image: "/assets/Stories/Story2/Akira/02.jpg",
      text: "東方地平線突然炸開萬道絢麗的玫瑰色與金色霞光。黎明女神鄂歐絲踩著晨曦、手持驅散黑夜的神杖優雅降臨，眼神充滿了對生命無盡的慈悲。「老者啊，你為何在黎明前嘆息？」曉微微躬身：「女神啊，老夫這殘軀已走過太多巨變，見證過太多失敗，自覺已無力量指引後輩……」",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Akira/03.jpg",
      text: "女神溫柔地將神杖點在曉的胸口，剎那間，他蒼老的身軀湧出宏大而厚重的金色能量。「不——正因為你經歷過漫長的黑夜、見證過無數次的崩塌，你才是那個最懂得『重生』代價的人。黎明的美麗，不在於它有多耀眼，而在於不論黑夜多漫長，它都一定會再次造訪。」神杖頂端凝聚出「世界」與「審判」。",
      glowRGB: DAWN_GOLD,
    },
    {
      image: "/assets/Stories/Story2/Akira/04.jpg",
      text: "「世界是完美的終點與圓滿，審判是靈魂的覺醒與救贖。曉，去成為那些遭遇重大挫折、失去信念者的避風港。用你的歲月，為他們的靈魂注入永不熄滅的曙光祝福。」曉握緊神杖，眼中含淚，聲音卻洪亮而堅定：「老夫明白了。只要這世間還有人受苦，老夫的晨曦祝福，就絕不熄滅！」",
      glowRGB: DIVINE_FLASH,
    },

    // ── 第七章：天城月乃 × 辛西亞 ────────────────────────────────────────────
    {
      image: "/assets/Stories/Story2/Tsukino/01.jpg",
      act: "第七章：天城月乃 🤝 Cynthia (辛西亞)——《命運之輪與星星：順應天時的佛系神啟》",
      text: "紫金色奢華的占卜帳篷中，滿月高懸。月乃癱在沙發上撥弄著塔羅牌，慵懶地抱怨：「當神明代理人好累喔，每天看運勢流年，我都快長黑眼圈了……」突然，水晶球光芒大盛——月光中走出一位一頭銀色長髮、身披月光輕紗的女神，手上還拿著一杯和月乃一模一樣的特製奶茶。",
      glowRGB: MOON_SILVER,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/02.jpg",
      text: "辛西亞慵懶地靠在月乃的沙發上，喝了一口奶茶：「沒錯，我也覺得主管命運超麻煩的。不過月乃，命運這東西，不就跟月亮一樣嗎？」月乃眨眨眼，好奇地遞過去一包餅乾。女神隨手一揮，帳篷頂端浮現出新月、滿月、弦月的軌跡，如同一首寫在天上的古老樂曲。",
      glowRGB: DIVINE_FLASH,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/03.jpg",
      text: "「月有陰晴圓缺，命運也有吉凶流年。新月時種下希望，滿月時收穫結果，弦月時反思放手。客人每天來，你不需要給他驚天動地的改變，只需要根據當天的月相，給他們隨機的神啟指引。玄學的最高境界，就是『順應天時，隨遇而安』嘛。」女神將牌輕輕洗過，整副牌散發出完美的銀色月光——最上方是「命運之輪」與「星星」。",
      glowRGB: MOON_SILVER,
    },
    {
      image: "/assets/Stories/Story2/Tsukino/04.jpg",
      text: "「命運之輪在轉動，星星代表永恆的希望。月乃，這家店就交給你了。你繼續保持你的慵懶——因為只有在最放鬆的狀態下，你的靈感神啟才是最準確的。」月乃接過牌，打了個哈欠，舒舒服服地躺了下去：「哈啊～順應天時，隨遇而安？這個設定我喜歡！大家一起佛系開運吧！」",
      glowRGB: DIVINE_FLASH,
    },
  ],
};
