from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine, SessionLocal
from app.models import User, DonorProfile, DonationHistory
from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.security import hash_password
from app.api import auth, donors, admin, blood_requests

Base.metadata.create_all(bind=engine)

def ensure_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == ADMIN_EMAIL.lower()).first()
        if not user:
            db.add(User(email=ADMIN_EMAIL.lower(), password_hash=hash_password(ADMIN_PASSWORD), role="ADMIN", account_status="ACTIVE"))
            db.commit()
    finally:
        db.close()

ensure_admin()
app = FastAPI(title="Blood Network", description="Blood donor registration and administration platform", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(donors.router)
app.include_router(admin.router)
app.include_router(blood_requests.router)

@app.get("/api/health")
def health(): return {"status": "OK", "service": "Blood Network"}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
