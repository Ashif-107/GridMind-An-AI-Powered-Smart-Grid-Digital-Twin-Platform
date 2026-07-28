from typing import Dict, Any

class GridAgent:
    """Base class for all AI Grid Agents."""
    
    def __init__(self, name: str):
        self.name = name

    def step(self, grid_state: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executes the agent's logic for the current simulation tick.
        
        Args:
            grid_state: The current state of the grid (generation, consumption, net, devices, physics).
            context: Additional context passed down the agent pipeline (e.g., from forecaster to planner).
            
        Returns:
            A dictionary containing the agent's output (decisions, predictions, logs).
        """
        raise NotImplementedError("Subclasses must implement step()")
