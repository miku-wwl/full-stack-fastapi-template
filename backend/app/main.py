"""FastAPI application entry point for ForeXchange.

Initialises the FastAPI app, configures middleware (CORS, security headers),
registers global exception handlers, and includes all API route routers.
Also triggers forex data seeding and the background rate generator on startup.
"""

import logging

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.seed_forex import seed_forex_data, start_rate_generator

logger = logging.getLogger(__name__)


def custom_generate_unique_id(route: APIRoute) -> str:
    """Generate a unique operation ID for each route using tag + function name."""
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)


# ──────────────────────────────────────────────
# Security headers middleware
# ──────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware that adds security-related HTTP headers to every response.

    Headers added: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
    Referrer-Policy, and Permissions-Policy. Provides utility methods for
    header construction and validation.
    """

    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    }

    def get_security_headers(self) -> dict[str, str]:
        """Return the dict of security headers applied by this middleware.

        Useful for testing and logging to verify which headers are set.
        """
        return dict(self.SECURITY_HEADERS)

    def validate_response_headers(self, response_headers: dict) -> list[str]:
        """Check if all required security headers are present in a response.

        Args:
            response_headers: A dict-like object of response header key-value pairs.

        Returns:
            A list of missing header names (empty if all are present).
        """
        missing = []
        for header in self.SECURITY_HEADERS:
            if header not in response_headers:
                missing.append(header)
        return missing

    async def dispatch(self, request: Request, call_next):
        """Intercept request, call the next handler, then add security headers."""
        response = await call_next(request)
        for header, value in self.SECURITY_HEADERS.items():
            response.headers[header] = value
        return response


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


# ──────────────────────────────────────────────
# Global exception handlers
# ──────────────────────────────────────────────

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Return a 400 response with the ValueError message for validation errors."""
    logger.warning("ValueError: %s", exc)
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all exception handler returning a generic 500 error to avoid leaking internals."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


@app.on_event("startup")
def on_startup() -> None:
    """Seed forex data and start background rate generator."""
    try:
        seed_forex_data()
        start_rate_generator(interval_seconds=5)
    except Exception as e:
        logger.warning("Could not start forex simulator: %s", e)
        logger.warning(
            "App started without forex data. Rates and transactions "
            "will be unavailable until the issue is resolved."
        )
