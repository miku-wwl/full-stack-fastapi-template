# ForeXchange — Functional & Non-Functional Requirements

> **Project Title:** ForeXchange — 实时汇款与合规监控仪表盘 (Real-Time Remittance & Compliance Monitoring Dashboard)
>
> **Assessment 2 — Group Activity:** Verification List of Functional and Non-Functional Requirements
>
> **GitHub Repository:** `https://github.com/<your-org>/full-stack-fastapi-template` (请替换为实际仓库地址)

---

## 项目简介 / Project Introduction

**ForeXchange** 是一个全栈跨境汇款与合规监控平台，基于 **FastAPI + React + PostgreSQL + Docker** 构建。系统提供实时汇率行情、跨境汇款（含汇率锁定与 IBAN 校验）、交易历史追踪，以及面向审计人员的 AML 合规审查（风险评分、标记与审核）功能。前端使用 TanStack Router + Tailwind CSS + ApexCharts 构建现代化仪表盘，后端集成 Sentry 错误监控、JWT 角色权限认证和安全响应头。

**ForeXchange** is a full-stack cross-border remittance and compliance monitoring platform built with **FastAPI + React + PostgreSQL + Docker**. The system provides real-time forex rates, cross-border remittance (with rate locking and IBAN validation), transaction history tracking, and AML compliance review (risk scoring, flagging, and approval/rejection) for auditors. The frontend uses TanStack Router + Tailwind CSS + ApexCharts for a modern dashboard, and the backend integrates Sentry error monitoring, JWT role-based authentication, and security response headers.

---

## 一、功能需求 / Functional Requirements

功能需求定义系统 **必须做什么**——即具体的功能、特性和操作。以下列出 ForeXchange 的完整功能需求，并标注各需求的实现位置和所属 Sprint。

