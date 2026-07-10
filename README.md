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

| Role | Email | Password |
|------|-------|----------|
| Auditor (Admin) | admin@example.com | changethis |
| Customer (self-register) | — | — |

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

We welcome feedback from Māori communities and stakeholders. If you have
suggestions, questions, or would like to discuss how ForeXchange can better
serve diverse cultural needs, please
[open an issue](https://github.com/minglai/forexchange/issues) or contact the
maintainer directly.

See [`documentation/Māori Principles and Data Sovereignty.md`](documentation/M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md) for the full one-page report.

---

# ForeXchange — 实时汇款与合规监控仪表盘

> 课程设计项目 | FastAPI + React + PostgreSQL + Docker

## 快速启动

```bash
docker compose up -d --build
```

## Pylint

后端使用 Pylint 做 Python 静态检查，配置位于 `backend/pyproject.toml`。

```bash
cd backend
uv sync
uv run pylint app
```

GitHub Actions 工作流位于 `.github/workflows/pylint.yml`。向 `main`、`cloudarch`
或 `cloudarchitf` 推送，以及创建或更新影响后端的 Pull Request 时，会自动运行
Pylint；也可以在 GitHub 仓库的 **Actions > Pylint > Run workflow** 手动执行。

如果要禁止未通过 Pylint 的代码合并，在 GitHub 仓库进入
**Settings > Branches > Branch protection rules**，为目标分支启用
**Require status checks to pass before merging**，并选择 `Pylint / pylint`。

| 服务 | 地址 |
|------|------|
| 前端仪表盘 | http://localhost:5173 |
| 后端 API 文档 | http://localhost:8000/docs |
| MailCatcher | http://localhost:1080 |

## 测试账号

| 角色 | Email | 密码 |
|------|-------|------|
| Auditor（管理员） | admin@example.com | changethis |
| Customer（需自行注册） | — | — |

## 功能模块

- 🔐 JWT 认证（OAuth2 密码流 + 角色权限）
- 📊 仪表盘首页（统计卡片 + 交易列表）
- 💱 实时汇率行情（12 货币对，5 秒轮询，Frankfurter ECB 基准）
- 📈 汇率走势图（ApexCharts，24h 历史）
- 💰 跨境汇款（汇率锁定 + IBAN 校验 + AML 合规筛查）
- 📋 交易历史（分页 + 状态筛选）
- 🔒 合规审计（Auditor 专属，风险评分 + 审核操作）

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | FastAPI, SQLModel, PostgreSQL, JWT |
| 前端 | React 19, TanStack Router, React Query, Tailwind CSS, ApexCharts |
| 部署 | Docker Compose, Nginx |

## 项目结构

```
├── backend/          # FastAPI 后端
│   └── app/
│       ├── api/routes/   # API 路由
│       ├── models.py     # 数据模型
│       └── forex.py      # 汇率模拟器
├── frontend/         # React 前端
│   └── src/
│       ├── routes/       # 页面路由
│       ├── components/   # UI 组件
│       └── hooks/        # 自定义 Hooks
├── documentation/    # 设计文档 & 验证报告 & 可行性研究报告
└── compose.yml       # Docker 编排
```

## 文档

| 文档 | 说明 |
|------|------|
| [`Functional-NonFunctional-Requirements.md`](documentation/Functional-NonFunctional-Requirements.md) | 功能性与非功能性需求（中英双语） |
| [`Software project feasibility study report.md`](documentation/Software%20project%20feasibility%20study%20report.md) | **可行性研究报告 (Feasibility Study)** — 技术、运营、市场、成本、进度、法律、文化八维度分析 |
| [`Māori Principles and Data Sovereignty.md`](documentation/M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md) | 毛利原则与数据主权 — 一页报告 (Week 13 Activity 1) |
| [`CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md`](documentation/CULTURAL_SOVEREIGNTY_IMPLEMENTATION.md) | 文化主权实施报告 |
| [`ForeXchange-Design.md`](documentation/ForeXchange-Design.md) | 全量详细设计文档 |
| [`Proposals.md`](documentation/Proposals.md) | 项目提案 |

## 开发进度

| Sprint | 模块 | 状态 |
|--------|------|------|
| 1 | 项目脚手架 (Docker, DB, CI/CD) | ✅ |
| 2 | 认证系统 (JWT, 注册/登录) | ✅ |
| 3 | 布局导航 + 汇率种子数据 | ✅ |
| 4 | 仪表盘首页 + 统计卡片 | ✅ |
| 5 | 实时汇率行情 (5s轮询) | ✅ |
| 6 | 跨境汇款 (汇率锁定 + IBAN校验) | ✅ |
| 7 | AML合规引擎 (风险评分 + 审核) | ✅ |
| 8 | E2E测试 + 性能优化 | ✅ |
| 9-10 | Azure云部署 (Terraform IaC) | ✅ |

## 毛利原则与数据主权

<!--
  本部分记录 Tikanga Māori 原则和毛利数据主权如何被纳入 ForeXchange 的开发周期，
  如第 13 周活动 1 的要求所述。
-->

本项目将 **四项 Tikanga Māori 原则** 融入整体架构：

| 原则 | 在 ForeXchange 中的应用 |
|------|------------------------|
| **Pūkenga & Ōtakapopo**<br/>(专业知识与社区参与) | 支持毛利语（*Kia ora* 问候语、*Reo Māori* 标签）；README 从设计阶段即邀请社区反馈 |
| **Whānaungatanga**<br/>(透明度与伦理) | 基于角色的 JWT 权限控制；注册时显示隐私声明；每笔交易审核的完整审计追踪 |
| **Pāranga & KaTika**<br/>(数据治理) | PostgreSQL schema 验证；Argon2id + Bcrypt 密码哈希；敏感字段仅限 Auditor 角色访问 |
| **Tapu & Noa**<br/>(风险与收益平衡) | 自动化 AML 合规评分（0–100）；标记交易需人工 Auditor 审核；用户删除权（`DELETE /users/me`） |

**毛利数据主权** 贯穿数据全生命周期——收集（最小数据原则、明确同意）、存储（加密、哈希）、访问（基于 JWT 角色）、删除（完全删除账户）和审计（结构化 JSON 合规日志）。这些实践保护所有用户，并符合新西兰资助机构（MBIE、HRC）的要求。

欢迎毛利社区和利益相关者提供反馈。如果您有建议、问题，或希望讨论 ForeXchange 如何更好地满足多元文化需求，请[提交 Issue](https://github.com/minglai/forexchange/issues) 或直接联系维护者。

完整的一页报告请参阅 [`documentation/Māori Principles and Data Sovereignty.md`](documentation/M%C4%81ori%20Principles%20and%20Data%20Sovereignty.md)。
