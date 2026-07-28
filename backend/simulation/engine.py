import time
from .weather import WeatherEngine
from .grid import CityGrid

class SimulationEngine:
    def __init__(self, grid: CityGrid):
        self.weather = WeatherEngine()
        self.grid = grid
        
    def step(self):
        self.weather.step()
        weather_state = self.weather.get_state()
        self.grid.step(weather_state)
        
    def get_state(self) -> dict:
        return {
            "weather": self.weather.get_state(),
            "grid": self.grid.get_state()
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
                          
                print("-" * 60)
                
                time.sleep(tick_interval_seconds)
        except KeyboardInterrupt:
            print("Simulation stopped.")