| # | 需求 / Requirement | 描述 / Description | 实现位置 / Implementation | Sprint |
|---|---|---|---|---|
| FR-01 | **用户注册** | 游客可通过表单注册新账户（邮箱、密码、姓名），默认角色为 `customer`。 | `backend/app/api/routes/login.py` → `POST /api/v1/login/access-token`<br>`frontend/src/routes/signup.tsx` | Sprint 1-2 |
| FR-02 | **用户登录** | 已注册用户可通过邮箱+密码进行 OAuth2 密码流认证，获取 JWT access token。 | `backend/app/api/routes/login.py` → `POST /api/v1/login/access-token`<br>`frontend/src/routes/login.tsx` | Sprint 1-2 |
| FR-03 | **用户登出（前端清除 Token）** | 用户点击登出后，前端清除本地存储的 Token，跳转回登录页。 | `frontend/src/hooks/useAuth.ts` | Sprint 2 |
| FR-04 | **密码找回 / 重置** | 用户可通过注册邮箱发起密码重置流程，系统发送含令牌的重置邮件，用户使用令牌设置新密码。 | `backend/app/api/routes/login.py` → `POST /password-recovery/{email}` 和 `POST /reset-password/`<br>`frontend/src/routes/recover-password.tsx` + `reset-password.tsx` | Sprint 2 |
| FR-05 | **用户资料管理** | 登录用户可以查看和更新自己的个人信息（姓名、邮箱）。 | `backend/app/api/routes/users.py` → `PATCH /api/v1/users/me`<br>`frontend/src/routes/_layout/settings.tsx` | Sprint 2 |
| FR-06 | **管理员用户管理** | 超级管理员（`superuser`）可以创建新用户、查看所有用户列表、管理用户角色。 | `backend/app/api/routes/users.py` → `GET/POST /api/v1/users/` | Sprint 2 |
| FR-07 | **实时汇率行情** | 系统从 Frankfurter API（ECB 官方数据）获取 12 个主流货币对基准汇率，并叠加随机波动模拟实时市场变动，以 5 秒为间隔轮询推送。 | `backend/app/forex.py` → `ForexSimulator` + `start_rate_generator(interval_seconds=5)` | Sprint 3-5 |
| FR-08 | **查看实时汇率** | 用户可查看所有活跃货币对的实时汇率（bid/ask/mid/spread/change%）。 | `backend/app/api/routes/rates.py` → `GET /api/v1/rates/live`<br>`frontend/src/routes/_layout/rates.tsx` | Sprint 3-5 |
| FR-09 | **查看单个货币对汇率** | 用户可查询指定货币对的实时汇率（如 `USD-EUR`）。 | `backend/app/api/routes/rates.py` → `GET /api/v1/rates/live/{pair}` | Sprint 5 |
| FR-10 | **汇率走势图** | 系统提供 24 小时汇率走势图（ApexCharts 折线图），展示指定货币对的历史价格变化。 | `frontend/src/pages/Dashboard/Home.tsx` + ApexCharts 集成 | Sprint 5 |
| FR-11 | **汇率锁定** | 用户在发起汇款前，可锁定当前汇率 30 秒，期间价格不受市场波动影响。 | `backend/app/api/routes/rates.py` → `POST /api/v1/rates/lock` | Sprint 6 |
| FR-12 | **跨境汇款** | 用户可发起跨境汇款交易——选择货币对、输入金额、填写收款人信息（名称、IBAN、汇款用途），使用已锁定的汇率完成汇款。 | `backend/app/api/routes/transactions.py` → `POST /api/v1/transactions/`<br>`frontend/src/routes/_layout/remittance.tsx` | Sprint 6 |
| FR-13 | **IBAN 格式校验** | 系统对收款人 IBAN 进行基本格式校验（长度 15-34 位、国家代码+校验位+账户号格式）。 | `backend/app/api/routes/transactions.py` → `_validate_iban()` | Sprint 6 |
| FR-14 | **交易历史** | 用户可以查看自己的交易历史列表，支持分页和按状态筛选（pending/completed/rejected/flagged）。 | `backend/app/api/routes/transactions.py` → `GET /api/v1/transactions/`<br>`frontend/src/routes/_layout/history.tsx` | Sprint 6 |
| FR-15 | **仪表盘统计** | 首页仪表盘展示汇总统计：活跃货币对数量、今日交易笔数、今日交易总额（USD）、标记交易数、平均处理时间。 | `backend/app/api/routes/dashboard.py` → `GET /api/v1/dashboard/summary`<br>`frontend/src/pages/Dashboard/Home.tsx` | Sprint 4 |
| FR-16 | **AML 合规筛查（自动）** | 每笔汇款提交时，系统自动运行 4 条 AML 反洗钱规则（大额触发、高风险国家、随机抽查、结构化模式检测），生成风险评分（0-100）和合规详情。 | `backend/app/api/routes/compliance.py` → `_run_compliance_rules()`<br>`backend/app/api/routes/transactions.py`（提交时调用） | Sprint 7 |
| FR-17 | **合规总览（审计员）** | 审计员（`auditor`/`superuser`）可查看合规总览：标记交易数、今日审核数、通过/拒绝数、通过率。 | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/overview`<br>`frontend/src/routes/_layout/compliance.tsx` | Sprint 7 |
| FR-18 | **标记交易列表（审计员）** | 审计员可查看所有被标记的交易，按风险评分降序排列。 | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/flagged` | Sprint 7 |
| FR-19 | **合规详情查看（审计员）** | 审计员可查看单笔交易的完整合规详情，包括触发的规则和风险评分。 | `backend/app/api/routes/compliance.py` → `GET /api/v1/compliance/{tx_id}` | Sprint 7 |
| FR-20 | **合规审核操作（审计员）** | 审计员可对标记交易执行"通过"（approve）或"拒绝"（reject）操作，拒绝时需填写原因。 | `backend/app/api/routes/compliance.py` → `POST /api/v1/compliance/review/{tx_id}` | Sprint 7 |
| FR-21 | **健康检查** | 提供 `/api/v1/utils/health-check/` 端点供 Docker 健康检查使用。 | `backend/app/api/routes/utils.py` → `GET /utils/health-check/` | Sprint 1 |
| FR-22 | **测试邮件（管理员）** | 超级管理员可通过 API 发送测试邮件以验证 SMTP 配置。 | `backend/app/api/routes/utils.py` → `POST /utils/test-email/` | Sprint 2 |
| FR-23 | **数据库迁移** | 使用 Alembic 管理数据库 schema 版本控制和自动迁移。 | `backend/alembic.ini` + alembic 迁移脚本 | Sprint 1 |
| FR-24 | **种子数据初始化** | 系统启动时自动播种货币对数据和初始汇率数据，并启动后台汇率生成器。 | `backend/app/seed_forex.py` + `backend/app/main.py` → `on_startup()` | Sprint 3 |
| FR-25 | **主题切换** | 用户可在暗色/亮色主题之间切换，系统会记住用户的偏好。 | `frontend/src/context/ThemeContext.tsx` + `components/theme-provider.tsx` | Sprint 3 |

