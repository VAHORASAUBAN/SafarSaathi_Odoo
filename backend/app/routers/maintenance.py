from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])


@router.get("", response_model=List[schemas.MaintenanceLogResponse])
def get_maintenance_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    status: Optional[models.MaintenanceStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all maintenance logs with optional filters"""
    logs = crud.get_maintenance_logs(
        db, skip=skip, limit=limit, vehicle_id=vehicle_id, status=status
    )
    return logs


@router.get("/{maintenance_id}", response_model=schemas.MaintenanceLogResponse)
def get_maintenance_log(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific maintenance log by ID"""
    log = crud.get_maintenance_log(db, maintenance_id)
    if not log:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log


@router.post("", response_model=schemas.MaintenanceLogResponse)
def create_maintenance_log(
    maintenance: schemas.MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new maintenance log - automatically sets vehicle to IN_SHOP"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    return crud.create_maintenance_log(db, maintenance)


@router.put("/{maintenance_id}", response_model=schemas.MaintenanceLogResponse)
def update_maintenance_log(
    maintenance_id: int,
    maintenance: schemas.MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a maintenance log - completing maintenance restores vehicle to AVAILABLE"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    return crud.update_maintenance_log(db, maintenance_id, maintenance)
