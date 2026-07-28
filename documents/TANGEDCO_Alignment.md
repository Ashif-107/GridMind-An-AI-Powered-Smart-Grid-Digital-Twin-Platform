# GridMind: TANGEDCO-Aligned Smart Grid Digital Twin
## Faculty Alignment & Architecture Document

This document outlines how the GridMind project aligns with real-world Tamil Nadu (TANGEDCO) grid operations and addresses critical electrical engineering and power systems concepts. It is designed to demonstrate that GridMind is not a generic dashboard, but a physics-grounded, AI-driven decision-support sandbox.

---

### 1. Real-World Alignment: TANGEDCO & TN Grid

GridMind acts as a **Decision-Support and Training Sandbox** that mirrors the actual operational realities of the Tamil Nadu grid.

*   **Not a Literal Controller, but a Digital Twin:** We do not claim to directly control the live TANGEDCO grid. Instead, we are building a virtual replica—a "Digital Twin." This aligns perfectly with the **National Smart Grid Mission's (NSGM)** ongoing pilot projects, which fund digital twins to let operators rehearse scenarios safely without touching live infrastructure.
*   **Regulatory & Tariff Grounding:** The simulation honors Tamil Nadu's specific commercial realities:
    *   **Net Metering:** Implementing the standard TN model where rooftop solar exports are credited against consumption on the bill, rather than direct peer-to-peer selling (which is still experimental).
    *   **Agricultural Free Power:** Modeling the massive agricultural load specific to TN, reflecting the actual state subsidy schemes.

---

### 2. Addressing Grid Physics (Faculty Questions)

We have explicitly modeled the electrical behavior of different grid assets to reflect reality:

*   **Utility-Scale vs. Rooftop Solar:**
    *   *Utility Solar (e.g., Kamuthi):* Modeled with an inverter and a **Step-Up Transformer** that raises the voltage to Medium Voltage (11kV/33kV) for transmission across the grid.
    *   *Rooftop Solar:* Output from the inverter is at Low Voltage (230V) and connects directly to the household meter.
*   **Physics of Distribution:** When a house generates excess solar, the current flows along the shared Low Voltage distribution feeder. Following basic circuit physics (path of least resistance), it is naturally consumed by the nearest demanding house on that transformer before spilling further up the grid.
*   **Accurate Voltage/Current via `pandapower`:** To ensure our simulation isn't just basic arithmetic, we are integrating **`pandapower`** (a standard open-source power systems solver). While high-level aggregation runs via standard simulation, specific distribution feeders are solved using `pandapower` to yield accurate AC per-unit voltage, current, and line losses.

---

### 3. System Architecture Diagram

This block diagram illustrates how the Backend Simulation, Pandapower physics solver, and the Frontend Dashboard interact.

```mermaid
block-beta
  columns 3
  
  space block:Frontend:1
    Dashboard["Next.js Operator Dashboard"]
    Graphs["Real-time Analytics & Viz"]
    Dashboard --> Graphs
  end space
  
  space down<["WebSocket (Real-time State)"]>(down) space
  
  block:BackendCore:3
    columns 3
    Weather["Weather Engine (TN Climate)"] 
    GridCore["CityGrid State Manager"]
    DB["SQLite Tick History"]
    
    Weather --> GridCore
    GridCore --> DB
  end
  
  space down<["Sub-Grid Physics Validation"]>(down) space

  block:PhysicsEngine:3
    columns 4
    Panda["Pandapower Solver"]
    UtilSolar["Utility Solar (11kV)"]
    RoofSolar["Rooftop Solar (230V)"]
    Trans["Distribution Transformer"]
    
    UtilSolar --> Panda
    RoofSolar --> Panda
    Trans --> Panda
  end
```

---

### 4. AI Multi-Agent Architecture

To manage grid complexity, GridMind utilizes a state-of-the-art **Multi-Agent System**, inspired by recent power-systems AI research (like the *Grid-Agent* and *GridMind LLM* papers). Instead of a "black box" AI, we use a plan-then-validate approach.

#### Agent Flow Diagram

```mermaid
sequenceDiagram
    participant Weather as Weather Data
    participant Forecaster as Forecasting Agent
    participant Planner as Optimization Agent
    participant Validator as Validator Agent (Pandapower)
    participant Grid as Live Grid State
    participant Dashboard as Explainer Agent (UI)

    Weather->>Forecaster: Incoming cloud cover data
    Forecaster->>Planner: Predicts 30% drop in Solar Generation in 10 mins
    Planner->>Validator: Proposes plan: "Discharge Battery Bank A at 500kW"
    
    Note over Validator: Runs AC Load-Flow Sandbox<br/>Checks for Voltage Sag/Thermal Limits
    
    alt Plan is Safe
        Validator->>Grid: Executes Battery Discharge
        Validator->>Dashboard: Success: Actions sent to UI
    else Plan Causes Violation
        Validator-->>Planner: Reject: Causes voltage limit violation on Feeder 2
        Planner->>Validator: Proposes revised plan...
    end
```

#### Roles of the Agents:
1.  **Forecasting Agent:** Anticipates shifts in generation (wind/solar drops) or demand peaks.
2.  **Optimization Agent:** Proposes remediation actions (e.g., dispatching storage, shedding non-critical load).
3.  **Validator Agent:** The safety net. It runs the proposed action through the `pandapower` sandbox to guarantee physical safety (no voltage violations) before execution.
4.  **Explainer Agent:** Translates these automated decisions into plain English for the human operator viewing the dashboard.
