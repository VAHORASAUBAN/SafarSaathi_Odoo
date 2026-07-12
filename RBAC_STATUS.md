# Role-Based Access Control (RBAC) Status

## Current Status: ⚠️ PARTIALLY IMPLEMENTED

Role-based access control **is partially implemented** in the backend but needs completion.

---

## ✅ What's Already Implemented

### 1. User Roles Defined (5 Roles)

```python
class UserRole(str, Enum):
    FLEET_MANAGER = "fleet_manager"      # Can manage vehicles, maintenance
    DRIVER = "driver"                     # Can view assigned trips
    SAFETY_OFFICER = "safety_officer"     # Can manage drivers
    FINANCIAL_ANALYST = "financial_analyst"  # Can view expenses/analytics
    ADMIN = "admin"                       # Full access to everything
```

### 2. Permission Check Function

Located in `backend/app/auth.py`:

```python
def check_permission(user: models.User, required_roles: list[models.UserRole]):
    """Check if user has required role - ADMIN always has access"""
    if user.role not in required_roles and user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
```

### 3. Protected Endpoints

**Vehicles Router** (`vehicles.py`):
- ✅ `POST /vehicles` - Only FLEET_MANAGER
- ✅ `PUT /vehicles/{id}` - Only FLEET_MANAGER  
- ✅ `DELETE /vehicles/{id}` - Only FLEET_MANAGER
- ⚠️ `GET /vehicles` - No role check (available to all authenticated users)

**Drivers Router** (`drivers.py`):
- ✅ `POST /drivers` - FLEET_MANAGER, SAFETY_OFFICER
- ✅ `PUT /drivers/{id}` - FLEET_MANAGER, SAFETY_OFFICER
- ✅ `DELETE /drivers/{id}` - FLEET_MANAGER, SAFETY_OFFICER
- ⚠️ `GET /drivers` - No role check

