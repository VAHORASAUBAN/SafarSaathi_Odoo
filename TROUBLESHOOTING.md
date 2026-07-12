# Troubleshooting Guide

Common issues and their solutions when connecting frontend to backend.

---

## 🔴 Authentication Issues

### Issue: Login fails with "Network Error" or "Failed to fetch"

**Symptoms:**
- Login button does nothing
- Console shows: `Failed to fetch` or `Network Error`
- No network request appears in DevTools

**Causes & Solutions:**

1. **Backend not running**
   ```bash
   # Check if backend is running
   curl http://localhost:8000/docs
   # or visit in browser
   ```
   **Solution:** Start backend: `uvicorn app.main:app --reload`

2. **Wrong API URL in frontend**
   ```bash
   # Check .env file
   cat .env
   ```
   **Solution:** Ensure `VITE_API_URL=http://localhost:8000`

3. **CORS not configured**
   **Solution:** Check `backend/app/main.py` has:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

### Issue: Login fails with "401 Unauthorized" or "Invalid credentials"

**Symptoms:**
- Error message: "Invalid credentials"
- Backend returns 401

**Causes & Solutions:**

1. **User doesn't exist**
   **Solution:** Create user via backend:
   ```bash
   # Via Swagger UI: http://localhost:8000/docs
   # POST /api/auth/register
   ```

2. **Wrong password**
   **Solution:** Use correct password or reset via database

3. **Database not seeded**
   **Solution:** Run seed script:
   ```bash
   cd backend
   python seed_data.py
   ```

---

### Issue: "Could not validate credentials" after login

**Symptoms:**
- Login succeeds but subsequent requests fail with 401
- All API calls fail after login

**Causes & Solutions:**

1. **Token not being sent**
   Check DevTools → Network → Select any API request → Headers
   **Solution:** Verify `Authorization: Bearer ...` header exists

2. **Token malformed**
   Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('transitops-auth-v1'))
   ```
   **Solution:** Should have `access_token` field. If not, logout and login again.

3. **Secret key mismatch**
   **Solution:** Ensure `SECRET_KEY` in backend `.env` hasn't changed

---

## 🔴 CORS Errors

### Issue: Browser console shows CORS policy error

**Symptoms:**
```
Access to fetch at 'http://localhost:8000/api/vehicles' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Causes & Solutions:**

1. **Frontend URL not in allowed origins**
   **Solution:** Update `backend/app/main.py`:
   ```python
   allow_origins=["http://localhost:5173"]
   # Add your actual frontend URL
   ```

2. **Backend CORS middleware not configured**
   **Solution:** Ensure CORS middleware is added in `main.py`

3. **Wrong method allowed**
   **Solution:** Ensure `allow_methods=["*"]` in CORS config

**Quick Fix:**
Restart backend after changing CORS settings.

---

## 🔴 Data Loading Issues

### Issue: Pages show "Loading..." forever

**Symptoms:**
- Spinner or loading skeleton never disappears
- No error message shown
- No data appears

**Causes & Solutions:**

1. **React Query not configured**
   **Solution:** Ensure `QueryClient` is provided in `__root.tsx`:
   ```tsx
   <QueryClientProvider client={queryClient}>
     {children}
   </QueryClientProvider>
   ```

2. **Hook not called correctly**
   **Solution:** Check hooks are called unconditionally at component top level

3. **API endpoint returns empty array**
   **Solution:** Check database has data. Add some via Swagger UI or seed script.

---

### Issue: Data doesn't appear but no error shown

**Symptoms:**
- No loading state
- No error
- Just empty/no data

**Causes & Solutions:**

1. **Data not mapped correctly**
   **Solution:** Check you're using mappers:
   ```tsx
   const { data: apiVehicles = [] } = useVehicles();
   const vehicles = mapApiVehiclesToFrontend(apiVehicles);
   ```

2. **Wrong field names**
   **Solution:** Backend uses `snake_case`, frontend uses `camelCase`. Use mappers!

3. **Filtering out all data**
   **Solution:** Check your filter logic isn't too restrictive

---

### Issue: "Cannot read property 'X' of undefined"

**Symptoms:**
- TypeError in console
- App crashes or component doesn't render

**Causes & Solutions:**

1. **Not handling loading state**
   **Solution:**
   ```tsx
   const { data, isLoading } = useVehicles();
   if (isLoading) return <LoadingSkeleton />;
   // Now safe to use data
   ```

2. **Optional chaining missing**
   **Solution:** Use optional chaining:
   ```tsx
   vehicle?.registration_number
   vehicle.driver?.name
   ```

3. **Default values missing**
   **Solution:**
   ```tsx
   const { data: vehicles = [] } = useVehicles(); // Default to []
   ```

---

## 🔴 Mutation Issues

