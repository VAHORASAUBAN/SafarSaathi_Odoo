# SafarSaathi Testing Guide

Complete guide to test your Frontend, Backend, and MongoDB integration.

---

## Prerequisites Checklist

Before testing, ensure you have:

- ✅ MongoDB installed and running
- ✅ Python virtual environment activated
- ✅ All backend dependencies installed
- ✅ Frontend dependencies installed (npm packages)
- ✅ `.env` file configured in backend folder

---

## Step 1: Start MongoDB

### Windows:

```bash
# Option 1: If MongoDB is installed as a service
net start MongoDB

# Option 2: If running manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Verify MongoDB is running:

```bash
# Connect to MongoDB shell
mongosh

# You should see connection success message
# Type 'exit' to leave the shell
```

**Expected Output:**
```
Current Mongosh Log ID: xxxxx
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.x
```

---

## Step 2: Configure Backend Environment

### Create `.env` file in `backend` folder:

```bash
cd backend
copy .env.example .env
```

### Edit `.env` file with your settings:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=safarsaathi

# JWT Configuration
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=SafarSaathi
```

---

## Step 3: Start Backend Server

### Activate virtual environment and start:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\...\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Connected to MongoDB database: safarsaathi
INFO:     Application startup complete.
```

### Test Backend Health:

Open browser and visit: `http://127.0.0.1:8000/docs`

You should see the **FastAPI Swagger UI** with all API endpoints documented.

---

## Step 4: Seed Database with Test Data

### Open a NEW terminal (keep backend running):

```bash
cd backend
venv\Scripts\activate
python seed_data.py
```

**Expected Output:**
```
🌱 Starting database seeding...
✅ Created test user: admin / password: admin123
✅ Created 5 vehicles
✅ Created 4 drivers
✅ Created 6 trips
✅ Created 4 maintenance logs
✅ Created 5 fuel logs
✅ Created 4 expenses
🎉 Database seeded successfully!
```

---

## Step 5: Test Backend API Endpoints

### Test 1: Health Check

```bash
curl http://127.0.0.1:8000/health
```

**Expected:** `{"status":"healthy"}`

### Test 2: User Login

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin&password=admin123"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Test 3: Get Vehicles (with authentication)

```bash
# First, get the token from login response above, then:
curl -X GET "http://127.0.0.1:8000/api/v1/vehicles" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** JSON array of vehicles

### Test 4: Get Dashboard KPIs

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/dashboard/kpis" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "total_vehicles": 5,
  "active_trips": 2,
  "total_drivers": 4,
  "monthly_revenue": 0
}
```

---

## Step 6: Verify MongoDB Data

### Open MongoDB Compass (GUI) or use mongosh:

```bash
mongosh
use safarsaathi
db.vehicles.find().pretty()
db.drivers.find().pretty()
db.trips.find().pretty()
```

**Expected:** You should see the seeded data in each collection.

---

## Step 7: Start Frontend

### Open a NEW terminal:

```bash
cd transitops-frontend\transitops
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Open browser: `http://localhost:5173`

You should see the SafarSaathi login page.

---

## Step 8: Test Frontend-Backend Integration

### Test 1: Login Flow

1. **Go to:** `http://localhost:5173`
2. **Enter credentials:**
   - Username: `admin`
   - Password: `admin123`
3. **Click:** "Sign In"
4. **Expected:** Redirect to dashboard

**✅ Success indicators:**
- No console errors in browser DevTools (F12)
- Token stored in localStorage
- Dashboard loads with real data

### Test 2: Dashboard Page

**Check for:**
- ✅ KPI cards showing numbers (Total Vehicles, Active Trips, etc.)
- ✅ Recent trips table populated
- ✅ Vehicle status chart with data
- ✅ No "Loading..." stuck forever
- ✅ No error messages

**Open Browser DevTools (F12) → Network tab:**
- Should see successful API calls to `/api/v1/dashboard/kpis`
- Status: 200 OK

### Test 3: Fleet Management

1. **Navigate to:** Fleet page (sidebar)
2. **Expected:** List of vehicles from database
3. **Click:** "Add Vehicle" button
4. **Fill form:**
   - Registration: `TEST-123`
   - Name: `Test Truck`
   - Type: `Truck`
   - Capacity: `5000`
   - Status: `Available`
   - Region: `Test Region`
5. **Click:** "Add Vehicle"
6. **Expected:** 
   - Success toast notification
   - New vehicle appears in list
   - Network tab shows POST to `/api/v1/vehicles` → 200 OK

### Test 4: Edit Vehicle

1. **Click:** Edit icon on any vehicle
2. **Change:** Vehicle name
3. **Click:** "Save Changes"
4. **Expected:**
   - Success notification
   - Vehicle updated in list
   - PUT request to `/api/v1/vehicles/{id}` → 200 OK

### Test 5: Drivers Page

1. **Navigate to:** Drivers page
2. **Expected:** List of drivers from database
3. **Test CRUD operations** (Add, Edit, Delete)
4. **Verify:** All operations reflect in MongoDB

### Test 6: Trips Workflow

1. **Navigate to:** Trips page
2. **Click:** "Create Trip"
3. **Fill form:**
   - Source: `Mumbai`
   - Destination: `Delhi`
   - Vehicle: Select any available vehicle
   - Driver: Select any available driver
   - Cargo Weight: `3000`
   - Planned Distance: `1400`
