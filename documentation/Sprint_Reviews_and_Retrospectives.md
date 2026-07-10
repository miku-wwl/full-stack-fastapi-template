# Sprint Reviews & Retrospectives — ForeXchange

> **MSE800 Assessment 2 | Group R | Zhe Wang, Weilai Wang**
> This document records all sprint activities, progress updates, sprint reviews, and retrospectives as required by the Agile Project Management deliverable (Week 9 Activity 2).

---

## Sprint 1: Foundation (Week 9–10)

### Sprint Goal
Establish project scaffolding, authentication system, database schema, and CI/CD pipeline.

### Sprint Backlog

| Task | Status | Assignee |
|------|--------|----------|
| Docker Compose setup (FastAPI + PostgreSQL + Nginx) | ✅ Done | Zhe Wang |
| FastAPI application skeleton with CORS & security headers | ✅ Done | Zhe Wang |
| SQLModel ORM schema (User, CurrencyPair) | ✅ Done | Zhe Wang |
| Alembic migration configuration | ✅ Done | Zhe Wang |
| JWT authentication (register / login / password recovery) | ✅ Done | Weilai Wang |
| React app scaffold with TanStack Router & Tailwind CSS | ✅ Done | Weilai Wang |
| Login & Signup pages | ✅ Done | Weilai Wang |
| GitHub Actions Pylint workflow | ✅ Done | Zhe Wang |
| Sentry error monitoring integration | ✅ Done | Zhe Wang |

### Sprint Review (Demo)
- ✅ Working Docker Compose startup
- ✅ User registration and login flow (JWT tokens returned)
- ✅ Database tables created via Alembic migration
- ✅ React app rendering with login/signup pages

### Retrospective

| What went well | What to improve | Action Items |
|----------------|----------------|--------------|
| Fast scaffolding with Docker + FastAPI | Better task distribution between members | Divide frontend/backend tasks more clearly |
| JWT auth working from day 1 | More upfront API contract discussion | Use OpenAPI spec before coding routes |

---

## Sprint 2: Core Trading (Week 11–12)

### Sprint Goal
Build real-time forex engine, remittance flow, transaction history, and dashboard.

### Sprint Backlog

| Task | Status | Assignee |
|------|--------|----------|
| ForexSimulator with Frankfurter ECB API | ✅ Done | Zhe Wang |
| 5-second real-time rate polling (background thread) | ✅ Done | Zhe Wang |
| Rate locking mechanism (30s TTL) | ✅ Done | Zhe Wang |
| Exchange rate charts (ApexCharts, 24h history) | ✅ Done | Weilai Wang |
| Remittance form with IBAN validation | ✅ Done | Weilai Wang |
| Transaction CRUD with pagination & filtering | ✅ Done | Zhe Wang |
| Dashboard homepage with statistics cards | ✅ Done | Weilai Wang |
| Seed data for demo transactions | ✅ Done | Zhe Wang |
| Dashboard data integration (React Query) | ✅ Done | Weilai Wang |

### Sprint Review (Demo)
- ✅ Live forex rates updating every 5 seconds
- ✅ Rate locking and remittance submission flow
- ✅ Transaction history with status filtering
- ✅ Dashboard showing key metrics

### Retrospective

| What went well | What to improve | Action Items |
|----------------|----------------|--------------|
| Forex engine works reliably with API fallback | Error handling in rate polling | Add circuit breaker pattern |
| Charts look professional with ApexCharts | More end-to-end testing needed | Write E2E tests in Sprint 3 |
| Good frontend-backend integration | IBAN validation could be stricter | Enhance regex patterns |

---

## Sprint 3: Polish & Launch (Week 13–14)

### Sprint Goal
Implement AML compliance, Terraform deployment, documentation, and final submission.

### Sprint Backlog

| Task | Status | Assignee |
|------|--------|----------|
| AML compliance engine (4 rules, risk scoring 0-100) | ✅ Done | Zhe Wang |
| Compliance audit dashboard (Auditor-only) | ✅ Done | Weilai Wang |
| Review/approve/reject workflow for flagged transactions | ✅ Done | Zhe Wang |
| Azure deployment via Terraform IaC | ✅ Done | Zhe Wang |
| Day 1-10 Verification Reports | ✅ Done | Both |
| Inline comments on all modules | ✅ Done | Both |
| Māori principles documentation | ✅ Done | Weilai Wang |
| UML diagrams (Class, Use Case, Sequence, Activity) | ✅ Done | Both |
| Waterfall diagram & Agile Sprint plan | ✅ Done | Both |
| Feasibility study report | ✅ Done | Zhe Wang |
| Backend unit tests | ✅ Done | Zhe Wang |
| `requirements.txt` generated | ✅ Done | Zhe Wang |

### Sprint Review (Demo)
- ✅ AML compliance rules triggering correctly
- ✅ Auditor can review and approve/reject flagged transactions
- ✅ Azure Container Apps running successfully
- ✅ All documentation complete

### Retrospective

| What went well | What to improve | Action Items |
|----------------|----------------|--------------|
| Well-structured codebase with clear separation | More tests needed earlier | Start testing from Sprint 1 in future |
| Comprehensive documentation | Better commit message discipline | Use conventional commits |
| Cloud deployment working end-to-end | Could have started cloud planning earlier | Begin infra setup in Sprint 2 |

---

## Overall Project Reflection

**Key Learnings:**
1. **API-first design** with OpenAPI spec generation reduces integration issues
2. **Background task management** requires careful thread-safety consideration (used mutex for rate locks)
3. **Security-first mindset** (timing-safe authentication, Argon2 hashing, JWT validation) is essential for fintech apps
4. **Māori Data Sovereignty** principles can be practically implemented through role-based access, encryption, and audit trails

**What we would do differently:**
- Start testing earlier (not just at the end)
- Use feature branches more consistently
- Set up staging environment before production deployment
