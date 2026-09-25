import { useState, useEffect } from 'react';

export interface GridDevice {
  id: string;
  name: string;
  type: string;
  is_online: boolean;
  power_generated: number;
  power_consumed: number;
  net_power: number;
  soc?: number;
  capacity_kwh?: number;
}

export interface AILog {
  id: number;
  agent: string;
  message: string;
  level: string;
  timestamp: string;
}

export interface AgentAction {
  type: string;
  amount_kw?: number;
  actual_amount_kw?: number;
  reason?: string;
}

export interface AgentForecast {
  status: string;
  current_net: number;
  predicted_net?: number;
  trend_kw_per_hour?: number;
}

export interface GridData {
  weather: {
    time_of_day: number;
    condition: string;
    solar_irradiance: number;
    wind_speed: number;
    temperature: number;
  };
  grid: {
    total_generation_kw: number;
    total_consumption_kw: number;
    net_power_kw: number;
    natural_net_power_kw?: number;
    feeder_metrics?: {
      house1_v_pu: number;
      house2_v_pu: number;
      trafo_loading_percent: number;
    };
    devices: Record<string, GridDevice>;
  };
  ai_agents?: {
    forecast?: AgentForecast;
    latest_action?: AgentAction;
    current_price?: number;
    logs: AILog[];
  };
}

export function useGridData() {
  const [data, setData] = useState<GridData | null>(null);
  const [history, setHistory] = useState<GridData[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket('ws://127.0.0.1:8000/ws');

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
          setHistory(prev => {
            const newHistory = [...prev, parsed];
            // Keep last 100 ticks for charts
            if (newHistory.length > 100) return newHistory.slice(newHistory.length - 100);
            return newHistory;
          });
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket Error", err);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  return { data, history, connected };
}
