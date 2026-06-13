from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers
from app.api.routers import auth, stations, websockets
from app.core.redis_ws import manager

# Setup Logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Core backend service for UrbanPulse AI Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Exception Handlers
setup_exception_handlers(app)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(stations.router, prefix="/api/v1")
app.include_router(websockets.router)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(manager.listen_to_redis())

@app.get("/")
def read_root():
    return {"message": "Welcome to UrbanPulse AI Core API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
