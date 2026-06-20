"""
Scraper Agent — Configuration
All 78 tarot card definitions with verified URLs from nes-tarot.com.
Chinese names are sourced directly from the bilingual website.
"""
from pathlib import Path
from typing import Final

# ─── URLs ─────────────────────────────────────────────────────────────────────
BASE_URL: Final[str] = "https://nes-tarot.com"

# ─── Rate-limiting (MUST respect the target server) ───────────────────────────
DELAY_RANGE: Final[tuple[float, float]] = (2.0, 6.0)   # seconds between requests
MAX_RETRIES: Final[int] = 3
RETRY_BACKOFF: Final[float] = 5.0   # seconds to wait before retry

# ─── HTTP ─────────────────────────────────────────────────────────────────────
REQUEST_TIMEOUT: Final[int] = 30  # seconds

# Rotate through a pool of realistic User-Agent strings
USER_AGENTS: Final[list[str]] = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

# ─── Filesystem ───────────────────────────────────────────────────────────────
RAW_DATA_DIR: Final[Path] = Path("data/raw")
PROCESSED_DATA_DIR: Final[Path] = Path("data/processed")
WIKI_DIR: Final[Path] = Path("wiki")
IMAGE_DIR: Final[Path] = Path("public/assets/cards")

# ─── Chinese name validation dictionary ───────────────────────────────────────
# Ground-truth mapping: English name → expected Chinese name
# Used to validate scraped Chinese names against known correct translations.
KNOWN_ZH_NAMES: Final[dict[str, str]] = {
    "The Fool":           "愚者",
    "The Magician":       "魔術師",
    "The High Priestess": "女祭司",
    "The Empress":        "皇后",
    "The Emperor":        "國王",
    "The Hierophant":     "教皇",
    "The Lovers":         "戀人",
    "The Chariot":        "戰車",
    "Strength":           "力量",
    "The Hermit":         "隱修者",
    "Wheel of Fortune":   "命運之輪",
    "Justice":            "正義",
    "The Hanged Man":     "懸吊者",
    "Death":              "死亡",
    "Temperance":         "節制",
    "The Devil":          "惡魔",
    "The Tower":          "高塔",
    "The Star":           "星星",
    "The Moon":           "月亮",
    "The Sun":            "太陽",
    "Judgement":          "審判",
    "The World":          "世界",
}

