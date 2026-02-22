// Demo video — free public domain (fallback)
export const DEMO_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Embed servers — {id} = TMDB id
export const EMBED_SERVERS = [
  {
    name: "Server 1",
    icon: "🎬",
    getUrl: (id: number, type: "movie" | "tv", season = 1, episode = 1) =>
      type === "tv"
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    name: "Server 2",
    icon: "⚡",
    getUrl: (id: number, type: "movie" | "tv", season = 1, episode = 1) =>
      type === "tv"
        ? `https://2embed.org/embed/tv?id=${id}&s=${season}&e=${episode}`
        : `https://2embed.org/embed/movie?id=${id}`,
  },
  {
    name: "Server 3",
    icon: "🌐",
    getUrl: (id: number, type: "movie" | "tv", season = 1, episode = 1) =>
      type === "tv"
        ? `https://multiembed.mov/?tmdb=1&video_id=${id}&s=${season}&e=${episode}`
        : `https://multiembed.mov/?tmdb=1&video_id=${id}`,
  },
];

export const LANGUAGE_MAP: Record<string, string> = {
  hi: "HINDI",
  en: "ENGLISH",
  ta: "TAMIL",
  te: "TELUGU",
  ml: "MALAY",
  pa: "PUNJABI",
  mr: "MARATHI",
  bn: "BENGALI",
  gu: "GUJARATI",
  ur: "URDU",
  ja: "ANIME",
  ko: "KOREAN",
  es: "SPANISH",
  fr: "FRENCH",
  zh: "CHINESE",
  kn: "KANNADA",
  tr: "TURKISH",
  de: "GERMAN",
  it: "ITALIAN",
  ru: "RUSSIAN",
};
