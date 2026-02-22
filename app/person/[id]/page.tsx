'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { tmdb, getImageUrl } from '@/lib/tmdb';
import { MovieRow } from '@/components/MovieRow';
import { BottomNav } from '@/components/BottomNav';

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tmdb.getPersonDetails(id).then(setPerson).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#03060f] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!person) return null;

  const movieCredits = person.movie_credits?.cast?.slice(0, 20) || [];
  const tvCredits = person.tv_credits?.cast?.slice(0, 20) || [];

  return (
    <div className="min-h-screen bg-[#03060f] px-4 md:px-8 lg:px-12 py-6">
      <button onClick={() => router.back()} className="mb-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-shrink-0">
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-red-600/30 shadow-2xl">
            {person.profile_path ? (
              <Image src={getImageUrl(person.profile_path, 'profile')} alt={person.name} width={224} height={224} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/10 text-white text-5xl font-black">{person.name[0]}</div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-3">{person.name}</h1>
          {person.known_for_department && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-600 text-white mb-4 inline-block">{person.known_for_department}</span>
          )}
          {person.birthday && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <Calendar size={14} />
              <span>{new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {person.place_of_birth && <span>· {person.place_of_birth}</span>}
            </div>
          )}
          {person.biography && (
            <p className="text-gray-300 leading-relaxed line-clamp-6">{person.biography}</p>
          )}
        </div>
      </div>

      {movieCredits.length > 0 && <MovieRow title="🎬 Known For" movies={movieCredits} />}
      {tvCredits.length > 0 && <MovieRow title="📺 TV Appearances" movies={tvCredits} />}

      <BottomNav />
    </div>
  );
}
