'use client';

import { Download } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Navbar } from '@/components/Navbar';

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-[#03060f]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <Download size={80} className="text-gray-700 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">Downloads</h1>
        <p className="text-gray-500 mb-2">Downloads launching soon!</p>
        <p className="text-gray-600 text-sm">Download your favorite movies and shows to watch offline.</p>
        <div className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-yellow-400 text-sm font-bold">🚧 Coming Soon</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
