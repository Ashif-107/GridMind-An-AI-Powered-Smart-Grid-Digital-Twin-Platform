from typing import Dict, Any
from .base import GridAgent

class PlanningAgent(GridAgent):
    """Proposes grid remediation actions to balance supply and demand."""
    
    def __init__(self):
        super().__init__("Planner")
        
    def step(self, grid_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
            
        forecast = context.get("forecast", {})
        status = forecast.get("status", "STABLE")
        current_net = forecast.get("current_net", 0.0)
        
        # Calculate Dynamic Pricing (based on Net Power)
        if current_net < 0:
            current_price = 8.0 # Deficit: Price spikes
        elif current_net > 100:
            current_price = 3.0 # Surplus: Price drops
        else:
            current_price = 5.0 # Normal TN rate
            
        context["current_price"] = current_price
        
        last_rejection = context.get("last_rejection")
        proposed_action = None
        
        # Determine base target amount: perfectly match the *predicted* surplus or deficit to fix the 1-tick delay lag!
        predicted_net = forecast.get("predicted_net", current_net)
        target_amt = abs(predicted_net)
            
        # Fallback Logic: if previous attempt in this tick was rejected, try half the amount
        if last_rejection:
            prev_proposed = context.get("proposed_action", {})
            target_amt = prev_proposed.get("amount_kw", target_amt) / 2.0
            
        # Rule-Based Planning Logic - completely trusting Forecaster status
        if status == "DEFICIT_WARNING" and target_amt > 1.0:
            proposed_action = {
                "type": "DISCHARGE_BATTERY",
                "amount_kw": target_amt,
                "reason": "Grid deficit predicted or occurring."
            }
        elif status == "HIGH_SURPLUS" and target_amt > 1.0:
            proposed_action = {
                "type": "CHARGE_BATTERY",
                "amount_kw": target_amt,
                "reason": "Excess renewable generation."
            }
        else:
            proposed_action = {
                "type": "IDLE",
                "reason": "Grid is stable or fallback amount too small." if last_rejection else "Grid is stable."
            }
            
        context["proposed_action"] = proposed_action
        
        return context
