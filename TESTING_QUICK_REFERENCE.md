# 🧪 Testing Quick Reference

## 🚀 Quick Start Testing

### 1️⃣ Start Backend (Terminal 1)
```bash
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
**Expected:** Server running on http://127.0.0.1:8000

### 2️⃣ Start Frontend (Terminal 2)
```bash
cd transitops-frontend\transitops
npm run dev
```
**Expected:** Server running on http://localhost:5173

### 3️⃣ Run Automated Tests (Terminal 3)
```bash
cd backend
python test_all_endpoints.py
```
**Expected:** All tests pass ✅

---

## 👤 Test Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | admin | Full access to all features |
| `fleet_manager` | `fleet123` | fleet_manager | Manage vehicles, drivers, trips |
| `dispatcher` | `dispatch123` | dispatcher | Dispatch and track trips |
| `driver1` | `driver123` | driver | View assigned trips |
| `safety` | `safety123` | safety_officer | Safety and compliance |
| `analyst` | `analyst123` | financial_analyst | Reports and analytics |

---

## 🔍 Manual Testing Checklist

### Authentication Flow
- [ ] Login page loads at http://localhost:5173
- [ ] Can login with `admin` / `admin123`
- [ ] Redirects to dashboard after login
- [ ] User role badge shows in header
- [ ] Logout button works

### Dashboard Page
- [ ] KPI cards display (Total Vehicles, Active Trips, etc.)
- [ ] Charts render without errors
- [ ] Recent trips list shows data
- [ ] No 404 errors in console

### Fleet Management
- [ ] Vehicles page loads and shows vehicles list
- [ ] Can filter by status/type/region
- [ ] Vehicle details modal opens
- [ ] Add Vehicle form works (if admin/fleet_manager)
- [ ] Edit Vehicle form works

### Driver Management
- [ ] Drivers page loads and shows drivers list
- [ ] Can filter by status
- [ ] Driver details modal opens
- [ ] Add Driver form works (if admin/fleet_manager)
- [ ] Edit Driver form works

### Trip Management
- [ ] Trips page loads and shows trips list
- [ ] Can filter by status
- [ ] Trip details show vehicle and driver info
- [ ] Create Trip form works
- [ ] Dispatch/Complete/Cancel actions work

---

## 🌐 API Endpoint Testing

### Using Browser (Quick Check)
1. Open http://127.0.0.1:8000/docs (Swagger UI)
2. Click "Authorize" button
3. Login to get token
4. Test any endpoint

### Using Python Script (Comprehensive)
```bash
cd backend
python test_all_endpoints.py
```

### Using Postman/Thunder Client
**Base URL:** `http://127.0.0.1:8000`

1. **Login:**
   ```
   POST /api/v1/auth/login
   Body (form-data):
     username: admin
     password: admin123
   ```

2. **Get User Info:**
   ```
   GET /api/v1/auth/me
   Header: Authorization: Bearer <token>
   ```

3. **Get Vehicles:**
   ```
   GET /api/v1/vehicles
   Header: Authorization: Bearer <token>
   ```

---

## 🐛 Common Issues & Fixes

### ❌ "Network Error" or "Failed to fetch"
**Problem:** Backend not running  
**Fix:**
```bash
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

### ❌ "401 Unauthorized" on all requests
**Problem:** Token expired or not being sent  
**Fix:**
1. Logout and login again
2. Check localStorage has `transitops-auth-v1` key
3. Check Network tab for Authorization header

### ❌ "404 Not Found" on API calls
**Problem:** Wrong endpoint path  
**Fix:** All endpoints should use `/api/v1/` prefix (already fixed!)

### ❌ MongoDB Connection Error
**Problem:** MongoDB not running  
**Fix:**
- Check MongoDB is installed and running
- Verify connection string in backend/.env
- Default: `mongodb://localhost:27017/transitops`

### ❌ "Module not found" errors
**Problem:** Dependencies not installed  
**Fix:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd transitops-frontend/transitops
npm install
```

---

## 📊 Expected API Responses

### Login Success
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### User Info
```json
{
  "id": "65f...",
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "Admin User",
  "role": "admin",
  "is_active": true
}
```

### Vehicles List
```json
[
  {
    "id": 1,
    "registration_number": "MH-01-AB-1234",
    "vehicle_type": "truck",
    "status": "available",
    ...
  }
]
```

### Dashboard KPIs
```json
{
  "total_vehicles": 5,
  "active_trips": 3,
  "total_drivers": 4,
  "available_vehicles": 2,
  "monthly_revenue": 150000.0,
  "fuel_expense": 25000.0
}
```

---

## ✅ Success Indicators

### Backend Running Correctly
- Console shows: `Application startup complete`
- No errors about MongoDB connection
- Swagger docs accessible at http://127.0.0.1:8000/docs

### Frontend Running Correctly
- Console shows: `Local: http://localhost:5173/`
- No build errors
- Hot reload working

### Full Stack Working
- Can login successfully
- Dashboard loads with data
- All pages render without errors
- Network tab shows 200 OK for API calls
- No CORS errors in console

---

## 🎯 Test Coverage

✅ **Authentication:** Login, Register, Get User Info  
✅ **Vehicles:** CRUD operations, filters, analytics  
✅ **Drivers:** CRUD operations, availability  
✅ **Trips:** CRUD operations, dispatch, complete, cancel  
✅ **Maintenance:** Records and tracking  
✅ **Fuel:** Logs and consumption  
✅ **Expenses:** Tracking and reports  
✅ **Dashboard:** KPIs and analytics  
✅ **RBAC:** Role-based access control  

---

## 📞 Need Help?

1. Check console for error messages
2. Check Network tab in DevTools
3. Run `python test_all_endpoints.py` to test backend
4. Check backend logs in terminal
5. Verify MongoDB is running
6. Ensure all dependencies installed

**Everything is configured and ready to test! 🎉**
