import pandas as pd
import numpy as np
from pytorch_forecasting import TimeSeriesDataSet
from sqlalchemy import create_engine
from app.core.config import settings

def load_telemetry_data(station_id: str = None, days: int = 30) -> pd.DataFrame:
    engine = create_engine(settings.DATABASE_URL)
    query = f"SELECT * FROM crowd_telemetry"
    if station_id:
        query += f" WHERE station_id = '{station_id}'"
    query += f" ORDER BY timestamp DESC LIMIT {days * 24 * 12}"
    
    try:
        df = pd.read_sql(query, engine)
    except Exception:
        # Fallback to local CSV if DB not accessible for dev
        df = pd.read_csv("../../tools/synthetic-data-engine/data/synthetic_telemetry.csv")
        if station_id:
            df = df[df['station_id'] == station_id]
        # Get last `days` of data
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values("timestamp").tail(days * 24 * 12)
        
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df

def preprocess_for_tft(df: pd.DataFrame) -> TimeSeriesDataSet:
    df["time_idx"] = (df["timestamp"] - df["timestamp"].min()).dt.total_seconds() // 300
    df["time_idx"] = df["time_idx"].astype(int)
    
    # Feature Engineering
    df["hour"] = df["timestamp"].dt.hour.astype(str).astype("category")
    df["day_of_week"] = df["timestamp"].dt.dayofweek.astype(str).astype("category")
    df["is_weekend"] = (df["timestamp"].dt.dayofweek >= 5).astype(str).astype("category")
    
    max_prediction_length = 12 # 60 minutes (12 * 5m)
    max_encoder_length = 24 * 12 # 24 hours
    
    training = TimeSeriesDataSet(
        df,
        time_idx="time_idx",
        target="current_occupancy",
        group_ids=["station_id"],
        min_encoder_length=max_encoder_length // 2,
        max_encoder_length=max_encoder_length,
        min_prediction_length=1,
        max_prediction_length=max_prediction_length,
        static_categoricals=["station_id"],
        time_varying_known_categoricals=["hour", "day_of_week", "is_weekend"],
        time_varying_known_reals=["time_idx"],
        time_varying_unknown_reals=["current_occupancy"],
        add_relative_time_idx=True,
        add_target_scales=True,
        add_encoder_length=True,
    )
    
    return training
