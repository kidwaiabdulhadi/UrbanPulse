# UrbanPulse AI — Deployment Guide

This document covers every deployment path for UrbanPulse AI, from a 2-minute Vercel deploy to a full self-hosted Docker Compose stack.

---

## Table of Contents

- [Frontend — Vercel](#frontend--vercel)
- [Backend — Railway](#backend--railway)
- [Backend — Render](#backend--render)
- [Backend — Fly.io](#backend--flyio)
- [Full Stack — Docker Compose](#full-stack--docker-compose)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Frontend — Vercel

The Next.js frontend deploys to Vercel with zero configuration.

### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier works)
- Node.js ≥ 18 installed locally

### Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to the frontend directory
cd frontend

# 3. Deploy to production
vercel --prod --yes
```

Vercel auto-detects Next.js, sets the correct build command (`next build`), and deploys.

### Optional Environment Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**:

| Variable | Value | Effect |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.ey...` | Enables interactive 3D Mapbox map |
| `NEXT_PUBLIC_CORE_API_URL` | `https://your-api.railway.app` | Connects to deployed Core API |
| `NEXT_PUBLIC_AGENT_API_URL` | `https://your-agent.railway.app` | Connects to deployed Agent Service |

> **Without these variables**, the frontend runs in standalone mode — the animated SVG network and seeded intelligence engine provide the full demo experience.

### Custom Domain

In the Vercel dashboard: **Settings → Domains → Add Domain**

---

## Backend — Railway

Railway provides free-tier PostgreSQL and Redis, making it the easiest backend platform.

### Prerequisites
- A [Railway account](https://railway.app/) (free tier: 500 hours/month)
- Railway CLI: `npm i -g @railway/cli`

### Core API Deployment

```bash
cd services/core-api

# Login
railway login

# Create a new project
railway init

# Add PostgreSQL plugin in Railway dashboard
# (Settings → Plugins → Add PostgreSQL)

# Add Redis plugin in Railway dashboard
# (Settings → Plugins → Add Redis)

# Deploy
railway up
```

Set environment variables in Railway dashboard (**Variables** tab):

```
DATABASE_URL=<auto-provided by Railway PostgreSQL plugin>
REDIS_URL=<auto-provided by Railway Redis plugin>
SECRET_KEY=<generate with: openssl rand -hex 32>
OPENAI_API_KEY=<optional>
CORS_ORIGINS=https://urbanpulse-ai-tawny.vercel.app
```

### AI Inference Service Deployment

```bash
cd services/ai-inference
railway init
railway up
```

Variables:
```
DATABASE_URL=<same as Core API>
```

### Agent Service Deployment

```bash
cd services/agent-service
railway init
railway up
```

Variables:
```
OPENAI_API_KEY=<optional — seeded fallback activates if absent>
CORE_API_URL=https://your-core-api.railway.app/api/v1
AI_INFERENCE_URL=https://your-ai-inference.railway.app/api/v1
```

---

## Backend — Render

### Core API on Render

1. Connect your GitHub repository at [render.com](https://render.com)
2. Create a **Web Service**
3. Set:
   - **Root Directory**: `services/core-api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add a **PostgreSQL** database (Render free tier)
5. Set environment variables in the dashboard

### Using Render's docker-compose Support (Recommended)

Render supports `docker-compose.yml` directly:
1. Connect your repo
2. Select **Docker Compose** as the deployment type
3. Set all environment variables in the Render dashboard

---

## Backend — Fly.io

Fly.io is recommended for lower latency in specific regions.

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Navigate to a service
cd services/core-api

# Create the app
fly launch --name urbanpulse-core-api

# Deploy
fly deploy

# Set secrets
fly secrets set SECRET_KEY=<your-key>
fly secrets set DATABASE_URL=<your-db-url>
fly secrets set OPENAI_API_KEY=<optional>
```

---

## Full Stack — Docker Compose

Self-hosted deployment on any VPS (DigitalOcean, Hetzner, AWS EC2, etc.).

### Minimum Requirements
- 2 vCPU, 4 GB RAM
- Ubuntu 22.04 LTS (recommended)
- Docker + Docker Compose installed

### Steps

```bash
# On your server
git clone https://github.com/yourusername/urbanpulse-ai.git
cd urbanpulse-ai

# Configure environment
cp .env.example .env
nano .env   # Fill in production values

# Launch
docker-compose up -d --build

# Seed the database
python seed.py

# Verify services
docker-compose ps
```

### Updating a Deployment

```bash
git pull origin main
docker-compose up -d --build
```

### Viewing Logs

```bash
docker-compose logs -f              # All services
docker-compose logs -f core-api     # Specific service
docker-compose logs -f frontend
```

---

## Environment Variables Reference

See [.env.example](../.env.example) for the complete list with descriptions.

### Production Secrets Checklist

- [ ] `SECRET_KEY` is randomly generated (`openssl rand -hex 32`), not the default
- [ ] `DATABASE_URL` points to a production database with backups enabled
- [ ] `CORS_ORIGINS` lists only your actual frontend domain(s)
- [ ] `OPENAI_API_KEY` is set with appropriate rate limits on the OpenAI dashboard

---

## Post-Deployment Checklist

After deploying, verify each item:

- [ ] Frontend loads at the production URL without console errors
- [ ] Animated network map displays (confirms frontend JS is working)
- [ ] Intelligence Engine responds to "Summarise network status" (confirms in-browser fallback)
- [ ] Commuter Copilot completes a full journey recommendation
- [ ] Digital Twin simulation runs and shows impact cards
- [ ] Notification Centre opens and displays seeded alerts
- [ ] `/login` page renders correctly
- [ ] No "Mapbox Token Required" message appears anywhere
- [ ] No "Fallback Mode" text appears anywhere in the UI

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Build fails on Vercel | TypeScript error | Run `npm run build` locally first |
| Map shows broken state | Old fallback code | Ensure `GlobalMap.tsx` checks `token.length > 30` |
| Agent always returns same response | Old hardcoded fallback | Ensure `AgentChatPanel.tsx` imports from `@/lib/intelligence` |
| Backend 500 errors | Missing env variable | Check Railway/Render logs for `KeyError` or `None` |
| Docker containers crash | Port conflict | Check `docker-compose ps` and free conflicting ports |
