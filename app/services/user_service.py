from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.lower().strip()).first()

def authenticate(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or user.account_status != "ACTIVE" or not verify_password(password, user.password_hash):
        return None
    return user

def create_user(db: Session, email: str, password: str, role: str = "DONOR"):
    user = User(email=email.lower().strip(), password_hash=hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
