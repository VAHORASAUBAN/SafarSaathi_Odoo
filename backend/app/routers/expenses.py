from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    expense_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all expenses with optional filters"""
    expenses = crud.get_expenses(
        db, skip=skip, limit=limit, vehicle_id=vehicle_id, expense_type=expense_type
    )
    return expenses


@router.post("", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new expense"""
    auth.check_permission(current_user, [
        models.UserRole.DRIVER,
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    return crud.create_expense(db, expense)
