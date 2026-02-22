'use client';

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { SkeletonRow } from './SkeletonCard';
import { Movie, tmdb } from '@/lib/tmdb';

interface MovieRowProps {
  title: string;
  movies?: Movie[];
  isTop10?: boolean;
  genreId?: number;
  type?: 'movie' | 'tv' | 'trending';
  fetchFn?: (page?: number) => Promise<any>; // KEY PROP: pass any tmdb.getXxx function
}

export const MovieRow = memo(({
  title,
  movies: init = [],
  isTop10 = false,
  genreId,
  type = 'movie',
  fetchFn,
}: MovieRowProps) => {
  const [movies, setMovies] = useState<Movie[]>(init);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(init.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // Sync when parent passes new movies
  useEffect(() => {
    if (init.length > 0) {
      setMovies(init);
      setPage(1);
      setHasMore(true);
      setInitialLoaded(true);
    }
  }, [init]);

  // Fetch initial batch if no movies given
  useEffect(() => {
    if (init.length > 0 || fetchingRef.current || initialLoaded) return;
    const load = async () => {
      fetchingRef.current = true;
      setLoading(true);
      try {
        let res;
        if (fetchFn) res = await fetchFn(1);
        else if (type === 'trending') res = await tmdb.getTrending('all', 'week', 1);
        else if (genreId) res = await tmdb.discoverByGenre(type, `${genreId}`, 1);
        else if (title.toLowerCase().includes('top rated')) res = await tmdb.getTopRated(type, 1);
        else res = await tmdb.getPopular(type, 1);
        if (res?.results?.length) {
          setMovies(res.results);
          setInitialLoaded(true);
        }
      } catch {}
      finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    load();
  }, [genreId, type, fetchFn, init.length, title, initialLoaded]);

  // Infinite scroll — load more when sentinel visible
  const fetchMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore || !initialLoaded) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const next = page + 1;
      let res;
      if (fetchFn) res = await fetchFn(next);
      else if (type === 'trending') res = await tmdb.getTrending('all', 'week', next);
      else if (genreId) res = await tmdb.discoverByGenre(type, `${genreId}`, next);
      else if (title.toLowerCase().includes('top rated')) res = await tmdb.getTopRated(type, next);
      else res = await tmdb.getPopular(type, next);
      if (!res?.results?.length || next > 10) {
        setHasMore(false);
      } else {
        setMovies(p => [...p, ...res.results]);
        setPage(next);
      }
    } catch {}
    finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, hasMore, initialLoaded, type, genreId, fetchFn, title]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting) fetchMore(); },
      { threshold: 0.1, rootMargin: '0px 300px 0px 0px' }
    );
    if (sentinelRef.current) obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [fetchMore]);

  // Show skeleton row while loading initial data
  if (!initialLoaded && loading) return <SkeletonRow />;
  // Hide row if no data and not loading
  if (movies.length === 0 && !loading) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: dir === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group py-4 md:py-8">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mb-2 md:mb-4">
        <h2 className="text-lg md:text-2xl 2xl:text-4xl font-black tracking-tighter text-white uppercase italic">
          {title}
        </h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-4 px-4 md:px-8 lg:px-12 overflow-x-auto no-scrollbar pb-4 snap-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {movies.map((movie, i) => (
          <div
            key={`${movie.id}-${i}`}
            className={`${isTop10
              ? 'min-w-[70%] md:min-w-[320px] lg:min-w-[400px]'
              : 'min-w-[28.5%] md:min-w-[20%] lg:min-w-[16.66%] xl:min-w-[12.5%]'
              } relative snap-start flex-shrink-0`}
          >
            {isTop10 && (
              <div className="absolute -left-4 bottom-0 z-40 pointer-events-none select-none">
                <span
                  className="text-[80px] md:text-[120px] lg:text-[180px] font-black leading-none text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] stroke-num"
                  style={{ WebkitTextStroke: '2px rgba(255,255,255,0.5)' }}
                >
                  {i + 1}
                </span>
              </div>
            )}
            <div className={isTop10 ? 'pl-8 md:pl-12' : ''}>
              <MovieCard movie={movie} index={i} />
            </div>
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="min-w-[30px] flex items-center justify-center flex-shrink-0">
          {loading && <Loader2 className="text-red-600 animate-spin w-6 h-6" />}
        </div>
      </div>
    </div>
  );
});

MovieRow.displayName = 'MovieRow';
