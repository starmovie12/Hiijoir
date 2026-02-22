'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { useSettings } from '@/hooks/use-storage';
import { useToast } from '@/components/Toast';
import { clearTmdbCache } from '@/lib/tmdb';

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-all ${value ? 'bg-red-600' : 'bg-white/20'}`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const Chips = ({ options, value, onChange, multi = false }: { options: string[]; value: string | string[]; onChange: (v: any) => void; multi?: boolean }) => {
  const isActive = (opt: string) => Array.isArray(value) ? value.includes(opt) : value === opt;
  const handleClick = (opt: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(isActive(opt) ? arr.filter(a => a !== opt) : [...arr, opt]);
    } else {
      onChange(opt);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map(opt => (
        <button key={opt} onClick={() => handleClick(opt)}
          className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${isActive(opt) ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">
    {children}
  </div>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-white font-bold text-sm">{label}</p>
      {desc && <p className="text-gray-500 text-xs mt-0.5">{desc}</p>}
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  const handleClear = (key: string) => {
    if (confirmClear !== key) { setConfirmClear(key); return; }
    setConfirmClear(null);
    switch (key) {
      case 'history': localStorage.removeItem('mflix_history'); showToast('Watch history cleared', 'success'); break;
      case 'watchlist': localStorage.removeItem('mflix_watchlist'); showToast('Watchlist cleared', 'success'); break;
      case 'search': localStorage.removeItem('mflix_search_history'); showToast('Search history cleared', 'success'); break;
      case 'cache': clearTmdbCache(); showToast('Cache cleared', 'success'); break;
    }
  };

  const DangerBtn = ({ label, id }: { label: string; id: string }) => (
    <button
      onClick={() => handleClear(id)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${confirmClear === id ? 'bg-red-600 text-white animate-pulse' : 'bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30'}`}
    >
      {confirmClear === id ? 'Tap again to confirm' : label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#03060f] px-4 md:px-8 lg:px-12 py-6">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">⚙️ Settings</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 1. PLAYBACK */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">Playback</h2>
          <div>
            <p className="text-white font-bold text-sm mb-1">Default Quality</p>
            <Chips options={['Auto', '4K', '1080p', '720p', '480p']} value={settings.quality} onChange={v => updateSetting('quality', v)} />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">Default Server</p>
            <Chips options={['Server 1', 'Server 2', 'Server 3']} value={`Server ${settings.defaultServer + 1}`}
              onChange={v => updateSetting('defaultServer', Number(v.slice(-1)) - 1)} />
          </div>
          <Row label="Auto-play next episode">
            <Toggle value={settings.autoplayNextEpisode} onChange={v => updateSetting('autoplayNextEpisode', v)} />
          </Row>
          <div>
            <p className="text-white font-bold text-sm mb-1">Skip intro (seconds)</p>
            <Chips options={['0', '30', '60', '90']} value={`${settings.skipIntro}`}
              onChange={v => updateSetting('skipIntro', Number(v))} />
          </div>
        </Card>

        {/* 2. CONTENT PREFERENCES */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">Content Preferences</h2>
          <div>
            <p className="text-white font-bold text-sm mb-1">Preferred Languages</p>
            <Chips
              options={['hi', 'en', 'ta', 'te', 'ko', 'ja', 'ur']}
              value={settings.preferredLanguages}
              onChange={v => updateSetting('preferredLanguages', v)}
              multi
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">Content Region</p>
            <Chips options={['India', 'Pakistan', 'Global', 'All']} value={settings.contentRegion}
              onChange={v => updateSetting('contentRegion', v)} />
          </div>
          <Row label="Show Adult Content" desc="Requires account verification">
            <Toggle value={settings.showAdultContent} onChange={v => updateSetting('showAdultContent', v)} />
          </Row>
        </Card>

        {/* 3. APPEARANCE */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">Appearance</h2>
          <Row label="Disable trailer on hover" desc="Saves bandwidth on slow connections">
            <Toggle value={settings.disableTrailerOnHover} onChange={v => updateSetting('disableTrailerOnHover', v)} />
          </Row>
          <div>
            <p className="text-white font-bold text-sm mb-1">Poster Size</p>
            <Chips options={['Normal', 'Compact', 'Large']} value={settings.posterSize}
              onChange={v => updateSetting('posterSize', v)} />
          </div>
        </Card>

        {/* 4. NOTIFICATIONS */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">Notifications (UI only)</h2>
          <Row label="New Releases">
            <Toggle value={false} onChange={() => showToast('Notifications coming soon!', 'info')} />
          </Row>
          <Row label="Trending Alerts">
            <Toggle value={false} onChange={() => showToast('Notifications coming soon!', 'info')} />
          </Row>
        </Card>

        {/* 5. DATA & STORAGE */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">Data & Storage</h2>
          <Row label="Clear Watch History" desc="Remove all viewing history">
            <DangerBtn label="Clear" id="history" />
          </Row>
          <Row label="Clear Watchlist" desc="Remove all saved items">
            <DangerBtn label="Clear" id="watchlist" />
          </Row>
          <Row label="Clear Search History">
            <DangerBtn label="Clear" id="search" />
          </Row>
          <Row label="Clear Cache" desc="Free up TMDB cache (5MB)">
            <DangerBtn label="Clear" id="cache" />
          </Row>
        </Card>

        {/* 6. ABOUT */}
        <Card>
          <h2 className="text-white font-black uppercase tracking-tighter text-lg">About</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p><span className="text-white font-bold">Version:</span> 1.0.0</p>
            <p><span className="text-white font-bold">Built with:</span> Next.js 14, TMDB API</p>
            <p className="text-gray-500">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
