"""Central API router — aggregates all route modules.

Each sub-module handles a specific domain (auth, users, rates, etc.)
and is included here to form the complete API surface.
"""

from fastapi import APIRouter

from app.api.routes import compliance, dashboard, login, rates, transactions, users, utils

# Root API router that registers all endpoint modules
api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(rates.router)
api_router.include_router(transactions.router)
api_router.include_router(dashboard.router)
api_router.include_router(compliance.router)
