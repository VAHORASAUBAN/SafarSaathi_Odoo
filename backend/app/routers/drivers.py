from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import date
from .. import models, schemas, auth

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


@router.get("", response_model=List[schemas.DriverResponse])
async def get_drivers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.DriverStatus] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all drivers with optional filters"""
    query = models.Driver.find()
    
    if status:
        query = query.find(models.Driver.status == status)
    
    drivers = await query.skip(skip).limit(limit).to_list()
    return drivers


@router.get("/available", response_model=List[schemas.DriverResponse])
async def get_available_drivers(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get drivers available for dispatch (Available status with valid license)"""
    today = date.today()
    drivers = await models.Driver.find(
        models.Driver.status == models.DriverStatus.AVAILABLE,
        models.Driver.license_expiry_date >= today
    ).to_list()
    return drivers


@router.get("/{driver_id}", response_model=schemas.DriverResponse)
async def get_driver(
    driver_id: int,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific driver by ID"""
    driver = await models.Driver.find_one(models.Driver.id == driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.post("", response_model=schemas.DriverResponse)
async def create_driver(
    driver: schemas.DriverCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    
    # Check if license number already exists
    existing = await models.Driver.find_one(
        models.Driver.license_number == driver.license_number
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Driver with this license number already exists"
        )
    
    db_driver = models.Driver(**driver.model_dump())
    await db_driver.insert()
    return db_driver


@router.put("/{driver_id}", response_model=schemas.DriverResponse)
async def update_driver(
    driver_id: int,
    driver: schemas.DriverUpdate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    
    db_driver = await models.Driver.find_one(models.Driver.id == driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver.model_dump(exclude_unset=True)
    await db_driver.set(update_data)
    return db_driver


@router.delete("/{driver_id}")
async def delete_driver(
    driver_id: int,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a driver"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, models.UserRole.SAFETY_OFFICER])
    
    db_driver = await models.Driver.find_one(models.Driver.id == driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    await db_driver.delete()
    return {"message": "Driver deleted successfully"}
