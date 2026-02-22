'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { tmdb } from '@/lib/tmdb';
import { LANGUAGE_MAP } from '@/lib/constants';
import { MovieCard } from '@/components/MovieCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { BottomNav } from '@/components/BottomNav';

const LANG_FLAGS: Record<string, string> = {
  hi: '🇮🇳', en: '🇺🇸', ta: '🇮🇳', te: '🇮🇳', ml: '🇮🇳',
  pa: '🇮🇳', mr: '🇮🇳', bn: '🇧🇩', gu: '🇮🇳', ur: '🇵🇰',
  ja: '🇯🇵', ko: '🇰🇷', es: '🇪🇸', fr: '🇫🇷', zh: '🇨🇳',
  tr: '🇹🇷', de: '🇩🇪', it: '🇮🇹', ru: '🇷🇺',
};

export default function LanguagePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const fetchContent = useCallback(async (p = 1, reset = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const res = await tmdb.discoverByLanguage(code, contentType, p);
      if (reset) setMovies(res.results);
      else setMovies(prev => [...prev, ...res.results]);
      setPage(p);
      setHasMore(res.results.length > 0 && p < 10);
    } catch {}
    finally { setLoading(false); fetchingRef.current = false; }
  }, [code, contentType]);

  useEffect(() => { fetchContent(1, true); }, [fetchContent]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      e => { if (e[0].isIntersecting && hasMore) fetchContent(page + 1); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [fetchContent, hasMore, page]);

  const flag = LANG_FLAGS[code] || '🌐';
  const langName = LANGUAGE_MAP[code] || code.toUpperCase();

  return (
    <div className="min-h-screen bg-[#03060f] px-4 md:px-8 lg:px-12 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
          {flag} {langName} Cinema
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(['movie', 'tv'] as const).map(t => (
          <button key={t} onClick={() => setContentType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${contentType === t ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {t === 'movie' ? 'Movies' : 'TV Series'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />)}
        {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div ref={sentinelRef} className="h-8" />
      <BottomNav />
    </div>
  );
}
