from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
GENDERS = {"Male", "Female", "Other", "Prefer not to say"}

class DonorProfileBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=18, le=65)
    gender: str
    blood_group: str
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr
    address: str = Field(min_length=3, max_length=500)
    last_donation_date: Optional[date] = None
    available_to_donate: bool = True

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, value: str) -> str:
        value = value.upper().strip()
        if value not in BLOOD_GROUPS:
            raise ValueError("Invalid blood group")
        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        if value not in GENDERS:
            raise ValueError("Invalid gender")
        return value

class DonorCreate(DonorProfileBase):
    password: str = Field(min_length=8, max_length=128)

class DonorUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    age: Optional[int] = Field(default=None, ge=18, le=65)
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = Field(default=None, min_length=7, max_length=30)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(default=None, min_length=3, max_length=500)
    last_donation_date: Optional[date] = None
    available_to_donate: Optional[bool] = None
    account_status: Optional[str] = None

    @field_validator("blood_group")
    @classmethod
    def validate_bg(cls, value):
        if value is not None and value.upper().strip() not in BLOOD_GROUPS:
            raise ValueError("Invalid blood group")
        return value.upper().strip() if value else value

class DonationCreate(BaseModel):
    donation_date: date
    details: Optional[str] = Field(default=None, max_length=500)

class DonationResponse(DonationCreate):
    id: int
    donor_id: int
    class Config:
        from_attributes = True

class DonorResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    age: int
    gender: str
    blood_group: str
    phone: str
    email: EmailStr
    address: str
    last_donation_date: Optional[date]
    available_to_donate: bool
    profile_photo: Optional[str]
    account_status: str
    donations: list[DonationResponse] = []
    class Config:
        from_attributes = True
