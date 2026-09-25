from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user_optional

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    isAdmin: bool
    subscriptionTier: str

@router.post("/register")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        is_admin=True, # First user default admin
        subscription_tier="Apple Music Family (Hi-Res Lossless)"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "isAdmin": new_user.is_admin,
            "tier": new_user.subscription_tier
        }
    }

@router.post("/login")
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_in.username_or_email) | (User.email == login_in.username_or_email)
    ).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    token = create_access_token(data={"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "isAdmin": user.is_admin,
            "tier": user.subscription_tier
        }
    }

@router.get("/me")
def get_current_profile(current_user = Depends(get_current_user_optional)):
    if isinstance(current_user, dict):
        return current_user
    if current_user:
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "isAdmin": current_user.is_admin,
            "tier": current_user.subscription_tier
        }
    return {
        "id": "guest_user",
        "username": "Apple Music Guest",
        "email": "guest@music.apple.com",
        "isAdmin": False,
        "tier": "Free Preview"
    }
