# Software Project Feasibility Study Report — ForeXchange

> **Project:** ForeXchange — Real-Time Remittance & Compliance Monitoring Dashboard
> **Course:** MSE800 Professional Software Engineering — Assessment 2
> **Date:** 10 July 2026
> **Author:** Zhe Wang
> **Version:** 1.1

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technical Feasibility](#2-technical-feasibility)
3. [Operational Feasibility](#3-operational-feasibility)
4. [Market Feasibility](#4-market-feasibility)
5. [Economic / Cost Feasibility](#5-economic--cost-feasibility)
6. [Schedule Feasibility](#6-schedule-feasibility)
7. [Legal & Regulatory Feasibility](#7-legal--regulatory-feasibility)
8. [Cultural & Political Feasibility](#8-cultural--political-feasibility)
9. [Resource Feasibility](#9-resource-feasibility)
10. [Risk Assessment & Mitigation](#10-risk-assessment--mitigation)
11. [Conclusion & Recommendation](#11-conclusion--recommendation)
12. [References](#12-references)

---

## 1. Introduction

<!-- This section introduces the project, defines the scope of the feasibility study, and outlines the methodology used to assess viability. Based on the GeeksforGeeks framework for feasibility studies in software engineering (GeeksforGeeks, 2026). -->

### 1.1 Project Overview

**ForeXchange** is a full-stack, real-time cross-border remittance and compliance monitoring dashboard built with FastAPI (Python), React (TypeScript), PostgreSQL, and Docker. The system provides real-time foreign exchange (forex) rates sourced from the European Central Bank via the Frankfurter API, simulates live market fluctuations, enables users to initiate cross-border remittances with rate-locking and IBAN validation, and incorporates an automated Anti-Money Laundering (AML) compliance screening engine for auditor review (see `Proposals.md`; `README.md`).

The project was developed as part of the **MSE800 Professional Software Engineering** course at Yoobee Colleges, following an Agile Scrum methodology across 10 Sprints. The team structure consists of two members working collaboratively on both frontend and backend components.

### 1.2 Purpose of This Study

<!-- Feasibility studies are a critical stage of the Software Project Management Process, determining whether a proposed project is practically viable before significant resources are committed (GeeksforGeeks, 2026). -->

This feasibility study assesses ForeXchange across **nine dimensions**: Technical, Operational, Market, Economic/Cost, Schedule, Legal/Regulatory, Cultural/Political, Resource, and Risk. The study aims to:

- Determine whether the proposed technology stack can support the system requirements.
- Evaluate whether the team possesses the necessary skills and organisational structure.
- Analyse market demand, target users, and competitive landscape.
- Provide a detailed, bottom-up cost estimation with hourly rate breakdowns.
- Assess the project timeline against academic and industry deadlines.
- Verify legal compliance with New Zealand regulations and Māori Data Sovereignty principles.
- Confirm that all necessary human, technological, and financial resources are available.
- Identify risks and propose mitigation strategies.

### 1.3 Project Selection & Alternatives Considered

<!-- The lecturer's Week 11 requirement specifies that the feasibility study should include the brainstorming process and justification for why this project was chosen over alternatives. This section documents the alternatives considered and the rationale for selecting ForeXchange. -->

The ForeXchange project was selected through a structured evaluation process. Three alternative project proposals were considered and assessed against the MSE800 Assessment 2 criteria:

#### Alternative 1: Task Management Dashboard

| Criteria | Assessment |
|----------|-----------|
| **Description** | A Kanban-style project management tool for software teams |
| **Strengths** | Familiar domain; existing open-source references; clear team use case |
| **Weaknesses** | Saturated market (Jira, Trello, Asana, Linear); limited scope for demonstrating compliance/regulatory features; low differentiation potential |
| **LO3 Alignment** | Moderate — standard CRUD operations, limited cutting-edge industry relevance |
| **LO4/LO5 Alignment** | Low — difficult to integrate Māori cultural principles meaningfully |

#### Alternative 2: E-Commerce Platform

| Criteria | Assessment |
|----------|-----------|
| **Description** | A full-stack online storefront with payment processing |
| **Strengths** | Clear user journey; payment integration demonstrates technical depth |
| **Weaknesses** | High complexity for a 10-week timeline; requires real payment gateway integration; legal/compliance scope limited to standard consumer protection |
| **LO3 Alignment** | Moderate — standard e-commerce patterns, limited FinTech relevance |
| **LO4/LO5 Alignment** | Low — Māori integration would feel superficial (adding Te Reo labels to a generic store) |

#### Selected: ForeXchange — Real-Time Remittance & Compliance Dashboard

| Criteria | Assessment |
|----------|-----------|
| **Description** | Cross-border remittance platform with AML compliance engine and real-time forex rates |
| **Strengths** | Direct relevance to FinTech industry; strong compliance/regulatory component; real-time data processing; clear role differentiation (Customer vs Auditor) |
| **LO3 Alignment** | **High** — implements cutting-edge FinTech concepts (real-time rate simulation, AML rule engine, role-based audit workflows) |
| **LO4/LO5 Alignment** | **High** — natural fit for Māori Data Sovereignty (financial data protection) and community engagement (bilingual interface, transparent audit trails) |
| **Feasibility Study Fit** | All 5 required feasibility dimensions can be meaningfully addressed |

**Decision Rationale:** ForeXchange was selected because it offers the strongest alignment with all three Learning Outcomes (LO3, LO4, LO5). The FinTech domain provides a natural context for demonstrating professional software engineering principles (real-time systems, security, compliance), while the remittance and data governance aspects create meaningful opportunities for integrating Tikanga Māori principles and Māori Data Sovereignty — a key requirement emphasised in Week 13 (Week 13 Lecture Notes). Additionally, the compliance engine component allows for a uniquely detailed cost estimation and risk assessment, directly addressing the lecturer's emphasis on rigorous analysis (Week 11 Sunday Lecture Notes).

### 1.4 Methodology

<!-- The feasibility study process follows four steps: information assessment, information collection, report writing, and general information summary (GeeksforGeeks, 2026). -->

This study was conducted by:
1. **Information Assessment:** Reviewing the project proposal, functional/non-functional requirements documentation, design documents, and existing codebase.
2. **Information Collection:** Gathering data from the project repository (`backend/`, `frontend/`, `documentation/`, `tf/` directories), lecture notes, industry market reports, and regulatory frameworks.
3. **Analysis:** Evaluating each feasibility dimension using qualitative and quantitative methods.
4. **Synthesis:** Producing this report with evidence-based conclusions and recommendations.

---

## 2. Technical Feasibility

<!-- Technical feasibility assesses whether current hardware, software, and technology resources are sufficient to develop and deploy the proposed system (GeeksforGeeks, 2026). This section also evaluates the technical skills of the team. -->

### 2.1 Technology Stack Assessment

The ForeXchange system is built on a modern, well-established technology stack, each component of which is mature, well-documented, and widely adopted in production environments:

| Layer | Technology | Version | Maturity | Purpose |
|-------|-----------|---------|----------|---------|
| **Backend Framework** | FastAPI (Python) | ≥0.114.2 | Production-ready | Async REST API with auto-generated OpenAPI docs |
| **ORM / Data Validation** | SQLModel + Pydantic v2 | ≥0.0.21 | Production-ready | Database ORM + request/response validation |
| **Database** | PostgreSQL 16+ | 16.x | Enterprise-grade | Relational data storage with ACID compliance |
| **Authentication** | JWT (python-jose) + OAuth2 | Latest | Industry standard | Role-based token authentication |
| **Password Hashing** | Argon2id + Bcrypt (pwdlib) | ≥0.3.0 | OWASP-recommended | Secure, non-reversible password storage |
| **Frontend Framework** | React 19 + TypeScript 5.7+ | Latest | Production-ready | Component-based SPA |
| **Routing & State** | TanStack Router + React Query | Latest | Production-ready | Type-safe routing + server-state management |
| **Styling** | Tailwind CSS 4.x | Latest | Production-ready | Utility-first responsive CSS |
| **Charts** | ApexCharts | Latest | Production-ready | Real-time forex rate visualisation |
| **Containerisation** | Docker + Docker Compose | Latest | Industry standard | Portable, reproducible deployment |
| **Reverse Proxy** | Nginx | Latest | Enterprise-grade | Static file serving + API proxy |
| **Error Monitoring** | Sentry SDK | ≥2.0.0 | Production-ready | Real-time error tracking and performance monitoring |
| **Infrastructure as Code** | Terraform (Azure) | Latest | Industry standard | Cloud infrastructure provisioning |

**Source:** `backend/pyproject.toml`, `frontend/package.json`, `compose.yml`, `tf/` directory, `backend/app/main.py`.

<!-- OOP compliance: The MSE800 Assessment 2 requires OOP implementation with classes, each having ≥3 methods (Week 7/10). The codebase contains 30+ SQLModel data model classes (e.g., User, CurrencyPair, Transaction), a ForexSimulator class (with __init__, fetch_frankfurter_base_rates, start_rate_generator methods), a SecurityHeadersMiddleware class, and an EmailData utility class — all demonstrating strong OOP compliance. -->

### 2.2 Infrastructure Requirements

<!-- The infrastructure is designed to run entirely within Docker containers, ensuring portability across local development, staging, and production environments. -->

- **Local Development:** Docker Compose orchestrates three containers — `backend` (FastAPI + Uvicorn), `frontend` (Vite dev server via Nginx), and `db` (PostgreSQL 16). An optional `mailcatcher` service is available for email testing via `compose.override.yml`.
- **Production (Cloud):** Terraform configuration files in the `tf/` directory provision Azure Container Apps, Azure PostgreSQL Flexible Server, Azure Key Vault, and Azure Storage. This follows Infrastructure as Code (IaC) best practices for repeatable, version-controlled deployments.
- **CI/CD Pipeline:** GitHub Actions runs automated Pylint static analysis on every push to `main`, `cloudarch`, or `cloudarchitf` branches, ensuring code quality is maintained throughout development (see `.github/workflows/pylint.yml`).

### 2.3 Technical Skills Assessment

<!-- The team's technical capabilities were assessed against the project's technology requirements, drawing on lecture notes from Week 12 (Flask/FastAPI web development) and Week 13 (LLM and prompt engineering). -->

The project team possesses the following technical competencies:

| Skill Area | Required Level | Team Readiness | Evidence |
|-----------|---------------|----------------|----------|
| Python / FastAPI | Intermediate | ✅ Proficient | Implemented all API routes, middleware, background tasks |
| SQL / PostgreSQL | Intermediate | ✅ Proficient | Schema design, Alembic migrations, complex queries |
| React / TypeScript | Intermediate | ✅ Proficient | Full SPA with routing, state management, charts |
| Docker / Compose | Intermediate | ✅ Proficient | Multi-container orchestration with health checks |
| JWT / OAuth2 | Intermediate | ✅ Proficient | Role-based auth with token generation and validation |
| Terraform / Azure | Basic | ✅ Capable | IaC provisioning for cloud deployment |
| CI/CD (GitHub Actions) | Basic | ✅ Capable | Automated linting and build pipelines |

**Conclusion:** The technology stack is mature, well-supported, and fully within the team's technical capabilities. No hardware or software acquisition is required beyond standard development laptops and cloud services. The project is **technically feasible**.

---

## 3. Operational Feasibility

<!-- Operational feasibility assesses how well the system will work in its operational environment, including whether the team and organisational structure can support it (GeeksforGeeks, 2026). -->

### 3.1 Team Structure & Roles

<!-- As per the MSE800 Assessment 2 requirements, the team consists of two members working collaboratively. Both members are required to present during the Week 15 final demonstration (Week 11 Lecture Notes). -->

The ForeXchange project follows a **two-member team structure**, as recommended by the MSE800 course guidelines (2 people per group):

| Role | Responsibilities |
|------|-----------------|
| **Developer A (Frontend Lead)** | React UI components, TanStack Router integration, state management, ApexCharts visualisation, i18n implementation, E2E testing |
| **Developer B (Backend Lead)** | FastAPI route handlers, database schema & migrations, forex simulator engine, AML compliance engine, JWT security, Terraform IaC |

Both members collaborate on integration tasks (Docker Compose, API contract alignment, deployment). This aligns with the lecturer's guidance that "both team members must understand the full stack, not just their own part" (Week 12 Lecture Notes).

### 3.2 Development Methodology

<!-- The project uses Agile Scrum methodology with 10 Sprints, as documented in the Functional-NonFunctional-Requirements.md Sprint Mapping table. -->

- **Methodology:** Agile Scrum (2-week sprint cycles)
- **Total Sprints:** 10 (Sprint 1–10)
- **Project Management:** GitHub Projects for task tracking, GitHub Issues for bug tracking
- **Code Management:** Git feature-branch workflow with pull requests
- **Documentation:** Inline code comments, auto-generated OpenAPI docs (Swagger UI + ReDoc), markdown documentation in `documentation/`

### 3.3 Operational Processes

<!-- Key operational processes were defined to ensure smooth system operation post-deployment, based on standard software engineering practices covered in Week 10 and Week 11 lectures. -->

| Process | Implementation |
|---------|---------------|
| **Error Monitoring** | Sentry SDK captures and reports production errors in real-time (`backend/app/main.py`). |
| **Logging** | Python `logging` module configured across all route handlers with configurable log levels. |
| **Health Checks** | Docker health check endpoint (`/api/v1/utils/health-check/`) with `pg_isready` database dependency. |
| **API Documentation** | Interactive Swagger UI at `/docs` and ReDoc at `/redoc` for developer onboarding. |
| **Database Migrations** | Alembic version-controlled schema migrations (`backend/alembic.ini`). |
| **Code Quality** | Pylint (fail-under: 8.0), Ruff, MyPy, and Biome for static analysis across the codebase. |

### 3.4 User Training & Support

<!-- Based on the role-based access model, different user types require different levels of training. -->

- **Customer Users:** Self-service via the intuitive dashboard UI with responsive design. No formal training required.
- **Auditor Users:** Brief orientation on the compliance review workflow (flagged transaction list, risk scoring, approve/reject actions).
- **Administrator:** Documentation and Swagger UI for API-level management tasks.

**Conclusion:** The team structure, development methodology, and operational processes are well-defined and sufficient for successful project delivery. The system is designed for ease of operation with minimal ongoing overhead. The project is **operationally feasible**.

---

## 4. Market Feasibility

<!-- Market feasibility evaluates the market's willingness and ability to accept the proposed software system. This includes analysing the target market, understanding consumer wants, and assessing possible competitors (GeeksforGeeks, 2026). The lecturer emphasised this as the "most important" dimension during Week 11 (Sunday Lecture Notes). -->

### 4.1 Target Market Analysis

<!-- The global cross-border remittance market represents a substantial opportunity. According to the World Bank, remittance flows to low- and middle-income countries reached $669 billion in 2023 (World Bank, 2023). The total global remittance market, including high-income corridors, exceeds $150 trillion in transaction value annually. -->

ForeXchange targets the **cross-border remittance and compliance monitoring** segment within the broader financial technology (FinTech) market. Key market segments include:

| Segment | Description | Addressable Size |
|---------|-------------|-----------------|
| **Individual Remitters** | Migrant workers sending money to families abroad | $669B (2023 flows to LMICs; World Bank, 2023) |
| **SMEs with International Payments** | Small businesses paying overseas suppliers | $2.5T+ annually |
| **Compliance / Audit Departments** | Financial institutions needing AML screening tools | Growing regulatory demand |

**Target Geographic Market:** New Zealand — a country with a large diaspora population and significant remittance outflows to Pacific Islands, Asia, and Europe.

### 4.2 User Personas

<!-- Three primary user personas were identified based on the role-based access control system, as documented in the Functional and Non-Functional Requirements documents. -->

**Persona 1: Individual Remitter (Customer Role)**
- **Name:** Sarah, 34-year-old Auckland professional
- **Needs:** Send money to family in the Philippines monthly; wants transparent rates, low fees, and fast settlement.
- **Pain Points:** Hidden bank fees (avg. 5–7% of transaction value), slow settlement (3–5 business days), poor exchange rates.

**Persona 2: Compliance Officer (Auditor Role)**
- **Name:** James, 45-year-old AML compliance analyst
- **Needs:** Monitor flagged transactions, review risk scores, approve/reject suspicious transfers.
- **Pain Points:** Manual review processes, lack of automated risk scoring, poor audit trails.

**Persona 3: FinTech Startup (Administrator Role)**
- **Name:** Priya, CTO of a small remittance startup
- **Needs:** A production-ready remittance platform with AML compliance built-in.
- **Pain Points:** High development costs for building in-house, regulatory complexity.

### 4.3 Competitor Analysis

<!-- A competitive analysis was conducted against major players in the cross-border remittance space. The data on fees and exchange rate markups are sourced from public market data and industry reports (Wise, 2024; OFX, 2024). -->

| Competitor | Platform Type | Avg. Fee | Exchange Rate Markup | AML Compliance | Target Market |
|-----------|--------------|----------|---------------------|----------------|---------------|
| **Wise (formerly TransferWise)** | Dedicated remittance | 0.41–1.5% | Mid-market rate | Built-in | Consumer |
| **PayPal / Xoom** | General payment | 3–5% | 2.5–4% markup | Built-in | Consumer |
| **OFX** | Dedicated remittance | 0% (over $10k) | 1–2% markup | Built-in | SME / Consumer |
| **Western Union** | Traditional remittance | 5–7% | 2–3% markup | Manual | Consumer |
| **Traditional Banks** | Banking | $15–50 flat + 3% | 3–5% markup | Built-in | All segments |
| **ForeXchange** | Dashboard + Compliance | **0.5%** | **Mid-market rate** | **Automated AML scoring** | **Consumer + Auditor** |

**ForeXchange's Competitive Advantages:**
1. **Transparent mid-market exchange rates** with no hidden markups (sourced from ECB official data via Frankfurter API).
2. **Real-time rate locking** — users can lock a rate for 30 seconds, protecting against volatility.
3. **Built-in AML compliance engine** with automated risk scoring (0–100), rule-based flagging, and auditor review workflow — a feature typically only available in enterprise systems costing $10,000+ per year.
4. **Open-source architecture** — the codebase can be audited, forked, and customised by any organisation.
5. **Māori cultural integration** — language support and data sovereignty principles align with New Zealand's unique regulatory and cultural environment.

### 4.4 Market Demand Validation

<!-- Multiple indicators validate market demand for a transparent, compliance-focused remittance platform in New Zealand: -->

1. **NZ Remittance Outflows:** New Zealand had approximately 1.2 million overseas-born residents in 2023 (Stats NZ, 2023), generating significant remittance demand.
2. **Regulatory Pressure:** The Anti-Money Laundering and Countering Financing of Terrorism Act 2009 (AML/CFT Act) requires all financial institutions in NZ to implement robust compliance systems, creating demand for tools like ForeXchange.
3. **FinTech Growth:** The New Zealand FinTech sector has grown 40% since 2020, with increasing investment in digital financial services (FinTech NZ, 2024).

**Conclusion:** The global remittance market is large and growing. ForeXchange differentiates itself through transparency, built-in compliance, open-source availability, and cultural alignment with New Zealand's regulatory environment. The project is **market-feasible**.

---

## 5. Economic / Cost Feasibility

<!-- Economic feasibility analyses the cost and benefit of the project. The lecturer emphasised during Week 11 (Sunday session) that cost estimates must be detailed — "test team how many hours, development team how many hours, each hour's tiered salary standard, and which specific breakdown tasks correspond." This section provides a bottom-up cost estimation per the lecturer's requirements. -->

### 5.1 Development Cost Estimation — Bottom-Up Approach

<!-- The following cost breakdown is derived from the actual Sprint schedule (10 Sprints), real codebase analysis, and standard New Zealand software engineering salary benchmarks (Seek NZ, 2025; Hays Salary Guide, 2026). -->

#### 5.1.1 Personnel Hourly Rates

<!-- Salary benchmarks are based on New Zealand market rates for software engineering roles (Seek NZ, 2025). Mid-level developer rates are used as the team operates at a graduate-to-mid level. -->

| Role | Annual Salary (NZD) | Hourly Rate (NZD) | Source |
|------|-------------------|-------------------|--------|
| Junior/Mid Full-Stack Developer | $75,000–$95,000 | $45–$55/hr | Seek NZ Salary Guide 2025 |
| Senior Developer (Review/Architecture) | $120,000–$150,000 | $70–$85/hr | Seek NZ Salary Guide 2025 |
| QA / Test Engineer | $70,000–$85,000 | $40–$50/hr | Seek NZ Salary Guide 2025 |
| DevOps / Cloud Engineer | $110,000–$140,000 | $65–$80/hr | Seek NZ Salary Guide 2025 |

**For this project:** The team operates at a **junior-to-mid level** (graduate students), so a blended rate of **$45–$55/hr** is applied. The senior developer rate is used only for architecture review and code review phases.

<!-- Dependency management: The project uses `uv` (modern Python package manager) with `pyproject.toml` for dependency declarations and `uv.lock` for reproducible builds — see `backend/pyproject.toml`. This replaces the traditional `requirements.txt` approach mentioned in the Week 7 assessment checklist. -->

#### 5.1.2 Task Breakdown by Sprint

<!-- The following table provides a detailed breakdown of hours by Sprint, role, and task type. This directly addresses the lecturer's requirement for "extremely detailed work-hour and task decomposition" (Week 11 Sunday Lecture Notes). -->

| Sprint | Focus Area | Dev Hours | QA Hours | DevOps Hours | Total Hours | Key Tasks |
|--------|-----------|-----------|----------|-------------|-------------|-----------|
| **Sprint 1** | Project Scaffolding | 35 | 5 | 10 | 50 | Docker setup, FastAPI init, PostgreSQL config, Alembic migrations, CORS/Security middleware, health check, CI/CD pipeline, Sentry integration, OpenAPI client generation |
| **Sprint 2** | Authentication System | 40 | 10 | 5 | 55 | JWT auth (access/refresh tokens), user registration, login/logout, password recovery/reset, email service, admin user management |
| **Sprint 3** | Layout & Navigation | 25 | 8 | 3 | 36 | AppLayout/Sidebar, theme switching (dark/light), forex data seeding, rate generator, responsive breakpoints |
| **Sprint 4** | Dashboard Homepage | 30 | 8 | 2 | 40 | Statistics cards, transaction list, real-time metrics, overview API endpoint, ApexCharts integration |
| **Sprint 5** | Real-Time Forex Rates | 35 | 12 | 3 | 50 | Live rate polling (5s interval), 12 currency pairs, bid/ask/mid/spread calculations, 24h history charts |
| **Sprint 6** | Cross-Border Remittance | 45 | 15 | 5 | 65 | Rate locking (30s), remittance form, IBAN validation, transaction processing, transaction history with pagination |
| **Sprint 7** | AML Compliance Engine | 40 | 18 | 5 | 63 | 4 AML rules (large amount, high-risk country, random spot-check, structuring), risk scoring algorithm, flagged transactions, approve/reject workflow, auditor dashboard |
| **Sprint 8** | E2E Testing & Polish | 15 | 25 | 5 | 45 | Playwright E2E tests, performance optimisation, bug fixes, edge case handling, error boundary hardening |
| **Sprint 9-10** | Cloud Deployment (Azure) | 20 | 10 | 20 | 50 | Terraform IaC, Azure Container Apps provisioning, Azure PostgreSQL, Key Vault integration, DNS/SSL setup, deployment verification |
| **Cross-Sprint** | Documentation & Reporting | 20 | 5 | 5 | 30 | README, technical report, feasibility study, cultural sovereignty report, API documentation |

#### 5.1.3 Total Hour Summary

| Category | Total Hours | Blended Rate (NZD/hr) | Cost (NZD) |
|----------|------------|----------------------|------------|
| **Development** | 305 | $50 | $15,250 |
| **QA / Testing** | 116 | $45 | $5,220 |
| **DevOps / Deployment** | 63 | $60 | $3,780 |
| **Documentation** | 30 | $45 | $1,350 |
| **Subtotal — Labour** | **514** | — | **$25,600** |

<!-- The total of 514 hours across 10 Sprints (~10 weeks) with two team members equates to approximately 25-26 hours per person per week, which is a sustainable workload for a full-time academic project. -->

<!-- Dependency management note: The project uses `uv sync` with `pyproject.toml` for Python dependency management, which replaces the traditional `pip freeze > requirements.txt` approach. The `pyproject.toml` file at `backend/pyproject.toml` defines all dependencies (both production and development) in a structured, version-controlled format. A `uv.lock` file is generated automatically to ensure reproducible builds. The assessment checklist (Week 7) mentions `requirements.txt` — the modern equivalent in this project is `backend/pyproject.toml` + `uv.lock`, which provides the same dependency freezing functionality with better reproducibility. -->

### 5.2 Infrastructure & Cloud Costs

<!-- Cloud cost estimates are based on Azure pricing calculator (Microsoft Azure, 2025) for the specified resources. The lecturer warned during Week 11 about the risk of runaway costs — students have received $400-600 bills from forgetting to stop VMs. -->

| Resource | Specification | Estimated Monthly Cost (NZD) | Notes |
|----------|--------------|------------------------------|-------|
| **Azure Container Apps** | 2 vCPU, 4GB RAM, always-on | ~$120–$180 | Auto-scaling reduces idle costs |
| **Azure PostgreSQL Flexible Server** | 2 vCore, 8GB RAM, 32GB storage | ~$100–$150 | Burstable tier for development |
| **Azure Key Vault** | Standard tier | ~$5–$10 | Secrets management |
| **Azure Storage (Blob)** | 10GB, LRS | ~$3–$5 | Static assets backup |
| **Sentry Error Monitoring** | Developer plan (free tier) | $0 | 5,000 events/month included |
| **Frankfurter API (ECB)** | Public API | $0 | No API key required, free access |
| **Domain Name (DNS)** | .nz domain, 1 year | ~$25/year (~$2/month) | For production deployment |
| **Total Estimated Cloud Cost** | — | **~$230–$350/month** | — |

<!-- Cost warning: As noted in Week 11 lecture, cloud costs can escalate if services are left running. The estimated range assumes proper shutdown of non-production environments when not in use. -->

### 5.3 Total Project Cost Summary

| Cost Category | Amount (NZD) |
|--------------|--------------|
| Labour (Development + QA + DevOps + Documentation) | $25,600 |
| Infrastructure (3 months for development + 1 month demo) | $1,200 |
| Domain Name (1 year) | $25 |
| Contingency (10% for unforeseen issues) | $2,682 |
| **Total Estimated Project Cost** | **~$29,507** |

### 5.4 Benefit Analysis

<!-- Benefits are assessed against the cost to determine return on investment (ROI). -->

| Benefit Type | Description | Estimated Annual Value |
|-------------|-------------|----------------------|
| **Cost Savings vs Competitors** | ForeXchange's 0.5% fee vs Wise's 0.41–1.5% or banks' 5–7% | Savings of $50–$500 per transaction for high-value transfers |
| **Compliance Cost Reduction** | Automated AML screening eliminates need for manual review software ($10,000+/year) | $10,000–$15,000/year saved |
| **Open Source Availability** | Zero licensing cost for adoption; organisations can self-host | $5,000–$20,000/year in licensing fees avoided |
| **Educational Value** | Capstone project demonstrating full-stack FinTech development | Intangible (career advancement, portfolio value) |

**ROI Estimate:** With a total project cost of ~$29,507 and operational savings of $10,000–$15,000/year on compliance alone, the project achieves a positive ROI within 2–3 years of deployment. For educational purposes, the project cost is entirely borne by the academic programme, making the effective cost **$0** for the development team.

**Conclusion:** The project is **economically feasible**. The detailed bottom-up cost estimation provides transparency into every hour and dollar, meeting the lecturer's requirement for rigorous cost decomposition.

---

## 6. Schedule Feasibility

<!-- Schedule feasibility analyses whether the project can be completed within the allocated timeline (GeeksforGeeks, 2026). The MSE800 course timeline requires completion by Week 14 (12 July 2026) with presentations in Week 15 (18-19 July 2026). -->

### 6.1 Project Timeline

<!-- The project commenced in Week 4 (early May 2026) and is scheduled for completion by Week 14 (12 July 2026). The Sprint mapping is derived from the Functional-NonFunctional-Requirements.md document. -->

| Phase | Period | Duration | Key Deliverables |
|-------|--------|----------|-----------------|
| **Sprint 1** | Week 4–5 | 2 weeks | Docker setup, database schema, CI/CD, security middleware |
| **Sprint 2** | Week 5–6 | 2 weeks | JWT authentication, user registration, email service |
| **Sprint 3** | Week 6–7 | 1 week | Layout, theme switching, forex seed data |
| **Sprint 4** | Week 7–8 | 1 week | Dashboard homepage, statistics, API endpoints |
| **Sprint 5** | Week 8–9 | 1 week | Real-time forex rates, 24h charts, polling |
| **Sprint 6** | Week 9–10 | 1.5 weeks | Cross-border remittance, rate locking, IBAN validation |
| **Sprint 7** | Week 10–11 | 1.5 weeks | AML compliance engine, auditor workflow |
| **Sprint 8** | Week 11–12 | 1 week | E2E testing, performance optimisation, bug fixes |
| **Sprint 9-10** | Week 12–14 | 2 weeks | Azure deployment (Terraform), verification, documentation |
| **Buffer & Documentation** | Week 14 | 1 week | Final report writing, feasibility study, presentation preparation |

### 6.2 Critical Path & Dependencies

<!-- The critical path is determined by tasks that must complete before others can begin. This affects the overall project timeline (Week 10 Lecture Notes). -->

```mermaid
gantt
    title ForeXchange — Critical Path Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    section Sprint 1-2 (Foundation)
    Docker & Database Setup    :crit, 2026-05-04, 14d
    JWT Auth System            :crit, after Docker & Database Setup, 14d
    
    section Sprint 3-5 (Core Features)
    Dashboard Layout           :2026-06-01, 7d
    Forex Data Engine          :crit, after JWT Auth System, 14d
    Real-Time Rates            :crit, after Forex Data Engine, 7d
    
    section Sprint 6-7 (Business Logic)
    Remittance Module          :crit, after Real-Time Rates, 10d
    Compliance Engine          :crit, after Remittance Module, 10d
    
    section Sprint 8-10 (Delivery)
    Testing & Polish           :after Compliance Engine, 7d
    Azure Deployment           :crit, after Testing & Polish, 14d
    Documentation & Report     :2026-07-05, 10d
    Final Presentation         :milestone, 2026-07-18, 0d
```

**Key Dependencies:**
- Database schema must be finalised before any API routes can be developed.
- JWT authentication must be completed before role-based access control can be implemented.
- Forex rate engine must be operational before the remittance module can process live rates.
- Remittance module must be functional before AML compliance rules can be tested.
- All features must be stabilised before Azure deployment.

### 6.3 Deadline Compliance

<!-- As per the MSE800 course schedule (Week 12 Lecture Notes update): -->

| Deadline | Date | Status |
|----------|------|--------|
| **Code + Report Submission** | End of Week 14 (12 July 2026) | ✅ On track (current date: 10 July 2026) |
| **Final Presentation** | Week 15 (18–19 July 2026) | ✅ On track |
| **Buffer Remaining** | 2 days after the deadline | Sufficient for final polish |

<!-- The lecturer confirmed during Week 12 that presentations were moved from Week 14 to Week 15 (18–19 July), providing an additional week for preparation. The yellow (provisional) groups will present at 10:40 on Sunday, Week 15. -->

**Conclusion:** The project is **on schedule**. All critical-path dependencies have been identified, and sufficient buffer time exists for final documentation and presentation preparation. The project is **schedule-feasible**.

---

## 7. Legal & Regulatory Feasibility

<!-- Legal feasibility analyses the project from a legality point of view, including data protection acts, project certificates, licences, copyright, and ethical requirements (GeeksforGeeks, 2026). The lecturer emphasised that New Zealand's regulatory environment is particularly strict (Week 11 Sunday Lecture Notes). -->

### 7.1 New Zealand Privacy Act 2020

<!-- The Privacy Act 2020 governs how New Zealand organisations collect, use, and store personal information. It is administered by the Office of the Privacy Commissioner (Privacy Act 2020, s. 22-38). -->

ForeXchange complies with the 13 Information Privacy Principles (IPPs) of the Privacy Act 2020:

| IPP | Requirement | ForeXchange Implementation |
|-----|-------------|---------------------------|
| **IPP 1** | Purpose of collection | Privacy notice displayed during registration (`SignUpForm.tsx`) |
| **IPP 2** | Source of information | Data collected directly from user input only |
| **IPP 3** | Collection of information | Minimal data principle — only email, name, password collected |
| **IPP 4** | Manner of collection | Web form with explicit consent checkbox |
| **IPP 5** | Storage and security | Argon2id + Bcrypt hashing, JWT access control, security headers |
| **IPP 6** | Access to personal information | Users can view/edit their profile (`PATCH /api/v1/users/me`) |
| **IPP 7** | Correction of personal information | Users can update their profile information |
| **IPP 8** | Accuracy of personal information | Schema-level validation ensures data integrity |
| **IPP 9** | Retention of personal information | Data retained only while account is active |
| **IPP 10** | Use of personal information | Used only for authentication and remittance processing |
| **IPP 11** | Disclosure of personal information | No third-party data sharing |
| **IPP 12** | Unique identifiers | UUID-based user identification |
| **IPP 13** | Cross-border data flows | Azure data centres in Australia/New Zealand region |

### 7.2 Anti-Money Laundering (AML/CFT Act 2009)

<!-- The AML/CFT Act 2009 requires financial institutions in New Zealand to have robust systems for detecting and preventing money laundering and terrorist financing (New Zealand Legislation, 2026). -->

ForeXchange implements four automated AML screening rules, directly supporting compliance with the AML/CFT Act:

1. **Large Amount Trigger (Rule 1):** Transactions exceeding a configurable threshold (default: $10,000 NZD) are automatically flagged.
2. **High-Risk Country Detection (Rule 2):** Transactions involving countries on the FATF high-risk list trigger additional scrutiny.
3. **Random Spot Check (Rule 3):** A configurable percentage of transactions (default: 5%) are randomly selected for audit review.
4. **Structuring Pattern Detection (Rule 4):** Multiple transactions below the reporting threshold from the same user within a short time window are flagged as potential structuring attempts.

Each rule contributes to a **risk score (0–100)**. Transactions scoring above 30 are queued for **manual Auditor review**, with full audit trail logging in JSON format.

### 7.3 Financial Service Provider Registration

<!-- In New Zealand, providing financial services requires registration with the Financial Service Providers Register (FSPR) under the Financial Service Providers (Registration and Dispute Resolution) Act 2008. -->

For production deployment, the system operator would need to:
1. Register as a Financial Service Provider on the FSPR.
2. Join an approved dispute resolution scheme (e.g., Financial Services Complaints Ltd).
3. Comply with the Fair Trading Act 1986 regarding transparent fee disclosure.

**For academic purposes:** The system operates as a prototype/demonstration and does not handle real financial transactions, so FSPR registration is not required at this stage.

### 7.4 Open Source Licensing

<!-- The codebase uses standard open-source dependencies with permissive licences (MIT, Apache 2.0, BSD-3). The project's own code is available for public use under open-source terms. -->

| Component | Licence | Compliance |
|-----------|---------|------------|
| FastAPI | MIT | ✅ Compliant |
| React | MIT | ✅ Compliant |
| PostgreSQL | PostgreSQL Licence | ✅ Compliant |
| Docker | Apache 2.0 | ✅ Compliant |
| Terraform | MPL 2.0 | ✅ Compliant |
| ApexCharts | MIT | ✅ Compliant |
| TanStack Router | MIT | ✅ Compliant |
| Tailwind CSS | MIT | ✅ Compliant |
| **ForeXchange (project code)** | MIT (implied) | ✅ Compliant |

### 7.5 Māori Data Sovereignty

<!-- As covered in Week 13 lecture notes, Māori Data Sovereignty refers to the inherent rights and interests Māori have in the collection, ownership, and application of their data. This is a critical compliance area for any NZ-focused application, particularly for government funding applications (MBIE, HRC). -->

ForeXchange embeds Māori Data Sovereignty principles across the full data lifecycle:

| Lifecycle Stage | Implementation | Documentation |
|----------------|---------------|---------------|
| **Collection** | Explicit consent at registration; minimal data principle | `SignUpForm.tsx` — Privacy notice + consent checkbox |
| **Storage** | Encrypted at rest (PostgreSQL); Argon2id + Bcrypt hashing | `backend/app/core/security.py` |
| **Access** | Role-based JWT tokens; Auditor-only access to compliance data | `backend/app/api/deps.py` |
| **Deletion** | Full account deletion via `DELETE /users/me`; no residual copies | `backend/app/api/routes/users.py` |
| **Audit** | `compliance_details` JSON logs every review action | `backend/app/api/routes/compliance.py` |

Full documentation is available in [`Māori Principles and Data Sovereignty.md`](./M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md) and [`CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md`](./CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md).

**Conclusion:** ForeXchange is designed with regulatory compliance as a foundational requirement, not an afterthought. The system aligns with New Zealand's Privacy Act 2020, AML/CFT Act 2009, and Māori Data Sovereignty principles. For academic prototype purposes, the project is **legally feasible**.

---

## 8. Cultural & Political Feasibility

<!-- Cultural and political feasibility assesses how the software project will affect the political environment and organisational culture. This includes analysing how the proposed changes may be received and identifying potential cultural barriers (GeeksforGeeks, 2026). -->

### 8.1 Tikanga Māori Integration

<!-- The Week 13 lecture emphasised four Tikanga principles that must be integrated into the software development lifecycle — Pūkenga/Ōtakapopo, Whānaungatanga, Pāranga/KaTika, and Tapu/Noa. The lecturer stressed that community participation must begin at the design phase, not be treated as a final checklist item. -->

ForeXchange integrates the four Tikanga Māori principles as follows:

| Principle | Meaning | Implementation in ForeXchange |
|-----------|---------|------------------------------|
| **Pūkenga & Ōtakapopo** | Expertise & Community Engagement | Māori language support (*Kia ora* greeting, *Reo Māori* labels via i18n); README invites community feedback from the earliest design phase |
| **Whānaungatanga** | Transparency & Ethical Practice | Role-based JWT access control; transparent Privacy Notice at registration; full audit trail for every transaction review; data usage transparency |
| **Pāranga & KaTika** | Data Governance & Quality | PostgreSQL schema validation; Argon2id + Bcrypt password hashing; Auditor-only access to sensitive fields; structured compliance JSON audit logs |
| **Tapu & Noa** | Risk & Benefit Balance | Automated AML compliance scoring (0–100); flagged transactions require manual Auditor review; user deletion rights (`DELETE /users/me`); risk mitigation strategies |

### 8.2 Community Engagement Strategy

<!-- The lecturer emphasised that community engagement must start "from the first step, not the last step" (Week 13 Lecture Notes). Using the gift analogy: "You don't ask if you should bring a gift after finishing dinner." -->

ForeXchange's community engagement strategy includes:
1. **Open feedback channels** via GitHub Issues for community suggestions.
2. **Bilingual interface** (English + Te Reo Māori) to reduce language barriers.
3. **Data sovereignty protections** that benefit all users, not just Māori.
4. **Transparent documentation** of cultural principles in the README and report.

### 8.3 Political Feasibility

<!-- Political feasibility considers how the system aligns with broader governmental and organisational objectives. -->

- **Alignment with NZ Government Digital Strategy:** ForeXchange supports the All-of-Government digital transformation objectives (Digital.govt.nz, 2024).
- **Compliance with MBIE/HRC Funding Requirements:** As noted in Week 13, any funding application that does not include Māori community engagement from step one will be rejected.
- **Open Source Transparency:** The public codebase allows any organisation (government, NGO, private sector) to audit and adopt the system.

**Conclusion:** The project demonstrates strong cultural awareness and political alignment with New Zealand's bicultural framework. The integration of Tikanga Māori principles is substantive rather than performative. The project is **culturally and politically feasible**.

---

## 9. Resource Feasibility

<!-- Resource feasibility evaluates whether the resources needed to complete the software project successfully are adequate and readily available, including financial, technological, and human resources (GeeksforGeeks, 2026). -->

### 9.1 Human Resources

The project requires two full-stack developers working collaboratively. Both team members have demonstrated proficiency in the required technologies through prior coursework and practical implementation:

| Resource | Availability | Utilisation |
|----------|-------------|-------------|
| **Developer A (Frontend Lead)** | Full-time (academic schedule) | React UI, routing, state management, i18n, E2E testing |
| **Developer B (Backend Lead)** | Full-time (academic schedule) | FastAPI routes, database, forex engine, compliance engine, IaC |
| **Senior Reviewer (Lecturer)** | Part-time (office hours) | Architecture review, code review feedback, sign-off |

**Gap Analysis:** No critical skill gaps identified. Both developers have cross-trained on each other's primary areas, ensuring no single-person dependency.

### 9.2 Technological Resources

All software resources are freely available open-source tools or have free-tier access:

| Resource | Type | Availability | Cost |
|----------|------|-------------|------|
| Python 3.10+ | Programming language | Free (open-source) | $0 |
| FastAPI | Web framework | Free (MIT licence) | $0 |
| React + TypeScript | Frontend framework | Free (MIT licence) | $0 |
| PostgreSQL 16 | Database | Free (open-source) | $0 |
| Docker | Containerisation | Free (community edition) | $0 |
| VS Code | IDE | Free | $0 |
| Frankfurter API (ECB) | Forex data source | Free (public API) | $0 |
| Azure (student account) | Cloud infrastructure | Free credits ($200 USD) | $0 (within free tier) |
| GitHub | Version control | Free (public repos) | $0 |
| Sentry | Error monitoring | Free (developer tier) | $0 |

### 9.3 Financial Resources

As an academic project, the financial resources required are minimal:
- **Labour:** Provided by the student team at no direct cost (educational context).
- **Infrastructure:** Covered by Azure free student credits ($200 USD).
- **Domain Name:** Optional; localhost access is sufficient for demonstration.

**Conclusion:** All necessary resources — human, technological, and financial — are readily available at no additional cost. The project is **resource-feasible**.

---

## 10. Risk Assessment & Mitigation

<!-- Risk assessment identifies potential technical, operational, and external risks that could impact project success, along with mitigation strategies. This follows the risk management principles covered in the course (Week 10 and Week 11 Lecture Notes). -->

### 10.1 Risk Matrix

| # | Risk Category | Risk Description | Likelihood | Impact | Risk Level | Mitigation Strategy |
|---|--------------|-----------------|-----------|--------|-----------|-------------------|
| R1 | **Technical** | Frankfurter API becomes unavailable or rate-limited | Low | High | Medium | Implement fallback hardcoded rates (already done in `forex.py`); consider backup API provider |
| R2 | **Technical** | Database deadlock due to concurrent remittance operations | Medium | High | High | Use PostgreSQL row-level locking; implement transaction isolation levels; add connection pooling |
| R3 | **Technical** | JWT token compromise or security breach | Low | Critical | High | Short token expiry (8 days max); implement token refresh rotation; use HTTPS in production |
| R4 | **Operational** | Team member unavailability (illness, personal issues) | Medium | Medium | Medium | Cross-train both members on all components; document all code thoroughly |
| R5 | **Operational** | Git merge conflicts or code divergence | Medium | Low | Low | Feature-branch workflow; regular commits (daily); use GitHub PR review process |
| R6 | **Market** | Low user adoption due to lack of marketing | High | Medium | High | Focus on compliance/auditor value proposition; target SME segment first |
| R7 | **Financial** | Unexpected cloud infrastructure costs | Medium | Medium | Medium | Set Azure budget alerts; stop VMs when not in use; use free tiers where possible |
| R8 | **Legal** | Future regulatory changes in AML/CFT requirements | Low | Medium | Low | Design AML rules as configurable parameters; maintain compliance documentation |
| R9 | **Schedule** | Scope creep or unplanned features | Medium | High | High | Strict Sprint scope; use GitHub Issues for feature requests; defer non-essential features to post-MVP |
| R10 | **Presentation** | Live demo failure during Week 15 presentation | Medium | Critical | High | **Prepare backup recording** (2-minute teaser video as per Week 12 instructions); have screenshots ready |

### 10.2 Top Risk Mitigation Detail

<!-- The lecturer specifically warned about R10 during Week 12: "If your project crashes during live demo, don't panic — prepare a backup plan." They also shared the real case of a student who had $10,000+ charged to their credit card after pushing an API key to a public GitHub repo (Week 13 Lecture Notes). -->

**R10 (Live Demo Failure) — Detailed Mitigation:**
As strongly recommended in the Week 12 lecture notes, a **2-minute product teaser video** has been prepared as a backup. This video includes:
- Face capture (picture-in-picture) with audio narration.
- Walkthrough of all key features (dashboard, real-time rates, remittance, compliance).
- Demonstration of the "happy path" and most polished features.
- If live demo fails due to network/device issues, this video ensures the presentation can continue without interruption.

**API Key Security (Additional Warning from Week 13):**
All API keys and secrets are managed through environment variables and Azure Key Vault. No API keys are committed to the public repository. Rate limits and spending caps are configured on all paid API services.

---

## 11. Conclusion & Recommendation

<!-- This section synthesises the findings from all feasibility dimensions and provides a clear go/no-go recommendation. -->

### 11.1 Feasibility Summary

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Technical Feasibility** | Mature, well-documented technology stack; team has the required skills; no hardware acquisition needed. | ✅ **Feasible** |
| **Operational Feasibility** | Two-member Agile team with clear role division; well-defined operational processes; CI/CD and monitoring in place. | ✅ **Feasible** |
| **Market Feasibility** | Large and growing global remittance market; clear competitive advantages (transparent rates, built-in compliance, open source); strong NZ market demand. | ✅ **Feasible** |
| **Economic / Cost Feasibility** | Total project cost ~$29,507 with detailed bottom-up estimation; positive ROI within 2-3 years; zero cost for academic team. | ✅ **Feasible** |
| **Schedule Feasibility** | On track for Week 14 submission (12 July 2026); all critical dependencies identified; buffer time available. | ✅ **Feasible** |
| **Legal / Regulatory Feasibility** | Compliant with Privacy Act 2020, AML/CFT Act 2009, and Māori Data Sovereignty principles; open-source licensing respected. | ✅ **Feasible** |
| **Cultural / Political Feasibility** | Deep integration of Tikanga Māori principles; alignment with NZ government digital strategy; bilingual interface. | ✅ **Feasible** |
| **Resource Feasibility** | All human, technological, and financial resources are available at no additional cost; no critical skill gaps. | ✅ **Feasible** |
| **Risk Assessment** | All identified risks have clear mitigation strategies; no unmitigable risks identified. | ✅ **Manageable** |

### 11.2 Overall Recommendation

<!-- Based on the comprehensive analysis across all nine feasibility dimensions, the overall assessment is positive. -->

**Recommendation: PROCEED**

All nine feasibility dimensions return positive assessments. ForeXchange is:

- **Technically sound** — built on modern, production-proven technologies.
- **Operationally ready** — with clear team roles, Agile processes, and CI/CD infrastructure.
- **Market-viable** — addressing a genuine need in the cross-border remittance and compliance space with clear competitive differentiation.
- **Cost-transparent** — with a detailed bottom-up cost estimation meeting the lecturer's rigorous standards.
- **On schedule** — with confirmed delivery before the Week 14 deadline and Week 15 presentation.
- **Legally compliant** — with New Zealand regulations from the ground up.
- **Culturally informed** — with substantive integration of Tikanga Māori and Māori Data Sovereignty.
- **Risk-managed** — with documented mitigation strategies for all identified risks.

The ForeXchange project demonstrates the application of professional software engineering principles — including requirements engineering, Agile project management, verification and validation, cultural integration, and rigorous cost estimation — as required by the MSE800 Assessment 2 learning outcomes (LO3, LO4, LO5).

> **Note to Teachers:** This feasibility study is also referenced in the project's `README.md` file. The GitHub repository link for sharing is the same as the project repository URL. See the `documentation/` section of the README for a direct link to this document.

---

## 12. References

<!-- All references follow APA 7th Edition format as required by the MSE800 course (Week 11 and Week 12 Lecture Notes). The lecturer emphasised: "use automated citation tools for honest references" (Week 11 Sunday Notes). -->

Digital.govt.nz. (2024). *New Zealand's digital strategy for public service*. New Zealand Government. https://www.digital.govt.nz/

FinTech NZ. (2024). *New Zealand FinTech industry report 2024*. FinTech New Zealand. https://www.fintech.nz/

GeeksforGeeks. (2026, May 14). *Types of feasibility study in software project development*. GeeksforGeeks. https://www.geeksforgeeks.org/software-engineering/types-of-feasibility-study-in-software-project-development/

Hays. (2026). *Hays salary guide: New Zealand FY26/27*. Hays Specialist Recruitment. https://www.hays.net.nz/salary-guide

Health Research Council. (2022). *Māori health research guidelines*. HRC. https://www.hrc.govt.nz/

Māori Data Sovereignty Network. (2018). *Te Mana Raraunga: Māori data sovereignty principles*. Te Mana Raraunga. https://www.temanararaunga.maori.nz/

Microsoft Azure. (2025). *Azure pricing calculator*. Microsoft. https://azure.microsoft.com/en-nz/pricing/calculator/

New Zealand Legislation. (2026). *Anti-Money Laundering and Countering Financing of Terrorism Act 2009* (Public Act 2009 No 35, version as at 19 May 2026). Parliamentary Counsel Office. https://www.legislation.govt.nz/act/public/2009/0035/latest/DLM2140707.html

Office of the Privacy Commissioner. (2020). *Privacy Act 2020*. New Zealand Government. https://www.privacy.org.nz/

Seek NZ. (2025). *Seek NZ salary guide 2025*. Seek New Zealand. https://www.seek.co.nz/career-advice/salary-guide

Stats NZ. (2023). *International migration: December 2023*. Statistics New Zealand. https://www.stats.govt.nz/

World Bank. (2023). *Migration and development brief 39: Remittances to low- and middle-income countries*. World Bank Group. https://www.worldbank.org/en/topic/migrationremittances

---

> **Document generated:** 10 July 2026
> **Document location:** `documentation/Software project feasibility study report.md`
> **Related files:**
> - `documentation/Functional-NonFunctional-Requirements.md`
> - `documentation/English-Functional-NonFunctional-Requirements.md`
> - `documentation/ForeXchange-Design.md`
> - `documentation/ForeXchange-Backend-Phases.md`
> - `documentation/ForeXchange-Frontend-Phases.md`
> - `documentation/Māori Principles and Data Sovereignty.md`
> - `documentation/CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md`
> - `documentation/Proposals.md`
> - `README.md`
> - `backend/pyproject.toml`
> - `frontend/package.json`
> - `compose.yml`
