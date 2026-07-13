# RBAC Testing Guide - Role-Based Access Control

Complete guide to test role-based access control implementation.

---

## ✅ RBAC Implementation Complete!

The following has been implemented:

### Backend:
- ✅ 6 user roles defined (admin, fleet_manager, dispatcher, driver, safety_officer, financial_analyst)
- ✅ Username field added to User model
- ✅ Permission checking function implemented
- ✅ All write operations (POST/PUT/DELETE) protected
- ✅ Authentication uses username instead of email

### Frontend:
- ✅ Role-based menu filtering (users only see allowed pages)
- ✅ Role badges displayed in sidebar and header
- ✅ RoleGuard component for conditional rendering
- ✅ Permissions matrix integrated into auth context
- ✅ Add/Edit/Delete buttons hidden based on role
- ✅ Login form uses username

---

## 🎭 User Roles & Permissions

### Admin
- **Access:** Everything
- **Description:** Full system access, can override all restrictions
- **Pages:** All
- **Actions:** All CRUD operations on all resources

### Fleet Manager
- **Access:** Vehicles, Drivers (view), Trips, Maintenance, Fuel, Expenses, Analytics, Dashboard
- **Description:** Manages entire fleet operations
- **Can:**
  - Create/Edit/Delete vehicles
  - View drivers
  - Create/Dispatch/Complete trips
  - Create/Edit maintenance
  - View/Create expenses
  - Access all analytics

### Dispatcher
- **Access:** Dashboard, Vehicles (view), Drivers (view), Trips
- **Description:** Manages trip dispatch and logistics
- **Can:**
  - View vehicles and drivers
  - Create/Dispatch/Complete/Cancel trips
  - View trip analytics

### Driver
- **Access:** Dashboard (limited), Vehicles (view), Trips (own only)
- **Description:** Assigned drivers with limited access
- **Can:**
  - View own profile
  - View assigned trips
  - Complete own trips
  - View vehicle information

### Safety Officer
- **Access:** Vehicles (view), Drivers, Trips (view), Maintenance, Analytics
- **Description:** Manages driver safety and compliance
- **Can:**
  - Create/Edit/Delete drivers
  - View trips and vehicles
  - View/Create maintenance logs
  - Access safety analytics

### Financial Analyst
- **Access:** Dashboard, Vehicles (view), Trips (view), Maintenance (view), Expenses, Analytics
- **Description:** Analyzes costs and financial performance
- **Can:**
  - View all operational data
  - View expenses and fuel logs
  - Access all analytics
  - Cannot create or modify operational data

---

## 🧪 Testing Steps

### Prerequisite: Clear and Seed Database

```bash
# Clear existing data
mongosh
use safarsaathi
db.dropDatabase()
exit

# Seed with test users (updated seed script with roles)
cd backend
python seed_data.py
```

---

## Test 1: Admin User (Full Access)

### Step 1: Create Admin User

```bash
cd backend
venv\Scripts\activate

python -c "
import asyncio
from app.database import connect_db, close_db
from app.models import User
from app.auth import get_password_hash

async def create_admin():
    await connect_db()
    admin = User(
        username='admin',
        email='admin@safarsaathi.com',
        full_name='Admin User',
        hashed_password=get_password_hash('admin123'),
        role='admin'
    )
    await admin.insert()
    print('Admin user created!')
    await close_db()

asyncio.run(create_admin())
"
```

### Step 2: Test Admin Access

1. **Login:** `admin` / `admin123`
2. **Expected:** See ALL menu items:
   - ✅ Dashboard
   - ✅ Vehicle Registry
   - ✅ Drivers
   - ✅ Trip Dispatcher
   - ✅ Maintenance
   - ✅ Fuel & Expenses
   - ✅ Reports & Analytics
   - ✅ Settings

3. **Test Fleet Page:**
   - ✅ Can see "Add Vehicle" button
   - ✅ Can create new vehicle
   - ✅ Can edit vehicle status
   - ✅ Can delete vehicle (trash icon visible)

4. **Test Drivers Page:**
   - ✅ Can add drivers
   - ✅ Can edit drivers
   - ✅ Can delete drivers

5. **Test Trips Page:**
   - ✅ Can create trips
   - ✅ Can dispatch trips
   - ✅ Can complete trips
   - ✅ Can cancel trips

**Success:** Admin has full access to everything! ✅

---

## Test 2: Fleet Manager (Operational Access)

### Step 1: Create Fleet Manager

```python
# Run in Python console
import asyncio
from app.database import connect_db, close_db
from app.models import User
from app.auth import get_password_hash

async def create_fleet_manager():
    await connect_db()
    user = User(
        username='fleet_manager',
        email='fleet@safarsaathi.com',
        full_name='Fleet Manager',
        hashed_password=get_password_hash('fleet123'),
        role='fleet_manager'
    )
    await user.insert()
    print('Fleet Manager created!')
    await close_db()

asyncio.run(create_fleet_manager())
```

### Step 2: Test Fleet Manager Access

1. **Login:** `fleet_manager` / `fleet123`

