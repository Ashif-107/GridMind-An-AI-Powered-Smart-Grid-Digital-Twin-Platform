from typing import Dict, Any
from .base import GridAgent
from datetime import datetime

class ExplainerAgent(GridAgent):
    """Translates actions into plain English operator logs."""
    
    def __init__(self):
        super().__init__("Explainer")
        self.message_id = 0
        self.tick_count = 0
        
    def step(self, grid_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
            
        validated_action = context.get("validated_action")
        forecast = context.get("forecast", {})
        
        self.tick_count += 1
        
        # We only generate a log if there's an active decision, or occasionally for status
        log_message = None
        level = "INFO"
        
        if validated_action:
            action_type = validated_action.get("type")
            reason = validated_action.get("reason", "")
            
            if action_type == "DISCHARGE_BATTERY":
                requested = validated_action.get("amount_kw", 0)
                actual = validated_action.get("actual_amount_kw", requested)
                log_message = f"Grid balancing required. Requested {requested:.0f}kW, dispatched {actual:.0f}kW from Battery Reserves. Reason: {reason}"
                level = "WARNING"
            elif action_type == "CHARGE_BATTERY":
                requested = validated_action.get("amount_kw", 0)
                actual = validated_action.get("actual_amount_kw", requested)
                log_message = f"Surplus generation detected. Requested {requested:.0f}kW, charging Battery Reserves at {actual:.0f}kW. Reason: {reason}"
                level = "INFO"
            elif "rejected" in reason.lower():
                log_message = reason # Use the validator's rejection string
                level = "ERROR"
            elif action_type == "IDLE" and self.tick_count % 10 == 0:
                log_message = "Grid is balanced and stable. No remediation required."
                level = "INFO"
                
        # If no action, maybe generate a forecast warning
        if not log_message and forecast.get("status") == "DEFICIT_WARNING" and self.tick_count % 5 == 0:
            log_message = f"Forecaster Alert: Grid deficit predicted in upcoming hours (Trend: {forecast.get('trend_kw_per_hour', 0):.0f} kW/hr)."
            level = "WARNING"
            
        if log_message:
            self.message_id += 1
            # In a real app we'd use actual timestamp, here we use sim time if available or just string
            time_str = datetime.now().strftime("%H:%M:%S")
            
            log_entry = {
                "id": self.message_id,
                "timestamp": time_str,
                "level": level,
                "agent": self.name,
                "message": log_message
            }
            
            # Store in context so manager can collect it
            context["new_log"] = log_entry
            
        return context
