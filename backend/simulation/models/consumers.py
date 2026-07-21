from .base import Device
import math

class House(Device):
    def __init__(self, device_id: str, name: str, base_load: float = 1.0):
        super().__init__(device_id, name)
        self.base_load = base_load # kW
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_consumed = 0.0
            self.power_generated = 0.0
            return
            
        time_of_day = weather_state["time_of_day"]
        # Simple residential profile: peaks in morning (7-9) and evening (18-21)
        # Inspired by typical IEEE residential load profiles
        morning_peak = 0.0
        if 6 <= time_of_day <= 10:
            morning_peak = 1.5 * math.sin(math.pi * (time_of_day - 6) / 4)
            
        evening_peak = 0.0
        if 17 <= time_of_day <= 22:
            evening_peak = 2.5 * math.sin(math.pi * (time_of_day - 17) / 5)
            
        # Add cooling load during heat wave
        cooling_load = 0.0
        if weather_state["temperature"] > 30:
            cooling_load = (weather_state["temperature"] - 30) * 0.5
            
        self.power_consumed = self.base_load + morning_peak + evening_peak + cooling_load
        self.power_generated = 0.0

class Hospital(Device):
    def __init__(self, device_id: str, name: str):
        super().__init__(device_id, name)
        self.priority = "CRITICAL"
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_consumed = 0.0
            self.power_generated = 0.0
            return
        # Hospitals have a fairly constant, high base load
        self.power_consumed = 50.0 # 50 kW
        self.power_generated = 0.0

class Factory(Device):
    def __init__(self, device_id: str, name: str):
        super().__init__(device_id, name)
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_consumed = 0.0
            self.power_generated = 0.0
            return
        
        time_of_day = weather_state["time_of_day"]
        # Factory runs 8 AM to 6 PM
        if 8 <= time_of_day <= 18:
            self.power_consumed = 200.0 # 200 kW during shift
        else:
            self.power_consumed = 20.0 # Background load
        self.power_generated = 0.0
