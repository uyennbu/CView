"""Endpoints for Candidate Account page (GET/PUT /candidate/profile)."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import bearer_scheme, require_roles
from app.schemas.candidate import CandidateProfileResponse, CandidateProfileUpdateRequest
from app.services.candidate_service import get_candidate_profile, update_candidate_profile

router = APIRouter(prefix="/candidate", tags=["Candidate Profile (Hồ sơ Ứng viên)"])


@router.get(
    "/profile",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(bearer_scheme)],
)
def get_my_candidate_profile(
    token_payload: dict = Depends(require_roles("CANDIDATE", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Lấy thông tin tài khoản và hồ sơ cá nhân của Ứng viên (kèm thông tin địa chỉ cư trú)."""
    account_id = uuid.UUID(str(token_payload.get("sub")))
    return get_candidate_profile(db=db, account_id=account_id)


@router.put(
    "/profile",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(bearer_scheme)],
)
def update_my_candidate_profile(
    payload: CandidateProfileUpdateRequest,
    token_payload: dict = Depends(require_roles("CANDIDATE", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin hồ sơ Ứng viên (candidate_profiles) và địa chỉ cư trú (addresses)."""
    account_id = uuid.UUID(str(token_payload.get("sub")))
    return update_candidate_profile(db=db, account_id=account_id, payload=payload)

