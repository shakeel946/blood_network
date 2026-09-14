from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import current_user, admin_user
from app.models.user import User
from app.models.donor import DonorProfile
from app.schemas.donor import DonorUpdate, DonationCreate, DonorResponse
from app.services.donor_service import get_donor, get_donor_by_id, list_donors, add_donation
from app.core.config import UPLOAD_DIR

router = APIRouter(prefix="/api", tags=["Donors"])

@router.get("/me", response_model=DonorResponse)
def my_profile(user: User = Depends(current_user), db: Session = Depends(get_db)):
    donor = get_donor(db, user.id)
    if not donor: raise HTTPException(404, "Donor profile not found")
    return donor

@router.patch("/me", response_model=DonorResponse)
def update_my_profile(data: DonorUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    donor = get_donor(db, user.id)
    if not donor: raise HTTPException(404, "Donor profile not found")
    if data.email and str(data.email).lower() != user.email.lower():
        from app.services.user_service import get_user_by_email
        if get_user_by_email(db, str(data.email)): raise HTTPException(409, "Email is already in use")
        user.email = str(data.email).lower()
    updates = data.model_dump(exclude_unset=True)
    updates.pop("account_status", None)
    if "email" in updates: updates["email"] = str(updates["email"])
    for key, value in updates.items(): setattr(donor, key, value)
    db.commit(); db.refresh(donor)
    return donor

@router.post("/me/photo", response_model=DonorResponse)
async def upload_photo(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    donor = get_donor(db, user.id)
    if not donor: raise HTTPException(404, "Donor profile not found")
    allowed = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    if file.content_type not in allowed: raise HTTPException(400, "Only JPG, PNG, or WEBP images are allowed")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024: raise HTTPException(413, "Profile photo must be 5 MB or smaller")
    filename = f"{uuid4().hex}{allowed[file.content_type]}"
    (UPLOAD_DIR / filename).write_bytes(content)
    donor.profile_photo = f"/uploads/{filename}"
    db.commit(); db.refresh(donor)
    return donor

@router.get("/donors", response_model=list[DonorResponse])
def all_donors(search: str | None = None, blood_group: str | None = None, gender: str | None = None, available: bool | None = None, status: str | None = None, _: User = Depends(admin_user), db: Session = Depends(get_db)):
    return list_donors(db, search, blood_group, gender, available, status)

@router.get("/donors/{donor_id}", response_model=DonorResponse)
def donor_detail(donor_id: int, _: User = Depends(admin_user), db: Session = Depends(get_db)):
    donor = get_donor_by_id(db, donor_id)
    if not donor: raise HTTPException(404, "Donor not found")
    return donor

@router.patch("/donors/{donor_id}", response_model=DonorResponse)
def admin_update_donor(donor_id: int, data: DonorUpdate, _: User = Depends(admin_user), db: Session = Depends(get_db)):
    donor = get_donor_by_id(db, donor_id)
    if not donor: raise HTTPException(404, "Donor not found")
    updates = data.model_dump(exclude_unset=True)
    if "email" in updates: updates["email"] = str(updates["email"])
    for key, value in updates.items():
        if key == "email": donor.user.email = value.lower()
        setattr(donor, key, value)
    db.commit(); db.refresh(donor)
    return donor

@router.post("/donors/{donor_id}/donations", response_model=DonorResponse)
def record_donation(donor_id: int, data: DonationCreate, _: User = Depends(admin_user), db: Session = Depends(get_db)):
    donor = get_donor_by_id(db, donor_id)
    if not donor: raise HTTPException(404, "Donor not found")
    add_donation(db, donor, data)
    return get_donor_by_id(db, donor_id)