**Trips Router** (`trips.py`):
- ✅ `POST /trips` - DISPATCHER (❌ role doesn't exist!), FLEET_MANAGER
- ✅ `PUT /trips/{id}` - DISPATCHER, FLEET_MANAGER
- ✅ `POST /trips/{id}/dispatch` - DISPATCHER, FLEET_MANAGER
- ✅ `POST /trips/{id}/complete` - DISPATCHER, FLEET_MANAGER
- ✅ `POST /trips/{id}/cancel` - DISPATCHER, FLEET_MANAGER
- ⚠️ `GET /trips` - No role check

**Maintenance Router** (`maintenance.py`):
- ✅ `POST /maintenance` - Only FLEET_MANAGER
- ✅ `PUT /maintenance/{id}` - Only FLEET_MANAGER
- ⚠️ `GET /maintenance` - No role check

**Fuel Router** (`fuel.py`):
- ✅ `POST /fuel` - DISPATCHER (❌ doesn't exist!), FLEET_MANAGER
- ⚠️ `GET /fuel` - No role check

**Expenses Router** (`expenses.py`):
- ✅ `POST /expenses` - DISPATCHER (❌ doesn't exist!), FLEET_MANAGER
- ⚠️ `GET /expenses` - No role check

**Dashboard Router** (`dashboard.py`):
- ❌ No role checks at all

**Auth Router** (`auth.py`):
- ❌ No role checks (registration, login are public)

---

## ❌ What's Missing

### 1. **Username Field in User Model**

Current User model only has `email` but the frontend login uses `username`.

**Fix needed in `models.py`:**
```python
class User(Document):
    username: str = Field(..., unique=True)  # ADD THIS
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: str
    role: UserRole  # CURRENTLY NOT ENFORCED ON CREATION
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2. **DISPATCHER Role Undefined**

Many routers reference `models.UserRole.DISPATCHER` which doesn't exist in the enum!

**Options:**
- A) Add DISPATCHER to UserRole enum
- B) Replace DISPATCHER with FLEET_MANAGER in all routers

### 3. **Default Role Assignment**

When a user registers, no role is assigned! Need to set a default role.

### 4. **Frontend Role-Based UI**

Frontend currently shows all menu items to all users. Need to:
- Hide/show menu items based on user role
- Disable actions based on user role
- Show user's role in UI

### 5. **GET Endpoints Not Protected**

All GET endpoints (list/read operations) have no role checks. Anyone authenticated can view everything.

**Should add restrictions like:**
- DRIVER can only see their own trips
- FINANCIAL_ANALYST can only read (no create/edit)
- Etc.

---

## 🔧 How to Complete RBAC Implementation

### Step 1: Fix User Model

Add `username` field and make `role` required:

```python
class User(Document):
    username: str = Field(..., unique=True)
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.DRIVER  # Default role
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = ["email", "username"]
```

### Step 2: Fix DISPATCHER Role Issue

**Option A - Add DISPATCHER role:**
```python
class UserRole(str, Enum):
    FLEET_MANAGER = "fleet_manager"
    DRIVER = "driver"
    DISPATCHER = "dispatcher"  # ADD THIS
    SAFETY_OFFICER = "safety_officer"
    FINANCIAL_ANALYST = "financial_analyst"
    ADMIN = "admin"
```

**Option B - Replace with FLEET_MANAGER:**
Search and replace `models.UserRole.DISPATCHER` with `models.UserRole.FLEET_MANAGER` in all routers.

### Step 3: Protect GET Endpoints

Add role checks to all GET endpoints based on business logic:

```python
@router.get("/vehicles")
async def get_vehicles(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # All authenticated users can view vehicles
    # Or add: auth.check_permission(current_user, [models.UserRole.FLEET_MANAGER, ...])
    ...
```

### Step 4: Update Registration Endpoint

In `routers/auth.py`, enforce role assignment:

```python
@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate):
    # Assign default role or require role in request
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role or models.UserRole.DRIVER  # Default to DRIVER
    )
    await db_user.insert()
    return db_user
```

### Step 5: Frontend Role-Based UI

Update frontend to:

1. **Store user role in auth context:**
```typescript
// In auth.tsx
const role = user.role;
```

2. **Conditional menu rendering:**
```typescript
{(role === 'admin' || role === 'fleet_manager') && (
  <MenuItem>Fleet Management</MenuItem>
)}
```

3. **Conditional button rendering:**
```typescript
{(role === 'admin' || role === 'fleet_manager') && (
  <Button>Add Vehicle</Button>
)}
```

---

## 🎯 Recommended Role Permissions

| Feature | Fleet Manager | Driver | Safety Officer | Financial Analyst | Admin |
|---------|--------------|--------|----------------|-------------------|-------|
| **Vehicles** |
| View | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ❌ | ✅ |
| Edit | ✅ | ❌ | ❌ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Drivers** |
| View | ✅ | ❌ (own only) | ✅ | ❌ | ✅ |
| Create | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit | ✅ | ❌ | ✅ | ❌ | ✅ |
| Delete | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Trips** |
| View | ✅ | ✅ (own only) | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ❌ | ✅ |
| Dispatch | ✅ | ❌ | ❌ | ❌ | ✅ |
| Complete | ✅ | ✅ (own only) | ❌ | ❌ | ✅ |
| Cancel | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Maintenance** |
| View | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ✅ | ❌ | ✅ |
| Edit | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Expenses** |
| View | ✅ | ❌ | ❌ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ❌ | ✅ |
| Edit | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Analytics** |
| View | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Dashboard** |
| View | ✅ | ✅ (limited) | ✅ | ✅ | ✅ |

---

## 🧪 Testing RBAC

### Test 1: Create Users with Different Roles

```bash
# Admin
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","full_name":"Admin User","role":"admin"}'

# Fleet Manager
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"fleet","email":"fleet@test.com","password":"fleet123","full_name":"Fleet Manager","role":"fleet_manager"}'

# Driver
curl -X POST "http://127.0.0.1:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"driver","email":"driver@test.com","password":"driver123","full_name":"Driver User","role":"driver"}'
```

### Test 2: Verify Permissions

```bash
# Login as driver
TOKEN=$(curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=driver&password=driver123" | jq -r '.access_token')

# Try to create vehicle (should FAIL - 403 Forbidden)
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registration_number":"TEST-123",...}'

# Expected: {"detail":"Not authorized to perform this action"}
```

### Test 3: Admin Override

```bash
# Login as admin
TOKEN=$(curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | jq -r '.access_token')

# Try to create vehicle (should SUCCEED - admin has all permissions)
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registration_number":"TEST-123",...}'

# Expected: Success (201 Created)
```

---

## 📋 Quick Fixes Needed

1. ✅ Add `username` field to User model
2. ✅ Fix DISPATCHER role references (add to enum or replace)
3. ✅ Add default role on user creation
4. ✅ Update seed_data.py to include roles
5. ⚠️ Optionally protect GET endpoints
6. ⚠️ Optionally add frontend role-based UI

---

## Summary

**YES, role-based access is mentioned and partially implemented**, but needs these fixes:

- **User model** needs `username` field
- **DISPATCHER role** is referenced but not defined
- **GET endpoints** are unprotected
- **Frontend** doesn't use roles for UI

Would you like me to implement these fixes to complete the RBAC system?
