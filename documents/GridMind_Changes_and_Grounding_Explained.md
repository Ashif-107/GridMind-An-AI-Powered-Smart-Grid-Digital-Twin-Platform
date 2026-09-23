# GridMind — What Changed, How the Agents Work, and How the Project Is Grounded

*A reference document summarizing the shift from the original project structure to the current, faculty-informed version.*

---

## 1. Why We Changed Anything

After demoing through Phase 4, our faculty raised three specific technical challenges instead of accepting the pitch at face value:

1. How does solar energy actually distribute to nearby houses — could one house's panel feed its neighbors directly?
2. Is solar power stepped up or fed directly to households, and does that break our simulation?
3. Is the voltage/current our simulation produces actually accurate?

These weren't rejections of the idea — they were a test of whether we understood the real electrical system underneath our dashboard. The changes below are our direct response to that test, plus two additions (multi-agent AI, real Tamil Nadu grounding) that turn the project from "a nice simulator" into something that can defend itself in a viva.

---

## 2. What Changed From the Original Structure

### 2.1 Device Models — Solar Is No Longer One Generic Type

**Before:** every "solar" node in the simulation behaved the same way, regardless of scale.

**Now:** we distinguish two physically different device types:

| | Solar Farm | Rooftop Solar |
|---|---|---|
| Output | Inverter → step-up transformer | Inverter only |
| Voltage | Steps up to 11–33kV medium voltage before joining the grid | Stays at household voltage (230V/415V), no step-up |
| Role in simulation | A grid-scale generation source | A local, house-level prosumer device |

This directly answers the faculty's question #2 — utility-scale solar *must* step up before touching the grid (its inverter output alone is far too high-current, low-voltage to transmit efficiently or safely mix with medium-voltage lines), while a single house's rooftop system is already at usable voltage and doesn't need one.

### 2.2 Real Numbers Instead of Invented Ones

We replaced made-up figures with real Tamil Nadu grid facts wherever they affect the simulation or the pitch:

- TANGEDCO net metering: exported solar energy is credited against imports, capped at 90% of imports over a 12-month settlement period — not sold directly to a neighbor.
- Real voltage tiers: 230V/415V household, 11kV/33kV distribution, matching what our device models now use.
- TNERC's 2025–26 prosumer regulations, including aggregated net metering for apartment complexes.

This answers question #1 more precisely than before: today, in Tamil Nadu, a house's excess solar is exported to TANGEDCO and credited on the bill — it is not billed directly to a neighbor. Physically, however, that excess power *does* tend to serve the nearest connected load first, simply because of how current flows along a shared low-voltage line — before any surplus travels further up to the transformer. Direct neighbor-to-neighbor billing (peer-to-peer trading) is a real, active regulatory experiment — piloted in Uttar Pradesh under a regulatory sandbox, not yet active in Tamil Nadu.

### 2.3 A Real Power-Flow Engine, Not Just Approximated kW Math

**Before:** the simulation tracked power (kW) and energy (kWh) in and out of devices using our own formulas — no actual voltage/current physics.

**Now:** we integrated **pandapower**, an established open-source Python power-systems tool, to run one real, small distribution feeder:

```
11kV Grid Connection (slack bus)
        │
   Distribution Transformer (11kV → 0.4kV)
        │
   0.4kV LV Feeder Root
       ╱  ╲
 House 1   House 2 (+ Rooftop Solar)
```

This feeder is deliberately small — two houses, one transformer, one rooftop solar connection — but it runs an **actual load-flow solve** every relevant tick, producing real per-unit voltage values (`house1_v_pu`, `house2_v_pu`) and real transformer loading percentage, instead of an approximated number.

This directly answers question #3: we don't claim our whole city-scale simulation computes exact real-world voltage everywhere (that would require a much larger and slower model). Instead, we're explicit that **one representative feeder is physics-accurate via pandapower**, and this feeder is what our AI Validator agent actually checks before approving any action — so the "accuracy" claim is scoped honestly and backed by a real tool, not oversold.

### 2.4 One "AI Optimizer" Became Four Cooperating Agents

**Before:** a single, undifferentiated "AI optimization engine" made all decisions in one block of logic.

**Now:** decision-making is split into four agents with distinct responsibilities, run in a fixed pipeline every simulation tick. Section 3 below explains this in detail.

### 2.5 Repositioning the Pitch

**Before:** GridMind was pitched as a generic AI-powered smart city simulator.

**Now:** we pitch it as a **Tamil Nadu-grounded grid training and decision-support sandbox** — explicitly *not* a claim to control the real TANGEDCO grid, but a safe environment for rehearsing the same kinds of scenarios (transformer failures, rooftop solar surges, EV load growth) that TANGEDCO and researchers actually face, using real TN numbers and a real physics-validated sub-feeder. This framing is honest about scope while still being ambitious.

---

## 3. How the Multi-Agent System Actually Works

### 3.1 Why Four Agents Instead of One Black Box

Real grid control systems don't use a single opaque decision-maker — they separate *predicting*, *proposing*, *safety-checking*, and *reporting*, because each of those needs different guarantees (predictions can be uncertain; proposals should be fast and rule-based for reliability; safety checks must be strict and non-negotiable; explanations need to be human-readable). Our four agents mirror that separation, and this pattern is directly inspired by recent published research on LLM/agent-based power grid control (e.g. planner + validator + rollback architectures), adapted to run on deterministic rule-based logic rather than a live LLM call every tick — which keeps our simulation fast, free, and reliable.

### 3.2 The Pipeline, Step by Step

