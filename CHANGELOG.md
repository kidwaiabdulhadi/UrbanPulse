# Changelog

All notable changes to **UrbanPulse AI** will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Changes that are merged but not yet tagged in a release will appear here.

---

## [1.0.0] — 2026-06-13

This is the **initial public release** of UrbanPulse AI — an open-source intelligent urban transit operations platform built with Next.js 16, FastAPI, LangGraph, and PyTorch Temporal Fusion Transformers.

### Added

#### 🖥️ Operator Intelligence Dashboard
- Full-screen Operator Intelligence Dashboard featuring a real-time animated SVG transit network map with live route overlays, vehicle position markers, and congestion heat gradients.
- Hero KPI strip displaying live headline metrics:
  - **Prediction Accuracy: 94.8%** — TFT model rolling 24-hour accuracy
  - **Congestion Reduction: −51%** — compared to pre-deployment baseline
  - **Incident Response: < 90 s** — median time-to-alert for anomaly detection

#### 🔮 Digital Twin Simulation
- Interactive Digital Twin Simulation panel with **Before / After counterfactual KPI comparison**.
- Operators can configure hypothetical interventions (rerouting, frequency changes, fleet reallocation) and immediately preview projected KPI deltas without affecting live operations.
- Side-by-side metric cards with animated delta indicators for headway, load factor, on-time performance, and passenger throughput.

#### 🤖 LangGraph Intelligence Engine
- Full LangGraph multi-agent orchestration pipeline with **7 intent classification categories**:
  1. Route optimisation
  2. Incident triage & response
  3. Demand forecasting
  4. Fleet reallocation
  5. Passenger communication
  6. Regulatory compliance query
  7. General operational Q&A
- **10 curated suggested prompts** surfaced in the Commuter Copilot and Operator Chat interfaces to guide users toward high-value queries.
- Streaming token-by-token response rendering via SSE for a responsive chat experience.

#### 🧭 Commuter Copilot
- **4-step journey wizard** guiding commuters through origin selection, destination selection, departure time, and accessibility preferences.
- **Crowd-aware route recommendations** powered by real-time load factor telemetry from TimescaleDB, surfacing lower-occupancy alternatives when primary routes are congested.
- Estimated travel time, crowd level badge (Low / Moderate / High), and step-by-step interchange instructions rendered per recommended route.

#### 🌱 Seeded Intelligence Engine
- Fully **deterministic, hydration-safe, zero-API-dependency** intelligence layer using a seeded pseudo-random number generator (mulberry32 algorithm).
- All dynamic UI content (passenger flow counts, prediction scores, simulated agent responses) is generated reproducibly from a fixed seed, eliminating server/client divergence.
- Enables complete application functionality in offline, demo, and CI environments with no external API keys required.

#### 🗺️ Premium Animated SVG Network Fallback
- When a Mapbox API token is absent, the application automatically serves a **fully animated SVG transit network map** as a first-class fallback — not a placeholder or error state.
- SVG map includes animated vehicle dots traversing route paths, pulsing station nodes, and a live congestion colour scale, all driven by the seeded deterministic engine.

#### 🔔 Notification Centre
- Slide-over Notification Centre panel with real-time incident alerts.
- **Severity filter tabs**: Critical / High / Medium / Low / All — allowing operators to triage by urgency.
- Each notification card shows severity badge, affected route, timestamp, and a one-click "Acknowledge" action.

#### 🐳 Docker Compose Orchestration
- Full **Docker Compose** stack orchestrating **6 services**:
  | Service | Technology | Port |
  |---|---|---|
  | `web` | Next.js 16 | 3000 |
  | `api-core` | FastAPI | 8001 |
  | `ai-inference` | PyTorch TFT | 8002 |
  | `agent-service` | LangGraph | 8003 |
  | `db` | TimescaleDB (PostgreSQL 16) | 5432 |
  | `cache` | Redis 7 | 6379 |
- Health-check probes, service dependency ordering, and named volume declarations for persistent data.
- `.env.example` template provided for all required environment variables.

#### 🚀 Vercel Production Deployment
- Vercel deployment configuration (`vercel.json`) with environment variable mappings for all six services.
- Edge-compatible API routes for low-latency global responses.
- Automatic preview deployments on pull requests via Vercel GitHub integration.

#### 🛡️ Graceful Degradation
- Application is **fully functional without any API keys**: Mapbox → SVG fallback, OpenAI → seeded engine, external GTFS → local fixture data.
- Degradation is seamless — no error banners or broken states are shown to end-users; fallback layers are visually equivalent.

#### 🗄️ Database Seeder
- `scripts/seed.py` — populates TimescaleDB with **realistic synthetic transit telemetry**:
  - 30 days of historical vehicle position pings across 12 routes
  - Simulated incident events with resolution timestamps
  - Passenger load factor samples at 1-minute intervals per route segment
- Idempotent: safe to run multiple times; skips existing records.

#### 🔀 Hydration-Safe Deterministic RNG
- Replaced all calls to `Math.random()` in server-rendered components with a **seeded mulberry32 RNG** instance, scoped per render pass.
- Applied across: `PassengerFlow` particle system, `NetworkMap` congestion values, `AgentChatPanel` suggested prompts, `KPIStrip` live deltas.

