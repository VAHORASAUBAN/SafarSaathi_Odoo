# TransitOps Backend API

FastAPI backend for the TransitOps Smart Transport Operations Platform.

## Features

- ✅ Authentication with JWT and Role-Based Access Control (RBAC)
- ✅ Vehicle Registry with status management
- ✅ Driver Management with license validation
- ✅ Trip Management with automatic status transitions
- ✅ Maintenance workflow with automatic vehicle status updates
- ✅ Fuel and Expense tracking
- ✅ Dashboard KPIs and Analytics
- ✅ Business rule enforcement (all mandatory rules from requirements)

## Business Rules Implementation

### Vehicle Management
- ✅ Registration number must be unique
- ✅ Retired or In Shop vehicles cannot be assigned to trips
- ✅ Vehicle status automatically managed during trips and maintenance

### Driver Management
- ✅ License number must be unique
- ✅ Drivers with expired licenses cannot be assigned to trips
- ✅ Suspended drivers cannot be assigned to trips
- ✅ Driver already on trip cannot be assigned to another trip

### Trip Management
- ✅ Cargo weight validation against vehicle capacity
- ✅ Dispatching automatically changes vehicle and driver status to ON_TRIP
- ✅ Completing trip restores vehicle and driver to AVAILABLE
- ✅ Cancelling trip restores vehicle and driver to AVAILABLE
- ✅ Trip lifecycle: Draft → Dispatched → Completed/Cancelled

### Maintenance Management
- ✅ Creating active maintenance automatically sets vehicle to IN_SHOP
- ✅ Closing maintenance restores vehicle to AVAILABLE (unless retired)

## Setup

### Prerequisites

- Python 3.8+
- MySQL 5.7+ or 8.0+

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
# Copy example env file
copy .env.example .env

# Edit .env with your configuration
# Set your MySQL connection string and secret key
```

Example `.env` file:
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/transitops
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Create database:
```bash
# Login to MySQL and create database
mysql -u root -p
CREATE DATABASE transitops;
exit;
```

5. Initialize database (create tables):
```bash
# The tables will be created automatically on first run
# Or you can use Alembic for migrations:
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Running the Server

Development mode with auto-reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Interactive API Docs (Swagger): http://localhost:8000/docs
- Alternative API Docs (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Vehicles
- `GET /api/vehicles` - List vehicles (with filters)
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/{id}` - Get vehicle details
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `GET /api/vehicles/{id}/analytics` - Get vehicle analytics

### Drivers
- `GET /api/drivers` - List drivers (with filters)
- `POST /api/drivers` - Create driver
- `GET /api/drivers/{id}` - Get driver details
- `PUT /api/drivers/{id}` - Update driver
- `DELETE /api/drivers/{id}` - Delete driver

### Trips
- `GET /api/trips` - List trips (with filters)
- `POST /api/trips` - Create trip (DRAFT)
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip (DRAFT only)
- `POST /api/trips/{id}/dispatch` - Dispatch trip
- `POST /api/trips/{id}/complete` - Complete trip
- `POST /api/trips/{id}/cancel` - Cancel trip

### Maintenance
- `GET /api/maintenance` - List maintenance logs
- `POST /api/maintenance` - Create maintenance log
- `GET /api/maintenance/{id}` - Get maintenance log
- `PUT /api/maintenance/{id}` - Update maintenance log

### Fuel Logs
- `GET /api/fuel` - List fuel logs
- `POST /api/fuel` - Create fuel log

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense

### Dashboard
- `GET /api/dashboard/kpis` - Get dashboard KPIs

## User Roles

- `admin` - Full access to all features
- `fleet_manager` - Manage vehicles, drivers, trips, maintenance
- `driver` - Create trips, log fuel and expenses
- `safety_officer` - Manage drivers, view safety compliance
- `financial_analyst` - View expenses, analytics, reports

## Database Schema

### Users
- id, email, hashed_password, full_name, role, is_active, timestamps

### Vehicles
- id, registration_number (unique), vehicle_name, vehicle_type, max_load_capacity, odometer, acquisition_cost, status, region, timestamps

### Drivers
- id, name, license_number (unique), license_category, license_expiry_date, contact_number, safety_score, status, timestamps

### Trips
- id, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, actual_distance, start_odometer, end_odometer, fuel_consumed, status, dispatch_time, completion_time, timestamps

### Maintenance Logs
- id, vehicle_id, maintenance_type, description, cost, scheduled_date, completion_date, odometer_reading, status, timestamps

### Fuel Logs
- id, vehicle_id, liters, cost, odometer_reading, fuel_date, created_at

### Expenses
- id, vehicle_id, expense_type, description, amount, expense_date, created_at

## Development

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication logic
│   ├── crud.py              # Database operations
│   └── routers/
│       ├── auth.py
│       ├── vehicles.py
│       ├── drivers.py
│       ├── trips.py
│       ├── maintenance.py
│       ├── fuel.py
│       ├── expenses.py
│       └── dashboard.py
├── alembic/                 # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```

### Creating First Admin User

After starting the server, register the first user via API:

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@transitops.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

### Testing with Swagger UI

1. Go to http://localhost:8000/docs
2. Register a user via `/api/auth/register`
3. Login via `/api/auth/login` to get access token
4. Click "Authorize" button and enter: `Bearer <your-token>`
5. Test all endpoints with authentication

## Example Workflow (from Requirements)

1. **Register Vehicle**: POST `/api/vehicles`
```json
{
  "registration_number": "Van-05",
  "vehicle_name": "Delivery Van",
  "vehicle_type": "Van",
  "max_load_capacity": 500,
  "odometer": 0,
  "acquisition_cost": 25000,
  "region": "North"
}
```

2. **Register Driver**: POST `/api/drivers`
```json
{
  "name": "Alex",
  "license_number": "DL12345",
  "license_category": "LMV",
  "license_expiry_date": "2025-12-31",
  "contact_number": "+1234567890",
  "safety_score": 100
}
```

3. **Create Trip**: POST `/api/trips`
```json
{
  "vehicle_id": 1,
  "driver_id": 1,
  "source": "Warehouse A",
  "destination": "Store B",
  "cargo_weight": 450,
  "planned_distance": 50
}
```

4. **Dispatch Trip**: POST `/api/trips/1/dispatch`
```json
{
  "start_odometer": 1000
}
```

5. **Complete Trip**: POST `/api/trips/1/complete`
```json
{
  "end_odometer": 1050,
  "actual_distance": 50,
  "fuel_consumed": 5
}
```

6. **Create Maintenance**: POST `/api/maintenance`
```json
{
  "vehicle_id": 1,
  "maintenance_type": "Oil Change",
  "description": "Regular oil change service",
  "cost": 75,
  "scheduled_date": "2024-02-01"
}
```

## License

MIT
