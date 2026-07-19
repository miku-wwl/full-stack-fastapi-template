# ForeXchange — Real-Time Remittance & Compliance Monitoring Dashboard

> Course Project | FastAPI + React + PostgreSQL + Docker

---

## Quick Start

```bash
docker compose up -d --build
```

## Pylint

The backend uses Pylint for Python static analysis. Configuration is in `backend/pyproject.toml`.

```bash
cd backend
uv sync
uv run pylint app
```

The GitHub Actions workflow is at `.github/workflows/pylint.yml`. It runs automatically on pushes to `main`, `cloudarch`, or `cloudarchitf` branches, and on pull requests affecting the backend. You can also trigger it manually from **Actions > Pylint > Run workflow**.

To require passing Pylint checks before merging, go to **Settings > Branches > Branch protection rules**, enable **Require status checks to pass before merging**, and select `Pylint / pylint`.

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:5173 |
| Backend API Docs | http://localhost:8000/docs |
| MailCatcher | http://localhost:1080 |

## Test Accounts

Use assessor-provided or locally generated test credentials. No default
credentials are distributed in this repository.

## Features

- 🔐 JWT authentication (OAuth2 password flow + role-based permissions)
- 📊 Dashboard homepage (statistics cards + transaction list)
- 💱 Real-time forex rates (12 currency pairs, 5-second polling, Frankfurter ECB feed)
- 📈 Exchange rate charts (ApexCharts, 24-hour history)
- 💰 Cross-border remittance (rate locking + IBAN validation + AML compliance screening)
- 📋 Transaction history (pagination + status filtering)
- 🔒 Compliance audit (Auditor-only, risk scoring + review actions)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLModel, PostgreSQL, JWT |
| Frontend | React 19, TanStack Router, React Query, Tailwind CSS, ApexCharts |
| Deployment | Docker Compose, Nginx |

## Project Structure

```
├── backend/          # FastAPI backend
│   └── app/
│       ├── api/routes/   # API route handlers
│       ├── models.py     # Data models
│       └── forex.py      # Forex rate simulator
├── frontend/         # React frontend
│   └── src/
│       ├── routes/       # Page routes
│       ├── components/   # UI components
│       └── hooks/        # Custom React hooks
├── documentation/    # Design docs, verification reports, feasibility study
└── compose.yml       # Docker orchestration
```

## Documentation

## Feasibility Summary

ForeXchange is technically feasible as a classroom prototype because it uses a containerised FastAPI/React/PostgreSQL stack, a reference-rate API with a local fallback, and Terraform-managed deployment configuration. Operational feasibility is supported by the two-person role split, documented API boundary, automated backend tests and verification records. Market and legal feasibility remain exploratory: the prototype demonstrates a remittance workflow and classroom compliance screening, but it is not a regulated financial service and would require production legal review, privacy governance, security assurance and stakeholder validation.

