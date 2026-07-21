'use client';

import { GridData } from '@/hooks/useGridData';

interface LiveGridProps {
  data: GridData | null;
}

export default function LiveGrid({ data }: LiveGridProps) {
  if (!data) return null;

  // Find battery to show SoC
  const battery = data.grid.devices['batt_1'];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-slate-200">Virtual City Overview</h2>
        
        {battery && (
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Central Battery SoC</span>
              <span className="text-lg font-bold text-blue-400">{(battery.soc * 100).toFixed(1)}%</span>
            </div>
            {/* Simple Battery Visual */}
            <div className="w-16 h-8 border-2 border-slate-600 rounded-md p-0.5 flex relative">
               <div className="w-1 h-3 bg-slate-600 absolute -right-1.5 top-2 rounded-r-sm"></div>
               <div 
                 className={`h-full rounded-sm transition-all duration-1000 ${battery.soc > 0.2 ? 'bg-blue-500' : 'bg-red-500'}`}
                 style={{ width: `${battery.soc * 100}%` }}
               ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-96 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-lg">
          <div className="w-24 h-24 rounded-full bg-slate-700/50 border-2 border-dashed border-slate-600 flex items-center justify-center mb-6">
            <span className="text-3xl">🗺️</span>
          </div>
          <h3 className="text-xl font-medium text-slate-300 mb-2">Interactive Map Area</h3>
          <p className="text-slate-500 max-w-md">The 2D HTML5 Canvas map visualization will be embedded here in Phase 4. It will show live power flow animations between nodes.</p>
        </div>

        <div className="h-96 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Active Node Status</h3>
          <div className="space-y-3 overflow-y-auto max-h-[18rem] pr-2">
            {Object.values(data.grid.devices).map((device: any) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">{device.name}</span>
                  <span className="text-xs text-slate-500">{device.type}</span>
                </div>
                <div className="flex flex-col items-end">
                  {device.power_generated > 0 && (
                    <span className="text-xs font-bold text-emerald-400">+{device.power_generated.toFixed(1)} kW</span>
                  )}
                  {device.power_consumed > 0 && (
                    <span className="text-xs font-bold text-amber-400">-{device.power_consumed.toFixed(1)} kW</span>
                  )}
                  {device.power_generated === 0 && device.power_consumed === 0 && (
                    <span className="text-xs text-slate-600 font-mono">0.0 kW</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
