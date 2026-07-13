# TransitOps

TransitOps is a fleet operations platform with a FastAPI backend, MongoDB/Beanie persistence, and a React + TypeScript frontend built with TanStack Router, React Query, and shadcn/ui.

## Current State

The backend exposes authenticated APIs for vehicles, drivers, trips, maintenance, fuel, expenses, and dashboard analytics. The frontend is connected to those APIs and uses role-aware navigation and RBAC checks.

## Stack

- Backend: FastAPI, Beanie ODM, MongoDB, JWT auth
- Frontend: React 19, TypeScript, TanStack Router, React Query, Tailwind CSS

## Quick Start

### Backend

```bash
cd backend
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs are available at http://localhost:8000/docs.

### Frontend

```bash
cd transitops-frontend/transitops
npm install
npm run dev
```

The app runs at http://localhost:5173.

### Login

- Email: admin@transitops.com
- Password: admin123

If the demo account is missing, seed the database from the backend scripts before logging in.

## Role-Based Navigation

The sidebar now uses the same RBAC matrix as Settings, so each role only sees the pages it can access.

## Notes

- Frontend API calls use `src/lib/api.ts`, `src/lib/api-services.ts`, `src/lib/api-types.ts`, and `src/lib/mappers.ts`.
- The backend and frontend now both treat document ids as Mongo ObjectId strings at the API boundary.
- Temporary validation scripts and one-off test guides were removed from the repo.

## Useful Docs

- [Quick Start](QUICK_START.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Backend API Documentation](backend/API_DOCUMENTATION.md)
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