### Issue: Create/Update doesn't work

**Symptoms:**
- Form submits but nothing happens
- No success toast
- No error message
- Data doesn't update

**Causes & Solutions:**

1. **Not awaiting async mutation**
   **Solution:**
   ```tsx
   const handleCreate = async () => {
     try {
       await createVehicle.mutateAsync(data);  // await here!
       toast.success("Created!");
     } catch (err) {
       toast.error(err.message);
     }
   };
   ```

2. **Field names not mapped**
   **Solution:** Use mapper:
   ```tsx
   await createVehicle.mutateAsync(
     mapFrontendVehicleToApi(formData)
   );
   ```

3. **Missing required fields**
   **Solution:** Check `api-types.ts` for required fields. Ensure all are provided.

---

### Issue: "400 Bad Request" on create/update

**Symptoms:**
- Backend returns 400
- Error message about validation

**Causes & Solutions:**

1. **Field name mismatch**
   Backend expects: `registration_number`
   You sent: `regNumber`
   **Solution:** Use mappers!

2. **Wrong data type**
   Backend expects: `number` (vehicle_id)
   You sent: `string`
   **Solution:** 
   ```tsx
   vehicle_id: parseInt(vehicleId)
   ```

3. **Missing required field**
   **Solution:** Check error message, add missing field

4. **Invalid value**
   Example: `capacity: -5` (must be > 0)
   **Solution:** Validate on frontend or handle error gracefully

---

### Issue: UI doesn't update after mutation

**Symptoms:**
- Create/update succeeds (200 OK)
- Success toast shows
- But list doesn't update

**Causes & Solutions:**

1. **Cache not invalidated**
   **Solution:** Mutation hooks already handle this. Check hook implementation:
   ```tsx
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["vehicles"] });
   }
   ```

2. **Using wrong query key**
   **Solution:** Ensure query keys match between fetch and invalidation

3. **Multiple query keys**
   Some pages filter data. Invalidate all related queries:
   ```tsx
   queryClient.invalidateQueries({ queryKey: ["vehicles"] }); // All vehicle queries
   ```

---

## 🔴 Status Transition Issues

### Issue: Trip dispatch doesn't update vehicle/driver status

**Symptoms:**
- Trip status → "Dispatched" ✅
- Vehicle still shows "Available" ❌
- Driver still shows "Available" ❌

**Causes & Solutions:**

1. **Backend business logic not working**
   **Solution:** Check backend logs. Ensure `crud.py` updates statuses.

2. **Cache not refetched**
   **Solution:** Dispatch mutation should invalidate vehicle and driver queries:
   ```tsx
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["trips"] });
     queryClient.invalidateQueries({ queryKey: ["vehicles"] });
     queryClient.invalidateQueries({ queryKey: ["drivers"] });
   }
   ```

3. **Page not showing updated data**
   **Solution:** Refresh page or ensure React Query refetches

---

### Issue: Maintenance doesn't change vehicle to "In Shop"

**Symptoms:**
- Maintenance created successfully
- Vehicle status unchanged

**Causes & Solutions:**

1. **Backend doesn't update status**
   **Solution:** Check `backend/app/routers/maintenance.py` - should update vehicle status

2. **Status not "scheduled" or "in_progress"**
   **Solution:** Only these statuses set vehicle to "in_shop"

3. **Cache not refetched**
   **Solution:** Ensure mutation invalidates vehicle cache

---

## 🔴 Type Errors

### Issue: TypeScript errors about incompatible types

**Symptoms:**
```
Type 'string' is not assignable to type 'number'
Property 'registration_number' does not exist on type 'Vehicle'
```

**Causes & Solutions:**

1. **Using backend types on frontend**
   **Solution:** Use mappers to convert between types:
   ```tsx
   const vehicle = mapApiVehicleToFrontend(apiVehicle);
   ```

2. **ID as string vs number**
   Frontend uses `string`, backend uses `number`
   **Solution:** Convert when needed:
   ```tsx
   vehicle_id: parseInt(vehicleId)
   ```

3. **Field name mismatch**
   **Solution:** Use the correct field name for each context:
   - Frontend: `regNumber`
   - Backend: `registration_number`

---

## 🔴 Environment & Setup Issues

### Issue: "VITE_API_URL is not defined"

**Symptoms:**
- API calls go to wrong URL
- `undefined` in network requests

**Causes & Solutions:**

1. **.env file doesn't exist**
   **Solution:** Create `.env` in frontend root:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

2. **.env not loaded**
   **Solution:** Restart Vite dev server: `npm run dev`

3. **Wrong environment variable name**
   **Solution:** Must start with `VITE_` for Vite to expose it

---

### Issue: Database connection fails

