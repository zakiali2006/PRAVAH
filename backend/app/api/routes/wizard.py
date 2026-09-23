from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.schemas.wizard import WizardRunCreate, WizardRunOut
from app.services.wizard_service import wizard_service

router = APIRouter()


@router.post("/run", response_model=Any)
def create_wizard_run(
    obj_in: WizardRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    run = wizard_service.create_run(db, user_id=current_user.id, obj_in=obj_in)
    return success_response(
        data=WizardRunOut.model_validate(run).model_dump(),
        message="Wizard run created successfully.",
    )


@router.get("/runs", response_model=Any)
def get_wizard_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    runs = wizard_service.get_runs(db, user_id=current_user.id)
    return success_response(
        data=[WizardRunOut.model_validate(r).model_dump() for r in runs],
        message="Wizard runs retrieved successfully.",
    )


@router.get("/runs/{id}", response_model=Any)
def get_wizard_run(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    run = wizard_service.get_run(db, user_id=current_user.id, run_id=id)
    return success_response(
        data=WizardRunOut.model_validate(run).model_dump(),
        message="Wizard run retrieved successfully.",
    )

from app.schemas.caf import CAFFormOut
from app.services.caf_service import caf_service

@router.post("/runs/{id}/generate-caf", response_model=Any)
def generate_caf(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    caf = caf_service.generate_caf(db, user_id=current_user.id, wizard_run_id=id)
    return success_response(
        data=CAFFormOut.model_validate(caf).model_dump(),
        message="CAF generated successfully.",
    )

