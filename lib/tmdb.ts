/**
 * TMDB API Utility for MFLIX
 * Complete with in-memory cache (5 min TTL) + all regional functions.
 */

const TMDB_API_KEY = "aa844700ff3f44363be5bf50f78df0b1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// In-memory cache: key -> { data, expiry }
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const TMDB_IMAGE_SIZES = {
  poster: "w500",
  backdrop: "w1280",  // NEVER "original" — too slow
  profile: "w185",
  still: "w300",
  logo: "w300",
};

export const getImageUrl = (path: string | null, size: keyof typeof TMDB_IMAGE_SIZES = "poster") => {
  if (!path) return "https://picsum.photos/500/750?grayscale";
  return `${IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES[size]}${path}`;
};

// Export cache for settings page "Clear Cache" button
export const clearTmdbCache = () => cache.clear();

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const cacheKey = `${endpoint}?${queryParams}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) throw new Error(`TMDB API Error: ${response.statusText}`);

  const data = await response.json();
  cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}

export const tmdb = {
  // ── CORE ──
  getTrending: (type: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "day", page = 1) =>
    fetchTMDB(`/trending/${type}/${timeWindow}`, { page: `${page}` }),
  getTopRated: (type: "movie" | "tv" = "movie", page = 1) =>
    fetchTMDB(`/${type}/top_rated`, { page: `${page}` }),
  getPopular: (type: "movie" | "tv" = "movie", page = 1) =>
    fetchTMDB(`/${type}/popular`, { page: `${page}` }),
  getNowPlaying: (page = 1) =>
    fetchTMDB("/movie/now_playing", { page: `${page}` }),
  getUpcoming: (page = 1) =>
    fetchTMDB("/movie/upcoming", { page: `${page}` }),
  getAiringToday: (page = 1) =>
    fetchTMDB("/tv/airing_today", { page: `${page}` }),

  // ── DETAILS ──
  getMovieDetails: (id: number) =>
    fetchTMDB(`/movie/${id}`, {
      append_to_response: "videos,credits,similar,recommendations,release_dates,watch/providers",
    }),
  getTVDetails: (id: number) =>
    fetchTMDB(`/tv/${id}`, {
      append_to_response: "videos,credits,similar,recommendations,content_ratings,watch/providers",
    }),
  getSeasonDetails: (tvId: number, season: number) =>
    fetchTMDB(`/tv/${tvId}/season/${season}`),
  getEpisodeDetails: (tvId: number, season: number, ep: number) =>
    fetchTMDB(`/tv/${tvId}/season/${season}/episode/${ep}`),
  getPersonDetails: (id: number) =>
    fetchTMDB(`/person/${id}`, { append_to_response: "movie_credits,tv_credits,images" }),
  getVideos: (type: "movie" | "tv", id: number) =>
    fetchTMDB(`/${type}/${id}/videos`),
  getGenres: (type: "movie" | "tv" = "movie") =>
    fetchTMDB(`/genre/${type}/list`),
  getCredits: (type: "movie" | "tv", id: number) =>
    fetchTMDB(`/${type}/${id}/credits`),

  // ── SEARCH ──
  search: (query: string, page = 1) =>
    fetchTMDB("/search/multi", { query, page: `${page}` }),
  searchMovies: (query: string, page = 1) =>
    fetchTMDB("/search/movie", { query, page: `${page}` }),
  searchTV: (query: string, page = 1) =>
    fetchTMDB("/search/tv", { query, page: `${page}` }),
  searchPerson: (query: string, page = 1) =>
    fetchTMDB("/search/person", { query, page: `${page}` }),

  // ── DISCOVER ──
  discoverByGenre: (type: "movie" | "tv", genreIds: string, page = 1, sortBy = "popularity.desc") =>
    fetchTMDB(`/discover/${type}`, { with_genres: genreIds, sort_by: sortBy, page: `${page}` }),
  discoverByLanguage: (lang: string, type = "movie", page = 1) =>
    fetchTMDB(`/discover/${type}`, { with_original_language: lang, sort_by: "popularity.desc", page: `${page}` }),
  discoverByYear: (year: number, type = "movie", page = 1) =>
    fetchTMDB(`/discover/${type}`, { primary_release_year: `${year}`, sort_by: "popularity.desc", page: `${page}` }),
  discoverByRating: (min: number, type = "movie", page = 1) =>
    fetchTMDB(`/discover/${type}`, { "vote_average.gte": `${min}`, "vote_count.gte": "100", sort_by: "vote_average.desc", page: `${page}` }),

  // ── INDIA ──
  getBollywood: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "hi", sort_by: "popularity.desc", page: `${page}` }),
  getBollywoodTopRated: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "hi", sort_by: "vote_average.desc", "vote_count.gte": "100", page: `${page}` }),
  getSouthIndian: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "te", with_origin_country: "IN", sort_by: "popularity.desc", page: `${page}` }),
  getTamilMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "ta", sort_by: "popularity.desc", page: `${page}` }),
  getTeluguMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "te", sort_by: "popularity.desc", page: `${page}` }),
  getMalayalamMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "ml", sort_by: "popularity.desc", page: `${page}` }),
  getPunjabiMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "pa", sort_by: "popularity.desc", page: `${page}` }),
  getMarathiMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "mr", sort_by: "popularity.desc", page: `${page}` }),
  getBengaliMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "bn", sort_by: "popularity.desc", page: `${page}` }),
  getGujaratiMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "gu", sort_by: "popularity.desc", page: `${page}` }),
  getIndianWebSeries: (page = 1) =>
    fetchTMDB("/discover/tv", { with_original_language: "hi", sort_by: "popularity.desc", page: `${page}` }),

  // ── PAKISTAN ──
  getPakistaniMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "ur", sort_by: "popularity.desc", page: `${page}` }),
  getPakistaniDramas: (page = 1) =>
    fetchTMDB("/discover/tv", { with_original_language: "ur", sort_by: "popularity.desc", page: `${page}` }),

  // ── ANIME ──
  getAnime: (page = 1) =>
    fetchTMDB("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc", page: `${page}` }),
  getAnimeTopRated: (page = 1) =>
    fetchTMDB("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "vote_average.desc", "vote_count.gte": "200", page: `${page}` }),
  getAnimeMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc", page: `${page}` }),

  // ── KOREAN ──
  getKoreanDramas: (page = 1) =>
    fetchTMDB("/discover/tv", { with_original_language: "ko", sort_by: "popularity.desc", page: `${page}` }),
  getKoreanMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "ko", sort_by: "popularity.desc", page: `${page}` }),

  // ── HOLLYWOOD ──
  getHollywood: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "en", sort_by: "popularity.desc", page: `${page}` }),
  getHollywoodTopRated: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "en", sort_by: "vote_average.desc", "vote_count.gte": "500", page: `${page}` }),

  // ── STREAMING PLATFORMS ──
  getNetflixShows: (page = 1) =>
    fetchTMDB("/discover/tv", { with_networks: "213", sort_by: "popularity.desc", page: `${page}` }),
  getAmazonShows: (page = 1) =>
    fetchTMDB("/discover/tv", { with_networks: "1024", sort_by: "popularity.desc", page: `${page}` }),
  getDisneyShows: (page = 1) =>
    fetchTMDB("/discover/tv", { with_networks: "2739", sort_by: "popularity.desc", page: `${page}` }),
  getHBOShows: (page = 1) =>
    fetchTMDB("/discover/tv", { with_networks: "49", sort_by: "popularity.desc", page: `${page}` }),

  // ── WORLD ──
  getJapaneseMovies: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "ja", sort_by: "popularity.desc", page: `${page}` }),
  getSpanishContent: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "es", sort_by: "popularity.desc", page: `${page}` }),
  getFrenchContent: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "fr", sort_by: "popularity.desc", page: `${page}` }),
  getChineseContent: (page = 1) =>
    fetchTMDB("/discover/movie", { with_original_language: "zh", sort_by: "popularity.desc", page: `${page}` }),
  getTurkishContent: (page = 1) =>
    fetchTMDB("/discover/tv", { with_original_language: "tr", sort_by: "popularity.desc", page: `${page}` }),
};

export type Genre = { id: number; name: string };
export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
  original_language?: string;
};