# ─── 78 Card definitions ──────────────────────────────────────────────────────
# id:       Sequential index 0–77 (used for file naming)
# slug:     URL slug (used to construct scrape URL + image filename)
# name_en:  English card name
# name_zh:  Chinese card name (validated against KNOWN_ZH_NAMES for Major Arcana)
# arcana:   "major" | "minor" | "court"
# suit:     None (major/court) | "wands" | "cups" | "swords" | "pentacles"
# number:   Card number within its group (0 for Ace/Fool, etc.)
CARD_LIST: Final[list[dict]] = [
    # ── Major Arcana (0–21) ──────────────────────────────────────────────────
    {"id":  0, "slug": "fool",              "name_en": "The Fool",           "name_zh": "愚者",    "arcana": "major", "suit": None,         "number": 0,  "url": f"{BASE_URL}/tarot-meanings-fool/"},
    {"id":  1, "slug": "magician",          "name_en": "The Magician",       "name_zh": "魔術師",  "arcana": "major", "suit": None,         "number": 1,  "url": f"{BASE_URL}/tarot-meanings-magician/"},
    {"id":  2, "slug": "high-priestess",    "name_en": "The High Priestess", "name_zh": "女祭司",  "arcana": "major", "suit": None,         "number": 2,  "url": f"{BASE_URL}/tarot-meanings-high-priestess/"},
    {"id":  3, "slug": "empress",           "name_en": "The Empress",        "name_zh": "皇后",    "arcana": "major", "suit": None,         "number": 3,  "url": f"{BASE_URL}/tarot-meanings-empress/"},
    {"id":  4, "slug": "emperor",           "name_en": "The Emperor",        "name_zh": "國王",    "arcana": "major", "suit": None,         "number": 4,  "url": f"{BASE_URL}/tarot-meanings-emperor/"},
    {"id":  5, "slug": "hierophant",        "name_en": "The Hierophant",     "name_zh": "教皇",    "arcana": "major", "suit": None,         "number": 5,  "url": f"{BASE_URL}/tarot-meanings-hierophant/"},
    {"id":  6, "slug": "lovers",            "name_en": "The Lovers",         "name_zh": "戀人",    "arcana": "major", "suit": None,         "number": 6,  "url": f"{BASE_URL}/tarot-meanings-lovers/"},
    {"id":  7, "slug": "chariot",           "name_en": "The Chariot",        "name_zh": "戰車",    "arcana": "major", "suit": None,         "number": 7,  "url": f"{BASE_URL}/tarot-meanings-chariot/"},
    {"id":  8, "slug": "strength",          "name_en": "Strength",           "name_zh": "力量",    "arcana": "major", "suit": None,         "number": 8,  "url": f"{BASE_URL}/tarot-meanings-strength/"},
    {"id":  9, "slug": "hermit",            "name_en": "The Hermit",         "name_zh": "隱修者",  "arcana": "major", "suit": None,         "number": 9,  "url": f"{BASE_URL}/tarot-meanings-hermit/"},
    {"id": 10, "slug": "wheel-of-fortune",  "name_en": "Wheel of Fortune",   "name_zh": "命運之輪","arcana": "major", "suit": None,         "number": 10, "url": f"{BASE_URL}/tarot-meanings-wheel-of-fortune/"},
    {"id": 11, "slug": "justice",           "name_en": "Justice",            "name_zh": "正義",    "arcana": "major", "suit": None,         "number": 11, "url": f"{BASE_URL}/tarot-meanings-justice/"},
    {"id": 12, "slug": "hanged-man",        "name_en": "The Hanged Man",     "name_zh": "懸吊者",  "arcana": "major", "suit": None,         "number": 12, "url": f"{BASE_URL}/tarot-meanings-hanged-man/"},
    {"id": 13, "slug": "death",             "name_en": "Death",              "name_zh": "死亡",    "arcana": "major", "suit": None,         "number": 13, "url": f"{BASE_URL}/tarot-meanings-death/"},
    {"id": 14, "slug": "temperance",        "name_en": "Temperance",         "name_zh": "節制",    "arcana": "major", "suit": None,         "number": 14, "url": f"{BASE_URL}/tarot-meanings-temperance/"},
    {"id": 15, "slug": "devil",             "name_en": "The Devil",          "name_zh": "惡魔",    "arcana": "major", "suit": None,         "number": 15, "url": f"{BASE_URL}/tarot-meanings-devil/"},
    {"id": 16, "slug": "tower",             "name_en": "The Tower",          "name_zh": "高塔",    "arcana": "major", "suit": None,         "number": 16, "url": f"{BASE_URL}/tarot-meanings-tower/"},
    {"id": 17, "slug": "star",              "name_en": "The Star",           "name_zh": "星星",    "arcana": "major", "suit": None,         "number": 17, "url": f"{BASE_URL}/tarot-meanings-star/"},
    {"id": 18, "slug": "moon",              "name_en": "The Moon",           "name_zh": "月亮",    "arcana": "major", "suit": None,         "number": 18, "url": f"{BASE_URL}/tarot-meanings-moon/"},
    {"id": 19, "slug": "sun",               "name_en": "The Sun",            "name_zh": "太陽",    "arcana": "major", "suit": None,         "number": 19, "url": f"{BASE_URL}/tarot-meanings-sun/"},
    {"id": 20, "slug": "judgement",         "name_en": "Judgement",          "name_zh": "審判",    "arcana": "major", "suit": None,         "number": 20, "url": f"{BASE_URL}/tarot-meanings-judgement/"},
    {"id": 21, "slug": "world",             "name_en": "The World",          "name_zh": "世界",    "arcana": "major", "suit": None,         "number": 21, "url": f"{BASE_URL}/tarot-meanings-world/"},

    # ── Minor Arcana — Wands (22–31) ─────────────────────────────────────────
    {"id": 22, "slug": "wands-ace",   "name_en": "Ace of Wands",   "name_zh": "權杖王牌", "arcana": "minor", "suit": "wands",     "number": 1,  "url": f"{BASE_URL}/tarot-meanings-wands-ace/"},
    {"id": 23, "slug": "wands-two",   "name_en": "Two of Wands",   "name_zh": "權杖二",   "arcana": "minor", "suit": "wands",     "number": 2,  "url": f"{BASE_URL}/tarot-meanings-wands-two/"},
    {"id": 24, "slug": "wands-three", "name_en": "Three of Wands", "name_zh": "權杖三",   "arcana": "minor", "suit": "wands",     "number": 3,  "url": f"{BASE_URL}/tarot-meanings-wands-three/"},
    {"id": 25, "slug": "wands-four",  "name_en": "Four of Wands",  "name_zh": "權杖四",   "arcana": "minor", "suit": "wands",     "number": 4,  "url": f"{BASE_URL}/tarot-meanings-wands-four/"},
    {"id": 26, "slug": "wands-five",  "name_en": "Five of Wands",  "name_zh": "權杖五",   "arcana": "minor", "suit": "wands",     "number": 5,  "url": f"{BASE_URL}/tarot-meanings-wands-five/"},
    {"id": 27, "slug": "wands-six",   "name_en": "Six of Wands",   "name_zh": "權杖六",   "arcana": "minor", "suit": "wands",     "number": 6,  "url": f"{BASE_URL}/tarot-meanings-wands-six/"},
    {"id": 28, "slug": "wands-seven", "name_en": "Seven of Wands", "name_zh": "權杖七",   "arcana": "minor", "suit": "wands",     "number": 7,  "url": f"{BASE_URL}/tarot-meanings-wands-seven/"},
    {"id": 29, "slug": "wands-eight", "name_en": "Eight of Wands", "name_zh": "權杖八",   "arcana": "minor", "suit": "wands",     "number": 8,  "url": f"{BASE_URL}/tarot-meanings-wands-eight/"},
    {"id": 30, "slug": "wands-nine",  "name_en": "Nine of Wands",  "name_zh": "權杖九",   "arcana": "minor", "suit": "wands",     "number": 9,  "url": f"{BASE_URL}/tarot-meanings-wands-nine/"},
    {"id": 31, "slug": "wands-ten",   "name_en": "Ten of Wands",   "name_zh": "權杖十",   "arcana": "minor", "suit": "wands",     "number": 10, "url": f"{BASE_URL}/tarot-meanings-wands-ten/"},

    # ── Minor Arcana — Cups (32–41) ──────────────────────────────────────────
    {"id": 32, "slug": "cups-ace",   "name_en": "Ace of Cups",   "name_zh": "聖杯王牌", "arcana": "minor", "suit": "cups",      "number": 1,  "url": f"{BASE_URL}/tarot-meanings-cups-ace/"},
    {"id": 33, "slug": "cups-two",   "name_en": "Two of Cups",   "name_zh": "聖杯二",   "arcana": "minor", "suit": "cups",      "number": 2,  "url": f"{BASE_URL}/tarot-meanings-cups-two/"},
    {"id": 34, "slug": "cups-three", "name_en": "Three of Cups", "name_zh": "聖杯三",   "arcana": "minor", "suit": "cups",      "number": 3,  "url": f"{BASE_URL}/tarot-meanings-cups-three/"},
    {"id": 35, "slug": "cups-four",  "name_en": "Four of Cups",  "name_zh": "聖杯四",   "arcana": "minor", "suit": "cups",      "number": 4,  "url": f"{BASE_URL}/tarot-meanings-cups-four/"},
    {"id": 36, "slug": "cups-five",  "name_en": "Five of Cups",  "name_zh": "聖杯五",   "arcana": "minor", "suit": "cups",      "number": 5,  "url": f"{BASE_URL}/tarot-meanings-cups-five/"},
    {"id": 37, "slug": "cups-six",   "name_en": "Six of Cups",   "name_zh": "聖杯六",   "arcana": "minor", "suit": "cups",      "number": 6,  "url": f"{BASE_URL}/tarot-meanings-cups-six/"},
    {"id": 38, "slug": "cups-seven", "name_en": "Seven of Cups", "name_zh": "聖杯七",   "arcana": "minor", "suit": "cups",      "number": 7,  "url": f"{BASE_URL}/tarot-meanings-cups-seven/"},
    {"id": 39, "slug": "cups-eight", "name_en": "Eight of Cups", "name_zh": "聖杯八",   "arcana": "minor", "suit": "cups",      "number": 8,  "url": f"{BASE_URL}/tarot-meanings-cups-eight/"},
    {"id": 40, "slug": "cups-nine",  "name_en": "Nine of Cups",  "name_zh": "聖杯九",   "arcana": "minor", "suit": "cups",      "number": 9,  "url": f"{BASE_URL}/tarot-meanings-cups-nine/"},
    {"id": 41, "slug": "cups-ten",   "name_en": "Ten of Cups",   "name_zh": "聖杯十",   "arcana": "minor", "suit": "cups",      "number": 10, "url": f"{BASE_URL}/tarot-meanings-cups-ten/"},

    # ── Minor Arcana — Swords (42–51) ────────────────────────────────────────
    {"id": 42, "slug": "swords-ace",   "name_en": "Ace of Swords",   "name_zh": "寶劍王牌", "arcana": "minor", "suit": "swords",    "number": 1,  "url": f"{BASE_URL}/tarot-meanings-swords-ace/"},
    {"id": 43, "slug": "swords-two",   "name_en": "Two of Swords",   "name_zh": "寶劍二",   "arcana": "minor", "suit": "swords",    "number": 2,  "url": f"{BASE_URL}/tarot-meanings-swords-two/"},
    {"id": 44, "slug": "swords-three", "name_en": "Three of Swords", "name_zh": "寶劍三",   "arcana": "minor", "suit": "swords",    "number": 3,  "url": f"{BASE_URL}/tarot-meanings-swords-three/"},
    {"id": 45, "slug": "swords-four",  "name_en": "Four of Swords",  "name_zh": "寶劍四",   "arcana": "minor", "suit": "swords",    "number": 4,  "url": f"{BASE_URL}/tarot-meanings-swords-four/"},
    {"id": 46, "slug": "swords-five",  "name_en": "Five of Swords",  "name_zh": "寶劍五",   "arcana": "minor", "suit": "swords",    "number": 5,  "url": f"{BASE_URL}/tarot-meanings-swords-five/"},
    {"id": 47, "slug": "swords-six",   "name_en": "Six of Swords",   "name_zh": "寶劍六",   "arcana": "minor", "suit": "swords",    "number": 6,  "url": f"{BASE_URL}/tarot-meanings-swords-six/"},
    {"id": 48, "slug": "swords-seven", "name_en": "Seven of Swords", "name_zh": "寶劍七",   "arcana": "minor", "suit": "swords",    "number": 7,  "url": f"{BASE_URL}/tarot-meanings-swords-seven/"},
    {"id": 49, "slug": "swords-eight", "name_en": "Eight of Swords", "name_zh": "寶劍八",   "arcana": "minor", "suit": "swords",    "number": 8,  "url": f"{BASE_URL}/tarot-meanings-swords-eight/"},
    {"id": 50, "slug": "swords-nine",  "name_en": "Nine of Swords",  "name_zh": "寶劍九",   "arcana": "minor", "suit": "swords",    "number": 9,  "url": f"{BASE_URL}/tarot-meanings-swords-nine/"},
    {"id": 51, "slug": "swords-ten",   "name_en": "Ten of Swords",   "name_zh": "寶劍十",   "arcana": "minor", "suit": "swords",    "number": 10, "url": f"{BASE_URL}/tarot-meanings-swords-ten/"},

    # ── Minor Arcana — Pentacles (52–61) ─────────────────────────────────────
    {"id": 52, "slug": "pentacles-ace",   "name_en": "Ace of Pentacles",   "name_zh": "錢幣王牌", "arcana": "minor", "suit": "pentacles", "number": 1,  "url": f"{BASE_URL}/tarot-meanings-pentacles-ace/"},
    {"id": 53, "slug": "pentacles-two",   "name_en": "Two of Pentacles",   "name_zh": "錢幣二",   "arcana": "minor", "suit": "pentacles", "number": 2,  "url": f"{BASE_URL}/tarot-meanings-pentacles-two/"},
    {"id": 54, "slug": "pentacles-three", "name_en": "Three of Pentacles", "name_zh": "錢幣三",   "arcana": "minor", "suit": "pentacles", "number": 3,  "url": f"{BASE_URL}/tarot-meanings-pentacles-three/"},
    {"id": 55, "slug": "pentacles-four",  "name_en": "Four of Pentacles",  "name_zh": "錢幣四",   "arcana": "minor", "suit": "pentacles", "number": 4,  "url": f"{BASE_URL}/tarot-meanings-pentacles-four/"},
    {"id": 56, "slug": "pentacles-five",  "name_en": "Five of Pentacles",  "name_zh": "錢幣五",   "arcana": "minor", "suit": "pentacles", "number": 5,  "url": f"{BASE_URL}/tarot-meanings-pentacles-five/"},
    {"id": 57, "slug": "pentacles-six",   "name_en": "Six of Pentacles",   "name_zh": "錢幣六",   "arcana": "minor", "suit": "pentacles", "number": 6,  "url": f"{BASE_URL}/tarot-meanings-pentacles-six/"},
    {"id": 58, "slug": "pentacles-seven", "name_en": "Seven of Pentacles", "name_zh": "錢幣七",   "arcana": "minor", "suit": "pentacles", "number": 7,  "url": f"{BASE_URL}/tarot-meanings-pentacles-seven/"},
    {"id": 59, "slug": "pentacles-eight", "name_en": "Eight of Pentacles", "name_zh": "錢幣八",   "arcana": "minor", "suit": "pentacles", "number": 8,  "url": f"{BASE_URL}/tarot-meanings-pentacles-eight/"},
    {"id": 60, "slug": "pentacles-nine",  "name_en": "Nine of Pentacles",  "name_zh": "錢幣九",   "arcana": "minor", "suit": "pentacles", "number": 9,  "url": f"{BASE_URL}/tarot-meanings-pentacles-nine/"},
    {"id": 61, "slug": "pentacles-ten",   "name_en": "Ten of Pentacles",   "name_zh": "錢幣十",   "arcana": "minor", "suit": "pentacles", "number": 10, "url": f"{BASE_URL}/tarot-meanings-pentacles-ten/"},

    # ── Court Cards — Wands (62–65) ──────────────────────────────────────────
    {"id": 62, "slug": "court-wands-page",   "name_en": "Page of Wands",   "name_zh": "權杖侍衛", "arcana": "court", "suit": "wands",     "number": 11, "url": f"{BASE_URL}/tarot-meanings-court-wands-page/"},
    {"id": 63, "slug": "court-wands-knight", "name_en": "Knight of Wands", "name_zh": "權杖騎士", "arcana": "court", "suit": "wands",     "number": 12, "url": f"{BASE_URL}/tarot-meanings-court-wands-knight/"},
    {"id": 64, "slug": "court-wands-queen",  "name_en": "Queen of Wands",  "name_zh": "權杖皇后", "arcana": "court", "suit": "wands",     "number": 13, "url": f"{BASE_URL}/tarot-meanings-court-wands-queen/"},
    {"id": 65, "slug": "court-wands-king",   "name_en": "King of Wands",   "name_zh": "權杖國王", "arcana": "court", "suit": "wands",     "number": 14, "url": f"{BASE_URL}/tarot-meanings-court-wands-king/"},

    # ── Court Cards — Cups (66–69) ───────────────────────────────────────────
    {"id": 66, "slug": "court-cups-page",   "name_en": "Page of Cups",   "name_zh": "聖杯侍衛", "arcana": "court", "suit": "cups",      "number": 11, "url": f"{BASE_URL}/tarot-meanings-court-cups-page/"},
    {"id": 67, "slug": "court-cups-knight", "name_en": "Knight of Cups", "name_zh": "聖杯騎士", "arcana": "court", "suit": "cups",      "number": 12, "url": f"{BASE_URL}/tarot-meanings-court-cups-knight/"},
    {"id": 68, "slug": "court-cups-queen",  "name_en": "Queen of Cups",  "name_zh": "聖杯皇后", "arcana": "court", "suit": "cups",      "number": 13, "url": f"{BASE_URL}/tarot-meanings-court-cups-queen/"},
    {"id": 69, "slug": "court-cups-king",   "name_en": "King of Cups",   "name_zh": "聖杯國王", "arcana": "court", "suit": "cups",      "number": 14, "url": f"{BASE_URL}/tarot-meanings-court-cups-king/"},

    # ── Court Cards — Swords (70–73) ─────────────────────────────────────────
    {"id": 70, "slug": "court-swords-page",   "name_en": "Page of Swords",   "name_zh": "寶劍侍衛", "arcana": "court", "suit": "swords",    "number": 11, "url": f"{BASE_URL}/tarot-meanings-court-swords-page/"},
    {"id": 71, "slug": "court-swords-knight", "name_en": "Knight of Swords", "name_zh": "寶劍騎士", "arcana": "court", "suit": "swords",    "number": 12, "url": f"{BASE_URL}/tarot-meanings-court-swords-knight/"},
    {"id": 72, "slug": "court-swords-queen",  "name_en": "Queen of Swords",  "name_zh": "寶劍皇后", "arcana": "court", "suit": "swords",    "number": 13, "url": f"{BASE_URL}/tarot-meanings-court-swords-queen/"},
    {"id": 73, "slug": "court-swords-king",   "name_en": "King of Swords",   "name_zh": "寶劍國王", "arcana": "court", "suit": "swords",    "number": 14, "url": f"{BASE_URL}/tarot-meanings-court-swords-king/"},

    # ── Court Cards — Pentacles (74–77) ──────────────────────────────────────
    {"id": 74, "slug": "court-pentacles-page",   "name_en": "Page of Pentacles",   "name_zh": "錢幣侍衛", "arcana": "court", "suit": "pentacles", "number": 11, "url": f"{BASE_URL}/tarot-meanings-court-pentacles-page/"},
    {"id": 75, "slug": "court-pentacles-knight", "name_en": "Knight of Pentacles", "name_zh": "錢幣騎士", "arcana": "court", "suit": "pentacles", "number": 12, "url": f"{BASE_URL}/tarot-meanings-court-pentacles-knight/"},
    {"id": 76, "slug": "court-pentacles-queen",  "name_en": "Queen of Pentacles",  "name_zh": "錢幣皇后", "arcana": "court", "suit": "pentacles", "number": 13, "url": f"{BASE_URL}/tarot-meanings-court-pentacles-queen/"},
    {"id": 77, "slug": "court-pentacles-king",   "name_en": "King of Pentacles",   "name_zh": "錢幣國王", "arcana": "court", "suit": "pentacles", "number": 14, "url": f"{BASE_URL}/tarot-meanings-court-pentacles-king/"},
]

assert len(CARD_LIST) == 78, f"Expected 78 cards, got {len(CARD_LIST)}"
