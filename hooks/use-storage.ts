'use client';

import { useState, useEffect, useCallback } from 'react';

// ── useWatchlist ──
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    try {
      setWatchlist(JSON.parse(localStorage.getItem('mflix_watchlist') || '[]'));
    } catch {}
  }, []);

  const addToWatchlist = useCallback((item: any) => {
    const updated = [item, ...watchlist.filter(w => !(w.id === item.id && w.type === item.type))];
    setWatchlist(updated);
    localStorage.setItem('mflix_watchlist', JSON.stringify(updated));
  }, [watchlist]);

  const removeFromWatchlist = useCallback((id: number, type: string) => {
    const updated = watchlist.filter(w => !(w.id === id && w.type === type));
    setWatchlist(updated);
    localStorage.setItem('mflix_watchlist', JSON.stringify(updated));
  }, [watchlist]);

  const isInWatchlist = useCallback((id: number, type: string) => {
    return watchlist.some(w => w.id === id && w.type === type);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    localStorage.removeItem('mflix_watchlist');
  }, []);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, clearWatchlist };
};

// ── useHistory ──
export const useHistory = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('mflix_history') || '[]'));
    } catch {}
  }, []);

  const addToHistory = useCallback((item: any) => {
    const updated = [{ ...item, timestamp: Date.now() },
    ...history.filter(h => !(h.id === item.id && h.type === item.type))
    ].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('mflix_history', JSON.stringify(updated));
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('mflix_history');
  }, []);

  return { history, addToHistory, clearHistory };
};

// ── useSettings ──
interface Settings {
  quality: string;
  defaultServer: number;
  autoplayNextEpisode: boolean;
  skipIntro: number;
  preferredLanguages: string[];
  contentRegion: string;
  showAdultContent: boolean;
  disableTrailerOnHover: boolean;
  posterSize: string;
}

const DEFAULT_SETTINGS: Settings = {
  quality: 'Auto',
  defaultServer: 0,
  autoplayNextEpisode: true,
  skipIntro: 0,
  preferredLanguages: ['hi', 'en'],
  contentRegion: 'India',
  showAdultContent: false,
  disableTrailerOnHover: false,
  posterSize: 'Normal',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mflix_settings') || '{}');
      setSettings(s => ({ ...s, ...saved }));
    } catch {}
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('mflix_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { settings, updateSetting };
};
