from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import admin_user
from app.models.donor import DonorProfile
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/stats")
def stats(_: User = Depends(admin_user), db: Session = Depends(get_db)):
    return {
        "total_donors": db.query(func.count(DonorProfile.id)).scalar() or 0,
        "available_donors": db.query(func.count(DonorProfile.id)).filter(DonorProfile.available_to_donate.is_(True), DonorProfile.account_status == "ACTIVE").scalar() or 0,
        "unavailable_donors": db.query(func.count(DonorProfile.id)).filter(DonorProfile.available_to_donate.is_(False), DonorProfile.account_status == "ACTIVE").scalar() or 0,
        "disabled_donors": db.query(func.count(DonorProfile.id)).filter(DonorProfile.account_status != "ACTIVE").scalar() or 0,
    }
