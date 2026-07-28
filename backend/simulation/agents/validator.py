from typing import Dict, Any
from .base import GridAgent

class ValidatorAgent(GridAgent):
    """Validates proposed actions against physical grid constraints."""
    
    def __init__(self):
        super().__init__("Validator")
        
    def step(self, grid_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
            
        proposed_action = context.get("proposed_action")
        
        if not proposed_action or proposed_action["type"] == "IDLE":
            context["validated_action"] = proposed_action
            return context
            
        # Get latest physics metrics from pandapower
        feeder_metrics = grid_state.get("feeder_metrics")
        
        is_valid = True
        reject_reason = ""
        
        if feeder_metrics:
            v_house1 = feeder_metrics.get("house1_v_pu", 1.0)
            v_house2 = feeder_metrics.get("house2_v_pu", 1.0)
            trafo_load = feeder_metrics.get("trafo_loading_percent", 0.0)
            
            # Constraint 1: Transformer Overload
            # Only checked against CHARGE_BATTERY because battery is grid-side; discharge doesn't load this local transformer.
            if trafo_load > 95.0 and proposed_action["type"] == "CHARGE_BATTERY":
                is_valid = False
                reject_reason = f"Action rejected: Charging battery would overload distribution transformer (currently at {trafo_load:.1f}%)."
                
            # Constraint 2: Voltage Limits (0.95 p.u. to 1.05 p.u. is typical limit)
            elif v_house1 > 1.045 or v_house2 > 1.045:
                # Local voltage is already dangerously high (likely due to rooftop solar)
                # We shouldn't discharge battery into the grid if voltage is already high
                if proposed_action["type"] == "DISCHARGE_BATTERY":
                    is_valid = False
                    reject_reason = "Action rejected: Discharging battery would cause over-voltage limit violation (>1.05 p.u.)."
                    
            elif v_house1 < 0.955 or v_house2 < 0.955:
                # Local voltage is already dangerously low
                if proposed_action["type"] == "CHARGE_BATTERY":
                    is_valid = False
                    reject_reason = "Action rejected: Charging battery would cause under-voltage limit violation (<0.95 p.u.)."
                    
        if is_valid:
            context["validated_action"] = proposed_action
        else:
            context["validated_action"] = {
                "type": "IDLE",
                "reason": reject_reason
            }
            
        return context
