import asyncio
import sys
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Ensure the parent directory is in sys.path so we can import simulation
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .routes import router, EngineHolder
from .websockets import manager
from .database import SessionLocal, TickHistory
from simulation.engine import SimulationEngine
from simulation.grid import CityGrid
from simulation.models import (
    ResidentialLoad, Hospital, IndustrialLoad, AgriculturalLoad, UnseenCityLoad,
    UtilityScaleSolar, RooftopSolar, ThermalPowerPlant, NuclearPowerPlant,
    BatteryBank, EVChargingStation
)

app = FastAPI(title="GridMind Digital Twin API")

# Setup CORS for the frontend later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

def setup_demo_grid() -> CityGrid:
    grid = CityGrid()
    
    # 1. Residential & Agricultural Loads
    for i in range(10): 
        grid.add_device(ResidentialLoad(f"house_{i}", f"Chennai Res {i}", base_load=2.0))
        # Add rooftop solar to some houses
        if i % 3 == 0:
            grid.add_device(RooftopSolar(f"roof_solar_{i}", f"Rooftop {i}"))
            
    grid.add_device(AgriculturalLoad("agri_1", "Cauvery Delta Pumps", pump_capacity_kw=15.0))
    
    # 2. Industrial / Critical Loads
    grid.add_device(Hospital("hosp_1", "Madurai Gen Hospital"))
    grid.add_device(IndustrialLoad("fact_1", "Coimbatore Textile Mill"))
    
    # 3. Generation Projects (Utility Scale)
    # Reduced area to 5,000 sqm so it generates ~1000 kW (1 MW) peak for our small city grid
    grid.add_device(UtilityScaleSolar("solar_1", "Kamuthi Solar Project", area_sqm=5000, efficiency=0.20))
    
    # 4. Storage & EVs
    grid.add_device(BatteryBank("batt_1", "TANGEDCO Grid Battery", capacity_kwh=5000.0, max_c_rate=0.2))
    grid.add_device(EVChargingStation("ev_1", "Tidel Park EV Station"))
    
    return grid

# Background task
async def run_simulation_loop():
    engine = EngineHolder.engine
    db = SessionLocal()
    try:
        while True:
            engine.step()
            state = engine.get_state()
            
            # Log to terminal for presentation
            print(f"[SIMULATION TICK] Time: {state['weather']['time_of_day']:.2f}h | "
                  f"Gen: {state['grid']['total_generation_kw']:.2f}kW | "
                  f"Cons: {state['grid']['total_consumption_kw']:.2f}kW | "
                  f"Net: {state['grid']['net_power_kw']:.2f}kW")
            
            # Broadcast over WebSocket
            await manager.broadcast(state)
            
            # Persist to database
            tick = TickHistory(
                time_of_day=state["weather"]["time_of_day"],
                condition=state["weather"]["condition"],
                total_generation_kw=state["grid"]["total_generation_kw"],
                total_consumption_kw=state["grid"]["total_consumption_kw"],
                net_power_kw=state["grid"]["net_power_kw"]
            )
            db.add(tick)
            db.commit()
            
            await asyncio.sleep(1.0)
    except asyncio.CancelledError:
        pass
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    # Initialize Engine
    grid = setup_demo_grid()
    EngineHolder.engine = SimulationEngine(grid)
    EngineHolder.engine.weather.time_of_day = 5.0 # Start at 5am
    
    # Start async loop
    asyncio.create_task(run_simulation_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
