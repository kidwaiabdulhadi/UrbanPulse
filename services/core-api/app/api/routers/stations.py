from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, require_role
from app.schemas.station import StationRead, StationCreate
from app.crud.station import get_stations, create_station
from app.models.user import User

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/", response_model=List[StationRead])
def read_stations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_stations(db, skip=skip, limit=limit)

@router.post("/", response_model=StationRead, dependencies=[Depends(require_role("OPERATOR"))])
def add_station(station: StationCreate, db: Session = Depends(get_db)):
    return create_station(db=db, station=station)
