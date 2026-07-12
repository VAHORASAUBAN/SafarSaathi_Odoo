from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_db, close_db
from .routers import auth, vehicles, drivers, trips, maintenance, fuel, expenses, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_db()
    yield
    # Shutdown: Close MongoDB connection
    await close_db()


app = FastAPI(
    title="TransitOps API",
    description="Smart Transport Operations Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(fuel.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {
        "message": "TransitOps API",
        "version": "1.0.0",
        "status": "operational",
        "database": "MongoDB"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "MongoDB"}
