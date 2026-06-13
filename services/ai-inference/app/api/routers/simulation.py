from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.services.simulation import simulate_intervention, InterventionType

router = APIRouter()

class SimulationRequest(BaseModel):
    station_id: str
    baseline_forecast: List[float]
    intervention: InterventionType
    station_capacity: int = 200

class SimulationResponse(BaseModel):
    station_id: str
    intervention: str
    scenario_a: List[float]
    scenario_b: List[float]
    metrics: Dict[str, float | str]

@router.post("/simulate", response_model=SimulationResponse, summary="Run Counterfactual Digital Twin Simulation")
async def run_simulation(req: SimulationRequest):
    scenario_b, metrics = simulate_intervention(
        baseline_forecast=req.baseline_forecast,
        intervention=req.intervention,
        capacity=req.station_capacity
    )
    
    return {
        "station_id": req.station_id,
        "intervention": req.intervention,
        "scenario_a": req.baseline_forecast,
        "scenario_b": scenario_b,
        "metrics": metrics
    }
