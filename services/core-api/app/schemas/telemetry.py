from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CrowdTelemetryBase(BaseModel):
    station_id: UUID
    entry_count: int = 0
    exit_count: int = 0
    current_occupancy: int = 0

class CrowdTelemetryCreate(CrowdTelemetryBase):
    timestamp: datetime

class CrowdTelemetryRead(CrowdTelemetryCreate):
    class Config:
        from_attributes = True
