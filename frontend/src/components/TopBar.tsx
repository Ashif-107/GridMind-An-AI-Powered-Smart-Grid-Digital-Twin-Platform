'use client';

import { GridData } from '@/hooks/useGridData';

interface TopBarProps {
  data: GridData | null;
  connected: boolean;
}

export default function TopBar({ data, connected }: TopBarProps) {
  if (!data) return (
    <div className="w-full h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-slate-400">
      <span className="text-2xl font-black tracking-widest text-slate-100">
        GRID<span className="text-blue-500">MIND</span>
      </span>
      <span className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-sm font-medium">Waiting for Engine...</span>
      </span>
    </div>
  );

  const { weather, grid } = data;
  
  // Format time (0-23 hours)
  const hours = Math.floor(weather.time_of_day);
  const minutes = Math.floor((weather.time_of_day - hours) * 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  const isStable = Math.abs(grid.net_power_kw) < 50;

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Brand & Time */}
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black tracking-widest text-slate-100">
            GRID<span className="text-blue-500">MIND</span>
          </span>
          <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
            <span className="text-blue-400 font-mono text-xl">{timeString}</span>
            <div className="h-5 w-px bg-slate-600"></div>
            <span className={`font-semibold ${weather.condition === 'Normal' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
              {weather.condition}
            </span>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Demand</span>
            <span className="text-xl font-black text-amber-500 font-mono tracking-tight">{grid.total_consumption_kw.toFixed(1)} <span className="text-sm text-slate-500">kW</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Supply</span>
            <span className="text-xl font-black text-emerald-500 font-mono tracking-tight">{grid.total_generation_kw.toFixed(1)} <span className="text-sm text-slate-500">kW</span></span>
          </div>
          
          <div className="h-10 w-px bg-slate-800 mx-2"></div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Net Power</span>
            <span className={`text-xl font-black font-mono tracking-tight ${grid.net_power_kw >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              {grid.net_power_kw > 0 ? '+' : ''}{grid.net_power_kw.toFixed(1)} <span className="text-sm text-slate-500">kW</span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-6 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-sm font-semibold text-slate-300">
              {isStable ? 'Grid Stable' : 'Grid Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