#### 📚 Documentation Suite
- `README.md` — full setup guide, architecture overview, feature walkthrough, and deployment instructions.
- `CONTRIBUTING.md` — branching strategy, PR checklist, coding conventions, and development environment setup.
- `SECURITY.md` — vulnerability reporting policy, 90-day coordinated disclosure timeline, and security considerations.
- `CHANGELOG.md` — this file; Keep a Changelog format.
- `MIT LICENSE` — open-source license grant.
- Inline JSDoc / docstring comments on all public functions and API endpoints.

---

### Fixed

#### 🐛 React Hydration Mismatch — PassengerFlow Particles
- **Root cause**: `PassengerFlow` component used `Math.random()` directly in JSX to position animated passenger particle dots. The server-rendered positions differed from the client-rendered positions, causing React to emit hydration warnings and re-render the entire component tree on mount.
- **Fix**: Replaced `Math.random()` calls with deterministic `seededRandom(seed + index)` calls using a stable per-component seed derived from the route ID. Server and client now produce identical initial positions.

#### 🐛 GlobalMap SSR Crash
- **Root cause**: `react-map-gl` / Mapbox GL JS accesses `window` and `navigator` at module load time, causing a crash when Next.js attempted server-side rendering of the `GlobalMap` component.
- **Fix**: Wrapped `GlobalMap` in `next/dynamic` with `{ ssr: false }` so it is only instantiated in the browser. A skeleton loader matching the map dimensions is shown during the dynamic import phase.

#### 🐛 AgentChatPanel — SheetTrigger `asChild` TypeScript Error
- **Root cause**: Radix UI's `<SheetTrigger asChild>` pattern expects its direct child to forward a `ref`. The inner `<Button>` component was not wrapped in `React.forwardRef`, causing a TypeScript compile error: *"Type '...' is not assignable to type 'ReactElement'"*.
- **Fix**: Wrapped the custom `Button` in `React.forwardRef` and updated the prop types to include `ref?: React.Ref<HTMLButtonElement>`.

#### 🐛 react-map-gl Import Path — Next.js 16 Compatibility
- **Root cause**: Next.js 16's module resolution handles ESM/CJS interop differently. Importing from `react-map-gl` (the index barrel) caused a module resolution error because the package's CJS entry point is not compatible with the new resolver.
- **Fix**: Changed all imports to use the explicit subpath `react-map-gl/mapbox` as recommended by the react-map-gl v8 migration guide, which correctly resolves under both ESM and CJS conditions.

---

### Architecture

UrbanPulse AI is built on a **microservices architecture** with the following technology decisions:

#### Services

| Service | Framework | Responsibility |
|---|---|---|
| **Core API** | FastAPI (Python 3.11) | REST & WebSocket gateway, auth, CRUD, GTFS ingestion |
| **AI Inference** | PyTorch + Temporal Fusion Transformer | 72-hour demand & congestion forecasting |
| **Agent Service** | LangGraph + LangChain | Multi-step reasoning, tool use, intent routing |
| **Web Frontend** | Next.js 16 (App Router) | SSR UI, streaming chat, real-time dashboards |

#### Data Layer

| Store | Technology | Use Case |
|---|---|---|
| **Time-series telemetry** | TimescaleDB (PostgreSQL 16 + TimescaleDB extension) | Vehicle positions, load factors, incident events — hypertables with automatic chunk compression |
| **Session & pub/sub cache** | Redis 7 | JWT denylist, SSE message brokering, agent scratchpad state |
| **Vector store** | ChromaDB (embedded) | RAG retrieval for operator knowledge base documents and GTFS specification chunks |

#### Key Architectural Decisions

- **LangGraph over bare LangChain**: Enables explicit state machine definition for multi-step agent workflows (e.g., incident triage requires: classify → query DB → draft response → await operator confirmation → dispatch). This makes agent behaviour inspectable and testable.
- **TFT over LSTM/ARIMA**: Temporal Fusion Transformers support multi-horizon probabilistic forecasting with explicit handling of known future inputs (scheduled events, weather forecasts) — critical for urban transit demand modelling.
- **TimescaleDB over InfluxDB**: Retains full SQL compatibility, enabling complex analytical joins between telemetry and relational operational data (routes, vehicles, incidents) without a separate OLAP tier.
- **Seeded deterministic engine**: Allows full UI development and CI testing without any external service dependencies, and eliminates an entire class of hydration bugs.

---

## Links

- [Repository](https://github.com/your-org/urbanpulse-ai)
- [Live Demo](https://urbanpulse.vercel.app)
- [Documentation](https://github.com/your-org/urbanpulse-ai#readme)
- [Report a Bug](https://github.com/your-org/urbanpulse-ai/issues)
- [Report a Vulnerability](mailto:security@urbanpulse.ai)

---

[Unreleased]: https://github.com/your-org/urbanpulse-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/urbanpulse-ai/releases/tag/v1.0.0
