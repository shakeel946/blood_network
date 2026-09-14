from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import LoginRequest
from app.schemas.donor import DonorCreate
from app.services.user_service import authenticate, create_user, get_user_by_email
from app.models.donor import DonorProfile
from app.core.security import create_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
def register(data: DonorCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, str(data.email)):
        raise HTTPException(409, "An account with this email already exists")
    user = create_user(db, str(data.email), data.password)
    profile_data = data.model_dump(exclude={"password"})
    profile_data["email"] = str(data.email)
    donor = DonorProfile(user_id=user.id, **profile_data)
    db.add(donor)
    db.commit()
    return {"message": "Registration successful", "user_id": user.id}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate(db, str(data.email), data.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return {"access_token": create_token(user.id, user.role), "token_type": "bearer", "role": user.role}
