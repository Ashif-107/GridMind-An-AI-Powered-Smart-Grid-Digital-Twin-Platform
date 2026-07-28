import { GridData } from '@/hooks/useGridData';
import { Bot, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AICommandProps {
  data: GridData | null;
}

export default function AICommand({ data }: AICommandProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  const agents = data?.ai_agents;
  const logs = agents?.logs || [];
  const status = agents?.forecast?.status || 'STABLE';
  const price = agents?.current_price || 5.0;

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="p-6 h-[650px] grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left: AI Status Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Bot className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-semibold text-slate-200">AI Agents</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Grid Status Forecast</span>
              <div className={`mt-1 text-lg font-bold flex items-center gap-2 ${status === 'DEFICIT_WARNING' ? 'text-red-400' : status === 'HIGH_SURPLUS' ? 'text-blue-400' : 'text-emerald-400'}`}>
                {status === 'DEFICIT_WARNING' && <AlertTriangle className="w-5 h-5" />}
                {status === 'STABLE' && <ShieldCheck className="w-5 h-5" />}
                {status}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dynamic Market Price</span>
              <div className="mt-1 text-2xl font-bold text-amber-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                ₹{price.toFixed(2)} / kWh
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-700/50">
               <h4 className="text-sm font-medium text-slate-300 mb-3">Active Sub-Agents</h4>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">Forecaster</span>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">Planner</span>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">Validator</span>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">Explainer</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Timeline / Log Feed */}
      <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/80">
          <h3 className="text-lg font-semibold text-slate-200">AI Command Timeline</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center mt-10">Awaiting agent telemetry...</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 rounded-xl border ${
                  log.level === 'ERROR' ? 'bg-red-900/20 border-red-500/30 text-red-200' :
                  log.level === 'WARNING' ? 'bg-amber-900/20 border-amber-500/30 text-amber-200' :
                  'bg-blue-900/20 border-blue-500/30 text-blue-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold opacity-80">[{log.agent}]</span>
                  <span className="text-xs opacity-60">{log.timestamp}</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{log.message}</div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
