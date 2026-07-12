from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/trips", tags=["Trips"])


@router.get("", response_model=List[schemas.TripResponse])
def get_trips(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.TripStatus] = None,
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all trips with optional filters"""
    trips = crud.get_trips(
        db, skip=skip, limit=limit, status=status,
        vehicle_id=vehicle_id, driver_id=driver_id
    )
    return trips


@router.get("/{trip_id}", response_model=schemas.TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific trip by ID"""
    trip = crud.get_trip(db, trip_id)
    if not trip:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("", response_model=schemas.TripResponse)
def create_trip(
    trip: schemas.TripCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new trip (DRAFT status)"""
    auth.check_permission(current_user, [models.UserRole.DRIVER, models.UserRole.FLEET_MANAGER])
    return crud.create_trip(db, trip)


@router.put("/{trip_id}", response_model=schemas.TripResponse)
def update_trip(
    trip_id: int,
    trip: schemas.TripUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a trip (only DRAFT trips can be updated)"""
    auth.check_permission(current_user, [models.UserRole.DRIVER, models.UserRole.FLEET_MANAGER])
    return crud.update_trip(db, trip_id, trip)


@router.post("/{trip_id}/dispatch", response_model=schemas.TripResponse)
def dispatch_trip(
    trip_id: int,
    dispatch_data: schemas.TripDispatch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Dispatch a trip - changes status to DISPATCHED and updates vehicle/driver status to ON_TRIP"""
    auth.check_permission(current_user, [models.UserRole.DRIVER, models.UserRole.FLEET_MANAGER])
    return crud.dispatch_trip(db, trip_id, dispatch_data)


@router.post("/{trip_id}/complete", response_model=schemas.TripResponse)
def complete_trip(
    trip_id: int,
    completion_data: schemas.TripComplete,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Complete a trip - changes status to COMPLETED and updates vehicle/driver status to AVAILABLE"""
    auth.check_permission(current_user, [models.UserRole.DRIVER, models.UserRole.FLEET_MANAGER])
    return crud.complete_trip(db, trip_id, completion_data)


@router.post("/{trip_id}/cancel", response_model=schemas.TripResponse)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Cancel a trip - restores vehicle and driver to AVAILABLE if dispatched"""
    auth.check_permission(current_user, [models.UserRole.DRIVER, models.UserRole.FLEET_MANAGER])
    return crud.cancel_trip(db, trip_id)
