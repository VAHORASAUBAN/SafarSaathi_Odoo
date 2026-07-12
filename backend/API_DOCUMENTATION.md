# TransitOps API Documentation

Complete API reference for the TransitOps Smart Transport Operations Platform.

## Base URL
```
http://localhost:8000
```

## Authentication

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Getting a Token

**POST** `/api/auth/login`

Request Body (form-data):
```
username: admin@transitops.com
password: admin123
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all features |
| **fleet_manager** | Manage vehicles, drivers, trips, maintenance |
| **driver** | Create trips, log fuel and expenses |
| **safety_officer** | Manage drivers, view compliance |
| **financial_analyst** | View expenses, analytics, export reports |

## API Endpoints

### 1. Authentication

#### Register User
```http
POST /api/auth/register
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "fleet_manager"
}
```

Response (201):
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "fleet_manager",
  "is_active": true,
  "created_at": "2024-02-01T10:00:00"
}
```

#### Login
```http
POST /api/auth/login
```

Form Data:
- `username`: email address
- `password`: password

Response (200):
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/auth/me
```

Response (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "fleet_manager",
  "is_active": true,
  "created_at": "2024-02-01T10:00:00"
}
```

---

### 2. Vehicles

#### List All Vehicles
```http
GET /api/vehicles
```

Query Parameters:
- `skip`: Offset for pagination (default: 0)
- `limit`: Number of results (default: 100)
- `status`: Filter by status (available, on_trip, in_shop, retired)
- `vehicle_type`: Filter by type
- `region`: Filter by region

Response (200):
```json
[
  {
    "id": 1,
    "registration_number": "VAN-001",
    "vehicle_name": "Delivery Van Alpha",
    "vehicle_type": "Van",
    "max_load_capacity": 500.0,
    "odometer": 15000.0,
    "acquisition_cost": 25000.0,
    "status": "available",
    "region": "North",
    "created_at": "2024-01-15T08:00:00",
    "updated_at": null
  }
]
```

#### Get Available Vehicles
```http
GET /api/vehicles/available
```

Returns only vehicles with status "available" (eligible for dispatch).

#### Get Vehicle by ID
```http
GET /api/vehicles/{vehicle_id}
```

Response (200): Single vehicle object

#### Create Vehicle
```http
POST /api/vehicles
```

**Required Role:** `fleet_manager` or `admin`

Request Body:
```json
{
  "registration_number": "VAN-005",
  "vehicle_name": "Delivery Van Zeta",
  "vehicle_type": "Van",
  "max_load_capacity": 500,
  "odometer": 0,
  "acquisition_cost": 25000,
  "region": "South"
}
```

**Business Rules:**
- Registration number must be unique
- Max load capacity must be > 0
- Acquisition cost must be > 0

Response (200): Created vehicle object

#### Update Vehicle
```http
PUT /api/vehicles/{vehicle_id}
```

**Required Role:** `fleet_manager` or `admin`

Request Body (all fields optional):
```json
{
  "vehicle_name": "Updated Name",
  "vehicle_type": "Truck",
  "max_load_capacity": 600,
  "odometer": 15500,
  "status": "available",
  "region": "East"
}
```

Response (200): Updated vehicle object

#### Delete Vehicle
```http
DELETE /api/vehicles/{vehicle_id}
```

**Required Role:** `fleet_manager` or `admin`

Response (200):
```json
{
  "message": "Vehicle deleted successfully"
}
```

#### Get Vehicle Analytics
```http
GET /api/vehicles/{vehicle_id}/analytics
```

Response (200):
```json
{
  "vehicle_id": 1,
  "registration_number": "VAN-001",
  "vehicle_name": "Delivery Van Alpha",
  "fuel_efficiency": 8.5,
  "total_operational_cost": 1250.75,
  "total_fuel_cost": 875.50,
  "total_maintenance_cost": 375.25,
  "vehicle_roi": -5.00
}
```

