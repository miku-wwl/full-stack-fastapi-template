# ForeXchange — Functional & Non-Functional Requirements

> **Project Title:** ForeXchange — Real-Time Remittance & Compliance Monitoring Dashboard
>
> **Assessment 2 — Group Activity:** Verification List of Functional and Non-Functional Requirements
>

---

## Project Introduction

**ForeXchange** is a full-stack cross-border remittance and compliance monitoring platform built with **FastAPI + React + PostgreSQL + Docker**. The system provides real-time forex rates, cross-border remittance (with rate locking and IBAN validation), transaction history tracking, and AML compliance review (risk scoring, flagging, and approval/rejection) for auditors. The frontend uses TanStack Router + Tailwind CSS + ApexCharts for a modern dashboard, and the backend integrates Sentry error monitoring, JWT role-based authentication, and security response headers.

---

## 1. Functional Requirements

Functional requirements define **what the system must do** — specific features, capabilities, and operations. Below is the complete list of ForeXchange functional requirements, each mapped to its implementation location and corresponding Sprint.

| # | Requirement | Description | Implementation | Sprint |
|---|---|---|---|---|
| FR-01 | **User Registration** | Visitors can register a new account via a form (email, password, full name). Default role is `customer`. | `backend/app/api/routes/login.py` → `POST /api/v1/login/access-token`<br>`frontend/src/routes/signup.tsx` | Sprint 1-2 |
| FR-02 | **User Login** | Registered users can authenticate via email + password using OAuth2 password flow to obtain a JWT access token. | `backend/app/api/routes/login.py` → `POST /api/v1/login/access-token`<br>`frontend/src/routes/login.tsx` | Sprint 1-2 |
| FR-03 | **User Logout (Frontend Token Cleanup)** | When users click logout, the frontend clears the locally stored token and redirects to the login page. | `frontend/src/hooks/useAuth.ts` | Sprint 2 |
| FR-04 | **Password Recovery / Reset** | Users can request a password reset via their registered email. The system sends a reset token via email, which the user uses to set a new password. | `backend/app/api/routes/login.py` → `POST /password-recovery/{email}` and `POST /reset-password/`<br>`frontend/src/routes/recover-password.tsx` + `reset-password.tsx` | Sprint 2 |
| FR-05 | **User Profile Management** | Logged-in users can view and update their personal information (name, email). | `backend/app/api/routes/users.py` → `PATCH /api/v1/users/me`<br>`frontend/src/routes/_layout/settings.tsx` | Sprint 2 |
| FR-06 | **Admin User Management** | Superusers can create new users, view all user lists, and manage user roles. | `backend/app/api/routes/users.py` → `GET/POST /api/v1/users/` | Sprint 2 |
| FR-07 | **Real-Time Forex Rates** | The system fetches benchmark rates from the Frankfurter API (ECB official data) for 12 major currency pairs and applies small random fluctuations to simulate live market movement, polling every 5 seconds. | `backend/app/forex.py` → `ForexSimulator` + `start_rate_generator(interval_seconds=5)` | Sprint 3-5 |
| FR-08 | **View Live Rates** | Users can view real-time rates (bid/ask/mid/spread/change%) for all active currency pairs. | `backend/app/api/routes/rates.py` → `GET /api/v1/rates/live`<br>`frontend/src/routes/_layout/rates.tsx` | Sprint 3-5 |
| FR-09 | **View Single Currency Pair Rate** | Users can query the live rate for a specific currency pair (e.g., `USD-EUR`). | `backend/app/api/routes/rates.py` → `GET /api/v1/rates/live/{pair}` | Sprint 5 |
| FR-10 | **Exchange Rate Chart** | The system provides a 24-hour exchange rate trend chart (ApexCharts line chart) showing historical price changes for a selected currency pair. | `frontend/src/pages/Dashboard/Home.tsx` + ApexCharts integration | Sprint 5 |
| FR-11 | **Rate Locking** | Before initiating a remittance, users can lock the current exchange rate for 30 seconds, during which the price is protected from market fluctuations. | `backend/app/api/routes/rates.py` → `POST /api/v1/rates/lock` | Sprint 6 |
| FR-12 | **Cross-Border Remittance** | Users can initiate cross-border remittance transactions — select a currency pair, enter the amount, fill in recipient details (name, IBAN, purpose), and complete the transfer using a locked rate. | `backend/app/api/routes/transactions.py` → `POST /api/v1/transactions/`<br>`frontend/src/routes/_layout/remittance.tsx` | Sprint 6 |
| FR-13 | **IBAN Format Validation** | The system performs basic IBAN format validation (length 15-34 characters, country code + check digits + account number format). | `backend/app/api/routes/transactions.py` → `_validate_iban()` | Sprint 6 |
| FR-14 | **Transaction History** | Users can view their transaction history list with pagination and status filtering (pending/completed/rejected/flagged). | `backend/app/api/routes/transactions.py` → `GET /api/v1/transactions/`<br>`frontend/src/routes/_layout/history.tsx` | Sprint 6 |
| FR-15 | **Dashboard Statistics** | The home dashboard displays aggregate statistics: active currency pairs count, today's transactions, today's total volume (USD), flagged transactions, and average processing time. | `backend/app/api/routes/dashboard.py` → `GET /api/v1/dashboard/summary`<br>`frontend/src/pages/Dashboard/Home.tsx` | Sprint 4 |
| FR-16 | **AML Compliance Screening (Automatic)** | Each remittance submission automatically runs 4 AML anti-money laundering rules (large amount trigger, high-risk country, random spot check, structuring pattern detection), generating a risk score (0-100) and compliance details. | `backend/app/api/routes/compliance.py` → `_run_compliance_rules()`<br>`backend/app/api/routes/transactions.py` (called on submission) | Sprint 7 |
| FR-17 | **Compliance Overview (Auditor)** | Auditors (`auditor`/`superuser`) can view compliance overview: flagged transactions count, today's reviews, approved/rejected counts, and pass rate. | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/overview`<br>`frontend/src/routes/_layout/compliance.tsx` | Sprint 7 |
| FR-18 | **Flagged Transactions List (Auditor)** | Auditors can view all flagged transactions sorted by risk score descending. | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/flagged` | Sprint 7 |
| FR-19 | **Compliance Detail View (Auditor)** | Auditors can view the full compliance details of a single transaction, including triggered rules and risk score. | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/{tx_id}` | Sprint 7 |
| FR-20 | **Compliance Review Action (Auditor)** | Auditors can "approve" or "reject" flagged transactions. A reason is required for rejection. | `backend/app/api/routes/compliance.py` → `POST /api/v1/compliance/review/{tx_id}` | Sprint 7 |
| FR-21 | **Health Check** | Provides `/api/v1/utils/health-check/` endpoint for Docker health checks. | `backend/app/api/routes/utils.py` → `GET /utils/health-check/` | Sprint 1 |
| FR-22 | **Test Email (Admin)** | Superusers can send a test email via the API to verify SMTP configuration. | `backend/app/api/routes/utils.py` → `POST /utils/test-email/` | Sprint 2 |
| FR-23 | **Database Migrations** | Uses Alembic for database schema version control and automated migrations. | `backend/alembic.ini` + alembic migration scripts | Sprint 1 |
| FR-24 | **Seed Data Initialization** | The system automatically seeds currency pair data and initial exchange rates on startup, and starts the background rate generator. | `backend/app/seed_forex.py` + `backend/app/main.py` → `on_startup()` | Sprint 3 |
| FR-25 | **Theme Switching** | Users can toggle between dark and light themes. The system persists the user's preference. | `frontend/src/context/ThemeContext.tsx` + `components/theme-provider.tsx` | Sprint 3 |

