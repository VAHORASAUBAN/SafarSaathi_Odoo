from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[schemas.VehicleResponse])
def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.VehicleStatus] = None,
    vehicle_type: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all vehicles with optional filters"""
    vehicles = crud.get_vehicles(
        db, skip=skip, limit=limit, status=status,
        vehicle_type=vehicle_type, region=region
    )
    return vehicles


@router.get("/available", response_model=List[schemas.VehicleResponse])
def get_available_vehicles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get vehicles available for dispatch"""
    return crud.get_available_vehicles(db)


@router.get("/{vehicle_id}", response_model=schemas.VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific vehicle by ID"""
    vehicle = crud.get_vehicle(db, vehicle_id)
    if not vehicle:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=schemas.VehicleResponse)
def create_vehicle(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new vehicle"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    return crud.create_vehicle(db, vehicle)


@router.put("/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle: schemas.VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a vehicle"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    return crud.update_vehicle(db, vehicle_id, vehicle)


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a vehicle"""
    auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER])
    return crud.delete_vehicle(db, vehicle_id)


@router.get("/{vehicle_id}/analytics", response_model=schemas.VehicleAnalytics)
def get_vehicle_analytics(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get analytics for a specific vehicle"""
    return crud.get_vehicle_analytics(db, vehicle_id)
