import sys
import os

# Ensure the parent directory is in sys.path so we can import simulation module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simulation.engine import SimulationEngine
from simulation.grid import CityGrid
from simulation.models import (
    House, Hospital, Factory, SolarFarm, WindFarm, BatteryBank, EVChargingStation
)

def setup_demo_grid() -> CityGrid:
    grid = CityGrid()
    
    # Add consumers
    for i in range(10): # 10 houses
        grid.add_device(House(f"house_{i}", f"House {i}", base_load=2.0))
        
    grid.add_device(Hospital("hosp_1", "City Hospital"))
    grid.add_device(Factory("fact_1", "Steel Plant"))
    
    # Add producers
    grid.add_device(SolarFarm("solar_1", "Eastside Solar", area_sqm=10000, efficiency=0.20)) # ~2000kW peak
    grid.add_device(WindFarm("wind_1", "North Ridge Wind", rated_power=1000.0))
    
    # Add storage & EVs
    grid.add_device(BatteryBank("batt_1", "Central Battery", capacity_kwh=5000.0, max_c_rate=0.2))
    grid.add_device(EVChargingStation("ev_1", "Downtown EV Station"))
    
    return grid

if __name__ == "__main__":
    grid = setup_demo_grid()
    engine = SimulationEngine(grid)
    
    # Let's start the simulation at 5:00 AM so we can see the sunrise shortly
    engine.weather.time_of_day = 5.0
    
    # Run at 1 tick per second
    engine.run(tick_interval_seconds=1.0)
