# Inheritance Types & Design Patterns — ForeXchange

> **MSE800 Assessment 2 | Group R | Zhe Wang, Weilai Wang**
> This document explains the inheritance hierarchies used in the project's OOP design and the software design patterns applied, as required by Week 8 and Week 10 assessment criteria.

---

## 1. Inheritance Types (标注在 UML 类图上)

The project uses **three types of inheritance** across its class hierarchy, all clearly marked in the UML Class Diagram:

### 1.1 Single Inheritance — SQLModel Base Classes

All database entity classes follow a **two-level single inheritance** pattern:

```
SQLModel (external library)
    ↑
    ├── UserBase           (shared fields: email, is_active, role, etc.)
    ├── CurrencyPairBase   (shared fields: base_currency, quote_currency)
    ├── RateSnapshotBase   (shared fields: bid, ask, mid, spread)
    └── TransactionBase    (shared fields: source_amount, status, etc.)
```

### 1.2 Table Inheritance — Database ORM Classes

Each `*Base` class has a concrete subclass with `table=True` that becomes a database table:

```
UserBase → User (table=True)           → mapped to "user" table
CurrencyPairBase → CurrencyPair (table=True) → mapped to "currencypair" table
RateSnapshotBase → RateSnapshot (table=True) → mapped to "ratesnapshot" table
TransactionBase → Transaction (table=True)   → mapped to "transaction" table
```

### 1.3 Schema Inheritance — Pydantic Request/Response Models

Multiple request/response schemas inherit from the same base to reuse field definitions:

```
UserBase
    ↑
    ├── UserCreate      (adds: password)
    ├── UserPublic      (adds: id, created_at)
    └── UserUpdate      (makes all fields optional)
```

**Why this inheritance structure?**
- **DRY principle**: Common fields defined once in the base class
- **Separation of concerns**: Database models (`table=True`) are distinct from API schemas
- **Type safety**: Pydantic validation ensures data integrity at API boundaries

---

## 2. Software Design Patterns

The following design patterns are used in the ForeXchange codebase:

### 2.1 Middleware Pattern 🏗️

**Location:** `backend/app/main.py` — `SecurityHeadersMiddleware(BaseHTTPMiddleware)`

**Purpose:** Intercepts every HTTP request/response to add security headers without modifying individual route handlers.

```python
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        # ... more security headers
        return response
```

**Benefit:** Cross-cutting security concerns are handled in one place rather than duplicated across 20+ route handlers.

### 2.2 Repository Pattern 📁

**Location:** `backend/app/crud.py`

**Purpose:** Data access logic is abstracted into a dedicated layer, separating database operations from business logic in route handlers.

```python
def create_user(*, session: Session, user_create: UserCreate) -> User: ...
def get_user_by_email(*, session: Session, email: str) -> User | None: ...
def authenticate(*, session: Session, email: str, password: str) -> User | None: ...
```

**Benefit:** If the ORM or database changes, only `crud.py` needs updating — route handlers remain unchanged.

### 2.3 Template Method Pattern 📄

**Location:** `backend/app/utils.py` — `render_email_template()`

**Purpose:** Jinja2 templates define the email structure (HTML template), while Python code provides variable data.

```python
def render_email_template(*, template_name: str, context: dict) -> str:
    template = Jinja2Templates(directory=templates_dir).get_template(template_name)
    return template.render(**context)
```

**Benefit:** Email layout can be changed without modifying Python code — just edit the HTML template.

### 2.4 Strategy Pattern (via Dependency Injection) 🔌

**Location:** `backend/app/core/security.py` — `PasswordHash(Argon2Hasher, BcryptHasher)`

**Purpose:** The password hashing strategy can be composed of multiple algorithms, with automatic fallback.

```python
password_hash = PasswordHash((Argon2Hasher(), BcryptHasher()))
```

**Benefit:** New users get Argon2id (strongest), while legacy bcrypt hashes are upgraded on next login — zero-downtime security migration.

### 2.5 Singleton Pattern (via Pydantic Settings) ⚙️

**Location:** `backend/app/core/config.py` — `class Settings(BaseSettings)`

**Purpose:** Application configuration is loaded once from environment variables and shared across all modules.

```python
settings = Settings()  # Single instance used app-wide
```

**Note:** This is Pydantic's built-in singleton behaviour via `BaseSettings`, not a custom implementation. Per assessment guidelines, Singleton is not used for database connections.

### 2.6 Simulator Pattern 🎲

**Location:** `backend/app/forex.py` — `class ForexSimulator`

**Purpose:** Encapsulates complex forex rate simulation logic (ECB benchmark fetching, random fluctuation, bid/ask spread calculation) in a reusable class.

```python
class ForexSimulator:
    def __init__(self, base_rates=None, volatility=0.0002): ...
    def generate_snapshot(self, pair: CurrencyPair) -> RateSnapshot: ...
```

**Benefit:** The simulation engine is independently testable and swappable (e.g., replace with real market data feed).

---

## 3. OOP Compliance Summary

| Requirement | Status | Evidence |
|------------|--------|----------|
| Classes with ≥3 methods | ✅ | `ForexSimulator`: `__init__`, `_get_base_rate`, `_fluctuate`, `generate_snapshot` (4 methods) |
| Inheritance marked on UML | ✅ | Class diagram shows all △ inheritance arrows |
| OOP principles used | ✅ | 33 classes across 5 files; inheritance, encapsulation, polymorphism |
