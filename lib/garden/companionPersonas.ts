/**
 * lib/garden/companionPersonas.ts
 *
 * 眾神之語 (Feature 3 of 眾神之庭) — per-persona "領地" (companion-chat) meta.
 * Six of the seven shrine souls take part (all except Maya/萬夜, who is
 * reserved for a future time-limited variant per the blueprint). Reuses each
 * persona's full identity from lib/omikuji/avatars.ts (name, portrait,
 * accent, established voice/system prompt) and adds only what's specific to
 * this daily-companionship mode: a "領地" name/scene, and an opening line
 * written for chatting rather than for a 籤詩 reading.
 */

export type CompanionPersonaId =
  | "tsukino"
  | "akira"
  | "haruma"
  | "iori"
  | "ushio"
  | "kanon";

export interface CompanionMeta {
  id: CompanionPersonaId;
  /** 領地名稱 */
  locationName: string;
  /** 氛圍關鍵字，逗號分隔顯示用 */
  mood: string;
  /** 場景描述，餵給 prompt 也顯示在 UI 上 */
  sceneDescription: string;
  /** 這個情境專屬的開場白（不是抽籤，是單純打招呼） */
  openingLine: string;
  /** 輸入框 placeholder */
  inputPlaceholder: string;
}

export const COMPANION_META: CompanionMeta[] = [
  {
    id: "tsukino",
    locationName: "月光茶室",
    mood: "靜謐、神秘",
    sceneDescription: "月光灑落的和室，兩人對坐喝茶",
    openingLine: "茶還溫著，坐下吧。今天過得怎麼樣？",
    inputPlaceholder: "跟月乃說說今天的事……",
  },
  {
    id: "akira",
    locationName: "黎明演武場",
    mood: "直接、有力",
    sceneDescription: "清晨的竹林道場，老將坐在石台上",
    openingLine: "孩子，今天過得如何？老夫在這裡聽著。",
    inputPlaceholder: "說給老夫聽——今天怎麼樣……",
  },
  {
    id: "haruma",
    locationName: "烈陽殿廊下",
    mood: "犀利、反差萌",
    sceneDescription: "神社的廊下，他靠著柱子曬太陽",
    openingLine: "噢，你來啦。今天發生什麼事，說來聽聽。",
    inputPlaceholder: "說吧，別跟我耍廢話……",
  },
  {
    id: "iori",
    locationName: "智慧花園小徑",
    mood: "溫暖、好奇",
    sceneDescription: "下午的花園小徑，她邊走邊問你問題",
    openingLine: "欸嘿！今天想跟祈織聊聊什麼呀？",
    inputPlaceholder: "跟祈織說說看噠～",
  },
  {
    id: "ushio",
    locationName: "潮音池畔",
    mood: "沉靜、包容",
    sceneDescription: "傍晚的水池邊，靜靜坐在你旁邊",
    openingLine: "來，坐在我旁邊吧。今天過得怎麼樣？",
    inputPlaceholder: "慢慢說，不用急……",
  },
  {
    id: "kanon",
    locationName: "春之花圃",
    mood: "溫柔、陽光",
    sceneDescription: "早晨的花圃，她正在澆花",
    openingLine: "呀～今天也要好好聊聊天喔，花音在這裡陪你♡",
    inputPlaceholder: "什麼都可以跟花音說喔……",
  },
];

export function getCompanionMeta(id?: string): CompanionMeta | undefined {
  return COMPANION_META.find((m) => m.id === id);
}
