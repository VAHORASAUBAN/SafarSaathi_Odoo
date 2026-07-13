from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from .. import models, schemas, auth, rbac

router = APIRouter(prefix="/api/v1/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[schemas.VehicleResponse])
async def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.VehicleStatus] = None,
    vehicle_type: Optional[str] = None,
    region: Optional[str] = None,
    current_user: models.User = Depends(rbac.require_vehicle_view())
):
    """Get all vehicles with optional filters"""
    query = models.Vehicle.find()
    
    if status:
        query = query.find(models.Vehicle.status == status)
    if vehicle_type:
        query = query.find(models.Vehicle.vehicle_type == vehicle_type)
    if region:
        query = query.find(models.Vehicle.region == region)
    
    vehicles = await query.skip(skip).limit(limit).to_list()
    return vehicles


@router.get("/available", response_model=List[schemas.VehicleResponse])
async def get_available_vehicles(
    current_user: models.User = Depends(rbac.require_vehicle_view())
):
    """Get vehicles available for dispatch"""
    vehicles = await models.Vehicle.find(
        models.Vehicle.status == models.VehicleStatus.AVAILABLE
    ).to_list()
    return vehicles


@router.get("/{vehicle_id}", response_model=schemas.VehicleResponse)
async def get_vehicle(
    vehicle_id: str,
    current_user: models.User = Depends(rbac.require_vehicle_view())
):
    """Get a specific vehicle by ID"""
    vehicle = await models.Vehicle.get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=schemas.VehicleResponse)
async def create_vehicle(
    vehicle: schemas.VehicleCreate,
    current_user: models.User = Depends(rbac.require_vehicle_create())
):
    """Create a new vehicle"""
    
    # Check if registration number already exists
    existing = await models.Vehicle.find_one(
        models.Vehicle.registration_number == vehicle.registration_number
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Vehicle with this registration number already exists"
        )
    
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    await db_vehicle.insert()
    return db_vehicle


@router.put("/{vehicle_id}", response_model=schemas.VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle: schemas.VehicleUpdate,
    current_user: models.User = Depends(rbac.require_vehicle_edit())
):
    """Update a vehicle"""
    
    db_vehicle = await models.Vehicle.get(vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle.model_dump(exclude_unset=True)
    await db_vehicle.set(update_data)
    return db_vehicle


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    current_user: models.User = Depends(rbac.require_vehicle_delete())
):
    """Delete a vehicle"""
    
    db_vehicle = await models.Vehicle.get(vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    await db_vehicle.delete()
    return {"message": "Vehicle deleted successfully"}


@router.get("/{vehicle_id}/analytics", response_model=schemas.VehicleAnalytics)
async def get_vehicle_analytics(
    vehicle_id: str,
    current_user: models.User = Depends(rbac.require_vehicle_view())
):
    """Get analytics for a specific vehicle"""
    vehicle = await models.Vehicle.get(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Get fuel logs for this vehicle
    fuel_logs = await models.FuelLog.find(
        models.FuelLog.vehicle_id == vehicle_id
    ).to_list()
    total_fuel_cost = sum(log.cost for log in fuel_logs)
    total_fuel_liters = sum(log.liters for log in fuel_logs)
    
    # Get maintenance logs
    maintenance_logs = await models.MaintenanceLog.find(
        models.MaintenanceLog.vehicle_id == vehicle_id
    ).to_list()
    total_maintenance_cost = sum(log.cost for log in maintenance_logs)
    
    # Get expenses
    expenses = await models.Expense.find(
        models.Expense.vehicle_id == vehicle_id
    ).to_list()
    total_other_expenses = sum(exp.amount for exp in expenses)
    
    # Get completed trips
    trips = await models.Trip.find(
        models.Trip.vehicle_id == vehicle_id,
        models.Trip.status == models.TripStatus.COMPLETED
    ).to_list()
    total_distance = sum(trip.actual_distance or 0 for trip in trips)
    
    total_operational_cost = total_fuel_cost + total_maintenance_cost + total_other_expenses
    fuel_efficiency = (total_distance / total_fuel_liters) if total_fuel_liters > 0 else None
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
