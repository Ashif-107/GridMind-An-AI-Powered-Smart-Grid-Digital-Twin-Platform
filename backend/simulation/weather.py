import math

class WeatherEngine:
    def __init__(self):
        # We start at midnight (hour 0)
        self.time_of_day = 0.0
        self.tick_resolution_hours = 0.25 # 15 mins per tick
        self.condition = "Normal"
        
        self.solar_irradiance = 0.0 # W/m2
        self.wind_speed = 5.0 # m/s
        self.temperature = 25.0 # C
        
    def step(self):
        # Advance time
        self.time_of_day = (self.time_of_day + self.tick_resolution_hours) % 24
        
        if self.condition == "Normal":
            # Simulate solar irradiance based on time of day (bell curve peaking at noon)
            if 6 <= self.time_of_day <= 18:
                # Peak at noon (12), max ~1000 W/m2
                self.solar_irradiance = 1000 * math.sin(math.pi * (self.time_of_day - 6) / 12)
            else:
                self.solar_irradiance = 0.0
                
            # Simulate wind (random fluctuation around a baseline)
            # Keeping it simple for Phase 1: simple sine wave over the day to give it some movement
            self.wind_speed = 5.0 + 2.0 * math.sin(math.pi * self.time_of_day / 6)
            self.temperature = 20.0 + 10.0 * math.sin(math.pi * (self.time_of_day - 6) / 12)
            
        elif self.condition == "Cyclone":
            self.solar_irradiance = 0.0 # Cloud cover
            self.wind_speed = 35.0 # High wind
            self.temperature = 18.0
            
        elif self.condition == "Heat Wave":
            if 6 <= self.time_of_day <= 18:
                self.solar_irradiance = 1000 * math.sin(math.pi * (self.time_of_day - 6) / 12)
            else:
                self.solar_irradiance = 0.0
            self.wind_speed = 2.0
            self.temperature = 40.0
            
    def set_condition(self, condition):
        self.condition = condition
        
    def get_state(self):
        return {
            "time_of_day": self.time_of_day,
            "condition": self.condition,
            "solar_irradiance": self.solar_irradiance,
            "wind_speed": self.wind_speed,
            "temperature": self.temperature
        }
