import sys
import os

# Ensure the parent directory is in sys.path so we can import simulation module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simulation.engine import SimulationEngine
from simulation.grid import CityGrid
from simulation.models import (
    ResidentialLoad, Hospital, IndustrialLoad, AgriculturalLoad,
    UtilityScaleSolar, RooftopSolar, ThermalPowerPlant, NuclearPowerPlant,
    BatteryBank, EVChargingStation
)

def setup_demo_grid() -> CityGrid:
    grid = CityGrid()
    
    # 1. Residential & Agricultural Loads
    for i in range(10): 
        grid.add_device(ResidentialLoad(f"house_{i}", f"Chennai Res {i}", base_load=2.0))
        # Add rooftop solar to some houses
        if i % 3 == 0:
            grid.add_device(RooftopSolar(f"roof_solar_{i}", f"Rooftop {i}"))
            
    grid.add_device(AgriculturalLoad("agri_1", "Cauvery Delta Pumps", pump_capacity_kw=15.0))
    
    # 2. Industrial / Critical Loads
    grid.add_device(Hospital("hosp_1", "Madurai Gen Hospital"))
    grid.add_device(IndustrialLoad("fact_1", "Coimbatore Textile Mill"))
    
    # 3. Generation Projects (Utility Scale)
    grid.add_device(UtilityScaleSolar("solar_1", "Kamuthi Solar Project", area_sqm=50000, efficiency=0.20))
    grid.add_device(ThermalPowerPlant("thermal_1", "NLC Thermal Station", capacity_kw=50000.0))
    grid.add_device(NuclearPowerPlant("nuke_1", "Kudankulam Nuclear", capacity_kw=100000.0))
    
    # 4. Storage & EVs
    grid.add_device(BatteryBank("batt_1", "TANGEDCO Grid Battery", capacity_kwh=5000.0, max_c_rate=0.2))
    grid.add_device(EVChargingStation("ev_1", "Tidel Park EV Station"))
    
    return grid

if __name__ == "__main__":
    grid = setup_demo_grid()
    engine = SimulationEngine(grid)
    
    # Let's start the simulation at 5:00 AM so we can see the sunrise shortly
    engine.weather.time_of_day = 5.0
    
    # Run at 1 tick per second
    engine.run(tick_interval_seconds=1.0)
