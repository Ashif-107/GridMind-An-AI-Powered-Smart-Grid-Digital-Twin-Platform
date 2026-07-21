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
    devices: Record<string, GridDevice>;
  };
}

export function useGridData() {
  const [data, setData] = useState<GridData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
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

  return { data, connected };
}