---

## 2. Non-Functional Requirements

Non-functional requirements define **how well the system should perform** — quality attributes, performance constraints, and security standards.

| # | Requirement | Description | Implementation | Sprint |
|---|---|---|---|---|
| NFR-01 | **Performance — API Response Time** | API response time should be < 500ms under normal load (excluding external API calls). FastAPI's asynchronous framework inherently supports high performance. | `backend/app/main.py` (FastAPI async framework) | Sprint 1 |
| NFR-02 | **Performance — Rate Freshness** | Exchange rate data auto-refreshes every 5 seconds, ensuring users see near-real-time market data. | `backend/app/forex.py` → `start_rate_generator(interval_seconds=5)` | Sprint 3-5 |
| NFR-03 | **Performance — Frontend Static Assets** | The frontend is built with Vite, producing compressed static assets for production. Nginx serves them with gzip and caching enabled. | `frontend/vite.config.ts` + `frontend/nginx.conf` | Sprint 1 |
| NFR-04 | **Security — JWT Authentication** | All protected API endpoints require a valid JWT access token (HS256 algorithm, 8-day expiry). | `backend/app/core/security.py` → `create_access_token()`<br>`backend/app/api/deps.py` → `get_current_user()` | Sprint 1-2 |
| NFR-05 | **Security — Role-Based Access Control** | The system implements a three-role permission model: `customer`, `auditor`, and `superuser`. Different roles have access to different endpoints. | `backend/app/api/deps.py` → `get_current_active_superuser()`<br>`backend/app/api/routes/compliance.py` → `_require_auditor()` | Sprint 2-7 |
| NFR-06 | **Security — Password Hashing** | User passwords are hashed using a hybrid Argon2 + bcrypt algorithm, making them non-reversible. | `backend/app/core/security.py` → `PasswordHash(Argon2Hasher, BcryptHasher)` | Sprint 2 |
| NFR-07 | **Security — Security Response Headers** | All API responses automatically include security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`. | `backend/app/main.py` → `SecurityHeadersMiddleware` | Sprint 1 |
| NFR-08 | **Security — CORS Configuration** | Backend CORS policy is configurable via the `BACKEND_CORS_ORIGINS` environment variable, with the frontend domain allowed by default. | `backend/app/core/config.py` → `all_cors_origins`<br>`backend/app/main.py` → `CORSMiddleware` | Sprint 1 |
| NFR-09 | **Security — Email Enumeration Prevention** | The password recovery endpoint returns the same message regardless of whether the email exists, preventing attackers from enumerating registered emails via response differences. | `backend/app/api/routes/login.py` → `recover_password()` returns unified message | Sprint 2 |
| NFR-10 | **Reliability — Global Exception Handling** | The system registers global exception handlers (400 and 500) to prevent uncaught exceptions from leaking sensitive information. | `backend/app/main.py` → `value_error_handler()` + `global_exception_handler()` | Sprint 1 |
| NFR-11 | **Reliability — Docker Health Check** | The backend service is configured with a health check (curl to `/api/v1/utils/health-check/`). Docker Compose ensures correct service startup order. | `compose.yml` → `backend.healthcheck` + `depends_on` | Sprint 1 |
| NFR-12 | **Reliability — Database Health Dependency** | Backend and prestart services wait for the PostgreSQL container to be healthy (via `pg_isready`) before starting. | `compose.yml` → `db.healthcheck` | Sprint 1 |
| NFR-13 | **Maintainability — Static Code Analysis** | The backend uses Pylint + Ruff + MyPy for static type checking and code quality; the frontend uses Biome for linting. | `backend/pyproject.toml` (pylint/ruff/mypy config)<br>`frontend/biome.json` | Sprint 1 |
| NFR-14 | **Maintainability — CI/CD Pipeline** | GitHub Actions automatically runs Pylint static analysis on pushes to `main`/`cloudarch`/`cloudarchitf` branches or pull requests. | `.github/workflows/pylint.yml` | Sprint 1 |
| NFR-15 | **Maintainability — Auto-Generated API Client** | Uses `@hey-api/openapi-ts` to automatically generate TypeScript API client code from the OpenAPI schema, keeping frontend and backend types in sync. | `frontend/openapi-ts.config.ts` + `frontend/src/client/` | Sprint 1 |
| NFR-16 | **Maintainability — Database Migrations** | Uses Alembic for database schema version management; all schema changes are tracked through migration scripts. | `backend/alembic.ini` + migration version directory | Sprint 1 |
| NFR-17 | **Usability — Responsive UI** | The frontend uses Tailwind CSS to build a responsive layout that adapts to desktop and mobile devices. | `frontend/src/layout/` + Tailwind CSS responsive classes | Sprint 3 |
| NFR-18 | **Usability — Error Notification** | Unified error notification mechanism: the backend returns standard JSON error responses, and the frontend uses the sonner toast component to display user-friendly error messages. | `frontend/src/hooks/useCustomToast.ts` + `sonner`<br>`frontend/src/components/Common/ErrorComponent.tsx` | Sprint 1-3 |
| NFR-19 | **Usability — 404 Page** | Unmatched routes display a friendly 404 page. | `frontend/src/components/Common/NotFound.tsx` | Sprint 1 |
| NFR-20 | **Portability — Docker Containerization** | The entire system (frontend, backend, database) is deployable with a single Docker Compose command. Environment configuration is managed via `.env` file. | `compose.yml` + `backend/Dockerfile` + `frontend/Dockerfile` | Sprint 1 |
| NFR-21 | **Portability — Environment Configuration** | All environment-specific settings (database, secrets, SMTP, etc.) are injected via environment variables, supporting `local`/`staging`/`production` environments. | `backend/app/core/config.py` → `Settings` + `ENVIRONMENT` | Sprint 1 |

---

## 3. Extended Requirements

Extended requirements define additional capabilities that enhance the system beyond core functionality, including monitoring, logging, and disaster recovery.

| # | Requirement | Description | Implementation | Sprint |
|---|---|---|---|---|
| ER-01 | **Error Monitoring — Sentry** | The system integrates Sentry SDK for production error tracking and performance monitoring. Enabled when `SENTRY_DSN` is configured and environment is not `local`. | `backend/app/main.py` → `sentry_sdk.init()`<br>`backend/app/core/config.py` → `SENTRY_DSN` | Sprint 1 |
| ER-02 | **Logging** | The backend uses Python's `logging` module to record key operations, warnings, and error information. Log levels are configurable. | `backend/app/main.py`, `logger` instances in route files | Sprint 1 |
| ER-03 | **API Documentation** | FastAPI auto-generates interactive OpenAPI documentation (Swagger UI + ReDoc), accessible at `/docs` and `/redoc`. | `backend/app/main.py` → `FastAPI(title=..., openapi_url=...)` | Sprint 1 |
| ER-04 | **Frontend Developer Tools** | The development environment integrates TanStack Router Devtools and React Query Devtools for debugging routes and data queries. | `frontend/src/routes/__root.tsx` → `TanStackRouterDevtools` + `ReactQueryDevtools` | Sprint 1 |
| ER-05 | **Email Service** | The system supports sending password reset emails and new account notification emails via SMTP. MailCatcher can be used to intercept emails in `local` environment. | `backend/app/utils.py` → `send_email()`<br>`compose.override.yml` → MailCatcher service | Sprint 2 |
| ER-06 | **Code Coverage** | The project is configured with pytest + coverage tools for test coverage analysis. | `backend/pyproject.toml` → `[dependency-groups] dev` → `coverage`<br>`backend/scripts/prestart.sh` | Sprint 1 |
| ER-07 | **Infrastructure as Code — Terraform** | Provides Terraform configuration files for Azure cloud infrastructure deployment (Container Apps, PostgreSQL, Key Vault, Storage). | `tf/` directory `.tf` files | Sprint 9-10 |
| ER-08 | **Frontend E2E Testing** | Uses Playwright for end-to-end testing. | `frontend/package.json` → `"test": "bunx playwright test"` | Sprint 8 |

---

## 4. Requirements Summary

| Category | Count | Percentage |
|---|---|---|
| Functional Requirements | 25 | 54.3% |
| Non-Functional Requirements | 21 | 45.7% |
| Extended Requirements | 8 | — (included in above counts) |
| **Total** | **46** | **100%** |

---

## 5. Sprint Mapping

| Sprint | Key Deliverables |
|--------|-----------------|
| **Sprint 1** | Project scaffolding, Docker containerization, FastAPI app initialization, database configuration, Alembic migrations, CORS/Security middleware, health check, CI/CD pipeline, Sentry integration, OpenAPI client generation |
| **Sprint 2** | JWT authentication system, user registration/login/logout, password recovery/reset, user profile management, email service, admin user management |
| **Sprint 3** | Layout navigation, theme switching (dark/light), forex data seeding, rate generator |
| **Sprint 4** | Dashboard homepage, statistics cards, transaction list |
| **Sprint 5** | Real-time forex rates (12 pairs, 5-second polling), exchange rate charts (ApexCharts, 24h history) |
| **Sprint 6** | Cross-border remittance (rate locking + IBAN validation), transaction history (pagination + status filtering) |
| **Sprint 7** | AML compliance audit system (risk scoring, flagged transactions, review actions) |
| **Sprint 8** | E2E testing, performance optimization, bug fixes |
| **Sprint 9-10** | Azure cloud deployment (Terraform, Container Apps), deployment verification |

---

*Document generated: 2026-06-20*
*This document is based on the GeeksforGeeks — "Functional vs Non-functional Requirements" classification standard.*
