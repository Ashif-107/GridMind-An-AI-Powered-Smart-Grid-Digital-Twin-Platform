'use client';

import { useState } from 'react';
import { GridData } from '@/hooks/useGridData';

interface AgentPipelineProps {
  data: GridData | null;
}

export default function AgentPipeline({ data }: AgentPipelineProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  const weather = data?.weather;
  const grid = data?.grid;
  const ai = data?.ai_agents;
  const forecast = ai?.forecast;
  const action = ai?.latest_action;
  const feeder = grid?.feeder_metrics;

  const netPower = grid?.net_power_kw ?? 0;
  const predNet = forecast?.predicted_net ?? netPower;
  const status = forecast?.status ?? 'STABLE';

  const actionType = action?.type ?? 'IDLE';
  const reqAmount = action?.amount_kw ?? 0;
  const actAmount = action?.actual_amount_kw ?? reqAmount;
  const reason = action?.reason ?? '';
  const isRejected = reason.toLowerCase().includes('reject');

  // Battery device lookup for SoC
  const battery = grid?.devices ? Object.values(grid.devices).find(d => d.type === 'battery') : null;
  const batterySoc = battery?.soc?.toFixed(0) ?? '80';

  return (
    <div className="p-6 space-y-8 text-slate-100 pb-20 max-w-6xl mx-auto">
      

      {/* Stage Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-bold uppercase text-slate-500 mr-2">Filter View:</span>
        {[
          { id: 'all', label: 'Full Vertical Pipeline' },
          { id: 'forecaster', label: '1. Forecaster' },
          { id: 'planner', label: '2. Planner' },
          { id: 'validator', label: '3. Validator (Physics)' },
          { id: 'der', label: '4. DER Execution' },
          { id: 'explainer', label: '5. Explainer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedAgent(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedAgent === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vertical Pipeline Container */}
      <div className="space-y-6 relative">

        {/* STAGE 0: Scenario & Environmental Sensor Layer */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-xs">
                S0
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Physical Grid Telemetry & Environmental Sensors</h3>
                <p className="text-xs text-slate-400">Raw scenario parameters driving the digital twin simulation loop</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Live Sensor Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium mb-1">Total Generation (P_gen)</div>
              <div className="text-lg font-mono font-bold text-emerald-400">{(grid?.total_generation_kw ?? 0).toFixed(1)} kW</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium mb-1">Total Consumption (P_cons)</div>
              <div className="text-lg font-mono font-bold text-amber-400">{(grid?.total_consumption_kw ?? 0).toFixed(1)} kW</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium mb-1">Solar Irradiance</div>
              <div className="text-lg font-mono font-bold text-amber-300">{(weather?.solar_irradiance ?? 0).toFixed(0)} W/m²</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium mb-1">Wind Speed</div>
              <div className="text-lg font-mono font-bold text-cyan-300">{(weather?.wind_speed ?? 0).toFixed(1)} m/s</div>
            </div>
          </div>
        </div>

        {/* Vertical Connector Arrow 0 -> 1 */}
        {(selectedAgent === 'all' || selectedAgent === 'forecaster') && (
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center gap-1 text-slate-500">
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-blue-400"></div>
              <span className="text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-blue-300">
                ↓ Streaming Telemetry (natural_net_power_kw)
              </span>
              <div className="w-0.5 h-4 bg-blue-400"></div>
            </div>
          </div>
        )}

        {/* STAGE 1: Forecasting Agent */}
        {(selectedAgent === 'all' || selectedAgent === 'forecaster') && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center text-xs">
                  01
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🔮 Forecasting Agent
                  </h3>
                  <p className="text-xs text-slate-400">Lightweight short-term trend extrapolation (P_t+1 = P_t + ΔP) via 4-step sliding window memory</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'DEFICIT_WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                status === 'HIGH_SURPLUS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INPUTS TAKEN */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">📥 INPUTS TAKEN</span>
                  <span className="text-[10px] text-slate-500 font-mono">Scenario Telemetry</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">natural_net_power_kw:</span>
                    <span className="font-mono font-bold text-white text-sm">{netPower.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">history_net:</span>
                    <span className="font-mono text-slate-300">4-Tick Memory Window</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">solar_irradiance:</span>
                    <span className="font-mono text-amber-300">{(weather?.solar_irradiance ?? 0).toFixed(0)} W/m²</span>
                  </div>
                </div>
              </div>

              {/* OUTPUTS PRODUCED */}
              <div className="bg-blue-950/20 rounded-xl p-4 border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">📤 OUTPUTS PRODUCED</span>
                  <span className="text-[10px] text-emerald-500 font-mono">To Stage 2 Planner</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-blue-900/30">
                    <span className="text-slate-400 font-mono">predicted_net (P_t+1):</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{predNet.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-blue-900/30">
                    <span className="text-slate-400 font-mono">trend_kw_per_hour:</span>
                    <span className="font-mono text-slate-200">{(forecast?.trend_kw_per_hour ?? 0).toFixed(1)} kW/hr</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-blue-900/30">
                    <span className="text-slate-400 font-mono">status:</span>
                    <span className="font-mono font-bold text-blue-300">{status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Connector Arrow 1 -> 2 */}
        {(selectedAgent === 'all' || selectedAgent === 'planner') && (
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center gap-1 text-purple-400">
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              <span className="text-[10px] font-mono bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700 text-purple-300">
                ↓ forecast payload (status: {status}, predicted_net: {predNet.toFixed(0)} kW)
              </span>
              <div className="w-0.5 h-4 bg-purple-500"></div>
            </div>
          </div>
        )}

        {/* STAGE 2: Planning Agent */}
        {(selectedAgent === 'all' || selectedAgent === 'planner') && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-purple-500/40 transition-all relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono font-bold flex items-center justify-center text-xs">
                  02
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    ⚙️ Planning Agent
                  </h3>
                  <p className="text-xs text-slate-400">Rule-based dispatch heuristics + Dynamic tariff calculation (₹3 - ₹8/kWh)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Candidate Proposed
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INPUTS TAKEN */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">📥 INPUTS TAKEN</span>
                  <span className="text-[10px] text-slate-500 font-mono">From Forecaster & Battery</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">forecast payload:</span>
                    <span className="font-mono text-purple-300 font-bold">{status}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">battery_soc:</span>
                    <span className="font-mono text-emerald-400 font-bold">{batterySoc}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">last_rejection:</span>
                    <span className={`font-mono font-bold ${isRejected ? 'text-red-400' : 'text-slate-500'}`}>
                      {isRejected ? 'Active (Replan P/2)' : 'null'}
                    </span>
                  </div>
                </div>
              </div>

              {/* OUTPUTS PRODUCED */}
              <div className="bg-purple-950/20 rounded-xl p-4 border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">📤 PROPOSED CANDIDATE ACTION</span>
                  <span className="text-[10px] text-purple-400 font-mono">To Stage 3 Validator</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-purple-900/30">
                    <span className="text-slate-400 font-mono">proposed_action:</span>
                    <span className="font-mono font-bold text-purple-300 text-sm">{actionType}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-purple-900/30">
                    <span className="text-slate-400 font-mono">amount_kw:</span>
                    <span className="font-mono font-bold text-white text-sm">{reqAmount.toFixed(0)} kW</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-purple-900/30">
                    <span className="text-slate-400 font-mono">dynamic_tariff:</span>
                    <span className="font-mono text-amber-300 font-bold">₹{(ai?.current_price ?? 5.0).toFixed(2)}/kWh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vertical Connector Arrow 2 -> 3 */}
        {(selectedAgent === 'all' || selectedAgent === 'validator') && (
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center gap-1 text-emerald-400">
              <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-emerald-500"></div>
              <span className="text-[10px] font-mono bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700 text-emerald-300">
                ↓ proposed_action ({actionType} @ {reqAmount.toFixed(0)} kW)
              </span>
              <div className="w-0.5 h-4 bg-emerald-500"></div>
            </div>
          </div>
        )}

        {/* STAGE 3: Physics Validator Agent (Pandapower AC Guardrail) */}
        {(selectedAgent === 'all' || selectedAgent === 'validator') && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-emerald-500/40 transition-all relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                  03
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🛡️ Physics Validator Agent (Pandapower Solver)
                  </h3>
                  <p className="text-xs text-slate-400">AC power-flow physics guardrail enforcing 0.955 - 1.045 p.u. voltage limits and &lt;95% transformer load</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {isRejected ? 'Action Rejected' : 'Physics Approved'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INPUTS TAKEN */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">📥 AC LOAD FLOW INPUTS</span>
                  <span className="text-[10px] text-slate-500 font-mono">Pandapower Feeder</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">house1_v_pu (Consumer Bus):</span>
                    <span className="font-mono font-bold text-emerald-300">{(feeder?.house1_v_pu ?? 1.0).toFixed(4)} p.u.</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">house2_v_pu (Rooftop Solar):</span>
                    <span className="font-mono font-bold text-emerald-300">{(feeder?.house2_v_pu ?? 1.0).toFixed(4)} p.u.</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-mono">trafo_loading_percent:</span>
                    <span className="font-mono font-bold text-amber-300">{(feeder?.trafo_loading_percent ?? 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* OUTPUTS PRODUCED */}
              <div className={`rounded-xl p-4 border space-y-3 ${
                isRejected ? 'bg-red-950/20 border-red-900/40' : 'bg-emerald-950/20 border-emerald-900/40'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">📤 VALIDATED DECISION</span>
                  <span className="text-[10px] text-slate-400 font-mono">Physical Output</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-mono">validated_action:</span>
                    <span className={`font-mono font-bold text-sm ${isRejected ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isRejected ? 'IDLE (Rejection)' : 'APPROVED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-mono">actual_amount_kw:</span>
                    <span className="font-mono font-bold text-white text-sm">{actAmount.toFixed(0)} kW</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-mono">rejection_reason:</span>
                    <span className="font-mono text-slate-300">{reason || 'None (Safe)'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Loop Indicator Banner */}
            {isRejected && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
                <span>🔄 <strong>Feedback Loop Active</strong>: Validator rejected action → Triggers Planner to retry with halved amount (P / 2)</span>
                <span className="font-mono text-[10px] bg-red-900/50 px-2 py-1 rounded text-red-200">Retry Ladder</span>
              </div>
            )}
          </div>
        )}

        {/* Branch Visual Indicator 3 -> (4 DER Execution & 5 Explainer) */}
        {(selectedAgent === 'all' || selectedAgent === 'der' || selectedAgent === 'explainer') && (
          <div className="flex justify-center my-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
              <span className="text-[10px] font-mono bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 text-emerald-300 shadow-md">
                ⚡ Validated Command Split: Parallel DER Execution & Operator Narrative Logging
              </span>
              <div className="w-0.5 h-4 bg-emerald-400"></div>
            </div>
          </div>
        )}

        {/* STAGE 4 & STAGE 5 (Side-by-side execution & logging stages) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* STAGE 4: Physical DER Asset Execution Controller */}
          {(selectedAgent === 'all' || selectedAgent === 'der') && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-emerald-500/40 transition-all border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                      04
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        ⚡ DER Asset Controller
                      </h3>
                      <p className="text-xs text-slate-400">Physical twin asset dispatch execution layer</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Twin Impact
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">📥 DISPATCH COMMAND RECEIVED</div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Action:</span>
                      <span className="font-bold text-emerald-300">{actionType}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Power Magnitude:</span>
                      <span className="font-bold text-white">{actAmount.toFixed(0)} kW</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 rounded-xl p-3.5 border border-emerald-900/40 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">📤 PHYSICAL ASSET STATE</div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Battery Status:</span>
                      <span className="font-bold text-emerald-400">
                        {actionType === 'CHARGE_BATTERY' ? `Charging @ ${actAmount.toFixed(0)} kW` :
                         actionType === 'DISCHARGE_BATTERY' ? `Discharging @ ${actAmount.toFixed(0)} kW` : 'Standby / Idle'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Updated SoC:</span>
                      <span className="font-bold text-white">{batterySoc}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Target: Central Battery Bank</span>
                <span>Response: 1-Tick Realtime</span>
              </div>
            </div>
          )}

          {/* STAGE 5: Explainer Agent (Operator Narrative Logging) */}
          {(selectedAgent === 'all' || selectedAgent === 'explainer') && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                      05
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        💬 Explainer Agent
                      </h3>
                      <p className="text-xs text-slate-400">Operator narrative synthesis & control room logging</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Log Broadcasted
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">📥 LOG CONTEXT RECEIVED</div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">validated_action:</span>
                      <span className="font-bold text-slate-200">{actionType}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">actual_amount_kw:</span>
                      <span className="font-bold text-amber-300">{actAmount.toFixed(0)} kW</span>
                    </div>
                  </div>

                  <div className="bg-amber-950/20 rounded-xl p-3.5 border border-amber-900/40 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300">📤 OPERATOR NARRATIVE STREAM</div>
                    <p className="text-xs text-slate-200 font-mono italic leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                      "{reason || (actionType === 'DISCHARGE_BATTERY' ? `Grid deficit predicted. Dispatched ${actAmount.toFixed(0)}kW from Battery Reserves.` : 'Grid is balanced and operating within safe voltage margins.')}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Output: Natural Language Log</span>
                <span>Format: Control Room UI</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Comprehensive Real-Time Parameter Matrix Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📊 Complete Real-Time Parameter & Variable Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Rigorous input/output catalog of every dynamic variable and physical metric passing through each agent stage.
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-xs font-mono text-blue-400 rounded-lg border border-slate-700">
            {ai?.logs?.length ?? 0} Agent Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Parameter Name</th>
                <th className="py-3.5 px-4">Layer / Agent</th>
                <th className="py-3.5 px-4">I/O Category</th>
                <th className="py-3.5 px-4">Data Type & Unit</th>
                <th className="py-3.5 px-4">Role / Physics Purpose</th>
                <th className="py-3.5 px-4 text-right">Current Live Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Scenario Level */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">total_generation_kw</td>
                <td className="py-3.5 px-4 text-blue-400">Physical Grid</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px]">Scenario Input</span></td>
                <td className="py-3.5 px-4">Float (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Aggregated city generation (Solar + Wind + Hydro)</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{(grid?.total_generation_kw ?? 0).toFixed(1)} kW</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">total_consumption_kw</td>
                <td className="py-3.5 px-4 text-blue-400">Physical Grid</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px]">Scenario Input</span></td>
                <td className="py-3.5 px-4">Float (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Aggregated demand (Residential + Hospital + Industrial + Agri)</td>
                <td className="py-3.5 px-4 text-right font-bold text-amber-400">{(grid?.total_consumption_kw ?? 0).toFixed(1)} kW</td>
              </tr>

              {/* Forecaster Stage */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">natural_net_power_kw</td>
                <td className="py-3.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px]">Agent Input</span></td>
                <td className="py-3.5 px-4">Float (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Net power balance excluding battery intervention</td>
                <td className="py-3.5 px-4 text-right font-bold text-white">{netPower.toFixed(1)} kW</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">history_net</td>
                <td className="py-3.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px]">Agent Input</span></td>
                <td className="py-3.5 px-4">Float List (4 Ticks)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Sliding window historical memory buffer for trend calculation</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-300">4 Ticks Memory</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">predicted_net</td>
                <td className="py-3.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-3.5 px-4">Float (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Projected net power 1-step ahead (P_t+1)</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{predNet.toFixed(1)} kW</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">status</td>
                <td className="py-3.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-3.5 px-4">Categorical String</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Forecast alert level (DEFICIT_WARNING / HIGH_SURPLUS / STABLE)</td>
                <td className="py-3.5 px-4 text-right font-bold text-blue-300">{status}</td>
              </tr>

              {/* Planner Stage */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">forecast</td>
                <td className="py-3.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px]">Agent Input</span></td>
                <td className="py-3.5 px-4">Object / Dict</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Complete forecast payload passed from Forecaster</td>
                <td className="py-3.5 px-4 text-right font-bold text-slate-300">Received ({status})</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">battery_soc</td>
                <td className="py-3.5 px-4 text-purple-400">2. Planner / Validator</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px]">Agent Input</span></td>
                <td className="py-3.5 px-4">Float (%)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Battery State of Charge capacity headroom</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{batterySoc}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">last_rejection</td>
                <td className="py-3.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px]">Feedback Loop</span></td>
                <td className="py-3.5 px-4">String / null</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Rejection reason feedback from Validator triggering retry (P/2)</td>
                <td className={`py-3.5 px-4 text-right font-bold ${isRejected ? 'text-red-400' : 'text-slate-500'}`}>
                  {isRejected ? 'Active (Retry)' : 'null'}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">proposed_action & amount_kw</td>
                <td className="py-3.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-3.5 px-4">Tuple / Dict (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Candidate dispatch action ({'{'}type, amount_kw{'}'})</td>
                <td className="py-3.5 px-4 text-right font-bold text-purple-300">{actionType} ({reqAmount.toFixed(0)} kW)</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">current_price</td>
                <td className="py-3.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px]">Economic State</span></td>
                <td className="py-3.5 px-4">Float (₹/kWh)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Dynamic tariff calculated from deficit/surplus state</td>
                <td className="py-3.5 px-4 text-right font-bold text-amber-300">₹{(ai?.current_price ?? 5.0).toFixed(2)}</td>
              </tr>

              {/* Pandapower Physics Validator */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">house1_v_pu / house2_v_pu</td>
                <td className="py-3.5 px-4 text-emerald-400">3. Validator (Pandapower)</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Physics Metric</span></td>
                <td className="py-3.5 px-4">Float (p.u.)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Low-voltage bus magnitude (0.955 - 1.045 p.u. safety limit)</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-300">
                  {(feeder?.house1_v_pu ?? 1.0).toFixed(4)} / {(feeder?.house2_v_pu ?? 1.0).toFixed(4)} p.u.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">trafo_loading_percent</td>
                <td className="py-3.5 px-4 text-emerald-400">3. Validator (Pandapower)</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Physics Metric</span></td>
                <td className="py-3.5 px-4">Float (%)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Secondary transformer thermal loading limit (&lt;95%)</td>
                <td className="py-3.5 px-4 text-right font-bold text-amber-400">{(feeder?.trafo_loading_percent ?? 0).toFixed(1)}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">validated_action & actual_amount_kw</td>
                <td className="py-3.5 px-4 text-emerald-400">3. Validator</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-3.5 px-4">Dict / Enum (kW)</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Physics-approved command sent to DER Controller & Explainer</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                  {isRejected ? 'IDLE (0 kW)' : `APPROVED (${actAmount.toFixed(0)} kW)`}
                </td>
              </tr>

              {/* Explainer */}
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">operator_log & timestamp</td>
                <td className="py-3.5 px-4 text-amber-400">5. Explainer</td>
                <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px]">Agent Output</span></td>
                <td className="py-3.5 px-4">String & Datetime</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">Natural language operator narrative generated for control room UI</td>
                <td className="py-3.5 px-4 text-right font-bold text-amber-300">Live Log Streamed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
