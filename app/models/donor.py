from datetime import datetime
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class DonorProfile(Base):
    __tablename__ = "donor_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(30), nullable=False)
    blood_group = Column(String(5), nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    last_donation_date = Column(Date, nullable=True)
    available_to_donate = Column(Boolean, nullable=False, default=True, index=True)
    profile_photo = Column(String(255), nullable=True)
    account_status = Column(String(20), nullable=False, default="ACTIVE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    user = relationship("User", back_populates="donor_profile")
    donations = relationship("DonationHistory", back_populates="donor", cascade="all, delete-orphan", order_by="DonationHistory.donation_date.desc()")

class DonationHistory(Base):
    __tablename__ = "donation_history"
    id = Column(Integer, primary_key=True)
    donor_id = Column(Integer, ForeignKey("donor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    donation_date = Column(Date, nullable=False)
    details = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    donor = relationship("DonorProfile", back_populates="donations")
