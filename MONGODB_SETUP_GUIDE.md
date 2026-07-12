# MongoDB Setup Guide for SafarSaathi

## Option 1: MongoDB Local Installation (Recommended for Development)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** 7.0 or later
   - **Platform:** Windows
   - **Package:** MSI
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **Important:** Check "Install MongoDB as a Service"
4. **Important:** Check "Install MongoDB Compass" (GUI tool)
5. Click **Install**

### Step 3: Verify Installation
Open Command Prompt and run:
```bash
mongod --version
```

You should see MongoDB version information.

### Step 4: Start MongoDB Service

**Option A: Start as Windows Service (Recommended)**
```bash
# MongoDB should auto-start if installed as service
# To check if running:
net start | findstr MongoDB

# To start manually if needed:
net start MongoDB
```

**Option B: Start Manually**
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod
```

### Step 5: Verify MongoDB is Running
Open another Command Prompt and run:
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.x
```

Type `exit` to leave the MongoDB shell.

### Step 6: Configure Your Backend

Create `backend/.env` file:
```env
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=safarsaathi
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

**That's it!** Your backend will automatically connect to MongoDB.

---

## Option 2: MongoDB Atlas (Cloud - Free Tier)

Perfect if you don't want to install MongoDB locally.

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster
1. After login, click **"Build a Database"**
2. Choose **FREE** tier (Shared)
3. Select a **Cloud Provider** (AWS recommended)
4. Choose a **Region** (closest to you)
5. **Cluster Name:** safarsaathi-cluster
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Click **"Database Access"** in left menu
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. **Username:** safarsaathi_user
5. **Password:** Create a strong password (save it!)
6. **Database User Privileges:** Choose "Read and write to any database"
7. Click **"Add User"**

### Step 4: Whitelist Your IP Address
1. Click **"Network Access"** in left menu
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP for security
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Database"** in left menu
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver:** Python, **Version:** 3.12 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://safarsaathi_user:<password>@safarsaathi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Backend

Create `backend/.env` file:
```env
DATABASE_URL=mongodb+srv://safarsaathi_user:YOUR_PASSWORD_HERE@safarsaathi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=safarsaathi
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

**Important:** Replace `YOUR_PASSWORD_HERE` with your actual password!

---

## Using MongoDB Compass (GUI Tool)

MongoDB Compass is a visual tool to explore your database.

### Connect to Local MongoDB
1. Open **MongoDB Compass**
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**

### Connect to MongoDB Atlas
1. Open **MongoDB Compass**
2. Use the connection string from Atlas
3. Replace `<password>` with your password
4. Click **Connect**

### Explore Your Data
After running your backend:
1. In Compass, click **"Refresh"**
2. You'll see **"safarsaathi"** database
3. Click it to see collections:
   - `vehicles`
   - `drivers`
   - `trips`
   - `maintenance_logs`
   - `fuel_logs`
   - `expenses`
   - `users`
4. Click any collection to see documents (data)

---

## Testing Your MongoDB Connection

### Method 1: Using mongosh (Command Line)
```bash
# Connect to local MongoDB
mongosh

# Or connect to Atlas
mongosh "mongodb+srv://safarsaathi_user:PASSWORD@cluster.mongodb.net/"

# List databases
show dbs

# Switch to safarsaathi database
use safarsaathi

# List collections
show collections

# Find all vehicles (after adding some data)
db.vehicles.find()

# Exit
exit
```

### Method 2: Test Backend Connection
```bash
cd backend
venv\Scripts\activate
python -c "from app.database import connect_db; import asyncio; asyncio.run(connect_db()); print('✅ MongoDB Connected!')"
```

---

## Common MongoDB Commands

### In mongosh or Compass:

```javascript
// Switch to safarsaathi database
use safarsaathi

// Count documents in a collection
db.vehicles.countDocuments()

// Find all vehicles
db.vehicles.find()

// Find vehicles with specific status
db.vehicles.find({status: "available"})

// Find one vehicle by registration
db.vehicles.findOne({registration_number: "MH01AB1234"})

// Update a vehicle
db.vehicles.updateOne(
  {registration_number: "MH01AB1234"},
  {$set: {status: "on_trip"}}
)

// Delete all data (be careful!)
db.vehicles.deleteMany({})

// Drop entire database (be very careful!)
db.dropDatabase()
```

---

## Troubleshooting

### Problem: "Connection refused" error
**Solution:**
- Check MongoDB service is running: `net start | findstr MongoDB`
- Start MongoDB: `net start MongoDB`
- Or start manually: `mongod`

### Problem: "Authentication failed"
**Solution for Atlas:**
- Double-check username and password
- Make sure you replaced `<password>` in connection string
- Check user has correct permissions in Atlas

### Problem: "Network timeout" with Atlas
**Solution:**
- Check your IP is whitelisted in Atlas Network Access
- Try "Allow Access from Anywhere" for testing
- Check your firewall isn't blocking MongoDB

### Problem: "Database not found"
**Solution:**
- MongoDB creates databases automatically on first insert
- Just start your backend and register a user
- The database will be created automatically

---

## Quick Start Checklist

For **Local MongoDB:**
- [ ] MongoDB installed
- [ ] MongoDB service running (`net start MongoDB`)
- [ ] `backend/.env` has `DATABASE_URL=mongodb://localhost:27017`
- [ ] Backend can start without errors

For **MongoDB Atlas:**
- [ ] Atlas account created
- [ ] Free cluster created
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] `backend/.env` has Atlas connection string with password
- [ ] Backend can start without errors

---

## Next Steps

1. **Start MongoDB** (local service or Atlas is ready)
2. **Configure .env** file with connection string
3. **Start Backend:**
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn app.main:app --reload
   ```
4. **Check logs** - You should see:
   ```
   INFO: Connected to MongoDB
   INFO: Initialized Beanie with document models
   INFO: Application startup complete
   ```
5. **Start Frontend** and register your first user!

---

## Recommended: Start with MongoDB Atlas

**Why?**
- ✅ No installation needed
- ✅ Free tier available
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Easy to share with team
- ✅ Production-ready

**For learning:** Use Atlas  
**For production:** Use Atlas or dedicated server

---

## Need Help?

- **MongoDB Docs:** https://docs.mongodb.com/
- **Atlas Docs:** https://docs.atlas.mongodb.com/
- **Compass Guide:** https://docs.mongodb.com/compass/
- **MongoDB University:** https://university.mongodb.com/ (Free courses!)

---

## Summary

**Easiest Path:**
1. Sign up for MongoDB Atlas (5 minutes)
2. Create free cluster
3. Get connection string
4. Put it in `backend/.env`
5. Start your backend
6. Done! ✅

MongoDB will automatically create your database and collections when you start using the app!
