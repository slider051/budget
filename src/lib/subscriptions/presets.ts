import type {
  SubscriptionCategory,
  SubscriptionCurrency,
} from "@/types/subscription";

export interface SubscriptionPreset {
  readonly key: string;
  readonly name: string;
  readonly category: SubscriptionCategory;
  readonly defaultPrice: number;
  readonly currency: SubscriptionCurrency;
  readonly logoUrl: string;
}

export const SUBSCRIPTION_PRESETS: readonly SubscriptionPreset[] = [
  {
    key: "youtube-premium",
    name: "YouTube Premium",
    category: "ott",
    defaultPrice: 14900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/youtube.com",
  },
  {
    key: "disney-plus",
    name: "Disney+",
    category: "ott",
    defaultPrice: 9900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/disneyplus.com",
  },
  {
    key: "laftel",
    name: "라프텔",
    category: "ott",
    defaultPrice: 9900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/laftel.net",
  },
  {
    key: "tving",
    name: "TVING",
    category: "ott",
    defaultPrice: 13900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/tving.com",
  },
  {
    key: "coupang-play",
    name: "쿠팡플레이",
    category: "ott",
    defaultPrice: 7890,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/coupangplay.com",
  },
  {
    key: "wavve",
    name: "Wavve",
    category: "ott",
    defaultPrice: 10900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/wavve.com",
  },
  {
    key: "grok",
    name: "Grok",
    category: "ai",
    defaultPrice: 40,
    currency: "USD",
    logoUrl: "https://logo.clearbit.com/x.ai",
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    category: "ai",
    defaultPrice: 20,
    currency: "USD",
    logoUrl: "https://logo.clearbit.com/openai.com",
  },
  {
    key: "gemini",
    name: "Gemini",
    category: "ai",
    defaultPrice: 29000,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/gemini.google.com",
  },
  {
    key: "cursor",
    name: "Cursor",
    category: "ai",
    defaultPrice: 20,
    currency: "USD",
    logoUrl: "https://logo.clearbit.com/cursor.com",
  },
  {
    key: "naver-membership",
    name: "네이버멤버십",
    category: "shopping",
    defaultPrice: 4900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/naver.com",
  },
  {
    key: "baemin-club",
    name: "배민클럽",
    category: "shopping",
    defaultPrice: 3990,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/baemin.com",
  },
  {
    key: "melon",
    name: "멜론",
    category: "music",
    defaultPrice: 10900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/melon.com",
  },
  {
    key: "ridiselect",
    name: "리디셀렉트",
    category: "reading",
    defaultPrice: 4900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/ridibooks.com",
  },
  {
    key: "millie",
    name: "밀리의서재",
    category: "reading",
    defaultPrice: 9900,
    currency: "KRW",
    logoUrl: "https://logo.clearbit.com/millie.co.kr",
  },
];

export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  ott: "OTT",
  ai: "AI",
  shopping: "쇼핑 멤버십",
  music: "음악",
  reading: "독서",
  other: "기타",
};

export const CURRENCY_LABELS: Record<SubscriptionCurrency, string> = {
  KRW: "원화 (KRW)",
  USD: "달러 (USD)",
  JPY: "엔화 (JPY)",
};
