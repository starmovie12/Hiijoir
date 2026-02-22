'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Heart, Clock, Star, Settings, Download } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';

export default function ProfilePage() {
  const [stats, setStats] = useState({ watchlist: 0, history: 0, ratings: 0, avgRating: 0 });

  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem('mflix_watchlist') || '[]');
      const hist = JSON.parse(localStorage.getItem('mflix_history') || '[]');
      const ratings = JSON.parse(localStorage.getItem('mflix_ratings') || '{}');
      const ratingValues = Object.values(ratings) as number[];
      const avg = ratingValues.length > 0 ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;
      setStats({ watchlist: wl.length, history: hist.length, ratings: ratingValues.length, avgRating: Math.round(avg * 10) / 10 });
    } catch {}
  }, []);

  const menuItems = [
    { icon: Heart, label: 'Watchlist', href: '/watchlist', badge: stats.watchlist },
    { icon: Clock, label: 'Watch History', href: '/history', badge: stats.history },
    { icon: Star, label: 'My Ratings', href: '/history', badge: stats.ratings },
    { icon: Download, label: 'Downloads', href: '/downloads' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#03060f]">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-24 pb-8 max-w-lg mx-auto">
        {/* Avatar */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-white font-black text-2xl">MFLIX User</h2>
          <p className="text-gray-500 text-sm">Premium Member</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            ['Watchlist', stats.watchlist, '❤️'],
            ['Watched', stats.history, '👁️'],
            ['Rated', stats.ratings, '⭐'],
            ['Avg Rating', stats.avgRating || 'N/A', '🏆'],
          ].map(([label, value, icon]) => (
            <div key={label as string} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-white font-black text-xl">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href, badge }) => (
            <Link
              key={href + label}
              href={href}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-red-600/20 transition-all">
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-white font-bold flex-1">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{badge}</span>
              )}
              <span className="text-gray-500">›</span>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
