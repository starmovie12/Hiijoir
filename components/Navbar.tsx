'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, User } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'TV Shows', href: '/tv' },
    { name: 'New & Popular', href: '/popular' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 lg:px-12 py-4 md:py-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent backdrop-blur-md md:backdrop-blur-none transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-12">
        <Link 
          href="/" 
          className="text-2xl md:text-3xl font-black tracking-tighter text-red-600 italic hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg px-2"
        >
          MFLIX
        </Link>
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-xs lg:text-sm font-bold text-gray-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={`relative py-1 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md px-2 ${isActive ? 'text-white' : ''}`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <Link 
          href="/search"
          className="p-2 text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full"
        >
          <Search size={20} />
        </Link>
        <button className="relative p-2 text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_4px_rgba(220,38,38,0.8)]" />
        </button>
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-red-500 to-purple-600 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg" />
      </div>
    </nav>
  );
};
