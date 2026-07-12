"""
Seed script to populate database with sample data
Run with: python seed_data.py
"""
from datetime import date, timedelta
from app.database import SessionLocal
from app import models
from app.auth import get_password_hash


def seed_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print("Database already has data. Skipping seed.")
            return
        
        print("Seeding database with sample data...")
        
        # Create users
        users = [
            models.User(
                email="admin@transitops.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                role=models.UserRole.ADMIN,
                is_active=True
            ),
            models.User(
                email="fleet@transitops.com",
                hashed_password=get_password_hash("fleet123"),
                full_name="Fleet Manager",
                role=models.UserRole.FLEET_MANAGER,
                is_active=True
            ),
            models.User(
                email="driver@transitops.com",
                hashed_password=get_password_hash("driver123"),
                full_name="John Driver",
                role=models.UserRole.DRIVER,
                is_active=True
            ),
            models.User(
                email="safety@transitops.com",
                hashed_password=get_password_hash("safety123"),
                full_name="Safety Officer",
                role=models.UserRole.SAFETY_OFFICER,
                is_active=True
            ),
            models.User(
                email="analyst@transitops.com",
                hashed_password=get_password_hash("analyst123"),
                full_name="Financial Analyst",
                role=models.UserRole.FINANCIAL_ANALYST,
                is_active=True
            )
        ]
        db.add_all(users)
        db.commit()
        print(f"✓ Created {len(users)} users")
        
        # Create vehicles
        vehicles = [
            models.Vehicle(
                registration_number="VAN-001",
                vehicle_name="Delivery Van Alpha",
                vehicle_type="Van",
                max_load_capacity=500.0,
                odometer=15000.0,
                acquisition_cost=25000.0,
                status=models.VehicleStatus.AVAILABLE,
                region="North"
            ),
            models.Vehicle(
                registration_number="TRUCK-001",
                vehicle_name="Heavy Truck Beta",
                vehicle_type="Truck",
                max_load_capacity=2000.0,
                odometer=45000.0,
                acquisition_cost=65000.0,
                status=models.VehicleStatus.AVAILABLE,
                region="South"
            ),
            models.Vehicle(
                registration_number="VAN-002",
                vehicle_name="Delivery Van Gamma",
                vehicle_type="Van",
                max_load_capacity=450.0,
                odometer=8000.0,
                acquisition_cost=23000.0,
                status=models.VehicleStatus.ON_TRIP,
                region="East"
            ),
            models.Vehicle(
                registration_number="PICKUP-001",
                vehicle_name="Pickup Delta",
                vehicle_type="Pickup",
                max_load_capacity=800.0,
                odometer=20000.0,
                acquisition_cost=35000.0,
                status=models.VehicleStatus.IN_SHOP,
                region="West"
            ),
            models.Vehicle(
                registration_number="VAN-003",
                vehicle_name="Delivery Van Epsilon",
                vehicle_type="Van",
                max_load_capacity=500.0,
                odometer=60000.0,
                acquisition_cost=22000.0,
                status=models.VehicleStatus.RETIRED,
                region="North"
            )
        ]
        db.add_all(vehicles)
        db.commit()
        print(f"✓ Created {len(vehicles)} vehicles")
        
        # Create drivers
        today = date.today()
        drivers = [
            models.Driver(
                name="Alex Johnson",
                license_number="DL-12345",
                license_category="LMV",
                license_expiry_date=today + timedelta(days=365),
                contact_number="+1-555-0101",
                safety_score=95.5,
                status=models.DriverStatus.AVAILABLE
            ),
            models.Driver(
                name="Maria Garcia",
                license_number="DL-67890",
                license_category="HMV",
                license_expiry_date=today + timedelta(days=730),
                contact_number="+1-555-0102",
                safety_score=98.0,
                status=models.DriverStatus.AVAILABLE
            ),
            models.Driver(
                name="David Chen",
                license_number="DL-11111",
                license_category="LMV",
                license_expiry_date=today + timedelta(days=180),
                contact_number="+1-555-0103",
                safety_score=92.3,
                status=models.DriverStatus.ON_TRIP
            ),
            models.Driver(
                name="Sarah Williams",
                license_number="DL-22222",
                license_category="HMV",
                license_expiry_date=today + timedelta(days=500),
                contact_number="+1-555-0104",
                safety_score=96.8,
                status=models.DriverStatus.OFF_DUTY
            ),
            models.Driver(
                name="Mike Brown",
                license_number="DL-33333",
                license_category="LMV",
                license_expiry_date=today - timedelta(days=30),  # Expired
                contact_number="+1-555-0105",
                safety_score=88.5,
                status=models.DriverStatus.SUSPENDED
            )
        ]
        db.add_all(drivers)
        db.commit()
        print(f"✓ Created {len(drivers)} drivers")
        
        # Create some trips
        trips = [
            models.Trip(
                vehicle_id=1,
                driver_id=1,
                source="Warehouse A",
                destination="Store B",
                cargo_weight=450.0,
                planned_distance=50.0,
                actual_distance=52.0,
                start_odometer=15000.0,
                end_odometer=15052.0,
                fuel_consumed=6.5,
                status=models.TripStatus.COMPLETED
            ),
            models.Trip(
                vehicle_id=2,
                driver_id=2,
                source="Warehouse C",
                destination="Distribution Center D",
                cargo_weight=1800.0,
                planned_distance=120.0,
                actual_distance=118.0,
                start_odometer=45000.0,
                end_odometer=45118.0,
                fuel_consumed=18.0,
                status=models.TripStatus.COMPLETED
            ),
            models.Trip(
                vehicle_id=3,
                driver_id=3,
                source="Warehouse E",
                destination="Store F",
                cargo_weight=400.0,
                planned_distance=75.0,
                start_odometer=8000.0,
                status=models.TripStatus.DISPATCHED
            ),
            models.Trip(
                vehicle_id=1,
                driver_id=1,
                source="Store G",
                destination="Warehouse H",
                cargo_weight=300.0,
                planned_distance=60.0,
                status=models.TripStatus.DRAFT
            )
        ]
        db.add_all(trips)
        db.commit()
        print(f"✓ Created {len(trips)} trips")
        
        # Create maintenance logs
        maintenance_logs = [
            models.MaintenanceLog(
                vehicle_id=1,
                maintenance_type="Oil Change",
                description="Regular oil change service",
                cost=75.0,
                scheduled_date=today - timedelta(days=30),
                completion_date=today - timedelta(days=30),
                odometer_reading=14500.0,
                status=models.MaintenanceStatus.COMPLETED
            ),
            models.MaintenanceLog(
                vehicle_id=2,
                maintenance_type="Tire Replacement",
                description="Replace all 4 tires",
                cost=600.0,
                scheduled_date=today - timedelta(days=15),
                completion_date=today - timedelta(days=14),
                odometer_reading=44500.0,
                status=models.MaintenanceStatus.COMPLETED
            ),
            models.MaintenanceLog(
                vehicle_id=4,
                maintenance_type="Engine Repair",
                description="Engine overheating issue",
                cost=1200.0,
                scheduled_date=today - timedelta(days=5),
                odometer_reading=19900.0,
                status=models.MaintenanceStatus.IN_PROGRESS
            )
        ]
        db.add_all(maintenance_logs)
        db.commit()
        print(f"✓ Created {len(maintenance_logs)} maintenance logs")
        
        # Create fuel logs
        fuel_logs = [
            models.FuelLog(
                vehicle_id=1,
                liters=40.0,
                cost=50.0,
                odometer_reading=14900.0,
                fuel_date=today - timedelta(days=20)
            ),
            models.FuelLog(
                vehicle_id=1,
                liters=38.0,
                cost=47.5,
                odometer_reading=15300.0,
                fuel_date=today - timedelta(days=10)
            ),
            models.FuelLog(
                vehicle_id=2,
                liters=65.0,
                cost=81.25,
                odometer_reading=44800.0,
                fuel_date=today - timedelta(days=12)
            ),
            models.FuelLog(
                vehicle_id=2,
                liters=68.0,
                cost=85.0,
                odometer_reading=45300.0,
                fuel_date=today - timedelta(days=5)
            )
        ]
        db.add_all(fuel_logs)
        db.commit()
        print(f"✓ Created {len(fuel_logs)} fuel logs")
        
        # Create expenses
        expenses = [
            models.Expense(
                vehicle_id=1,
                expense_type="toll",
                description="Highway toll",
                amount=12.50,
                expense_date=today - timedelta(days=15)
            ),
            models.Expense(
                vehicle_id=2,
                expense_type="toll",
                description="Bridge toll",
                amount=8.00,
                expense_date=today - timedelta(days=10)
            ),
            models.Expense(
                vehicle_id=1,
                expense_type="parking",
                description="Parking fee",
                amount=15.00,
                expense_date=today - timedelta(days=8)
            )
        ]
        db.add_all(expenses)
        db.commit()
        print(f"✓ Created {len(expenses)} expenses")
        
        print("\n✅ Database seeded successfully!")
        print("\nSample credentials:")
        print("  Admin: admin@transitops.com / admin123")
        print("  Fleet Manager: fleet@transitops.com / fleet123")
        print("  Driver: driver@transitops.com / driver123")
        print("  Safety Officer: safety@transitops.com / safety123")
        print("  Financial Analyst: analyst@transitops.com / analyst123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
