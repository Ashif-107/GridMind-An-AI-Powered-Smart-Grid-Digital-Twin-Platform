from typing import Dict
from .models.base import Device
from .pandapower_feeder import PandapowerFeeder

class CityGrid:
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        self.feeder = PandapowerFeeder()
        self.stress_mode = "none"
        
    def add_device(self, device: Device):
        self.devices[device.id] = device
        
    def step(self, weather_state: dict, stress_mode: str = "none"):
        self.stress_mode = stress_mode
        
        # Override weather if cyclone stress mode is active
        if stress_mode == "cyclone":
            weather_state["condition"] = "Cyclone"
            weather_state["solar_irradiance"] = 0.0
            weather_state["wind_speed"] = 35.0
        elif stress_mode == "cloud_drop":
            weather_state["condition"] = "Cloudy"
            weather_state["solar_irradiance"] = 100.0
        elif stress_mode == "none":
            if weather_state.get("condition") in ["Cyclone", "Cloudy"]:
                weather_state["condition"] = "Normal"
            
        for device in self.devices.values():
            device.step(weather_state)
            
        # Specific Device Stress Overrides
        if stress_mode == "agri_spike":
            agri = self.devices.get("agri_1")
            if agri:
                agri.power_consumed = 180.0
        elif stress_mode == "ev_rush":
            ev = self.devices.get("ev_1")
            if ev:
                ev.power_consumed = 200.0
            
        # Run pandapower load-flow for the sandbox feeder using sample loads
        house1_load = self.devices.get("house_0")
        house2_load = self.devices.get("house_1")
        solar_gen = self.devices.get("roof_solar_0")
        
        h1_kw = house1_load.power_consumed if house1_load else 2.0
        h2_kw = house2_load.power_consumed if house2_load else 2.0
        s_kw = solar_gen.power_generated if solar_gen else 0.0
        
        # Physics Stress Injections for Pandapower
        if stress_mode == "voltage_surge":
            # Force high rooftop solar injection to trigger over-voltage > 1.048 p.u.
            s_kw = 80.0
        elif stress_mode == "transformer_overload":
            # Force high feeder consumption to overload distribution transformer > 95%
            h1_kw = 190.0
            h2_kw = 190.0
        
        self.feeder_metrics = self.feeder.step(h1_kw, h2_kw, s_kw)
            
    def get_state(self) -> dict:
        total_generation = sum(d.power_generated for d in self.devices.values())
        total_consumption = sum(d.power_consumed for d in self.devices.values())
        net_power = total_generation - total_consumption
        
        # Calculate natural net power (excluding batteries) to prevent AI control loop oscillations
        from .models.storage import BatteryBank
        natural_generation = sum(d.power_generated for d in self.devices.values() if not isinstance(d, BatteryBank))
        natural_consumption = sum(d.power_consumed for d in self.devices.values() if not isinstance(d, BatteryBank))
        natural_net_power = natural_generation - natural_consumption
        
        devices_state = {d_id: d.get_state() for d_id, d in self.devices.items()}
        
        return {
            "total_generation_kw": total_generation,
            "total_consumption_kw": total_consumption,
            "net_power_kw": net_power,
            "natural_net_power_kw": natural_net_power,
            "stress_mode": self.stress_mode,
            "devices": devices_state,
            "feeder_metrics": self.feeder_metrics
        }
