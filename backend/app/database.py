from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import get_settings
from .models import User, Vehicle, Driver, Trip, MaintenanceLOG, FuelLog, Expense

settings = get_settings()

# MongoDB client
client: AsyncIOMotorClient = None


async def connect_db():
    """Connect to MongoDB and initialize Beanie"""
    global client
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    
    # Initialize beanie with the database and document models
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User,
            Vehicle,
            Driver,
            Trip,
            MaintenanceLOG,
            FuelLog,
            Expense
        ]
    )
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")


# No need for get_db dependency with Beanie - it handles sessions internally
