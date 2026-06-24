/**
 * Tarot avatar registry — 月之塔羅店鋪's roster of tarot masters.
 *
 * Single source of truth for: which personas exist, what system prompt
 * each one speaks with, and whether they require membership. The reading
 * API route looks up systemPrompt from here by avatarId instead of
 * importing a single hardcoded prompt — adding a new tarot master later
 * means adding one entry here, not touching the route handler.
 *
 * `isMember` has no real enforcement yet (no auth/payment system exists
 * today) — it only drives the avatar-selector UI's lock badge for now.
 * Once membership is wired up, gate the actual API call on this flag too.
 */
import { CYNTHIA_SYSTEM_PROMPT } from "./cynthiaPrompt";
import { EOS_SYSTEM_PROMPT } from "./eosPrompt";
import { HELIOS_SYSTEM_PROMPT } from "./heliosPrompt";
import { ATHENA_SYSTEM_PROMPT } from "./athenaPrompt";
import { POSEIDON_SYSTEM_PROMPT } from "./poseidonPrompt";
import { NYX_SYSTEM_PROMPT } from "./nyxPrompt";
import { PERSEPHONE_SYSTEM_PROMPT } from "./persephonePrompt";

/** static, Tailwind-JIT-friendly accent key — see components/ui/AvatarProfile.tsx */
export type AvatarAccent =
  | "lavender"
  | "gold"
  | "slate"
  | "rose"
  | "sage"
  | "mauve"
  | "stone";

export interface TarotAvatar {
  id: string;
  /** the name she/he goes by in the shop, shown in the UI */
  displayName: string;
  /** her/his real identity, if different — revealed only inside that
   * persona's own profile panel, never on the portal page */
  realName?: string;
  image: string;
  tagline: string;
  /** one-line specialty shown in the avatar profile panel, e.g. "拆解焦慮卡關".
   * Mirrors the same soul's shrine-side `bestFor` (lib/omikuji/avatars.ts) —
   * same soul, same specialty, just told through a different door. */
  bestFor: string;
  isMember: boolean;
  systemPrompt: string;
  accent: AvatarAccent;
  bioLines: string[];
  traits: { icon: string; label: string }[];
  quoteLines: string[];
  /** only set for personas with a hidden-identity reveal arc (e.g. Cynthia
   * is also 月乃) — rendered as prefix + realName(highlighted) + suffix */
  revealTemplate?: { prefix: string; suffix: string };
  /** the opening chat bubble shown at idle/typing — one persona's voice
   * shouldn't leak into another's conversation */
  openingLines: string[];
  inputPlaceholder: string;
  suggestions: { icon: string; text: string }[];
}

