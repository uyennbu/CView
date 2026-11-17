"""Endpoints for Recruiter Profile & Company (GET/PUT /recruiter/profile)."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import bearer_scheme, require_roles
from app.schemas.recruiter import RecruiterProfileResponse, RecruiterProfileUpdateRequest
from app.services.recruiter_service import get_recruiter_profile, update_recruiter_profile

router = APIRouter(prefix="/recruiter", tags=["Recruiter Profile & Company (Hồ sơ Nhà tuyển dụng)"])


@router.get(
    "/profile",
    response_model=RecruiterProfileResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(bearer_scheme)],
)
def get_my_recruiter_profile(
    token_payload: dict = Depends(require_roles("RECRUITER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Lấy thông tin hồ sơ Nhà tuyển dụng, thông tin pháp nhân Công ty và địa chỉ trụ sở."""
    account_id = uuid.UUID(str(token_payload.get("sub")))
    return get_recruiter_profile(db=db, account_id=account_id)


@router.put(
    "/profile",
    response_model=RecruiterProfileResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(bearer_scheme)],
)
def update_my_recruiter_profile(
    payload: RecruiterProfileUpdateRequest,
    token_payload: dict = Depends(require_roles("RECRUITER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin hồ sơ Nhà tuyển dụng (recruiter_profiles), Công ty (companies) và địa chỉ (addresses)."""
    account_id = uuid.UUID(str(token_payload.get("sub")))
    return update_recruiter_profile(db=db, account_id=account_id, payload=payload)