Every simulation tick, `AgentManager` runs the four agents in a fixed order, passing a shared `context` dictionary forward so each agent can build on the previous one's output:

```
 Grid State (from CityGrid + Weather)
            │
            ▼
 ┌─────────────────────┐
 │ 1. Forecasting Agent │  → predicts near-term net power trend
 └─────────────────────┘
            │  context["forecast"]
            ▼
 ┌─────────────────────┐
 │ 2. Planning Agent     │  → proposes an action (discharge/charge/idle)
 └─────────────────────┘
            │  context["proposed_action"]
            ▼
 ┌─────────────────────┐
 │ 3. Validator Agent    │  → checks the action against pandapower physics
 └─────────────────────┘
            │  context["validated_action"]
            ▼
 ┌─────────────────────┐
 │ 4. Explainer Agent    │  → writes a plain-English operator log
 └─────────────────────┘
            │
            ▼
 AgentManager applies the validated action to the real Battery device,
 logs the result, and returns a UI-ready payload (forecast, latest
 action, recent logs).
```

**1. Forecasting Agent** — Keeps a short rolling history of net power (generation minus consumption) and calculates a simple linear trend across the last few ticks. It predicts where net power is heading a few ticks ahead and labels the grid's near-term status as `STABLE`, `DEFICIT_WARNING`, or `HIGH_SURPLUS`. This mirrors how real short-term SCADA load forecasting works — trend-based, not a black-box model — which keeps it fast, explainable, and cheap to run every tick.

**2. Planning Agent** — Reads the Forecaster's status and the current net power, then applies deterministic rules: if there's a deficit, propose discharging the battery by roughly the deficit amount plus a safety buffer; if there's a big surplus, propose charging the battery; otherwise, propose staying idle. This is intentionally simple and rule-based rather than a machine-learned optimizer, because real grid balancing responses need to be fast and predictable, not exploratory.

**3. Validator Agent** — The safety gate, and the piece that gives the whole system engineering credibility. It takes the Planner's proposed action and checks it against **real physics numbers pulled from the pandapower feeder**: current per-unit voltage at each house and the transformer's loading percentage. If discharging the battery would push local voltage above a safe limit (over-voltage, often caused by high rooftop solar output pushing power back up the line), or if charging would overload the transformer, the Validator **rejects the action** and substitutes a safe `IDLE` action with a plain-language rejection reason. Nothing reaches the grid without passing this check.

**4. Explainer Agent** — Converts whatever action actually got validated (approved or rejected) into a human-readable operator log line — e.g. *"Grid balancing required. Dispatching 3,200kW from Battery Reserves"* or a rejection message straight from the Validator. These logs are what populate the AI Command Center tab on the dashboard, giving a visible, readable trail of what the AI decided and why.

**Execution step (inside `AgentManager`)** — After the pipeline runs, `AgentManager` takes the final validated action and applies it directly to the actual battery device in the simulation (setting its power generated/consumed), so the decision has a real, visible effect on the next tick's grid state — closing the loop from "the AI decided something" to "the simulated city actually changed."

### 3.3 What We're Actively Improving (Being Transparent About It)

We're not presenting this as a finished, flawless system — a few refinements are in progress, and we can speak to them directly if asked:

- **Physical Battery Clamping is DONE:** You can tell the faculty, "Our Battery models enforce strict thermodynamic and state-of-charge limits. The AI cannot command 40,000kW from an empty battery; the Battery component intercepts the AI's command, calculates how much energy it actually has, and clamps the output to its physical limits."
- **The Rejection Fallback Ladder is DONE:** You can tell them, "If the Validator rejects an action (e.g., due to an over-voltage limit), the AI doesn't just give up. The AgentManager loops the rejection back to the Planner, triggering a Fallback Plan (like reducing the dispatch amount by 50%), and retries the validation up to 3 times in a single tick."

Naming these openly is itself part of the credibility strategy — it shows we understand the difference between "the demo works" and "the system is complete," which is exactly the distinction our faculty was probing for.

---

## 4. How the Project Is Grounded in Reality

This is the part that answers "why should anyone take this seriously beyond a college demo":

- **Real regulatory grounding:** our net-metering, tariff, and voltage assumptions come from actual TANGEDCO and TNERC rules, not invented numbers.
- **Real precedent for the "AI agents" idea:** multi-agent, LLM-assisted grid control is an active published research direction — including work literally named *Grid-Agent* and *GridMind*, using a planner/validator architecture strikingly similar to ours, aimed at automating grid violation detection and remediation with a safety-validated action loop.
- **Real precedent for peer-to-peer solar sharing:** piloted in Uttar Pradesh under a regulatory sandbox with the India Smart Grid Forum and Powerledger — proving the concept is being taken seriously by real Indian utilities and regulators, even though it isn't yet active in Tamil Nadu.
- **Real precedent for the "digital twin" framing itself:** India's National Smart Grid Mission has funded a dozen demonstration pilots and is actively exploring digital twins as real-time virtual replicas of physical grid infrastructure — meaning our project's core concept mirrors a direction the country's own grid modernization program is already pursuing, just at a much smaller, student-project scale.
- **Real physics validation, not just claims:** the pandapower-based feeder means at least one part of our simulation produces numbers that would hold up if an actual power-systems engineer checked them — because they come from the same open-source load-flow solver used in real research and utility studies.

**The one-line version for a faculty or judge:** *"We didn't just add AI on top of a generic city simulator — we grounded the device models, the numbers, and the safety logic in how the Tamil Nadu grid actually works, and we validate our own AI's decisions against a real power-flow engine before they're allowed to happen."*
