# Dynamic Testing Guide - Verify Real Data Flow

This guide proves your application is **truly dynamic** with real data flowing through MongoDB → Backend → Frontend.

---

## 🎯 Goal

Verify that:
1. Frontend fetches data from Backend API (not mock data)
2. Backend reads/writes to MongoDB (not hardcoded)
3. Changes persist across page refreshes and server restarts
4. All CRUD operations work end-to-end

---

## Prerequisites

Make sure all three are running:

```bash
# Terminal 1 - MongoDB
mongosh

# Terminal 2 - Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 3 - Frontend  
cd transitops-frontend\transitops
npm run dev
```

---

## Test 1: Empty Database → Verify No Static Data

### Step 1: Clear MongoDB completely

```bash
mongosh
use safarsaathi
db.dropDatabase()
exit
```

### Step 2: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Start again
uvicorn app.main:app --reload
```

### Step 3: Check Frontend

1. Open browser: `http://localhost:5173`
2. Try to login with `admin` / `admin123`

**Expected Result:** ❌ Login should FAIL (user doesn't exist)
- If login works, it means frontend is using static data ❌

**Success Indicator:** 🟢 Login fails = Proves frontend is checking real backend

---

## Test 2: Create User → Verify Backend Creates in MongoDB

### Step 1: Create user via Backend API

Open new terminal:

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@test.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}"
```

**Expected:** Success response with user data

### Step 2: Verify in MongoDB

```bash
mongosh
use safarsaathi
db.User.find().pretty()
```

**Expected Output:**
```json
{
  "_id": ObjectId("..."),
  "username": "testuser",
  "email": "test@test.com",
  "hashed_password": "$2b$12$...",
  "full_name": "Test User"
}
```

**Success Indicator:** 🟢 User exists in MongoDB = Backend writes to DB

### Step 3: Login via Frontend

1. Open: `http://localhost:5173`
2. Login: `testuser` / `test123`

**Expected:** ✅ Login successful, redirects to dashboard

**Success Indicator:** 🟢 Login works = Frontend reads from backend

---

## Test 3: Add Vehicle via Frontend → Verify in MongoDB

### Step 1: Add vehicle through UI

1. Login to frontend
2. Navigate to **Fleet** page
3. Click **"Add Vehicle"**
4. Fill form:
   - Registration: `TEST-DYNAMIC-001`
   - Name: `Dynamic Test Vehicle`
   - Type: `Truck`
   - Capacity: `5000`
   - Odometer: `10000`
   - Cost: `50000`
   - Status: `Available`
   - Region: `Test Region`
5. Click **"Add Vehicle"**

**Expected:** 
- ✅ Success toast notification
- Vehicle appears in list immediately

### Step 2: Check MongoDB directly

```bash
mongosh
use safarsaathi
db.Vehicle.find({registration_number: "TEST-DYNAMIC-001"}).pretty()
```

**Expected Output:**
```json
{
  "_id": ObjectId("..."),
  "registration_number": "TEST-DYNAMIC-001",
  "vehicle_name": "Dynamic Test Vehicle",
  "vehicle_type": "Truck",
  "max_load_capacity": 5000.0,
  "odometer": 10000.0,
  "status": "available"
}
```

**Success Indicator:** 🟢 Vehicle in MongoDB = Frontend → Backend → MongoDB works!

### Step 3: Verify data flow with Browser DevTools

1. Open DevTools (F12) → **Network** tab
2. Clear network log
3. Refresh Fleet page
4. Look for API calls:
   - `GET http://127.0.0.1:8000/api/v1/vehicles`
   - Status: `200 OK`
5. Click on the request → **Preview** tab

**Expected:** See the vehicle you just added in the JSON response

**Success Indicator:** 🟢 Vehicle in API response = Backend serves real DB data

---

## Test 4: Edit Vehicle → Verify Update in MongoDB

### Step 1: Edit via Frontend

1. On Fleet page, find `TEST-DYNAMIC-001`
2. Click **Edit** icon
3. Change name to: `Dynamic Test Vehicle UPDATED`
4. Change odometer to: `12000`
5. Click **"Save Changes"**

**Expected:** Success notification

### Step 2: Check MongoDB

```bash
mongosh
use safarsaathi
db.Vehicle.find({registration_number: "TEST-DYNAMIC-001"}).pretty()
```

**Expected:** Name and odometer should be updated

**Success Indicator:** 🟢 Data updated in MongoDB = Update operation is dynamic

---

## Test 5: Delete Vehicle → Verify Removal from MongoDB

### Step 1: Delete via Frontend

1. On Fleet page, find `TEST-DYNAMIC-001`
2. Click **Delete** icon
3. Confirm deletion

**Expected:** Vehicle removed from list

### Step 2: Check MongoDB

```bash
mongosh
use safarsaathi
db.Vehicle.find({registration_number: "TEST-DYNAMIC-001"}).count()
```

**Expected Output:** `0`

**Success Indicator:** 🟢 Vehicle deleted from MongoDB = Delete is dynamic

---

## Test 6: Data Persistence → Verify No Mock Data

