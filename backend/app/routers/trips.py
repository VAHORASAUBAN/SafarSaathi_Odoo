from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, timezone, date
from .. import models, schemas, auth, rbac

router = APIRouter(prefix="/api/v1/trips", tags=["Trips"])


async def validate_trip_creation(vehicle_id: str, driver_id: str, cargo_weight: float):
    """Validate trip creation against business rules"""
    vehicle = await models.Vehicle.get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if vehicle.status in [models.VehicleStatus.RETIRED, models.VehicleStatus.IN_SHOP]:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle is {vehicle.status.value} and cannot be assigned to trips"
        )
    
    if vehicle.status == models.VehicleStatus.ON_TRIP:
        raise HTTPException(status_code=400, detail="Vehicle is already on a trip")
    
    if cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight ({cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg)"
        )
    
    driver = await models.Driver.get(driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if driver.license_expiry_date < date.today():
        raise HTTPException(status_code=400, detail="Driver license has expired")
    
    if driver.status == models.DriverStatus.SUSPENDED:
        raise HTTPException(status_code=400, detail="Driver is suspended")
    
    if driver.status == models.DriverStatus.ON_TRIP:
        raise HTTPException(status_code=400, detail="Driver is already on a trip")
    
    return vehicle, driver


@router.get("", response_model=List[schemas.TripResponse])
async def get_trips(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.TripStatus] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all trips with optional filters"""
    query = models.Trip.find()
    
    if status:
        query = query.find(models.Trip.status == status)
    if vehicle_id:
        query = query.find(models.Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.find(models.Trip.driver_id == driver_id)
    
    trips = await query.skip(skip).limit(limit).to_list()
    return trips


@router.get("/{trip_id}", response_model=schemas.TripResponse)
async def get_trip(
    trip_id: str,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific trip by ID"""
    trip = await models.Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("", response_model=schemas.TripResponse)
async def create_trip(
    trip: schemas.TripCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new trip (DRAFT status)"""
    auth.check_permission(current_user, [models.UserRole.DISPATCHER, models.UserRole.FLEET_MANAGER])
    
    await validate_trip_creation(trip.vehicle_id, trip.driver_id, trip.cargo_weight)
    
    db_trip = models.Trip(**trip.model_dump(), status=models.TripStatus.DRAFT)
    await db_trip.insert()
    return db_trip


@router.put("/{trip_id}", response_model=schemas.TripResponse)
async def update_trip(
    trip_id: str,
    trip: schemas.TripUpdate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a trip (only DRAFT trips can be updated)"""
    auth.check_permission(current_user, [models.UserRole.DISPATCHER, models.UserRole.FLEET_MANAGER])
    
    db_trip = await models.Trip.get(trip_id)
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if db_trip.status != models.TripStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only update trips in DRAFT status")
    
    update_data = trip.model_dump(exclude_unset=True)
    await db_trip.set(update_data)
    return db_trip


@router.post("/{trip_id}/dispatch", response_model=schemas.TripResponse)
async def dispatch_trip(
    trip_id: str,
    dispatch_data: schemas.TripDispatch,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Dispatch a trip - changes status to DISPATCHED and updates vehicle/driver status to ON_TRIP"""
    auth.check_permission(current_user, [models.UserRole.DISPATCHER, models.UserRole.FLEET_MANAGER])
    
    trip = await models.Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != models.TripStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail=f"Can only dispatch trips in DRAFT status, current: {trip.status.value}"
        )
    
    # Revalidate availability
    vehicle, driver = await validate_trip_creation(trip.vehicle_id, trip.driver_id, trip.cargo_weight)
    
    # Update trip
    trip.status = models.TripStatus.DISPATCHED
    trip.dispatch_time = datetime.now(timezone.utc)
    trip.start_odometer = dispatch_data.start_odometer
    await trip.save()
    
    # Update vehicle and driver status
    vehicle.status = models.VehicleStatus.ON_TRIP
    await vehicle.save()
    
    driver.status = models.DriverStatus.ON_TRIP
    await driver.save()
    
    return trip


@router.post("/{trip_id}/complete", response_model=schemas.TripResponse)
async def complete_trip(
    trip_id: int,
    completion_data: schemas.TripComplete,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Complete a trip - changes status to COMPLETED and updates vehicle/driver status to AVAILABLE"""
    auth.check_permission(current_user, [models.UserRole.DISPATCHER, models.UserRole.FLEET_MANAGER])
    
    trip = await models.Trip.find_one(models.Trip.id == trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != models.TripStatus.DISPATCHED:
        raise HTTPException(
            status_code=400,
            detail=f"Can only complete trips in DISPATCHED status, current: {trip.status.value}"
        )
    
    if completion_data.end_odometer <= trip.start_odometer:
        raise HTTPException(
            status_code=400,
            detail="End odometer must be greater than start odometer"
        )
    
    # Update trip
    trip.status = models.TripStatus.COMPLETED
    trip.completion_time = datetime.now(timezone.utc)
    trip.end_odometer = completion_data.end_odometer
    trip.actual_distance = completion_data.actual_distance
    trip.fuel_consumed = completion_data.fuel_consumed
    await trip.save()
    
    # Update vehicle
    vehicle = await models.Vehicle.get(trip.vehicle_id)
    if vehicle:
        vehicle.odometer = completion_data.end_odometer
        vehicle.status = models.VehicleStatus.AVAILABLE
        await vehicle.save()
    
    # Update driver
    driver = await models.Driver.get(trip.driver_id)
    if driver:
        driver.status = models.DriverStatus.AVAILABLE
        await driver.save()
    
    return trip


@router.post("/{trip_id}/cancel", response_model=schemas.TripResponse)
async def cancel_trip(
    trip_id: str,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Cancel a trip - restores vehicle and driver to AVAILABLE if dispatched"""
    auth.check_permission(current_user, [models.UserRole.DISPATCHER, models.UserRole.FLEET_MANAGER])
    
    trip = await models.Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status in [models.TripStatus.COMPLETED, models.TripStatus.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel trip in {trip.status.value} status"
        )
    
    # If dispatched, restore vehicle and driver status
    if trip.status == models.TripStatus.DISPATCHED:
        vehicle = await models.Vehicle.get(trip.vehicle_id)
        if vehicle:
            vehicle.status = models.VehicleStatus.AVAILABLE
            await vehicle.save()
        
        driver = await models.Driver.get(trip.driver_id)
        if driver:
            driver.status = models.DriverStatus.AVAILABLE
            await driver.save()
    
    trip.status = models.TripStatus.CANCELLED
    await trip.save()
    
    return trip
