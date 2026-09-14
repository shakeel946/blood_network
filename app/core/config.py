import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lifelink.db")
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
TOKEN_MAX_AGE = int(os.getenv("TOKEN_MAX_AGE", "28800"))
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@bloodnetwork.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
