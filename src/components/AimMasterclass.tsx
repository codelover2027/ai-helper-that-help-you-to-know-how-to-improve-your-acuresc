import React, { useState, useEffect, useRef } from 'react';
import { Target, Shield, Zap, Keyboard, Award, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export const AimMasterclass: React.FC = () => {
  // Counter-Strafe Interactive Trainer State
  const [csStatus, setCsStatus] = useState<'idle' | 'moving_left' | 'moving_right' | 'stopped' | 'fired'>('idle');
  const [velocity, setVelocity] = useState<number>(0); // -100 to 100
  const [stopTimingMs, setStopTimingMs] = useState<number | null>(null);
  const [rating, setRating] = useState<string | null>(null);
  const [trainerScore, setTrainerScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const directionRef = useRef<'left' | 'right'>('right');
  const stoppedTimestampRef = useRef<number>(0);
  const keysDownRef = useRef<{ a: boolean; d: boolean }>({ a: false, d: false });

  // Handle keyboard counter-strafing loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') {
        keysDownRef.current.a = true;
        if (directionRef.current === 'right' && velocity > 20) {
          // Counter-strafe triggered!
          const now = performance.now();
          stoppedTimestampRef.current = now;
          setVelocity(0);
          setCsStatus('stopped');
          sounds.playHit();
        } else {
          directionRef.current = 'left';
          setVelocity(-100);
          setCsStatus('moving_left');
        }
      } else if (key === 'd') {
        keysDownRef.current.d = true;
        if (directionRef.current === 'left' && velocity < -20) {
          // Counter-strafe triggered!
          const now = performance.now();
          stoppedTimestampRef.current = now;
          setVelocity(0);
          setCsStatus('stopped');
          sounds.playHit();
        } else {
          directionRef.current = 'right';
          setVelocity(100);
          setCsStatus('moving_right');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') keysDownRef.current.a = false;
      if (key === 'd') keysDownRef.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [velocity]);

  const handleShoot = () => {
    sounds.playShot();
    if (csStatus === 'stopped') {
      const delta = Math.round(performance.now() - stoppedTimestampRef.current);
      setStopTimingMs(delta);

      if (delta <= 130) {
        sounds.playHeadshot();
        setRating('PERFECT PINPOINT HIT');
        setTrainerScore((s) => s + 150);
        setStreak((st) => st + 1);
      } else if (delta <= 250) {
        sounds.playHit();
        setRating('GOOD (Accurate Shot)');
        setTrainerScore((s) => s + 80);
      } else {
        setRating('LATE (Vulnerable Target)');
        setStreak(0);
      }
    } else {
      sounds.playMiss();
      setRating('MISS: Moving Spread Inaccuracy');
      setStreak(0);
    }
  };

  const startStrafePrompt = (dir: 'left' | 'right') => {
    sounds.playCountdown(false);
    directionRef.current = dir;
    setVelocity(dir === 'right' ? 100 : -100);
    setCsStatus(dir === 'right' ? 'moving_right' : 'moving_left');
    setRating(null);
    setStopTimingMs(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white font-display">
          Shooting Mechanics & Physics Masterclass
        </h2>
        <p className="text-sm text-neutral-400">
          The biomechanics, angle geometry, and timing required to land accurate first-bullet headshots every round.
        </p>
      </div>

      {/* Interactive Counter-Strafe Timing Lab */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-white font-display">
                Counter-Strafing & Dead-Stop Timing Trainer
              </h3>
              <p className="text-xs text-neutral-400">
                Tap the opposite movement key to bring your movement speed to exactly 0 m/s before pulling the trigger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
              Score: <span className="text-white font-bold">{trainerScore}</span>
            </div>
            <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
              Streak: <span className="text-rose-400 font-bold">{streak}x</span>
            </div>
          </div>
        </div>

        {/* Visual Velocity Track */}
        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={velocity < -10 ? 'text-cyan-400 font-bold' : 'text-neutral-500'}>
              ← Moving Left (A)
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                velocity === 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-neutral-400'
              }`}
            >
              {velocity === 0 ? 'DEAD STOP (100% ACCURATE)' : `Speed: ${Math.abs(velocity)}%`}
            </span>
            <span className={velocity > 10 ? 'text-rose-400 font-bold' : 'text-neutral-500'}>
              Moving Right (D) →
            </span>
          </div>

          {/* Velocity Progress Meter */}
          <div className="relative w-full h-8 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center">
            {/* Center Dead-Stop Target Area */}
            <div className="absolute w-16 h-full bg-emerald-500/20 border-x border-emerald-500/40" />

            {/* Character Indicator */}
            <div
              className={`absolute w-6 h-6 rounded-md transition-all duration-75 flex items-center justify-center text-xs font-bold text-white shadow-md ${
                velocity === 0 ? 'bg-emerald-500 scale-110 ring-2 ring-emerald-400' : 'bg-rose-500'
              }`}
              style={{
                left: `calc(50% + ${(velocity / 100) * 42}% - 12px)`,
              }}
            >
              🎯
            </div>
          </div>

          {/* Active Instructions / Prompt */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => startStrafePrompt('right')}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                1. Strafe Right [D]
              </button>
              <button
                onClick={() => startStrafePrompt('left')}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                1. Strafe Left [A]
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">
                {csStatus === 'moving_right' && 'Now TAP [A] to stop momentum, then click Fire!'}
                {csStatus === 'moving_left' && 'Now TAP [D] to stop momentum, then click Fire!'}
                {csStatus === 'stopped' && 'PERFECT STOP! Click FIRE now!'}
                {csStatus === 'idle' && 'Click Strafe Right or Left to begin rhythm'}
              </span>

              <button
                onClick={handleShoot}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-rose-950/40 cursor-pointer"
              >
                FIRE [Click]
              </button>
            </div>
          </div>

          {/* Rating Result */}
          {rating && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
                rating.includes('PERFECT')
                  ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                  : rating.includes('GOOD')
                  ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300'
                  : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{rating}</span>
              {stopTimingMs !== null && (
                <span className="font-mono font-bold">Fired at +{stopTimingMs} ms</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pro Shooting Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Crosshair Placement */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white font-display">
              1. The Horizon Rule (Head-Level Crosshair Placement)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            90% of missed shots happen before the enemy even appears on your screen. Amateur players aim at chest or ground level, forcing a 2-step motion (flick up + click).
          </p>
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 flex flex-col gap-2">
            <span className="font-semibold text-rose-400">Golden Practice:</span>
            <p>
              Use map geometry (boxes, door frames, horizontal wall lines) as visual rulers. In CS2 & Valorant, crates are exactly head height. Keep your reticle glued to that horizontal line as you navigate.
            </p>
          </div>
        </div>

        {/* Pillar 2: Corner Slicing */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white font-display">
              2. Slicing the Pie (Angle Isolation)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Never peek an open area exposing yourself to 3 angles at once. Clear corners sequentially in small 15° increments, keeping your crosshair locked to the corner lip.
          </p>
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 flex flex-col gap-2">
            <span className="font-semibold text-cyan-400">Off-Angle Advantage:</span>
            <p>
              When holding an angle, never hug the wall closely. Back up as far as possible: the player farther from the corner sees the enemy shoulder first due to perspective geometry.
            </p>
          </div>
        </div>

        {/* Pillar 3: Tap vs Burst vs Spray */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white font-display">
              3. Firing Discipline by Range
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Knowing when NOT to spray is what separates high-rank players from hardstuck ranks.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-emerald-400 font-bold block">Long (&gt;30m)</span>
              <span className="text-[11px] text-neutral-400">1-Tap or 2-Bullet Micro-Burst</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-amber-400 font-bold block">Mid (15-30m)</span>
              <span className="text-[11px] text-neutral-400">3-4 Bullet Controlled Burst</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-rose-400 font-bold block">Close (&lt;15m)</span>
              <span className="text-[11px] text-neutral-400">Full Recoil Pull-Down Spray</span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Daily 10-Minute Warmup Protocol */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white font-display">
              4. Daily 10-Minute Warmup Protocol
            </h3>
          </div>
          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex items-center justify-between p-2 rounded bg-neutral-950">
              <span>Min 0-3: Reflex Flicking (Aim Arena)</span>
              <span className="text-neutral-500 font-mono">Wakes up hand nerves</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-neutral-950">
              <span>Min 3-6: Micro-Precision Sniping</span>
              <span className="text-neutral-500 font-mono">Calibrates headshots</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-neutral-950">
              <span>Min 6-8: Recoil Control (AK / Vandal)</span>
              <span className="text-neutral-500 font-mono">Muscle pull memory</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-neutral-950">
              <span>Min 8-10: Counter-Strafe Timing Lab</span>
              <span className="text-neutral-500 font-mono">A/D rhythm sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