### Step 1: Stop all servers

```bash
# Stop Frontend (Ctrl+C)
# Stop Backend (Ctrl+C)
# MongoDB keeps running
```

### Step 2: Restart Backend and Frontend

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd transitops-frontend\transitops
npm run dev
```

### Step 3: Check Frontend

1. Login again: `testuser` / `test123`
2. Go to Fleet page

**Expected:** All vehicles you added are still there

**Success Indicator:** 🟢 Data persists = No mock/static data being used

---

## Test 7: Backend API Direct Test → No Frontend

Test backend independently to prove it's reading from MongoDB:

### Step 1: Add driver via MongoDB directly

```bash
mongosh
use safarsaathi

db.Driver.insertOne({
  "name": "Direct MongoDB Driver",
  "license_number": "DB-DIRECT-123",
  "license_category": "LMV",
  "license_expiry_date": "2025-12-31",
  "contact_number": "+91-9999999999",
  "safety_score": 100.0,
  "status": "available"
})

exit
```

### Step 2: Fetch via Backend API

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/drivers" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

*Replace `YOUR_TOKEN_HERE` with token from login response*

**Expected:** See `Direct MongoDB Driver` in the response

**Success Indicator:** 🟢 Backend reads directly from MongoDB

### Step 3: Check Frontend

1. Go to **Drivers** page in browser
2. Refresh if needed

**Expected:** See `Direct MongoDB Driver` in the list

**Success Indicator:** 🟢 Frontend displays real backend data

---

## Test 8: Trip Workflow → Complex Dynamic Test

This tests relationships between multiple collections:

### Step 1: Add test data via Frontend

1. **Add 2 Vehicles:**
   - `TRIP-TEST-V1` - Status: Available
   - `TRIP-TEST-V2` - Status: Available

2. **Add 2 Drivers:**
   - Name: `Trip Test Driver 1` - Status: Available
   - Name: `Trip Test Driver 2` - Status: Available

### Step 2: Create Trip

1. Go to **Trips** page
2. Click **"Create Trip"**
3. Fill form:
   - Source: `Mumbai`
   - Destination: `Delhi`
   - Vehicle: Select `TRIP-TEST-V1`
   - Driver: Select `Trip Test Driver 1`
   - Cargo Weight: `3000`
   - Planned Distance: `1400`
4. Click **"Create Trip"**

**Expected:** Trip created with "Draft" status

### Step 3: Verify in MongoDB

```bash
mongosh
use safarsaathi

# Check trip
db.Trip.find({source: "Mumbai"}).pretty()

# Check vehicle status (should still be "available")
db.Vehicle.find({registration_number: "TRIP-TEST-V1"}).pretty()
```

**Expected:** Trip exists, vehicle status still "available"

### Step 4: Dispatch Trip

1. Click **"Dispatch"** on the trip
2. Watch the UI update

**Expected:**
- Trip status → "Dispatched"
- Vehicle status → "On Trip"  
- Driver status → "On Trip"

### Step 5: Verify status changes in MongoDB

```bash
mongosh
use safarsaathi

# Check trip status
db.Trip.findOne({source: "Mumbai"}).status

# Check vehicle status
db.Vehicle.findOne({registration_number: "TRIP-TEST-V1"}).status

# Check driver status
db.Driver.findOne({name: "Trip Test Driver 1"}).status
```

**Expected Output:**
```
trip: "dispatched"
vehicle: "on_trip"
driver: "on_trip"
```

**Success Indicator:** 🟢 Status changes persisted across 3 collections = Complex dynamic operations work!

### Step 6: Complete Trip

1. Click **"Complete"** on dispatched trip
2. Fill form:
   - Final Odometer: `11400`
   - Fuel Consumed: `140`
3. Submit

**Expected:**
- Trip status → "Completed"
- Vehicle status → "Available"
- Driver status → "Available"
- Vehicle odometer updated

### Step 7: Final MongoDB verification

```bash
mongosh
use safarsaathi

db.Trip.findOne({source: "Mumbai"})
db.Vehicle.findOne({registration_number: "TRIP-TEST-V1"})
db.Driver.findOne({name: "Trip Test Driver 1"})
```

**Expected:** All statuses reverted, odometer updated

**Success Indicator:** 🟢 Complex workflow with multiple entity updates works dynamically!

---

## Test 9: Dashboard KPIs → Real-time Calculation

### Step 1: Note current KPIs

1. Go to **Dashboard** page
2. Note the numbers:
   - Total Vehicles: `X`
   - Active Trips: `Y`
   - Total Drivers: `Z`

### Step 2: Add new vehicle

1. Go to Fleet → Add Vehicle
2. Add any vehicle

### Step 3: Check Dashboard

1. Go back to Dashboard (or refresh)
2. Check **Total Vehicles** count

**Expected:** Count increased by 1

**Success Indicator:** 🟢 KPIs calculated from real database

### Step 4: Verify calculation in MongoDB

```bash
mongosh
use safarsaathi
db.Vehicle.countDocuments()
```

**Expected:** Same number as shown on Dashboard

---

## Test 10: Browser DevTools Verification

### Network Tab Test:

1. Open DevTools (F12) → **Network** tab
2. Check **"Preserve log"**
3. Navigate through all pages:
   - Dashboard
   - Fleet
   - Drivers
   - Trips
   - Maintenance
   - Expenses
   - Analytics

### What to look for:

**✅ DYNAMIC - Good signs:**
- API calls to `http://127.0.0.1:8000/api/v1/*`
- Status: `200 OK` or `201 Created`
- Response: JSON data from backend
- Each page makes API calls on load

