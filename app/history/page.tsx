'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Trash2, X } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/components/Toast';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('mflix_history') || '[]')); } catch {}
  }, []);

  const remove = (id: number, type: string) => {
    const updated = history.filter(h => !(h.id === id && h.type === type));
    setHistory(updated);
    localStorage.setItem('mflix_history', JSON.stringify(updated));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem('mflix_history');
    showToast('Watch history cleared', 'success');
  };

  return (
    <div className="min-h-screen bg-[#03060f]">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
            <Clock className="text-red-500" size={32} /> Watch History
          </h1>
          {history.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-600/30 transition-all">
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-32 text-gray-600">
            <Clock size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">No history yet</p>
            <p className="text-sm mt-1">Movies and shows you watch will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.map((item) => (
              <div key={`${item.id}-${item.type}`} className="relative group">
                <Link href={`/player/${item.id}?type=${item.type}`} className="block">
                  <div className="relative w-full rounded-2xl overflow-hidden bg-[#1a1f2e] border border-white/5" style={{ aspectRatio: '2/3' }}>
                    {item.poster_path ? (
                      <Image src={getImageUrl(item.poster_path)} alt={item.title || item.name || ''} fill sizes="200px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 shimmer" />
                    )}
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-red-600 w-1/3" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-white font-bold text-xs line-clamp-1">{item.title || item.name}</p>
                    <p className="text-gray-500 text-[10px]">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </Link>
                <button
                  onClick={() => remove(item.id, item.type)}
                  className="absolute top-2 right-2 z-50 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-white" />
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
