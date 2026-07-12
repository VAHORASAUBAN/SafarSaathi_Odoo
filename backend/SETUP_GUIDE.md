# TransitOps Backend Setup Guide

Complete setup guide for the TransitOps Backend API with FastAPI and MySQL.

## Prerequisites

### Required Software
1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
3. **Git** (optional) - [Download Git](https://git-scm.com/downloads)

### Check Installations
```bash
python --version
# Should show Python 3.8 or higher

mysql --version
# Should show MySQL 8.0 or higher
```

## Step-by-Step Setup

### 1. Clone or Navigate to Project
```bash
cd c:\Users\SAUBAN VAHORA\OneDrive\Desktop\SafarSaathi\backend
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# You should see (venv) in your terminal prompt
```

### 3. Install Dependencies
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt
```

### 4. Setup MySQL Database

#### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE transitops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (recommended)
CREATE USER 'transitops_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';

# Grant privileges
GRANT ALL PRIVILEGES ON transitops.* TO 'transitops_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "Create a new schema" icon
4. Name it `transitops`
5. Set Character Set to `utf8mb4`
6. Click Apply

### 5. Configure Environment Variables

Create a `.env` file in the backend directory:
```bash
# Copy the example file
copy .env.example .env

# Edit the .env file with your settings
```

Edit `.env` file with your database credentials:
```env
DATABASE_URL=mysql+pymysql://transitops_user:YourSecurePassword123!@localhost:3306/transitops
SECRET_KEY=your-super-secret-key-change-this-to-random-string-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important:** Change the `SECRET_KEY` to a random secure string. You can generate one using:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 6. Initialize Database Tables

The tables will be created automatically when you first run the application. Alternatively:

```bash
# Using Alembic migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 7. Seed Sample Data (Optional)

Populate the database with sample data:
```bash
python seed_data.py
```

This creates:
- 5 sample users (admin, fleet manager, driver, safety officer, analyst)
- 5 vehicles with different statuses
- 5 drivers with various license statuses
- Sample trips, maintenance logs, fuel logs, and expenses

### 8. Run the Server

#### Development Mode (with auto-reload)
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Using the batch file (Windows)
```bash
run_dev.bat
```

### 9. Verify Installation

Open your browser and visit:
- **API Root**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Testing the API

### 1. Using Swagger UI (Recommended for Beginners)

1. Go to http://localhost:8000/docs
2. Find `POST /api/auth/register` endpoint
3. Click "Try it out"
4. Enter user details:
```json
{
  "email": "test@example.com",
  "password": "test123",
  "full_name": "Test User",
  "role": "fleet_manager"
}
```
5. Click "Execute"
6. Login using `POST /api/auth/login`
7. Copy the `access_token` from response
8. Click "Authorize" button at top
9. Enter: `Bearer <your-access-token>`
10. Now you can test all protected endpoints!

### 2. Using cURL

```bash
# Register a user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\",\"role\":\"admin\"}"

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123"

# Use the returned token for authenticated requests
curl -X GET "http://localhost:8000/api/vehicles" \
  -H "Authorization: Bearer <your-token>"
```

### 3. Using Postman

1. Import the API from http://localhost:8000/openapi.json
2. Create a new request
3. Test authentication endpoints first
4. Save the token in environment variables
5. Use `{{token}}` in Authorization header

## Sample Credentials (if you ran seed_data.py)

```
Admin:
  Email: admin@transitops.com
  Password: admin123

Fleet Manager:
  Email: fleet@transitops.com
  Password: fleet123

Driver:
  Email: driver@transitops.com
  Password: driver123

Safety Officer:
  Email: safety@transitops.com
  Password: safety123

Financial Analyst:
  Email: analyst@transitops.com
  Password: analyst123
```

## Common Issues and Solutions

### Issue 1: "Module not found" errors
**Solution:** Make sure your virtual environment is activated and all packages are installed
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### Issue 2: "Can't connect to MySQL server"
**Solution:** 
- Check if MySQL service is running
- Verify database credentials in `.env` file
- Test connection: `mysql -u root -p`

### Issue 3: "Access denied for user"
**Solution:** 
- Check username and password in `.env` file
- Make sure user has proper permissions
- Try connecting with MySQL Workbench first

### Issue 4: "Table doesn't exist"
**Solution:** 
- Run the application once to auto-create tables
- Or use: `alembic upgrade head`

### Issue 5: Port 8000 already in use
**Solution:** 
- Use a different port: `uvicorn app.main:app --port 8001`
- Or stop the process using port 8000

### Issue 6: CORS errors from frontend
**Solution:** 
- Add your frontend URL to CORS origins in `app/main.py`
```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── auth.py              # Authentication logic
│   ├── crud.py              # Database CRUD operations
│   └── routers/             # API route handlers
│       ├── auth.py          # Authentication endpoints
│       ├── vehicles.py      # Vehicle management
│       ├── drivers.py       # Driver management
│       ├── trips.py         # Trip management
│       ├── maintenance.py   # Maintenance logs
│       ├── fuel.py          # Fuel logs
│       ├── expenses.py      # Expense tracking
│       └── dashboard.py     # Dashboard & analytics
├── alembic/                 # Database migrations
├── venv/                    # Virtual environment (created by you)
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment file
├── requirements.txt         # Python dependencies
├── seed_data.py            # Sample data seeding script
├── setup.bat               # Windows setup script
├── run_dev.bat             # Development server script
├── README.md               # Project documentation
└── SETUP_GUIDE.md          # This file
```

## Next Steps

1. **Connect Frontend**: Update frontend API base URL to `http://localhost:8000`
2. **Explore API Docs**: Visit http://localhost:8000/docs
3. **Test All Features**: Use the example workflow from README.md
4. **Customize**: Modify business rules in `app/crud.py` as needed
5. **Deploy**: Follow deployment guide when ready for production

## API Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Token expiration handling

✅ **Vehicle Management**
- CRUD operations with validation
- Status management (Available, On Trip, In Shop, Retired)
- Unique registration number enforcement
- Automatic status transitions

✅ **Driver Management**
- CRUD operations
- License expiry validation
- Status tracking (Available, On Trip, Off Duty, Suspended)
- Safety score tracking

✅ **Trip Management**
- Trip lifecycle (Draft → Dispatched → Completed/Cancelled)
- Cargo weight validation against vehicle capacity
- Automatic status updates for vehicles and drivers
- Odometer tracking

✅ **Maintenance Management**
- Maintenance scheduling and tracking
- Automatic vehicle status to "In Shop"
- Cost tracking
- Status transitions

✅ **Fuel & Expense Tracking**
- Fuel consumption logging
- Operational expense tracking
- Date-based filtering

✅ **Dashboard & Analytics**
- Real-time KPIs
- Fleet utilization metrics
- Vehicle-specific analytics
- Fuel efficiency calculations
- ROI calculations
- CSV export functionality

✅ **Business Rules (All Mandatory Rules from Requirements)**
- Unique vehicle registration numbers
- Retired/In Shop vehicles excluded from dispatch
- Expired license validation
- Driver availability checking
- Cargo capacity validation
- Automatic status transitions
- Maintenance workflow automation

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at http://localhost:8000/docs
3. Check the logs in the terminal where the server is running
4. Verify your `.env` configuration

## Security Notes

⚠️ **Important for Production:**
1. Change the `SECRET_KEY` in `.env` to a strong random value
2. Use strong database passwords
3. Enable HTTPS/SSL
4. Restrict CORS origins to your actual frontend domain
5. Set up proper firewall rules
6. Regularly update dependencies
7. Implement rate limiting
8. Add proper logging and monitoring

## License

MIT License - See LICENSE file for details
