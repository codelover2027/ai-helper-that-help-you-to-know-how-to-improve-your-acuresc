import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, Crosshair, Mouse, Shield, Target, Zap } from 'lucide-react';
import App from './App.tsx';
import './index.css';

function TitleScreen() {
  const [started, setStarted] = useState(false);

  if (started) return <App />;

  const enterTraining = () => setStarted(true);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090e] text-white selection:bg-rose-500/30">
      {/* Tactical grid and ambient color */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-rose-600/15 blur-[130px]" />
        <div className="absolute -bottom-56 right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#07090e] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        {/* Game-style top bar */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10">
              <Target className="h-5 w-5 text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold tracking-[0.18em]">AIMPULSE</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Training system</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            System online
          </div>
        </header>

        {/* Main menu */}
        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded border border-rose-400/20 bg-rose-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Your personal FPS training assistant
            </div>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Lock in<span className="block text-rose-400">your aim.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-300 sm:text-base">
              Build steadier aim with focused drills, sensitivity tools, custom crosshairs, and practical coaching—all in one place.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterTraining}
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-rose-600 px-6 py-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-lg shadow-rose-950/40 transition hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-[#07090e]"
              >
                <Target className="h-4 w-4" aria-hidden="true" />
                Start training
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={enterTraining}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-200 transition hover:border-white/30 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                Explore training
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              <span className="flex items-center gap-2"><Crosshair className="h-3.5 w-3.5 text-cyan-400" /> Aim drills</span>
              <span className="flex items-center gap-2"><Mouse className="h-3.5 w-3.5 text-rose-400" /> Sensitivity tools</span>
              <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-amber-400" /> Setup coaching</span>
            </div>
          </div>

          {/* Aim-training mission panel */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-3xl bg-rose-500/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e16]/90 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500">Mission select</p>
                  <h2 className="mt-1 font-display text-sm font-bold uppercase tracking-wider">Warm-up protocol</h2>
                </div>
                <span className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-300">Ready</span>
              </div>

              <div className="relative flex aspect-[1.35] items-center justify-center overflow-hidden bg-[#080b12]">
                <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div aria-hidden="true" className="absolute h-56 w-56 rounded-full border border-cyan-400/10" />
                <div aria-hidden="true" className="absolute h-40 w-40 rounded-full border border-cyan-400/15" />
                <div aria-hidden="true" className="absolute h-24 w-24 rounded-full border border-rose-400/25" />
                <div aria-hidden="true" className="absolute h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_24px_8px_rgba(251,113,133,0.55)]" />
                <div aria-hidden="true" className="absolute h-16 w-16 animate-[spin_12s_linear_infinite] rounded-full border border-dashed border-cyan-300/30" />
                <Crosshair className="relative h-8 w-8 text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" strokeWidth={1.2} aria-hidden="true" />
                <span className="absolute bottom-4 left-4 text-[9px] font-mono uppercase tracking-widest text-cyan-300/60">Target acquisition // active</span>
                <span className="absolute right-4 top-4 text-[9px] font-mono text-neutral-500">01 / 04</span>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Daily warm-up</span>
                  <span className="text-[10px] font-mono text-neutral-500">10 MIN</span>
                </div>
                <div className="space-y-2">
                  {[
                    ['01', 'Reflex flicking', '03 min'],
                    ['02', 'Micro-precision', '03 min'],
                    ['03', 'Recoil control', '02 min'],
                    ['04', 'Counter-strafe lab', '02 min'],
                  ].map(([number, label, duration]) => (
                    <div key={number} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                      <span className="font-mono text-[10px] text-rose-400">{number}</span>
                      <span className="flex-1 text-xs font-medium text-neutral-200">{label}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{duration}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={enterTraining} className="flex w-full items-center justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 transition hover:text-white">
                  Load training range <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 pt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
          <span>AimPulse // Practice with purpose</span>
          <span className="hidden items-center gap-2 sm:flex"><ArrowDown className="h-3 w-3" /> Select start training to continue</span>
        </footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<TitleScreen />);
