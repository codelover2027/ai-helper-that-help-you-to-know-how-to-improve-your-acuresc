import React from 'react';
import { Target, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickWarmup: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickWarmup,
  isMuted,
  onToggleMute,
}) => {
  const navItems = [
    { id: 'arena', label: 'Aim Arena' },
    { id: 'sensitivity', label: 'Sensitivity' },
    { id: 'crosshair', label: 'Crosshairs' },
    { id: 'mechanics', label: 'Mechanics' },
    { id: 'hardware', label: 'Mouse Prober' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      {/* Zone 1: Single text wordmark */}
      <div 
        onClick={() => setActiveTab('arena')}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:border-rose-500 transition-colors">
          <Target className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-display">
          AimPulse
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playHit();
                setActiveTab(item.id);
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                isActive
                  ? 'text-white border-b-2 border-rose-500 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute tactical audio' : 'Mute audio'}
          className="p-2 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 bg-neutral-900/60 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
        <button
          onClick={() => {
            sounds.playCountdown(true);
            onQuickWarmup();
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-lg transition-all shadow-lg shadow-rose-950/40 cursor-pointer whitespace-nowrap shrink-0"
        >
          Quick Drill
        </button>
      </div>
    </header>
  );
};
