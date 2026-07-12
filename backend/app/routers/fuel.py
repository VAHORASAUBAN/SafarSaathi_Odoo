from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/fuel", tags=["Fuel Logs"])


@router.get("", response_model=List[schemas.FuelLogResponse])
def get_fuel_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all fuel logs with optional filters"""
    logs = crud.get_fuel_logs(db, skip=skip, limit=limit, vehicle_id=vehicle_id)
    return logs


@router.post("", response_model=schemas.FuelLogResponse)
def create_fuel_log(
    fuel_log: schemas.FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new fuel log"""
    auth.check_permission(current_user, [
        models.UserRole.DRIVER,
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    return crud.create_fuel_log(db, fuel_log)
