# TransitOps - Smart Transport Operations Platform

Full-stack fleet management system with React + TypeScript frontend and FastAPI backend.

## 🎯 Project Status

**Backend:** ✅ Fully Functional
- FastAPI REST API with JWT authentication
- MongoDB database with Beanie ODM
- Complete CRUD operations for all entities
- Business rule enforcement
- Dashboard analytics and KPIs
- No migrations needed (schema-less)

**Frontend:** ✅ UI Complete + 🔨 API Integration In Progress
- Modern React 19 with TypeScript
- TanStack Router for routing
- React Query for data fetching
- Tailwind CSS + shadcn/ui components
- **NEW:** Complete API integration layer ready
- **NEW:** JWT authentication implemented
- **PENDING:** Update individual pages to use API

---

## 🚀 Next Steps: Integration Roadmap

### Phase 1: Verify Setup (30 mins)
1. Start both servers (see Quick Start above)
2. Login and verify token in browser localStorage
3. Check Network tab - API calls should include `Authorization: Bearer ...`

### Phase 2: First Page - Dashboard (1-2 hours)
**Use the provided example:**
```bash
cd src/routes
copy _app.dashboard-new.tsx.example _app.dashboard.tsx
```
This shows the complete pattern: hooks, loading states, error handling, data mapping.

### Phase 3: Update Remaining Pages (8-10 hours)
Follow [PAGE_MIGRATION_CHECKLIST.md](PAGE_MIGRATION_CHECKLIST.md) for each page:
- Fleet (vehicles)
- Drivers
- Trips
- Maintenance
- Expenses & Fuel
- Analytics
- Settings

**The Pattern (from example):**
```tsx
// 1. Import hooks
import { useVehicles, useCreateVehicle } from "@/hooks/useVehicles";
import { mapApiVehiclesToFrontend } from "@/lib/mappers";

// 2. Use hooks
const { data: apiVehicles = [], isLoading, error } = useVehicles();
const vehicles = mapApiVehiclesToFrontend(apiVehicles);
const createVehicle = useCreateVehicle();

// 3. Handle states
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage />;

// 4. Use mutations
const handleCreate = async (data) => {
  await createVehicle.mutateAsync(mapFrontendVehicleToApi(data));
};
```

---

## 🎓 Key Concepts

### Authentication Flow
1. Login → Get JWT token → Store in localStorage
2. API client reads token and adds to every request
3. Backend validates token and returns data

### Data Mapping
- Frontend uses camelCase: `regNumber`, `cargoWeight`
- Backend uses snake_case: `registration_number`, `cargo_weight`
- Use mappers from `src/lib/mappers.ts` to convert

### React Query Hooks
- `useVehicles()` - Fetches and caches data
- `useCreateVehicle()` - Creates vehicle, invalidates cache
- Automatic loading states, error handling, refetching

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get backend + frontend running
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Complete API integration tutorial
- **[PAGE_MIGRATION_CHECKLIST.md](PAGE_MIGRATION_CHECKLIST.md)** - Step-by-step page updates
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Complete API reference

---

## 🎯 Quick Start

### 1. Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configure .env file with DATABASE_URL and SECRET_KEY
# Create database: CREATE DATABASE transitops;

uvicorn app.main:app --reload
```
**Backend:** http://localhost:8000 | **API Docs:** http://localhost:8000/docs

### 2. Start Frontend
```bash
cd transitops-frontend/transitops
npm install
npm run dev
```
**Frontend:** http://localhost:5173

### 3. Login
- **Email:** `admin@transitops.com`
- **Password:** `admin123`

(Create this user via seed script or `/api/auth/register`)

---

## 📊 Integration Status

**✅ COMPLETE:**
- Backend API (FastAPI + MySQL)
- Frontend UI (React + TypeScript)
- API Integration Layer:
  - `src/lib/api.ts` - API client with JWT auth
  - `src/lib/api-services.ts` - Service layer for all endpoints
  - `src/lib/api-types.ts` - TypeScript types
  - `src/lib/mappers.ts` - Data format converters
  - `src/hooks/` - React Query hooks for each entity
  - Real JWT authentication (not demo accounts)
  - Example: `src/routes/_app.dashboard-new.tsx.example`

**🔨 PENDING:**
- Update pages from mock data (`useStore()`) to real API hooks
- Estimated time: 10-12 hours
- Pattern shown in dashboard example

## 📁 Project Structure

```
SafarSaathi/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT authentication
│   │   ├── crud.py            # Database operations
│   │   └── main.py            # FastAPI application
│   ├── requirements.txt
│   ├── .env.example
│   ├── API_DOCUMENTATION.md
│   └── README.md
│
├── transitops-frontend/       # React frontend
│   └── transitops/
│       ├── src/
│       │   ├── routes/        # Page components
│       │   ├── components/    # Reusable UI components
│       │   ├── hooks/         # ✨ NEW: React Query hooks
│       │   ├── lib/
│       │   │   ├── api.ts             # ✨ NEW: API client
│       │   │   ├── api-types.ts       # ✨ NEW: API types
│       │   │   ├── api-services.ts    # ✨ NEW: Service layer
│       │   │   ├── auth.tsx           # ✨ UPDATED: Real JWT auth
│       │   │   ├── store.tsx          # OLD: Mock data (to be replaced)
│       │   │   └── types.ts
│       │   └── ...
│       ├── package.json
│       └── .env               # ✨ NEW: API configuration
│
├── QUICK_START.md             # ✨ NEW: Getting started guide
├── INTEGRATION_GUIDE.md       # ✨ NEW: API integration instructions
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 5.7+

