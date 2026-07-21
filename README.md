# GridMind: AI-Powered Smart Grid Digital Twin Platform

GridMind is a modern, real-time smart grid digital twin platform. It simulates a city's electrical grid, including power consumption (houses, hospitals, factories) and generation (solar farms, wind farms), alongside energy storage (batteries) and EV charging stations. 

The platform consists of a Python-based simulation backend providing real-time data over WebSockets and a modern Next.js frontend for visualization and analytics.

## What we have done so far

### Backend (Python / FastAPI)
- **Simulation Engine**: Built a robust simulation engine modeling various grid entities (House, Hospital, Factory, SolarFarm, WindFarm, BatteryBank, EVChargingStation).
- **Time & Weather**: Simulates time of day, sunrise/sunset, and their effect on solar/wind generation and load curves.
- **REST & WebSocket API**: Built a FastAPI application that exposes a WebSocket endpoint (`/ws`) for broadcasting real-time grid state every simulated second.
- **Data Persistence**: Configured SQLite with SQLAlchemy to store tick history for historical analytics.

### Frontend (Next.js / React / Tailwind CSS)
- **Dashboard Interface**: Built a responsive, modern dashboard using Next.js, React, and Tailwind CSS.
- **Real-time Data Hook**: Implemented a custom `useGridData` hook to manage the WebSocket connection and state synchronization with the backend.
- **Visualization**: Created components (TopBar, Tabs, Analytics) to display power generation vs. consumption, battery status, and weather conditions.

---

## Guide to Run the Project

You will need two terminal windows to run both the backend and frontend simultaneously.

### 1. Running the Backend

The backend is built with Python and FastAPI.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Mac/Linux:
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn api.main:app --reload
   ```
   *The backend will now be running on `http://localhost:8000` with the WebSocket endpoint at `ws://localhost:8000/ws`.*

### 2. Running the Frontend

The frontend is a Next.js application.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be accessible at `http://localhost:3000`.*

### Troubleshooting
- Ensure port `8000` and port `3000` are free before starting.
- If the frontend shows disconnected, ensure the backend is running and there are no CORS issues (handled in `backend/api/main.py`).
