from fastapi import APIRouter

from app.api.routes import compliance, dashboard, login, rates, transactions, users, utils

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(rates.router)
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(dashboard.router)
api_router.include_router(compliance.router)
api_router.include_router(transactions.router)
