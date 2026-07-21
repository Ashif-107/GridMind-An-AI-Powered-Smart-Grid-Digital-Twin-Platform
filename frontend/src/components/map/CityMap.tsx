'use client';

import { useEffect, useRef, useState } from 'react';
import { GridData } from '@/hooks/useGridData';
import { MapEngine } from './mapEngine';

interface CityMapProps {
  data: GridData | null;
}

export default function CityMap({ data }: CityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<MapEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const mapEngine = new MapEngine(canvasRef.current);
    mapEngine.start();
    setEngine(mapEngine);

    return () => {
      mapEngine.stop();
    };
  }, []);

  useEffect(() => {
    if (engine && data) {
      engine.updateData(data);
    }
  }, [data, engine]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 shadow-inner relative flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="max-w-full max-h-full object-contain"
      />
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-xl flex flex-col gap-3 shadow-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grid Legend</span>
        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div><span className="text-xs font-medium text-slate-300">Generating</span></div>
        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div><span className="text-xs font-medium text-slate-300">Consuming</span></div>
        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div><span className="text-xs font-medium text-slate-300">Idle / Balanced</span></div>
        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div><span className="text-xs font-medium text-slate-300">Offline / Blackout</span></div>
      </div>
    </div>
  );
}
