# GridMind: AI-Powered Smart Grid Digital Twin Platform
## Unified Presentation Outline

---

### Slide 1: Guide-Signed Approval Page
- **Project Title:** GridMind: AI-Powered Virtual Power Plant & Smart Grid Digital Twin
- **Team Members:** [Names]
- **Guide Name & Designation:** [Guide Name], [Designation]
- **Department / Institution:** [Department], [College Name]
- **Academic Year / Date:** [Year]
*(Placeholder for scanned certificate)*

---

### Slide 2: Introduction
**Title: A Digital Twin for the Smart Grid**
- **What is GridMind?** An AI-powered Smart Grid Digital Twin platform that simulates an entire virtual city—houses, solar farms, wind farms, battery banks, EV charging stations, and hospitals—while an AI engine balances generation, demand, and storage in real time.
- **The Core Approach:** Rather than building an expensive real grid, we create a virtual smart city where AI monitors and optimizes energy flow live—visualized on an interactive dashboard and mirrored on a small physical hardware prototype.
- **Core Modules:**
  1. **Digital Twin Simulation Engine:** Real-time modeling of diverse loads and generation.
  2. **AI Grid Orchestration Engine:** Multi-agent system that decides battery use, prioritizes load, and explains actions.
  3. **Real-Time Interactive Dashboard:** Live city map, power flow, and scenario controls.
- **Highlight (Grounded, not generic):** Device models, voltage tiers (230V LV / 11kV MV), and tariff rules are based on real TANGEDCO / TNERC regulations—not invented numbers.

---

### Slide 3: Problem Statement
**Title: Grids Are Outgrowing Centralized Control**
- **The Core Issue:** Renewable energy is unpredictable, and modern grids are shifting from large power plants to decentralized resources, while demand changes minute-to-minute and the grid must stay stable 24/7.
- **Key Challenges:**
  - Solar & wind generation vary constantly with weather.
  - Electricity demand changes dynamically.
  - Batteries, EVs, and smart homes must be coordinated in real time.
  - The grid must remain physically stable (no voltage sags/overloads) around the clock.
- **Real-World Grounding Fact:** We anchor our simulation and pricing logic on the real **₹8 / unit** TANGEDCO domestic energy charge.
- **The Gap We Address:** There is no accessible, explainable platform for simulating and rehearsing how a Tamil Nadu-scale distribution grid behaves under stress. Utilities need physics-backed decision-support and training tools, not just generic dashboards.

---

### Slide 4: Objectives
**Title: What We Set Out to Build**
- **Build a Digital Twin Engine:** Simulate houses, utility-scale vs. rooftop solar, wind farms, batteries, EVs, and hospitals.
- **Develop an Explainable AI:** Build a multi-agent system that forecasts, plans, validates, and reports grid decisions.
- **Physics Validation:** Validate AI decisions against real electrical physics using an open-source power-flow solver (`pandapower`).
- **TANGEDCO Alignment:** Ground every device model, tariff, and voltage assumption in real TANGEDCO / TNERC rules.
- **Real-Time Dashboard:** Deliver an interactive UI with live mapping, real-time power-flow tracking, and scenario controls.
- **Hardware Integration:** Synchronize the digital twin with a physical ESP32 hardware prototype.

---

### Slide 5: Proposed Methodology
**Title: A Physics-Validated Multi-Agent Pipeline**
- **Pipeline:** Every simulation tick runs through four cooperating AI agents before any action reaches the grid:
  1. **Forecaster:** Predicts near-term net power trends from time-of-day and weather.
  2. **Planner:** Proposes a deterministic, rule-based action (discharge, charge, or idle).
  3. **Validator:** Checks the action against real `pandapower` voltage & transformer limits. Rejects unsafe actions.
  4. **Explainer:** Converts the outcome into a plain-English operator log.
- **Build Approach:** Incremental phases starting from the Simulation Engine → Backend Server → Dashboard → AI Agents + Physics → Scenarios → Hardware Prototype.
- **Open-Source Strategy:** We study established open-source tools (e.g., `pandapower`, `virtual-power-plant`) for realistic device physics, ensuring GridMind is built on legitimate power-systems engineering.

---

### Slide 6: Expected Outcomes
**Title: What the Finished Prototype Demonstrates**
- **Key Metrics:**
  - **4** Cooperating AI Agents
  - **15+** Interactive grid scenarios
  - **1** Physics-validated feeder (`pandapower` load-flow)
  - **100%** TN-grounded tariff & voltage assumptions
- **Demonstrations:**
  - A real-time simulated smart grid where utility-scale solar (11kV) and rooftop solar (230V) act physically distinct.
  - AI decisions logged in plain English, with a visible approve/reject trail through the Validator agent.
  - A safety layer that rejects unsafe actions using real per-unit voltage checks, not approximations.
  - A one-click scenario demo (storms, failures, spikes) synchronized with a physical hardware prototype.
- **Positioning:** A training and decision-support sandbox aligned with India's NSGM digital-twin pilots—not a claim to control the live TANGEDCO grid.

---

### Slide 7: Tools & Technologies
**Title: Our Technology Stack**
- **Frontend:** Next.js, Tailwind CSS, TypeScript, Recharts, HTML5 Canvas
- **Backend:** FastAPI, REST API, WebSocket Server
- **Simulation Engine:** Python (OOP-based event engine)
- **Database:** SQLite (development/tick history)
- **AI / Agents:** Custom rule-based multi-agent pipeline; Scikit-learn / Prophet for forecasting
- **Physics Validation:** `pandapower` (open-source Python power-flow solver)
- **Hardware Integration:** ESP32, WebSockets / MQTT
- **Deployment & Versioning:** Docker, GitHub

---

### Slide 8: Project Timeline
**Title: Nine Incremental Build Phases**
- **Phase 1-4 (Completed):** Simulation Engine → Backend Server → Dashboard Core → 2D City Map
- **Phase 5 (In Progress):** AI Optimizer + Explainability (Multi-Agent System & pandapower integration)
- **Phase 6-9 (Planned):** Scenarios & Forecasting → Timeline Replay & Training → Hardware (ESP32) → Polish & Present

---

### Slide 9: References
**Title: Sources Grounding This Project**
1. **pandapower:** Thurner, L., et al. "pandapower — An Open-Source Python Tool for Convenient Modeling..." IEEE Transactions on Power Systems (2018).
2. **TNERC Regulations:** Grid Interactive PV Solar Energy Generating System (GISS) Regulations, 2021 (governs TN net metering).
3. **NSGM:** National Smart Grid Mission, Government of India. Guidelines on smart grid digital-twin pilots.
4. **AI Power Control:** "Grid-Agent: An LLM-Powered Multi-Agent System for Power Grid Control" (arXiv, 2025) – references our planner + validator architecture.
5. **Regulatory Sandboxes:** ISGF & Powerledger Peer-to-Peer Solar Energy Trading Pilot in Uttar Pradesh.
6. **VPP Modeling:** Chelbi, M. & Khemir, M. `virtual-power-plant` Python library on GitHub.
