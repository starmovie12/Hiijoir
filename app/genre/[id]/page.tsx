'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { BottomNav } from '@/components/BottomNav';

const GENRE_EMOJIS: Record<number, string> = {
  28: '💥', 12: '🗺️', 16: '🎌', 35: '😂', 80: '🔫',
  99: '📽️', 18: '🎭', 10751: '👨‍👩‍👧', 14: '🧙', 36: '🏛️',
  27: '👻', 10402: '🎵', 9648: '🔍', 10749: '❤️', 878: '🚀',
  10770: '📺', 53: '🔪', 10752: '⚔️', 37: '🤠',
};

const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export default function GenrePage() {
  const params = useParams();
  const router = useRouter();
  const genreId = Number(params.id);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const fetchMovies = useCallback(async (p = 1, reset = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const res = await tmdb.discoverByGenre(contentType, `${genreId}`, p, sortBy);
      if (reset) setMovies(res.results);
      else setMovies(prev => [...prev, ...res.results]);
      setPage(p);
      setHasMore(res.results.length > 0 && p < 10);
    } catch {}
    finally { setLoading(false); fetchingRef.current = false; }
  }, [genreId, contentType, sortBy]);

  useEffect(() => { fetchMovies(1, true); }, [fetchMovies]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting && hasMore) fetchMovies(page + 1); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [fetchMovies, hasMore, page]);

  const emoji = GENRE_EMOJIS[genreId] || '🎬';
  const name = GENRE_NAMES[genreId] || `Genre ${genreId}`;

  return (
    <div className="min-h-screen bg-[#03060f] px-4 md:px-8 lg:px-12 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
          {emoji} {name}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {(['movie', 'tv'] as const).map(t => (
            <button key={t} onClick={() => setContentType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${contentType === t ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
              {t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['popularity.desc', 'Popular'], ['vote_average.desc', 'Top Rated'], ['primary_release_date.desc', 'Newest']].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${sortBy === val ? 'bg-white/20 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />)}
        {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {loading && !movies.length && <Loader2 className="text-red-600 animate-spin" />}
      </div>

      <BottomNav />
    </div>
  );
}
