from sqlalchemy.orm import Session
from app.models.station import Station
from app.schemas.station import StationCreate

def get_stations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Station).offset(skip).limit(limit).all()

def create_station(db: Session, station: StationCreate):
    db_station = Station(**station.model_dump())
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station
