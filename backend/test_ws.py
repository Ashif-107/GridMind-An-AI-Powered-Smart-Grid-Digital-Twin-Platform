import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Listening for live grid data...\n")
            for _ in range(5): # We'll just listen for 5 ticks
                message = await websocket.recv()
                data = json.loads(message)
                
                weather = data["weather"]
                grid = data["grid"]
                
                hours = int(weather["time_of_day"])
                minutes = int((weather["time_of_day"] - hours) * 60)
                
                print(f"--- TICK ---")
                print(f"Time: {hours:02d}:{minutes:02d} | Condition: {weather['condition']}")
                print(f"Net Power: {grid['net_power_kw']:.1f} kW")
                
            print("\nSuccessfully received 5 live ticks via WebSocket! Test passed.")
    except ConnectionRefusedError:
        print("Could not connect. Is the FastAPI server running?")

if __name__ == "__main__":
    asyncio.run(test_websocket())