2. **Expected Menu:**
   - ✅ Dashboard
   - ✅ Vehicle Registry
   - ✅ Drivers
   - ✅ Trip Dispatcher
   - ✅ Maintenance
   - ✅ Fuel & Expenses
   - ✅ Reports & Analytics
   - ✅ Settings

3. **Test Permissions:**
   - ✅ Can add vehicles
   - ✅ Can edit vehicles
   - ✅ Can delete vehicles
   - ✅ Can view drivers (but create/edit requires safety officer)
   - ✅ Can create and manage trips
   - ✅ Can create maintenance logs
   - ✅ Can view expenses

**Success:** Fleet Manager has operational access! ✅

---

## Test 3: Dispatcher (Trip Management Only)

### Step 1: Create Dispatcher

```python
async def create_dispatcher():
    await connect_db()
    user = User(
        username='dispatcher',
        email='dispatch@safarsaathi.com',
        full_name='Dispatcher User',
        hashed_password=get_password_hash('dispatch123'),
        role='dispatcher'
    )
    await user.insert()
    print('Dispatcher created!')
    await close_db()

asyncio.run(create_dispatcher())
```

### Step 2: Test Dispatcher Access

1. **Login:** `dispatcher` / `dispatch123`

2. **Expected Menu (LIMITED):**
   - ✅ Dashboard
   - ✅ Vehicle Registry (view only)
   - ✅ Drivers (view only)
   - ✅ Trip Dispatcher
   - ✅ Settings
   - ❌ NO Maintenance
   - ❌ NO Fuel & Expenses
   - ❌ NO Reports & Analytics

3. **Test Permissions:**
   - ✅ Can view vehicles
   - ❌ CANNOT see "Add Vehicle" button
   - ❌ CANNOT delete vehicles (no trash icon)
   - ✅ Can create trips
   - ✅ Can dispatch trips
   - ✅ Can complete trips
   - ❌ CANNOT access Maintenance page (not in menu)
   - ❌ CANNOT access Expenses page

**Success:** Dispatcher has limited trip-focused access! ✅

---

## Test 4: Driver (Minimal Access)

### Step 1: Create Driver

```python
async def create_driver():
    await connect_db()
    user = User(
        username='driver1',
        email='driver1@safarsaathi.com',
        full_name='Driver One',
        hashed_password=get_password_hash('driver123'),
        role='driver'
    )
    await user.insert()
    print('Driver created!')
    await close_db()

asyncio.run(create_driver())
```

### Step 2: Test Driver Access

1. **Login:** `driver1` / `driver123`

2. **Expected Menu (VERY LIMITED):**
   - ✅ Dashboard (limited view)
   - ✅ Vehicle Registry (view only)
   - ✅ Trip Dispatcher (view own trips only)
   - ✅ Settings
   - ❌ NO Drivers
   - ❌ NO Maintenance
   - ❌ NO Fuel & Expenses
   - ❌ NO Reports & Analytics

3. **Test Permissions:**
   - ✅ Can view vehicles
   - ❌ CANNOT add vehicles
   - ❌ CANNOT delete vehicles
   - ✅ Can view trips
   - ❌ CANNOT create new trips
   - ❌ CANNOT access most pages

**Success:** Driver has minimal read-only access! ✅

---

## Test 5: Safety Officer (Driver & Safety Focus)

### Step 1: Create Safety Officer

```python
async def create_safety_officer():
    await connect_db()
    user = User(
        username='safety',
        email='safety@safarsaathi.com',
        full_name='Safety Officer',
        hashed_password=get_password_hash('safety123'),
        role='safety_officer'
    )
    await user.insert()
    print('Safety Officer created!')
    await close_db()

asyncio.run(create_safety_officer())
```

### Step 2: Test Safety Officer Access

1. **Login:** `safety` / `safety123`

2. **Expected Menu:**
   - ✅ Dashboard
   - ✅ Vehicle Registry (view only)
   - ✅ Drivers (full access)
   - ✅ Trip Dispatcher (view only)
   - ✅ Maintenance
   - ✅ Reports & Analytics
   - ✅ Settings
   - ❌ NO Fuel & Expenses

3. **Test Permissions:**
   - ✅ Can add drivers
   - ✅ Can edit drivers
   - ✅ Can delete drivers
   - ✅ Can view vehicles
   - ❌ CANNOT add vehicles
   - ✅ Can create maintenance logs
   - ✅ Can view analytics

**Success:** Safety Officer focuses on drivers and safety! ✅

---

## Test 6: Financial Analyst (View & Analytics Only)

### Step 1: Create Financial Analyst

```python
async def create_financial_analyst():
    await connect_db()
    user = User(
        username='analyst',
        email='analyst@safarsaathi.com',
        full_name='Financial Analyst',
        hashed_password=get_password_hash('analyst123'),
        role='financial_analyst'
    )
    await user.insert()
    print('Financial Analyst created!')
    await close_db()

asyncio.run(create_financial_analyst())
```

### Step 2: Test Financial Analyst Access

1. **Login:** `analyst` / `analyst123`

