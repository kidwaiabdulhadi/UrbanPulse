from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class StationBase(BaseModel):
    name: str
    line_color: str
    latitude: float
    longitude: float
    capacity: int

class StationCreate(StationBase):
    pass

class StationUpdate(BaseModel):
    name: Optional[str] = None
    line_color: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None

class StationRead(StationBase):
    id: UUID

    class Config:
        from_attributes = True
