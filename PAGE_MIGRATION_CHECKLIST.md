# Page Migration Checklist

Use this checklist when migrating each page from mock data to real API.

## 📋 General Migration Steps

For each page, follow these steps:

### 1. Import Required Hooks

```tsx
// Remove this:
import { useStore } from "@/lib/store";

// Add these:
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { mapApiVehiclesToFrontend, mapFrontendVehicleToApi } from "@/lib/mappers";
```

### 2. Replace useStore() with Hooks

```tsx
// Before:
const { vehicles, addVehicle } = useStore();

// After:
const { data: apiVehicles = [], isLoading, error } = useVehicles();
const vehicles = mapApiVehiclesToFrontend(apiVehicles);
const createVehicle = useCreateVehicle();
```

### 3. Add Loading State

```tsx
if (isLoading) {
  return (
    <div>
      <PageHeader title="..." subtitle="..." />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
```

### 4. Add Error Handling

```tsx
if (error) {
  return (
    <div>
      <PageHeader title="..." subtitle="..." />
      <Card className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Failed to load data</div>
            <div className="mt-1 text-sm">{error.message}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 5. Update Mutations to Async

```tsx
// Before (synchronous):
const handleCreate = () => {
  const res = addVehicle(formData);
  if (!res.ok) return toast.error(res.error);
  toast.success("Created!");
};

// After (asynchronous):
const handleCreate = async () => {
  try {
    await createVehicle.mutateAsync(
      mapFrontendVehicleToApi(formData)
    );
    toast.success("Created!");
    setOpen(false);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to create");
  }
};
```

### 6. Update Form Submissions

```tsx
// Before:
<form onSubmit={submit}>

// After:
<form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
```

---

## 🚗 Fleet Page (_app.fleet.tsx)

**Hooks Needed:**
- `useVehicles()` - List vehicles
- `useCreateVehicle()` - Create vehicle
- `useUpdateVehicle()` - Update vehicle status
- `useDeleteVehicle()` - Delete vehicle

**Field Mappings:**
```tsx
// Frontend → Backend
regNumber → registration_number
name → vehicle_name
type → vehicle_type
capacity → max_load_capacity
acquisitionCost → acquisition_cost
```

**Checklist:**
- [ ] Import hooks and mappers
- [ ] Replace `useStore()` with `useVehicles()`
- [ ] Add loading skeleton
- [ ] Add error display
- [ ] Update create handler to async
- [ ] Update update handler to async
- [ ] Update delete handler to async
- [ ] Map field names in forms
- [ ] Test create operation
- [ ] Test update operation
- [ ] Test delete operation
- [ ] Test CSV export (already uses download function)

---

## 👨‍✈️ Drivers Page (_app.drivers.tsx)

**Hooks Needed:**
- `useDrivers()` - List drivers
- `useCreateDriver()` - Create driver
- `useUpdateDriver()` - Update driver
- `useDeleteDriver()` - Delete driver

**Field Mappings:**
```tsx
licenseNumber → license_number
licenseCategory → license_category
licenseExpiry → license_expiry_date
contact → contact_number
safetyScore → safety_score
```

**Checklist:**
- [ ] Import hooks and mappers
- [ ] Replace `useStore()` with `useDrivers()`
- [ ] Add loading skeleton
- [ ] Add error display
- [ ] Update create handler
- [ ] Update update handler
- [ ] Update delete handler
- [ ] Map field names
- [ ] Test all CRUD operations
- [ ] Test license expiry validation

---

## 🚚 Trips Page (_app.trips.tsx)

**Hooks Needed:**
- `useTrips()` - List trips
- `useAvailableVehicles()` - Available vehicles for dispatch
- `useAvailableDrivers()` - Available drivers for dispatch
- `useCreateTrip()` - Create draft trip
- `useDispatchTrip()` - Dispatch trip
- `useCompleteTrip()` - Complete trip
- `useCancelTrip()` - Cancel trip

**Field Mappings:**
```tsx
cargoWeight → cargo_weight
plannedDistance → planned_distance
finalOdometer → end_odometer
fuelConsumed → fuel_consumed
vehicleId → vehicle_id (as number)
driverId → driver_id (as number)
```

**Special Notes:**
- Vehicle/Driver IDs must be numbers for API (parseInt)
- Use `useAvailableVehicles()` and `useAvailableDrivers()` for dropdown options
- Dispatch requires `start_odometer` field
- Complete requires `end_odometer`, `actual_distance`, `fuel_consumed`

**Checklist:**
- [ ] Import all trip-related hooks
- [ ] Replace trips data source
- [ ] Replace vehicles data with `useAvailableVehicles()`
- [ ] Replace drivers data with `useAvailableDrivers()`
- [ ] Add loading states
- [ ] Update create trip handler
- [ ] Update dispatch handler (add start_odometer)
- [ ] Update complete handler (map all fields)
- [ ] Update cancel handler
- [ ] Test full trip workflow (create → dispatch → complete)

---

## 🔧 Maintenance Page (_app.maintenance.tsx)

**Hooks Needed:**
- `useMaintenance()` - List maintenance logs
- `useVehicles()` - Vehicles for dropdown
- `useCreateMaintenance()` - Create log
- `useUpdateMaintenance()` - Update/close log

**Field Mappings:**
```tsx
serviceType → maintenance_type
date → scheduled_date
vehicleId → vehicle_id (as number)
```

**Special Notes:**
- Creating maintenance with status "scheduled" or "in_progress" sets vehicle to "in_shop"
- Closing (status → "completed") returns vehicle to "available"

**Checklist:**
- [ ] Import hooks
- [ ] Replace data sources
- [ ] Add loading states
- [ ] Update create handler
- [ ] Update close handler (status → "completed")
- [ ] Map vehicle ID to number
- [ ] Test maintenance workflow
- [ ] Verify vehicle status changes

---

## ⛽ Expenses & Fuel Page (_app.expenses.tsx)

**Hooks Needed:**
- `useFuelLogs()` - List fuel logs
- `useExpenses()` - List expenses
- `useMaintenance()` - For total costs
- `useVehicles()` - For vehicle dropdown
- `useCreateFuelLog()` - Create fuel log
- `useCreateExpense()` - Create expense

**Field Mappings:**
```tsx
// Fuel
liters → liters (same)
cost → cost (same)
date → fuel_date

