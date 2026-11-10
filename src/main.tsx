import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Crosshair, Target, Zap } from 'lucide-react';
import App from './App.tsx';
import './index.css';

function TitleScreen() {
  const [started, setStarted] = useState(false);

  if (started) return <App />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090e] px-6 py-12 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="absolute -bottom-48 right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <section className="relative z-10 w-full max-w-4xl text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 shadow-lg shadow-rose-950/40">
          <Target className="h-8 w-8 text-rose-400" aria-hidden="true" />
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-rose-400">
          Your personal FPS training assistant
        </p>
        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
          Aim<span className="text-rose-400">Pulse</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
          Build steadier aim with focused drills, sensitivity tools, custom crosshairs, and practical coaching—all in one place.
        </p>

        <button
          type="button"
          onClick={() => setStarted(true)}
          className="group mx-auto mt-9 inline-flex items-center gap-3 rounded-xl bg-rose-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-950/40 transition hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-[#07090e]"
        >
          Enter AimPulse
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>

        <div className="mt-14 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
            <Crosshair className="mb-3 h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 className="text-sm font-bold">Dial in your setup</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-400">Tune sensitivity and design a clear crosshair.</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
            <Target className="mb-3 h-5 w-5 text-rose-400" aria-hidden="true" />
            <h2 className="text-sm font-bold">Practice with purpose</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-400">Try flicking, precision, tracking, and reaction drills.</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
            <Zap className="mb-3 h-5 w-5 text-amber-400" aria-hidden="true" />
            <h2 className="text-sm font-bold">Review your progress</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-400">See your session stats and useful practice tips.</p>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-neutral-500">A training companion for your own practice sessions.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<TitleScreen />);
