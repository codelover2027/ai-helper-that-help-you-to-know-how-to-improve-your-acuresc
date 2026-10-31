import React from 'react';
import { DrillResult } from '../types';
import { Trash2, TrendingUp, Crosshair, Zap, Award } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SessionStatsProps {
  results: DrillResult[];
  onClearHistory: () => void;
  onSelectDrill: (drill: string) => void;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  results,
  onClearHistory,
  onSelectDrill,
}) => {
  if (results.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center justify-center gap-3">
        <Crosshair className="w-10 h-10 text-neutral-600" />
        <h3 className="font-bold text-white text-base font-display">No Drills Recorded Yet</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          Jump into the Aim Arena to run your first 30-second reflex flicking or precision drill to unlock your accuracy performance metrics.
        </p>
        <button
          onClick={() => onSelectDrill('flicking')}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Start First Drill
        </button>
      </div>
    );
  }

  const avgAccuracy = Math.round(
    results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
  );
  const avgReaction = Math.round(
    results.reduce((acc, r) => acc + (r.avgReactionTimeMs || 250), 0) / results.length
  );
  const totalHeadshots = results.reduce((acc, r) => acc + r.headshots, 0);
  const bestScore = Math.max(...results.map((r) => r.score));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-white font-display">Session Aim History & Analytics</h3>
        </div>
        <button
          onClick={() => {
            sounds.playHit();
            onClearHistory();
          }}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Session History</span>
        </button>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400 font-sans">Avg Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-neutral-500 font-sans">Across all drills</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400 font-sans">Avg Reaction Speed</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {avgReaction} ms
          </div>
          <span className="text-[11px] text-neutral-500 font-sans">Target acquisition</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400 font-sans">Total Headshots</span>
          <div className="text-2xl font-bold text-rose-400 mt-1 tabular-nums">
            {totalHeadshots}
          </div>
          <span className="text-[11px] text-neutral-500 font-sans">Pinpoint inner core</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400 font-sans">Personal Best</span>
          <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">
            {bestScore}
          </div>
          <span className="text-[11px] text-neutral-500 font-sans">Top session score</span>
        </div>
      </div>

      {/* Results Log Table */}
      <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Drill Type</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right">Reaction</th>
                <th className="px-4 py-3 text-right">Shots (Head)</th>
                <th className="px-4 py-3 text-right">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {results.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-3 text-neutral-400">{r.date}</td>
                  <td className="px-4 py-3 font-sans font-medium text-white capitalize">
                    {r.drill}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-white tabular-nums">
                    {r.score}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400 tabular-nums">
                    {r.accuracy}%
                  </td>
                  <td className="px-4 py-3 text-right text-cyan-400 tabular-nums">
                    {r.avgReactionTimeMs} ms
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">
                    {r.hits}/{r.totalShots} ({r.headshots})
                  </td>
                  <td className="px-4 py-3 text-right font-sans text-[11px]">
                    {r.overshoots > r.undershoots ? (
                      <span className="text-amber-400">Overshooting (High Sens)</span>
                    ) : r.undershoots > r.overshoots ? (
                      <span className="text-blue-400">Undershooting (Low Sens)</span>
                    ) : (
                      <span className="text-emerald-400">Well Centered</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
