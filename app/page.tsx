'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuroraBackground } from '@/components/AuroraBackground';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { MoodFilter } from '@/components/MoodFilter';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { tmdb, Movie, Genre } from '@/lib/tmdb';
import { SkeletonRow } from '@/components/SkeletonCard';

export default function MflixHome() {
  const router = useRouter();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [bollywood, setBollywood] = useState<Movie[]>([]);
  const [bollywoodTopRated, setBollywoodTopRated] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [animeTopRated, setAnimeTopRated] = useState<Movie[]>([]);
  const [hollywoodTop, setHollywoodTop] = useState<Movie[]>([]);
  const [netflixShows, setNetflixShows] = useState<Movie[]>([]);
  const [moodMovies, setMoodMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [visibleGenresCount, setVisibleGenresCount] = useState(2);
  const [history, setHistory] = useState<any[]>([]);
  const [becauseYouWatched, setBecauseYouWatched] = useState<{ title: string; movies: Movie[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const bottomObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load continue watching from history
    try {
      const h = JSON.parse(localStorage.getItem('mflix_history') || '[]');
      setHistory(h);

      // "Because you watched" row from last history item
      if (h.length > 0) {
        const last = h[0];
        tmdb.getMovieDetails(last.id)
          .then((data: any) => {
            const similar = data?.similar?.results || data?.recommendations?.results || [];
            if (similar.length > 0) {
              setBecauseYouWatched({ title: last.title || last.name || 'Something', movies: similar });
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadPhase1 = async () => {
      try {
        const [trendingRes, bollywoodRes, genresRes] = await Promise.all([
          tmdb.getTrending('all', 'week'),
          tmdb.getBollywood(),
          tmdb.getGenres('movie'),
        ]);
        setTrending(trendingRes.results);
        setBollywood(bollywoodRes.results);
        setMoodMovies(trendingRes.results);
        setGenres(genresRes.genres);
        setLoading(false);
      } catch {}
    };
    loadPhase1();
  }, []);

  useEffect(() => {
    if (loading) return;
    const loadPhase2 = async () => {
      try {
        const [popularRes, topRatedRes, bollywoodTopRes, hollywoodTopRes, animeTopRes, netflixRes] = await Promise.all([
          tmdb.getPopular('movie'),
          tmdb.getTopRated('movie'),
          tmdb.getBollywoodTopRated(),
          tmdb.getHollywoodTopRated(),
          tmdb.getAnimeTopRated(),
          tmdb.getNetflixShows(),
        ]);
        setPopular(popularRes.results);
        setTopRated(topRatedRes.results);
        setBollywoodTopRated(bollywoodTopRes.results);
        setHollywoodTop(hollywoodTopRes.results);
        setAnimeTopRated(animeTopRes.results);
        setNetflixShows(netflixRes.results);
      } catch {}
    };
    loadPhase2();
  }, [loading]);

  // Lazy load more genre rows
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleGenresCount(c => Math.min(c + 2, genres.length));
        }
      },
      { threshold: 0.1 }
    );
    if (bottomObserverRef.current) observer.observe(bottomObserverRef.current);
    return () => observer.disconnect();
  }, [genres.length]);

  // Surprise Me — navigate to random trending movie
  const handleSurpriseMe = useCallback(() => {
    if (trending.length > 0) {
      const random = trending[Math.floor(Math.random() * trending.length)];
      const type = random.media_type || (random.name && !random.title ? 'tv' : 'movie');
      router.push(`/player/${random.id}?type=${type}`);
    }
  }, [trending, router]);

  return (
    <main className="relative min-h-screen bg-[#03060f]">
      <AuroraBackground />
      <Navbar />

      {/* Surprise Me button */}
      <div className="absolute top-4 right-20 md:right-40 z-40">
        <button
          onClick={handleSurpriseMe}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/20 transition-all"
        >
          <Shuffle size={16} /> <span className="hidden sm:inline">Surprise Me</span>
        </button>
      </div>

      {/* Hero Banner */}
      <HeroBanner movies={trending.slice(0, 5)} />

      {/* Continue Watching */}
      {history.length > 0 && (
        <div className="py-4 md:py-6 px-4 md:px-8 lg:px-12">
          <h2 className="text-lg md:text-2xl font-black tracking-tighter text-white uppercase italic mb-4">
            ▶ Continue Watching
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {history.slice(0, 10).map((item: any) => (
              <a
                key={`${item.id}-${item.type}`}
                href={`/player/${item.id}?type=${item.type}`}
                className="flex-shrink-0 w-36 md:w-44 rounded-xl overflow-hidden bg-[#1a1f2e] border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="relative" style={{ aspectRatio: '2/3' }}>
                  {item.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full shimmer bg-white/10" />
                  )}
                  {/* Progress bar placeholder */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-red-600 w-1/3" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5 fill-black"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-bold line-clamp-1">{item.title || item.name}</p>
                  {item.type === 'tv' && item.season && (
                    <p className="text-gray-500 text-[10px]">S{item.season} E{item.episode}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mood Filter */}
      <MoodFilter onMoodChange={(movies: Movie[]) => setMoodMovies(movies)} />
      {moodMovies.length > 0 && <MovieRow title="🎭 Based on Your Mood" movies={moodMovies} />}

      {/* Because You Watched */}
      {becauseYouWatched && (
        <MovieRow title={`💡 Because You Watched ${becauseYouWatched.title}`} movies={becauseYouWatched.movies} />
      )}

      {/* Top 10 rows */}
      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        <>
          <MovieRow title="🇮🇳 Top 10 Bollywood" movies={bollywood.slice(0, 10)} isTop10 />
          <MovieRow title="🎬 Top 10 Hollywood" movies={topRated.slice(0, 10)} isTop10 />
          <MovieRow title="🌊 Top 10 Anime" movies={animeTopRated.slice(0, 10)} isTop10 />
          <MovieRow title="📺 Top 10 Web Series" movies={netflixShows.slice(0, 10)} isTop10 />
          <MovieRow title="🔥 Top 10 Trending Today" movies={trending.slice(0, 10)} isTop10 />
        </>
      )}

      {/* Regular rows */}
      <MovieRow title="🎭 Bollywood Latest Hits" movies={bollywood} />
      <MovieRow title="🎶 South Indian Blockbusters" fetchFn={tmdb.getSouthIndian} />
      <MovieRow title="🌟 Tamil Cinema" fetchFn={tmdb.getTamilMovies} />
      <MovieRow title="⭐ Telugu Blockbusters" fetchFn={tmdb.getTeluguMovies} />
      <MovieRow title="🎵 Punjabi Movies" fetchFn={tmdb.getPunjabiMovies} />
      <MovieRow title="🏆 Malayalam Cinema" fetchFn={tmdb.getMalayalamMovies} />
      <MovieRow title="🌺 Marathi Movies" fetchFn={tmdb.getMarathiMovies} />
      <MovieRow title="🎨 Bengali Cinema" fetchFn={tmdb.getBengaliMovies} />
      <MovieRow title="📱 Indian Web Series" fetchFn={tmdb.getIndianWebSeries} />
      <MovieRow title="🇵🇰 Pakistani Dramas" fetchFn={tmdb.getPakistaniDramas} />
      <MovieRow title="🎌 Anime Series" fetchFn={tmdb.getAnime} />
      <MovieRow title="🇰🇷 K-Dramas" fetchFn={tmdb.getKoreanDramas} />
      <MovieRow title="🇰🇷 Korean Movies" fetchFn={tmdb.getKoreanMovies} />
      <MovieRow title="🎬 Hollywood Popular" movies={popular} />
      <MovieRow title="🏅 Hollywood Top Rated" movies={hollywoodTop} />
      <MovieRow title="🇯🇵 Japanese Movies" fetchFn={tmdb.getJapaneseMovies} />
      <MovieRow title="🇪🇸 Spanish Cinema" fetchFn={tmdb.getSpanishContent} />
      <MovieRow title="🇫🇷 French Cinema" fetchFn={tmdb.getFrenchContent} />
      <MovieRow title="🇹🇷 Turkish Dramas" fetchFn={tmdb.getTurkishContent} />
      <MovieRow title="📺 Netflix Originals" movies={netflixShows} />
      <MovieRow title="📦 Amazon Originals" fetchFn={tmdb.getAmazonShows} />

      {/* Genre rows — lazy loaded */}
      {genres.slice(0, visibleGenresCount).map(genre => (
        <MovieRow
          key={genre.id}
          title={`🎭 ${genre.name}`}
          genreId={genre.id}
          type="movie"
        />
      ))}

      {/* Bottom observer for lazy genre loading */}
      <div ref={bottomObserverRef} className="h-8 flex items-center justify-center">
        {visibleGenresCount < genres.length && (
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <footer className="text-center py-8 text-gray-600 text-xs">
        <p>MFLIX — This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>

      <BottomNav />
    </main>
  );
}
