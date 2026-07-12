# ✅ MongoDB Migration Complete

The backend has been migrated from MySQL to MongoDB!

## 🔄 What Changed

### Dependencies
- ❌ Removed: `sqlalchemy`, `pymysql`, `alembic`
- ✅ Added: `motor` (async MongoDB driver), `beanie` (ODM)

### Database Layer
- **Before:** SQLAlchemy ORM with MySQL
- **After:** Beanie ODM with MongoDB

### Models
- **Before:** SQLAlchemy models with relationships
- **After:** Beanie Documents (Pydantic-based)
- ID fields now use MongoDB ObjectId (stored as strings in references)

### Configuration
- **Before:** `DATABASE_URL=mysql+pymysql://...`
- **After:** `DATABASE_URL=mongodb://localhost:27017` + `DATABASE_NAME=transitops`

## 🚀 Setup MongoDB

### Option 1: Local MongoDB (Recommended for Development)

#### Windows:
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb

# Start MongoDB service:
net start MongoDB
```

#### Mac:
```bash
# Using Homebrew:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update `.env`:
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=transitops
   ```

## 📝 Backend Setup (Updated)

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=transitops
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Start Backend
```bash
uvicorn app.main:app --reload
```

**MongoDB will be connected automatically on startup!**

## ✅ Key Differences from MySQL

### No Migrations Needed
MongoDB is schema-less. Beanie creates indexes automatically.
- ❌ No more Alembic migrations
- ✅ Models auto-sync on startup

### Document IDs
MongoDB uses `ObjectId` instead of auto-increment integers:
- User ID: `507f1f77bcf86cd799439011` (24-char hex string)
- Frontend ID type: still strings (compatible)

### Relationships
- **MySQL:** Foreign keys with `relationship()`
- **MongoDB:** Store IDs as strings, manual population

### Queries
- **SQLAlchemy:** `db.query(Vehicle).filter(...)`
- **Beanie:** `await Vehicle.find(Vehicle.status == "available").to_list()`

## 🔧 CRUD Operations Changed

### Before (SQLAlchemy):
```python
from sqlalchemy.orm import Session

def get_vehicles(db: Session):
    return db.query(Vehicle).all()

def create_vehicle(db: Session, vehicle: VehicleCreate):
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle
```

### After (Beanie):
```python
# No db parameter needed!

async def get_vehicles():
    return await Vehicle.find_all().to_list()

async def create_vehicle(vehicle: VehicleCreate):
    db_vehicle = Vehicle(**vehicle.dict())
    await db_vehicle.insert()
    return db_vehicle
```

## 📊 Data Migration (If You Have Existing Data)

### Export from MySQL:
```bash
# Export to JSON
mysql -u root -p transitops -e "SELECT * FROM vehicles" > vehicles.json
```

### Import to MongoDB:
```bash
# Using mongoimport
mongoimport --db transitops --collection vehicles --file vehicles.json --jsonArray
```

**Or use a Python script to convert and transfer data.**

## 🧪 Testing the Connection

### Check MongoDB is Running:
```bash
# MongoDB Shell
mongosh

# List databases
show dbs

# Use transitops
use transitops

# Show collections
show collections
```

### Test API:
```bash
# Start backend
uvicorn app.main:app --reload

# Visit: http://localhost:8000/docs
# Should show Swagger UI
# Try: POST /api/auth/register to create a user
```

## 🎯 Advantages of MongoDB

✅ **No Migrations** - Schema-less, auto-sync
✅ **Flexible Schema** - Easy to add fields
✅ **JSON Native** - Perfect for REST APIs
✅ **Horizontal Scaling** - Easy to scale out
✅ **Free Cloud Tier** - MongoDB Atlas
✅ **Fast Writes** - Optimized for high throughput

## ⚠️ Important Notes

### 1. All Endpoints Are Now Async
Router functions must use `async def`:
```python
@router.get("/vehicles")
async def get_vehicles():  # async!
    vehicles = await Vehicle.find_all().to_list()
    return vehicles
```

### 2. No More `db: Session` Dependency
Remove from all route parameters:
```python
# Before
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):

# After
async def create_vehicle(vehicle: VehicleCreate):
```

### 3. IDs Are Strings
MongoDB ObjectId is returned as string in JSON:
```json
{
  "id": "507f1f77bcf86cd799439011"
}
```
Frontend already uses string IDs, so no change needed there!

### 4. Indexes Created Automatically
Beanie creates indexes on startup based on `Settings.indexes`:
```python
class Vehicle(Document):
    # ...
    class Settings:
        indexes = ["registration_number", "status"]
```

## 📚 Updated Documentation

All backend docs remain valid, just replace:
- "MySQL" → "MongoDB"
- "SQLAlchemy" → "Beanie"
- Database setup instructions updated

## 🔗 Useful Resources

- **MongoDB Docs:** https://www.mongodb.com/docs/
- **Motor (Async Driver):** https://motor.readthedocs.io/
- **Beanie ODM:** https://beanie-odm.dev/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **MongoDB Compass** (GUI): https://www.mongodb.com/products/compass

## ✅ Verification Checklist

After setup, verify:
- [ ] MongoDB running (check `mongosh`)
- [ ] Backend starts without errors
- [ ] Can register a user via `/api/auth/register`
- [ ] Can login via `/api/auth/login`
- [ ] Swagger UI loads: http://localhost:8000/docs
- [ ] Collections created in MongoDB (`use transitops` → `show collections`)

## 🎉 You're All Set!

MongoDB is now your database. The rest of the application works the same way:
- Frontend integration unchanged
- API endpoints unchanged
- Authentication flow unchanged
- Business logic unchanged

**Just a different database engine under the hood!** 🚀
