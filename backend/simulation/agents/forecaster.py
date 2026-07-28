from typing import Dict, Any
from .base import GridAgent

class ForecastingAgent(GridAgent):
    """Predicts upcoming load and generation."""
    
    def __init__(self):
        super().__init__("Forecaster")
        # Store a tiny history to calculate simple trend
        self.history_net = []
        
    def step(self, grid_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
            
        # Use natural_net_power_kw so the AI doesn't get confused by the battery's own output!
        net_power = grid_state.get("natural_net_power_kw", grid_state.get("net_power_kw", 0.0))
        self.history_net.append(net_power)
        if len(self.history_net) > 4: # keep last 4 ticks (representing 1 hour of trend in our fast simulation)
            self.history_net.pop(0)
            
        # Basic statistical forecast: Calculate the trend rate of change
        trend = 0
        if len(self.history_net) == 4:
            trend = self.history_net[-1] - self.history_net[0]
            
        # Predict net power 4 ticks from now based on linear trend
        predicted_net = net_power + trend
        
        # Determine status
        if predicted_net < -50:
            status = "DEFICIT_WARNING"
        elif predicted_net > 100:
            status = "HIGH_SURPLUS"
        else:
            status = "STABLE"
            
        context["forecast"] = {
            "current_net": net_power,
            "predicted_net": predicted_net,
            "trend_kw_per_hour": trend,
            "status": status
        }
        
        return context