---

### 3. Drivers

#### List All Drivers
```http
GET /api/drivers
```

Query Parameters:
- `skip`: Offset for pagination
- `limit`: Number of results
- `status`: Filter by status (available, on_trip, off_duty, suspended)

Response (200):
```json
[
  {
    "id": 1,
    "name": "Alex Johnson",
    "license_number": "DL-12345",
    "license_category": "LMV",
    "license_expiry_date": "2025-12-31",
    "contact_number": "+1-555-0101",
    "safety_score": 95.5,
    "status": "available",
    "created_at": "2024-01-10T09:00:00",
    "updated_at": null
  }
]
```

#### Get Available Drivers
```http
GET /api/drivers/available
```

Returns drivers with:
- Status: "available"
- License not expired

#### Get Driver by ID
```http
GET /api/drivers/{driver_id}
```

#### Create Driver
```http
POST /api/drivers
```

**Required Role:** `fleet_manager`, `safety_officer`, or `admin`

Request Body:
```json
{
  "name": "John Smith",
  "license_number": "DL-99999",
  "license_category": "HMV",
  "license_expiry_date": "2026-06-30",
  "contact_number": "+1-555-0199",
  "safety_score": 100
}
```

**Business Rules:**
- License number must be unique
- Safety score must be between 0-100

#### Update Driver
```http
PUT /api/drivers/{driver_id}
```

**Required Role:** `fleet_manager`, `safety_officer`, or `admin`

Request Body (all fields optional):
```json
{
  "name": "John Smith Jr.",
  "safety_score": 98.5,
  "status": "off_duty"
}
```

#### Delete Driver
```http
DELETE /api/drivers/{driver_id}
```

**Required Role:** `fleet_manager`, `safety_officer`, or `admin`

---

### 4. Trips

#### List All Trips
```http
GET /api/trips
```

Query Parameters:
- `skip`: Offset for pagination
- `limit`: Number of results
- `status`: Filter by status (draft, dispatched, completed, cancelled)
- `vehicle_id`: Filter by vehicle
- `driver_id`: Filter by driver

Response (200):
```json
[
  {
    "id": 1,
    "vehicle_id": 1,
    "driver_id": 1,
    "source": "Warehouse A",
    "destination": "Store B",
    "cargo_weight": 450,
    "planned_distance": 50,
    "actual_distance": 52,
    "start_odometer": 15000,
    "end_odometer": 15052,
    "fuel_consumed": 6.5,
    "status": "completed",
    "dispatch_time": "2024-02-01T08:00:00",
    "completion_time": "2024-02-01T12:30:00",
    "created_at": "2024-01-31T15:00:00",
    "updated_at": "2024-02-01T12:30:00",
    "vehicle": { /* vehicle object */ },
    "driver": { /* driver object */ }
  }
]
```

#### Create Trip (DRAFT)
```http
POST /api/trips
```

**Required Role:** `driver`, `fleet_manager`, or `admin`

Request Body:
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

**Business Rules Enforced:**
- ✅ Vehicle must exist and be available
- ✅ Vehicle cannot be retired or in shop
- ✅ Vehicle cannot already be on a trip
- ✅ Cargo weight must not exceed vehicle capacity
- ✅ Driver must exist and be available
- ✅ Driver license must not be expired
- ✅ Driver cannot be suspended
- ✅ Driver cannot already be on a trip

Response (200): Created trip with status "draft"

#### Update Trip
```http
PUT /api/trips/{trip_id}
```

**Required Role:** `driver`, `fleet_manager`, or `admin`

**Note:** Only trips in "draft" status can be updated

Request Body (all fields optional):
```json
{
  "source": "Updated Warehouse",
  "destination": "Updated Store",
  "cargo_weight": 400,
  "planned_distance": 55
}
```

#### Dispatch Trip
```http
POST /api/trips/{trip_id}/dispatch
```

**Required Role:** `driver`, `fleet_manager`, or `admin`

