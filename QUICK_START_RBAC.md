# Quick Start - Test RBAC Implementation

## ✅ Setup Complete!

Test users with different roles have been created successfully!

---

## 🚀 Start Testing Now

### Step 1: Start Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Connected to MongoDB database: transitops
```

### Step 2: Start Frontend (New Terminal)

```bash
cd transitops-frontend\transitops
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 3: Open Browser

Navigate to: `http://localhost:5173`

---

## 🎭 Test Different Roles

### Test 1: Admin (Full Access)

**Login:** `admin` / `admin123`

**Expected:**
- ✅ See ALL menu items (Dashboard, Fleet, Drivers, Trips, Maintenance, Expenses, Analytics, Settings)
- ✅ Red "Admin" badge in sidebar and header
- ✅ Can see "Add Vehicle" button on Fleet page
- ✅ Can see delete (trash) icons
- ✅ Can create, edit, delete everything

**Quick Test:**
1. Go to Fleet → Click "Add Vehicle" (should work)
2. Go to Drivers → Add driver (should work)
3. Go to Trips → Create trip (should work)

---

### Test 2: Fleet Manager (Operational Access)

**Login:** `fleet_manager` / `fleet123`

**Expected:**
- ✅ See most menu items (Dashboard, Fleet, Drivers, Trips, Maintenance, Expenses, Analytics, Settings)
- ✅ Blue "Fleet Manager" badge
- ✅ Can add vehicles
- ✅ Can manage trips
- ✅ Can create maintenance logs

**Quick Test:**
1. Go to Fleet → Click "Add Vehicle" (should work)
2. Go to Drivers → Can view but limited create/edit
3. Go to Trips → Full access to create and manage

---

### Test 3: Dispatcher (Trip Focus)

**Login:** `dispatcher` / `dispatch123`

**Expected:**
- ⚠️ LIMITED menu (Dashboard, Fleet (view), Drivers (view), Trips, Settings)
- ✅ Green "Dispatcher" badge
- ❌ NO "Add Vehicle" button on Fleet page
- ❌ NO Maintenance page
- ❌ NO Expenses page
- ❌ NO Analytics page

**Quick Test:**
1. Check sidebar → Should only see 5 menu items
2. Go to Fleet → NO "Add Vehicle" button visible
3. Go to Trips → Can create and manage trips

---

### Test 4: Driver (Minimal Access)

**Login:** `driver1` / `driver123`

**Expected:**
- ⚠️ VERY LIMITED menu (Dashboard (limited), Fleet (view), Trips (view), Settings)
- ✅ Yellow "Driver" badge
- ❌ Cannot add or delete anything
- ❌ NO Drivers page
- ❌ NO Maintenance page
- ❌ NO Expenses page
- ❌ NO Analytics page

**Quick Test:**
1. Check sidebar → Minimal menu items
2. Go to Fleet → Can view only, no action buttons
3. Go to Trips → Can view trips only

---

### Test 5: Safety Officer (Driver Safety)

**Login:** `safety` / `safety123`

**Expected:**
- ✅ Purple "Safety Officer" badge
- ✅ Can manage drivers (add/edit/delete)
- ✅ Can view vehicles and trips
- ✅ Can create maintenance logs
- ✅ Can access analytics
- ❌ Cannot add vehicles
- ❌ NO Expenses page

**Quick Test:**
1. Go to Drivers → Full access to add/edit drivers
2. Go to Fleet → Can view only
3. Go to Maintenance → Can create logs

---

### Test 6: Financial Analyst (Read-Only)

**Login:** `analyst` / `analyst123`

**Expected:**
- ✅ Orange "Financial Analyst" badge
- ✅ Can view all data
- ✅ Can access all analytics
- ❌ Cannot create or modify anything
- ❌ All action buttons hidden

**Quick Test:**
1. Go to Fleet → Can see vehicles, NO "Add Vehicle" button
2. Go to Expenses → Can view expenses
3. Go to Analytics → Full access to reports

---

## 🔍 Visual Verification

### What to Look For:

#### 1. **Role Badges**
- Sidebar: Look for colored badge below email (e.g., "🛡️ Admin" in red)
- Header: Badge next to user avatar

#### 2. **Menu Items**
- Different roles see different menu items
- Admin sees everything
- Driver sees minimal items

#### 3. **Action Buttons**
- "Add Vehicle" button only visible to authorized roles
- Delete (trash) icons only visible to authorized roles
- Edit buttons conditional based on role

#### 4. **API Protection**
Test backend directly:

```bash
# Login as driver
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=driver1&password=driver123"

# Copy the access_token from response

# Try to create vehicle (should FAIL with 403)
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"registration_number\":\"TEST\",\"vehicle_name\":\"Test\",\"vehicle_type\":\"Van\",\"max_load_capacity\":500,\"odometer\":0,\"acquisition_cost\":25000,\"region\":\"Test\"}"

# Expected: {"detail":"Not authorized to perform this action"}
```

---

## ✅ Success Checklist

Your RBAC is working correctly if:

- [ ] Different users see different menu items
- [ ] Role badges display with correct colors
- [ ] Admin sees all 8 menu items
- [ ] Driver sees only 4 menu items
- [ ] "Add Vehicle" button visible for admin/fleet_manager only
- [ ] "Add Vehicle" button hidden for driver/dispatcher
- [ ] Delete icons visible for authorized roles only
- [ ] API returns 403 for unauthorized requests
- [ ] Login works with username (not email)

---

## 📊 Role Permissions Matrix

| Feature | Admin | Fleet Mgr | Dispatcher | Driver | Safety | Analyst |
|---------|-------|-----------|------------|--------|--------|---------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ (limited) | ✅ | ✅ |
| **Vehicles View** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Vehicles Create** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vehicles Edit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vehicles Delete** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Drivers View** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Drivers Create** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Trips View** | ✅ | ✅ | ✅ | ✅ (own) | ✅ | ✅ |
| **Trips Create** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Trips Dispatch** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Maintenance** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ (view) |
| **Expenses** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (view) |
| **Analytics** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |

---

## 🐛 Troubleshooting

### Issue: Login fails with "Incorrect username or password"
**Solution:** Make sure you're using the username (not email). Use `admin` not `admin@safarsaathi.com`

### Issue: No role badge showing
**Solution:** Check browser console (F12) for errors. Refresh the page.

### Issue: All menus visible regardless of role
**Solution:** Clear browser cache and local storage. Logout and login again.

### Issue: Backend returns 401 instead of 403
**Solution:** Token might be invalid. Logout and login again to get a fresh token.

### Issue: Menu items not filtering
**Solution:** Check browser console for JavaScript errors. Verify frontend is using latest code.

---

## 📖 Additional Resources

- **RBAC_TESTING_GUIDE.md** - Comprehensive testing instructions
- **RBAC_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **DYNAMIC_TESTING_GUIDE.md** - How to verify data flows dynamically

---

## 🎉 You're Ready!

**All 6 roles are configured and ready to test!**

Start both servers, login with different users, and observe how the interface changes based on role!

Test Credentials:
- `admin` / `admin123` - Full access
- `fleet_manager` / `fleet123` - Operational
- `dispatcher` / `dispatch123` - Trip focus
- `driver1` / `driver123` - Minimal
- `safety` / `safety123` - Driver safety
- `analyst` / `analyst123` - Read-only
