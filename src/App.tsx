import React, { useState } from 'react';
import { Header } from './components/Header';
import { AimArena } from './components/AimArena';
import { SensitivityConverter } from './components/SensitivityConverter';
import { CrosshairStudio } from './components/CrosshairStudio';
import { AimMasterclass } from './components/AimMasterclass';
import { HardwareCalibration } from './components/HardwareCalibration';
import { SessionStats } from './components/SessionStats';
import { TodoList } from './components/TodoList';
import { CrosshairConfig, DrillResult } from './types';
import { PRO_CROSSHAIR_PRESETS } from './utils/crosshairPresets';
import { sounds } from './utils/soundEffects';
import { Target, Sliders, Crosshair } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arena');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameSensitivity, setGameSensitivity] = useState<number>(0.35);

  const [crosshair, setCrosshair] = useState<CrosshairConfig>(() => {
    try {
      const saved = localStorage.getItem('aimpulse_crosshair');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fall back to the default preset if storage is unavailable or invalid.
    }
    return PRO_CROSSHAIR_PRESETS[0];
  });

  const [results, setResults] = useState<DrillResult[]>(() => {
    try {
      const saved = localStorage.getItem('aimpulse_results');
      if (saved) return JSON.parse(saved);
    } catch {
      // Start with an empty history if storage is unavailable or invalid.
    }
    return [];
  });

  const handleUpdateCrosshair = (newConfig: CrosshairConfig) => {
    setCrosshair(newConfig);
    try {
      localStorage.setItem('aimpulse_crosshair', JSON.stringify(newConfig));
    } catch {
      // Ignore storage failures; the in-memory setting still works.
    }
  };

  const handleRecordResult = (result: DrillResult) => {
    setResults((previous) => {
      const updated = [result, ...previous].slice(0, 50);
      try {
        localStorage.setItem('aimpulse_results', JSON.stringify(updated));
      } catch {
        // Ignore storage failures.
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setResults([]);
    try {
      localStorage.removeItem('aimpulse_results');
    } catch {
      // Ignore storage failures.
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#07090e] font-sans text-neutral-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickWarmup={() => setActiveTab('arena')}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        {activeTab !== 'todo' && (
          <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="/src/assets/images/aim_arena_backdrop_1793122870625.jpg"
                alt=""
                className="h-full w-full object-cover object-center opacity-30 mix-blend-luminosity contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 to-transparent" />
            </div>
            <div className="relative z-10 flex max-w-2xl flex-col gap-4 p-8 sm:p-10 lg:p-12">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-400">
                <span>Universal Shooting Calibrator</span>
                <span aria-hidden="true">·</span>
                <span>All FPS &amp; Battle Royale Games</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Master Every Shot Across Any Game
              </h1>
              <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
                Synchronize mouse sensitivity, eliminate input jitter, design tournament crosshairs, and build muscle memory with focused reflex drills.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { sounds.playHit(); setActiveTab('arena'); }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-950/40 transition-all hover:bg-rose-500"
                >
                  <Target className="h-4 w-4" /> Launch Aim Arena
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playHit(); setActiveTab('sensitivity'); }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700/60 bg-neutral-800/80 px-4 py-2.5 text-xs font-semibold text-neutral-200 transition-all hover:bg-neutral-700/80"
                >
                  <Sliders className="h-4 w-4" /> Match Game Sens
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playHit(); setActiveTab('crosshair'); }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700/60 bg-neutral-800/80 px-4 py-2.5 text-xs font-semibold text-neutral-200 transition-all hover:bg-neutral-700/80"
                >
                  <Crosshair className="h-4 w-4" /> Custom Crosshair
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'arena' && (
          <div className="flex flex-col gap-10">
            <AimArena crosshair={crosshair} onRecordResult={handleRecordResult} gameSensitivity={gameSensitivity} />
            <SessionStats results={results} onClearHistory={handleClearHistory} onSelectDrill={() => setActiveTab('arena')} />
          </div>
        )}

        {activeTab === 'sensitivity' && (
          <SensitivityConverter onApplyToArena={(sens) => { setGameSensitivity(sens); setActiveTab('arena'); }} />
        )}

        {activeTab === 'crosshair' && (
          <CrosshairStudio currentCrosshair={crosshair} onUpdateCrosshair={handleUpdateCrosshair} />
        )}

        {activeTab === 'mechanics' && <AimMasterclass />}
        {activeTab === 'hardware' && <HardwareCalibration />}
        {activeTab === 'todo' && <TodoList />}
      </main>

      <footer className="mt-16 border-t border-neutral-800/80 bg-neutral-950/80 px-6 py-6 text-center text-xs text-neutral-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 font-display font-semibold text-neutral-400">
            <span>AimPulse Pro</span><span aria-hidden="true">·</span>
            <span className="font-normal text-neutral-500">Pinpoint accuracy calibration for Valorant, CS2, Apex, Overwatch &amp; Warzone</span>
          </div>
          <div className="flex items-center gap-6 text-neutral-400">
            {[
              ['arena', 'Aim Arena'],
              ['sensitivity', 'Sensitivity'],
              ['crosshair', 'Crosshairs'],
              ['mechanics', 'Masterclass'],
              ['todo', 'To-do List'],
            ].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className="cursor-pointer transition-colors hover:text-white">
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
