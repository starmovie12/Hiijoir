'use client';

import React, { useState } from 'react';
import { Zap, Moon, Heart, Flame, Ghost, Coffee } from 'lucide-react';
import { tmdb, Movie } from '@/lib/tmdb';

const MOODS = [
  { id: 'action', label: 'Adrenaline Rush', icon: Zap, color: 'from-orange-500 to-red-600', genres: '28,12' },
  { id: 'horror', label: 'Late Night Chills', icon: Moon, color: 'from-indigo-900 to-purple-900', genres: '27,53' },
  { id: 'romance', label: 'Tearjerkers', icon: Heart, color: 'from-pink-500 to-rose-600', genres: '10749,18' },
  { id: 'comedy', label: 'Good Vibes', icon: Coffee, color: 'from-yellow-400 to-orange-500', genres: '35' },
  { id: 'trending', label: 'Hottest Now', icon: Flame, color: 'from-red-500 to-orange-600', genres: '' },
  { id: 'sci-fi', label: 'Future Shock', icon: Ghost, color: 'from-cyan-500 to-blue-600', genres: '878' },
];

interface MoodFilterProps {
  onMoodChange: (movies: Movie[]) => void;
}

export const MoodFilter = ({ onMoodChange }: MoodFilterProps) => {
  const [activeMood, setActiveMood] = useState('trending');

  const handleMoodClick = async (mood: typeof MOODS[0]) => {
    setActiveMood(mood.id);
    try {
      let res;
      if (!mood.genres) {
        res = await tmdb.getTrending('all', 'week');
      } else {
        res = await tmdb.discoverByGenre('movie', mood.genres);
      }
      onMoodChange(res.results || []);
    } catch {}
  };

  return (
    <div className="w-full py-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 px-4 md:px-8 lg:px-12 min-w-max">
        <h2 className="text-xl font-bold text-white mr-4 flex-shrink-0">What's your mood?</h2>
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0
                ${isActive
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg shadow-black/40`
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
              <span className="font-bold text-sm tracking-tight">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
