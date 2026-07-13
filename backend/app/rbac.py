"""
Role-Based Access Control (RBAC) for API endpoints
"""
from fastapi import HTTPException, status, Depends
from typing import List
from . import models, auth

# RBAC Permissions Matrix
PERMISSIONS = {
    "vehicles": {
        "view": ["admin", "fleet_manager", "dispatcher", "driver", "safety_officer", "financial_analyst"],
        "create": ["admin", "fleet_manager"],
        "edit": ["admin", "fleet_manager"],
        "delete": ["admin", "fleet_manager"],
    },
    "drivers": {
        "view": ["admin", "fleet_manager", "dispatcher", "safety_officer"],
        "create": ["admin", "fleet_manager", "safety_officer"],
        "edit": ["admin", "fleet_manager", "safety_officer"],
        "delete": ["admin", "fleet_manager", "safety_officer"],
    },
    "trips": {
        "view": ["admin", "fleet_manager", "dispatcher", "driver", "safety_officer", "financial_analyst"],
        "create": ["admin", "fleet_manager", "dispatcher"],
        "edit": ["admin", "fleet_manager", "dispatcher"],
        "delete": ["admin", "fleet_manager", "dispatcher"],
    },
    "maintenance": {
        "view": ["admin", "fleet_manager", "safety_officer", "financial_analyst"],
        "create": ["admin", "fleet_manager", "safety_officer"],
        "edit": ["admin", "fleet_manager", "safety_officer"],
        "delete": ["admin", "fleet_manager"],
    },
    "fuel": {
        "view": ["admin", "fleet_manager", "financial_analyst"],
        "create": ["admin", "fleet_manager"],
        "edit": ["admin", "fleet_manager"],
        "delete": ["admin", "fleet_manager"],
    },
    "expenses": {
        "view": ["admin", "fleet_manager", "financial_analyst"],
        "create": ["admin", "fleet_manager"],
        "edit": ["admin", "fleet_manager"],
        "delete": ["admin", "fleet_manager"],
    },
    "dashboard": {
        "view": ["admin", "fleet_manager", "dispatcher", "driver", "safety_officer", "financial_analyst"],
    },
    "analytics": {
        "view": ["admin", "fleet_manager", "safety_officer", "financial_analyst"],
    },
}


def check_permission(resource: str, action: str, user: models.User) -> bool:
    """Check if user has permission for resource action"""
    if not user or not user.role:
        return False
    
    # Admin has all permissions
    if user.role == models.UserRole.ADMIN:
        return True
    
    resource_perms = PERMISSIONS.get(resource, {})
    allowed_roles = resource_perms.get(action, [])
    
    return user.role.value in allowed_roles


def require_permission(resource: str, action: str):
    """Dependency to require specific permission"""
    async def permission_checker(
        current_user: models.User = Depends(auth.get_current_active_user)
    ):
        if not check_permission(resource, action, current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions: {resource}:{action} requires one of {PERMISSIONS.get(resource, {}).get(action, [])} roles"
            )
        return current_user
    
    return permission_checker


# Convenience functions for common permissions
def require_vehicle_view():
    return require_permission("vehicles", "view")

def require_vehicle_create():
    return require_permission("vehicles", "create")

def require_vehicle_edit():
    return require_permission("vehicles", "edit")

def require_vehicle_delete():
    return require_permission("vehicles", "delete")


def require_driver_view():
    return require_permission("drivers", "view")

def require_driver_create():
    return require_permission("drivers", "create")

def require_driver_edit():
    return require_permission("drivers", "edit")

def require_driver_delete():
    return require_permission("drivers", "delete")


def require_trip_view():
    return require_permission("trips", "view")

def require_trip_create():
    return require_permission("trips", "create")

def require_trip_edit():
    return require_permission("trips", "edit")

def require_trip_delete():
    return require_permission("trips", "delete")


def require_maintenance_view():
    return require_permission("maintenance", "view")

def require_maintenance_create():
    return require_permission("maintenance", "create")

def require_maintenance_edit():
    return require_permission("maintenance", "edit")

def require_maintenance_delete():
    return require_permission("maintenance", "delete")


def require_fuel_view():
    return require_permission("fuel", "view")

def require_fuel_create():
    return require_permission("fuel", "create")


def require_expense_view():
    return require_permission("expenses", "view")

def require_expense_create():
    return require_permission("expenses", "create")


def require_dashboard_view():
    return require_permission("dashboard", "view")

def require_analytics_view():
    return require_permission("analytics", "view")
