"""Clear all users from database"""
import asyncio
from app.database import connect_db, close_db
from app.models import User

async def clear_all_users():
    await connect_db()
    result = await User.delete_all()
    print(f"✅ Deleted all users")
    await close_db()

if __name__ == "__main__":
    asyncio.run(clear_all_users())
