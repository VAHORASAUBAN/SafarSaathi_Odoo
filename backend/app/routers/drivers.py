from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import date
from .. import models, schemas, auth, rbac

router = APIRouter(prefix="/api/v1/drivers", tags=["Drivers"])


@router.get("", response_model=List[schemas.DriverResponse])
async def get_drivers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.DriverStatus] = None,
    current_user: models.User = Depends(rbac.require_driver_view())
):
    """Get all drivers with optional filters"""
    query = models.Driver.find()
    
    if status:
        query = query.find(models.Driver.status == status)
    
    drivers = await query.skip(skip).limit(limit).to_list()
    return drivers


@router.get("/available", response_model=List[schemas.DriverResponse])
async def get_available_drivers(
    current_user: models.User = Depends(rbac.require_driver_view())
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
    driver_id: str,
    current_user: models.User = Depends(rbac.require_driver_view())
):
    """Get a specific driver by ID"""
    driver = await models.Driver.get(driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.post("", response_model=schemas.DriverResponse)
async def create_driver(
    driver: schemas.DriverCreate,
    current_user: models.User = Depends(rbac.require_driver_create())
):
    """Create a new driver"""
    
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
    driver_id: str,
    driver: schemas.DriverUpdate,
    current_user: models.User = Depends(rbac.require_driver_edit())
):
    """Update a driver"""
    
    db_driver = await models.Driver.get(driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver.model_dump(exclude_unset=True)
    await db_driver.set(update_data)
    return db_driver


@router.delete("/{driver_id}")
async def delete_driver(
    driver_id: str,
    current_user: models.User = Depends(rbac.require_driver_delete())
):
    """Delete a driver"""
    
    db_driver = await models.Driver.get(driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    await db_driver.delete()
    return {"message": "Driver deleted successfully"}
