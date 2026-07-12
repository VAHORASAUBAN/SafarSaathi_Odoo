@echo off
echo ========================================
echo   SafarSaathi - Dynamic Testing Setup
echo ========================================
echo.

echo [1/4] Checking MongoDB...
mongosh --eval "db.version()" > nul 2>&1
if %errorlevel% neq 0 (
    echo   ❌ MongoDB is not running or not installed
    echo   ➜ Start MongoDB: net start MongoDB
    echo   ➜ Or follow MONGODB_SETUP_GUIDE.md
    pause
    exit /b 1
) else (
    echo   ✅ MongoDB is running
)

echo.
echo [2/4] Checking Backend...
cd backend
if not exist "venv\" (
    echo   ⚠️  Virtual environment not found
    echo   ➜ Creating virtual environment...
    python -m venv venv
)

echo   ➜ Activating virtual environment...
call venv\Scripts\activate

echo   ➜ Installing dependencies...
pip install -r requirements.txt --quiet

echo   ✅ Backend dependencies installed

echo.
echo [3/4] Verifying dynamic system setup...
python verify_dynamic.py
if %errorlevel% neq 0 (
    echo.
    echo   ⚠️  System verification failed
    echo   ➜ Would you like to seed the database? (Y/N)
    set /p seed="Enter choice: "
    if /i "%seed%"=="Y" (
        echo   ➜ Seeding database...
        python seed_data.py
    )
)

echo.
echo [4/4] Checking Frontend...
cd ..\transitops-frontend\transitops
if not exist "node_modules\" (
    echo   ⚠️  Node modules not found
    echo   ➜ Installing dependencies...
    call npm install
)

echo   ✅ Frontend dependencies installed

cd ..\..

echo.
echo ========================================
echo   ✅ Setup Complete!
echo ========================================
echo.
echo 📋 TO START TESTING:
echo.
echo   Terminal 1 - Backend:
echo     cd backend
echo     venv\Scripts\activate
echo     uvicorn app.main:app --reload
echo.
echo   Terminal 2 - Frontend:
echo     cd transitops-frontend\transitops
echo     npm run dev
echo.
echo   Browser:
echo     Open http://localhost:5173
echo     Login: admin / admin123
echo.
echo 📖 See DYNAMIC_TESTING_GUIDE.md for comprehensive testing
echo.
pause
