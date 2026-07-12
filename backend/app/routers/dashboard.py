from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud, auth
from ..database import get_db
import csv
import io

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=schemas.DashboardKPIs)
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get dashboard KPIs"""
    return crud.get_dashboard_kpis(db)


@router.get("/analytics", response_model=schemas.FleetAnalytics)
def get_fleet_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get fleet-wide analytics"""
    return crud.get_fleet_analytics(db)


@router.get("/analytics/export")
def export_analytics_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Export fleet analytics to CSV"""
    auth.check_permission(current_user, [
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    
    from sqlalchemy import func
    
    # Get all vehicles
    vehicles = db.query(models.Vehicle).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        'Vehicle ID',
        'Registration Number',
        'Vehicle Name',
        'Type',
        'Status',
        'Region',
        'Max Capacity (kg)',
        'Current Odometer (km)',
        'Acquisition Cost',
        'Total Distance (km)',
        'Total Trips',
        'Completed Trips',
        'Active Trips',
        'Fuel Efficiency (km/L)',
        'Total Fuel Cost',
        'Total Maintenance Cost',
        'Total Expenses',
        'Total Operational Cost',
        'Vehicle ROI (%)'
    ])
    
    # Write data for each vehicle
    for vehicle in vehicles:
        # Get analytics
        analytics = crud.get_vehicle_analytics(db, vehicle.id)
        
        # Calculate total distance
        total_distance = db.query(func.sum(models.Trip.actual_distance)).filter(
            models.Trip.vehicle_id == vehicle.id,
            models.Trip.status == models.TripStatus.COMPLETED
        ).scalar() or 0.0
        
        # Count trips
        total_trips = db.query(models.Trip).filter(
            models.Trip.vehicle_id == vehicle.id
        ).count()
        
        completed_trips = db.query(models.Trip).filter(
            models.Trip.vehicle_id == vehicle.id,
            models.Trip.status == models.TripStatus.COMPLETED
        ).count()
        
        active_trips = db.query(models.Trip).filter(
            models.Trip.vehicle_id == vehicle.id,
            models.Trip.status == models.TripStatus.DISPATCHED
        ).count()
        
        # Get total other expenses
        total_expenses = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.vehicle_id == vehicle.id
        ).scalar() or 0.0
        
        writer.writerow([
            vehicle.id,
            vehicle.registration_number,
            vehicle.vehicle_name,
            vehicle.vehicle_type,
            vehicle.status.value,
            vehicle.region or 'N/A',
            vehicle.max_load_capacity,
            round(vehicle.odometer, 2),
            vehicle.acquisition_cost,
            round(total_distance, 2),
            total_trips,
            completed_trips,
            active_trips,
            round(analytics.fuel_efficiency, 2) if analytics.fuel_efficiency else 'N/A',
            round(analytics.total_fuel_cost, 2),
            round(analytics.total_maintenance_cost, 2),
            round(total_expenses, 2),
            round(analytics.total_operational_cost, 2),
            round(analytics.vehicle_roi, 2) if analytics.vehicle_roi else 'N/A'
        ])
    
    # Return CSV response
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fleet_analytics.csv"}
    )


@router.get("/analytics/trips/export")
def export_trips_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Export all trips to CSV"""
    auth.check_permission(current_user, [
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    
    # Get all trips
    trips = db.query(models.Trip).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        'Trip ID',
        'Vehicle Reg Number',
        'Driver Name',
        'Source',
        'Destination',
        'Status',
        'Cargo Weight (kg)',
        'Planned Distance (km)',
        'Actual Distance (km)',
        'Fuel Consumed (L)',
        'Fuel Efficiency (km/L)',
        'Start Odometer',
        'End Odometer',
        'Dispatch Time',
        'Completion Time',
        'Created At'
    ])
    
    # Write data for each trip
    for trip in trips:
        fuel_efficiency = (trip.actual_distance / trip.fuel_consumed) if trip.fuel_consumed and trip.actual_distance else 'N/A'
        if isinstance(fuel_efficiency, float):
            fuel_efficiency = round(fuel_efficiency, 2)
        
        writer.writerow([
            trip.id,
            trip.vehicle.registration_number,
            trip.driver.name,
            trip.source,
            trip.destination,
            trip.status.value,
            trip.cargo_weight,
            trip.planned_distance,
            trip.actual_distance or 'N/A',
            trip.fuel_consumed or 'N/A',
            fuel_efficiency,
            trip.start_odometer or 'N/A',
            trip.end_odometer or 'N/A',
            trip.dispatch_time or 'N/A',
            trip.completion_time or 'N/A',
            trip.created_at
        ])
    
    # Return CSV response
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=trips_export.csv"}
    )
