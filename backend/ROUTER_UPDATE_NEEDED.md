# Router Update Required

## Issue
All router files still import SQLAlchemy and the old crud.py file. They need to be updated to use Beanie (MongoDB ODM) directly.

## Quick Fix to Start Server

### Option 1: Temporarily Disable Problem Routers

In `app/main.py`, comment out the problematic router imports:

```python
from .routers import auth  # Keep auth only
# from .routers import vehicles, drivers, trips, maintenance, fuel, expenses, dashboard

# Comment out router includes:
# app.include_router(vehicles.router)
# app.include_router(drivers.router)
# app.include_router(trips.router)
# app.include_router(maintenance.router)
# app.include_router(fuel.router)
# app.include_router(expenses.router)
# app.include_router(dashboard.router)
```

This will let the server start, but only `/api/auth` endpoints will work.

### Option 2: Proper Fix - Update Each Router

Each router file needs these changes:

**1. Remove SQLAlchemy imports:**
```python
# Remove:
from sqlalchemy.orm import Session
from ..database import get_db

# Remove:
db: Session = Depends(get_db)
```

**2. Remove crud imports:**
```python
# Remove:
from .. import crud
```

**3. Use Beanie directly:**
```python
# Example for vehicles router:
@router.get("", response_model=List[schemas.VehicleResponse])
async def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.VehicleStatus] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all vehicles with optional filters"""
    query = models.Vehicle.find()
    
    if status:
        query = query.find(models.Vehicle.status == status)
    
    vehicles = await query.skip(skip).limit(limit).to_list()
    return vehicles
```

## Files That Need Updating

1. ✅ `app/auth.py` - Already updated
2. ✅ `app/routers/auth.py` - Already updated  
3. ❌ `app/routers/vehicles.py` - Needs update
4. ❌ `app/routers/drivers.py` - Needs update
5. ❌ `app/routers/trips.py` - Needs update
6. ❌ `app/routers/maintenance.py` - Needs update
7. ❌ `app/routers/fuel.py` - Needs update
8. ❌ `app/routers/expenses.py` - Needs update
9. ❌ `app/routers/dashboard.py` - Needs update

## Pattern for Each Router

### Create Operation:
```python
@router.post("", response_model=schemas.VehicleResponse)
async def create_vehicle(
    vehicle: schemas.VehicleCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if exists
    existing = await models.Vehicle.find_one(
        models.Vehicle.registration_number == vehicle.registration_number
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already exists")
    
    # Create new
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    await db_vehicle.insert()
    return db_vehicle
```

### Read Operations:
```python
@router.get("", response_model=List[schemas.VehicleResponse])
async def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    vehicles = await models.Vehicle.find().skip(skip).limit(limit).to_list()
    return vehicles

@router.get("/{vehicle_id}", response_model=schemas.VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    vehicle = await models.Vehicle.find_one(models.Vehicle.id == vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Not found")
    return vehicle
```

### Update Operation:
```python
@router.put("/{vehicle_id}", response_model=schemas.VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle: schemas.VehicleUpdate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_vehicle = await models.Vehicle.find_one(models.Vehicle.id == vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Not found")
    
    update_data = vehicle.model_dump(exclude_unset=True)
    await db_vehicle.set(update_data)
    return db_vehicle
```

### Delete Operation:
```python
@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_vehicle = await models.Vehicle.find_one(models.Vehicle.id == vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Not found")
    
    await db_vehicle.delete()
    return {"message": "Deleted successfully"}
```

## Recommended Action

**Quick Start:** Use Option 1 above to get the server running with just auth endpoints.

**Complete Fix:** I can update all routers in the next response if you'd like - it will take one more iteration to convert all 7 router files to use Beanie properly.

Let me know if you want me to continue with the router updates!
