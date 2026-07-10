"""Security and authentication utilities for ForeXchange.

Provides JWT access token creation, password hashing with Argon2id + Bcrypt
(via the pwdlib library), and password verification with automatic hash upgrading.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings

# Hybrid password hasher: Argon2id (primary) + Bcrypt (fallback for legacy hashes)
password_hash = PasswordHash(
    (
        Argon2Hasher(),
        BcryptHasher(),
    )
)

# JWT signing algorithm
ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    """Create a signed JWT access token with the given subject and expiration time."""
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(
    plain_password: str, hashed_password: str
) -> tuple[bool, str | None]:
    """Verify a plain-text password against the stored hash. Returns (valid, updated_hash)."""
    return password_hash.verify_and_update(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using Argon2id with automatic salt generation."""
    return password_hash.hash(password)