Request Body:
```json
{
  "start_odometer": 15000
}
```

**Automatic Actions:**
- ✅ Trip status → "dispatched"
- ✅ Vehicle status → "on_trip"
- ✅ Driver status → "on_trip"
- ✅ Records dispatch timestamp

#### Complete Trip
```http
POST /api/trips/{trip_id}/complete
```

**Required Role:** `driver`, `fleet_manager`, or `admin`

Request Body:
```json
{
  "end_odometer": 15052,
  "actual_distance": 52,
  "fuel_consumed": 6.5
}
```

**Validations:**
- End odometer must be greater than start odometer

**Automatic Actions:**
- ✅ Trip status → "completed"
- ✅ Vehicle status → "available"
- ✅ Driver status → "available"
- ✅ Vehicle odometer updated
- ✅ Records completion timestamp

#### Cancel Trip
```http
POST /api/trips/{trip_id}/cancel
```

**Required Role:** `driver`, `fleet_manager`, or `admin`

**Automatic Actions:**
- ✅ Trip status → "cancelled"
- ✅ If dispatched: Vehicle status → "available"
- ✅ If dispatched: Driver status → "available"

---

### 5. Maintenance

#### List Maintenance Logs
```http
GET /api/maintenance
```

Query Parameters:
- `skip`, `limit`: Pagination
- `vehicle_id`: Filter by vehicle
- `status`: Filter by status (scheduled, in_progress, completed, cancelled)

#### Create Maintenance Log
```http
POST /api/maintenance
```

**Required Role:** `fleet_manager` or `admin`

Request Body:
```json
{
  "vehicle_id": 1,
  "maintenance_type": "Oil Change",
  "description": "Regular oil change service",
  "cost": 75,
  "scheduled_date": "2024-02-15",
  "odometer_reading": 15100
}
```

**Automatic Actions:**
- ✅ If status is "scheduled" or "in_progress": Vehicle status → "in_shop"
- ✅ Vehicle is hidden from dispatch selection

#### Update Maintenance Log
```http
PUT /api/maintenance/{maintenance_id}
```

**Required Role:** `fleet_manager` or `admin`

Request Body (all fields optional):
```json
{
  "status": "completed",
  "completion_date": "2024-02-15",
  "cost": 85
}
```

**Automatic Actions:**
- ✅ If status changed to "completed" or "cancelled": Vehicle status → "available" (unless retired)

---

### 6. Fuel Logs

#### List Fuel Logs
```http
GET /api/fuel
```

Query Parameters:
- `vehicle_id`: Filter by vehicle

#### Create Fuel Log
```http
POST /api/fuel
```

**Required Role:** `driver`, `fleet_manager`, `financial_analyst`, or `admin`

Request Body:
```json
{
  "vehicle_id": 1,
  "liters": 40,
  "cost": 50,
  "odometer_reading": 15300,
  "fuel_date": "2024-02-10"
}
```

---

### 7. Expenses

#### List Expenses
```http
GET /api/expenses
```

Query Parameters:
- `vehicle_id`: Filter by vehicle
- `expense_type`: Filter by type (toll, parking, maintenance, other)

#### Create Expense
```http
POST /api/expenses
```

**Required Role:** `driver`, `fleet_manager`, `financial_analyst`, or `admin`

Request Body:
```json
{
  "vehicle_id": 1,
  "expense_type": "toll",
  "description": "Highway toll",
  "amount": 12.50,
  "expense_date": "2024-02-10"
}
```

---

### 8. Dashboard & Analytics

#### Get Dashboard KPIs
```http
GET /api/dashboard/kpis
```

Response (200):
```json
{
  "active_vehicles": 10,
  "available_vehicles": 7,
  "vehicles_in_maintenance": 2,
  "active_trips": 3,
  "pending_trips": 5,
  "drivers_on_duty": 12,
  "fleet_utilization": 30.0
}
```

