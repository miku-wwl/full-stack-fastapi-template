"""Tests for CRUD operations (create_user, update_user, get_user_by_email, authenticate)."""

from sqlmodel import Session

from app import crud
from app.core.security import get_password_hash, verify_password
from app.models import User, UserCreate, UserUpdate


class TestCreateUser:
    """Tests for crud.create_user()."""

    def test_create_user_sets_hashed_password(self, session: Session) -> None:
        """Verify that create_user stores a hashed password, not plain text."""
        user_in = UserCreate(email="new@test.com", password="securePass123", full_name="New User")
        user = crud.create_user(session=session, user_create=user_in)
        assert user.email == "new@test.com"
        assert user.hashed_password != "securePass123"
        assert user.hashed_password.startswith("$argon2id$")
        assert user.is_active is True
        assert user.role == "customer"

    def test_create_user_duplicate_email_raises(self, session: Session) -> None:
        """Verify that creating a user with a duplicate email raises an integrity error."""
        user_in = UserCreate(email="dup@test.com", password="test1234", full_name="Dup User")
        crud.create_user(session=session, user_create=user_in)
        user_in2 = UserCreate(email="dup@test.com", password="test5678", full_name="Dup User 2")
        import pytest
        from sqlalchemy.exc import IntegrityError
        with pytest.raises(IntegrityError):
            crud.create_user(session=session, user_create=user_in2)


class TestUpdateUser:
    """Tests for crud.update_user()."""

    def test_update_user_email(self, session: Session) -> None:
        """Verify that updating a user's email works correctly."""
        user_in = UserCreate(email="old@test.com", password="test1234", full_name="Old Name")
        user = crud.create_user(session=session, user_create=user_in)
        updated = crud.update_user(
            session=session,
            db_user=user,
            user_in=UserUpdate(email="new@test.com"),
        )
        assert updated.email == "new@test.com"

    def test_update_user_password_rehashes(self, session: Session) -> None:
        """Verify that updating a password re-hashes and does not store plain text."""
        user_in = UserCreate(email="pwtest@test.com", password="oldPass123", full_name="PW Test")
        user = crud.create_user(session=session, user_create=user_in)
        old_hash = user.hashed_password
        updated = crud.update_user(
            session=session,
            db_user=user,
            user_in=UserUpdate(password="newPass456"),
        )
        assert updated.hashed_password != old_hash
        assert updated.hashed_password.startswith("$argon2id$")


class TestGetUserByEmail:
    """Tests for crud.get_user_by_email()."""

    def test_get_user_by_email_found(self, session: Session) -> None:
        """Verify that an existing user can be retrieved by email."""
        user_in = UserCreate(email="findme@test.com", password="test1234", full_name="Find Me")
        crud.create_user(session=session, user_create=user_in)
        found = crud.get_user_by_email(session=session, email="findme@test.com")
        assert found is not None
        assert found.email == "findme@test.com"

    def test_get_user_by_email_not_found(self, session: Session) -> None:
        """Verify that retrieving a non-existent email returns None."""
        found = crud.get_user_by_email(session=session, email="nonexistent@test.com")
        assert found is None


class TestAuthenticate:
    """Tests for crud.authenticate()."""

    def test_authenticate_valid_credentials(self, session: Session) -> None:
        """Verify that valid email + password returns the user."""
        user_in = UserCreate(email="auth@test.com", password="correctPass1", full_name="Auth Test")
        crud.create_user(session=session, user_create=user_in)
        user = crud.authenticate(session=session, email="auth@test.com", password="correctPass1")
        assert user is not None
        assert user.email == "auth@test.com"

    def test_authenticate_wrong_password(self, session: Session) -> None:
        """Verify that wrong password returns None."""
        user_in = UserCreate(email="wrongpw@test.com", password="rightPass1", full_name="Wrong PW")
        crud.create_user(session=session, user_create=user_in)
        user = crud.authenticate(session=session, email="wrongpw@test.com", password="wrongPass1")
        assert user is None

    def test_authenticate_nonexistent_email(self, session: Session) -> None:
        """Verify that a non-existent email returns None (timing-safe)."""
        user = crud.authenticate(session=session, email="noone@test.com", password="anyPass123")
        assert user is None
