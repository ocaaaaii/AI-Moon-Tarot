/**
 * Omikuji avatar registry — 月神神社's roster of 解籤師.
 * Mirrors lib/tarot/avatars.ts — see that file for the full rationale.
 */
import { TSUKINO_SYSTEM_PROMPT } from "./tsukinoPrompt";
import { AKIRA_SYSTEM_PROMPT } from "./akiraPrompt";
import { HARUMA_SYSTEM_PROMPT } from "./harumaPrompt";
import { IORI_SYSTEM_PROMPT } from "./ioriPrompt";
import { USHIO_SYSTEM_PROMPT } from "./ushioPrompt";
import { MAYA_SYSTEM_PROMPT } from "./mayaPrompt";
import { KANON_SYSTEM_PROMPT } from "./kanonPrompt";

/** static, Tailwind-JIT-friendly accent key — see components/ui/AvatarProfile.tsx */
export type AvatarAccent =
  | "lavender"
  | "gold"
  | "slate"
  | "rose"
  | "sage"
  | "mauve"
  | "stone";

export interface OmikujiAvatar {
  id: string;
  displayName: string;
  realName?: string;
  /** Romanized reading of displayName (e.g. 天城月乃 → "Tsukino") — purely
   * a transliteration, NOT the cross-shop alias (that's revealTemplate's
   * job). Safe to show anywhere, including the portal tour. */
  englishName: string;
  /** One-line "best for" specialty, shown in the portal tour so visitors
   * can tell the six Sacred Realms souls apart before picking one. */
  bestFor: string;
  image: string;
  tagline: string;
  isMember: boolean;
  systemPrompt: string;
  accent: AvatarAccent;
  bioLines: string[];
  traits: { icon: string; label: string }[];
  quoteLines: string[];
  /** only set for personas with a hidden-identity reveal arc */
  revealTemplate?: { prefix: string; suffix: string };
  /** the opening chat bubble shown at idle/typing — one persona's voice
   * shouldn't leak into another's conversation */
  openingLines: string[];
  inputPlaceholder: string;
  suggestions: { icon: string; text: string }[];
  /** Sacred Realms (see CLAUDE.md 🔮 Future Vision) — when set, the
   * shrine page swaps its background to `region.image` and exposes a
   * header button that opens `RegionRitual` configured with the rest of
   * these fields. Tsukino has none (she's the shared default home base). */
  region?: {
    image: string;
    title: string;
    subheading: string;
    placeholder: string;
    releaseLabel: string;
    restartLabel: string;
    apiEndpoint: string;
    /** "R,G,B" for RegionRitual's inline rgba() accents */
    accentRGB: string;
    buttonLabel: string;
    /** Iori's 智慧花園 only — reply is split into two paths on "|||" */
    twoPath?: boolean;
  };
}

