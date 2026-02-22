'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Heart, Star, Calendar, CheckCircle, Share2 } from 'lucide-react';
import { tmdb, getImageUrl } from '@/lib/tmdb';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EpisodeSelector } from '@/components/EpisodeSelector';
import { MovieRow } from '@/components/MovieRow';
import { BottomNav } from '@/components/BottomNav';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function SeriesPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const id = Number(params.id);

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'cast' | 'more'>('overview');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await tmdb.getTVDetails(id);
        setDetails(data);

        // Save to history
        const history = JSON.parse(localStorage.getItem('mflix_history') || '[]');
        const item = { id, type: 'tv', title: data.name, poster_path: data.poster_path, season: 1, episode: 1, timestamp: Date.now() };
        const filtered = history.filter((h: any) => !(h.id === id && h.type === 'tv'));
        localStorage.setItem('mflix_history', JSON.stringify([item, ...filtered].slice(0, 50)));

        // Check watchlist
        const wl = JSON.parse(localStorage.getItem('mflix_watchlist') || '[]');
        setInWatchlist(wl.some((w: any) => w.id === id && w.type === 'tv'));

        // Load rating
        const ratings = JSON.parse(localStorage.getItem('mflix_ratings') || '{}');
        setUserRating(ratings[`tv_${id}`] || 0);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleWatchlist = () => {
    const wl = JSON.parse(localStorage.getItem('mflix_watchlist') || '[]');
    if (inWatchlist) {
      localStorage.setItem('mflix_watchlist', JSON.stringify(wl.filter((w: any) => !(w.id === id && w.type === 'tv'))));
      setInWatchlist(false);
      showToast('Removed from watchlist', 'info');
    } else {
      const item = { id, type: 'tv', title: details?.name, poster_path: details?.poster_path, timestamp: Date.now() };
      localStorage.setItem('mflix_watchlist', JSON.stringify([item, ...wl]));
      setInWatchlist(true);
      showToast('Added to watchlist ❤️', 'success');
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    setActiveSeason(season);
    setActiveEpisode(episode);
    setShowPlayer(true);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    const ratings = JSON.parse(localStorage.getItem('mflix_ratings') || '{}');
    ratings[`tv_${id}`] = rating;
    localStorage.setItem('mflix_ratings', JSON.stringify(ratings));
    showToast(`Rated ${rating}/5 ⭐`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03060f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!details) return null;

  const title = details.name;
  const backdropUrl = getImageUrl(details.backdrop_path, 'backdrop');
  const posterUrl = getImageUrl(details.poster_path);
  const rating = details.vote_average?.toFixed(1);
  const year = new Date(details.first_air_date || '').getFullYear();
  const cast = details.credits?.cast?.slice(0, 12) || [];
  const similar = details.similar?.results || [];
  const recommendations = details.recommendations?.results || [];
  const totalSeasons = details.number_of_seasons || 1;
  const statusColor = details.status === 'Returning Series' ? 'text-green-400' : details.status === 'Ended' ? 'text-gray-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-[#03060f]">
      {/* VideoPlayer overlay */}
      {showPlayer && (
        <VideoPlayer
          id={id}
          type="tv"
          title={title}
          season={activeSeason}
          episode={activeEpisode}
          onClose={() => setShowPlayer(false)}
          onNextEpisode={() => {
            // Try next episode
            setActiveEpisode(e => e + 1);
          }}
        />
      )}

      {/* Hero backdrop */}
      <div className="relative w-full" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-0">
          <Image src={backdropUrl} alt={title} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03060f] via-[#03060f]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060f] via-[#03060f]/30 to-transparent" />
        </div>

        <button onClick={() => router.back()} className="absolute top-6 left-4 md:left-8 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
          <ArrowLeft size={20} />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 px-4 md:px-12 pt-20 md:pt-24 pb-12">
          <div className="flex-1 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-600 text-white">MFLIX</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 ${statusColor}`}>
                {details.status || 'SERIES'}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-white">
                {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic text-white mb-4 leading-none">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star size={16} fill="currentColor" /> {rating}
              </div>
              {year > 1900 && (
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar size={14} /> {year}
                </div>
              )}
              {details.number_of_episodes && (
                <span className="text-gray-300">{details.number_of_episodes} Episodes</span>
              )}
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 line-clamp-4">
              {details.overview}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => { setActiveSeason(1); setActiveEpisode(1); setShowPlayer(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black hover:scale-105 active:scale-95 transition-all"
              >
                <Play size={18} fill="currentColor" /> Play S1E1
              </button>
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${inWatchlist ? 'bg-red-600 text-white' : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'}`}
              >
                {inWatchlist ? <CheckCircle size={18} /> : <Heart size={18} />}
                {inWatchlist ? 'Saved' : '+ Watchlist'}
              </button>
            </div>

            {/* Star rating */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Your rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => handleRate(star)}
                  className={`text-xl transition-all hover:scale-125 ${star <= userRating ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Poster (desktop) */}
          <div className="hidden md:block w-48 lg:w-60 flex-shrink-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ aspectRatio: '2/3' }}>
              <Image src={posterUrl} alt={title} fill className="object-cover" sizes="240px" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-12 mb-6">
        <div className="flex gap-2 border-b border-white/10">
          {(['overview', 'episodes', 'cast', 'more'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-0.5 ${activeTab === tab ? 'border-red-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 md:px-12 mb-12">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">{details.overview}</p>
            {details.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {details.genres.map((g: any) => (
                  <Link key={g.id} href={`/genre/${g.id}`} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
            {/* Quick facts */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Status', details.status],
                ['Network', details.networks?.[0]?.name],
                ['Seasons', details.number_of_seasons],
                ['Episodes', details.number_of_episodes],
                ['First Aired', details.first_air_date ? new Date(details.first_air_date).getFullYear() : null],
                ['Language', details.original_language?.toUpperCase()],
              ].filter(([_, v]) => v).map(([label, value]) => (
                <div key={label as string} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <EpisodeSelector
            tvId={id}
            totalSeasons={totalSeasons}
            onEpisodeSelect={handleEpisodeSelect}
            currentSeason={activeSeason}
            currentEpisode={activeEpisode}
          />
        )}

        {activeTab === 'cast' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {cast.map((c: any) => (
              <Link key={c.id} href={`/person/${c.id}`} className="group text-center">
                <div className="w-full aspect-square rounded-full overflow-hidden bg-white/5 mb-2 mx-auto" style={{ maxWidth: '80px' }}>
                  {c.profile_path ? (
                    <Image src={getImageUrl(c.profile_path, 'profile')} alt={c.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black">{c.name[0]}</div>
                  )}
                </div>
                <p className="text-white text-xs font-bold line-clamp-1">{c.name}</p>
                <p className="text-gray-500 text-[10px] line-clamp-1">{c.character}</p>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'more' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Tagline', details.tagline],
              ['Type', details.type],
              ['Origin Country', details.origin_country?.join(', ')],
              ['Created By', details.created_by?.map((c: any) => c.name).join(', ')],
            ].filter(([_, v]) => v).map(([label, value]) => (
              <div key={label as string} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {similar.length > 0 && <MovieRow title="🎬 More Like This" movies={similar} />}
      {recommendations.length > 0 && <MovieRow title="💡 You Might Also Like" movies={recommendations} />}

      <BottomNav />
    </div>
  );
}
