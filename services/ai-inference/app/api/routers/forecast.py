from fastapi import APIRouter, BackgroundTasks, HTTPException
import os
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.pipeline.train import train_tft_model
from app.services.explainability import get_explanation_for_forecast
from app.core.config import settings
import torch

router = APIRouter()

class ForecastResponse(BaseModel):
    station_id: str
    predictions: List[float] # 15m, 30m, 60m
    horizons: List[int] = [15, 30, 60]

class TrainRequest(BaseModel):
    station_id: Optional[str] = None

@router.post("/train", summary="Trigger Model Training")
async def trigger_training(req: TrainRequest, background_tasks: BackgroundTasks):
    # In production, this might trigger an Airflow DAG or Celery task
    background_tasks.add_task(train_tft_model, req.station_id)
    return {"message": "Training pipeline started in the background", "station_id": req.station_id}

@router.get("/{station_id}", response_model=ForecastResponse, summary="Get Real-time Forecast")
async def get_forecast(station_id: str):
    # This is a skeleton implementation of inference
    # In reality, we would load the .ckpt from MLflow/disk and pass recent data
    model_path = os.path.join(settings.MODEL_DIR, f"tft_model_{station_id}.ckpt")
    
    # If model doesn't exist, we fall back to a mock prediction or LSTM
    if not os.path.exists(model_path):
        model_path = os.path.join(settings.MODEL_DIR, f"tft_model_all.ckpt")
        if not os.path.exists(model_path):
             return {"station_id": station_id, "predictions": [0.0, 0.0, 0.0], "horizons": [15, 30, 60]}
            
    # Mock inference loading logic
    # model = TemporalFusionTransformer.load_from_checkpoint(model_path)
    # pred = model.predict(recent_data)
    
    return {
        "station_id": station_id,
        "predictions": [150.5, 175.2, 210.0], # Dummy values
        "horizons": [15, 30, 60]
    }

class ExplainResponse(BaseModel):
    station_id: str
    forecast_values: List[float]
    shap_values: Dict[str, float]
    plain_english_explanation: str
    chart_url: str

@router.get("/{station_id}/explain", response_model=ExplainResponse, summary="Get AI Forecast Explanation")
async def get_forecast_explanation(station_id: str):
    # Dummy baseline and forecast values for 60m horizon
    baseline = 120.0
    forecast_60m = 210.0
    
    explanation = get_explanation_for_forecast(
        station_id=station_id,
        forecast_value=forecast_60m,
        baseline_value=baseline
    )
    
    return {
        "station_id": station_id,
        "forecast_values": [150.5, 175.2, 210.0],
        "shap_values": explanation["shap_values"],
        "plain_english_explanation": explanation["plain_english_explanation"],
        "chart_url": explanation["chart_url"]
    }
