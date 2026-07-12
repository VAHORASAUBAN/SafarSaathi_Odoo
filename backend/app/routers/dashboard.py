from fastapi import APIRouter, Depends
from typing import List
from .. import models, schemas, auth

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=schemas.DashboardKPIs)
async def get_dashboard_kpis(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get dashboard KPIs"""
    # Count vehicles by status
    active_vehicles_count = await models.Vehicle.find(
        models.Vehicle.status.in_([models.VehicleStatus.AVAILABLE, models.VehicleStatus.ON_TRIP])
    ).count()
    
    available_vehicles_count = await models.Vehicle.find(
        models.Vehicle.status == models.VehicleStatus.AVAILABLE
    ).count()
    
    vehicles_in_maintenance_count = await models.Vehicle.find(
        models.Vehicle.status == models.VehicleStatus.IN_SHOP
    ).count()
    
    # Count trips by status
    active_trips_count = await models.Trip.find(
        models.Trip.status == models.TripStatus.DISPATCHED
    ).count()
    
    pending_trips_count = await models.Trip.find(
        models.Trip.status == models.TripStatus.DRAFT
    ).count()
    
    # Count drivers on duty
    drivers_on_duty_count = await models.Driver.find(
        models.Driver.status.in_([models.DriverStatus.AVAILABLE, models.DriverStatus.ON_TRIP])
    ).count()
    
    # Calculate fleet utilization
    total_vehicles = await models.Vehicle.find(
        models.Vehicle.status != models.VehicleStatus.RETIRED
    ).count()
    
    vehicles_in_use = await models.Vehicle.find(
        models.Vehicle.status == models.VehicleStatus.ON_TRIP
    ).count()
    
    fleet_utilization = (vehicles_in_use / total_vehicles * 100) if total_vehicles > 0 else 0.0
    
    return schemas.DashboardKPIs(
        active_vehicles=active_vehicles_count,
        available_vehicles=available_vehicles_count,
        vehicles_in_maintenance=vehicles_in_maintenance_count,
        active_trips=active_trips_count,
        pending_trips=pending_trips_count,
        drivers_on_duty=drivers_on_duty_count,
        fleet_utilization=round(fleet_utilization, 2)
    )


@router.get("/analytics", response_model=schemas.FleetAnalytics)
async def get_fleet_analytics(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get fleet-wide analytics"""
    # Get all completed trips
    completed_trips = await models.Trip.find(
        models.Trip.status == models.TripStatus.COMPLETED
    ).to_list()
    
    total_distance = sum(trip.actual_distance or 0 for trip in completed_trips)
    
    # Get all fuel logs
    fuel_logs = await models.FuelLog.find().to_list()
    total_fuel_liters = sum(log.liters for log in fuel_logs)
    total_fuel_cost = sum(log.cost for log in fuel_logs)
    
    # Calculate average fuel efficiency
    average_fuel_efficiency = (total_distance / total_fuel_liters) if total_fuel_liters > 0 else 0.0
    
    # Get maintenance and expenses
    maintenance_logs = await models.MaintenanceLog.find().to_list()
    total_maintenance_cost = sum(log.cost for log in maintenance_logs)
    
    expenses = await models.Expense.find().to_list()
    total_expenses = sum(exp.amount for exp in expenses)
    
    total_operational_cost = total_fuel_cost + total_maintenance_cost + total_expenses
    
    # Fleet utilization
    total_vehicles = await models.Vehicle.find(
        models.Vehicle.status != models.VehicleStatus.RETIRED
    ).count()
    
    vehicles_in_use = await models.Vehicle.find(
        models.Vehicle.status == models.VehicleStatus.ON_TRIP
    ).count()
    
    fleet_utilization = (vehicles_in_use / total_vehicles * 100) if total_vehicles > 0 else 0.0
    
    return schemas.FleetAnalytics(
        total_distance_covered=round(total_distance, 2),
        average_fuel_efficiency=round(average_fuel_efficiency, 2),
        total_operational_cost=round(total_operational_cost, 2),
        fleet_utilization=round(fleet_utilization, 2)
    )
