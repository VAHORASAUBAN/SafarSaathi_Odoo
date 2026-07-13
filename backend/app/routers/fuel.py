from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from .. import models, schemas, auth

router = APIRouter(prefix="/api/v1/fuel", tags=["Fuel Logs"])


@router.get("", response_model=List[schemas.FuelLogResponse])
async def get_fuel_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all fuel logs with optional filters"""
    query = models.FuelLog.find()
    
    if vehicle_id:
        query = query.find(models.FuelLog.vehicle_id == vehicle_id)
    
    logs = await query.skip(skip).limit(limit).to_list()
    return logs


@router.post("", response_model=schemas.FuelLogResponse)
async def create_fuel_log(
    fuel_log: schemas.FuelLogCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new fuel log"""
    auth.check_permission(current_user, [
        models.UserRole.DISPATCHER,
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    
    vehicle = await models.Vehicle.get(fuel_log.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_fuel_log = models.FuelLog(**fuel_log.model_dump())
    await db_fuel_log.insert()
    return db_fuel_log
