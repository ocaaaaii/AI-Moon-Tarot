/**
 * Tarot spread registry — the single source of truth for every spread.
 *
 * Same pattern as `avatars.ts` and `lib/stories/stories.ts`: adding a spread
 * means adding one entry here, not touching the API route or the UI.
 *
 * Three things used to live in three different places and disagree:
 *
 *   · how many cards a spread uses — a literal union in ChatInterface and a
 *     `maxCards = isChakra ? 7 : 3` in the reading route;
 *   · what the card positions are called — sent up from the browser as a
 *     free-text array and dropped straight into the model's prompt, so any
 *     caller with curl could write the "position labels" themselves;
 *   · whether a spread is the chakra one — inferred from `cards.length === 7`.
 *
 * All three now derive from an entry in this file, which is server-side data
 * the client cannot author. The client sends a `spreadId` and nothing else
 * about the spread.
 */

/** How the cards for this spread get chosen. */
export type SpreadDrawMode =
  /** the visitor picks from the full 78 */
  | "manual"
  /** 天地人: three phases, one card each from majors / numbered / court */
  | "category"
  /** 七脈輪: seven cards, Major Arcana only */
  | "chakra";

/** Named board backdrops, drawn as inline SVG in the persona's accent. */
export type BackdropId =
  | "none"
  | "moon-phases"
  | "solar-cross"
  | "puzzle-grid"
  | "tide-wave"
  | "dawn-rays"
  | "night-well"
  | "bloom-vines";

export interface SpreadPosition {
  /** e.g. 「新月（盲點）」 — shown under the card and sent to the model */
  label: string;
  /** one line revealed as the card turns over */
  hint: string;
  /** where this card sits on the board, as a fraction of the board box */
  x: number;
  y: number;
}

export interface TarotSpread {
  id: string;
  label: string;
  /** the small line under the label in the picker */
  sub: string;
  /** when to reach for this spread — also the recommendation's reason */
  bestFor: string;
  /** card count is `positions.length`; it is never stored separately */
  positions: SpreadPosition[];
  drawMode: SpreadDrawMode;
  /** avatar id when this spread belongs to one master; absent means generic */
  signatureOf?: string;
  backdrop: BackdropId;
  /** board width ÷ height, so a column spread can be tall and a row wide */
  aspect: number;
  /** card width as a fraction of board width */
  cardScale: number;
  /** px ceiling for the board. A column spread needs a narrow one or its
   *  height runs away; a row spread wants the room. */
  maxWidth: number;
  /**
   * How to walk this spread when reading it. Appended after the persona's
   * voice and the shared `READING_RULES`, and it replaces the default section
   * structure — that is what makes a signature spread read differently rather
   * than merely sound different.
   *
   * Absent means the persona uses their own default sections.
   */
  readingGuide?: string;
}

const CHAKRA_LABELS = ["海底輪", "臍輪", "太陽神經叢", "心輪", "喉輪", "眉心輪", "頂輪"] as const;
const CHAKRA_HINTS = [
  "生存感與安全感",
  "情感流動與慾望",
  "自我價值與行動力",
  "愛與連結",
  "表達與真話",
  "洞察與直覺",
  "與更大的意義的連結",
] as const;

/**
 * Two columns, each read upward: the lower four chakras on the left, the upper
 * three on the right, starting one slot higher so the right column visibly
 * begins above the left.
 *
 * A single column of seven is the truer picture of a spine, and it is what
 * this was. The problem is arithmetic: seven cards stacked need roughly
 * `7 × cardHeight` of board, so at a readable card size the board ran to
 * ~1400px and at a sane height the cards shrank to 75px. Two columns need
 * four rows instead of seven, which buys back both — ~110px cards in ~830px
 * on a phone, where one column gave 82px cards in 1073px.
 */
