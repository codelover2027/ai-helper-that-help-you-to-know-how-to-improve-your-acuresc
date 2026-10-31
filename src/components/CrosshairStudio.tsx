import React, { useState, useRef } from 'react';
import { Download, Copy, Check, Sliders, Eye, Sparkles } from 'lucide-react';
import { CrosshairConfig } from '../types';
import {
  PRO_CROSSHAIR_PRESETS,
  generateCS2ConsoleCommands,
  generateValorantCode,
  generateCrosshairSVG,
} from '../utils/crosshairPresets';
import { sounds } from '../utils/soundEffects';

interface CrosshairStudioProps {
  currentCrosshair: CrosshairConfig;
  onUpdateCrosshair: (config: CrosshairConfig) => void;
}

export const CrosshairStudio: React.FC<CrosshairStudioProps> = ({
  currentCrosshair,
  onUpdateCrosshair,
}) => {
  const [config, setConfig] = useState<CrosshairConfig>(currentCrosshair);
  const [backdrop, setBackdrop] = useState<'arena' | 'desert' | 'ascent' | 'grid'>('arena');
  const [simulatedFiring, setSimulatedFiring] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const colors = [
    { label: 'Cyber Cyan', hex: '#00f0ff' },
    { label: 'Pro Green', hex: '#00ff66' },
    { label: 'Vandal Red', hex: '#ff4655' },
    { label: 'CS Yellow', hex: '#ffff00' },
    { label: 'Crisp White', hex: '#ffffff' },
    { label: 'Neon Pink', hex: '#ff007f' },
    { label: 'Electric Amber', hex: '#ff9900' },
  ];

  const updateProp = <K extends keyof CrosshairConfig>(key: K, value: CrosshairConfig[K]) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateCrosshair(updated);
  };

  const loadPreset = (preset: CrosshairConfig) => {
    sounds.playHit();
    setConfig(preset);
    onUpdateCrosshair(preset);
  };

  const copyValorant = () => {
    const code = generateValorantCode(config);
    navigator.clipboard.writeText(code);
    sounds.playHit();
    setCopiedType('valorant');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyCS2 = () => {
    const code = generateCS2ConsoleCommands(config);
    navigator.clipboard.writeText(code);
    sounds.playHit();
    setCopiedType('cs2');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadPNG = () => {
    sounds.playHeadshot();
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render transparent crosshair
    const center = size / 2;
    const len = config.innerLength * 4;
    const thk = config.innerThickness * 2;
    const gap = config.innerGap * 3;

    if (config.hasOutline) {
      ctx.strokeStyle = config.outlineColor;
      ctx.lineWidth = thk + config.outlineThickness * 4;
      if (config.style !== 't-style') {
        ctx.beginPath();
        ctx.moveTo(center, center - gap - len);
        ctx.lineTo(center, center - gap);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(center, center + gap);
      ctx.lineTo(center, center + gap + len);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(center - gap - len, center);
      ctx.lineTo(center - gap, center);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(center + gap, center);
      ctx.lineTo(center + gap + len, center);
      ctx.stroke();
    }

    ctx.strokeStyle = config.color;
    ctx.lineWidth = thk;
    ctx.globalAlpha = config.innerOpacity;

    if (config.style !== 't-style') {
      ctx.beginPath();
      ctx.moveTo(center, center - gap - len);
      ctx.lineTo(center, center - gap);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(center, center + gap);
    ctx.lineTo(center, center + gap + len);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center - gap - len, center);
    ctx.lineTo(center - gap, center);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center + gap, center);
    ctx.lineTo(center + gap + len, center);
    ctx.stroke();

    if (config.hasDot) {
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(center, center, (config.dotSize * 3) / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `aimpulse_crosshair_${config.name.toLowerCase().replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const downloadSVG = () => {
    sounds.playHeadshot();
    const svgContent = generateCrosshairSVG(config, 64);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aimpulse_crosshair_${config.name.toLowerCase().replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerFiringBloom = () => {
    sounds.playShot();
    setSimulatedFiring(true);
    setTimeout(() => setSimulatedFiring(false), 180);
  };

  // Dynamic gap when simulated firing
  const activeGap = simulatedFiring ? config.innerGap + 5 : config.innerGap;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white font-display">
          Pro Crosshair Studio & HUD Overlay Generator
        </h2>
        <p className="text-sm text-neutral-400">
          Craft pixel-perfect reticles tested against competitive map environments with zero clutter and zero bloom blur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Preview Sandbox */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            onClick={triggerFiringBloom}
            className={`relative w-full h-80 rounded-2xl border border-neutral-800 overflow-hidden cursor-pointer select-none flex items-center justify-center transition-all ${
              backdrop === 'arena'
                ? 'bg-[#090b14]'
                : backdrop === 'desert'
                ? 'bg-[#291e12]'
                : backdrop === 'ascent'
                ? 'bg-[#152238]'
                : 'bg-neutral-900'
            }`}
          >
            {/* Background Texture / Grids */}
            {backdrop === 'arena' && (
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]" />
            )}
            {backdrop === 'desert' && (
              <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-amber-950 via-amber-900/40 to-transparent" />
            )}
            {backdrop === 'ascent' && (
              <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950" />
            )}
            {backdrop === 'grid' && (
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            )}

            {/* Target Head Dummy Silhouette */}
            <div className="absolute w-16 h-20 rounded-full border border-neutral-700/60 bg-neutral-800/30 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] text-neutral-500 font-mono">HEAD</span>
            </div>

            {/* Live Crosshair Canvas / SVG Render */}
            <div className="relative z-10 flex items-center justify-center pointer-events-none">
              {/* Center Dot */}
              {config.hasDot && (
                <div
                  className="absolute rounded-none"
                  style={{
                    width: `${config.dotSize * 2}px`,
                    height: `${config.dotSize * 2}px`,
                    backgroundColor: config.color,
                    outline: config.hasOutline
                      ? `${config.outlineThickness}px solid ${config.outlineColor}`
                      : 'none',
                  }}
                />
              )}

              {/* Inner Lines */}
              {config.innerLength > 0 && (
                <>
                  {/* Top */}
                  {config.style !== 't-style' && (
                    <div
                      className="absolute"
                      style={{
                        width: `${config.innerThickness * 2}px`,
                        height: `${config.innerLength * 3}px`,
                        backgroundColor: config.color,
                        bottom: `${activeGap * 3}px`,
                        opacity: config.innerOpacity,
                        outline: config.hasOutline
                          ? `${config.outlineThickness}px solid ${config.outlineColor}`
                          : 'none',
                      }}
                    />
                  )}
                  {/* Bottom */}
                  <div
                    className="absolute"
                    style={{
                      width: `${config.innerThickness * 2}px`,
                      height: `${config.innerLength * 3}px`,
                      backgroundColor: config.color,
                      top: `${activeGap * 3}px`,
                      opacity: config.innerOpacity,
                      outline: config.hasOutline
                        ? `${config.outlineThickness}px solid ${config.outlineColor}`
                        : 'none',
                    }}
                  />
                  {/* Left */}
                  <div
                    className="absolute"
                    style={{
                      height: `${config.innerThickness * 2}px`,
                      width: `${config.innerLength * 3}px`,
                      backgroundColor: config.color,
                      right: `${activeGap * 3}px`,
                      opacity: config.innerOpacity,
                      outline: config.hasOutline
                        ? `${config.outlineThickness}px solid ${config.outlineColor}`
                        : 'none',
                    }}
                  />
                  {/* Right */}
                  <div
                    className="absolute"
                    style={{
                      height: `${config.innerThickness * 2}px`,
                      width: `${config.innerLength * 3}px`,
                      backgroundColor: config.color,
                      left: `${activeGap * 3}px`,
                      opacity: config.innerOpacity,
                      outline: config.hasOutline
                        ? `${config.outlineThickness}px solid ${config.outlineColor}`
                        : 'none',
                    }}
                  />
                </>
              )}

              {/* Reticle Circle */}
              {config.style === 'reticle' && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${activeGap * 6 + 16}px`,
                    height: `${activeGap * 6 + 16}px`,
                    border: `1.5px solid ${config.color}`,
                    opacity: 0.6,
                  }}
                />
              )}
            </div>

            {/* Click to fire hint */}
            <div className="absolute bottom-3 text-[11px] text-neutral-400 bg-neutral-950/70 px-2.5 py-1 rounded-md border border-neutral-800">
              Click sandbox to test recoil bloom
            </div>
          </div>

          {/* Backdrop Environment Switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
            <span className="text-neutral-400">Map Background:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'arena', label: 'Arena Dark' },
                { id: 'desert', label: 'Dust / Mirage' },
                { id: 'ascent', label: 'Ascent / Ice' },
                { id: 'grid', label: 'Contrast Grid' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    sounds.playHit();
                    setBackdrop(bg.id as typeof backdrop);
                  }}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    backdrop === bg.id
                      ? 'bg-rose-500 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white bg-neutral-800/60'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export & Download Card */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <span className="text-xs font-semibold text-neutral-300">
              Export Crosshair to Games & Overlays
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={copyValorant}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                {copiedType === 'valorant' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'valorant' ? 'Code Copied' : 'Valorant Code'}</span>
              </button>

              <button
                onClick={copyCS2}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                {copiedType === 'cs2' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'cs2' ? 'Commands Copied' : 'CS2 Console'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={downloadPNG}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-950 border border-neutral-700/80 hover:border-neutral-600 text-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transparent PNG</span>
              </button>
              <button
                onClick={downloadSVG}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-950 border border-neutral-700/80 hover:border-neutral-600 text-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vector SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Fine Parameter Sliders & Presets */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-6">
          {/* Pro Presets Picker */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Pro Esports Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRO_CROSSHAIR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    config.name === preset.name
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] text-neutral-400 capitalize">{preset.style}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Crosshair Color
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    sounds.playHit();
                    updateProp('color', c.hex);
                  }}
                  title={c.label}
                  className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
                    config.color === c.hex ? 'border-white scale-110 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <div className="flex items-center gap-2 ml-2 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-xs text-neutral-300">
                <span>Custom:</span>
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          </div>

          {/* Sliders: Inner Lines & Geometry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Inner Length</span>
                <span className="font-mono text-neutral-400">{config.innerLength}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={config.innerLength}
                onChange={(e) => updateProp('innerLength', parseInt(e.target.value))}
                className="accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Inner Thickness</span>
                <span className="font-mono text-neutral-400">{config.innerThickness}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={config.innerThickness}
                onChange={(e) => updateProp('innerThickness', parseInt(e.target.value))}
                className="accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Center Gap / Offset</span>
                <span className="font-mono text-neutral-400">{config.innerGap}</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                value={config.innerGap}
                onChange={(e) => updateProp('innerGap', parseInt(e.target.value))}
                className="accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Opacity</span>
                <span className="font-mono text-neutral-400">{Math.round(config.innerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.innerOpacity}
                onChange={(e) => updateProp('innerOpacity', parseFloat(e.target.value))}
                className="accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Toggles: Outlines & Dot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-800/80 pt-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Center Dot</span>
                <span className="text-[11px] text-neutral-400">Precision focal point</span>
              </div>
              <input
                type="checkbox"
                checked={config.hasDot}
                onChange={(e) => updateProp('hasDot', e.target.checked)}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Dark Outline</span>
                <span className="text-[11px] text-neutral-400">High contrast vs bright maps</span>
              </div>
              <input
                type="checkbox"
                checked={config.hasOutline}
                onChange={(e) => updateProp('hasOutline', e.target.checked)}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
