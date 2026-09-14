from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.donor import DonorProfile, DonationHistory

def get_donor(db, user_id):
    return db.query(DonorProfile).options(joinedload(DonorProfile.donations)).filter(DonorProfile.user_id == user_id).first()

def get_donor_by_id(db, donor_id):
    return db.query(DonorProfile).options(joinedload(DonorProfile.donations)).filter(DonorProfile.id == donor_id).first()

def list_donors(db, search=None, blood_group=None, gender=None, available=None, status=None):
    q = db.query(DonorProfile)
    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(DonorProfile.full_name.ilike(term), DonorProfile.email.ilike(term), DonorProfile.phone.ilike(term)))
    if blood_group:
        q = q.filter(DonorProfile.blood_group == blood_group.upper())
    if gender:
        q = q.filter(DonorProfile.gender == gender)
    if available is not None:
        q = q.filter(DonorProfile.available_to_donate == available)
    if status:
        q = q.filter(DonorProfile.account_status == status)
    return q.order_by(DonorProfile.created_at.desc()).all()

def add_donation(db, donor, data):
    donation = DonationHistory(donor_id=donor.id, **data.model_dump())
    db.add(donation)
    donor.last_donation_date = data.donation_date
    db.commit()
    db.refresh(donation)
    return donation
