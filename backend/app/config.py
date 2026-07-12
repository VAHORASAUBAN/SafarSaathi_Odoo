from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    # MongoDB Settings
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "transitops"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