// Expense
category → expense_type (lowercase: "toll", "parking", etc.)
amount → amount (same)
date → expense_date
vehicleId → vehicle_id (as number)
```

**Checklist:**
- [ ] Import all expense-related hooks
- [ ] Replace fuel logs data
- [ ] Replace expenses data
- [ ] Replace maintenance data (for totals)
- [ ] Add loading states
- [ ] Update fuel log creation
- [ ] Update expense creation
- [ ] Map category to expense_type
- [ ] Test both creation forms

---

## 📊 Analytics Page (_app.analytics.tsx)

**Hooks Needed:**
- `useDashboardAnalytics()` - Fleet-wide analytics
- `useVehicles()` - Vehicle list
- `useVehicleAnalytics(vehicleId)` - Per-vehicle analytics
- `useTrips()` - Trip history

**Special Notes:**
- Analytics calculated on backend
- Use `dashboardService.exportAnalytics()` for CSV export

**Checklist:**
- [ ] Import analytics hooks
- [ ] Replace analytics data with `useDashboardAnalytics()`
- [ ] Add per-vehicle analytics with `useVehicleAnalytics()`
- [ ] Add loading states for charts
- [ ] Update calculations to use API data
- [ ] Test CSV export
- [ ] Verify chart rendering

---

## 🎯 Dashboard Page (_app.dashboard.tsx)

**Use the provided example!**
`src/routes/_app.dashboard-new.tsx.example`

**Hooks Needed:**
- `useDashboardKPIs()` - Dashboard metrics
- `useVehicles()` - For filters and status breakdown
- `useDrivers()` - For license checks
- `useTrips()` - Recent trips table

**Checklist:**
- [ ] Copy from example file
- [ ] Verify all hooks are imported
- [ ] Test loading state
- [ ] Test error handling
- [ ] Test filters
- [ ] Test status breakdown
- [ ] Check recent trips table

---

## ⚙️ Settings Page (_app.settings.tsx)

**Changes Needed:**
- Remove "Reset Demo Data" button (no longer using mock data)
- User data already comes from auth context
- Keep role-based feature access table

**Checklist:**
- [ ] Remove demo data reset functionality
- [ ] Keep user display (from `useAuth()`)
- [ ] Keep role access matrix (frontend only)

---

## 🧪 Testing Each Page

After migrating each page, test these scenarios:

### ✅ Display
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Loading state shows while fetching
- [ ] Error state shows on failure

### ✅ Create
- [ ] Form validation works
- [ ] Create succeeds with valid data
- [ ] Success toast appears
- [ ] List updates automatically
- [ ] Form resets/closes

### ✅ Update
- [ ] Update succeeds
- [ ] Success toast appears
- [ ] List updates automatically
- [ ] UI reflects changes

### ✅ Delete
- [ ] Delete confirmation works
- [ ] Delete succeeds
- [ ] Success toast appears
- [ ] Item removed from list

### ✅ Error Handling
- [ ] Network errors show message
- [ ] Validation errors display
- [ ] User can retry after error

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Cause:** Backend field name doesn't match frontend
**Solution:** Use mappers from `@/lib/mappers`

### Issue: "400 Bad Request" on create/update
**Cause:** Missing required fields or wrong types
**Solution:** Check `api-types.ts` for required fields, use mappers

### Issue: "401 Unauthorized"
**Cause:** Token expired or missing
**Solution:** Logout and login again, check localStorage

### Issue: Data doesn't update after mutation
**Cause:** Cache not invalidated
**Solution:** Mutation hooks already invalidate - check hook implementation

### Issue: "Network Error"
**Cause:** Backend not running or wrong URL
**Solution:** Check backend is at http://localhost:8000

### Issue: TypeScript errors about field names
**Cause:** Using frontend field names for API call
**Solution:** Use mapper functions to convert

---

## 📊 Migration Progress Tracker

Track your progress:

- [ ] Dashboard (_app.dashboard.tsx)
- [ ] Fleet (_app.fleet.tsx)
- [ ] Drivers (_app.drivers.tsx)
- [ ] Trips (_app.trips.tsx)
- [ ] Maintenance (_app.maintenance.tsx)
- [ ] Expenses (_app.expenses.tsx)
- [ ] Analytics (_app.analytics.tsx)
- [ ] Settings (_app.settings.tsx)

---

## 🎉 When Complete

Once all pages are migrated:

1. [ ] Test complete workflow: Create vehicle → Create driver → Create trip → Dispatch → Complete
2. [ ] Test maintenance: Create maintenance → Vehicle goes to "in_shop" → Close → Vehicle returns
3. [ ] Test all CRUD operations on each entity
4. [ ] Test error handling (disconnect backend, try operations)
5. [ ] Test with multiple users/roles (if implemented)
6. [ ] Remove old mock store (`src/lib/store.tsx`) - no longer needed!

---

**Good luck with the migration! 🚀**

Start with one page, get it working perfectly, then move to the next. The pattern is consistent across all pages.
