from .base import Device

class BatteryBank(Device):
    def __init__(self, device_id: str, name: str, capacity_kwh: float = 1000.0, max_c_rate: float = 0.5):
        super().__init__(device_id, name)
        self.capacity_kwh = capacity_kwh
        self.soc = 0.5 # State of charge, 0.0 to 1.0 (50% initially)
        self.max_power = capacity_kwh * max_c_rate # Max charge/discharge rate in kW
        self.efficiency = 0.9 # Round trip efficiency, simplifying to symmetric charge/discharge efficiency
        # For Phase 1, we'll manually set a target charge/discharge state. 
        # In Phase 5, the AI will set this.
        self.target_power = 0.0 # Positive = discharge (generate), Negative = charge (consume)
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_generated = 0.0
            self.power_consumed = 0.0
            return
            
        # We need time delta to update SoC. Assuming weather tick is 15 mins (0.25h)
        # Should ideally be passed down, but hardcoded to match weather engine for Phase 1.
        dt_hours = 0.25 
        
        # Limit target power to max power rating
        actual_power = max(-self.max_power, min(self.max_power, self.target_power))
        
        if actual_power > 0: # Discharging (Generating)
            # Check if we have enough energy
            energy_needed = (actual_power * dt_hours) / (self.efficiency ** 0.5)
            if self.soc * self.capacity_kwh >= energy_needed:
                self.power_generated = actual_power
                self.power_consumed = 0.0
                self.soc -= energy_needed / self.capacity_kwh
            else:
                # Can only discharge what's available
                available_energy = self.soc * self.capacity_kwh
                self.power_generated = (available_energy * (self.efficiency ** 0.5)) / dt_hours
                self.power_consumed = 0.0
                self.soc = 0.0
                
        elif actual_power < 0: # Charging (Consuming)
            # actual_power is negative, so let's work with absolute value
            charge_power = abs(actual_power)
            energy_added = (charge_power * dt_hours) * (self.efficiency ** 0.5)
            
            if self.soc * self.capacity_kwh + energy_added <= self.capacity_kwh:
                self.power_generated = 0.0
                self.power_consumed = charge_power
                self.soc += energy_added / self.capacity_kwh
            else:
                # Can only charge until full
                room_left = (1.0 - self.soc) * self.capacity_kwh
                self.power_generated = 0.0
                self.power_consumed = (room_left / (self.efficiency ** 0.5)) / dt_hours
                self.soc = 1.0
                
        else:
            self.power_generated = 0.0
            self.power_consumed = 0.0

    def get_state(self) -> dict:
        state = super().get_state()
        state["soc"] = self.soc
        state["capacity_kwh"] = self.capacity_kwh
        return state

class EVChargingStation(Device):
    def __init__(self, device_id: str, name: str):
        super().__init__(device_id, name)
        # Simplified EV model. In reality, cars arrive and leave.
        # For Phase 1, we just simulate a variable consumer load.
        
    def step(self, weather_state: dict):
        if not self.is_online:
            self.power_consumed = 0.0
            self.power_generated = 0.0
            return
            
        time_of_day = weather_state["time_of_day"]
        # EVs charge primarily in the evening when people get home
        if 18 <= time_of_day <= 24:
            self.power_consumed = 150.0 # 150 kW peak load
        elif 0 <= time_of_day <= 6:
            self.power_consumed = 50.0
        else:
            self.power_consumed = 10.0 # Day time minimal charging
            
        self.power_generated = 0.0