const CHAKRA_ROW_Y = [0.88, 0.6267, 0.3733, 0.12];
const CHAKRA_POSITIONS: SpreadPosition[] = CHAKRA_LABELS.map((label, i) => ({
  label,
  hint: CHAKRA_HINTS[i],
  x: i < 4 ? 0.28 : 0.72,
  y: i < 4 ? CHAKRA_ROW_Y[i] : CHAKRA_ROW_Y[i - 3],
}));

/** Evenly spaced along one horizontal line — the plain reading of a sequence. */
function row(items: Array<[label: string, hint: string]>): SpreadPosition[] {
  const gap = 1 / (items.length + 1);
  return items.map(([label, hint], i) => ({ label, hint, x: gap * (i + 1), y: 0.5 }));
}

export const SPREADS: TarotSpread[] = [
  // ── generic, available to every master ────────────────────────────────────
  {
    id: "single",
    label: "單張指引",
    sub: "當下最需要的訊息",
    bestFor: "使用者在問題裡直接說了「只要一句話」「給我一個方向就好」「不用解釋那麼多」之類的話時；他沒有這樣明講就絕對不要選這個",
    positions: [{ label: "當下訊息", hint: "此刻最該被你看見的", x: 0.5, y: 0.5 }],
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.1,
    cardScale: 0.42,
    maxWidth: 260,
  },
  {
    id: "timeline",
    label: "時間軸",
    sub: "過去 · 現在",
    bestFor: "想看清一件事怎麼走到今天的",
    positions: row([
      ["過去", "帶你來到這裡的那段路"],
      ["現在", "你此刻真正站的位置"],
    ]),
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.7,
    cardScale: 0.3,
    maxWidth: 420,
  },
  {
    id: "choice",
    label: "選擇牌陣",
    sub: "選項 A · 選項 B",
    bestFor: "兩條路擺在眼前，想同時看見兩邊的訊息",
    positions: row([
      ["選項 A", "走這條路會展開的風景"],
      ["選項 B", "走另一條路會展開的風景"],
    ]),
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.7,
    cardScale: 0.3,
    maxWidth: 420,
  },
  {
    id: "past-present-future",
    label: "過去現在未來",
    sub: "過去 · 現在 · 未來",
    bestFor: "想看一件事的來龍去脈與可能的走向",
    positions: row([
      ["過去", "已經發生、仍在影響你的"],
      ["現在", "此刻的真實狀態"],
      ["未來", "順著現在走下去會遇見的"],
    ]),
    drawMode: "manual",
    backdrop: "none",
    aspect: 2.0,
    cardScale: 0.22,
    maxWidth: 460,
  },
  {
    id: "situation-challenge-advice",
    label: "情況挑戰建議",
    sub: "情況 · 挑戰 · 建議",
    bestFor: "想把一件事拆成「現在的情況／最大的阻礙／可以做的下一步」三塊來看時",
    positions: row([
      ["情況", "你現在面對的全貌"],
      ["挑戰", "真正擋住你的那一件事"],
      ["建議", "可以先做的那一步"],
    ]),
    drawMode: "manual",
    backdrop: "none",
    aspect: 2.0,
    cardScale: 0.22,
    maxWidth: 460,
  },
  {
    id: "mind-body-spirit",
    label: "心身靈",
    sub: "心 · 身 · 靈",
    bestFor: "想分別從心（情緒）、身（身體）、靈（更深的自己）三個層面各看一張時",
    positions: [
      { label: "心", hint: "情緒此刻的樣子", x: 0.24, y: 0.70 },
      { label: "身", hint: "身體正在替你承擔的", x: 0.76, y: 0.70 },
      { label: "靈", hint: "更深的那個你想說的", x: 0.50, y: 0.30 },
    ],
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.35,
    cardScale: 0.23,
    maxWidth: 400,
  },
  {
    id: "heaven-earth-human",
    label: "天地人診斷",
    sub: "課題 · 事件 · 心態",
    bestFor: "想從靈魂課題、現實事件、自身心態三層一起看",
    positions: [
      { label: "天（靈魂課題）", hint: "這段經歷想教你的", x: 0.5, y: 0.16 },
      { label: "地（現實事件）", hint: "現實層面正在發生的", x: 0.5, y: 0.84 },
      { label: "人（心態鏡子）", hint: "你看待它的方式", x: 0.5, y: 0.5 },
    ],
    // three phases: one major, one numbered minor, one court card
    drawMode: "category",
    backdrop: "none",
    aspect: 0.55,
    cardScale: 0.33,
    maxWidth: 300,
  },
  {
    id: "chakra",
    label: "七脈輪掃描",
    sub: "22 大牌 · 能量全身掃描",
    bestFor: "想做一次整體的能量體檢，看看哪裡堵住了",
    positions: CHAKRA_POSITIONS,
    drawMode: "chakra",
    backdrop: "none",
    aspect: 0.398,
    cardScale: 0.333,
    maxWidth: 380,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【七脈輪掃描】7 張大阿爾克納依序對應 7 個能量中心，由下而上。

**逐輪掃描** — 每個脈輪用 1-2 句描述當下能量狀態，整合牌義、正逆位、主色調（你已收到每張牌的 dominant_colors 資料）三者判讀。這裡可以提主色調，那是能量的線索，不是畫面描述。
**哪裡堵住了** — 在 7 張中找出 1-2 個最需要被看見的脈輪。逆位、暗色系大牌（高塔、月亮、寶劍系列等）、停滯類牌（吊人、聖杯四、隱者）往往是訊號，這是本次解讀的核心。
**能量怎麼流的** — 說出失衡如何從一個輪影響到另一個輪，給出整體圖像。不需逐輪敘述，找出因果鏈。
**調頻** — 聚焦 1-2 個核心脈輪，給出可落地的能量調整方向，用你自己的語言風格呈現。

脈輪位置與色彩對應：1 海底輪（紅）→ 行動力/安全感根基　2 臍輪（橙）→ 創造力/親密流動　3 太陽神經叢（黃）→ 自信/意志展現　4 心輪（綠）→ 自愛/接納慈悲　5 喉輪（藍）→ 真實表達/臣服　6 眉心輪（靛）→ 直覺/自我照見　7 頂輪（紫）→ 靈性整合/超越制約。

標題請用你自己的語氣重新命名這四段，但順序與功能不可以改。`,
  },

  // ── signature spreads, one per master ─────────────────────────────────────
  {
    id: "moon-mirror",
    label: "三段月相鏡像陣",
    sub: "新月 · 滿月 · 殘月",
    bestFor: "深夜迷茫、情緒紊亂、不確定自己到底要什麼時",
    positions: [
      { label: "新月（盲點）", hint: "你還沒意識到的真實感受", x: 0.17, y: 0.64 },
      { label: "滿月（鏡像）", hint: "這件事現階段最真實的全貌", x: 0.5, y: 0.26 },
      { label: "殘月（放下）", hint: "為了空出心，此刻該釋放的", x: 0.83, y: 0.64 },
    ],
    drawMode: "manual",
    signatureOf: "cynthia",
    backdrop: "moon-phases",
    aspect: 1.2,
    cardScale: 0.24,
    maxWidth: 440,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【三段月相鏡像陣】三段，標題就用下面這三個，加上你自己的開場與收尾共五段。

**月光落下之前** — 先說中他此刻的狀態，一句就好，不要提牌。
**新月：你還沒看見的** — 說出他自己沒意識到、但一直在影響他的那個感受。這是盲點，語氣要溫柔，不要像在指控。
**滿月：此刻真實的樣子** — 把這件事的全貌照清楚，包含他不想承認的部分。這是整段最誠實的地方。
**殘月：可以放下的** — 指出一個具體的、他抓著不放的東西，並說清楚放掉它會空出什麼。
**月亮會再亮起來** — 收尾，提醒他今天照出的只是此刻的月相。

三段之間要有月相的推移感：看不見 → 看清楚 → 願意放手。不要把三段寫成三個獨立段落。`,
  },
  {
    id: "solar-cross",
    label: "烈陽破曉十字陣",
    sub: "藉口 · 真相 · 盲區 · 曙光",
    bestFor: "拖延發作、自欺欺人、需要被強行敲醒時",
    positions: [
      { label: "藉口", hint: "你一直拿來安慰自己的假象", x: 0.18, y: 0.62 },
      { label: "真相", hint: "殘酷但你必須面對的核心", x: 0.5, y: 0.62 },
      { label: "盲區", hint: "你不敢跨出去的那一步", x: 0.82, y: 0.62 },
      { label: "曙光", hint: "現在立刻就能做的突破", x: 0.5, y: 0.20 },
    ],
    drawMode: "manual",
    signatureOf: "helios",
    backdrop: "solar-cross",
    aspect: 0.78,
    cardScale: 0.22,
    maxWidth: 400,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【烈陽破曉十字陣】四段，標題就用下面這四個。不要開場白，第一句就進去。

**你的藉口** — 直接說出他一直拿來安慰自己的那句話。要具體到他會愣住。
**真相** — 殘酷但必要的核心事實。這一段最短，也最重。不要鋪陳。
**你不敢跨的那一步** — 點名那個他明知道該做卻一直繞過的動作。
**今天就能做的事** — 一個今天、現在、二十四小時內做得到的具體行動。時間要說死，不要講「找個時間」。

全程不要安慰他。他來找你不是要被摸頭的。但最後一段要讓他知道你站在他那邊——用行動表達，不是用形容詞。`,
  },
  {
    id: "puzzle",
    label: "解謎拼圖陣",
    sub: "現狀 · 資源 · 陷阱 · 支線 · 破關",
    bestFor: "複雜決策、專案卡關、人生交叉路口的抉擇",
    positions: [
      { label: "現狀", hint: "這一關的魔王是誰", x: 0.5, y: 0.5 },
      { label: "資源", hint: "你手上已有的隱形道具", x: 0.19, y: 0.22 },
      { label: "陷阱", hint: "看似可行但會掉坑的那條", x: 0.81, y: 0.22 },
      { label: "支線", hint: "意想不到的新角度", x: 0.19, y: 0.78 },
      { label: "破關", hint: "通往最優解的關鍵拼圖", x: 0.81, y: 0.78 },
    ],
    drawMode: "manual",
    signatureOf: "athena",
    backdrop: "puzzle-grid",
    aspect: 1.0,
    cardScale: 0.24,
    maxWidth: 460,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【解謎拼圖陣】五段，標題就用下面這五個，加上你自己的收尾。

**這一關的魔王** — 用遊戲的語言重新描述他的處境，讓那個難題變得可以被拆。
**你身上已經有的道具** — 他忽略的資源、經驗或人脈。要具體點名，不要講「你的韌性」這種空話。
**看起來可行但會掉坑的那條** — 一個他很可能正想走、但你要攔下來的選項，說清楚坑在哪。
**支線** — 一個他完全沒想過的角度。這一段要讓他「欸」一聲。
**破關的那一塊** — 最關鍵的那一步，說清楚為什麼是它。
**存檔點** — 收尾，把難題還原成一個他能玩得下去的遊戲。

全程保持拆解的節奏：每一段都要比前一段更清楚，像在把一團線慢慢理直。`,
  },
  {
    id: "tide-current",
    label: "洋流潮汐陣",
    sub: "風浪 · 潛流 · 衝浪點",
    bestFor: "焦慮內耗、失去控制感、需要學會放手時",
    positions: [
      { label: "風浪", hint: "你正在硬撐著對抗的外在", x: 0.17, y: 0.28 },
      { label: "潛流", hint: "水面下不可逆的那股趨勢", x: 0.5, y: 0.68 },
      { label: "衝浪點", hint: "最省力的那個姿態", x: 0.83, y: 0.36 },
    ],
    drawMode: "manual",
    signatureOf: "poseidon",
    backdrop: "tide-wave",
    aspect: 1.15,
    cardScale: 0.26,
    maxWidth: 440,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【洋流潮汐陣】三段，標題就用下面這三個，加上你自己的開場與收尾。

**先別急** — 一兩句話，讓他先把呼吸放慢。不要分析。
**風浪：你在硬撐的** — 說出他正在對抗的那個外在情況，並承認它真的很吵。
**潛流：水面下真正在動的** — 指出那股他改變不了的趨勢。這一段是整篇的核心，要讓他理解「不是你不夠努力」。
**衝浪點：最省力的姿勢** — 一個具體的、把力氣收回來的做法。不是放棄，是換個施力點。
**浪會自己退** — 收尾，把他放回水裡，讓他知道他浮得起來。

全程用水的語言。不要催他行動——這個牌陣的重點是放手，不是使力。`,
  },
  {
    id: "dawn-prayer",
    label: "曙光祈願陣",
    sub: "夜色 · 晨星 · 轉折 · 黎明",
    bestFor: "遭受打擊、信心崩潰、感覺陷在低谷裡時",
    positions: [
      { label: "夜色", hint: "這段痛苦到底意味著什麼", x: 0.14, y: 0.8 },
      { label: "晨星", hint: "一直守著你的那點微光", x: 0.38, y: 0.6 },
      { label: "轉折", hint: "即將到來的機會或貴人", x: 0.62, y: 0.4 },
      { label: "黎明", hint: "走過去之後的那個你", x: 0.86, y: 0.2 },
    ],
    drawMode: "manual",
    signatureOf: "eos",
    backdrop: "dawn-rays",
    aspect: 1.0,
    cardScale: 0.21,
    maxWidth: 460,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【曙光祈願陣】四段，標題就用下面這四個，加上你自己的收尾。

**夜色：你走過的這一段** — 承認他受的苦是真的。不要急著給希望，先陪他站在暗處。
**晨星：一直守著你的** — 指出那個他自己沒發現、卻一直撐著他的東西。可能是一個人、一個習慣、一個信念。
**轉折：快要來的那件事** — 說出即將出現的機會或貴人的形狀。要具體到他認得出來。
**黎明：走過去之後的你** — 描述他熬過這段之後會變成什麼樣的人。

老夫的語氣是定海神針：話要慢、要穩、要有重量。不要給廉價的鼓勵，也不要說「一切都會好的」——說的是他會變強，不是事情會自己變好。`,
  },
  {
    id: "night-dissect",
    label: "深夜剖析陣",
    sub: "陰影 · 根源 · 防禦 · 轉化 · 和解",
    bestFor: "重複陷入同一種關係、無名的恐懼、想做深層梳理時",
    positions: [
      { label: "陰影", hint: "你不敢承認的那份恐懼", x: 0.5, y: 0.17 },
      { label: "根源", hint: "它是從哪一段經歷來的", x: 0.2, y: 0.335 },
      { label: "防禦機制", hint: "你用什麼方式保護自己", x: 0.8, y: 0.335 },
      { label: "轉化", hint: "這份陰影能變成什麼力量", x: 0.5, y: 0.5 },
      { label: "和解", hint: "想對那個小小的你說的話", x: 0.5, y: 0.83 },
    ],
    drawMode: "manual",
    signatureOf: "nyx",
    backdrop: "night-well",
    aspect: 0.72,
    cardScale: 0.24,
    maxWidth: 380,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【深夜剖析陣】五段，標題就用下面這五個。開場只要一句。

**陰影** — 說出他不敢承認的那份恐懼。直接、安靜、不加形容詞。
**根源** — 這份恐懼是從哪一段經歷長出來的。這裡要小心，不要斷言他的過去，用「可能」「也許是」留空間給他自己對上號。
**防禦機制** — 他用什麼方式保護自己。要說得讓他認出來，但不要評判——那是他當年唯一想得到的辦法。
**轉化** — 這份陰影裡藏著什麼力量。不是安慰，是真的指出用途。
**和解** — 一句給那個小小的他的話。這一段要短，短到像一句耳語。

全程不要提高音量。這是深夜的談話，不是治療。越安靜越有力量。最後一段結束就停，不要再補任何總結。`,
  },
  {
    id: "rebirth",
    label: "冥界重生陣",
    sub: "枯萎 · 深埋 · 萌芽 · 盛開",
    bestFor: "剛經歷分手、失去重要的人事物、需要被陪著的時候",
    positions: [
      { label: "枯萎", hint: "這段經歷帶走的與留下的", x: 0.15, y: 0.3 },
      { label: "深埋", hint: "在黑暗裡靜靜養著的東西", x: 0.38, y: 0.82 },
      { label: "萌芽", hint: "重新愛自己的第一個小動作", x: 0.62, y: 0.52 },
      { label: "盛開", hint: "值得你期待的那片風景", x: 0.85, y: 0.18 },
    ],
    drawMode: "manual",
    signatureOf: "persephone",
    backdrop: "bloom-vines",
    aspect: 0.95,
    cardScale: 0.21,
    maxWidth: 460,
    readingGuide: `本次牌陣的解讀路徑（取代預設段落）：【冥界重生陣】四段，標題就用下面這四個，加上你自己的開場與收尾。

**先抱一下** — 一兩句話，先承認他的痛。不要分析，不要給建議。
**枯萎：被帶走的與留下的** — 誠實說出他失去了什麼。不要急著轉正向，讓那個失去是真的。
**深埋：土裡正在養的** — 指出在這段黑暗裡正在累積的東西。他現在看不到，但你看得到。
**萌芽：第一個小動作** — 一個非常小、小到他今天就做得到的事。不要給他大目標。
**盛開：值得期待的那片風景** — 描述那個未來的畫面，要具體、要溫暖、要讓他想活到那天。

全程的節奏是：陪他哭完，才陪他站起來。順序不可以顛倒。`,
  },
];

/**
 * The largest registered spread. A bound for anything that has to accept an
 * arbitrary card array without knowing which spread it belongs to — it can
 * never drift from the table the way a hand-written `7 : 3` did.
 */
export const MAX_SPREAD_CARDS: number = SPREADS.reduce(
  (max, s) => Math.max(max, s.positions.length),
  0
);

const BY_ID = new Map(SPREADS.map(s => [s.id, s]));

export function getSpread(id: string): TarotSpread | undefined {
  return BY_ID.get(id);
}

/** Every spread with no `signatureOf`, in registry order. */
export const GENERIC_SPREADS: TarotSpread[] = SPREADS.filter(s => !s.signatureOf);

/**
 * What one master offers: their own spread first, then the generic set.
 * The UI folds the generic ones away — see CLAUDE.md on why they are kept
 * rather than replaced.
 */
export function spreadsFor(avatarId: string): {
  signature?: TarotSpread;
  generic: TarotSpread[];
} {
  return {
    signature: SPREADS.find(s => s.signatureOf === avatarId),
    generic: GENERIC_SPREADS,
  };
}

/**
 * The legacy generic spread for a bare card count.
 *
 * Only for a request that carries no `spreadId` — a tab left open across a
 * deploy. Without it those readings would start erroring mid-session; with it
 * they quietly get the labels they had before.
 */
export function fallbackSpreadForCount(count: number): TarotSpread | undefined {
  return GENERIC_SPREADS.find(s => s.drawMode === "manual" && s.positions.length === count);
}

/** Position labels in board order, for the model's prompt. */
export function positionLabels(spread: TarotSpread): string[] {
  return spread.positions.map(p => p.label);
}
