from typing import Dict
from .models.base import Device
from .pandapower_feeder import PandapowerFeeder

class CityGrid:
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        self.feeder = PandapowerFeeder()
        self.feeder_metrics = None
        
    def add_device(self, device: Device):
        self.devices[device.id] = device
        
    def step(self, weather_state: dict):
        for device in self.devices.values():
            device.step(weather_state)
            
        # Run pandapower load-flow for the sandbox feeder using some sample loads
        # Here we just take the first two houses and one rooftop solar for the demo
        house1_load = self.devices.get("house_0")
        house2_load = self.devices.get("house_1")
        solar_gen = self.devices.get("roof_solar_0")
        
        h1_kw = house1_load.power_consumed if house1_load else 2.0
        h2_kw = house2_load.power_consumed if house2_load else 2.0
        s_kw = solar_gen.power_generated if solar_gen else 0.0
        
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
            "devices": devices_state,
            "feeder_metrics": self.feeder_metrics
        }
