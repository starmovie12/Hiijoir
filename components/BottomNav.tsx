'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Heart, Search, User } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/movies', icon: Film, label: 'Movies' },
  { href: '/tv', icon: Tv, label: 'TV' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/watchlist', icon: Heart, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = memo(() => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#03060f]/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${active ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={20} className={active ? 'text-red-500' : ''} />
              <span className="text-[9px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