2. **Expected Menu:**
   - ✅ Dashboard
   - ✅ Vehicle Registry (view only)
   - ✅ Trip Dispatcher (view only)
   - ✅ Maintenance (view only)
   - ✅ Fuel & Expenses (view only)
   - ✅ Reports & Analytics
   - ✅ Settings
   - ❌ NO Drivers

3. **Test Permissions:**
   - ✅ Can view all data
   - ✅ Can access analytics
   - ✅ Can view expenses
   - ❌ CANNOT create anything
   - ❌ CANNOT edit anything
   - ❌ CANNOT delete anything

**Success:** Financial Analyst has read-only access! ✅

---

## 🔒 API Endpoint Protection Test

Test backend directly to verify API protection:

### Test 1: Driver Tries to Create Vehicle

```bash
# Login as driver
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=driver1&password=driver123"

# Copy token from response
TOKEN="<paste_token_here>"

# Try to create vehicle (should FAIL with 403)
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_number": "TEST-123",
    "vehicle_name": "Test Vehicle",
    "vehicle_type": "Van",
    "max_load_capacity": 500,
    "odometer": 0,
    "acquisition_cost": 25000,
    "region": "Test"
  }'
```

**Expected Response:**
```json
{
  "detail": "Not authorized to perform this action"
}
```

**Success:** API correctly rejects unauthorized request! ✅

### Test 2: Fleet Manager Creates Vehicle (Should Succeed)

```bash
# Login as fleet_manager
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=fleet_manager&password=fleet123"

# Copy token
TOKEN="<paste_token_here>"

# Create vehicle (should SUCCEED)
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_number": "FM-TEST-001",
    "vehicle_name": "Fleet Manager Test",
    "vehicle_type": "Van",
    "max_load_capacity": 500,
    "odometer": 0,
    "acquisition_cost": 25000,
    "region": "Test"
  }'
```

**Expected:** Success (201 Created) with vehicle data

**Success:** API allows authorized request! ✅

---

## ✅ RBAC Verification Checklist

Use this checklist to verify RBAC is working:

### Backend Verification:
- [ ] User model has `username` field
- [ ] User model has `role` field with default
- [ ] All 6 roles defined in UserRole enum
- [ ] check_permission function exists
- [ ] Write endpoints protected (vehicles, drivers, trips, etc.)
- [ ] Login uses username (not email)
- [ ] JWT token contains username

### Frontend Verification:
- [ ] Login form uses username field
- [ ] Auth context includes user role
- [ ] hasRole() function works
- [ ] canAccess() function works
- [ ] Menu items filtered by role
- [ ] Role badge displayed in sidebar
- [ ] Role badge displayed in header
- [ ] Add buttons hidden for unauthorized roles
- [ ] Delete buttons hidden for unauthorized roles
- [ ] RoleGuard component working

### Role-Specific Tests:
- [ ] Admin sees everything
- [ ] Fleet Manager can manage vehicles/trips
- [ ] Dispatcher can only manage trips
- [ ] Driver has minimal access
- [ ] Safety Officer can manage drivers
- [ ] Financial Analyst is read-only

---

## 🎉 Success Criteria

Your RBAC implementation is complete when:

1. ✅ Different users see different menu items
2. ✅ Role badges display correctly
3. ✅ Buttons disappear for unauthorized roles
4. ✅ API returns 403 for unauthorized requests
5. ✅ API allows authorized requests
6. ✅ Login works with username
7. ✅ All 6 roles work as expected

---

## 📝 Quick Test Script

Create all test users at once:

```python
# save as create_test_users.py
import asyncio
from app.database import connect_db, close_db
from app.models import User
from app.auth import get_password_hash

async def create_all_users():
    await connect_db()
    
    users = [
        ("admin", "admin@safarsaathi.com", "Admin User", "admin123", "admin"),
        ("fleet_manager", "fleet@safarsaathi.com", "Fleet Manager", "fleet123", "fleet_manager"),
        ("dispatcher", "dispatch@safarsaathi.com", "Dispatcher", "dispatch123", "dispatcher"),
        ("driver1", "driver@safarsaathi.com", "Driver One", "driver123", "driver"),
        ("safety", "safety@safarsaathi.com", "Safety Officer", "safety123", "safety_officer"),
        ("analyst", "analyst@safarsaathi.com", "Financial Analyst", "analyst123", "financial_analyst"),
    ]
    
    for username, email, full_name, password, role in users:
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=role
        )
        await user.insert()
        print(f"✅ Created: {username} ({role})")
    
    await close_db()
    print("\n🎉 All test users created!")

if __name__ == "__main__":
    asyncio.run(create_all_users())
```

Run: `python create_test_users.py`

---

## 🔍 Troubleshooting

### Issue: Role badge not showing
**Fix:** Check that User type includes `role: UserRole` field

### Issue: Menu items not filtered
**Fix:** Verify NAV items have `roles` array defined

### Issue: API returns 401 instead of 403
**Fix:** Check JWT token is valid and user is authenticated

### Issue: Buttons still visible
**Fix:** Ensure RoleGuard wraps the buttons correctly

---

🎊 **Congratulations!** Your RBAC system is fully implemented and tested!
