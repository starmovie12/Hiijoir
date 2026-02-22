'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdb, getImageUrl } from '@/lib/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';

type TabType = 'all' | 'movies' | 'tv' | 'anime' | 'people';
type LangFilter = 'all' | 'hi' | 'en' | 'ta' | 'te' | 'ko' | 'ja' | 'ur';
type RatingFilter = 'all' | '9' | '8' | '7';

const SUGGESTION_CHIPS = [
  'Bollywood Hits', 'South Indian Action', 'Korean Drama',
  '90s Hollywood', 'Studio Ghibli', 'Pakistani Drama',
  'Dark Thriller', 'Sci-Fi', 'Epic Fantasy', 'Romantic Comedy',
];

const YEAR_OPTIONS = ['All', '2024', '2023', '2022', '2020s', '2010s', '2000s', '90s'];
const LANG_OPTIONS: { label: string; value: LangFilter }[] = [
  { label: 'All', value: 'all' }, { label: 'Hindi', value: 'hi' }, { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' }, { label: 'Telugu', value: 'te' }, { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' }, { label: 'Urdu', value: 'ur' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [yearFilter, setYearFilter] = useState('All');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      setSearchHistory(JSON.parse(localStorage.getItem('mflix_search_history') || '[]'));
    } catch {}
  }, []);

  const doSearch = useCallback(async (q: string, tab: TabType) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      let res;
      if (tab === 'movies') res = await tmdb.searchMovies(q);
      else if (tab === 'tv') res = await tmdb.searchTV(q);
      else if (tab === 'anime') {
        res = await tmdb.searchTV(q);
        res = { results: res.results.filter((r: any) => r.genre_ids?.includes(16)) };
      } else if (tab === 'people') res = await tmdb.searchPerson(q);
      else res = await tmdb.search(q);
      setResults(res.results || []);

      // Save to search history
      const hist = JSON.parse(localStorage.getItem('mflix_search_history') || '[]');
      const updated = [q, ...hist.filter((h: string) => h !== q)].slice(0, 10);
      localStorage.setItem('mflix_search_history', JSON.stringify(updated));
      setSearchHistory(updated);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, activeTab);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeTab, doSearch]);

  const removeHistory = (h: string) => {
    const updated = searchHistory.filter(s => s !== h);
    setSearchHistory(updated);
    localStorage.setItem('mflix_search_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('mflix_search_history');
  };

  // Client-side filter
  const filteredResults = results.filter(r => {
    if (langFilter !== 'all' && r.original_language !== langFilter) return false;
    if (ratingFilter !== 'all' && r.vote_average < Number(ratingFilter)) return false;
    if (yearFilter !== 'All') {
      const year = new Date(r.release_date || r.first_air_date || '').getFullYear();
      if (yearFilter === '2020s' && year < 2020) return false;
      if (yearFilter === '2010s' && (year < 2010 || year >= 2020)) return false;
      if (yearFilter === '2000s' && (year < 2000 || year >= 2010)) return false;
      if (yearFilter === '90s' && (year < 1990 || year >= 2000)) return false;
      if (!isNaN(Number(yearFilter)) && year !== Number(yearFilter)) return false;
    }
    return true;
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'movies', label: 'Movies' },
    { key: 'tv', label: 'TV Shows' },
    { key: 'anime', label: 'Anime' },
    { key: 'people', label: 'People' },
  ];

  return (
    <div className="min-h-screen bg-[#03060f]">
      <Navbar />

      <div className="px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Search input */}
        <div className="relative max-w-2xl mx-auto mb-8">
          {/* Red glow */}
          <div className={`absolute inset-0 bg-red-600/20 blur-3xl rounded-full transition-opacity ${query ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-red-600/50 transition-all">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, shows, anime, people..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base md:text-lg"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {query && (
          <div className="space-y-3 mb-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <span className="text-gray-500 text-xs flex-shrink-0 self-center">Language:</span>
              {LANG_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setLangFilter(o.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${langFilter === o.value ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <span className="text-gray-500 text-xs flex-shrink-0 self-center">Year:</span>
              {YEAR_OPTIONS.map(y => (
                <button key={y} onClick={() => setYearFilter(y)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${yearFilter === y ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                  {y}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 text-xs self-center">Rating:</span>
              {[['All', 'all'], ['★9+', '9'], ['★8+', '8'], ['★7+', '7']].map(([label, val]) => (
                <button key={val} onClick={() => setRatingFilter(val as RatingFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${ratingFilter === val ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No query: suggestions + history */}
        {!query && (
          <div className="space-y-8">
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">Recent Searches</h3>
                  <button onClick={clearHistory} className="text-red-400 text-sm hover:text-red-300">Clear All</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(h => (
                    <div key={h} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                      <Clock size={12} className="text-gray-400" />
                      <button onClick={() => setQuery(h)} className="text-sm text-gray-300">{h}</button>
                      <button onClick={() => removeHistory(h)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-white font-bold mb-3">🔴 Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center py-20 text-gray-600">
              <Search size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">Start typing to discover</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && query && (
          <>
            {filteredResults.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <span className="text-5xl block mb-4">🛸</span>
                <p className="text-lg font-bold">No results found</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredResults.map((item, i) => {
                  if (activeTab === 'people' || item.media_type === 'person') {
                    return (
                      <Link key={item.id} href={`/person/${item.id}`} className="group text-center">
                        <div className="w-full aspect-square rounded-full overflow-hidden bg-white/5 mb-2 mx-auto max-w-[100px]">
                          {item.profile_path ? (
                            <Image src={getImageUrl(item.profile_path, 'profile')} alt={item.name} width={100} height={100} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl bg-white/10">{item.name?.[0]}</div>
                          )}
                        </div>
                        <p className="text-white text-xs font-bold line-clamp-1">{item.name}</p>
                        <p className="text-gray-500 text-[10px] line-clamp-1">{item.known_for_department}</p>
                      </Link>
                    );
                  }
                  return <MovieCard key={`${item.id}-${i}`} movie={item} index={i} />;
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