---

## 二、非功能需求 / Non-Functional Requirements

非功能需求定义系统 **应该做得怎么样**——即质量属性、性能约束和安全标准。

| # | 需求 / Requirement | 描述 / Description | 实现位置 / Implementation | Sprint |
|---|---|---|---|---|
| NFR-01 | **性能 — API 响应时间** | API 响应时间在正常负载下应 < 500ms（非外部 API 调用场景）。FastAPI 异步框架天然支持高性能。 | `backend/app/main.py`（FastAPI 异步框架） | Sprint 1 |
| NFR-02 | **性能 — 汇率实时性** | 汇率数据每 5 秒自动刷新一次，确保用户看到的是接近实时的市场数据。 | `backend/app/forex.py` → `start_rate_generator(interval_seconds=5)` | Sprint 3-5 |
| NFR-03 | **性能 — 前端静态资源** | 前端使用 Vite 构建，生产环境输出压缩后的静态资源，Nginx 托管时启用 gzip 和缓存策略。 | `frontend/vite.config.ts` + `frontend/nginx.conf` | Sprint 1 |
| NFR-04 | **安全性 — JWT 认证** | 所有受保护 API 端点均需携带有效的 JWT access token（HS256 算法，8 天过期）。 | `backend/app/core/security.py` → `create_access_token()`<br>`backend/app/api/deps.py` → `get_current_user()` | Sprint 1-2 |
| NFR-05 | **安全性 — 角色权限控制** | 系统实施三角色权限模型：`customer`（普通用户）、`auditor`（审计员）、`superuser`（超级管理员），不同角色可访问不同端点。 | `backend/app/api/deps.py` → `get_current_active_superuser()`<br>`backend/app/api/routes/compliance.py` → `_require_auditor()` | Sprint 2-7 |
| NFR-06 | **安全性 — 密码加密** | 用户密码使用 Argon2 + bcrypt 混合哈希算法加密存储，不可逆。 | `backend/app/core/security.py` → `PasswordHash(Argon2Hasher, BcryptHasher)` | Sprint 2 |
| NFR-07 | **安全性 — 安全响应头** | 所有 API 响应自动添加安全头部：`X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、`X-XSS-Protection`、`Referrer-Policy`、`Permissions-Policy`。 | `backend/app/main.py` → `SecurityHeadersMiddleware` | Sprint 1 |
| NFR-08 | **安全性 — CORS 配置** | 后端 CORS 策略可通过环境变量 `BACKEND_CORS_ORIGINS` 灵活配置，默认允许前端域名。 | `backend/app/core/config.py` → `all_cors_origins`<br>`backend/app/main.py` → `CORSMiddleware` | Sprint 1 |
| NFR-09 | **安全性 — 防止邮箱枚举** | 密码找回接口无论邮箱是否存在均返回相同提示信息，防止攻击者通过响应差异枚举注册邮箱。 | `backend/app/api/routes/login.py` → `recover_password()` 返回统一消息 | Sprint 2 |
| NFR-10 | **可靠性 — 全局异常处理** | 系统注册全局异常处理器（400 和 500），防止未捕获异常泄露敏感信息。 | `backend/app/main.py` → `value_error_handler()` + `global_exception_handler()` | Sprint 1 |
| NFR-11 | **可靠性 — Docker 健康检查** | 后端服务配置了 health check（curl 检测 `/api/v1/utils/health-check/`），Docker Compose 确保依赖服务启动顺序正确。 | `compose.yml` → `backend.healthcheck` + `depends_on` | Sprint 1 |
| NFR-12 | **可靠性 — 数据库健康依赖** | 后端和 prestart 服务依赖 PostgreSQL 容器健康就绪后才启动，通过 `pg_isready` 检测。 | `compose.yml` → `db.healthcheck` | Sprint 1 |
| NFR-13 | **可维护性 — 代码静态检查** | 后端使用 Pylint + Ruff + MyPy 进行静态类型检查和代码质量检查；前端使用 Biome 进行代码检查。 | `backend/pyproject.toml`（pylint/ruff/mypy 配置）<br>`frontend/biome.json` | Sprint 1 |
| NFR-14 | **可维护性 — CI/CD 流水线** | GitHub Actions 自动运行 Pylint 静态检查，推送到 `main`/`cloudarch`/`cloudarchitf` 分支或提交 PR 时触发。 | `.github/workflows/pylint.yml` | Sprint 1 |
| NFR-15 | **可维护性 — 自动生成 API 客户端** | 使用 `@hey-api/openapi-ts` 从 OpenAPI schema 自动生成 TypeScript API 客户端代码，保持前后端类型一致。 | `frontend/openapi-ts.config.ts` + `frontend/src/client/` | Sprint 1 |
| NFR-16 | **可维护性 — 数据库迁移** | 使用 Alembic 进行数据库 schema 版本管理，所有 schema 变更通过迁移脚本追踪。 | `backend/alembic.ini` + 迁移版本目录 | Sprint 1 |
| NFR-17 | **可用性 — 响应式 UI** | 前端使用 Tailwind CSS 构建响应式布局，适配桌面端和移动端。 | `frontend/src/layout/` + Tailwind CSS 响应式类 | Sprint 3 |
| NFR-18 | **可用性 — 错误提示** | 前后端统一的错误提示机制：后端返回标准 JSON 错误格式，前端使用 sonner toast 组件展示友好错误信息。 | `frontend/src/hooks/useCustomToast.ts` + `sonner`<br>`frontend/src/components/Common/ErrorComponent.tsx` | Sprint 1-3 |
| NFR-19 | **可用性 — 404 页面** | 未匹配路由显示友好的 404 页面。 | `frontend/src/components/Common/NotFound.tsx` | Sprint 1 |
| NFR-20 | **可移植性 — Docker 容器化** | 整个系统（前端、后端、数据库）通过 Docker Compose 一键部署，环境配置通过 `.env` 文件管理。 | `compose.yml` + `backend/Dockerfile` + `frontend/Dockerfile` | Sprint 1 |
| NFR-21 | **可移植性 — 环境配置** | 所有环境特定配置（数据库、密钥、SMTP 等）通过环境变量注入，支持 `local`/`staging`/`production` 三种环境。 | `backend/app/core/config.py` → `Settings` + `ENVIRONMENT` | Sprint 1 |

---

## 三、扩展需求 / Extended Requirements

扩展需求定义增强系统能力但非核心功能的需求，包括监控、日志、灾备等。

| # | 需求 / Requirement | 描述 / Description | 实现位置 / Implementation | Sprint |
|---|---|---|---|---|
| ER-01 | **错误监控 — Sentry** | 系统集成 Sentry SDK 进行生产环境错误跟踪和性能监控，非 `local` 环境且配置了 `SENTRY_DSN` 时启用。 | `backend/app/main.py` → `sentry_sdk.init()`<br>`backend/app/core/config.py` → `SENTRY_DSN` | Sprint 1 |
| ER-02 | **日志记录** | 后端使用 Python `logging` 模块记录关键操作、警告和错误信息，日志级别可配置。 | `backend/app/main.py`、各个 route 文件中的 `logger` 实例 | Sprint 1 |
| ER-03 | **API 文档** | FastAPI 自动生成交互式 OpenAPI 文档（Swagger UI + ReDoc），可通过 `/docs` 和 `/redoc` 访问。 | `backend/app/main.py` → `FastAPI(title=..., openapi_url=...)` | Sprint 1 |
| ER-04 | **前端开发者工具** | 开发环境集成 TanStack Router Devtools 和 React Query Devtools，方便调试路由和数据请求。 | `frontend/src/routes/__root.tsx` → `TanStackRouterDevtools` + `ReactQueryDevtools` | Sprint 1 |
| ER-05 | **邮件服务** | 系统支持通过 SMTP 发送密码重置邮件和新账户通知邮件，可在 `local` 环境使用 MailCatcher 拦截测试。 | `backend/app/utils.py` → `send_email()`<br>`compose.override.yml` → MailCatcher 服务 | Sprint 2 |
| ER-06 | **代码覆盖率** | 项目配置了 pytest + coverage 工具进行测试覆盖率分析。 | `backend/pyproject.toml` → `[dependency-groups] dev` → `coverage`<br>`backend/scripts/prestart.sh` | Sprint 1 |
| ER-07 | **基础设施即代码 — Terraform** | 提供 Terraform 配置文件用于 Azure 云基础设施部署（Container Apps、PostgreSQL、Key Vault、Storage）。 | `tf/` 目录下的 `.tf` 文件 | Sprint 9-10 |
| ER-08 | **前端 E2E 测试** | 使用 Playwright 进行端到端测试。 | `frontend/package.json` → `"test": "bunx playwright test"` | Sprint 8 |

---

## 四、需求分类汇总 / Requirements Summary

| 类别 / Category | 数量 | 占比 |
|---|---|---|
| 功能需求 (Functional) | 25 | 54.3% |
| 非功能需求 (Non-Functional) | 21 | 45.7% |
| 扩展需求 (Extended) | 8 | — (包含在上两项中) |
| **总计** | **46** | **100%** |

---

## 五、Sprint 映射关系 / Sprint Mapping

| Sprint | 主要交付功能 |
|--------|-------------|
| **Sprint 1** | 项目脚手架、Docker 容器化、FastAPI 应用初始化、数据库配置、Alembic 迁移、CORS/Security 中间件、健康检查、CI/CD 流水线、Sentry 集成、OpenAPI 客户端生成 |
| **Sprint 2** | JWT 认证系统、用户注册/登录/登出、密码找回/重置、用户资料管理、邮件服务、管理员用户管理 |
| **Sprint 3** | 布局导航、主题切换（暗色/亮色）、汇率数据种子初始化、汇率生成器 |
| **Sprint 4** | 仪表盘首页、统计卡片、交易列表 |
| **Sprint 5** | 实时汇率行情(12 货币对, 5 秒轮询)、汇率走势图(ApexCharts, 24h 历史) |
| **Sprint 6** | 跨境汇款（汇率锁定 + IBAN 校验）、交易历史（分页 + 状态筛选） |
| **Sprint 7** | AML 合规审计系统（风险评分、标记交易、审核操作） |
| **Sprint 8** | E2E 测试、性能优化、Bug 修复 |
| **Sprint 9-10** | Azure 云部署（Terraform、Container Apps）、部署验证 |

---

*文档生成日期：2026-06-20*
*本文档基于 GeeksforGeeks — "Functional vs Non-functional Requirements" 分类标准编写。*
