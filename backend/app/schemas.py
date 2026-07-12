from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, date
from typing import Optional
from .models import UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.DRIVER


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: str  # MongoDB ObjectId as string
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str  # Changed from email to username
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Vehicle Schemas
class VehicleBase(BaseModel):
    registration_number: str
    vehicle_name: str
    vehicle_type: str
    max_load_capacity: float = Field(..., gt=0)
    odometer: float = Field(default=0.0, ge=0)
    acquisition_cost: float = Field(..., gt=0)
    region: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_load_capacity: Optional[float] = Field(None, gt=0)
    odometer: Optional[float] = Field(None, ge=0)
    acquisition_cost: Optional[float] = Field(None, gt=0)
    status: Optional[VehicleStatus] = None
    region: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: int
    status: VehicleStatus
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Driver Schemas
class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float = Field(default=100.0, ge=0, le=100)


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[DriverStatus] = None


class DriverResponse(DriverBase):
    id: int
    status: DriverStatus
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Trip Schemas
class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    source: str
    destination: str
    cargo_weight: float = Field(..., gt=0)
    planned_distance: float = Field(..., gt=0)


class TripCreate(TripBase):
    pass


class TripDispatch(BaseModel):
    start_odometer: float = Field(..., ge=0)


class TripComplete(BaseModel):
    end_odometer: float = Field(..., ge=0)
    actual_distance: float = Field(..., gt=0)
    fuel_consumed: float = Field(..., gt=0)


class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_weight: Optional[float] = Field(None, gt=0)
    planned_distance: Optional[float] = Field(None, gt=0)


class TripResponse(TripBase):
    id: int
    actual_distance: Optional[float]
    start_odometer: Optional[float]
    end_odometer: Optional[float]
    fuel_consumed: Optional[float]
    status: TripStatus
    dispatch_time: Optional[datetime]
    completion_time: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    vehicle: VehicleResponse
    driver: DriverResponse
    
    class Config:
        from_attributes = True


# Maintenance Schemas
class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    maintenance_type: str
    description: Optional[str] = None
    cost: float = Field(..., ge=0)
    scheduled_date: date
    odometer_reading: Optional[float] = Field(None, ge=0)


class MaintenanceLogCreate(MaintenanceLogBase):
    pass


class MaintenanceLogUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = Field(None, ge=0)
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    odometer_reading: Optional[float] = Field(None, ge=0)
    status: Optional[MaintenanceStatus] = None


class MaintenanceLogResponse(MaintenanceLogBase):
    id: int
    completion_date: Optional[date]
    status: MaintenanceStatus
    created_at: datetime
    updated_at: Optional[datetime]
    vehicle: VehicleResponse
    
    class Config:
        from_attributes = True


# Fuel Log Schemas
class FuelLogBase(BaseModel):
    vehicle_id: int
    liters: float = Field(..., gt=0)
    cost: float = Field(..., gt=0)
    odometer_reading: float = Field(..., ge=0)
    fuel_date: date


class FuelLogCreate(FuelLogBase):
    pass


class FuelLogResponse(FuelLogBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseBase(BaseModel):
    vehicle_id: int
    expense_type: str
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    expense_date: date


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardKPIs(BaseModel):
    active_vehicles: int
    available_vehicles: int
    vehicles_in_maintenance: int
    active_trips: int
    pending_trips: int
    drivers_on_duty: int
    fleet_utilization: float


class VehicleAnalytics(BaseModel):
    vehicle_id: int
    registration_number: str
    vehicle_name: str
    fuel_efficiency: Optional[float]  # km per liter
    total_operational_cost: float
    total_fuel_cost: float
    total_maintenance_cost: float
    vehicle_roi: Optional[float]


class FleetAnalytics(BaseModel):
    total_distance_covered: float
    average_fuel_efficiency: float
    total_operational_cost: float
    fleet_utilization: float
