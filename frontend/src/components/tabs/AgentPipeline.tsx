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

  return (
    <div className="p-6 space-y-6 text-slate-100 pb-16">
      {/* Top Banner - Architecture Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/60 p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                Architectural Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono">Multi-Agent Decision Pipeline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-2">
              Agent Input / Parameter / Output Architecture
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Visualizing how real-time simulation parameters flow through the 4-Agent AI system. Candidate actions proposed by the AI are evaluated against <strong className="text-blue-300">pandapower AC power-flow physics guardrails</strong> before execution.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Pipeline Status</div>
              <div className="text-sm font-bold text-emerald-400">Active Real-Time Loop</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Pipeline Stage */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-bold uppercase text-slate-500 mr-2">Filter Stage:</span>
        {[
          { id: 'all', label: 'Entire Pipeline' },
          { id: 'forecaster', label: '1. Forecaster' },
          { id: 'planner', label: '2. Planner' },
          { id: 'validator', label: '3. Validator (Physics)' },
          { id: 'explainer', label: '4. Explainer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedAgent(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedAgent === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Pipeline Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
        {/* Stage 1: Forecasting Agent */}
        {(selectedAgent === 'all' || selectedAgent === 'forecaster') && (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Stage 1</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  status === 'DEFICIT_WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  status === 'HIGH_SURPLUS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                🔮 Forecasting Agent
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Lightweight trend extrapolation using a 4-step sliding window memory.
              </p>

              {/* INPUTS */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 mb-3 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-between">
                  <span>📥 Inputs Taken</span>
                  <span className="text-[9px] text-slate-500">Live Telemetry</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Natural Net Power:</span>
                  <span className="font-mono font-bold text-white">{netPower.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Sliding Window:</span>
                  <span className="font-mono text-slate-300">4 Ticks Memory</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Solar Irradiance:</span>
                  <span className="font-mono text-amber-300">{weather?.solar_irradiance ?? 0} W/m²</span>
                </div>
              </div>

              {/* OUTPUTS */}
              <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-900/40 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>📤 Outputs Produced</span>
                  <span className="text-[9px] text-emerald-500">Forecast Payload</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Predicted Net:</span>
                  <span className="font-mono font-bold text-emerald-400">{predNet.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Net Power Trend:</span>
                  <span className="font-mono text-slate-200">{(forecast?.trend_kw_per_hour ?? 0).toFixed(1)} kW/hr</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
              <span>Model: Trend Heuristic</span>
              <span>Target: t+1 Tick</span>
            </div>
          </div>
        )}

        {/* Stage 2: Planning Agent */}
        {(selectedAgent === 'all' || selectedAgent === 'planner') && (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-purple-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">Stage 2</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Candidate Proposed
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                ⚙️ Planning Agent
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Rule-based dispatch heuristics + dynamic pricing model (₹3 - ₹8/kWh).
              </p>

              {/* INPUTS */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 mb-3 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
                  <span>📥 Inputs Taken</span>
                  <span className="text-[9px] text-slate-500">From Forecaster</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Forecast Status:</span>
                  <span className="font-bold text-slate-200">{status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Target Power:</span>
                  <span className="font-mono text-purple-300">{Math.abs(predNet).toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Battery SoC:</span>
                  <span className="font-mono text-emerald-400">{battery?.soc?.toFixed(0) ?? 80}%</span>
                </div>
              </div>

              {/* OUTPUTS */}
              <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-900/40 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                  <span>📤 Proposed Action</span>
                  <span className="text-[9px] text-purple-400">To Validator</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Proposed Action:</span>
                  <span className="font-mono font-bold text-purple-300">{actionType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Candidate Amount:</span>
                  <span className="font-mono text-white">{reqAmount.toFixed(0)} kW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Dynamic Tariff:</span>
                  <span className="font-mono text-amber-300">₹{(ai?.current_price ?? 5.0).toFixed(2)}/kWh</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
              <span>Logic: Dispatch Heuristics</span>
              <span>Retry Ladder: Active</span>
            </div>
          </div>
        )}

        {/* Stage 3: Validator Agent (Physics Guardrail) */}
        {(selectedAgent === 'all' || selectedAgent === 'validator') && (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Stage 3 (Physics)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isRejected ? 'Action Rejected' : 'Physics Approved'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                🛡️ Physics Validator
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Pandapower AC load flow guardrail enforcing 0.955-1.045 p.u. voltage & &lt;95% trafo load limits.
              </p>

              {/* INPUTS */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 mb-3 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>📥 AC Load Flow Inputs</span>
                  <span className="text-[9px] text-slate-500">Pandapower Solver</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">House 1 Voltage (V_pu):</span>
                  <span className="font-mono text-emerald-300">{(feeder?.house1_v_pu ?? 1.0).toFixed(4)} p.u.</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">House 2 Voltage (V_pu):</span>
                  <span className="font-mono text-emerald-300">{(feeder?.house2_v_pu ?? 1.0).toFixed(4)} p.u.</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trafo Loading:</span>
                  <span className="font-mono text-amber-300">{(feeder?.trafo_loading_percent ?? 0).toFixed(1)}%</span>
                </div>
              </div>

              {/* OUTPUTS */}
              <div className={`rounded-lg p-3 border space-y-1.5 ${
                isRejected ? 'bg-red-950/30 border-red-900/40' : 'bg-emerald-950/30 border-emerald-900/40'
              }`}>
                <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between text-emerald-300">
                  <span>📤 Validated Output</span>
                  <span className="text-[9px] text-slate-400">Physical Command</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold ${isRejected ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isRejected ? 'OVERRIDDEN TO IDLE' : 'ACCEPTED'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Dispatched Power:</span>
                  <span className="font-mono font-bold text-white">{actAmount.toFixed(0)} kW</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
              <span>Engine: Pandapower AC Load Flow</span>
              <span>Margin: ±4.5% p.u.</span>
            </div>
          </div>
        )}

        {/* Stage 4: Explainer Agent */}
        {(selectedAgent === 'all' || selectedAgent === 'explainer') && (
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Stage 4</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Log Broadcasted
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                💬 Explainer Agent
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Translates validated decisions & physics safety events into natural language operator logs.
              </p>

              {/* INPUTS */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 mb-3 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>📥 Inputs Taken</span>
                  <span className="text-[9px] text-slate-500">From Validator</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Validated Action:</span>
                  <span className="font-mono text-slate-200">{actionType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Actual Dispatched:</span>
                  <span className="font-mono text-amber-300">{actAmount.toFixed(0)} kW</span>
                </div>
              </div>

              {/* OUTPUTS */}
              <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-900/40 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                  <span>📤 Operator Log Stream</span>
                </div>
                <p className="text-xs text-slate-300 font-mono italic leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-800">
                  "{reason || (actionType === 'DISCHARGE_BATTERY' ? `Grid deficit predicted. Dispatched ${actAmount.toFixed(0)}kW from Battery Reserves.` : 'Grid is balanced and operating within safe voltage margins.')}"
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
              <span>Output: Natural Language UI Feed</span>
              <span>Format: Operator Narrative</span>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Real-Time Parameter Matrix Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📊 Real-Time Parameter & Variable Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Complete catalog of parameters, units, data types, and live values currently driving the Digital Twin.
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
                <th className="py-3 px-4">Parameter Name</th>
                <th className="py-3 px-4">Layer / Agent</th>
                <th className="py-3 px-4">I/O Category</th>
                <th className="py-3 px-4">Data Type & Unit</th>
                <th className="py-3 px-4">Role / Physics Purpose</th>
                <th className="py-3 px-4 text-right">Current Live Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Dynamic Scenario Inputs */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">total_generation_kw</td>
                <td className="py-2.5 px-4 text-blue-400">Physical Grid</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">Scenario Input</span></td>
                <td className="py-2.5 px-4">Float (kW)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Aggregated city generation (Solar + Wind + Hydro)</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{(grid?.total_generation_kw ?? 0).toFixed(1)} kW</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">total_consumption_kw</td>
                <td className="py-2.5 px-4 text-blue-400">Physical Grid</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">Scenario Input</span></td>
                <td className="py-2.5 px-4">Float (kW)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Aggregated demand (Residential + Hospital + Industrial + Agri)</td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">{(grid?.total_consumption_kw ?? 0).toFixed(1)} kW</td>
              </tr>

              {/* Forecaster Params */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">natural_net_power_kw</td>
                <td className="py-2.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">Agent Input</span></td>
                <td className="py-2.5 px-4">Float (kW)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Net power balance excluding battery intervention</td>
                <td className="py-2.5 px-4 text-right font-bold text-white">{netPower.toFixed(1)} kW</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">predicted_net</td>
                <td className="py-2.5 px-4 text-purple-400">1. Forecaster</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-2.5 px-4">Float (kW)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Projected net power 1-step ahead</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-400">{predNet.toFixed(1)} kW</td>
              </tr>

              {/* Planner Params */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">proposed_action</td>
                <td className="py-2.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Agent Output</span></td>
                <td className="py-2.5 px-4">Tuple / Dict</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Candidate dispatch action ({'{'}type, amount_kw{'}'})</td>
                <td className="py-2.5 px-4 text-right font-bold text-purple-300">{actionType} ({reqAmount.toFixed(0)} kW)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">current_price</td>
                <td className="py-2.5 px-4 text-purple-400">2. Planner</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">Economic State</span></td>
                <td className="py-2.5 px-4">Float (₹/kWh)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Dynamic tariff calculated from deficit/surplus state</td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-300">₹{(ai?.current_price ?? 5.0).toFixed(2)}</td>
              </tr>

              {/* Pandapower Physics Params */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">house1_v_pu / house2_v_pu</td>
                <td className="py-2.5 px-4 text-emerald-400">3. Validator (Pandapower)</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Physics Metric</span></td>
                <td className="py-2.5 px-4">Float (p.u.)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Low-voltage bus magnitude (0.955 - 1.045 p.u. limit)</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-300">
                  {(feeder?.house1_v_pu ?? 1.0).toFixed(4)} / {(feeder?.house2_v_pu ?? 1.0).toFixed(4)} p.u.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-4 font-bold text-white">trafo_loading_percent</td>
                <td className="py-2.5 px-4 text-emerald-400">3. Validator (Pandapower)</td>
                <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Physics Metric</span></td>
                <td className="py-2.5 px-4">Float (%)</td>
                <td className="py-2.5 px-4 text-slate-400 font-sans">Secondary transformer thermal loading limit (&lt;95%)</td>
                <td className="py-2.5 px-4 text-right font-bold text-amber-400">{(feeder?.trafo_loading_percent ?? 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
