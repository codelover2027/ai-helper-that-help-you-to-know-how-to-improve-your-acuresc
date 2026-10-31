import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AimArena } from './components/AimArena';
import { SensitivityConverter } from './components/SensitivityConverter';
import { CrosshairStudio } from './components/CrosshairStudio';
import { AimMasterclass } from './components/AimMasterclass';
import { HardwareCalibration } from './components/HardwareCalibration';
import { SessionStats } from './components/SessionStats';
import { CrosshairConfig, DrillResult } from './types';
import { PRO_CROSSHAIR_PRESETS } from './utils/crosshairPresets';
import { sounds } from './utils/soundEffects';
import { Target, Sliders, Crosshair, BookOpen, Activity, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arena');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameSensitivity, setGameSensitivity] = useState<number>(0.35);

  // Active crosshair configuration
  const [crosshair, setCrosshair] = useState<CrosshairConfig>(() => {
    try {
      const saved = localStorage.getItem('aimpulse_crosshair');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRO_CROSSHAIR_PRESETS[0];
  });

  // Drill history
  const [results, setResults] = useState<DrillResult[]>(() => {
    try {
      const saved = localStorage.getItem('aimpulse_results');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Save crosshair changes
  const handleUpdateCrosshair = (newConfig: CrosshairConfig) => {
    setCrosshair(newConfig);
    try {
      localStorage.setItem('aimpulse_crosshair', JSON.stringify(newConfig));
    } catch {
      // ignore storage failure
    }
  };

  // Record drill result
  const handleRecordResult = (result: DrillResult) => {
    setResults((prev) => {
      const updated = [result, ...prev].slice(0, 50);
      try {
        localStorage.setItem('aimpulse_results', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setResults([]);
    try {
      localStorage.removeItem('aimpulse_results');
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  const handleQuickWarmup = () => {
    setActiveTab('arena');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickWarmup={handleQuickWarmup}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        {/* Hero Banner with Generated Imagery */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
          <div className="absolute inset-0">
            <img
              src="/src/assets/images/aim_arena_backdrop_1793122870625.jpg"
              alt="Aim training arena backdrop"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-widest">
              <span>Universal Shooting Calibrator</span>
              <span aria-hidden="true">·</span>
              <span>All FPS & Battle Royale Games</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display leading-[1.15]">
              Master Every Shot Across Any Game
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Synchronize mouse sensitivity, eliminate input jitter, design tournament crosshairs, and build neurological muscle memory with pro reflex drills.
            </p>

            {/* Quick Feature Badges / Jump Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.playHit();
                  setActiveTab('arena');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Launch Aim Arena</span>
              </button>

              <button
                onClick={() => {
                  sounds.playHit();
                  setActiveTab('sensitivity');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 font-semibold text-xs border border-neutral-700/60 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Match Game Sens</span>
              </button>

              <button
                onClick={() => {
                  sounds.playHit();
                  setActiveTab('crosshair');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 font-semibold text-xs border border-neutral-700/60 transition-all cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>Custom Crosshair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content View Switcher */}
        {activeTab === 'arena' && (
          <div className="flex flex-col gap-10">
            <AimArena
              crosshair={crosshair}
              onRecordResult={handleRecordResult}
              gameSensitivity={gameSensitivity}
            />
            <SessionStats
              results={results}
              onClearHistory={handleClearHistory}
              onSelectDrill={(drill) => setActiveTab('arena')}
            />
          </div>
        )}

        {activeTab === 'sensitivity' && (
          <SensitivityConverter
            onApplyToArena={(sens) => {
              setGameSensitivity(sens);
              setActiveTab('arena');
            }}
          />
        )}

        {activeTab === 'crosshair' && (
          <CrosshairStudio
            currentCrosshair={crosshair}
            onUpdateCrosshair={handleUpdateCrosshair}
          />
        )}

        {activeTab === 'mechanics' && <AimMasterclass />}

        {activeTab === 'hardware' && <HardwareCalibration />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950/80 py-6 px-6 mt-16 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-semibold text-neutral-400">
            <span>AimPulse Pro</span>
            <span aria-hidden="true">·</span>
            <span className="font-normal text-neutral-500">
              Pinpoint accuracy calibration for Valorant, CS2, Apex, Overwatch & Warzone
            </span>
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <button
              onClick={() => setActiveTab('arena')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Aim Arena
            </button>
            <button
              onClick={() => setActiveTab('sensitivity')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sensitivity
            </button>
            <button
              onClick={() => setActiveTab('crosshair')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Crosshairs
            </button>
            <button
              onClick={() => setActiveTab('mechanics')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Masterclass
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
