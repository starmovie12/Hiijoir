'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/components/Toast';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    try { setWatchlist(JSON.parse(localStorage.getItem('mflix_watchlist') || '[]')); } catch {}
  }, []);

  const remove = (id: number, type: string) => {
    const updated = watchlist.filter(w => !(w.id === id && w.type === type));
    setWatchlist(updated);
    localStorage.setItem('mflix_watchlist', JSON.stringify(updated));
    showToast('Removed from watchlist', 'info');
  };

  return (
    <div className="min-h-screen bg-[#03060f]">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-24 pb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic mb-8 flex items-center gap-3">
          <Heart className="text-red-500" size={32} fill="currentColor" /> My Watchlist
        </h1>

        {watchlist.length === 0 ? (
          <div className="text-center py-32 text-gray-600">
            <Heart size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">Your watchlist is empty</p>
            <p className="text-sm mt-1">Save movies and shows to watch later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item, i) => (
              <div key={`${item.id}-${item.type}`} className="relative group">
                <MovieCard movie={item} index={i} />
                <button
                  onClick={() => remove(item.id, item.type)}
                  className="absolute top-2 right-2 z-50 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
