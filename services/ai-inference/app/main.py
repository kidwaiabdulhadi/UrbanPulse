from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import forecast, simulation

app = FastAPI(title="UrbanPulse AI Inference Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router, prefix="/api/v1/forecast")
app.include_router(simulation.router, prefix="/api/v1/simulation")

@app.get("/")
def root():
    return {"message": "AI Inference Service Active"}
