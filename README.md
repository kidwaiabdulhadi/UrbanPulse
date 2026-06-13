<div align="center">

<br/>

```
██╗   ██╗██████╗ ██████╗  █████╗ ███╗   ██╗██████╗ ██╗   ██╗██╗     ███████╗███████╗     █████╗ ██╗
██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║██╔══██╗██║   ██║██║     ██╔════╝██╔════╝    ██╔══██╗██║
██║   ██║██████╔╝██████╔╝███████║██╔██╗ ██║██████╔╝██║   ██║██║     ███████╗█████╗      ███████║██║
██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚██╗██║██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝      ██╔══██║██║
╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚████║██║     ╚██████╔╝███████╗███████║███████╗    ██║  ██║██║
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝
```

### **Predict overcrowding before it happens. Act before it hurts.**

*An AI-powered Predictive Transit Intelligence Platform combining Digital Twin simulations,*  
*LangGraph agentic reasoning, and crowd-aware commuter routing.*


<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white&style=flat-square)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white&style=flat-square)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white&style=flat-square)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-ee4c2c?logo=pytorch&logoColor=white&style=flat-square)](https://pytorch.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_AI-00a67e?logo=langchain&logoColor=white&style=flat-square)](https://github.com/langchain-ai/langgraph)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white&style=flat-square)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<br/>

[🚀 **Live Demo**](https://urbanpulse-ai-tawny.vercel.app)
&nbsp;·&nbsp;
[🗺️ **Commuter Copilot**](https://urbanpulse-ai-tawny.vercel.app/commuter)
&nbsp;·&nbsp;
[📖 **Architecture**](docs/ARCHITECTURE.md)
&nbsp;·&nbsp;
[📡 **API Reference**](docs/API_REFERENCE.md)
&nbsp;·&nbsp;
[🚢 **Deployment Guide**](docs/DEPLOYMENT.md)
&nbsp;·&nbsp;
[🐛 **Report Bug**](../../issues/new?template=bug_report.md)

</div>

---

UrbanPulse AI is an AI-powered transit intelligence platform designed to help transit operators anticipate overcrowding before it happens and help commuters make smarter travel decisions through predictive insights, digital twin simulations, and crowd-aware route recommendations.

---

## 🌍 The Problem

When transit platforms overflow, consequences can range from passenger discomfort to severe safety incidents and widespread service failures. Historically, transit management has been reactive by design. When operators notice overcrowding on their dashboards, it is often too late to deploy an effective intervention.

---

## 💡 The Solution

UrbanPulse AI shifts transit operations from a reactive posture to a predictive one:

<div align="center">

| Traditional Approach | UrbanPulse AI Approach |
|:---|:---|
| 🔴 Overcrowding discovered *after* it peaks | 🟢 Predicted **15–45 minutes** in advance |
| 🔴 Interventions based on operator intuition | 🟢 Counterfactual simulation projects impact before committing |
| 🔴 Commuters route based on normal schedules | 🟢 Copilot suggests routes aware of *future* crowd conditions |

</div>

---

## ⭐ Project Philosophy

This project was built to demonstrate engineering maturity across multiple disciplines. It is designed to be a complete, robust system rather than a fragile prototype.

<details>
<summary><b>🧠 1. AI Engineering — Four categories of AI working together</b></summary>

- **Predictive Forecasting** — Temporal Fusion Transformer (TFT) predicts station occupancy using rolling telemetry windows and contextual signals.
- **Prescriptive Intelligence** — The system mathematically simulates interventions and computes expected outcomes.
- **Agentic Reasoning** — LangGraph state machine classifies operator queries and routes them to the correct reasoning chain.
- **Retrieval-Augmented Generation** — ChromaDB vector store indexes transit policy documents.
- **In-Browser Intelligence** — A complete deterministic seeded intelligence engine provides reliable demonstration responses without network latency.

</details>

<details>
<summary><b>🏗️ 2. System Design — Microservices architecture</b></summary>

Six independent services, each with clear responsibilities, Docker networking, health checks, and graceful degradation:
- Core API (FastAPI + JWT + WebSockets)
- AI Inference (FastAPI + PyTorch TFT + SHAP)
- Agent Service (LangGraph + ChromaDB RAG)
- Ingestion Service (sensor simulation pipeline)
- TimescaleDB (time-series optimized PostgreSQL)
- Redis (pub/sub message broker + session cache)

</details>

<details>
<summary><b>⚡ 3. Frontend Engineering — Production-grade Next.js</b></summary>

- App Router with Server Components for fast initial loads
- `next/dynamic` with `ssr: false` for SSR-safe browser-only libraries
- Deterministic seeded RNG eliminating React hydration mismatches
- Framer Motion micro-animations on state transitions
- Copy-owned components (ShadCN) with full design control
- Zustand for lightweight notification state management

</details>

<details>
<summary><b>📊 4. Data Engineering — Purpose-built for telemetry</b></summary>

- TimescaleDB hypertables with automatic time-based partitioning
- Time-bucket aggregation functions for rolling analytics
- Synthetic data engine generating realistic crowd patterns (rush hour, events, weather)
- Database seeder populating stations with weeks of plausible telemetry

</details>

<details>
<summary><b>☁️ 6. Cloud Readiness — Deployment flexibility</b></summary>

- Vercel deployment with automatic CI/CD
- Docker Compose for full-stack self-hosting
- Environment variable management with documented fallback behavior

</details>

---

## ✨ Feature Overview

### 🖥️ Operator Intelligence Dashboard

| Feature | Description |
|:---|:---|
| **Animated Network Map** | SVG transit network with glowing station nodes, occupancy arc indicators, and moving trains. Upgrades to Mapbox 3D when token provided. |
| **Hero KPI Strip** | Four impact metrics visible at a glance. |
| **Digital Twin Simulation** | Side-by-side KPI grid: *Without Intervention* vs *With Intervention*. |
| **Counterfactual Engine** | Area chart comparing baseline vs mitigated occupancy. |
| **Intervention Impact Cards** | Passengers Protected · Wait Time Saved · Confidence Score. |
| **Intelligence Engine** | LangGraph-powered chat with intent classification and markdown rendering. |
| **Station Sync** | Clicking any station node synchronizes the Digital Twin to that station's context. |
| **Notification Center** | Severity-filtered alerts (Critical/Warning/Info) with unread tracking. |

### 🗺️ Commuter Copilot

| Feature | Description |
|:---|:---|
| **4-Step Wizard** | Guided experience with animated transitions and back navigation. |
| **Smart Origin** | GPS current location or typed search with live autocomplete. |
| **Crowd Badges** | Destinations show projected crowd levels *before* selection. |
| **Priority Engine** | Optimize for Fastest Route, Least Crowded, Lowest Cost, or Comfort. |
| **Dynamic Results** | Travel time, crowd percentage, confidence score, and cost dynamically modeled. |
| **AI Insight** | Contextual tips based on crowd patterns (e.g., waiting 10 minutes to avoid a peak). |

---

## 🏗️ Architecture

```
                        ┌─────────────────────────────────┐
                        │         CLIENT (Browser)         │
                        │  Next.js 16 · TypeScript         │
                        │  Framer Motion · ShadCN/UI       │
                        │  Intelligence Engine (in-browser)│
                        └──────────────┬──────────────────┘
                                       │ HTTPS / WSS
               ┌───────────────────────┼──────────────────────┐
               │                       │                      │
        ┌──────▼──────┐       ┌────────▼───────┐    ┌─────────▼────────┐
        │  Core API   │       │  AI Inference  │    │  Agent Service   │
        │  FastAPI    │       │  FastAPI        │    │  LangGraph       │
        │  :8000      │       │  PyTorch TFT   │    │  ChromaDB RAG    │
        │  Auth · WS  │       │  SHAP · Sim    │    │  :8003           │
        └──────┬──────┘       └────────┬───────┘    └─────────┬────────┘
               │                       │                      │
        ┌──────▼───────────────────────▼──────────────────────▼────────┐
        │               PostgreSQL + TimescaleDB :5432                  │
        │         Time-series hypertables · Station data · Auth         │
        └───────────────────────────────────────────────────────────────┘
               │
        ┌──────▼──────────────────────────────────────────────────────┐
        │   Redis :6379   Pub/Sub · Session cache · Rate limiting      │
        └─────────────────────────────────────────────────────────────┘
```

> 📖 Full data flow diagrams, database schema, and Engineering Decision Records in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🧠 AI Architecture

UrbanPulse AI leverages multiple AI subsystems to handle different aspects of transit management:

<details>
<summary><b>1️⃣ Predictive Forecasting — PyTorch Temporal Fusion Transformer</b></summary>

The AI Inference service uses a Temporal Fusion Transformer (TFT) architecture for multi-horizon time-series forecasting.

**Inputs:**
- Rolling 2-hour occupancy windows per station
- Scheduled service timetables
- Static station metadata (capacity, zone)
- Contextual signals: weather, scheduled events

**Output:**
- 30-minute occupancy forecast with confidence intervals
- SHAP feature attributions explaining the prediction ("Event Spillover: +35%")
</details>

<details>
<summary><b>2️⃣ Digital Twin Counterfactual Engine</b></summary>

The Digital Twin leverages mathematical queueing models to simulate interventions. By modeling passenger arrival rates against variable service dispatch rates, the system calculates expected peak reductions and wait time savings before operators execute a command.
</details>

<details>
<summary><b>3️⃣ LangGraph Agentic Reasoning</b></summary>

The Agent Service uses LangGraph to construct a state machine for multi-step reasoning. Operator queries are first classified by intent, then routed to specific chains that may retrieve policy documents from ChromaDB, query real-time telemetry, or synthesize a combined recommendation.
</details>

<details>
<summary><b>4️⃣ Seeded Intelligence Engine (Frontend)</b></summary>

To ensure reliability during demonstrations and when backend services are unavailable, the Next.js frontend includes a deterministic, offline-capable intelligence layer. By hashing inputs (like start point, destination, and priority), it generates plausible and consistent AI insights entirely in the browser without network requests.
</details>

---

## 🛡️ Graceful Degradation

The live demonstration uses deterministic intelligence layers designed to ensure a reliable experience even when external services or API keys are unavailable. 

Every external dependency has a seamless fallback:

| Dependency | Implementation | Fallback Mode |
|:---|:---|:---|
| **Mapbox Token** | Interactive 3D satellite map | Animated SVG transit network map |
| **OpenAI API Key** | LangGraph multi-step reasoning agent | Seeded in-browser intelligence engine |
| **Backend Services** | TimescaleDB telemetry + WebSocket stream | Standalone Next.js demonstration mode |

This fallback capability was explicitly engineered to ensure the project remains functional and visually impressive under any deployment constraint.

---

## ⚙️ Installation & Setup

### Prerequisites

| Tool | Version |
|:---|:---|
| Node.js | ≥ 18.x |
| Python | ≥ 3.11 |
| Docker Desktop | ≥ 24.x |

### Quick Start (Docker)

```bash
git clone https://github.com/kidwaiabdulhadi/urbanpulse-ai.git
cd urbanpulse-ai

cp .env.example .env          # All defaults work without API keys
docker-compose up -d --build  # Starts all 6 services
python seed.py                 # Populates with realistic demo data

# Open http://localhost:3000
```

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

> 📖 Detailed deployment guides for Vercel, Railway, and Render are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 🔧 Engineering Decisions

| Decision | Rationale |
|:---|:---|
| **Next.js App Router** | Facilitates fast initial loads and clear server/client component boundaries. |
| **Microservices** | Allows the heavy ML inference layer to scale independently from the fast API layer. |
| **TimescaleDB** | Purpose-built for time-series data, offering automatic partitioning and time-bucket aggregations. |
| **LangGraph** | Provides explicit state machines, making agent behavior predictable and traceable. |
| **Deterministic Fallbacks** | Ensures reliable portfolio and hackathon demonstrations without relying on external API limits or network stability. |
| **ShadCN/UI** | Copy-owned components ensure full design control without introducing a bulky runtime library. |

---

## 🗺️ Roadmap

### Available Today (v1.0 Prototype)
- Operator Intelligence Dashboard with animated network map
- Digital Twin simulation interface with counterfactuals
- Commuter Copilot routing wizard
- Standalone demonstration mode powered by seeded intelligence
- Docker Compose orchestration for local hosting

### Future Enhancements
- Live integration with real-world GTFS datasets
- Full deployment of the PyTorch TFT forecasting service to cloud infrastructure
- Historical analytics dashboard with long-term trend analysis
- Push alerts for transit operators

While currently a prototype, the architecture was intentionally designed so the platform could evolve into a robust smart-city decision support system.

---

## 🤝 Contributing

Suggestions and improvements are welcome. This repository primarily represents a university capstone project and startup prototype, but small contributions and bug fixes are appreciated. 

Please read [CONTRIBUTING.md](CONTRIBUTING.md) to review our code style conventions.

---

## 👤 About the Author

**Abdul Hadi Kidwai**

UrbanPulse AI was developed by Abdul Hadi Kidwai as part of his interest in AI systems, smart cities, and human-centered technology. The project reflects a combination of academic exploration, startup thinking, and practical software engineering.

- 🔗 **GitHub**: [@kidwaiabdulhadi](https://github.com/kidwaiabdulhadi)
- 💼 **LinkedIn**: [Abdul Hadi Kidwai](https://www.linkedin.com/in/abdul-hadi-kidwai-51231032a)
- 📧 **Email**: a.hadikidwai@gmail.com

---

## 📄 License

MIT — see [LICENSE](LICENSE).

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Open_Live_Demo-urbanpulse--ai--tawny.vercel.app-000000?style=for-the-badge&logo=vercel)](https://urbanpulse-ai-tawny.vercel.app)

</div>
