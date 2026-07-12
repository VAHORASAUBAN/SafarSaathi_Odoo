from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status
from datetime import date, datetime
from typing import Optional, List
from . import models, schemas


# Vehicle CRUD
def get_vehicle(db: Session, vehicle_id: int):
    return db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()


def get_vehicle_by_registration(db: Session, registration_number: str):
    return db.query(models.Vehicle).filter(
        models.Vehicle.registration_number == registration_number
    ).first()


def get_vehicles(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.VehicleStatus] = None,
    vehicle_type: Optional[str] = None,
    region: Optional[str] = None
):
    query = db.query(models.Vehicle)
    
    if status:
        query = query.filter(models.Vehicle.status == status)
    if vehicle_type:
        query = query.filter(models.Vehicle.vehicle_type == vehicle_type)
    if region:
        query = query.filter(models.Vehicle.region == region)
    
    return query.offset(skip).limit(limit).all()


def create_vehicle(db: Session, vehicle: schemas.VehicleCreate):
    # Check if registration number already exists
    existing = get_vehicle_by_registration(db, vehicle.registration_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle with this registration number already exists"
        )
    
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


def update_vehicle(db: Session, vehicle_id: int, vehicle: schemas.VehicleUpdate):
    db_vehicle = get_vehicle(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vehicle, field, value)
    
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


def delete_vehicle(db: Session, vehicle_id: int):
    db_vehicle = get_vehicle(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(db_vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}


# Driver CRUD
def get_driver(db: Session, driver_id: int):
    return db.query(models.Driver).filter(models.Driver.id == driver_id).first()


def get_driver_by_license(db: Session, license_number: str):
    return db.query(models.Driver).filter(
        models.Driver.license_number == license_number
    ).first()


def get_drivers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.DriverStatus] = None
):
    query = db.query(models.Driver)
    
    if status:
        query = query.filter(models.Driver.status == status)
    
    return query.offset(skip).limit(limit).all()


def create_driver(db: Session, driver: schemas.DriverCreate):
    # Check if license number already exists
    existing = get_driver_by_license(db, driver.license_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver with this license number already exists"
        )
    
    db_driver = models.Driver(**driver.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver


def update_driver(db: Session, driver_id: int, driver: schemas.DriverUpdate):
    db_driver = get_driver(db, driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_driver, field, value)
    
    db.commit()
    db.refresh(db_driver)
    return db_driver


def delete_driver(db: Session, driver_id: int):
    db_driver = get_driver(db, driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    db.delete(db_driver)
    db.commit()
    return {"message": "Driver deleted successfully"}


def is_driver_available(db: Session, driver_id: int) -> bool:
    """Check if driver is available for trip assignment"""
    driver = get_driver(db, driver_id)
    if not driver:
        return False
    
    # Driver must be Available status
    if driver.status != models.DriverStatus.AVAILABLE:
        return False
    
    # License must not be expired
    if driver.license_expiry_date < date.today():
        return False
    
    return True


# Trip CRUD and Business Logic
def validate_trip_creation(
    db: Session,
    vehicle_id: int,
    driver_id: int,
    cargo_weight: float
):
    """Validate trip creation against business rules"""
    # Check vehicle exists and is available
    vehicle = get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Retired or In Shop vehicles cannot be assigned
    if vehicle.status in [models.VehicleStatus.RETIRED, models.VehicleStatus.IN_SHOP]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle is {vehicle.status.value} and cannot be assigned to trips"
        )
    
    # Vehicle already on trip
    if vehicle.status == models.VehicleStatus.ON_TRIP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle is already on a trip"
        )
    
    # Check cargo weight
    if cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cargo weight ({cargo_weight} kg) exceeds vehicle maximum capacity ({vehicle.max_load_capacity} kg)"
        )
    
    # Check driver exists and is available
    driver = get_driver(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check license expiry
    if driver.license_expiry_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver license has expired"
        )
    
    # Driver suspended
    if driver.status == models.DriverStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver is suspended and cannot be assigned"
        )
    
    # Driver already on trip
    if driver.status == models.DriverStatus.ON_TRIP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver is already on a trip"
        )
    
    return vehicle, driver


def create_trip(db: Session, trip: schemas.TripCreate):
    """Create a new trip with validation"""
    vehicle, driver = validate_trip_creation(
        db, trip.vehicle_id, trip.driver_id, trip.cargo_weight
    )
    
    db_trip = models.Trip(**trip.model_dump(), status=models.TripStatus.DRAFT)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


