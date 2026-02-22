'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { tmdb, getImageUrl, Movie } from '@/lib/tmdb';

export const HeroBanner = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const trending = await tmdb.getTrending('movie', 'day');
        const topMovie = trending.results[0];
        setMovie(topMovie);
        // Animate in
        requestAnimationFrame(() => setTimeout(() => setVisible(true), 50));

        const videos = await tmdb.getVideos('movie', topMovie.id);
        const trailer = videos.results.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer) setTrailerId(trailer.key);
      } catch (err) {
        console.error(err);
      }
    };
    loadHero();
  }, []);

  if (!movie) return <div className="h-[85vh] w-full bg-black/20 animate-pulse" />;

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {trailerId ? (
          <div className="relative w-full h-full scale-110">
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerId}&showinfo=0&rel=0&iv_load_policy=3`}
              className="w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media"
              title="Hero Trailer"
            />
          </div>
        ) : (
          <Image
            src={getImageUrl(movie.backdrop_path, 'backdrop')}
            alt={movie.title || ''}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060f] via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03060f]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-24 px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div
          className="max-w-2xl transition-all duration-700 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-white drop-shadow-2xl">
            {movie.title}
          </h1>
          <p className="text-lg text-gray-200 mb-8 line-clamp-3 font-medium drop-shadow-lg">
            {movie.overview}
          </p>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-xl">
              <Play className="fill-current" size={20} />
              Play Now
            </button>
            <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/10 shadow-xl">
              <Info size={20} />
              More Info
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="ml-auto p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 transition-all"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
