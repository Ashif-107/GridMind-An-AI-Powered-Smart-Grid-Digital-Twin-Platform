from .base import Device

class UtilityScaleSolar(Device):
    """Utility scale solar project, typically includes step-up transformer to Medium Voltage (e.g., 11kV)."""
    def __init__(self, device_id: str, name: str, area_sqm: float = 10000.0, efficiency: float = 0.20):
        super().__init__(device_id, name)
        self.area_sqm = area_sqm
        self.efficiency = efficiency
        self.voltage_level_kv = 11.0 # Medium voltage
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
            
        irradiance = weather_state["solar_irradiance"]
        power_w = irradiance * self.area_sqm * self.efficiency
        self.power_generated = power_w / 1000.0 # Convert to kW
        self.power_consumed = 0.0

class RooftopSolar(Device):
    """Residential scale rooftop solar, outputs directly at Low Voltage (230V)."""
    def __init__(self, device_id: str, name: str, area_sqm: float = 50.0, efficiency: float = 0.18):
        super().__init__(device_id, name)
        self.area_sqm = area_sqm
        self.efficiency = efficiency
        self.voltage_level_v = 230.0 # Low voltage
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
            
        irradiance = weather_state["solar_irradiance"]
        power_w = irradiance * self.area_sqm * self.efficiency
        self.power_generated = power_w / 1000.0 # Convert to kW
        self.power_consumed = 0.0

class WindFarm(Device):
    def __init__(self, device_id: str, name: str, rated_power: float = 500.0):
        super().__init__(device_id, name)
        self.rated_power = rated_power # kW
        # Simple power curve
        self.cut_in_speed = 3.0 # m/s
        self.rated_speed = 12.0 # m/s
        self.cut_out_speed = 25.0 # m/s
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
            
        # Inspired by vinerya/virtual-power-plant wind turbine power curves
        wind_speed = weather_state["wind_speed"]
        
        if wind_speed < self.cut_in_speed or wind_speed > self.cut_out_speed:
            self.power_generated = 0.0
        elif wind_speed >= self.rated_speed:
            self.power_generated = self.rated_power
        else:
            # Cubic relationship between cut-in and rated speed
            power_fraction = ((wind_speed - self.cut_in_speed) / (self.rated_speed - self.cut_in_speed)) ** 3
            self.power_generated = self.rated_power * power_fraction
            
        self.power_consumed = 0.0

class ThermalPowerPlant(Device):
    """Large baseload power plant (e.g., NLC Thermal)"""
    def __init__(self, device_id: str, name: str, capacity_kw: float = 50000.0):
        super().__init__(device_id, name)
        self.capacity_kw = capacity_kw
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
        
        # Runs constantly at high load
        self.power_generated = self.capacity_kw * 0.85 # 85% plant load factor
        self.power_consumed = 0.0

class NuclearPowerPlant(Device):
    """Steady baseload generation (e.g., Kudankulam)"""
    def __init__(self, device_id: str, name: str, capacity_kw: float = 100000.0):
        super().__init__(device_id, name)
        self.capacity_kw = capacity_kw
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
        
        # Nuclear runs constantly at near full capacity
        self.power_generated = self.capacity_kw * 0.95 
        self.power_consumed = 0.0

class HydroPowerPlant(Device):
    """Small run-of-the-river hydro plant for steady green baseload."""
    def __init__(self, device_id: str, name: str, capacity_kw: float = 200.0):
        super().__init__(device_id, name)
        self.capacity_kw = capacity_kw
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
        
        # Hydro runs constantly at moderate load
        self.power_generated = self.capacity_kw * 0.80 
        self.power_consumed = 0.0