def dispatch_trip(db: Session, trip_id: int, dispatch_data: schemas.TripDispatch):
    """Dispatch a trip - changes status to DISPATCHED and updates vehicle/driver status"""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != models.TripStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only dispatch trips in DRAFT status, current status: {trip.status.value}"
        )
    
    # Revalidate vehicle and driver availability
    vehicle, driver = validate_trip_creation(
        db, trip.vehicle_id, trip.driver_id, trip.cargo_weight
    )
    
    # Update trip
    trip.status = models.TripStatus.DISPATCHED
    trip.dispatch_time = datetime.utcnow()
    trip.start_odometer = dispatch_data.start_odometer
    
    # Update vehicle and driver status to ON_TRIP
    vehicle.status = models.VehicleStatus.ON_TRIP
    driver.status = models.DriverStatus.ON_TRIP
    
    db.commit()
    db.refresh(trip)
    return trip


def complete_trip(db: Session, trip_id: int, completion_data: schemas.TripComplete):
    """Complete a trip - changes status to COMPLETED and updates vehicle/driver status back to AVAILABLE"""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != models.TripStatus.DISPATCHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only complete trips in DISPATCHED status, current status: {trip.status.value}"
        )
    
    # Validate end odometer is greater than start
    if completion_data.end_odometer <= trip.start_odometer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End odometer must be greater than start odometer"
        )
    
    # Update trip
    trip.status = models.TripStatus.COMPLETED
    trip.completion_time = datetime.utcnow()
    trip.end_odometer = completion_data.end_odometer
    trip.actual_distance = completion_data.actual_distance
    trip.fuel_consumed = completion_data.fuel_consumed
    
    # Update vehicle odometer and status
    vehicle = get_vehicle(db, trip.vehicle_id)
    vehicle.odometer = completion_data.end_odometer
    vehicle.status = models.VehicleStatus.AVAILABLE
    
    # Update driver status back to AVAILABLE
    driver = get_driver(db, trip.driver_id)
    driver.status = models.DriverStatus.AVAILABLE
    
    db.commit()
    db.refresh(trip)
    return trip


def cancel_trip(db: Session, trip_id: int):
    """Cancel a trip - restores vehicle and driver to AVAILABLE if dispatched"""
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status in [models.TripStatus.COMPLETED, models.TripStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel trip in {trip.status.value} status"
        )
    
    # If trip was dispatched, restore vehicle and driver status
    if trip.status == models.TripStatus.DISPATCHED:
        vehicle = get_vehicle(db, trip.vehicle_id)
        vehicle.status = models.VehicleStatus.AVAILABLE
        
        driver = get_driver(db, trip.driver_id)
        driver.status = models.DriverStatus.AVAILABLE
    
    trip.status = models.TripStatus.CANCELLED
    
    db.commit()
    db.refresh(trip)
    return trip


def get_trips(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.TripStatus] = None,
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None
):
    query = db.query(models.Trip)
    
    if status:
        query = query.filter(models.Trip.status == status)
    if vehicle_id:
        query = query.filter(models.Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(models.Trip.driver_id == driver_id)
    
    return query.offset(skip).limit(limit).all()


def get_trip(db: Session, trip_id: int):
    return db.query(models.Trip).filter(models.Trip.id == trip_id).first()


def update_trip(db: Session, trip_id: int, trip: schemas.TripUpdate):
    """Update trip - only allowed for DRAFT trips"""
    db_trip = get_trip(db, trip_id)
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if db_trip.status != models.TripStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update trips in DRAFT status"
        )
    
    update_data = trip.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_trip, field, value)
    
    db.commit()
    db.refresh(db_trip)
    return db_trip


