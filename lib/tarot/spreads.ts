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

/** 海底輪 at the bottom, 頂輪 at the top — an energy column, read upward. */
const CHAKRA_POSITIONS: SpreadPosition[] = CHAKRA_LABELS.map((label, i) => ({
  label,
  hint: CHAKRA_HINTS[i],
  x: 0.5,
  y: 0.94 - i * 0.147,
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
    bestFor: "只想要一句話、一個方向，不需要前因後果時",
    positions: [{ label: "當下訊息", hint: "此刻最該被你看見的", x: 0.5, y: 0.5 }],
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.1,
    cardScale: 0.42,
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
    aspect: 2.1,
    cardScale: 0.24,
  },
  {
    id: "situation-challenge-advice",
    label: "情況挑戰建議",
    sub: "情況 · 挑戰 · 建議",
    bestFor: "卡在一個具體處境裡，想知道下一步怎麼走",
    positions: row([
      ["情況", "你現在面對的全貌"],
      ["挑戰", "真正擋住你的那一件事"],
      ["建議", "可以先做的那一步"],
    ]),
    drawMode: "manual",
    backdrop: "none",
    aspect: 2.1,
    cardScale: 0.24,
  },
  {
    id: "mind-body-spirit",
    label: "心身靈",
    sub: "心 · 身 · 靈",
    bestFor: "說不上哪裡不對，但整個人不太對勁時",
    positions: [
      { label: "心", hint: "情緒此刻的樣子", x: 0.26, y: 0.74 },
      { label: "身", hint: "身體正在替你承擔的", x: 0.74, y: 0.74 },
      { label: "靈", hint: "更深的那個你想說的", x: 0.5, y: 0.22 },
    ],
    drawMode: "manual",
    backdrop: "none",
    aspect: 1.35,
    cardScale: 0.3,
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
    aspect: 0.62,
    cardScale: 0.46,
  },
  {
    id: "chakra",
    label: "七脈輪掃描",
    sub: "22 大牌 · 能量全身掃描",
    bestFor: "想做一次整體的能量體檢，看看哪裡堵住了",
    positions: CHAKRA_POSITIONS,
    drawMode: "chakra",
    backdrop: "none",
    aspect: 0.42,
    cardScale: 0.3,
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
    aspect: 1.55,
    cardScale: 0.26,
  },
  {
    id: "solar-cross",
    label: "烈陽破曉十字陣",
    sub: "藉口 · 真相 · 盲區 · 曙光",
    bestFor: "拖延發作、自欺欺人、需要被強行敲醒時",
    positions: [
      { label: "藉口", hint: "你一直拿來安慰自己的假象", x: 0.18, y: 0.5 },
      { label: "真相", hint: "殘酷但你必須面對的核心", x: 0.5, y: 0.5 },
      { label: "盲區", hint: "你不敢跨出去的那一步", x: 0.82, y: 0.5 },
      { label: "曙光", hint: "現在立刻就能做的突破", x: 0.5, y: 0.14 },
    ],
    drawMode: "manual",
    signatureOf: "helios",
    backdrop: "solar-cross",
    aspect: 1.5,
    cardScale: 0.24,
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
    aspect: 1.32,
    cardScale: 0.24,
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
    aspect: 1.55,
    cardScale: 0.26,
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
    aspect: 1.62,
    cardScale: 0.21,
  },
  {
    id: "night-dissect",
    label: "深夜剖析陣",
    sub: "陰影 · 根源 · 防禦 · 轉化 · 和解",
    bestFor: "重複陷入同一種關係、無名的恐懼、想做深層梳理時",
    positions: [
      { label: "陰影", hint: "你不敢承認的那份恐懼", x: 0.5, y: 0.12 },
      { label: "根源", hint: "它是從哪一段經歷來的", x: 0.21, y: 0.42 },
      { label: "防禦機制", hint: "你用什麼方式保護自己", x: 0.79, y: 0.42 },
      { label: "轉化", hint: "這份陰影能變成什麼力量", x: 0.5, y: 0.63 },
      { label: "和解", hint: "想對那個小小的你說的話", x: 0.5, y: 0.9 },
    ],
    drawMode: "manual",
    signatureOf: "nyx",
    backdrop: "night-well",
    aspect: 1.06,
    cardScale: 0.24,
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
    aspect: 1.62,
    cardScale: 0.21,
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
