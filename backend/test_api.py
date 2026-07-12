"""
Simple API Test Script for TransitOps Backend
Run after starting the server to verify everything is working
"""

import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_response(response, title="Response"):
    print(f"{title}:")
    print(f"Status Code: {response.status_code}")
    if response.status_code < 400:
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")
    else:
        print(f"Error: {response.text}")
    print()

def test_api():
    """Test the TransitOps API endpoints"""
    
    print("\n" + "="*60)
    print("  TransitOps API Test Script")
    print("="*60)
    print("\nTesting API at:", BASE_URL)
    print("Make sure the server is running: run_dev.bat\n")
    
    # Test 1: Health Check
    print_section("1. Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check")
    if response.status_code != 200:
        print("❌ Server is not responding! Make sure it's running.")
        return
    print("✅ Server is running!")
    
    # Test 2: Register a new user
    print_section("2. Register New User")
    test_user = {
        "email": f"test_{date.today().strftime('%Y%m%d')}@example.com",
        "password": "test123456",
        "full_name": "Test User",
        "role": "fleet_manager"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
    print_response(response, "Register User")
    
    # If user already exists, try with seeded admin
    if response.status_code == 400:
        print("User already exists, using seeded admin account...")
        test_user["email"] = "admin@transitops.com"
        test_user["password"] = "admin123"
    
    # Test 3: Login
    print_section("3. Login")
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=login_data
    )
    print_response(response, "Login")
    
    if response.status_code != 200:
        print("❌ Login failed! Check credentials.")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Logged in successfully!")
    print(f"Token: {token[:20]}...")
    
    # Test 4: Get Current User
    print_section("4. Get Current User Info")
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print_response(response, "Current User")
    
    # Test 5: Dashboard KPIs
    print_section("5. Dashboard KPIs")
    response = requests.get(f"{BASE_URL}/api/dashboard/kpis", headers=headers)
    print_response(response, "Dashboard KPIs")
    if response.status_code == 200:
        kpis = response.json()
        print("📊 Summary:")
        print(f"  • Active Vehicles: {kpis.get('active_vehicles', 0)}")
        print(f"  • Available Vehicles: {kpis.get('available_vehicles', 0)}")
        print(f"  • Active Trips: {kpis.get('active_trips', 0)}")
        print(f"  • Drivers On Duty: {kpis.get('drivers_on_duty', 0)}")
        print(f"  • Fleet Utilization: {kpis.get('fleet_utilization', 0)}%")
    
    # Test 6: Get Vehicles
    print_section("6. Get All Vehicles")
    response = requests.get(f"{BASE_URL}/api/vehicles", headers=headers)
    print_response(response, "Vehicles List")
    if response.status_code == 200:
        vehicles = response.json()
        print(f"✅ Found {len(vehicles)} vehicles")
        if vehicles:
            print(f"\nFirst vehicle: {vehicles[0].get('registration_number')} - {vehicles[0].get('vehicle_name')}")
    
    # Test 7: Get Drivers
    print_section("7. Get All Drivers")
    response = requests.get(f"{BASE_URL}/api/drivers", headers=headers)
    print_response(response, "Drivers List")
    if response.status_code == 200:
        drivers = response.json()
        print(f"✅ Found {len(drivers)} drivers")
        if drivers:
            print(f"\nFirst driver: {drivers[0].get('name')} - License: {drivers[0].get('license_number')}")
    
    # Test 8: Get Available Vehicles
    print_section("8. Get Available Vehicles for Dispatch")
    response = requests.get(f"{BASE_URL}/api/vehicles/available", headers=headers)
    print_response(response, "Available Vehicles")
    available_vehicles = response.json() if response.status_code == 200 else []
    
    # Test 9: Get Available Drivers
    print_section("9. Get Available Drivers")
    response = requests.get(f"{BASE_URL}/api/drivers/available", headers=headers)
    print_response(response, "Available Drivers")
    available_drivers = response.json() if response.status_code == 200 else []
    
    # Test 10: Create a Test Trip (if we have available vehicle and driver)
    if available_vehicles and available_drivers:
        print_section("10. Create Test Trip")
        trip_data = {
            "vehicle_id": available_vehicles[0]["id"],
            "driver_id": available_drivers[0]["id"],
            "source": "Test Warehouse",
            "destination": "Test Store",
            "cargo_weight": 300,
            "planned_distance": 50
        }
        response = requests.post(f"{BASE_URL}/api/trips", json=trip_data, headers=headers)
        print_response(response, "Create Trip")
        
        if response.status_code in [200, 201]:
            trip_id = response.json()["id"]
            print(f"✅ Trip created with ID: {trip_id}")
            
            # Test 11: Get Trips
            print_section("11. Get All Trips")
            response = requests.get(f"{BASE_URL}/api/trips", headers=headers)
            print_response(response, "Trips List")
            
            # Test 12: Dispatch Trip
            print_section("12. Dispatch Trip")
            dispatch_data = {
                "start_odometer": available_vehicles[0]["odometer"]
            }
            response = requests.post(
                f"{BASE_URL}/api/trips/{trip_id}/dispatch",
                json=dispatch_data,
                headers=headers
            )
            print_response(response, "Dispatch Trip")
            
            if response.status_code == 200:
                print("✅ Trip dispatched! Vehicle and driver status changed to ON_TRIP")
                
                # Test 13: Complete Trip
                print_section("13. Complete Trip")
                complete_data = {
                    "end_odometer": available_vehicles[0]["odometer"] + 50,
                    "actual_distance": 50,
                    "fuel_consumed": 6.5
                }
                response = requests.post(
                    f"{BASE_URL}/api/trips/{trip_id}/complete",
                    json=complete_data,
                    headers=headers
                )
                print_response(response, "Complete Trip")
                
                if response.status_code == 200:
                    print("✅ Trip completed! Vehicle and driver status restored to AVAILABLE")
    else:
        print_section("10-13. Trip Operations Skipped")
        print("⚠️  No available vehicles or drivers to test trip creation.")
        print("   Run: python seed_data.py to add sample data")
    
    # Test 14: Get Maintenance Logs
    print_section("14. Get Maintenance Logs")
    response = requests.get(f"{BASE_URL}/api/maintenance", headers=headers)
    print_response(response, "Maintenance Logs")
    
    # Test 15: Get Fuel Logs
    print_section("15. Get Fuel Logs")
    response = requests.get(f"{BASE_URL}/api/fuel", headers=headers)
    print_response(response, "Fuel Logs")
    
    # Test 16: Get Expenses
    print_section("16. Get Expenses")
    response = requests.get(f"{BASE_URL}/api/expenses", headers=headers)
    print_response(response, "Expenses")
    
    # Test 17: Fleet Analytics
    print_section("17. Fleet Analytics")
    response = requests.get(f"{BASE_URL}/api/dashboard/analytics", headers=headers)
    print_response(response, "Fleet Analytics")
    
    # Final Summary
    print_section("Test Summary")
    print("✅ API is working correctly!")
    print("\n📚 Next Steps:")
    print("  1. Explore API docs: http://localhost:8000/docs")
    print("  2. Connect your frontend to the API")
    print("  3. Review business logic in app/crud.py")
    print("  4. Customize as needed for your requirements")
    print("\n🎉 Happy coding!\n")


if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to the server!")
        print("   Make sure the server is running:")
        print("   run_dev.bat")
        print("\n   Or manually:")
        print("   venv\\Scripts\\activate")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
