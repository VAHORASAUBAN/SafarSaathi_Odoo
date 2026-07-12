"""
Seed script to populate MongoDB database with sample data
Run with: python seed_data.py
"""
import asyncio
from datetime import datetime, timedelta
from app.database import connect_db, close_db
from app import models
from app.auth import get_password_hash


async def seed_database():
    # Connect to database
    await connect_db()
    
    try:
        # Check if data already exists
        existing_users = await models.User.find_all().count()
        if existing_users > 0:
            print("⚠️  Database already has data. Skipping seed.")
            print("   To re-seed, delete the database first:")
            print("   mongosh → use safarsaathi → db.dropDatabase()")
            return
        
        print("🌱 Starting database seeding...")
        
        # Create user
        user = models.User(
            username="admin",
            email="admin@safarsaathi.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_active=True
        )
        await user.insert()
        print("✅ Created test user: admin / password: admin123")
        
        # Create vehicles
        vehicles_data = [
            {
                "registration_number": "MH-01-AB-1234",
                "vehicle_name": "Delivery Van Alpha",
                "vehicle_type": "Van",
                "max_load_capacity": 500.0,
                "odometer": 15000.0,
                "acquisition_cost": 25000.0,
                "status": "available",
                "region": "Mumbai"
            },
            {
                "registration_number": "MH-02-CD-5678",
                "vehicle_name": "Heavy Truck Beta",
                "vehicle_type": "Truck",
                "max_load_capacity": 2000.0,
                "odometer": 45000.0,
                "acquisition_cost": 65000.0,
                "status": "available",
                "region": "Pune"
            },
            {
                "registration_number": "MH-03-EF-9012",
                "vehicle_name": "Delivery Van Gamma",
                "vehicle_type": "Van",
                "max_load_capacity": 450.0,
                "odometer": 8000.0,
                "acquisition_cost": 23000.0,
                "status": "on_trip",
                "region": "Nashik"
            },
            {
                "registration_number": "MH-04-GH-3456",
                "vehicle_name": "Pickup Delta",
                "vehicle_type": "Pickup",
                "max_load_capacity": 800.0,
                "odometer": 20000.0,
                "acquisition_cost": 35000.0,
                "status": "in_shop",
                "region": "Nagpur"
            },
            {
                "registration_number": "MH-05-IJ-7890",
                "vehicle_name": "Mini Truck Epsilon",
                "vehicle_type": "Mini Truck",
                "max_load_capacity": 1000.0,
                "odometer": 30000.0,
                "acquisition_cost": 40000.0,
                "status": "available",
                "region": "Mumbai"
            }
        ]
        
        vehicles = []
        for v_data in vehicles_data:
            vehicle = models.Vehicle(**v_data)
            await vehicle.insert()
            vehicles.append(vehicle)
        print(f"✅ Created {len(vehicles)} vehicles")
        
        # Create drivers
        today = datetime.now()
        drivers_data = [
            {
                "name": "Rajesh Kumar",
                "license_number": "DL-MH-001",
                "license_category": "LMV",
                "license_expiry_date": (today + timedelta(days=365)).strftime("%Y-%m-%d"),
                "contact_number": "+91-9876543210",
                "safety_score": 95.5,
                "status": "available"
            },
            {
                "name": "Priya Sharma",
                "license_number": "DL-MH-002",
                "license_category": "HMV",
                "license_expiry_date": (today + timedelta(days=730)).strftime("%Y-%m-%d"),
                "contact_number": "+91-9876543211",
                "safety_score": 98.0,
                "status": "available"
            },
            {
                "name": "Amit Patel",
                "license_number": "DL-MH-003",
                "license_category": "LMV",
                "license_expiry_date": (today + timedelta(days=180)).strftime("%Y-%m-%d"),
                "contact_number": "+91-9876543212",
                "safety_score": 92.3,
                "status": "on_trip"
            },
            {
                "name": "Sunita Desai",
                "license_number": "DL-MH-004",
                "license_category": "HMV",
                "license_expiry_date": (today + timedelta(days=500)).strftime("%Y-%m-%d"),
                "contact_number": "+91-9876543213",
                "safety_score": 96.8,
                "status": "off_duty"
            }
        ]
        
        drivers = []
        for d_data in drivers_data:
            driver = models.Driver(**d_data)
            await driver.insert()
            drivers.append(driver)
        print(f"✅ Created {len(drivers)} drivers")
        
        # Create trips
        trips_data = [
            {
                "vehicle_id": vehicles[0].id,
                "driver_id": drivers[0].id,
                "source": "Mumbai Warehouse",
                "destination": "Pune Distribution Center",
                "cargo_weight": 450.0,
                "planned_distance": 150.0,
                "actual_distance": 152.0,
                "start_odometer": 15000.0,
                "end_odometer": 15152.0,
                "fuel_consumed": 18.5,
                "status": "completed",
                "created_at": (today - timedelta(days=5)).isoformat()
            },
            {
                "vehicle_id": vehicles[1].id,
                "driver_id": drivers[1].id,
                "source": "Pune Depot",
                "destination": "Nashik Store",
                "cargo_weight": 1800.0,
                "planned_distance": 210.0,
                "actual_distance": 208.0,
                "start_odometer": 45000.0,
                "end_odometer": 45208.0,
                "fuel_consumed": 28.0,
                "status": "completed",
                "created_at": (today - timedelta(days=3)).isoformat()
            },
            {
                "vehicle_id": vehicles[2].id,
                "driver_id": drivers[2].id,
                "source": "Nashik Hub",
                "destination": "Nagpur Center",
                "cargo_weight": 400.0,
                "planned_distance": 480.0,
                "start_odometer": 8000.0,
                "status": "dispatched",
                "created_at": (today - timedelta(days=1)).isoformat()
            },
            {
                "vehicle_id": vehicles[0].id,
                "driver_id": drivers[0].id,
                "source": "Mumbai Port",
                "destination": "Thane Warehouse",
                "cargo_weight": 300.0,
                "planned_distance": 30.0,
                "status": "draft",
                "created_at": today.isoformat()
            },
            {
                "vehicle_id": vehicles[4].id,
                "driver_id": drivers[1].id,
                "source": "Thane",
                "destination": "Kalyan",
                "cargo_weight": 800.0,
                "planned_distance": 20.0,
                "status": "draft",
                "created_at": today.isoformat()
            },
            {
                "vehicle_id": vehicles[1].id,
                "driver_id": drivers[0].id,
                "source": "Pune",
                "destination": "Mumbai",
                "cargo_weight": 1500.0,
                "planned_distance": 150.0,
                "actual_distance": 155.0,
                "start_odometer": 44800.0,
                "end_odometer": 44955.0,
                "fuel_consumed": 22.0,
                "status": "completed",
                "created_at": (today - timedelta(days=10)).isoformat()
            }
        ]
        
        trips = []
        for t_data in trips_data:
            trip = models.Trip(**t_data)
            await trip.insert()
            trips.append(trip)
        print(f"✅ Created {len(trips)} trips")
        
        # Create maintenance logs
        maintenance_data = [
            {
                "vehicle_id": vehicles[0].id,
                "maintenance_type": "Oil Change",
                "description": "Regular oil change service",
                "cost": 2000.0,
                "scheduled_date": (today - timedelta(days=30)).strftime("%Y-%m-%d"),
                "completion_date": (today - timedelta(days=30)).strftime("%Y-%m-%d"),
                "odometer_reading": 14500.0,
                "status": "completed"
            },
            {
                "vehicle_id": vehicles[1].id,
                "maintenance_type": "Tire Replacement",
                "description": "Replace all 6 tires",
                "cost": 45000.0,
                "scheduled_date": (today - timedelta(days=15)).strftime("%Y-%m-%d"),
                "completion_date": (today - timedelta(days=14)).strftime("%Y-%m-%d"),
                "odometer_reading": 44500.0,
                "status": "completed"
            },
            {
                "vehicle_id": vehicles[3].id,
                "maintenance_type": "Engine Repair",
                "description": "Engine overheating issue - radiator replacement",
                "cost": 35000.0,
                "scheduled_date": (today - timedelta(days=5)).strftime("%Y-%m-%d"),
                "odometer_reading": 19900.0,
                "status": "in_progress"
            },
            {
                "vehicle_id": vehicles[0].id,
                "maintenance_type": "Brake Service",
                "description": "Brake pad replacement",
                "cost": 8000.0,
                "scheduled_date": (today - timedelta(days=60)).strftime("%Y-%m-%d"),
                "completion_date": (today - timedelta(days=60)).strftime("%Y-%m-%d"),
                "odometer_reading": 14000.0,
                "status": "completed"
            }
        ]
        
        maintenance_logs = []
        for m_data in maintenance_data:
            mlog = models.MaintenanceLog(**m_data)
            await mlog.insert()
            maintenance_logs.append(mlog)
        print(f"✅ Created {len(maintenance_logs)} maintenance logs")
        
        # Create fuel logs
        fuel_data = [
            {
                "vehicle_id": vehicles[0].id,
                "liters": 40.0,
                "cost": 3600.0,  # ~90 INR per liter
                "odometer_reading": 14900.0,
                "fuel_date": (today - timedelta(days=20)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[0].id,
                "liters": 38.0,
                "cost": 3420.0,
                "odometer_reading": 15300.0,
                "fuel_date": (today - timedelta(days=10)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[1].id,
                "liters": 65.0,
                "cost": 5850.0,
                "odometer_reading": 44800.0,
                "fuel_date": (today - timedelta(days=12)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[1].id,
                "liters": 68.0,
                "cost": 6120.0,
                "odometer_reading": 45300.0,
                "fuel_date": (today - timedelta(days=5)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[2].id,
                "liters": 35.0,
                "cost": 3150.0,
                "odometer_reading": 7900.0,
                "fuel_date": (today - timedelta(days=8)).strftime("%Y-%m-%d")
            }
        ]
        
        fuel_logs = []
        for f_data in fuel_data:
            flog = models.FuelLog(**f_data)
            await flog.insert()
            fuel_logs.append(flog)
        print(f"✅ Created {len(fuel_logs)} fuel logs")
        
        # Create expenses
        expense_data = [
            {
                "vehicle_id": vehicles[0].id,
                "expense_type": "toll",
                "description": "Mumbai-Pune Expressway toll",
                "amount": 350.0,
                "expense_date": (today - timedelta(days=15)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[1].id,
                "expense_type": "toll",
                "description": "Highway toll payment",
                "amount": 280.0,
                "expense_date": (today - timedelta(days=10)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[0].id,
                "expense_type": "parking",
                "description": "Overnight parking fee",
                "amount": 150.0,
                "expense_date": (today - timedelta(days=8)).strftime("%Y-%m-%d")
            },
            {
                "vehicle_id": vehicles[2].id,
                "expense_type": "other",
                "description": "Vehicle wash and cleaning",
                "amount": 500.0,
                "expense_date": (today - timedelta(days=5)).strftime("%Y-%m-%d")
            }
        ]
        
        expenses = []
        for e_data in expense_data:
            expense = models.Expense(**e_data)
            await expense.insert()
            expenses.append(expense)
        print(f"✅ Created {len(expenses)} expenses")
        
        print("\n🎉 Database seeded successfully!")
        print("\n" + "="*60)
        print("📋 LOGIN CREDENTIALS:")
        print("   Username: admin")
        print("   Password: admin123")
        print("="*60)
        print("\n💡 Next steps:")
        print("   1. Start backend: uvicorn app.main:app --reload")
        print("   2. Start frontend: cd transitops-frontend/transitops && npm run dev")
        print("   3. Open browser: http://localhost:5173")
        print("   4. Login with credentials above")
        print("\n📖 See DYNAMIC_TESTING_GUIDE.md for testing instructions")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(seed_database())
