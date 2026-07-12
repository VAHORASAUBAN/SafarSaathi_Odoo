"""
Quick verification script to check if the system is truly dynamic
Run with: python verify_dynamic.py
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def verify_dynamic_system():
    print("🔍 Verifying Dynamic System Setup...\n")
    
    all_checks_passed = True
    
    # Check 1: MongoDB Connection
    print("1️⃣  Checking MongoDB connection...")
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await client.admin.command('ping')
        print("   ✅ MongoDB is running and accessible")
    except Exception as e:
        print(f"   ❌ MongoDB connection failed: {e}")
        print("   → Start MongoDB first: net start MongoDB")
        all_checks_passed = False
        return all_checks_passed
    
    # Check 2: Database exists
    print("\n2️⃣  Checking database...")
    try:
        db = client[settings.DATABASE_NAME]
        collections = await db.list_collection_names()
        if collections:
            print(f"   ✅ Database '{settings.DATABASE_NAME}' exists with {len(collections)} collections")
            print(f"   📦 Collections: {', '.join(collections)}")
        else:
            print(f"   ⚠️  Database '{settings.DATABASE_NAME}' exists but is empty")
            print("   → Run: python seed_data.py")
    except Exception as e:
        print(f"   ❌ Database check failed: {e}")
        all_checks_passed = False
    
    # Check 3: Collections and Document Counts
    print("\n3️⃣  Checking collections and data...")
    try:
        collection_names = ['User', 'Vehicle', 'Driver', 'Trip', 'MaintenanceLog', 'FuelLog', 'Expense']
        has_data = False
        
        for coll_name in collection_names:
            count = await db[coll_name].count_documents({})
            if count > 0:
                print(f"   ✅ {coll_name}: {count} documents")
                has_data = True
            else:
                print(f"   ⚠️  {coll_name}: 0 documents (empty)")
        
        if not has_data:
            print("\n   ⚠️  No data found in any collection")
            print("   → Run: python seed_data.py")
    except Exception as e:
        print(f"   ❌ Collection check failed: {e}")
        all_checks_passed = False
    
    # Check 4: Sample Data Query
    print("\n4️⃣  Testing data query...")
    try:
        sample_vehicle = await db['Vehicle'].find_one()
        if sample_vehicle:
            print("   ✅ Successfully queried data from database")
            print(f"   📝 Sample: {sample_vehicle.get('vehicle_name', 'Unknown')}")
        else:
            print("   ⚠️  No vehicles in database")
    except Exception as e:
        print(f"   ❌ Query test failed: {e}")
        all_checks_passed = False
    
    # Check 5: User Authentication Data
    print("\n5️⃣  Checking authentication setup...")
    try:
        user_count = await db['User'].count_documents({})
        if user_count > 0:
            admin_user = await db['User'].find_one({'username': 'admin'})
            if admin_user:
                print(f"   ✅ Found {user_count} user(s)")
                print("   ✅ Admin user exists - can login with: admin / admin123")
            else:
                print(f"   ⚠️  Found {user_count} user(s) but no 'admin' user")
                print("   → You can login with existing users or create new ones")
        else:
            print("   ⚠️  No users in database")
            print("   → Run: python seed_data.py")
    except Exception as e:
        print(f"   ❌ User check failed: {e}")
        all_checks_passed = False
    
    # Check 6: Beanie Models Import
    print("\n6️⃣  Checking Beanie ODM models...")
    try:
        from app import models
        model_classes = [
            models.User,
            models.Vehicle,
            models.Driver,
            models.Trip,
            models.MaintenanceLog,
            models.FuelLog,
            models.Expense
        ]
        print(f"   ✅ All {len(model_classes)} Beanie models imported successfully")
    except Exception as e:
        print(f"   ❌ Model import failed: {e}")
        all_checks_passed = False
    
    await client.close()
    
    # Final Summary
    print("\n" + "="*60)
    if all_checks_passed:
        print("✅ ALL CHECKS PASSED - System is ready for dynamic testing!")
        print("\n📋 Next steps:")
        print("   1. Start backend: uvicorn app.main:app --reload")
        print("   2. Start frontend: cd transitops-frontend/transitops && npm run dev")
        print("   3. Open browser: http://localhost:5173")
        print("   4. Login with: admin / admin123")
        print("\n📖 Follow DYNAMIC_TESTING_GUIDE.md for comprehensive testing")
    else:
        print("❌ SOME CHECKS FAILED - Please fix issues above")
        print("\n💡 Common fixes:")
        print("   - Start MongoDB: net start MongoDB")
        print("   - Seed database: python seed_data.py")
        print("   - Install dependencies: pip install -r requirements.txt")
    print("="*60)
    
    return all_checks_passed

if __name__ == "__main__":
    try:
        result = asyncio.run(verify_dynamic_system())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Verification cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