export const OMIKUJI_AVATARS: OmikujiAvatar[] = [
  {
    id: "tsukino",
    displayName: "天城月乃",
    englishName: "Amagi Tsukino",
    bestFor: "看懂人生十字路口",
    image: "/assets/Tsukino.png",
    tagline: "🌙 籤詩問事 · 神社的解籤人",
    isMember: false,
    systemPrompt: TSUKINO_SYSTEM_PROMPT,
    accent: "gold",
    bioLines: ["我不算命，我陪你", "把心裡已經知道的答案，慢慢說出來。"],
    traits: [
      { icon: "🍵", label: "說話慢慢的，像泡開的一壺茶" },
      { icon: "📜", label: "最簡單的故事，說懂最複雜的籤詩" },
      { icon: "🌙", label: "把答案，留在你自己心裡" },
    ],
    quoteLines: ["籤詩不是命運的判決", "是月光暫時借你的一面鏡子"],
    revealTemplate: {
      prefix: "她在月之塔羅店鋪以「Cynthia」之名說故事，那是月亮女神的稱號；走進這座神社才會知道，她真正的名字是",
      suffix: "。",
    },
    openingLines: [
      "月光照進神社的時候，心事也會變得安靜一點。",
      "把心裡正困惑的事說給我聽——",
      "我們搖一支籤，請月神給你一個方向。",
    ],
    inputPlaceholder: "把心裡正困惑的事說給我——月神會給你一個方向...",
    suggestions: [
      { icon: "🌙", text: "那個人最近態度變了，我不知道是不是我想太多" },
      { icon: "🍃", text: "我站在兩條路的中間很久了，哪邊都怕選錯" },
      { icon: "✨", text: "心裡有一個感覺一直出現，但我說不清楚它是什麼" },
    ],
  },
  {
    id: "akira",
    displayName: "東雲曉",
    englishName: "Shinonome Akira",
    bestFor: "穩住信仰崩塌",
    image: "/assets/Akira.png",
    tagline: "🕯️ 月神神社的守護者",
    isMember: true,
    systemPrompt: AKIRA_SYSTEM_PROMPT,
    accent: "slate",
    region: {
      image: "/assets/黎明庭園.jpg",
      title: "黎明庭園",
      subheading: "寫下一件你覺得自己絕對做不到的事",
      placeholder: "寫下那個你不相信自己能做到的事……",
      releaseLabel: "🌅 接受開光祝福",
      restartLabel: "再寫一個",
      apiEndpoint: "/api/dawn-courtyard",
      accentRGB: "138,150,168",
      buttonLabel: "🌅 黎明庭園",
    },
    bioLines: ["我不嚇唬你，我陪你", "把扛不動的，暫時放下。"],
    traits: [
      { icon: "🕯️", label: "嚴肅，是因為心疼" },
      { icon: "📿", label: "凶籤也只是天氣預報" },
      { icon: "⛩️", label: "路怎麼走，燈籠在你手裡" },
    ],
    quoteLines: ["命運的籤詩，不過是月光", "照在路面上所映出的陰影"],
    openingLines: [
      "老夫聽見你投錢的聲音了。",
      "孩子，深夜走進這座神社，一路上辛苦了吧。",
      "把心裡的重擔放下，我們搖一支籤，看看月神想讓你看清什麼。",
    ],
    inputPlaceholder: "把心裡的重擔告訴老夫——搖完籤筒，我們一起參透它...",
    suggestions: [
      { icon: "🌅", text: "我以為自己是對的，結果全部白費了，不知道哪裡出了問題" },
      { icon: "🕯️", text: "我曾經很篤定的事，現在完全動搖了" },
      { icon: "⛩️", text: "一直以為自己撐得住，但最近開始懷疑了" },
    ],
  },
  {
    id: "haruma",
    displayName: "日向陽真",
    englishName: "Hinata Haruma",
    bestFor: "戳破自我欺騙",
    image: "/assets/Haruma.png",
    tagline: "☀️ 月神神社的挑釁者",
    isMember: true,
    systemPrompt: HARUMA_SYSTEM_PROMPT,
    accent: "lavender",
    region: {
      image: "/assets/烈陽殿.jpg",
      title: "烈陽殿",
      subheading: "說出一個你正在逃避、或騙自己的事",
      placeholder: "你在拖延、或騙自己的，是什麼事？",
      releaseLabel: "☀️ 接受烈陽灼燒",
      restartLabel: "再來一次",
      apiEndpoint: "/api/solar-palace",
      accentRGB: "184,168,200",
      buttonLabel: "☀️ 烈陽殿",
    },
    bioLines: ["我不哄你，我只戳醒你。", "嘖，少在那裡演了。"],
    traits: [
      { icon: "🔥", label: "嘴角壞壞，講話直接" },
      { icon: "⚔️", label: "凶籤也是給你的考題" },
      { icon: "☀️", label: "這場遊戲，你才是主角" },
    ],
    quoteLines: ["路要怎麼走，掌控權", "從來都在你自己手裡"],
    openingLines: [
      "噢？聽到你丟錢的聲音了。",
      "心裡在煩惱什麼，別扭扭捏捏的，直接說。",
      "來，把籤筒搖一搖，讓我看看你藏了什麼小秘密。",
    ],
    inputPlaceholder: "嘖，說重點——你到底在煩惱什麼？搖完籤筒再說...",
    suggestions: [
      { icon: "🔥", text: "我明知道要做，就是拖了三個月，今天想聽你說我" },
      { icon: "⚡", text: "我大概知道問題在哪——但還是想讓籤說一次" },
      { icon: "☀️", text: "我在一段關係裡委屈自己，但一直說服自己這樣沒關係" },
    ],
  },
  {
    id: "iori",
    displayName: "神樂祈織",
    englishName: "Kagura Iori",
    bestFor: "拆解焦慮卡關",
    image: "/assets/Iori.png",
    tagline: "🦉 知惠の星 · 天才小巫女",
    isMember: true,
    systemPrompt: IORI_SYSTEM_PROMPT,
    accent: "rose",
    region: {
      image: "/assets/智慧花園.jpg",
      title: "智慧花園",
      subheading: "把一個二選一的難題，丟給雅典娜的沙盤",
      placeholder: "寫下你的兩難（例如：要不要離職）……",
      releaseLabel: "🧩 拆解這個難題",
      restartLabel: "再拆解一個",
      apiEndpoint: "/api/sandbox",
      accentRGB: "201,168,160",
      buttonLabel: "🧩 智慧花園",
      twoPath: true,
    },
    bioLines: ["我才不會嚇你噠！", "煩惱只是還沒拆完的積木呀～"],
    traits: [
      { icon: "⭐", label: "天才般的悟性，孩子般的心" },
      { icon: "🦉", label: "凶籤也是好玩的關卡" },
      { icon: "🌸", label: "方向盤一直在你手手裡" },
    ],
    quoteLines: ["你本來就是最棒的", "生命創造者喔"],
    openingLines: [
      "（蹦蹦跳跳）噢哇！賽錢箱發出大大的『咚啷』一聲囉！",
      "深夜來找祈織，是不是心裡有小怪獸在搗亂呀？",
      "把小煩惱都交給我，我們一起搖搖籤筒吧，嘿呀～",
    ],
    inputPlaceholder: "說給祈織聽聽噠——心裡的小怪獸長什麼樣子呀？",
    suggestions: [
      { icon: "🧩", text: "我把同一件事想了好多遍，越想越亂，停不下來" },
      { icon: "🌸", text: "選 A 怕後悔，選 B 也怕後悔——兩邊都好怕" },
      { icon: "⭐", text: "我很努力了，但就是看不到結果，是不是方向錯了？" },
    ],
  },
  {
    id: "ushio",
    displayName: "汐見潮",
    englishName: "Shiomi Ushio",
    bestFor: "療癒焦慮內耗",
    image: "/assets/Ushio.png",
    tagline: "🌊 月神神社的潮汐療癒師",
    isMember: true,
    systemPrompt: USHIO_SYSTEM_PROMPT,
    accent: "sage",
    region: {
      image: "/assets/潮音池.jpg",
      title: "潮音池",
      subheading: "把心裡的煩惱，交給水吧",
      placeholder: "寫下一件讓你煩心的事……",
      releaseLabel: "🌊 讓它順著水走",
      restartLabel: "再放下一件事",
      apiEndpoint: "/api/tide-pool",
      accentRGB: "160,176,160",
      buttonLabel: "🌊 潮音池",
    },
    bioLines: ["別急，順其自然吧。", "你的重擔，可以先放在這片海裡。"],
    traits: [
      { icon: "🌙", label: "深夜裡最安靜的陪伴" },
      { icon: "🌊", label: "凶籤也只是風浪大了點" },
      { icon: "⚓", label: "放下控制，才能靠岸" },
    ],
    quoteLines: ["你本身就是一整片海洋", "沒有浪潮能真正困住你"],
    openingLines: [
      "（溫柔微笑）聽到錢幣落下的聲音了。",
      "深夜過來，心裡一定很累、有很多放不下的執著吧？",
      "來，先坐在我旁邊，看著這片水面，搖搖籤筒吧。",
    ],
    inputPlaceholder: "別急，慢慢說——搖完籤筒，我們順著水走...",
    suggestions: [
      { icon: "🌊", text: "我沒有出什麼大事，就是最近很疲憊" },
      { icon: "🌙", text: "那件事過去很久了，我以為沒事，但有時候還是會被帶進去" },
      { icon: "⚓", text: "我不知道自己是不是太敏感，還是真的需要好好休息" },
    ],
  },
  {
    id: "maya",
    displayName: "九条萬夜",
    englishName: "Kujo Maya",
    bestFor: "直視深層恐懼",
    image: "/assets/Maya.png",
    tagline: "🌌 月神神社的永夜巫女",
    isMember: true,
    systemPrompt: MAYA_SYSTEM_PROMPT,
    accent: "mauve",
    region: {
      image: "/assets/夜星庭.jpg",
      title: "夜星庭",
      subheading: "深夜限定。寫下一個反覆出現的夢，或揮之不去的宿命感",
      placeholder: "寫下那個夢，或那股感覺……",
      releaseLabel: "🌌 交給星辰",
      restartLabel: "再看一次",
      apiEndpoint: "/api/midnight-courtyard",
      accentRGB: "176,160,184",
      buttonLabel: "🌌 夜星庭",
    },
    bioLines: ["黑夜不是敵人。", "安靜，也是一種答案。"],
    traits: [
      { icon: "🌙", label: "冰冷優雅，不食人間煙火" },
      { icon: "🥀", label: "凶籤是黑夜給的暫停鍵" },
      { icon: "⭐", label: "星辰只在暗夜中可見" },
    ],
    quoteLines: ["當你不再向外尋求虛妄的光", "你體內的萬夜星河才會甦醒"],
    openingLines: [
      "深夜敲門，看來你被白日的喧囂傷得很深。",
      "錢幣落下的聲音很清脆，但你的心很亂。",
      "坐下吧，搖晃籤筒，讓萬夜的星辰回答你。",
    ],
    inputPlaceholder: "坐下吧，把執著放下——搖完籤筒再說...",
    suggestions: [
      { icon: "🌌", text: "我反覆做同樣的夢，那個夢和現在發生的事很像" },
      { icon: "🥀", text: "有個念頭一直在腦子裡轉，不確定它是直覺還是恐懼" },
      { icon: "⭐", text: "我好像一直在重複同一個模式，但不知道怎麼打破" },
    ],
  },
  {
    id: "kanon",
    displayName: "天城花音",
    englishName: "Amagi Kanon",
    bestFor: "走出失戀低潮",
    image: "/assets/Kanon.png",
    tagline: "🌸 月神神社的春之巫女",
    isMember: true,
    systemPrompt: KANON_SYSTEM_PROMPT,
    accent: "stone",
    region: {
      image: "/assets/春之花園.jpg",
      title: "春之花園",
      subheading: "把一段心碎，種成一顆種子吧",
      placeholder: "寫下一段讓你心碎的記憶……",
      releaseLabel: "🌱 種下這顆種子",
      restartLabel: "再種下一顆",
      apiEndpoint: "/api/spring-garden",
      accentRGB: "168,152,128",
      buttonLabel: "🌱 春之花園",
    },
    bioLines: ["花會開的。", "冬天真的會過去。"],
    traits: [
      { icon: "🌸", label: "陪你哭，也陪你重新站起來" },
      { icon: "🌱", label: "凶籤是冬天的最後一天" },
      { icon: "🦋", label: "新的開始，正在等著你" },
    ],
    quoteLines: ["你這麼善良又這麼努力", "命運一定會迎來繁花盛開的一天"],
    revealTemplate: {
      prefix: "她在月之塔羅店鋪以「Persephone」之名療癒人心，那是春神的稱號；走進這座神社才會知道，她是月乃的妹妹，真正的名字是",
      suffix: "。",
    },
    openingLines: [
      "咚啷～聽到你投下錢幣的聲音囉。",
      "深夜來到月神神社，心裡是不是藏著受傷的小祕密呢？",
      "快來坐花音旁邊，我們一起搖搖籤筒吧，呀～",
    ],
    inputPlaceholder: "說給花音聽呢——不管多難過，這裡都安全的喔...",
    suggestions: [
      { icon: "🌸", text: "他走了三個月了，但我還是會在某個瞬間停下來想他" },
      { icon: "🌱", text: "我告訴自己已經放下了，但有空就還是會去翻他的動態" },
      { icon: "🦋", text: "我最近笑得很努力，但笑完之後其實更空" },
    ],
  },
];

export const DEFAULT_OMIKUJI_AVATAR_ID = OMIKUJI_AVATARS[0].id;

export function getOmikujiAvatar(avatarId?: string): OmikujiAvatar {
  return OMIKUJI_AVATARS.find((a) => a.id === avatarId) ?? OMIKUJI_AVATARS[0];
}
