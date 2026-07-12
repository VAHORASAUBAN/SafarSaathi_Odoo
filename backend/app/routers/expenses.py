from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from .. import models, schemas, auth

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[schemas.ExpenseResponse])
async def get_expenses(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    expense_type: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all expenses with optional filters"""
    query = models.Expense.find()
    
    if vehicle_id:
        query = query.find(models.Expense.vehicle_id == vehicle_id)
    if expense_type:
        query = query.find(models.Expense.expense_type == expense_type)
    
    expenses = await query.skip(skip).limit(limit).to_list()
    return expenses


@router.post("", response_model=schemas.ExpenseResponse)
async def create_expense(
    expense: schemas.ExpenseCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new expense"""
    auth.check_permission(current_user, [
        models.UserRole.DISPATCHER,
        models.UserRole.FLEET_MANAGER,
        models.UserRole.FINANCIAL_ANALYST
    ])
    
    vehicle = await models.Vehicle.find_one(models.Expense.vehicle_id == expense.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_expense = models.Expense(**expense.model_dump())
    await db_expense.insert()
    return db_expense
