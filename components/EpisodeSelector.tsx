'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { Play, Check, LayoutList, Grid3X3, Clock } from 'lucide-react';
import { tmdb, getImageUrl } from '@/lib/tmdb';

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
}

interface EpisodeSelectorProps {
  tvId: number;
  totalSeasons: number;
  onEpisodeSelect: (season: number, episode: number) => void;
  currentSeason?: number;
  currentEpisode?: number;
}

export const EpisodeSelector = memo(({
  tvId,
  totalSeasons,
  onEpisodeSelect,
  currentSeason = 1,
  currentEpisode = 1,
}: EpisodeSelectorProps) => {
  const [activeSeason, setActiveSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [watched, setWatched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem('mflix_watched') || '{}');
      setWatched(w);
    } catch {}
  }, []);

  const fetchSeason = useCallback(async (season: number) => {
    setLoading(true);
    setEpisodes([]);
    try {
      const data = await tmdb.getSeasonDetails(tvId, season);
      setEpisodes(data.episodes || []);
    } catch {}
    finally { setLoading(false); }
  }, [tvId]);

  useEffect(() => {
    fetchSeason(activeSeason);
  }, [activeSeason, fetchSeason]);

  const toggleWatched = (season: number, ep: number) => {
    const key = `${tvId}_${season}_${ep}`;
    const updated = { ...watched, [key]: !watched[key] };
    setWatched(updated);
    localStorage.setItem('mflix_watched', JSON.stringify(updated));
  };

  const isWatched = (season: number, ep: number) => !!watched[`${tvId}_${season}_${ep}`];

  const firstUnwatched = episodes.find(ep => !isWatched(activeSeason, ep.episode_number));
  const isAired = (date: string) => !date || new Date(date) <= new Date();

  const watchedCount = episodes.filter(ep => isWatched(activeSeason, ep.episode_number)).length;
  const progress = episodes.length > 0 ? Math.round((watchedCount / episodes.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Season tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
          <button
            key={s}
            onClick={() => setActiveSeason(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSeason === s
              ? 'bg-red-600 text-white'
              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
          >
            S{s}
          </button>
        ))}
      </div>

      {/* Episode count + progress + view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">
            Season {activeSeason} — {episodes.length} Episodes
          </p>
          {episodes.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 bg-white/10 rounded-full w-32">
                <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-gray-400 text-xs">{watchedCount}/{episodes.length} watched</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {firstUnwatched && (
            <button
              onClick={() => onEpisodeSelect(activeSeason, firstUnwatched.episode_number)}
              className="px-3 py-1.5 bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-600/30 transition-all"
            >
              Continue E{firstUnwatched.episode_number}
            </button>
          )}
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <LayoutList size={16} className="text-white" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <Grid3X3 size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5">
              <div className="w-32 md:w-40 flex-shrink-0 rounded-xl shimmer bg-white/10" style={{ aspectRatio: '16/9' }} />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-4 rounded shimmer bg-white/10 w-3/4" />
                <div className="h-3 rounded shimmer bg-white/10 w-1/2" />
                <div className="h-3 rounded shimmer bg-white/10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Episodes */}
      {!loading && (
        viewMode === 'list' ? (
          <div className="space-y-2">
            {episodes.map(ep => {
              const aired = isAired(ep.air_date);
              const watched = isWatched(activeSeason, ep.episode_number);
              const active = activeSeason === currentSeason && ep.episode_number === currentEpisode;
              return (
                <div
                  key={ep.id}
                  className={`flex gap-3 md:gap-4 p-3 rounded-2xl cursor-pointer transition-all group
                    ${active ? 'bg-red-600/20 border border-red-600/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}
                    ${!aired ? 'opacity-50' : ''}`}
                  onClick={() => aired && onEpisodeSelect(activeSeason, ep.episode_number)}
                >
                  {/* Episode still */}
                  <div className="relative w-32 md:w-40 flex-shrink-0 rounded-xl overflow-hidden bg-white/5" style={{ aspectRatio: '16/9' }}>
                    {ep.still_path ? (
                      <Image
                        src={getImageUrl(ep.still_path, 'still')}
                        alt={ep.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="absolute inset-0 shimmer" />
                    )}
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      E{ep.episode_number}
                    </div>
                    {watched && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    {!aired && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">Coming Soon</span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={20} className="text-white" fill="currentColor" />
                    </div>
                  </div>

                  {/* Episode info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm line-clamp-1">{ep.name}</h4>
                    <div className="flex items-center gap-3 mt-0.5 mb-1">
                      {ep.air_date && (
                        <span className="text-gray-500 text-xs">{new Date(ep.air_date).toLocaleDateString()}</span>
                      )}
                      {ep.runtime && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock size={10} /> {ep.runtime}m
                        </span>
                      )}
                    </div>
                    {ep.overview && (
                      <p className="text-gray-400 text-xs line-clamp-2">{ep.overview}</p>
                    )}
                  </div>

                  {/* Watch toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleWatched(activeSeason, ep.episode_number); }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${watched ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <Check size={14} className="text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {episodes.map(ep => {
              const aired = isAired(ep.air_date);
              const watched = isWatched(activeSeason, ep.episode_number);
              return (
                <div
                  key={ep.id}
                  className={`cursor-pointer group rounded-xl overflow-hidden bg-white/5 border border-white/5 transition-all hover:border-white/20 ${!aired ? 'opacity-50' : ''}`}
                  onClick={() => aired && onEpisodeSelect(activeSeason, ep.episode_number)}
                >
                  <div className="relative" style={{ aspectRatio: '16/9' }}>
                    {ep.still_path ? (
                      <Image src={getImageUrl(ep.still_path, 'still')} alt={ep.name} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="absolute inset-0 shimmer" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={16} className="text-white" fill="currentColor" />
                    </div>
                    {watched && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-white font-bold text-xs">E{ep.episode_number}</p>
                    <p className="text-gray-400 text-[10px] line-clamp-1">{ep.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
});

EpisodeSelector.displayName = 'EpisodeSelector';
