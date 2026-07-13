from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from .. import models, schemas, auth

router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance"])


@router.get("", response_model=List[schemas.MaintenanceLogResponse])
async def get_maintenance_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    status: Optional[models.MaintenanceStatus] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all maintenance logs with optional filters"""
    query = models.MaintenanceLog.find()
    
    if vehicle_id:
        query = query.find(models.MaintenanceLog.vehicle_id == vehicle_id)
    if status:
        query = query.find(models.MaintenanceLog.status == status)
    
    logs = await query.skip(skip).limit(limit).to_list()
    return logs


@router.get("/{maintenance_id}", response_model=schemas.MaintenanceLogResponse)
async def get_maintenance_log(
    maintenance_id: str,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific maintenance log by ID"""
    log = await models.MaintenanceLog.get(maintenance_id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log


@router.post("", response_model=schemas.MaintenanceLogResponse)
async def create_maintenance_log(
    maintenance: schemas.MaintenanceLogCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new maintenance log - automatically sets vehicle to IN_SHOP"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    
    vehicle = await models.Vehicle.find_one(models.Vehicle.id == maintenance.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_maintenance = models.MaintenanceLog(**maintenance.model_dump())
    await db_maintenance.insert()
    
    # If maintenance is scheduled or in progress, set vehicle to IN_SHOP
    if db_maintenance.status in [models.MaintenanceStatus.SCHEDULED, models.MaintenanceStatus.IN_PROGRESS]:
        vehicle.status = models.VehicleStatus.IN_SHOP
        await vehicle.save()
    
    return db_maintenance


@router.put("/{maintenance_id}", response_model=schemas.MaintenanceLogResponse)
async def update_maintenance_log(
    maintenance_id: str,
    maintenance: schemas.MaintenanceLogUpdate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a maintenance log - completing maintenance restores vehicle to AVAILABLE"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    
    db_maintenance = await models.MaintenanceLog.get(maintenance_id)
    if not db_maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    
    update_data = maintenance.model_dump(exclude_unset=True)
    
    # Handle status changes
    if "status" in update_data:
        new_status = update_data["status"]
        vehicle = await models.Vehicle.get(db_maintenance.vehicle_id)
        
        if vehicle:
            # If completing or cancelling maintenance, restore vehicle to AVAILABLE
            if new_status in [models.MaintenanceStatus.COMPLETED, models.MaintenanceStatus.CANCELLED]:
                if vehicle.status != models.VehicleStatus.RETIRED:
                    vehicle.status = models.VehicleStatus.AVAILABLE
                    await vehicle.save()
            
            # If starting maintenance, set vehicle to IN_SHOP
            elif new_status == models.MaintenanceStatus.IN_PROGRESS:
                vehicle.status = models.VehicleStatus.IN_SHOP
                await vehicle.save()
    
    await db_maintenance.set(update_data)
    return db_maintenance