# Maintenance CRUD and Business Logic
def create_maintenance_log(db: Session, maintenance: schemas.MaintenanceLogCreate):
    """Create maintenance log - automatically sets vehicle to IN_SHOP if scheduled or in progress"""
    vehicle = get_vehicle(db, maintenance.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_maintenance = models.MaintenanceLog(**maintenance.model_dump())
    
    # If maintenance is scheduled or in progress, set vehicle to IN_SHOP
    if db_maintenance.status in [models.MaintenanceStatus.SCHEDULED, models.MaintenanceStatus.IN_PROGRESS]:
        vehicle.status = models.VehicleStatus.IN_SHOP
    
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance


def update_maintenance_log(db: Session, maintenance_id: int, maintenance: schemas.MaintenanceLogUpdate):
    """Update maintenance log"""
    db_maintenance = db.query(models.MaintenanceLog).filter(
        models.MaintenanceLog.id == maintenance_id
    ).first()
    if not db_maintenance:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    
    update_data = maintenance.model_dump(exclude_unset=True)
    
    # Handle status changes
    if "status" in update_data:
        new_status = update_data["status"]
        vehicle = get_vehicle(db, db_maintenance.vehicle_id)
        
        # If completing or cancelling maintenance, restore vehicle to AVAILABLE (unless retired)
        if new_status in [models.MaintenanceStatus.COMPLETED, models.MaintenanceStatus.CANCELLED]:
            if vehicle.status != models.VehicleStatus.RETIRED:
                vehicle.status = models.VehicleStatus.AVAILABLE
        
        # If starting maintenance, set vehicle to IN_SHOP
        elif new_status == models.MaintenanceStatus.IN_PROGRESS:
            vehicle.status = models.VehicleStatus.IN_SHOP
    
    for field, value in update_data.items():
        setattr(db_maintenance, field, value)
    
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance


def get_maintenance_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    status: Optional[models.MaintenanceStatus] = None
):
    query = db.query(models.MaintenanceLog)
    
    if vehicle_id:
        query = query.filter(models.MaintenanceLog.vehicle_id == vehicle_id)
    if status:
        query = query.filter(models.MaintenanceLog.status == status)
    
    return query.offset(skip).limit(limit).all()


def get_maintenance_log(db: Session, maintenance_id: int):
    return db.query(models.MaintenanceLog).filter(
        models.MaintenanceLog.id == maintenance_id
    ).first()


# Fuel Log CRUD
def create_fuel_log(db: Session, fuel_log: schemas.FuelLogCreate):
    vehicle = get_vehicle(db, fuel_log.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_fuel_log = models.FuelLog(**fuel_log.model_dump())
    db.add(db_fuel_log)
    db.commit()
    db.refresh(db_fuel_log)
    return db_fuel_log


def get_fuel_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None
):
    query = db.query(models.FuelLog)
    
    if vehicle_id:
        query = query.filter(models.FuelLog.vehicle_id == vehicle_id)
    
    return query.offset(skip).limit(limit).all()


# Expense CRUD
def create_expense(db: Session, expense: schemas.ExpenseCreate):
    vehicle = get_vehicle(db, expense.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    expense_type: Optional[str] = None
):
    query = db.query(models.Expense)
    
    if vehicle_id:
        query = query.filter(models.Expense.vehicle_id == vehicle_id)
    if expense_type:
        query = query.filter(models.Expense.expense_type == expense_type)
    
    return query.offset(skip).limit(limit).all()


# Dashboard and Analytics
def get_dashboard_kpis(db: Session) -> schemas.DashboardKPIs:
    """Calculate and return dashboard KPIs"""
    active_vehicles = db.query(models.Vehicle).filter(
        models.Vehicle.status.in_([
            models.VehicleStatus.AVAILABLE,
            models.VehicleStatus.ON_TRIP
        ])
    ).count()
    
    available_vehicles = db.query(models.Vehicle).filter(
        models.Vehicle.status == models.VehicleStatus.AVAILABLE
    ).count()
    
    vehicles_in_maintenance = db.query(models.Vehicle).filter(
        models.Vehicle.status == models.VehicleStatus.IN_SHOP
    ).count()
    
    active_trips = db.query(models.Trip).filter(
        models.Trip.status == models.TripStatus.DISPATCHED
    ).count()
    
    pending_trips = db.query(models.Trip).filter(
        models.Trip.status == models.TripStatus.DRAFT
    ).count()
    
    drivers_on_duty = db.query(models.Driver).filter(
        models.Driver.status.in_([
            models.DriverStatus.AVAILABLE,
            models.DriverStatus.ON_TRIP
        ])
    ).count()
    
    total_vehicles = db.query(models.Vehicle).filter(
        models.Vehicle.status != models.VehicleStatus.RETIRED
    ).count()
    
    vehicles_in_use = db.query(models.Vehicle).filter(
        models.Vehicle.status == models.VehicleStatus.ON_TRIP
    ).count()
    
    fleet_utilization = (vehicles_in_use / total_vehicles * 100) if total_vehicles > 0 else 0.0
    
    return schemas.DashboardKPIs(
        active_vehicles=active_vehicles,
        available_vehicles=available_vehicles,
        vehicles_in_maintenance=vehicles_in_maintenance,
        active_trips=active_trips,
        pending_trips=pending_trips,
        drivers_on_duty=drivers_on_duty,
        fleet_utilization=round(fleet_utilization, 2)
    )


