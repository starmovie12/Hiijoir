'use client';

import React, { useState, useRef, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { getImageUrl, Movie, tmdb } from '@/lib/tmdb';
import { LANGUAGE_MAP } from '@/lib/constants';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export const MovieCard = memo(({ movie, index }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const trailerFetched = useRef(false);

  // Determine media type — always pass ?type= so player knows
  const mediaType = movie.media_type || (movie.name && !movie.title ? 'tv' : 'movie');
  const href = `/player/${movie.id}?type=${mediaType}`;
  const langLabel = LANGUAGE_MAP[movie.original_language || ''] || movie.original_language?.toUpperCase();
  const year = new Date(movie.release_date || movie.first_air_date || '').getFullYear();

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!trailerFetched.current) {
      hoverTimer.current = setTimeout(async () => {
        trailerFetched.current = true;
        try {
          const v = await tmdb.getVideos(mediaType as 'movie' | 'tv', movie.id);
          const t = v.results.find((x: any) => x.type === 'Trailer' || x.type === 'Teaser');
          if (t) setTrailerId(t.key);
        } catch {}
      }, 2000);
    }
  }, [movie.id, mediaType]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  return (
    <Link href={href} className="block w-full snap-start rounded-2xl focus-visible:ring-4 focus-visible:ring-red-600 outline-none">
      {/* OUTER: fixed aspect ratio — never changes size, no layout shift */}
      <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
        {/* INNER: hover scale here, not on outer */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-[#1a1f2e] border border-white/5 shadow-2xl
                     transition-all duration-300 group hover:scale-105 hover:border-white/20"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Language badge */}
          {langLabel && (
            <div className="absolute top-2 left-2 z-40 bg-black/60 backdrop-blur text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-white/10 uppercase tracking-tighter">
              {langLabel}
            </div>
          )}

          {/* Shimmer while image loading */}
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}

          {/* Trailer on hover */}
          {isHovered && trailerId ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1`}
              className="absolute inset-0 w-full h-full scale-150"
              allow="autoplay"
            />
          ) : (
            <Image
              src={getImageUrl(movie.poster_path)}
              alt={movie.title || movie.name || ''}
              fill
              sizes="(max-width:640px) 30vw,(max-width:1024px) 20vw,14vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading={index < 8 ? 'eager' : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 z-30 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 ml-0.5 text-black" fill="currentColor" />
            </div>
          </div>

          {/* Trending badge */}
          {index < 5 && (
            <div className="absolute top-2 right-2 z-40 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              🔥 TOP
            </div>
          )}
        </div>
      </div>

      {/* Info below poster */}
      <div className="mt-2 px-0.5">
        <h3 className="text-white font-bold text-[11px] md:text-sm line-clamp-1">
          {movie.title || movie.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5 text-yellow-500 text-[9px] md:text-[11px] font-bold">
            <Star className="w-2 h-2 md:w-2.5 md:h-2.5" fill="currentColor" />
            {movie.vote_average?.toFixed(1)}
          </div>
          {year > 1900 && <span className="text-gray-500 text-[9px] md:text-[11px]">{year}</span>}
          <span className="text-[8px] text-gray-400 font-black border border-white/10 px-1 rounded bg-white/5 ml-auto">
            {movie.vote_average > 7.5 ? '4K' : 'HD'}
          </span>
        </div>
      </div>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';
