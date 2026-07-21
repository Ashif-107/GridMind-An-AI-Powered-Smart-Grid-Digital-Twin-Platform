from abc import ABC, abstractmethod

class Device(ABC):
    def __init__(self, device_id: str, name: str):
        self.id = device_id
        self.name = name
        self.is_online = True
        self.power_generated = 0.0 # kW
        self.power_consumed = 0.0 # kW
        
    @abstractmethod
    def step(self, weather_state: dict):
        pass
        
    def get_net_power(self) -> float:
        """Returns net power (positive means adding to grid, negative means drawing from grid)"""
        if not self.is_online:
            return 0.0
        return self.power_generated - self.power_consumed
        
    def get_state(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.__class__.__name__,
            "is_online": self.is_online,
            "power_generated": self.power_generated,
            "power_consumed": self.power_consumed,
            "net_power": self.get_net_power()
        }
