'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ArrowLeft, Maximize, Minimize, AlertTriangle } from 'lucide-react';
import { EMBED_SERVERS, DEMO_VIDEO_URL } from '@/lib/constants';

interface VideoPlayerProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  episodeName?: string;
  totalEpisodes?: number;
  onClose: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  id,
  type,
  title,
  season = 1,
  episode = 1,
  episodeName,
  totalEpisodes,
  onClose,
  onNextEpisode,
}) => {
  const [activeServer, setActiveServer] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failedServers, setFailedServers] = useState<Set<number>>(new Set());
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(5);
  const [showShare, setShowShare] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save to history on open
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('mflix_history') || '[]');
      const item = { id, type, title, season, episode, timestamp: Date.now() };
      const filtered = history.filter((h: any) => !(h.id === id && h.type === type));
      localStorage.setItem('mflix_history', JSON.stringify([item, ...filtered].slice(0, 50)));
    } catch {}
  }, [id, type, title, season, episode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Controls auto-hide
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    showControls();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [showControls]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleServerError = useCallback(() => {
    const newFailed = new Set(failedServers);
    newFailed.add(activeServer);
    setFailedServers(newFailed);

    // Try next server
    const nextServer = EMBED_SERVERS.findIndex((_, i) => !newFailed.has(i));
    if (nextServer !== -1) {
      setActiveServer(nextServer);
      setLoading(true);
    } else {
      // All servers failed → use demo video
      setUseFallback(true);
      setLoading(false);
    }
  }, [activeServer, failedServers]);

  const handleServerSwitch = (idx: number) => {
    setActiveServer(idx);
    setUseFallback(false);
    setLoading(true);
    setFailedServers(new Set());
  };

  const currentUrl = useFallback
    ? null
    : EMBED_SERVERS[activeServer]?.getUrl(id, type, season, episode);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      onMouseMove={showControls}
      onClick={showControls}
    >
      {/* Loading shimmer overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-bold text-lg">Loading...</p>
          <div className="absolute inset-0 shimmer opacity-30" />
        </div>
      )}

      {/* Video area */}
      {useFallback ? (
        <video
          src={DEMO_VIDEO_URL}
          className="w-full h-full object-contain bg-black"
          autoPlay
          controls
          onLoadedData={() => setLoading(false)}
        />
      ) : (
        <iframe
          key={`${activeServer}-${id}-${season}-${episode}`}
          src={currentUrl || ''}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          referrerPolicy="no-referrer"
          title={title}
          onLoad={() => setLoading(false)}
          onError={handleServerError}
        />
      )}

      {/* TOP BAR */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 to-transparent p-4 md:p-6 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-white font-black text-lg md:text-2xl line-clamp-1">{title}</h2>
              {type === 'tv' && (
                <p className="text-gray-300 text-sm font-medium">
                  Season {season} · Episode {episode}{episodeName ? ` — ${episodeName}` : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-6 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Server buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-xs font-bold mr-1">SERVER:</span>
            {EMBED_SERVERS.map((server, idx) => (
              <button
                key={idx}
                onClick={() => handleServerSwitch(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeServer === idx && !useFallback
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  } ${failedServers.has(idx) ? 'opacity-50' : ''}`}
              >
                {server.icon} {server.name}
              </button>
            ))}
            {useFallback && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-600 text-white">
                🎬 Demo
              </span>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
            >
              🔗 Share
            </button>
            <button
              onClick={() => {}} // UI only
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 transition-all flex items-center gap-1"
            >
              <AlertTriangle size={12} /> Report
            </button>
          </div>
        </div>

        {/* Next episode for TV */}
        {type === 'tv' && totalEpisodes && episode < totalEpisodes && onNextEpisode && (
          <div className="mt-3">
            <button
              onClick={onNextEpisode}
              className="px-4 py-2 bg-white text-black rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all"
            >
              Next Episode →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
