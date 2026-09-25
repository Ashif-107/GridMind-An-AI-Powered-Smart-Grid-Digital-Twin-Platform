'use client';

import { useState } from 'react';

interface StressConsoleProps {
  currentMode?: string;
}

export default function StressConsole({ currentMode = 'none' }: StressConsoleProps) {
  const [loadingMode, setLoadingMode] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'cloud_drop',
      label: 'Cloud Cover Drop',
      icon: '⛅',
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-300',
      desc: 'Drops solar generation by 75%',
    },
    {
      id: 'voltage_surge',
      label: 'Rooftop Voltage Surge',
      icon: '⚡',
      color: 'hover:border-red-500/50 hover:bg-red-500/10 text-red-300',
      desc: 'Forces V > 1.048 p.u. (Validator REJECT)',
    },
    {
      id: 'transformer_overload',
      label: 'Transformer Overload',
      icon: '🔌',
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300',
      desc: 'Forces Trafo load > 95% (Thermal REJECT)',
    },
    {
      id: 'agri_spike',
      label: 'Agri Pump Spike',
      icon: '🚜',
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-300',
      desc: 'Simultaneous Cauvery pump surge (+150kW)',
    },
    {
      id: 'cyclone',
      label: 'Cyclone Storm Mode',
      icon: '🌪️',
      color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-300',
      desc: '35m/s wind storm + zero solar',
    },
    {
      id: 'ev_rush',
      label: 'EV Rush Hour Peak',
      icon: '🏎️',
      color: 'hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-300',
      desc: 'Tidel Park EV surge (+200kW)',
    },
  ];

  const handleTrigger = async (modeId: string) => {
    setLoadingMode(modeId);
    try {
      await fetch(`http://127.0.0.1:8000/api/scenarios/stress/${modeId}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to trigger stress scenario:', err);
    } finally {
      setLoadingMode(null);
    }
  };

  const getActiveBadgeLabel = (mode: string) => {
    switch (mode) {
      case 'cloud_drop': return '⛅ ACTIVE FAULT: 75% Cloud Cover Solar Loss';
      case 'voltage_surge': return '⚡ ACTIVE FAULT: Rooftop Solar Over-Voltage (>1.048 p.u.)';
      case 'transformer_overload': return '🔌 ACTIVE FAULT: Distribution Transformer Overload (>95%)';
      case 'agri_spike': return '🚜 ACTIVE FAULT: Agricultural Free Power Demand Spike (+150kW)';
      case 'cyclone': return '🌪️ ACTIVE HAZARD: Severe Cyclone Storm (35m/s Wind)';
      case 'ev_rush': return '🏎️ ACTIVE FAULT: Tidel Park EV Station Peak Surge (+200kW)';
      default: return '🟢 GRID STATUS: Normal Baseline Simulation';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 p-4 shadow-xl">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header & Status Indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              🎮 Interactive Grid Stress & Fault Controls
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Multi-Agent Pipeline Testing</span>
          </div>

          {/* Active Mode Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
            currentMode === 'none' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse shadow-lg shadow-red-500/10'
          }`}>
            {getActiveBadgeLabel(currentMode)}
          </div>
        </div>

        {/* 6 Scenario Trigger Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {scenarios.map((sc) => {
            const isActive = currentMode === sc.id;
            const isLoading = loadingMode === sc.id;

            return (
              <button
                key={sc.id}
                onClick={() => handleTrigger(sc.id)}
                disabled={isLoading}
                title={sc.desc}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50'
                    : `bg-slate-950/60 border-slate-800 text-slate-300 ${sc.color}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{sc.icon}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  )}
                </div>
                <div className="mt-1">
                  <div className="text-[11px] font-bold leading-tight">{sc.label}</div>
                  <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{sc.desc}</div>
                </div>
              </button>
            );
          })}

          {/* Reset Button */}
          <button
            onClick={() => handleTrigger('none')}
            disabled={loadingMode === 'none'}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              currentMode === 'none'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">🔄</span>
            </div>
            <div className="mt-1">
              <div className="text-[11px] font-bold leading-tight">Reset Grid</div>
              <div className="text-[9px] text-slate-400">Normal Baseline</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
