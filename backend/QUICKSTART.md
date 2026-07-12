# TransitOps Backend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- Python 3.8+ installed
- MySQL 5.7+ or 8.0+ installed and running
- Git (optional)

### 2. Setup Steps

#### Option A: Automated Setup (Recommended)
```bash
# Run the setup script
setup.bat

# Follow the prompts to:
# - Create virtual environment
# - Install dependencies
# - Configure .env file
```

#### Option B: Manual Setup
```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
notepad .env  # Edit with your settings
```

### 3. Database Setup

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE transitops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Exit MySQL
exit;
```

### 4. Seed Sample Data

```bash
# Add sample data (users, vehicles, drivers, etc.)
python seed_data.py
```

### 5. Start the Server

```bash
# Development mode with auto-reload
run_dev.bat

# Or manually:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Access the API

- 🌐 API Root: http://localhost:8000
- 📚 Interactive Docs (Swagger): http://localhost:8000/docs
- 📖 Alternative Docs (ReDoc): http://localhost:8000/redoc

## 🔐 Sample Credentials

After running `seed_data.py`, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@transitops.com | admin123 |
| Fleet Manager | fleet@transitops.com | fleet123 |
| Driver | driver@transitops.com | driver123 |
| Safety Officer | safety@transitops.com | safety123 |
| Financial Analyst | analyst@transitops.com | analyst123 |

## 🧪 Testing the API

### Method 1: Swagger UI (Easiest)

1. Go to http://localhost:8000/docs
2. Click on `/api/auth/login`
3. Click "Try it out"
4. Enter credentials (use admin@transitops.com / admin123)
5. Click "Execute"
6. Copy the `access_token` from the response
7. Click the "Authorize" button at the top
8. Enter: `Bearer <your-token>` (replace with your token)
9. Now you can test all endpoints!

### Method 2: cURL Examples

```bash
# 1. Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@transitops.com&password=admin123"

# Save the token from response
TOKEN="your_token_here"

# 2. Get Dashboard KPIs
curl -X GET "http://localhost:8000/api/dashboard/kpis" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get All Vehicles
curl -X GET "http://localhost:8000/api/vehicles" \
  -H "Authorization: Bearer $TOKEN"

# 4. Create a Vehicle
curl -X POST "http://localhost:8000/api/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_number": "TEST-001",
    "vehicle_name": "Test Vehicle",
    "vehicle_type": "Van",
    "max_load_capacity": 500,
    "odometer": 0,
    "acquisition_cost": 25000,
    "region": "North"
  }'

# 5. Get All Drivers
curl -X GET "http://localhost:8000/api/drivers" \
  -H "Authorization: Bearer $TOKEN"

# 6. Create a Trip
curl -X POST "http://localhost:8000/api/trips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 1,
    "source": "Warehouse A",
    "destination": "Store B",
    "cargo_weight": 450,
    "planned_distance": 50
  }'
```

### Method 3: Python Script

```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={
        "username": "admin@transitops.com",
        "password": "admin123"
    }
)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get Dashboard KPIs
kpis = requests.get(f"{BASE_URL}/api/dashboard/kpis", headers=headers).json()
print("Dashboard KPIs:", kpis)

# Get Vehicles
vehicles = requests.get(f"{BASE_URL}/api/vehicles", headers=headers).json()
print(f"Total Vehicles: {len(vehicles)}")
```

## 📊 Sample Workflow

### Complete Trip Workflow (from Requirements Document)

```bash
# 1. Create a Trip (DRAFT status)
POST /api/trips
{
  "vehicle_id": 1,
  "driver_id": 1,
  "source": "Warehouse A",
  "destination": "Store B",
  "cargo_weight": 450,
  "planned_distance": 50
}
# Response: trip_id = 1, status = "draft"

# 2. Dispatch Trip (changes vehicle & driver to ON_TRIP)
POST /api/trips/1/dispatch
{
  "start_odometer": 15000
}
# Response: status = "dispatched", vehicle.status = "on_trip", driver.status = "on_trip"

# 3. Complete Trip (restores vehicle & driver to AVAILABLE)
POST /api/trips/1/complete
{
  "end_odometer": 15050,
  "actual_distance": 50,
  "fuel_consumed": 6.5
}
# Response: status = "completed", vehicle.status = "available", driver.status = "available"

# 4. Create Maintenance (sets vehicle to IN_SHOP)
POST /api/maintenance
{
  "vehicle_id": 1,
  "maintenance_type": "Oil Change",
  "description": "Regular service",
  "cost": 75,
  "scheduled_date": "2024-02-01"
}
# Response: maintenance created, vehicle.status = "in_shop"

# 5. Complete Maintenance (restores vehicle to AVAILABLE)
PUT /api/maintenance/1
{
  "status": "completed",
  "completion_date": "2024-02-01"
}
# Response: status = "completed", vehicle.status = "available"
```

## 🔧 Troubleshooting

### Database Connection Error
```
Error: Can't connect to MySQL server
```
**Solution:** 
- Make sure MySQL is running
- Check DATABASE_URL in .env file
- Verify MySQL credentials

### Import Error
```
ModuleNotFoundError: No module named 'fastapi'
```
**Solution:**
- Activate virtual environment: `venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

### Port Already in Use
```
Error: [Errno 10048] address already in use
```
**Solution:**
- Stop other processes on port 8000
- Or run on different port: `uvicorn app.main:app --port 8001`

### JWT Token Error
```
Could not validate credentials
```
**Solution:**
- Get a fresh token by logging in again
- Make sure to use format: `Bearer <token>`

## 📝 Environment Variables

Edit `.env` file:

```env
# MySQL Connection
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/transitops

# JWT Configuration
SECRET_KEY=your-secret-key-change-this-in-production-use-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Security Note:** Change SECRET_KEY to a secure random string in production!

Generate secure key:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## 🎯 Next Steps

1. ✅ Test all API endpoints in Swagger UI
2. ✅ Review business rules implementation in `app/crud.py`
3. ✅ Connect your frontend to the API
4. ✅ Customize user roles and permissions
5. ✅ Add additional analytics endpoints as needed

## 📞 API Endpoints Summary

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Auth | POST /api/auth/register<br>POST /api/auth/login<br>GET /api/auth/me | Authentication & user management |
| Vehicles | GET/POST /api/vehicles<br>GET/PUT/DELETE /api/vehicles/{id}<br>GET /api/vehicles/{id}/analytics | Vehicle CRUD & analytics |
| Drivers | GET/POST /api/drivers<br>GET/PUT/DELETE /api/drivers/{id} | Driver CRUD |
| Trips | GET/POST /api/trips<br>GET/PUT /api/trips/{id}<br>POST /api/trips/{id}/dispatch<br>POST /api/trips/{id}/complete<br>POST /api/trips/{id}/cancel | Trip lifecycle management |
| Maintenance | GET/POST /api/maintenance<br>GET/PUT /api/maintenance/{id} | Maintenance tracking |
| Fuel | GET/POST /api/fuel | Fuel log management |
| Expenses | GET/POST /api/expenses | Expense tracking |
| Dashboard | GET /api/dashboard/kpis | KPIs and metrics |

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, business rule violation)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Happy coding! 🎉
