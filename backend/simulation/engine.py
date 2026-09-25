import time
from .weather import WeatherEngine
from .grid import CityGrid
from .agent_manager import AgentManager

class SimulationEngine:
    def __init__(self, grid: CityGrid):
        self.weather = WeatherEngine()
        self.grid = grid
        self.agent_manager = AgentManager()
        self.last_agent_output = {}
        self.last_printed_log_id = -1
        self.stress_mode = "none"
        
    def set_stress_mode(self, mode: str):
        self.stress_mode = mode
        if mode == "cyclone":
            self.weather.set_condition("Cyclone")
        elif mode == "cloud_drop":
            self.weather.set_condition("Cloudy")
        elif mode == "none":
            self.weather.set_condition("Normal")
        
    def step(self):
        self.weather.step()
        weather_state = self.weather.get_state()
        self.grid.step(weather_state, stress_mode=self.stress_mode)
        
        # Run AI Pipeline
        grid_state = self.grid.get_state()
        # Mix in weather for the forecaster
        grid_state["weather"] = weather_state 
        self.last_agent_output = self.agent_manager.step(grid_state, self.grid)
        
    def get_state(self) -> dict:
        return {
            "weather": self.weather.get_state(),
            "grid": self.grid.get_state(),
            "ai_agents": self.last_agent_output
        }
        
    def run(self, tick_interval_seconds: float = 1.0):
        print("Starting GridMind Simulation Engine...")
        try:
            while True:
                self.step()
                state = self.get_state()
                
                weather = state["weather"]
                grid = state["grid"]
                
                time_of_day = weather['time_of_day']
                hours = int(time_of_day)
                minutes = int((time_of_day - hours) * 60)
                
                print(f"Time: {hours:02d}:{minutes:02d} | "
                      f"Condition: {weather['condition']} | "
                      f"Temp: {weather['temperature']:.1f}°C | "
                      f"Solar Irrad: {weather['solar_irradiance']:.0f} W/m2 | "
                      f"Wind: {weather['wind_speed']:.1f} m/s")
                print(f"Total Gen: {grid['total_generation_kw']:.1f} kW | "
                      f"Total Cons: {grid['total_consumption_kw']:.1f} kW | "
                      f"Net: {grid['net_power_kw']:.1f} kW")
                      
                feeder = grid.get("feeder_metrics")
                if feeder:
                    print(f"Physics [Pandapower] -> House1 V: {feeder['house1_v_pu']:.4f} p.u. | "
                          f"House2 V: {feeder['house2_v_pu']:.4f} p.u. | "
                          f"Trafo Load: {feeder['trafo_loading_percent']:.2f}%")
                          
                # Print recent AI Agent Logs
                ai_logs = state.get("ai_agents", {}).get("logs", [])
                if ai_logs:
                    latest_log = ai_logs[-1]
                    if latest_log['id'] != self.last_printed_log_id:
                        print(f"[AI {latest_log['agent']}] {latest_log['message']}")
                        self.last_printed_log_id = latest_log['id']
                          
                print("-" * 60)
                
                time.sleep(tick_interval_seconds)
        except KeyboardInterrupt:
            print("Simulation stopped.")
