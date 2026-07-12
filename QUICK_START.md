# 🚀 Quick Start Guide - TransitOps Full Stack

This guide will help you get both the backend and frontend running together.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)
- **MongoDB 5.0+** (for database)

## Step 1: Setup Backend

### 1.1 Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install packages
pip install -r requirements.txt
```

### 1.2 Setup MongoDB

**Option 1: Local MongoDB**
```bash
# Windows (download from mongodb.com or use chocolatey)
choco install mongodb
net start MongoDB

# Mac
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Option 2: MongoDB Atlas (Free Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string

### 1.3 Configure Database

Create `.env` file in `backend/` folder:

```env
# For local MongoDB
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=transitops

# OR for MongoDB Atlas
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
# DATABASE_NAME=transitops

SECRET_KEY=your-secret-key-change-this-in-production-make-it-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 1.4 No Database Setup Needed!

MongoDB is schema-less - collections and indexes are created automatically!
- ❌ No `CREATE DATABASE` command needed
- ❌ No migrations to run
- ✅ Just start the backend and MongoDB handles everything

### 1.5 Seed Data (Optional)

```bash
python seed_data.py
```

This creates:
- Admin user: `admin@transitops.com` / `admin123`
- Sample vehicles, drivers, and trips

### 1.6 Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend should now be running at: **http://localhost:8000**

🔍 Check API docs at: **http://localhost:8000/docs**

---

## Step 2: Setup Frontend

### 2.1 Install Dependencies

```bash
cd transitops-frontend/transitops

# Install packages
npm install
```

### 2.2 Configure Environment

The `.env` file is already created. Verify it contains:

```env
VITE_API_URL=http://localhost:8000
```

### 2.3 Start Frontend Server

```bash
npm run dev
```

✅ Frontend should now be running at: **http://localhost:5173** (or similar)

---

## Step 3: Login

1. Open browser: http://localhost:5173
2. Click "Quick Login" for Admin account
3. Or enter manually:
   - **Email:** `admin@transitops.com`
   - **Password:** `admin123`

---

## 🎉 Success!

You should now see:
- ✅ Login working with JWT authentication
- ✅ Dashboard loading (with example API integration in INTEGRATION_GUIDE.md)
- ✅ All backend endpoints accessible

---

## 🔧 Troubleshooting

### Backend won't start?
- Check MongoDB is running: `mongosh` (should connect)
- Verify DATABASE_URL in `.env` is correct
- Check port 8000 is not in use

### Frontend won't connect to backend?
- Verify backend is running: visit http://localhost:8000/docs
- Check browser console for CORS errors
- Verify `.env` has `VITE_API_URL=http://localhost:8000`

### Login fails with 401?
- Make sure you created the admin user via seed script or registration
- Check backend logs for errors
- Try creating a new user via Swagger UI: http://localhost:8000/docs

### CORS errors?
- Backend should have CORS enabled for `http://localhost:5173`
- Check `backend/app/main.py` CORS configuration

---

## 📝 Next Steps

The integration is **ready but not yet applied to all pages**. 

### What's Ready:
✅ API client with JWT authentication
✅ All service functions for every endpoint
✅ React Query hooks for data fetching
✅ Type-safe API calls
✅ Updated authentication (real JWT)
✅ Example updated dashboard

### What Needs To Be Done:
🔨 Update each page to use API hooks instead of mock store
🔨 Add loading states and error handling
🔨 Map field names (camelCase ↔ snake_case)

**See `INTEGRATION_GUIDE.md` for detailed instructions on updating each page.**

### Example: Dashboard

We've created an example updated dashboard at:
```
src/routes/_app.dashboard-new.tsx.example
```

To use it:
1. Backup current dashboard: `_app.dashboard.tsx` → `_app.dashboard.old.tsx`
2. Rename example: `_app.dashboard-new.tsx.example` → `_app.dashboard.tsx`
3. Restart dev server

This shows the pattern for:
- Using API hooks (`useDashboardKPIs`, `useVehicles`, etc.)
- Loading states with skeletons
- Error handling with user-friendly messages
- Mapping backend data to frontend format

---

## 📚 Documentation

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **Backend Setup:** `backend/SETUP_GUIDE.md`
- **API Docs (Interactive):** http://localhost:8000/docs

---

## 🎯 Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd transitops-frontend/transitops
   npm run dev
   ```

3. **Make Changes:**
   - Update page components to use API hooks
   - Test in browser
   - Check browser console for errors
   - Check backend logs for API errors

4. **Test Workflow:**
   - Create vehicles, drivers
   - Create and dispatch trips
   - Test maintenance workflow
   - Verify status changes

---

## ✨ Key Features Implemented

### Backend ✅
- JWT authentication with role-based access
- Complete CRUD for all entities
- Business rule enforcement (capacity checks, license validation, etc.)
- Automatic status transitions (trips, maintenance)
- Dashboard KPIs and analytics
- CSV export capabilities

### Frontend ✅
- Modern React with TypeScript
- TanStack Router for routing
- React Query for data fetching
- Tailwind CSS + shadcn/ui components
- Real-time JWT authentication
- Type-safe API integration layer

### Ready to Connect 🔗
- API client with automatic token injection
- Service layer for all endpoints
- Custom React Query hooks
- Error handling and loading states
- Example implementations

---

**Happy Coding! 🚀**

For questions or issues, check the documentation or API endpoint tests at http://localhost:8000/docs
