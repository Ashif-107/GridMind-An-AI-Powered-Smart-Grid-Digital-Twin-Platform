from typing import Dict
from .models.base import Device

class CityGrid:
    def __init__(self):
        self.devices: Dict[str, Device] = {}
        
    def add_device(self, device: Device):
        self.devices[device.id] = device
        
    def step(self, weather_state: dict):
        for device in self.devices.values():
            device.step(weather_state)
            
    def get_state(self) -> dict:
        total_generation = sum(d.power_generated for d in self.devices.values())
        total_consumption = sum(d.power_consumed for d in self.devices.values())
        net_power = total_generation - total_consumption
        
        devices_state = {d_id: d.get_state() for d_id, d in self.devices.items()}
        
        return {
            "total_generation_kw": total_generation,
            "total_consumption_kw": total_consumption,
            "net_power_kw": net_power,
            "devices": devices_state
        }
