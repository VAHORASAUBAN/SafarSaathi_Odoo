from beanie import Document, PydanticObjectId
from pydantic import Field, EmailStr, field_serializer
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    FLEET_MANAGER = "fleet_manager"
    DRIVER = "driver"
    DISPATCHER = "dispatcher"
    SAFETY_OFFICER = "safety_officer"
    FINANCIAL_ANALYST = "financial_analyst"
    ADMIN = "admin"


class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    IN_SHOP = "in_shop"
    RETIRED = "retired"


class DriverStatus(str, Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    OFF_DUTY = "off_duty"
    SUSPENDED = "suspended"


class TripStatus(str, Enum):
    DRAFT = "draft"
    DISPATCHED = "dispatched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MaintenanceStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Document):
    username: str = Field(..., unique=True)
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.DRIVER  # Default role
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "User"
        indexes = ["email", "username"]


class Vehicle(Document):
    registration_number: str = Field(..., unique=True)
    vehicle_name: str
    vehicle_type: str
    max_load_capacity: float
    odometer: float
    acquisition_cost: float
    status: VehicleStatus = VehicleStatus.AVAILABLE
    region: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    @field_serializer('id')
    def serialize_id(self, value: PydanticObjectId, _info):
        return str(value)
    
    class Settings:
        name = "vehicles"
        indexes = ["registration_number", "status", "region"]


class Driver(Document):
    name: str
    license_number: str = Field(..., unique=True)
    license_category: str
    license_expiry_date: datetime  # Store as datetime for MongoDB
    contact_number: str
    safety_score: float = 100.0
    status: DriverStatus = DriverStatus.AVAILABLE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "drivers"
        indexes = ["license_number", "status"]


class Trip(Document):
    vehicle_id: Optional[str] = None  # MongoDB ObjectId as string
    driver_id: Optional[str] = None   # MongoDB ObjectId as string
    source: str
    destination: str
    cargo_weight: float
    planned_distance: float
    actual_distance: Optional[float] = None
    start_odometer: Optional[float] = None
    end_odometer: Optional[float] = None
    fuel_consumed: Optional[float] = None
    status: TripStatus = TripStatus.DRAFT
    dispatch_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "trips"
        indexes = ["vehicle_id", "driver_id", "status"]


class MaintenanceLOG(Document):
    vehicle_id: str  # MongoDB ObjectId as string
    maintenance_type: str
    description: Optional[str] = None
    cost: float
    scheduled_date: str  # ISO date string
    completion_date: Optional[str] = None
    odometer_reading: Optional[float] = None
    status: MaintenanceStatus = MaintenanceStatus.SCHEDULED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "maintenance_logs"
        indexes = ["vehicle_id", "status"]


class FuelLog(Document):
    vehicle_id: str  # MongoDB ObjectId as string
    liters: float
    cost: float
    odometer_reading: Optional[float] = None
    fuel_date: str  # ISO date string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "fuel_logs"
        indexes = ["vehicle_id"]


class Expense(Document):
    vehicle_id: str  # MongoDB ObjectId as string
    expense_type: str  # toll, parking, maintenance, other
    description: Optional[str] = None
    amount: float
    expense_date: str  # ISO date string
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "expenses"
        indexes = ["vehicle_id", "expense_type"]
