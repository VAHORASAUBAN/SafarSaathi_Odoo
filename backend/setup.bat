@echo off
echo ================================
echo TransitOps Backend Setup
echo ================================
echo.

echo Step 1: Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Failed to create virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

echo Step 3: Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 4: Checking .env file...
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo ⚠ IMPORTANT: Please edit .env file with your MySQL credentials
    echo   1. Set DATABASE_URL with your MySQL connection string
    echo   2. Set SECRET_KEY to a secure random string
    echo.
    notepad .env
)
echo ✓ Environment file ready
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Make sure MySQL is running
echo 2. Create database: CREATE DATABASE transitops;
echo 3. Run: python seed_data.py (to add sample data)
echo 4. Run: run_dev.bat (to start the server)
echo.
pause
