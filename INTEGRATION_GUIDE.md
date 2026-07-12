# Frontend-Backend Integration Guide

This guide explains how to connect the TransitOps frontend with the FastAPI backend.

## ✅ What Has Been Set Up

### 1. API Client Layer (`src/lib/api.ts`)
- Base HTTP client with JWT authentication
- Automatic Bearer token injection from localStorage
- Error handling and response parsing
- Support for JSON and form data requests

### 2. API Types (`src/lib/api-types.ts`)
- Complete TypeScript interfaces matching backend schemas
- Request and response types for all endpoints
- Type-safe data flow throughout the application

### 3. API Services (`src/lib/api-services.ts`)
- Organized service functions for all backend endpoints:
  - `authService` - Login, register, get current user
  - `vehicleService` - CRUD operations + analytics
  - `driverService` - CRUD operations + availability
  - `tripService` - Create, dispatch, complete, cancel
  - `maintenanceService` - Create and update logs
  - `fuelService` - Fuel log creation
  - `expenseService` - Expense tracking
  - `dashboardService` - KPIs and analytics

### 4. React Query Hooks (`src/hooks/`)
- `useVehicles`, `useCreateVehicle`, `useUpdateVehicle`, `useDeleteVehicle`
- `useDrivers`, `useCreateDriver`, `useUpdateDriver`, `useDeleteDriver`
- `useTrips`, `useCreateTrip`, `useDispatchTrip`, `useCompleteTrip`, `useCancelTrip`
- `useMaintenance`, `useCreateMaintenance`, `useUpdateMaintenance`
- `useFuelLogs`, `useCreateFuelLog`
- `useExpenses`, `useCreateExpense`
- `useDashboardKPIs`, `useDashboardAnalytics`

Each hook includes:
- Automatic loading/error states
- Query caching with React Query
- Automatic cache invalidation on mutations
- Optimized refetching

### 5. Updated Authentication (`src/lib/auth.tsx`)
- Real JWT-based authentication
- Token stored in localStorage
- Automatic token validation on app load
- Maps backend roles to frontend roles
- Async login/logout functions

### 6. Environment Configuration
- `.env` file for API base URL configuration
- Default: `VITE_API_URL=http://localhost:8000`

### 7. Updated Login Page (`src/routes/auth.tsx`)
- Async login with loading state
- Error handling and display
- Quick-fill for admin account
- No more demo accounts (uses real backend)

## 🚀 How to Use

### Step 1: Start the Backend

```bash
cd backend
# Make sure virtual environment is activated
venv\Scripts\activate

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should be running at http://localhost:8000

### Step 2: Create a Test User (if needed)

The backend comes with seeded data. Check `backend/seed_data.py` or create a user:

```bash
# Using curl or the Swagger UI at http://localhost:8000/docs
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@transitops.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

### Step 3: Start the Frontend

```bash
cd transitops-frontend/transitops
npm install  # if not already done
npm run dev
```

The frontend will start at http://localhost:5173 (or similar)

### Step 4: Login

1. Go to the login page
2. Use the quick-fill button for admin account or enter:
   - Email: `admin@transitops.com`
   - Password: `admin123`
3. Click "Sign In"

You should now be logged in with a JWT token!

## 📝 Next Steps: Updating Pages to Use Real Data

The hooks are ready, but pages still need to be updated. Here's the migration pattern:

### Example: Fleet Page Migration

**Before (using mock store):**
```tsx
import { useStore } from "@/lib/store";

function Fleet() {
  const { vehicles, addVehicle } = useStore();
  // ...
}
```

**After (using API):**
```tsx
import { useVehicles, useCreateVehicle } from "@/hooks/useVehicles";

function Fleet() {
  const { data: vehicles = [], isLoading, error } = useVehicles();
  const createVehicle = useCreateVehicle();
  
  // Handle loading
  if (isLoading) return <div>Loading vehicles...</div>;
  
  // Handle errors
  if (error) return <div>Error: {error.message}</div>;
  
  // Use vehicles data
  const handleCreate = async (vehicleData) => {
    try {
      await createVehicle.mutateAsync({
        registration_number: vehicleData.regNumber,
        vehicle_name: vehicleData.name,
        vehicle_type: vehicleData.type,
        max_load_capacity: vehicleData.capacity,
        odometer: vehicleData.odometer,
        acquisition_cost: vehicleData.acquisitionCost,
        region: vehicleData.region,
      });
      toast.success("Vehicle created!");
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  return (
    // ... render with vehicles data
  );
}
```

### Key Changes Needed Per Page:

#### 1. Dashboard (`_app.dashboard.tsx`)
- Replace `useStore()` with `useDashboardKPIs()` and `useVehicles()`
- Add loading states
- Map API data to display format

#### 2. Fleet (`_app.fleet.tsx`)
- Replace `useStore()` with `useVehicles()`, `useCreateVehicle()`, `useUpdateVehicle()`, `useDeleteVehicle()`
- Map field names (frontend uses `regNumber`, backend uses `registration_number`)
- Handle async mutations

#### 3. Drivers (`_app.drivers.tsx`)
- Replace with driver hooks
- Map `licenseExpiry` → `license_expiry_date`

#### 4. Trips (`_app.trips.tsx`)
- Use `useTrips()`, `useAvailableVehicles()`, `useAvailableDrivers()`
- Use `useDispatchTrip()`, `useCompleteTrip()`, `useCancelTrip()`
- Map field names

#### 5. Maintenance (`_app.maintenance.tsx`)
- Use maintenance hooks
- Map status values

#### 6. Expenses (`_app.expenses.tsx`)
- Use `useFuelLogs()`, `useExpenses()`
- Create logs via mutations

#### 7. Analytics (`_app.analytics.tsx`)
- Use `useDashboardAnalytics()`
- Fetch vehicle analytics via `useVehicleAnalytics(vehicleId)`

## 🔄 Field Name Mapping (Frontend ↔ Backend)

The frontend uses camelCase, backend uses snake_case. Key mappings:

| Frontend Field | Backend Field |
|----------------|---------------|
| `regNumber` | `registration_number` |
| `name` | `vehicle_name` or `name` |
| `type` | `vehicle_type` |
| `capacity` | `max_load_capacity` |
| `acquisitionCost` | `acquisition_cost` |
| `licenseNumber` | `license_number` |
| `licenseCategory` | `license_category` |
| `licenseExpiry` | `license_expiry_date` |
| `safetyScore` | `safety_score` |
| `cargoWeight` | `cargo_weight` |
| `plannedDistance` | `planned_distance` |
| `actualDistance` | `actual_distance` |
| `fuelConsumed` | `fuel_consumed` |

Status values are similar but differ slightly:
- Frontend: "Available", "On Trip", "In Shop", "Retired"
- Backend: "available", "on_trip", "in_shop", "retired"

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check that backend is running on http://localhost:8000
2. Verify CORS settings in `backend/app/main.py`
3. Make sure `VITE_API_URL` in `.env` matches backend URL

### 401 Unauthorized
- Token might be expired or invalid
- Try logging out and logging in again
- Check that Authorization header is being sent

### Network Errors
- Verify backend is running: visit http://localhost:8000/docs
- Check browser Network tab for request details
- Verify `.env` file has correct `VITE_API_URL`

### Type Errors
- Backend types might have changed
- Update `src/lib/api-types.ts` to match backend schemas
- Check Swagger docs at http://localhost:8000/docs for current schemas

## 📊 Testing the Integration

### 1. Test Login
- Login with admin account
- Check localStorage for `transitops-auth-v1` with token

### 2. Test Vehicle Creation
```tsx
// In browser console (after updating Fleet page):
// This will test the full flow
```

### 3. Test Trip Workflow
1. Create a draft trip
2. Dispatch it (vehicle/driver go to "on_trip")
3. Complete it (both return to "available")

### 4. Test Maintenance
1. Create maintenance for a vehicle
2. Vehicle status should change to "in_shop"
3. Mark maintenance complete
4. Vehicle returns to "available"

## 🎯 Benefits of This Architecture

✅ **Type Safety** - Full TypeScript coverage from API to UI
✅ **Caching** - React Query handles data caching automatically
✅ **Optimistic Updates** - UI updates instantly, rolls back on error
✅ **Error Handling** - Centralized error handling in API client
✅ **Loading States** - Built into hooks, no manual management
✅ **Auth Security** - JWT tokens with automatic injection
✅ **Separation of Concerns** - Clear layers (API → Services → Hooks → UI)

## 📚 Reference

- **Backend API Docs**: http://localhost:8000/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **TanStack Router**: https://tanstack.com/router/latest

## ✨ Next Development Tasks

1. **Update all pages** to use new hooks (priority)
2. **Add loading skeletons** for better UX
3. **Add error boundaries** for graceful error handling
4. **Add optimistic updates** for instant UI feedback
5. **Add pagination** for large data lists
6. **Add filters** using query params
7. **Add real-time updates** (optional: WebSockets)
8. **Add offline support** (optional: Service Workers)

---

**Ready to integrate!** Start by updating one page at a time, testing thoroughly before moving to the next.