**Symptoms:**
- Backend error: `Can't connect to MySQL`
- Backend won't start

**Causes & Solutions:**

1. **MySQL not running**
   **Solution:** Start MySQL service

2. **Wrong credentials in .env**
   **Solution:** Check `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/transitops
   ```

3. **Database doesn't exist**
   **Solution:**
   ```sql
   mysql -u root -p
   CREATE DATABASE transitops;
   ```

---

### Issue: "ModuleNotFoundError" or import errors (Backend)

**Symptoms:**
- Backend won't start
- Python import errors

**Causes & Solutions:**

1. **Virtual environment not activated**
   **Solution:**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. **Dependencies not installed**
   **Solution:**
   ```bash
   pip install -r requirements.txt
   ```

---

### Issue: "Cannot find module" (Frontend)

**Symptoms:**
- Build fails
- Import errors in frontend

**Causes & Solutions:**

1. **Dependencies not installed**
   **Solution:**
   ```bash
   cd transitops-frontend/transitops
   npm install
   ```

2. **Wrong import path**
   **Solution:** Use `@/` for src imports:
   ```tsx
   import { useVehicles } from "@/hooks/useVehicles";
   ```

---

## 🔴 Performance Issues

### Issue: App is slow / Many duplicate requests

**Symptoms:**
- Multiple identical API calls in Network tab
- Slow page loads

**Causes & Solutions:**

1. **Multiple components calling same hook**
   This is OK! React Query deduplicates requests.
   **Solution:** No action needed - this is expected behavior.

2. **Not using React Query cache**
   **Solution:** Use hooks, don't call services directly

3. **Infinite refetch loop**
   **Solution:** Check `queryKey` dependencies:
   ```tsx
   useQuery({
     queryKey: ["vehicles", vehicleId], // Include all dependencies
     queryFn: () => vehicleService.getById(vehicleId)
   });
   ```

---

## 🔴 Production Issues

### Issue: Works locally but fails in production

**Symptoms:**
- Local dev works fine
- Deployed version has errors

**Causes & Solutions:**

1. **Environment variables not set**
   **Solution:** Set `VITE_API_URL` in production build/deployment

2. **CORS not configured for production domain**
   **Solution:** Add production URL to `allow_origins` in backend

3. **HTTPS vs HTTP**
   **Solution:** Ensure API calls use HTTPS in production

4. **API URL not updated**
   **Solution:** Change `.env` to production API URL before build

---

## 🛠️ Debugging Tools

### Browser DevTools
- **Console:** Error messages and logs
- **Network:** API requests and responses
- **Application → Local Storage:** Check auth token
- **React DevTools:** Component state and props

### React Query DevTools
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
<ReactQueryDevtools />
```
Shows queries, cache, and refetch status

### Backend Logs
- Check terminal running uvicorn
- Add `print()` statements in `crud.py` for debugging
- Use `--log-level debug` for more details

### Swagger UI
- http://localhost:8000/docs
- Test endpoints directly
- See request/response schemas

---

## 📋 Quick Diagnosis Checklist

When something doesn't work:

### 1. Check Backend is Running
```bash
curl http://localhost:8000/docs
```

### 2. Check Frontend is Running
```bash
# Should see "Local: http://localhost:5173"
```

### 3. Check Browser Console
- Any red errors?
- Any CORS errors?
- Any 401/403/400 errors?

### 4. Check Network Tab
- Are requests being made?
- What status code?
- What's the response?
- Is Authorization header present?

### 5. Check LocalStorage
```javascript
localStorage.getItem('transitops-auth-v1')
```

### 6. Check .env Files
- Backend: DATABASE_URL, SECRET_KEY
- Frontend: VITE_API_URL

---

## 🆘 Still Stuck?

### 1. Check Documentation
- `INTEGRATION_GUIDE.md` - Integration instructions
- `API_DOCUMENTATION.md` - API reference
- `PAGE_MIGRATION_CHECKLIST.md` - Migration steps

### 2. Test with Swagger UI
Visit http://localhost:8000/docs and test endpoints manually

### 3. Test with curl
```bash
# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@transitops.com&password=admin123"

# Get vehicles (use token from above)
curl -X GET "http://localhost:8000/api/vehicles" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Check Example Implementation
See `src/routes/_app.dashboard-new.tsx.example` for working example

### 5. Start Fresh
```bash
# Clear everything and start over
# Backend
cd backend
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd transitops-frontend/transitops
rm -rf node_modules
npm install

# Database
mysql -u root -p
DROP DATABASE IF EXISTS transitops;
CREATE DATABASE transitops;
```

---

**Most issues are either:**
1. Backend not running
2. Wrong API URL
3. CORS misconfiguration
4. Field name mismatch (use mappers!)
5. Not handling async properly

**Good luck! 🚀**