def get_vehicle_analytics(db: Session, vehicle_id: int) -> schemas.VehicleAnalytics:
    """Get analytics for a specific vehicle"""
    vehicle = get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Get total fuel cost
    total_fuel_cost = db.query(func.sum(models.FuelLog.cost)).filter(
        models.FuelLog.vehicle_id == vehicle_id
    ).scalar() or 0.0
    
    # Get total maintenance cost
    total_maintenance_cost = db.query(func.sum(models.MaintenanceLog.cost)).filter(
        models.MaintenanceLog.vehicle_id == vehicle_id
    ).scalar() or 0.0
    
    # Get total other expenses
    total_other_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.vehicle_id == vehicle_id
    ).scalar() or 0.0
    
    total_operational_cost = total_fuel_cost + total_maintenance_cost + total_other_expenses
    
    # Calculate fuel efficiency (total distance / total fuel)
    total_fuel = db.query(func.sum(models.FuelLog.liters)).filter(
        models.FuelLog.vehicle_id == vehicle_id
    ).scalar() or 0.0
    
    total_distance = db.query(func.sum(models.Trip.actual_distance)).filter(
        models.Trip.vehicle_id == vehicle_id,
        models.Trip.status == models.TripStatus.COMPLETED
    ).scalar() or 0.0
    
    fuel_efficiency = (total_distance / total_fuel) if total_fuel > 0 else None
    
    # Calculate ROI (simplified - assumes revenue tracking would be added)
    # ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    # For now, we'll calculate as negative cost ratio since we don't track revenue
    vehicle_roi = -(total_operational_cost / vehicle.acquisition_cost) if vehicle.acquisition_cost > 0 else None
    
    return schemas.VehicleAnalytics(
        vehicle_id=vehicle.id,
        registration_number=vehicle.registration_number,
        vehicle_name=vehicle.vehicle_name,
        fuel_efficiency=round(fuel_efficiency, 2) if fuel_efficiency else None,
        total_operational_cost=round(total_operational_cost, 2),
        total_fuel_cost=round(total_fuel_cost, 2),
        total_maintenance_cost=round(total_maintenance_cost, 2),
        vehicle_roi=round(vehicle_roi * 100, 2) if vehicle_roi else None
    )


def get_fleet_analytics(db: Session) -> schemas.FleetAnalytics:
    """Get overall fleet analytics"""
    # Total distance covered by all completed trips
    total_distance = db.query(func.sum(models.Trip.actual_distance)).filter(
        models.Trip.status == models.TripStatus.COMPLETED
    ).scalar() or 0.0
    
    # Total fuel consumed
    total_fuel = db.query(func.sum(models.FuelLog.liters)).scalar() or 0.0
    
    # Average fuel efficiency
    average_fuel_efficiency = (total_distance / total_fuel) if total_fuel > 0 else 0.0
    
    # Total operational cost (fuel + maintenance + expenses)
    total_fuel_cost = db.query(func.sum(models.FuelLog.cost)).scalar() or 0.0
    total_maintenance_cost = db.query(func.sum(models.MaintenanceLog.cost)).scalar() or 0.0
    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0.0
    total_operational_cost = total_fuel_cost + total_maintenance_cost + total_expenses
    
    # Fleet utilization
    total_vehicles = db.query(models.Vehicle).filter(
        models.Vehicle.status != models.VehicleStatus.RETIRED
    ).count()
    
    vehicles_in_use = db.query(models.Vehicle).filter(
        models.Vehicle.status == models.VehicleStatus.ON_TRIP
    ).count()
    
    fleet_utilization = (vehicles_in_use / total_vehicles * 100) if total_vehicles > 0 else 0.0
    
    return schemas.FleetAnalytics(
        total_distance_covered=round(total_distance, 2),
        average_fuel_efficiency=round(average_fuel_efficiency, 2),
        total_operational_cost=round(total_operational_cost, 2),
        fleet_utilization=round(fleet_utilization, 2)
    )


def get_available_vehicles(db: Session) -> List[models.Vehicle]:
    """Get vehicles available for dispatch (Available status only)"""
    return db.query(models.Vehicle).filter(
        models.Vehicle.status == models.VehicleStatus.AVAILABLE
    ).all()


def get_available_drivers(db: Session) -> List[models.Driver]:
    """Get drivers available for dispatch (Available status and valid license)"""
    return db.query(models.Driver).filter(
        and_(
            models.Driver.status == models.DriverStatus.AVAILABLE,
            models.Driver.license_expiry_date >= date.today()
        )
    ).all()
