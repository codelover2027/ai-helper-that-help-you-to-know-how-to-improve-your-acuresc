import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Info, Mouse, Sliders } from 'lucide-react';
import { GAME_PRESETS, convertSensitivity, calculateCm360, calculateInches360, calculateEDPI, analyzeAimStyle } from '../utils/sensitivity';
import { sounds } from '../utils/soundEffects';

interface SensitivityConverterProps {
  onApplyToArena: (sens: number) => void;
}

export const SensitivityConverter: React.FC<SensitivityConverterProps> = ({ onApplyToArena }) => {
  const [sourceGameId, setSourceGameId] = useState<string>('valorant');
  const [targetGameId, setTargetGameId] = useState<string>('cs2');
  const [sourceSens, setSourceSens] = useState<number>(0.35);
  const [dpi, setDpi] = useState<number>(800);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const sourceGame = GAME_PRESETS.find((g) => g.id === sourceGameId) || GAME_PRESETS[0];
  const targetGame = GAME_PRESETS.find((g) => g.id === targetGameId) || GAME_PRESETS[1];

  const targetSens = convertSensitivity(sourceGameId, targetGameId, sourceSens);
  const cm360 = calculateCm360(sourceSens, dpi, sourceGame.yaw);
  const inches360 = calculateInches360(cm360);
  const sourceEDPI = calculateEDPI(sourceSens, dpi);
  const targetEDPI = calculateEDPI(targetSens, dpi);
  const aimAnalysis = analyzeAimStyle(cm360);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetSens.toString());
    sounds.playHit();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    sounds.playHeadshot();
    onApplyToArena(targetSens);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2500);
  };

  const commonDpiList = [400, 800, 1200, 1600, 3200];

  return (
    <div className="flex flex-col gap-6">
      {/* Intro Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white font-display">
          Universal Game Sensitivity & Muscle Memory Calibrator
        </h2>
        <p className="text-sm text-neutral-400">
          Match your physical cm/360 rotation distance across all shooters so your hand never loses muscle memory.
        </p>
      </div>

      {/* Main Conversion Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Setup */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source Game */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Source Game (Where your aim feels good)
              </label>
              <select
                value={sourceGameId}
                onChange={(e) => {
                  sounds.playHit();
                  setSourceGameId(e.target.value);
                }}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {GAME_PRESETS.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Game */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Target Game (Game to calibrate)
              </label>
              <select
                value={targetGameId}
                onChange={(e) => {
                  sounds.playHit();
                  setTargetGameId(e.target.value);
                }}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {GAME_PRESETS.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sensitivity Input & DPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  {sourceGame.name} Sensitivity
                </label>
                <span className="text-xs font-mono text-neutral-400">eDPI: {sourceEDPI}</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="50"
                value={sourceSens}
                onChange={(e) => setSourceSens(parseFloat(e.target.value) || 0.01)}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Mouse DPI
                </label>
                <div className="flex gap-1">
                  {commonDpiList.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        sounds.playHit();
                        setDpi(d);
                      }}
                      className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                        dpi === d ? 'bg-rose-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="50"
                min="100"
                max="32000"
                value={dpi}
                onChange={(e) => setDpi(parseInt(e.target.value) || 800)}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Converted Output Card */}
          <div className="p-5 rounded-xl bg-neutral-950/80 border border-rose-500/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-400 font-semibold tracking-wide uppercase">
                  Equivalent Sensitivity in {targetGame.name}
                </span>
                <div className="text-4xl font-black text-white font-mono mt-1">
                  {targetSens}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-rose-950/30 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Sync to Arena</span>
                </button>
              </div>
            </div>

            {appliedNotice && (
              <div className="text-xs text-emerald-400 font-medium">
                ✓ Sensitivity calibrated and synced to Aim Arena!
              </div>
            )}

            <div className="text-xs text-neutral-400 border-t border-neutral-800/80 pt-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>In-game setup: </strong>
                {targetGame.instructions}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Physical 360 Distance & Mousepad Calibration */}
        <div className="lg:col-span-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Mouse className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white font-display">
                Physical Turn Distance (360° Math)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <span className="text-xs text-neutral-400">Distance / 360°</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
                  {cm360} <span className="text-xs font-normal text-neutral-400">cm</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">({inches360} inches)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <span className="text-xs text-neutral-400">Target eDPI</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                  {targetEDPI}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">(DPI × Sens)</span>
              </div>
            </div>

            {/* Mousepad Visualizer */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-semibold">Mousepad Width Requirement</span>
                <span className="text-neutral-400 font-mono">{cm360} cm for 360° turn</span>
              </div>

              {/* Graphical Scale */}
              <div className="relative w-full h-5 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
                {/* 180 degree swipe indicator (half of 360) */}
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 opacity-80"
                  style={{ width: `${Math.min(100, (cm360 / 60) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0 cm</span>
                <span>20 cm (Small)</span>
                <span>40 cm (Large)</span>
                <span>60+ cm (Deskmat)</span>
              </div>
            </div>

            {/* Aim Style Breakdown */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Your Aim Category:</span>
                <span className="text-xs font-semibold text-rose-400">{aimAnalysis.style}</span>
              </div>
              <p className="text-xs text-neutral-400">{aimAnalysis.description}</p>
              <div className="text-[11px] text-emerald-400 mt-1">
                <strong>Best suited for:</strong> {aimAnalysis.recommendedFor}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