**KPI Definitions:**
- **Active Vehicles:** Vehicles that are available or on trip (not retired)
- **Available Vehicles:** Vehicles ready for dispatch
- **Vehicles in Maintenance:** Vehicles with status "in_shop"
- **Active Trips:** Trips with status "dispatched"
- **Pending Trips:** Trips with status "draft"
- **Drivers On Duty:** Drivers that are available or on trip
- **Fleet Utilization:** Percentage of vehicles currently on trips

#### Get Fleet Analytics
```http
GET /api/dashboard/analytics
```

Response (200):
```json
{
  "total_distance_covered": 15250.5,
  "average_fuel_efficiency": 8.75,
  "total_operational_cost": 45750.25,
  "fleet_utilization": 30.0
}
```

#### Export Analytics to CSV
```http
GET /api/dashboard/analytics/export
```

**Required Role:** `fleet_manager`, `financial_analyst`, or `admin`

Downloads a CSV file with detailed vehicle analytics including:
- Vehicle details
- Total trips and distances
- Fuel efficiency
- Operational costs
- ROI calculations

#### Export Trips to CSV
```http
GET /api/dashboard/analytics/trips/export
```

**Required Role:** `fleet_manager`, `financial_analyst`, or `admin`

Downloads a CSV file with all trip data.

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Cargo weight (550 kg) exceeds vehicle maximum capacity (500 kg)"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "detail": "Vehicle not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "cargo_weight"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## Business Rules Summary

### Vehicle Rules
1. ✅ Registration number must be unique
2. ✅ Retired vehicles cannot be assigned to trips
3. ✅ Vehicles in shop cannot be assigned to trips
4. ✅ Vehicles already on trip cannot be assigned to another trip

### Driver Rules
1. ✅ License number must be unique
2. ✅ Drivers with expired licenses cannot be assigned to trips
3. ✅ Suspended drivers cannot be assigned to trips
4. ✅ Drivers already on trip cannot be assigned to another trip

### Trip Rules
1. ✅ Cargo weight must not exceed vehicle's maximum load capacity
2. ✅ Dispatching a trip automatically changes vehicle and driver status to "on_trip"
3. ✅ Completing a trip automatically changes vehicle and driver status to "available"
4. ✅ Cancelling a dispatched trip restores vehicle and driver to "available"
5. ✅ Trip lifecycle: Draft → Dispatched → Completed/Cancelled

### Maintenance Rules
1. ✅ Creating active maintenance automatically changes vehicle status to "in_shop"
2. ✅ Closing maintenance restores vehicle to "available" (unless retired)
3. ✅ Vehicles in shop are hidden from dispatch selection

---

## Testing with cURL

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@transitops.com&password=admin123"
```

### Get Vehicles (with auth)
```bash
TOKEN="your_token_here"
curl -X GET "http://localhost:8000/api/vehicles" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Vehicle
```bash
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
```

### Create and Dispatch a Trip
```bash
# 1. Create trip (draft)
TRIP_ID=$(curl -s -X POST "http://localhost:8000/api/trips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": 1,
    "driver_id": 1,
    "source": "Warehouse A",
    "destination": "Store B",
    "cargo_weight": 450,
    "planned_distance": 50
  }' | jq -r '.id')

# 2. Dispatch trip
curl -X POST "http://localhost:8000/api/trips/$TRIP_ID/dispatch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"start_odometer": 15000}'
```

---

## Interactive API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can:
- Test all endpoints directly from your browser
- See request/response schemas
- Authorize once and test multiple endpoints
- View example values

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production using:
- `slowapi` library
- Reverse proxy (nginx) rate limiting
- API Gateway rate limiting

---

## Versioning

Current API version: **v1.0.0**

Future versions should be accessed via: `/api/v2/...`

---

## Support

For issues or questions:
- Check server logs
- Review business rules
- Test with Swagger UI
- Run `python test_api.py` for automated testing
