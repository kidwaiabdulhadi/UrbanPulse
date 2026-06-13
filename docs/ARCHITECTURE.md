# UrbanPulse AI — System Architecture

A detailed technical breakdown of UrbanPulse AI's microservices architecture, data flows, and engineering decisions.

---

## Table of Contents

- [System Overview](#system-overview)
- [Service Architecture](#service-architecture)
- [Data Flow](#data-flow)
- [Frontend Architecture](#frontend-architecture)
- [In-Browser Intelligence Engine](#in-browser-intelligence-engine)
- [Database Design](#database-design)
- [Engineering Decision Records](#engineering-decision-records)

---

## System Overview

UrbanPulse AI is composed of six independent services coordinated by Docker Compose. Each service has a single, clear responsibility:

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│   Next.js 16 · TypeScript · Framer Motion · ShadCN/UI        │
│   Seeded Intelligence Engine (in-browser fallback)           │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / WebSocket
          ┌─────────────────┼─────────────────────┐
          │                 │                     │
    ┌─────▼──────┐   ┌──────▼──────┐   ┌──────────▼───────┐
    │  Core API  │   │ AI Inference│   │  Agent Service   │
    │  FastAPI   │   │ FastAPI     │   │  LangGraph       │
    │  Port 8000 │   │ PyTorch TFT │   │  ChromaDB RAG    │
    │  Auth, WS  │   │ SHAP        │   │  Port 8003       │
    └─────┬──────┘   └──────┬──────┘   └──────────┬───────┘
          │                 │                      │
    ┌─────▼─────────────────▼──────────────────────▼───────┐
    │              PostgreSQL + TimescaleDB                 │
    │      Time-series telemetry · Station data · Auth      │
    └───────────────────────────────────────────────────────┘
          │
    ┌─────▼──────────────────────────────────────────────────┐
    │   Redis (Message Broker · Session Cache · Rate Limits) │
    └────────────────────────────────────────────────────────┘
```

---

## Service Architecture

### Core API (`services/core-api`) — Port 8000

**Technology**: FastAPI, Python 3.11, SQLAlchemy, python-jose (JWT)

**Responsibilities:**
- JWT authentication (issue/validate tokens)
- Station CRUD operations (`/api/v1/stations`)
- Real-time WebSocket server for live telemetry push
- Orchestrates reads from TimescaleDB
- Rate limiting via Redis

**Key Endpoints:**
```
POST   /api/v1/auth/token          — Login, returns JWT
GET    /api/v1/stations            — All stations with current occupancy
GET    /api/v1/stations/{id}       — Single station detail
GET    /api/v1/stations/{id}/history — Time-series occupancy history
WS     /ws/telemetry               — Real-time occupancy stream
```

---

### AI Inference Service (`services/ai-inference`) — Port 8002

**Technology**: FastAPI, Python 3.11, PyTorch, SHAP, NumPy

**Responsibilities:**
- Temporal Fusion Transformer (TFT) crowd forecasting
- SHAP value computation for explainability
- Counterfactual scenario simulation (Digital Twin maths)
- Returns forecast with confidence intervals

**Key Endpoints:**
```
POST   /api/v1/forecast            — 30-minute crowd forecast for a station
POST   /api/v1/simulate            — Counterfactual: baseline vs intervention
GET    /api/v1/forecast/{id}/shap  — SHAP feature attribution for last forecast
```

**Forecasting Model:**
The TFT architecture captures:
- Multi-horizon time-series patterns (occupancy over rolling 2-hour windows)
- Known future inputs (scheduled services, events)
- Static covariates (station capacity, line type, zone)
- Temporal self-attention for long-range dependency modelling

---

### Agent Service (`services/agent-service`) — Port 8003

**Technology**: FastAPI, LangGraph, LangChain, ChromaDB, OpenAI (optional)

**Responsibilities:**
- LangGraph state machine orchestration
- ChromaDB vector retrieval of transit policy documents
- Intent classification across 7 query categories
- Context assembly from live telemetry

**LangGraph State Machine:**
```
User Query
    │
    ▼
┌──────────────┐
│ Intent Node  │ — Classifies query type
└──────┬───────┘
       │
   ┌───┴────────────────────────┐
   │                            │
┌──▼────────┐           ┌───────▼────────┐
│ RAG Node  │           │ Telemetry Node │
│ ChromaDB  │           │ Core API call  │
└──────┬────┘           └───────┬────────┘
       └────────────┬───────────┘
                    │
             ┌──────▼───────┐
             │ Synthesis    │ — Combines retrieval + telemetry
             │ Node         │
             └──────┬───────┘
                    │
             ┌──────▼───────┐
             │ Response     │
             └──────────────┘
```

**Key Endpoints:**
```
POST   /api/v1/agent/chat          — Send message, receive AI response
GET    /api/v1/agent/suggestions   — Suggested prompts for current state
```

---

### Ingestion Service (`services/ingestion-service`)

**Technology**: Python, asyncio, TimescaleDB COPY

**Responsibilities:**
- Ingests simulated sensor data at 10-second intervals
- Inserts into TimescaleDB `occupancy_readings` hypertable
- Generates realistic crowd patterns (rush hour, events, weather effects)
- Used by `seed.py` to populate demo data

---

## Data Flow

### Operator Dashboard — Real-Time Flow

```
Browser → WebSocket → Core API → TimescaleDB
                                      │
                         ← Occupancy update broadcast

Station clicked
Browser → POST /forecast → AI Inference → TFT model → Forecast + confidence
Browser → POST /chat    → Agent Service → LangGraph → ChromaDB + Telemetry → Response
```

### Commuter Copilot — In-Browser Flow

```
User input (origin + destination + mode + priority)
    │
    ▼
intelligence.ts:generateRouteResult()
    │
    ├── seedHash(input string) → deterministic seed
    ├── modeTimes[mode] → base travel time
    ├── crowdPct ← seed + priority offset
    ├── confidence ← inverse of crowd uncertainty
    ├── insightText ← seeded from pool of 5 templates
    └── altRoute ← secondary seeded calculation
    │
    ▼
RouteRecommendation component renders dynamic result
```

No network calls. Zero API dependency. Fully reproducible.

---

## Frontend Architecture

### Next.js App Router Structure

```
src/app/
├── layout.tsx          — Root layout: metadata, dark mode, body styles
├── page.tsx            — Operator Dashboard (Client Component)
├── commuter/
│   └── page.tsx        — Commuter Copilot page
└── login/
    └── page.tsx        — Auth page
```

### Client Component Boundaries

All interactive components use `"use client"`. SSR-incompatible libraries (Mapbox GL, Framer Motion animations with browser APIs) are wrapped in `next/dynamic` with `ssr: false`:

```typescript
// MapWrapper.tsx
const GlobalMap = dynamic(
  () => import("./GlobalMap").then(m => m.GlobalMap),
  { ssr: false }
);
```

### Hydration Safety

All animated particles use a **deterministic seeded RNG** instead of `Math.random()`:

```typescript
// src/lib/intelligence.ts
function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
```

This ensures SSR and client render produce identical output — eliminating React hydration warnings.

---

## In-Browser Intelligence Engine

`src/lib/intelligence.ts` is the centrepiece of UrbanPulse AI's demo reliability.

### Architecture

```
intelligence.ts
├── STATIONS[]              — 6 station definitions with occupancy, risk, scenario
├── seedHash(string)        — Deterministic hash: string → number
├── seededPick(arr, seed)   — Consistent item selection from array
├── generateRouteResult()   — Commuter Copilot engine
│   ├── modeTimes           — Base times per transport mode
│   ├── crowdPct            — Priority-adjusted crowd calculation
│   ├── confidence          — Inverse uncertainty model
│   ├── cost                — Mode-specific cost with variance
│   └── insightText         — One of 5 seeded insight templates
└── generateAgentResponse() — Agent Intelligence Engine
    ├── stationAnalysis     — Pattern: crowd|busy|overcrowd
    ├── operatorRecs        — Pattern: operator|dispatch|recommend
    ├── networkStatus       — Pattern: network|status|overview
    ├── passengerAdvice     — Pattern: avoid|route|passenger
    ├── forecastExplanation — Pattern: forecast|predict|confidence
    ├── interventionImpact  — Pattern: impact|if.*not|consequence
    ├── delays              — Pattern: delay|late|disruption
    └── default             — Contextual catch-all
```

---

## Database Design

### TimescaleDB Hypertables

**`occupancy_readings`** (hypertable partitioned by `recorded_at`)
```sql
CREATE TABLE occupancy_readings (
    id            BIGSERIAL,
    station_id    UUID          NOT NULL,
    occupancy     INTEGER       NOT NULL,
    capacity      INTEGER       NOT NULL,
    recorded_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    source        VARCHAR(50)   DEFAULT 'sensor'
);
SELECT create_hypertable('occupancy_readings', 'recorded_at');
```

**`stations`**
```sql
CREATE TABLE stations (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)  NOT NULL,
    lat         FLOAT         NOT NULL,
    lon         FLOAT         NOT NULL,
    capacity    INTEGER       NOT NULL,
    zone        VARCHAR(10),
    line_ids    UUID[],
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);
```

**`interventions`**
```sql
CREATE TABLE interventions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID        REFERENCES stations(id),
    type            VARCHAR(50) NOT NULL,  -- DISPATCH_VEHICLE, etc.
    triggered_by    VARCHAR(50),           -- MANUAL | AUTO
    predicted_impact FLOAT,
    actual_impact    FLOAT,
    applied_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**`users`**
```sql
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  DEFAULT 'operator',
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);
```

---

## Engineering Decision Records

### EDR-001: Why TimescaleDB instead of InfluxDB?

**Decision**: Use TimescaleDB (PostgreSQL extension) rather than a dedicated time-series database.

**Rationale**: TimescaleDB provides time-series optimisations (automatic partitioning, compression, time-bucket functions) while retaining full SQL compatibility. This means the same ORM (SQLAlchemy), the same migration tools (Alembic), and the same query language as the rest of the application — reducing cognitive overhead significantly. InfluxDB would require a separate query language (Flux) and a separate ORM pattern.

---

### EDR-002: Why LangGraph over plain LangChain?

**Decision**: Use LangGraph for agent orchestration.

**Rationale**: LangChain agents are defined as unstructured loops that can be difficult to debug in production. LangGraph enforces explicit state machine definitions with named nodes and typed state. This makes agent behaviour predictable, traceable in logs, and reproducible across runs — critical properties for any AI system used in safety-relevant contexts like transit management.

---

### EDR-003: Why a seeded intelligence engine instead of API-only responses?

**Decision**: Build a complete deterministic in-browser intelligence engine as a primary fallback (not a last resort).

**Rationale**: Demo reliability is a first-class requirement. A hackathon or recruiter demo that fails due to API key expiry, rate limiting, or network issues is worse than a demo that uses a deterministic fallback. The seeded engine was deliberately designed to produce high-quality, contextually relevant responses — not placeholder text. Users cannot distinguish it from a live LLM response.

---

### EDR-004: Why no `Math.random()` in render paths?

**Decision**: All animated values use a deterministic seeded RNG function.

**Rationale**: React's Server-Side Rendering (SSR) and client-side hydration must produce identical HTML. `Math.random()` returns different values on each call — causing React to throw hydration mismatch warnings that appear in the browser console and can break component trees. The `sin`-based seeded RNG produces the same sequence of values for the same seed on both server and client.
