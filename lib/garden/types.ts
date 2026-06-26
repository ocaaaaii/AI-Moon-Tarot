/**
 * lib/garden/types.ts
 * Shared types for the 眾神之庭 (Garden of Gods) feature set.
 */

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface ZodiacMeta {
  slug: ZodiacSign;
  zh: string;
  symbol: string;
  iAstro: number; // click108 query param
}

export const ZODIAC_LIST: ZodiacMeta[] = [
  { slug: "aries",       zh: "牡羊座", symbol: "♈", iAstro: 0  },
  { slug: "taurus",      zh: "金牛座", symbol: "♉", iAstro: 1  },
  { slug: "gemini",      zh: "雙子座", symbol: "♊", iAstro: 2  },
  { slug: "cancer",      zh: "巨蟹座", symbol: "♋", iAstro: 3  },
  { slug: "leo",         zh: "獅子座", symbol: "♌", iAstro: 4  },
  { slug: "virgo",       zh: "處女座", symbol: "♍", iAstro: 5  },
  { slug: "libra",       zh: "天秤座", symbol: "♎", iAstro: 6  },
  { slug: "scorpio",     zh: "天蠍座", symbol: "♏", iAstro: 7  },
  { slug: "sagittarius", zh: "射手座", symbol: "♐", iAstro: 8  },
  { slug: "capricorn",   zh: "魔羯座", symbol: "♑", iAstro: 9  },
  { slug: "aquarius",    zh: "水瓶座", symbol: "♒", iAstro: 10 },
  { slug: "pisces",      zh: "雙魚座", symbol: "♓", iAstro: 11 },
];

export interface HoroscopeSection {
  stars: string;   // e.g. "★★★☆☆"
  content: string;
}

export interface RawHoroscope {
  sign: ZodiacSign;
  sign_zh: string;
  week: string;
  sections: {
    整體運勢?: HoroscopeSection;
    愛情運勢?: HoroscopeSection;
    事業運勢?: HoroscopeSection;
    財運運勢?: HoroscopeSection;
  };
}