### 1. Start Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create .env file (see backend/.env.example)
# Create MySQL database: transitops

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running at:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### 2. Start Frontend

```bash
cd transitops-frontend/transitops
npm install
npm run dev
```

**Frontend running at:** http://localhost:5173

### 3. Login

- **Email:** `admin@transitops.com`
- **Password:** `admin123`

(Create this user via seed script or registration endpoint)

## ✨ What's New - API Integration

We've built a complete API integration layer that's ready to use:

### ✅ Completed

1. **API Client** (`src/lib/api.ts`)
   - HTTP client with automatic JWT token injection
   - Error handling and response parsing
   - Support for JSON and form-data requests

2. **Type Definitions** (`src/lib/api-types.ts`)
   - Complete TypeScript interfaces matching backend schemas
   - Request and response types for all endpoints

3. **Service Layer** (`src/lib/api-services.ts`)
   - Organized service functions for all API endpoints
   - Auth, vehicles, drivers, trips, maintenance, fuel, expenses, dashboard

4. **React Query Hooks** (`src/hooks/`)
   - Custom hooks for each entity (vehicles, drivers, trips, etc.)
   - Automatic caching, loading states, and error handling
   - Cache invalidation on mutations

5. **Authentication** (`src/lib/auth.tsx`)
   - Real JWT-based authentication
   - Token validation on app load
   - Automatic token refresh flow

6. **Example Implementation** (`src/routes/_app.dashboard-new.tsx.example`)
   - Complete example of updated dashboard using API
   - Shows loading states, error handling, and data mapping

### 🔨 Pending Work

**Update individual pages to use the API:**
- Fleet page (`_app.fleet.tsx`)
- Drivers page (`_app.drivers.tsx`)
- Trips page (`_app.trips.tsx`)
- Maintenance page (`_app.maintenance.tsx`)
- Expenses page (`_app.expenses.tsx`)
- Analytics page (`_app.analytics.tsx`)

Each page needs to:
1. Replace `useStore()` with appropriate API hooks
2. Add loading and error states
3. Map field names (camelCase ↔ snake_case)
4. Handle async operations with try/catch

**See `INTEGRATION_GUIDE.md` for detailed migration instructions.**

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **QUICK_START.md** | Get backend + frontend running together |
| **INTEGRATION_GUIDE.md** | Complete API integration guide with examples |
| **backend/API_DOCUMENTATION.md** | Full API reference with all endpoints |
| **backend/README.md** | Backend setup and development guide |

## 🎯 Features

### Backend Features ✅
- **Authentication:** JWT tokens with role-based access control
- **Vehicle Management:** CRUD with status tracking, analytics
- **Driver Management:** License validation, safety scores
- **Trip Management:** Create, dispatch, complete workflow
- **Maintenance:** Automatic vehicle status updates
- **Fuel & Expenses:** Cost tracking and analytics
- **Dashboard:** Real-time KPIs and fleet analytics
- **Business Rules:** Capacity validation, license checks, status transitions

### Frontend Features ✅
- **Modern UI:** Tailwind CSS + shadcn/ui components
- **Type Safety:** Full TypeScript coverage
- **Routing:** File-based routing with TanStack Router
- **Data Fetching:** React Query with caching
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts for analytics visualization
- **Responsive:** Mobile-friendly design

## 🔐 API Authentication

All API endpoints (except login/register) require JWT authentication:

```typescript
// Automatic with our API client
import { vehicleService } from "@/lib/api-services";

const vehicles = await vehicleService.getAll();
// Token automatically included in Authorization header
```

Token is stored in localStorage under `transitops-auth-v1` as:
```json
{
  "user": { "id": "1", "name": "...", "email": "...", "role": "..." },
  "access_token": "eyJhbGci..."
}
```

## 🛠 Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- MySQL (Database)
- JWT (Authentication)
- Pydantic (Data validation)
- Alembic (Migrations)

**Frontend:**
- React 19
- TypeScript
- TanStack Router
- TanStack React Query
- Tailwind CSS v4
- shadcn/ui components
- Recharts
- React Hook Form + Zod

## 📊 Database Schema

- **users** - System users with roles
- **vehicles** - Fleet vehicles with status
- **drivers** - Drivers with license info
- **trips** - Trip records with workflow
- **maintenance_logs** - Maintenance tracking
- **fuel_logs** - Fuel consumption
- **expenses** - Expense tracking

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend Development
```bash
cd transitops-frontend/transitops
npm run dev
# App: http://localhost:5173
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## 🧪 Testing

### Backend
```bash
cd backend
python test_api.py  # Basic API tests
# Or use Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd transitops-frontend/transitops
npm run lint  # Check for errors
npm run build  # Test production build
```

## 🚀 Deployment

### Backend
1. Set up production database
2. Configure environment variables
3. Run migrations
4. Deploy with gunicorn/uvicorn

### Frontend
1. Build production bundle: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure API_URL environment variable

## 📈 Next Steps

1. **Complete API Integration**
   - Update all pages to use API hooks
   - See `INTEGRATION_GUIDE.md` for step-by-step instructions
   - Start with the example dashboard implementation

2. **Add Loading States**
   - Use skeleton loaders for better UX
   - Handle loading and error states consistently

3. **Add Pagination**
   - Implement pagination for large lists
   - Use query params for filtering

4. **Add Real-time Updates** (Optional)
   - WebSocket support for live updates
   - Push notifications for status changes

5. **Add Tests**
   - Backend: pytest for API tests
   - Frontend: Vitest for component tests

## 📝 License

MIT

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and modify!

---

**Current Focus:** Migrating frontend pages from mock data to real API calls. See `INTEGRATION_GUIDE.md` to get started!
