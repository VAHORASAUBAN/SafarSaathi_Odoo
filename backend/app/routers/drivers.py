from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


@router.get("", response_model=List[schemas.DriverResponse])
def get_drivers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.DriverStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all drivers with optional filters"""
    drivers = crud.get_drivers(db, skip=skip, limit=limit, status=status)
    return drivers


@router.get("/available", response_model=List[schemas.DriverResponse])
def get_available_drivers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get drivers available for dispatch (Available status with valid license)"""
    return crud.get_available_drivers(db)


@router.get("/{driver_id}", response_model=schemas.DriverResponse)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific driver by ID"""
    driver = crud.get_driver(db, driver_id)
    if not driver:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.post("", response_model=schemas.DriverResponse)
def create_driver(
    driver: schemas.DriverCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    return crud.create_driver(db, driver)


@router.put("/{driver_id}", response_model=schemas.DriverResponse)
def update_driver(
    driver_id: int,
    driver: schemas.DriverUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    return crud.update_driver(db, driver_id, driver)


@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    return crud.delete_driver(db, driver_id)
