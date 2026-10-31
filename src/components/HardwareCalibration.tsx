import React, { useState, useRef, useEffect } from 'react';
import { Activity, Cpu, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export const HardwareCalibration: React.FC = () => {
  const [currentHz, setCurrentHz] = useState<number>(0);
  const [avgHz, setAvgHz] = useState<number>(0);
  const [maxHz, setMaxHz] = useState<number>(0);
  const [jitterMs, setJitterMs] = useState<number>(0);
  const [sampleCount, setSampleCount] = useState<number>(0);
  const [isProbing, setIsProbing] = useState<boolean>(false);

  const lastEventTimeRef = useRef<number>(0);
  const intervalsRef = useRef<number[]>([]);
  const hzSamplesRef = useRef<number[]>([]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isProbing) return;

    const now = performance.now();
    if (lastEventTimeRef.current > 0) {
      const deltaMs = now - lastEventTimeRef.current;
      if (deltaMs > 0 && deltaMs < 100) {
        const instantHz = Math.round(1000 / deltaMs);
        intervalsRef.current.push(deltaMs);
        hzSamplesRef.current.push(instantHz);

        if (intervalsRef.current.length > 50) {
          intervalsRef.current.shift();
          hzSamplesRef.current.shift();
        }

        const avg = Math.round(
          hzSamplesRef.current.reduce((a, b) => a + b, 0) / hzSamplesRef.current.length
        );

        // Jitter standard deviation
        const meanDelta = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
        const variance =
          intervalsRef.current.reduce((acc, v) => acc + Math.pow(v - meanDelta, 2), 0) /
          intervalsRef.current.length;
        const stdDev = Math.sqrt(variance);

        setCurrentHz(instantHz);
        setAvgHz(avg);
        setMaxHz((prev) => Math.max(prev, instantHz));
        setJitterMs(Number(stdDev.toFixed(2)));
        setSampleCount((s) => s + 1);
      }
    }
    lastEventTimeRef.current = now;
  };

  const startProbing = () => {
    sounds.playCountdown(true);
    setIsProbing(true);
    intervalsRef.current = [];
    hzSamplesRef.current = [];
    setSampleCount(0);
    setCurrentHz(0);
    setAvgHz(0);
    setMaxHz(0);
  };

  const stopProbing = () => {
    setIsProbing(false);
    lastEventTimeRef.current = 0;
  };

  const getHzRating = (hz: number) => {
    if (hz >= 3000) return { label: 'Ultra High (4K-8K Hz)', status: 'optimal', color: 'text-rose-400' };
    if (hz >= 900) return { label: 'Competitive Gold Standard (1000 Hz)', status: 'optimal', color: 'text-emerald-400' };
    if (hz >= 450) return { label: 'Good (500 Hz)', status: 'good', color: 'text-cyan-400' };
    if (hz >= 120) return { label: 'Office Mouse Default (125 Hz - High Latency)', status: 'warning', color: 'text-amber-400' };
    return { label: 'Waiting for movement', status: 'idle', color: 'text-neutral-500' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white font-display">
          Hardware Input Calibration & Mouse Polling Rate Prober
        </h2>
        <p className="text-sm text-neutral-400">
          Hardware input lag, mouse polling rate drops, and Windows acceleration can invisibly corrupt your aim consistency.
        </p>
      </div>

      {/* Live Polling Rate Prober Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-white font-display">
                Real-Time Mouse Polling Rate (Hz)
              </h3>
            </div>
            <button
              onClick={isProbing ? stopProbing : startProbing}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                isProbing
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-neutral-800 text-neutral-200 hover:text-white'
              }`}
            >
              {isProbing ? 'Stop Testing' : 'Start Sensor Test'}
            </button>
          </div>

          {/* Interactive movement capture trackpad */}
          <div
            onPointerMove={handlePointerMove}
            className={`w-full h-52 rounded-xl border flex flex-col items-center justify-center cursor-move select-none p-6 text-center transition-colors ${
              isProbing
                ? 'bg-neutral-950/90 border-rose-500/50 shadow-inner'
                : 'bg-neutral-950/40 border-neutral-800'
            }`}
          >
            {isProbing ? (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <span className="text-5xl font-black text-white font-mono tracking-tight">
                  {currentHz} <span className="text-lg font-normal text-neutral-400">Hz</span>
                </span>
                <span className={`text-xs font-semibold ${getHzRating(avgHz).color}`}>
                  {getHzRating(avgHz).label}
                </span>
                <span className="text-[11px] text-neutral-500 mt-2">
                  Swirl mouse continuously inside this box
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Cpu className="w-8 h-8 text-neutral-600" />
                <span className="text-sm font-semibold text-neutral-300">
                  Ready to Probe Mouse Sensor
                </span>
                <span className="text-xs text-neutral-500">
                  Click 'Start Sensor Test' and move your mouse rapidly to measure actual USB report frequency.
                </span>
              </div>
            )}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500">Average Hz</span>
              <div className="text-xl font-bold text-white mt-0.5">{avgHz} Hz</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500">Peak Hz</span>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">{maxHz} Hz</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-500">Jitter (StdDev)</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{jitterMs} ms</div>
            </div>
          </div>
        </div>

        {/* Input Latency & Accuracy Checklist */}
        <div className="lg:col-span-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-white font-display flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Competitive Input Settings Audit
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Disable "Enhance Pointer Precision":</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Windows Mouse Settings → Additional mouse options → Pointer Options. Uncheck this immediately. It adds non-linear acceleration that ruins muscle memory.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Always Enable Raw Input:</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Ensure "Raw Input Buffer" or "Raw Input" is ON in Valorant, CS2, and Siege. This bypasses OS filtering.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Optimal DPI Recommendation:</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Use 800 or 1600 DPI over 400 DPI. Modern tests prove 1600 DPI has lower click-to-motion latency than 400 DPI without sensor jitter.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Display Refresh Rate:</span>
                <p className="text-neutral-400 mt-0.5 leading-relaxed">
                  Verify in Windows Display Settings → Advanced Display that your monitor is set to its highest refresh rate (e.g. 144Hz / 240Hz), not defaulting to 60Hz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
