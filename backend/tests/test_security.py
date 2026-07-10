"""Tests for security utilities (password hashing, JWT tokens)."""

from datetime import timedelta

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import TokenPayload


class TestPasswordHashing:
    """Tests for password hashing and verification."""

    def test_get_password_hash_returns_argon2id_hash(self) -> None:
        """Verify that get_password_hash returns an Argon2id hash."""
        hashed = get_password_hash("mySecureP@ss1")
        assert hashed.startswith("$argon2id$")

    def test_verify_password_correct(self) -> None:
        """Verify that a correct password passes verification."""
        hashed = get_password_hash("correctPassword1")
        valid, updated = verify_password("correctPassword1", hashed)
        assert valid is True
        assert updated is None  # Hash should not need updating with Argon2id

    def test_verify_password_incorrect(self) -> None:
        """Verify that an incorrect password fails verification."""
        hashed = get_password_hash("realPassword1")
        valid, updated = verify_password("wrongPassword1", hashed)
        assert valid is False
        assert updated is None


class TestJWTToken:
    """Tests for JWT access token creation."""

    def test_create_access_token_returns_string(self) -> None:
        """Verify that create_access_token returns a non-empty JWT string."""
        token = create_access_token(subject="user-123", expires_delta=timedelta(hours=1))
        assert isinstance(token, str)
        assert len(token) > 0
        # JWT has three dot-separated segments
        assert token.count(".") == 2

    def test_create_access_token_different_subjects(self) -> None:
        """Verify that different subjects produce different tokens."""
        token1 = create_access_token(subject="user-111", expires_delta=timedelta(hours=1))
        token2 = create_access_token(subject="user-222", expires_delta=timedelta(hours=1))
        assert token1 != token2