4. **Click:** "Create Trip"
5. **Expected:** Trip created with "Draft" status

**Test Trip Dispatch:**
1. **Click:** "Dispatch" on the new trip
2. **Expected:**
   - Trip status → "Dispatched"
   - Vehicle status → "On Trip"
   - Driver status → "On Trip"

**Test Trip Completion:**
1. **Click:** "Complete" on dispatched trip
2. **Fill form:**
   - Final Odometer: `45000`
   - Fuel Consumed: `140`
3. **Click:** "Complete Trip"
4. **Expected:**
   - Trip status → "Completed"
   - Vehicle status → "Available"
   - Driver status → "Available"

### Test 7: Maintenance Page

1. **Navigate to:** Maintenance page
2. **Click:** "Add Maintenance"
3. **Fill form and submit**
4. **Expected:** Maintenance log created

### Test 8: Expenses Page

1. **Navigate to:** Expenses page
2. **Expected:** Fuel logs and expenses displayed
3. **Test:** Add new fuel log
4. **Verify:** Appears in list

### Test 9: Analytics Page

1. **Navigate to:** Analytics page
2. **Expected:**
   - Charts populated with real data
   - Fuel efficiency chart
   - Monthly expenses chart
   - Trip statistics
3. **Verify:** No empty charts (unless no data)

---

## Step 9: Verify Data Persistence

### Test data persists across restarts:

1. **Add a new vehicle** in frontend
2. **Stop backend server** (Ctrl+C)
3. **Stop frontend** (Ctrl+C)
4. **Restart backend** (`uvicorn app.main:app --reload`)
5. **Restart frontend** (`npm run dev`)
6. **Login again**
7. **Navigate to Fleet page**
8. **Expected:** The vehicle you added is still there

**Verify in MongoDB:**
```bash
mongosh
use safarsaathi
db.vehicles.find({registration_number: "TEST-123"})
```

---

## Step 10: Test Error Handling

### Test 1: Network Error (Backend Down)

1. **Stop backend server**
2. **In frontend:** Try to load Dashboard
3. **Expected:** Error message displayed, not infinite loading

### Test 2: Invalid Token

1. **Open DevTools → Application → Local Storage**
2. **Delete:** `token` key
3. **Refresh page**
4. **Expected:** Redirect to login page

### Test 3: Validation Errors

1. **Try to create vehicle with empty registration**
2. **Expected:** Form validation error
3. **Try to dispatch trip without vehicle**
4. **Expected:** Error message from backend

---

## Common Issues & Solutions

### Issue: MongoDB connection failed

**Error:** `ServerSelectionTimeoutError: connection timeout`

**Solution:**
- Check MongoDB is running: `mongosh`
- Verify `MONGODB_URL` in `.env` file
- Check firewall settings

### Issue: Backend import errors

**Error:** `ModuleNotFoundError: No module named 'motor'`

**Solution:**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Frontend CORS errors

**Error:** `Access to fetch at 'http://127.0.0.1:8000' has been blocked by CORS`

**Solution:**
- Check backend `main.py` has CORS middleware configured
- Verify frontend `.env` has correct `VITE_API_URL`

### Issue: JWT token expired

**Error:** `401 Unauthorized`

**Solution:**
- Login again to get new token
- Increase `ACCESS_TOKEN_EXPIRE_MINUTES` in backend `.env`

### Issue: Frontend build errors

**Error:** `Cannot find module` or syntax errors

**Solution:**
```bash
cd transitops-frontend\transitops
npm install
npm run dev
```

---

## Success Checklist

Your application is working properly if:

- ✅ MongoDB connection successful
- ✅ Backend starts without errors
- ✅ Swagger UI accessible at `http://127.0.0.1:8000/docs`
- ✅ Database seeded with test data
- ✅ Frontend starts and loads at `http://localhost:5173`
- ✅ Login works with `admin` / `admin123`
- ✅ Dashboard shows real data from database
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Trip workflow works (Create → Dispatch → Complete)
- ✅ Data persists after restart
- ✅ No console errors in browser DevTools
- ✅ All API calls return 200 OK (check Network tab)

---

## Quick Test Commands

### Terminal 1 - MongoDB
```bash
mongosh
```

### Terminal 2 - Backend
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 3 - Frontend
```bash
cd transitops-frontend\transitops
npm run dev
```

### Browser
1. Open: `http://localhost:5173`
2. Login: `admin` / `admin123`
3. Test all pages

---

## Need Help?

### Check Logs:

**Backend logs:** Terminal where uvicorn is running
**Frontend logs:** Browser DevTools → Console (F12)
**MongoDB logs:** Check MongoDB log files or mongosh output

### Useful MongoDB Commands:

```javascript
// Switch to database
use safarsaathi

// Count documents
db.vehicles.countDocuments()
db.drivers.countDocuments()
db.trips.countDocuments()

// View all collections
show collections

// Clear collection (if needed)
db.vehicles.deleteMany({})

// Drop database (careful!)
db.dropDatabase()
```

---

## Next Steps

Once everything is working:

1. **Create your own user account** (not using admin)
2. **Add real data** for your fleet
3. **Test on different browsers** (Chrome, Firefox, Edge)
4. **Test on mobile responsive view**
5. **Set up production MongoDB** (MongoDB Atlas)
6. **Configure environment variables** for production
7. **Set up proper authentication** and user roles

---

🎉 **Congratulations!** Your full-stack SafarSaathi application is now running with MongoDB!