export const TAROT_AVATARS: TarotAvatar[] = [
  {
    id: "cynthia",
    displayName: "Cynthia",
    image: "/assets/Cynthia.png",
    tagline: "🌕 月之女神 · 以牌為鏡",
    bestFor: "看懂人生十字路口",
    isMember: false,
    systemPrompt: CYNTHIA_SYSTEM_PROMPT,
    accent: "lavender",
    bioLines: ["我不預言，我只陪你", "一起看清楚已經在你心裡的事。"],
    traits: [
      { icon: "🌑", label: "看見你藏在黑暗裡的部分" },
      { icon: "🌓", label: "以故事帶你穿過混沌" },
      { icon: "🌕", label: "把力量還回你手中" },
    ],
    quoteLines: ["月亮從不評判潮汐", "它只是如實照亮"],
    openingLines: [
      "月光落下的地方，沒有陰影能永遠藏著。",
      "把你心裡最沉的那個問題說出來——",
      "我們來看看，牌想讓你看見什麼。",
    ],
    inputPlaceholder: "慢慢說給我聽——每個細節都會在牌上現出來...",
    suggestions: [
      { icon: "🌑", text: "他最近都不主動找我，是我太敏感，還是真的在走遠？" },
      { icon: "🌓", text: "我說要離職已經說了半年，但我一直沒有動——牌能看到原因嗎？" },
      { icon: "🌕", text: "我一直在等一個時機，但等了很久，什麼都沒發生" },
    ],
  },
  {
    id: "eos",
    displayName: "Eos",
    realName: "黎明之神",
    image: "/assets/Eos.png",
    tagline: "🌅 黎明之神 · 曙光中的智者",
    bestFor: "穩住信仰崩塌",
    isMember: true,
    systemPrompt: EOS_SYSTEM_PROMPT,
    accent: "gold",
    bioLines: ["我不評判黑夜多長，", "我只陪你，等天亮。"],
    traits: [
      { icon: "🌅", label: "誠實面對眼前的傷" },
      { icon: "☀️", label: "把試煉說成一段季節" },
      { icon: "✨", label: "把光，還給你自己" },
    ],
    quoteLines: ["黑夜再長，黎明也終將破曉", "因為太陽一直都在你心裡"],
    openingLines: [
      "孩子，到老朽身邊坐下吧。",
      "把心裡的重擔說給我聽——",
      "我們一起看看，黎明想為你帶來什麼方向。",
    ],
    inputPlaceholder: "說給老朽聽聽吧，不急——黎明會等你把話說完...",
    suggestions: [
      { icon: "🌅", text: "我拼了很久，最後還是失敗了——我不知道還要不要繼續" },
      { icon: "🌄", text: "那個人說的話讓我開始懷疑自己，我到底哪裡錯了？" },
      { icon: "☀️", text: "我對未來完全沒有期待，不知道為什麼要繼續撐著" },
    ],
  },
  {
    id: "helios",
    displayName: "Helios",
    realName: "太陽神",
    image: "/assets/Helios.png",
    tagline: "☀️ 太陽神 · 一語道破的烈日",
    bestFor: "戳破自我欺騙",
    isMember: true,
    systemPrompt: HELIOS_SYSTEM_PROMPT,
    accent: "slate",
    bioLines: ["我不說好聽話，我只說真話。", "嘖，先把藉口收起來再說。"],
    traits: [
      { icon: "🔥", label: "看穿你還在騙自己的部分" },
      { icon: "⚡", label: "一句話戳破你的小劇場" },
      { icon: "☀️", label: "把創造的權力還給你" },
    ],
    quoteLines: ["真正的力量和愛都在你體內", "別像個乞丐一樣向外乞求"],
    openingLines: [
      "嘖。又是一臉糾結的樣子？",
      "把你心裡那個煩到不行的問題說出來，別跟我磨皮擦癢。",
      "牌擺在這裡，看看你到底在騙自己什麼。",
    ],
    inputPlaceholder: "說重點，別鋪梗——你的問題是什麼？",
    suggestions: [
      { icon: "🔥", text: "我知道那段感情不健康，但就是捨不得斷——我在等什麼？" },
      { icon: "⚡", text: "其實我心裡已經知道答案了，但我想再確認一次" },
      { icon: "☀️", text: "我說要改變已經說了好幾個月，但我一直沒有動" },
    ],
  },
  {
    id: "athena",
    displayName: "Athena",
    realName: "雅典娜",
    image: "/assets/Athena.png",
    tagline: "🦉 智慧女神 · 天馬行空的拆解大師",
    bestFor: "拆解焦慮卡關",
    isMember: true,
    systemPrompt: ATHENA_SYSTEM_PROMPT,
    accent: "rose",
    bioLines: ["我才不要嚇你呢！", "煩惱只是還沒拼好的拼圖呀～"],
    traits: [
      { icon: "⭐", label: "用童心拆解最複雜的問題" },
      { icon: "🦉", label: "壞牌也能變成新的關卡" },
      { icon: "🎮", label: "你是這場遊戲的創造者噠" },
    ],
    quoteLines: ["真正的魔法不在紙牌上", "它一直在你心裡閃閃發光"],
    openingLines: [
      "嗨呀！歡迎來到我的祕密基地🌟",
      "老遠就看到你頭上有一團烏雲耶，辛苦你啦！",
      "把卡牌翻開，我們一起把煩惱拆成拼圖吧，哼哼～",
    ],
    inputPlaceholder: "說給雅典娜聽聽呀——什麼小怪獸在搗亂噠？",
    suggestions: [
      { icon: "🧩", text: "A 和 B 我想了很久都沒辦法決定，這兩條路哪個比較適合我？" },
      { icon: "🌟", text: "我最近什麼事情都做不好，狀態很差，是我太悲觀了嗎？" },
      { icon: "🦉", text: "這個問題我繞了好幾個月，就是找不到出口" },
    ],
  },
  {
    id: "poseidon",
    displayName: "Poseidon",
    realName: "海洋之神",
    image: "/assets/Poseidon.png",
    tagline: "🌊 海洋之神 · 順流而行的衝浪教練",
    bestFor: "療癒焦慮內耗",
    isMember: true,
    systemPrompt: POSEIDON_SYSTEM_PROMPT,
    accent: "sage",
    bioLines: ["放輕鬆，別跟浪對抗。", "順著水走，我陪你漂一段。"],
    traits: [
      { icon: "🌊", label: "再大的浪，退潮就平靜" },
      { icon: "🐚", label: "放手，是另一種抓住" },
      { icon: "🏄", label: "你是海，不是天氣" },
    ],
    quoteLines: ["你可是能在這片命運之海裡", "自由衝浪的人耶"],
    openingLines: [
      "嗨，來啦？坐吧，外面太陽很大，先喝口水。",
      "我看你眉頭鎖得比麻花還緊，先放輕鬆啦。",
      "來，把手放開，讓我們看看這波浪潮要帶給我們什麼提示。",
    ],
    inputPlaceholder: "慢慢說，不急——讓心裡的浪先平靜一點再說...",
    suggestions: [
      { icon: "🌊", text: "我知道我在內耗，但就是停不下來" },
      { icon: "🐚", text: "最近什麼都覺得好沉，但說不清楚沉在哪裡" },
      { icon: "🏄", text: "那件事我一直放不下，但放著也不知道能怎樣" },
    ],
  },
  {
    id: "nyx",
    displayName: "Nyx",
    realName: "永夜女神",
    image: "/assets/Nyx.png",
    tagline: "🌌 永夜女神 · 潛意識的靜謐解剖",
    bestFor: "直視深層恐懼",
    isMember: true,
    systemPrompt: NYX_SYSTEM_PROMPT,
    accent: "mauve",
    bioLines: ["黑夜不是敵人。", "安靜，也是一種答案。"],
    traits: [
      { icon: "🌌", label: "看穿你不敢面對的陰影" },
      { icon: "🕯️", label: "崩塌，只是重新凝聚" },
      { icon: "⭐", label: "答案藏在你的潛意識裡" },
    ],
    quoteLines: ["真正的方向", "一直藏在你最深的潛意識裡"],
    openingLines: [
      "你來了。坐吧。",
      "外面太吵了，但在這裡，只有無盡的星空。",
      "不用急著說話。看清你的黑夜，我們翻牌。",
    ],
    inputPlaceholder: "說，或者不說都可以——黑夜會等你。",
    suggestions: [
      { icon: "🌌", text: "我有一個念頭一直出現，但我不知道是直覺還是焦慮" },
      { icon: "🕯️", text: "我最近做了一個奇怪的夢，感覺和現在的事有關" },
      { icon: "⭐", text: "我好像在怕一件說不清楚的事——你能幫我看嗎？" },
    ],
  },
  {
    id: "persephone",
    displayName: "Persephone",
    realName: "春神",
    image: "/assets/Persephone.png",
    tagline: "🌸 春之女神 · 溫柔重生的治癒系",
    bestFor: "走出失戀低潮",
    isMember: true,
    systemPrompt: PERSEPHONE_SYSTEM_PROMPT,
    accent: "stone",
    bioLines: ["花會開的。", "冬天真的會過去。"],
    traits: [
      { icon: "🌸", label: "陪你哭，也陪你重新站起來" },
      { icon: "🌱", label: "傷心不是終點，是種子" },
      { icon: "🦋", label: "新的開始，正在等著你" },
    ],
    quoteLines: ["最好的你、全新的開始", "正在前方拍拍翅膀等著你"],
    openingLines: [
      "嗨，我是 Persephone。快進來坐，一看到你，我就好想給你一個大大的擁抱喔。",
      "這陣子受了好多委屈、經歷了很辛苦的低潮對不對？",
      "先深呼吸，聞一聞鬱金香的花香，我們一起看看卡牌溫暖的提示吧。",
    ],
        inputPlaceholder: "說給我聽喔——不管多難過，這裡都安全的。",
    suggestions: [
      { icon: "🌸", text: "他已經不在了，但我腦子裡還是一直想他" },
      { icon: "🌱", text: "我最近很努力假裝自己沒事，但其實沒有" },
      { icon: "🦋", text: "我想重新開始，但不知道要先從哪裡動" },
    ],
  },
];

export const DEFAULT_TAROT_AVATAR_ID = TAROT_AVATARS[0].id;

export function getTarotAvatar(avatarId?: string): TarotAvatar {
  return TAROT_AVATARS.find((a) => a.id === avatarId) ?? TAROT_AVATARS[0];
}
