from fastapi import APIRouter, HTTPException

class EngineHolder:
    engine = None

router = APIRouter()

@router.get("/api/devices")
async def get_devices():
    if not EngineHolder.engine:
        raise HTTPException(status_code=503, detail="Engine not ready")
    
    # Return list of devices and their current state
    state = EngineHolder.engine.get_state()
    return state["grid"]["devices"]

@router.get("/api/weather")
async def get_weather():
    if not EngineHolder.engine:
        raise HTTPException(status_code=503, detail="Engine not ready")
    
    state = EngineHolder.engine.get_state()
    return state["weather"]

@router.get("/api/scenarios")
async def get_scenarios():
    return [
        "Normal",
        "Sunny Day",
        "Cloudy",
        "Heavy Rain",
        "Storm",
        "Cyclone",
        "Heat Wave",
        "Transformer Failure",
        "Battery Failure",
        "EV Rush Hour",
        "Festival Night"
    ]

@router.post("/api/scenarios/{scenario_name}")
async def trigger_scenario(scenario_name: str):
    if not EngineHolder.engine:
        raise HTTPException(status_code=503, detail="Engine not ready")
        
    supported = await get_scenarios()
    if scenario_name not in supported:
        raise HTTPException(status_code=400, detail="Unknown scenario")
        
    EngineHolder.engine.weather.set_condition(scenario_name)
    return {"status": "success", "scenario_triggered": scenario_name}

@router.post("/api/scenarios/stress/{scenario_id}")
async def trigger_stress_scenario(scenario_id: str):
    if not EngineHolder.engine:
        raise HTTPException(status_code=503, detail="Engine not ready")
        
    valid_modes = ["none", "cloud_drop", "voltage_surge", "transformer_overload", "agri_spike", "cyclone", "ev_rush"]
    if scenario_id not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid stress mode. Choose from {valid_modes}")
        
    EngineHolder.engine.set_stress_mode(scenario_id)
    return {"status": "success", "stress_mode": scenario_id}
