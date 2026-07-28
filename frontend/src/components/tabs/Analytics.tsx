'use client';

import { GridData } from '@/hooks/useGridData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap } from 'lucide-react';

interface AnalyticsProps {
  data: GridData | null;
  history: GridData[];
}

export default function Analytics({ data, history }: AnalyticsProps) {
  if (!data || history.length === 0) {
    return (
      <div className="p-8 h-[600px] flex items-center justify-center">
        <span className="text-slate-500 animate-pulse">Gathering grid telemetry...</span>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = history.map(h => {
    const time = `${Math.floor(h.weather.time_of_day).toString().padStart(2, '0')}:${Math.floor((h.weather.time_of_day % 1) * 60).toString().padStart(2, '0')}`;
    return {
      time,
      time_val: h.weather.time_of_day,
      generation: h.grid.total_generation_kw,
      consumption: h.grid.total_consumption_kw,
      net: h.grid.net_power_kw,
      house1_v: h.grid.feeder_metrics?.house1_v_pu || 1.0,
      house2_v: h.grid.feeder_metrics?.house2_v_pu || 1.0,
      trafo_load: h.grid.feeder_metrics?.trafo_loading_percent || 0,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* The Duck Curve (Power Balance) */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-slate-200">Real-Time Power Balance</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} width={70} 
                       tickFormatter={(val) => `${(val/1000).toFixed(0)} MW`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="generation" name="Total Generation" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGen)" />
                <Area type="monotone" dataKey="consumption" name="Total Consumption" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Physics Health (Pandapower) */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-200">Feeder Physics (Voltage p.u.)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} domain={[0.9, 1.1]} width={50} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="house1_v" name="House 1 Voltage" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="house2_v" name="House 2 (Solar) Voltage" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
