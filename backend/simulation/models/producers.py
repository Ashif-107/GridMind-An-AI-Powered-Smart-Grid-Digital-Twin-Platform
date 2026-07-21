from .base import Device

class SolarFarm(Device):
    def __init__(self, device_id: str, name: str, area_sqm: float = 1000.0, efficiency: float = 0.20):
        super().__init__(device_id, name)
        self.area_sqm = area_sqm
        self.efficiency = efficiency
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
            
        # Simplified NREL SAM approach: Output = Irradiance * Area * Efficiency
        # Irradiance is in W/m2, we want kW
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