| Document | Description |
|----------|-------------|
| [`Functional-NonFunctional-Requirements.md`](documentation/Functional-NonFunctional-Requirements.md) | Functional & non-functional requirements (EN/CN bilingual) |
| [`English-Functional-NonFunctional-Requirements.md`](documentation/English-Functional-NonFunctional-Requirements.md) | Functional & non-functional requirements (English) |
| [`Software project feasibility study report.md`](documentation/Software%20project%20feasibility%20study%20report.md) | **Feasibility Study** — technical, operational, market, cost, schedule, legal, cultural, resource & risk analysis |
| [`Māori Principles and Data Sovereignty.md`](documentation/M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md) | Māori principles & data sovereignty — one-page report (Week 13 Activity 1) |
| [`CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md`](documentation/CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md) | Cultural sovereignty implementation report |
| [`ForeXchange-Design.md`](documentation/ForeXchange-Design.md) | Full detailed design document |
| [`Proposals.md`](documentation/Proposals.md) | Project proposal |
| [`Inheritance_Types_and_Design_Patterns.md`](documentation/Inheritance_Types_and_Design_Patterns.md) | OOP inheritance types and software design patterns used |
| [`Sprint_Reviews_and_Retrospectives.md`](documentation/Sprint_Reviews_and_Retrospectives.md) | Sprint reviews, retrospectives and project reflection |
| [`Client_Sign_Off_Records.md`](documentation/Client_Sign_Off_Records.md) | Formal client sign-off for each Waterfall phase |
| [`ForeXchange_Waterfall_Diagram.drawio`](documentation/ForeXchange_Waterfall_Diagram.drawio) | Waterfall project management diagram + Agile Sprint plan |
| [`ForeXchange_Function_Decomposition_Diagram.drawio`](documentation/ForeXchange_Function_Decomposition_Diagram.drawio) | Function decomposition diagram (3-layer architecture) |
| [`Azure-Cloud-Architecture.md`](documentation/Azure-Cloud-Architecture.md) | Azure cloud architecture design document |
| [`Azure-Deployment-Report.md`](documentation/Azure-Deployment-Report.md) | Azure deployment verification report |
| [`Azure-Portal-Guide.md`](documentation/Azure-Portal-Guide.md) | Azure Portal configuration guide |
| [`Day1-Verification-Report.md`](documentation/Day1-Verification-Report.md) | Verification reports (Day 1–10) |
| [`ForeXchange-Backend-Phases.md`](documentation/ForeXchange-Backend-Phases.md) | Backend development phases |
| [`ForeXchange-Frontend-Phases.md`](documentation/ForeXchange-Frontend-Phases.md) | Frontend development phases |
| **UML Diagrams** (in [`documentation/UML/`](documentation/UML/)) | |
| [`ForeXchange_Class_Diagram.drawio`](documentation/UML/ForeXchange_Class_Diagram.drawio) | UML Class Diagram — all ORM models, inheritance, and ForexSimulator |
| [`ForeXchange_Use_Case_Diagram.drawio`](documentation/UML/ForeXchange_Use_Case_Diagram.drawio) | UML Use Case Diagram — Customer, Auditor, and ECB API actors |
| [`ForeXchange_Sequence_Diagram.drawio`](documentation/UML/ForeXchange_Sequence_Diagram.drawio) | UML Sequence Diagram — login authentication flow (13 steps) |
| [`ForeXchange_Activity_Diagram.drawio`](documentation/UML/ForeXchange_Activity_Diagram.drawio) | UML Activity Diagram — AML compliance screening flow |

## Development Progress

| Sprint | Module | Status |
|--------|--------|--------|
| 1 | Project scaffolding (Docker, DB, CI/CD) | ✅ |
| 2 | Authentication system (JWT, register/login) | ✅ |
| 3 | Layout navigation + forex seed data | ✅ |
| 4 | Dashboard homepage + statistics cards | ✅ |
| 5 | Real-time forex rates (5s polling) | ✅ |
| 6 | Cross-border remittance (rate locking + IBAN validation) | ✅ |
| 7 | AML compliance engine (risk scoring + review) | ✅ |
| 8 | E2E testing + performance optimisation | ✅ |
| 9-10 | Azure cloud deployment (Terraform IaC) | ✅ |

## Māori Principles & Data Sovereignty

<!--
  This section documents how Tikanga Māori principles and Māori Data Sovereignty
  are considered and integrated into the ForeXchange development lifecycle,
  as required by the Week 13 Activity 1 deliverable.
-->

This project embeds the **four Tikanga Māori principles** throughout its architecture:

| Principle | Application in ForeXchange |
|-----------|---------------------------|
| **Pūkenga & Ōtakapopo**<br/>(Expertise & Community) | Māori language support (*Kia ora* greeting, *Reo Māori* labels); README invites community feedback from the design phase |
| **Whānaungatanga**<br/>(Transparency & Ethics) | Role-based JWT access control; registration Privacy Notice; full audit trail for every transaction review |
| **Pāranga & KaTika**<br/>(Data Governance) | PostgreSQL schema validation; Argon2id + Bcrypt password hashing; Auditor-only access to sensitive fields |
| **Tapu & Noa**<br/>(Risk Balance) | Automated AML compliance scoring (0–100); flagged transactions require manual Auditor review; user deletion rights (`DELETE /users/me`) |

**Māori Data Sovereignty** is implemented across the data lifecycle — collection (minimal data, explicit consent), storage (encryption, hashing), access (role-based JWT), deletion (full account removal), and audit (structured JSON compliance logs). These practices protect all users and align with New Zealand funding body requirements (MBIE, HRC).

Future production development would require formal consultation with Māori
stakeholders and data-governance specialists. This classroom prototype does
not claim to represent formal community validation.

See [`documentation/Māori Principles and Data Sovereignty.md`](documentation/M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md) for the full one-page report.
