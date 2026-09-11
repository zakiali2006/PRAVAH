from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title="MAITRI Portal API",
    description="Backend services for the MAITRI 2.0 Single Window Clearance System",
    version="1.0.0"
)

# Configure CORS
origins = [str(origin).strip() for origin in settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main API router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to the MAITRI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