**❌ STATIC - Bad signs:**
- No API calls
- Responses from `localhost:5173` (frontend serving data)
- Same data regardless of database changes
- `useStore()` calls returning hardcoded data

### Console Tab Test:

**Expected:** 
- No errors related to API calls
- React Query success logs
- No "mock data" or "fallback data" warnings

---

## Test 11: API Authentication Test

Proves that frontend is using real JWT tokens:

### Step 1: Login and save token

1. Login via frontend
2. Open DevTools → **Application** → **Local Storage** → `http://localhost:5173`
3. Copy the `token` value

### Step 2: Delete token

1. Delete the `token` from Local Storage
2. Refresh page

**Expected:** Redirected to login page

**Success Indicator:** 🟢 Authentication is dynamic (not hardcoded)

### Step 3: Test with invalid token

1. Login again
2. Open Local Storage
3. Modify token (change few characters)
4. Try to navigate to Dashboard

**Expected:** 401 Unauthorized error, redirected to login

**Success Indicator:** 🟢 Backend validates tokens from database

---

## Test 12: Multi-user Test

Proves that different users see different data:

### Step 1: Create second user

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"user2\",\"email\":\"user2@test.com\",\"password\":\"pass123\",\"full_name\":\"User Two\"}"
```

### Step 2: Login as user1 in Chrome

1. Login as `testuser` / `test123`
2. Add a vehicle: `USER1-VEHICLE`

### Step 3: Login as user2 in Firefox/Incognito

1. Login as `user2` / `pass123`
2. Add a vehicle: `USER2-VEHICLE`

### Step 4: Check both browsers

**Expected:** 
- Both users see ALL vehicles (shared database)
- Both vehicles visible to both users

**Success Indicator:** 🟢 Shared database, not user-specific static data

---

## ✅ Dynamic System Checklist

Your system is **fully dynamic** if:

- ✅ Empty database = Empty UI (no mock data)
- ✅ Add via Frontend → Appears in MongoDB
- ✅ Add via MongoDB → Appears in Frontend
- ✅ Edit in Frontend → Updated in MongoDB
- ✅ Delete in Frontend → Removed from MongoDB
- ✅ Data persists after server restart
- ✅ All pages make API calls (visible in Network tab)
- ✅ No mock/static data in console logs
- ✅ KPIs calculated from real database counts
- ✅ Complex workflows (trips) update multiple collections
- ✅ Authentication uses real JWT tokens
- ✅ Invalid tokens are rejected
- ✅ All CRUD operations work end-to-end

---

## 🔍 How to Spot Static/Mock Data

**Warning Signs:**

1. **No API calls in Network tab** → Static data
2. **Same data after database clear** → Hardcoded data
3. **Data doesn't persist after restart** → In-memory only
4. **Can't see data added via MongoDB** → Not reading from DB
5. **No authentication errors with invalid token** → Fake auth
6. **Instant page loads (no loading states)** → Cached/mock data

---

## 🐛 If Something is Static

### Check Frontend Code:

```typescript
// ❌ BAD - Static data
const vehicles = [
  { id: 1, name: "Truck 1" },
  { id: 2, name: "Truck 2" }
];

// ✅ GOOD - Dynamic data
const { data: vehicles } = useVehicles();
```

### Check for useStore():

```bash
# Search for mock data usage
cd transitops-frontend\transitops
grep -r "useStore" src/routes/
```

**Expected:** No results (all pages should use React Query hooks)

---

## 📊 Final Verification Command

Run this to see all your dynamic data:

```bash
mongosh
use safarsaathi

print("=== DATABASE SUMMARY ===")
print("Users: " + db.User.countDocuments())
print("Vehicles: " + db.Vehicle.countDocuments())
print("Drivers: " + db.Driver.countDocuments())  
print("Trips: " + db.Trip.countDocuments())
print("Maintenance: " + db.MaintenanceLog.countDocuments())
print("Fuel Logs: " + db.FuelLog.countDocuments())
print("Expenses: " + db.Expense.countDocuments())

print("\n=== LATEST ENTRIES ===")
print("Last Vehicle:")
db.Vehicle.find().sort({_id: -1}).limit(1).pretty()

print("\nLast Trip:")
db.Trip.find().sort({_id: -1}).limit(1).pretty()
```

---

## 🎉 Success!

If all tests pass, your application is **100% dynamic** with real data flowing:

```
MongoDB ←→ Backend API ←→ Frontend UI
```

No mock data, no static files, no hardcoded values! 🚀
