from typing import Dict, Any, List
from .agents import ForecastingAgent, PlanningAgent, ValidatorAgent, ExplainerAgent

class AgentManager:
    """Orchestrates the Multi-Agent Pipeline."""
    
    def __init__(self):
        self.forecaster = ForecastingAgent()
        self.planner = PlanningAgent()
        self.validator = ValidatorAgent()
        self.explainer = ExplainerAgent()
        
        self.agent_logs: List[Dict[str, Any]] = []
        
    def step(self, grid_state: Dict[str, Any], grid_controller: Any) -> Dict[str, Any]:
        """
        Runs the full AI pipeline for one tick.
        
        Args:
            grid_state: The current state of the city grid.
            grid_controller: The CityGrid instance, allowing the manager to apply validated physical actions.
        """
        # Pipeline Context - passed sequentially through the agents
        context = {}
        
        # 1. Forecasting Agent predicts short-term trends
        context = self.forecaster.step(grid_state, context)
        
        # 2. Planning Agent proposes action
        # 3. Validator Agent checks physics
        # We implement a retry ladder: if Validator rejects, Planner tries again (up to 3 times)
        max_retries = 3
        for attempt in range(max_retries):
            context = self.planner.step(grid_state, context)
            context = self.validator.step(grid_state, context)
            
            validated_action = context.get("validated_action")
            if validated_action and "rejected" not in validated_action.get("reason", "").lower():
                # Action was accepted or is IDLE
                break
            else:
                # Tell Planner it was rejected so it can try a fallback next loop
                context["last_rejection"] = validated_action.get("reason")
        
        # Apply the validated action to the actual grid
        # Phase 3 scope: single dispatchable battery; multi-battery allocation is future work
        validated_action = context.get("validated_action")
        if validated_action:
            from .models.storage import BatteryBank
            batteries = [d for d in grid_controller.devices.values() if isinstance(d, BatteryBank)]
            if batteries:
                central_battery = batteries[0] 
                action_type = validated_action.get("type", "IDLE")
                amt = validated_action.get("amount_kw", 0)
                
                # Command battery and get actual clamped amount
                actual_amt = central_battery.command(action_type, amt)
                
                # If battery is physically incapable of dispatching (0 kW actual), override action to IDLE with clear rejection
                if action_type != "IDLE" and actual_amt <= 0.001:
                    soc_percent = central_battery.soc * 100.0
                    validated_action["type"] = "IDLE"
                    validated_action["reason"] = f"Action rejected: Battery physical capacity depleted ({soc_percent:.1f}% SoC)."
                    actual_amt = 0.0
                
                # Pass actual amount back into context so explainer (or next tick) knows
                validated_action["actual_amount_kw"] = actual_amt
                context["validated_action"] = validated_action
                
        # 4. Explainer Agent generates logs (MUST run after battery command so it sees actual_amount_kw)
        context = self.explainer.step(grid_state, context)
                    
        # Collect any new logs
        new_log = context.get("new_log")
        if new_log:
            self.agent_logs.append(new_log)
            # Keep log buffer manageable (e.g. last 50 messages)
            if len(self.agent_logs) > 50:
                self.agent_logs.pop(0)
                
        return {
            "forecast": context.get("forecast"),
            "latest_action": validated_action,
            "logs": self.agent_logs[-5:] # Return only recent logs for the UI payload
        }
