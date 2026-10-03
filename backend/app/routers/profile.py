"""
routers/profile.py — GET /profile
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import User
from app.schemas import UserProfile, ProfileUpdate

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserProfile)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.industry is not None:
        current_user.industry = payload.industry
    db.commit()
    db.refresh(current_user)
    return current_user
