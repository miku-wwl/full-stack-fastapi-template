# ForeXchange — 全量详细设计文档

> **提案编号**: Proposal 3  
> **项目名称**: ForeXchange: High-Availability Real-Time Remittance and Compliance Telemetry Dashboard  
> **架构模式**: Azure Container Apps + Azure PostgreSQL + Azure Queue Storage + Docker Hub + Terraform IaC

---

## 目录

- [Part 1: 前端详细设计](#part-1-前端详细设计)
- [Part 2: 后端详细设计](#part-2-后端详细设计)
- [Part 3: 部署与 IaC 详细设计](#part-3-部署与-iac-详细设计)

---

## Part 1: 前端详细设计

### 1.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 5.7+ | 类型安全 |
| TanStack Router | 1.x | 文件系统路由 + 路由守卫 |
| TanStack React Query | 5.x | 服务端状态管理 + 实时轮询 |
| Tailwind CSS | 4.x | 原子化样式 |
| ApexCharts / react-apexcharts | 最新 | 汇率趋势图表 |
| react-hook-form + zod | 最新 | 表单验证 |
| @hey-api/openapi-ts | 最新 | 自动生成 API 客户端 |
| react-helmet-async | 最新 | 页面元数据管理 |

### 1.2 路由结构

路由基于 TanStack Router 文件系统路由，`_layout` 为受保护布局路由（需登录）。

```
routes/
├── __root.tsx                    # 根路由（错误边界、全局 Provider）
├── login.tsx                     # 登录页（public）
├── signup.tsx                    # 注册页（public）
├── reset-password.tsx            # 密码重置（public）
├── recover-password.tsx          # 找回密码（public）
├── _layout.tsx                   # 受保护布局（Dashboard AppLayout）
├── _layout/
│   ├── index.tsx                 # 仪表盘首页（实时汇率概览）
│   ├── remittance.tsx            # 汇款操作页（发起汇款）
│   ├── history.tsx               # 交易历史页（不可变账本）
│   ├── compliance.tsx            # 合规审计页（仅 Auditor 角色）
│   ├── rates.tsx                 # 实时汇率监控页
│   └── settings.tsx              # 用户设置页
```

### 1.3 页面详细设计

#### 1.3.1 登录页 `/login`（public）

保留现有 JWT OAuth2 密码流认证逻辑：

- **表单字段**: Email（username）、Password
- **认证流程**:
  1. 提交表单 → `POST /api/v1/login/access-token`
  2. 后端返回 `{ access_token, token_type }`
  3. 前端存储 token 到 `localStorage`
  4. `OpenAPI.TOKEN` 异步读取 token 注入请求头
  5. 路由守卫 `isLoggedIn()` 检查 token 存在性
- **错误处理**: 401 → 清除 token → 重定向登录页
- **视觉效果**: 左侧品牌展示区（ForeXchange Logo + 标语），右侧登录表单

#### 1.3.2 仪表盘首页 `/`（protected）

核心页面，展示实时汇率和交易概览：

| 区域 | 内容 | 数据来源 |
|------|------|----------|
| **顶部统计卡片** | 活跃汇率对数量、今日交易笔数、总汇款金额 (USD)、合规警报数 | `GET /api/v1/dashboard/summary` |
| **实时汇率行情** | 主要货币对实时买入/卖出价、涨跌幅、迷你趋势图 | `GET /api/v1/rates/live?pairs=USD/EUR,USD/GBP,...`（5s 轮询） |
| **汇率走势图** | ApexCharts 蜡烛图/折线图，展示选定货币对 24h 走势 | `GET /api/v1/rates/history?pair=USD/EUR&interval=1m&range=24h` |
| **最近交易列表** | 最近 10 笔汇款，含状态标签（Pending/Completed/Flagged） | `GET /api/v1/transactions?limit=10` |
| **合规概览** | 仅 Auditor 可见，Flagged 交易占比、风险等级分布 | `GET /api/v1/compliance/overview` |

**实时更新机制**:
- `useQuery` + `refetchInterval: 5000` 实现 5 秒轮询汇率
- 后续可升级为 Server-Sent Events (SSE) 推送

#### 1.3.3 汇款操作页 `/remittance`（protected）

用户发起跨境汇款的核心页面：

```
┌──────────────────────────────────────────┐
│  New Remittance                          │
│                                          │
│  Source Currency:  [USD ▼]  Amount: [___]│
│  Target Currency:  [EUR ▼]               │
│                                          │
│  Exchange Rate:    1 USD = 0.92 EUR      │ ← 实时报价（锁定 30s）
│  Transfer Fee:     $5.00 (0.5%)          │ ← 自动计算
│  You'll Receive:   ≈ 913.10 EUR          │ ← 预估到账
│                                          │
│  Recipient Name:   [______________]      │
│  Recipient IBAN:   [______________]      │ ← 格式校验
│  Purpose:          [Family Support  ▼]   │
│                                          │
│  [Check Compliance]     [Submit Transfer]│
└──────────────────────────────────────────┘
```

- **实时汇率锁定**: 用户进入页面后锁定汇率（30 秒有效），调用 `POST /api/v1/rates/lock`
- **合规预检**: 提交前调用 `POST /api/v1/compliance/check` 模拟 AML 筛查
- **提交汇款**: `POST /api/v1/transactions` → 后端推入 Azure Queue 异步处理

#### 1.3.4 交易历史页 `/history`（protected）

不可变交易账本视图：

| 列 | 说明 |
|----|------|
| Transaction ID | 唯一交易编号 UUID |
| Date/Time | 创建时间 (UTC) |
| Source → Target | 货币对 + 金额 |
| Rate | 成交汇率 |
| Fee | 手续费 |
| Status | Pending / Processing / Completed / Flagged / Rejected |
| Compliance | Pass / Flagged（仅 Auditor 可见检查详情） |

- **分页**: `GET /api/v1/transactions?skip=0&limit=20`
- **筛选**: 按状态、日期范围、货币对筛选
- **详情弹窗**: 点击单笔交易查看完整汇款路径和合规检查结果

#### 1.3.5 合规审计页 `/compliance`（仅 Auditor 角色）

| 区域 | 内容 |
|------|------|
| **Flagged 交易列表** | 所有被标记的交易，按风险评分降序 |
| **风险详情面板** | 选中交易后展示：交易方信息、金额异常检测、IP/地理位置检查 |
| **审核操作** | [Approve] / [Reject] 按钮，调用 `POST /api/v1/compliance/review/{tx_id}` |
| **审计统计** | 今日审核量、通过率、平均处理时间 |

**路由守卫**: TanStack Router `beforeLoad` 检查 `user.is_auditor === true`，非 Auditor 重定向到首页。

#### 1.3.6 实时汇率监控页 `/rates`（protected）

- **多货币对实时行情表**: 类似外汇交易终端，绿色涨红色跌
- **深度图**: ApexCharts 面积图展示买卖盘深度（模拟数据）
- **汇率预警**: 用户可设置目标汇率，达到后 Web 通知（后续版本）

### 1.4 状态管理 & API 集成

#### React Query 缓存策略

| Query Key | 数据 | Stale Time | 轮询间隔 |
|-----------|------|-----------|---------|
| `["rates", "live"]` | 实时汇率 | 0s（始终新鲜） | 5s |
| `["rates", "history", pair]` | 历史走势 | 30s | - |
| `["transactions", filters]` | 交易列表 | 10s | - |
| `["dashboard", "summary"]` | 仪表盘汇总 | 10s | 15s |
| `["user", "me"]` | 当前用户信息 | 5min | - |
| `["compliance", "overview"]` | 合规概览 | 10s | 15s |

#### API 客户端

```typescript
// frontend/src/main.tsx
OpenAPI.BASE = import.meta.env.VITE_API_URL  // 生产环境为空（同源 nginx 代理）
OpenAPI.TOKEN = async () => localStorage.getItem("access_token") || ""
```

#### 角色权限控制

```typescript
// frontend/src/hooks/useAuth.ts
const { data: user } = useQuery({
  queryKey: ["user", "me"],
  queryFn: UsersService.readUserMe,
  enabled: isLoggedIn(),
})

// 角色判断
const isAuditor = user?.role === "auditor"
const isCustomer = user?.role === "customer"
```

### 1.5 组件树

```
<App>
  <HelmetProvider>
    <ThemeProvider>
      <QueryClientProvider>
        <RouterProvider>
          <RootRoute>
            ├── <LoginPage />          (/login)
            ├── <SignupPage />         (/signup)
            ├── <ResetPasswordPage />  (/reset-password)
            ├── <RecoverPasswordPage /> (/recover-password)
            └── <AppLayout>            (/_layout - protected)
                ├── <AppSidebar />
                ├── <AppHeader />
                └── <Outlet>
                    ├── <DashboardHome />   (/)
                    ├── <RemittancePage />  (/remittance)
                    ├── <HistoryPage />     (/history)
                    ├── <CompliancePage />  (/compliance)
                    ├── <RatesPage />       (/rates)
                    └── <SettingsPage />    (/settings)
```

### 1.6 核心前端文件清单

```
frontend/src/
├── main.tsx                          # 入口（QueryClient, Router, Helmet）
├── index.css                         # 全局样式（Dashboard 主题 + shadcn/ui 变量）
├── routeTree.gen.ts                  # 自动生成的路由树
├── client/                           # 自动生成的 API SDK（@hey-api/openapi-ts）
│   ├── index.ts
│   ├── sdk.gen.ts                    # Services: LoginService, RatesService, TransactionsService...
│   ├── types.gen.ts                  # DTO 类型
│   └── core/
├── routes/
│   ├── __root.tsx                    # 根路由（ErrorBoundary, 全局 Provider）
│   ├── login.tsx                     # 登录页
│   ├── signup.tsx                    # 注册页
│   ├── _layout.tsx                   # 受保护布局（beforeLoad 鉴权）
│   └── _layout/
│       ├── index.tsx                 # 仪表盘首页
│       ├── remittance.tsx            # 汇款操作
│       ├── history.tsx               # 交易历史
│       ├── compliance.tsx            # 合规审计
│       ├── rates.tsx                 # 实时汇率
│       └── settings.tsx              # 用户设置
├── hooks/
│   ├── useAuth.ts                    # 认证 Hook（login/logout/signup/user）
│   └── useForexRates.ts              # 汇率轮询 Hook
├── components/
│   ├── forex/
│   │   ├── RateCard.tsx              # 单汇率卡片
│   │   ├── RateTicker.tsx            # 汇率滚动条
│   │   ├── RateChart.tsx             # 汇率走势图（ApexCharts）
│   │   ├── TransactionTable.tsx      # 交易列表表格
│   │   ├── ComplianceBadge.tsx       # 合规状态标签
│   │   ├── RemittanceForm.tsx        # 汇款表单
│   │   └── CurrencySelector.tsx      # 货币对选择器
│   ├── Common/                       # 通用组件（来自 Dashboard 模板）
│   ├── auth/                         # 认证表单组件
│   └── ui/                           # shadcn/ui 基础组件
```

---

## Part 2: 后端详细设计

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 后端语言 |
| FastAPI | 最新 | Web 框架 |
| SQLModel / SQLAlchemy | 最新 | ORM + 数据验证 |
| Alembic | 最新 | 数据库迁移 |
| PostgreSQL | 16+ | 主数据库 |
| Azure Queue Storage | - | 异步汇款处理队列 |
| python-jose | 最新 | JWT 令牌签发与验证 |
| passlib + bcrypt | 最新 | 密码哈希 |
| Pydantic | v2 | 数据序列化与验证 |

### 2.2 数据库 Schema

#### 2.2.1 现有表（保留）

```sql
-- users 表（扩展角色字段）
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    full_name VARCHAR,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    role VARCHAR DEFAULT 'customer',  -- 新增: 'customer' | 'auditor'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.2 新增核心表

```sql
-- 货币对表
CREATE TABLE currency_pair (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency CHAR(3) NOT NULL,    -- e.g. 'USD'
    quote_currency CHAR(3) NOT NULL,   -- e.g. 'EUR'
    symbol VARCHAR(10) GENERATED ALWAYS AS (base_currency || '/' || quote_currency) STORED,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_currency, quote_currency)
);

-- 汇率快照表（时序数据）
CREATE TABLE rate_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id UUID NOT NULL REFERENCES currency_pair(id),
    bid DECIMAL(12,6) NOT NULL,        -- 买入价
    ask DECIMAL(12,6) NOT NULL,        -- 卖出价
    mid DECIMAL(12,6) NOT NULL,        -- 中间价
    source VARCHAR(20) DEFAULT 'SIMULATED',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rate_snapshot_pair_time ON rate_snapshot(pair_id, timestamp DESC);

-- 交易（汇款）表
CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id),
    pair_id UUID NOT NULL REFERENCES currency_pair(id),
    
    -- 汇款详情
    source_amount DECIMAL(14,2) NOT NULL,
    target_amount DECIMAL(14,2),
    locked_rate DECIMAL(12,6) NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- 收款方信息
    recipient_name VARCHAR(255) NOT NULL,
    recipient_iban VARCHAR(34) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'personal',
    
    -- 状态与合规
    status VARCHAR(20) DEFAULT 'pending',     -- pending / processing / completed / flagged / rejected
    compliance_status VARCHAR(20),            -- pass / flagged / failed
    compliance_score INTEGER,                 -- 0-100 风险评分
    compliance_details JSONB,                 -- 详细检查结果
    
    -- 审计
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_transaction_user ON transaction(user_id, created_at DESC);
CREATE INDEX idx_transaction_status ON transaction(status);

-- 合规审计日志表
CREATE TABLE compliance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transaction(id),
    auditor_id UUID REFERENCES "user"(id),
    action VARCHAR(20) NOT NULL,              -- flagged / approved / rejected
    reason TEXT,
    risk_score INTEGER,
    check_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.3 SQLModel 定义（Python）

```python
# backend/app/models.py

from enum import Enum as PyEnum
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4

class UserRole(str, PyEnum):
    CUSTOMER = "customer"
    AUDITOR = "auditor"

class User(SQLModel, table=True):
    __tablename__ = "user"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: str | None = None
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    role: UserRole = Field(default=UserRole.CUSTOMER)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CurrencyPair(SQLModel, table=True):
    __tablename__ = "currency_pair"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    base_currency: str = Field(max_length=3)
    quote_currency: str = Field(max_length=3)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TransactionStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FLAGGED = "flagged"
    REJECTED = "rejected"

class ComplianceStatus(str, PyEnum):
    PASS = "pass"
    FLAGGED = "flagged"
    FAILED = "failed"

class Transaction(SQLModel, table=True):
    __tablename__ = "transaction"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    pair_id: UUID = Field(foreign_key="currency_pair.id")
    source_amount: Decimal
    target_amount: Decimal | None = None
    locked_rate: Decimal
    fee_amount: Decimal = 0
    fee_percentage: Decimal = 0
    recipient_name: str = Field(max_length=255)
    recipient_iban: str = Field(max_length=34)
    purpose: str = "personal"
    status: TransactionStatus = TransactionStatus.PENDING
    compliance_status: ComplianceStatus | None = None
    compliance_score: int | None = None
    compliance_details: dict | None = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
```

### 2.3 API 端点设计

#### 2.3.1 认证模块（保留现有）

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/login/access-token` | No | OAuth2 密码流登录，返回 JWT |
| POST | `/api/v1/users/register` | No | 用户注册 |
| GET | `/api/v1/users/me` | Yes | 获取当前用户信息（含 role） |
| PATCH | `/api/v1/users/me` | Yes | 更新当前用户信息 |
| POST | `/api/v1/password-recovery/{email}` | No | 发送密码重置邮件 |
| POST | `/api/v1/reset-password` | No | 重置密码 |

#### 2.3.2 汇率模块

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/rates/live` | Yes | 获取所有活跃货币对实时汇率 |
| GET | `/api/v1/rates/live/{pair}` | Yes | 获取指定货币对实时汇率 |
| GET | `/api/v1/rates/history/{pair}` | Yes | 获取指定货币对历史趋势（支持 interval） |
| POST | `/api/v1/rates/lock` | Yes | 锁定当前汇率报价（返回有效期 30s 的报价） |

**GET `/api/v1/rates/live` 响应示例**:
```json
{
  "data": [
    {
      "pair": "USD/EUR",
      "bid": 0.9215,
      "ask": 0.9220,
      "mid": 0.92175,
      "change_pct": 0.15,
      "timestamp": "2026-06-06T10:30:00Z"
    },
    {
      "pair": "USD/GBP",
      "bid": 0.7910,
      "ask": 0.7918,
      "mid": 0.7914,
      "change_pct": -0.08,
      "timestamp": "2026-06-06T10:30:00Z"
    }
  ]
}
```

#### 2.3.3 交易模块

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/transactions` | Yes | 创建汇款交易（推入 Azure Queue） |
| GET | `/api/v1/transactions` | Yes | 分页查询当前用户的交易列表 |
| GET | `/api/v1/transactions/{id}` | Yes | 获取单笔交易详情 |
| GET | `/api/v1/transactions/{id}/status` | Yes | 轮询交易处理状态 |

**POST `/api/v1/transactions` 请求体**:
```json
{
  "pair": "USD/EUR",
  "source_amount": 1000.00,
  "locked_rate_id": "uuid-of-rate-lock",
  "recipient_name": "Jean Dupont",
  "recipient_iban": "FR7630001007941234567890185",
  "purpose": "family_support"
}
```

**处理流程**:
1. 校验 IBAN 格式（正则 + 模校验）
2. 校验锁定的汇率是否仍有效（30s 窗口）
3. 执行合规预检（`compliance_check` 函数）
4. 创建 Transaction 记录（status=pending）
5. 将交易 ID 推入 Azure Queue `remittance-queue`
6. 返回 `{ transaction_id, status: "pending" }`

#### 2.3.4 合规模块（仅 Auditor）

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/api/v1/compliance/overview` | Yes | Auditor | 合规统计数据 |
| GET | `/api/v1/compliance/flagged` | Yes | Auditor | 所有 Flagged 交易列表 |
| GET | `/api/v1/compliance/{tx_id}` | Yes | Auditor | 单笔交易合规详情 |
| POST | `/api/v1/compliance/review/{tx_id}` | Yes | Auditor | 审核交易（approve/reject） |

#### 2.3.5 仪表盘模块

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/dashboard/summary` | Yes | 仪表盘聚合数据 |

**GET `/api/v1/dashboard/summary` 响应**:
```json
{
  "active_pairs": 12,
  "today_transactions": 47,
  "total_volume_usd": 284500.50,
  "flagged_count": 3,
  "avg_processing_time_ms": 1200
}
```

### 2.4 Azure Queue 集成

#### 2.4.1 架构

```
                    ┌──────────────────┐
                    │  Azure Queue      │
                    │  remittance-queue │
                    └──────┬───────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ Message 1  │  │ Message 2  │  │ Message 3  │
    │ tx_id=...  │  │ tx_id=...  │  │ tx_id=...  │
    └────────────┘  └────────────┘  └────────────┘
```

- **生产者**: FastAPI `POST /api/v1/transactions` 端点
- **消费者**: FastAPI 后台 `BackgroundTasks` 或独立的 `QueueProcessor`
- **消息格式**:
```json
{
  "transaction_id": "uuid",
  "created_at": "2026-06-06T10:30:00Z",
  "retry_count": 0
}
```

#### 2.4.2 消费者处理逻辑

```python
# backend/app/queue_processor.py

async def process_remittance(message: dict):
    tx_id = message["transaction_id"]
    tx = await get_transaction(tx_id)
    
    # Step 1: 标记为处理中
    tx.status = TransactionStatus.PROCESSING
    await save(tx)
    
    # Step 2: 模拟 AML 合规检查（可配置的延迟）
    await asyncio.sleep(random.uniform(0.5, 2.0))
    risk_score = run_compliance_rules(tx)
    
    # Step 3: 判定结果
    if risk_score >= 80:
        tx.status = TransactionStatus.FLAGGED
        tx.compliance_status = ComplianceStatus.FLAGGED
        await create_compliance_log(tx, risk_score)
    elif risk_score >= 50:
        tx.status = TransactionStatus.COMPLETED
        tx.compliance_status = ComplianceStatus.PASS
        tx.target_amount = calculate_target(tx.source_amount, tx.locked_rate, tx.fee_amount)
    else:
        tx.status = TransactionStatus.COMPLETED
        tx.compliance_status = ComplianceStatus.PASS
        tx.target_amount = calculate_target(...)
    
    tx.compliance_score = risk_score
    tx.completed_at = datetime.utcnow()
    await save(tx)
```

#### 2.4.3 合规规则引擎（模拟）

```python
def run_compliance_rules(tx: Transaction) -> int:
    """返回 0-100 风险评分"""
    score = 0
    rules = []
    
    # 规则1: 大额交易检测 (> $10,000)
    if tx.source_amount > 10000:
        score += 30
        rules.append({"rule": "LARGE_AMOUNT", "detail": f"${tx.source_amount}"})
    
    # 规则2: 高频交易检测（同一用户 1 小时内 > 5 笔）
    recent_count = count_recent_transactions(tx.user_id, hours=1)
    if recent_count > 5:
        score += 25
        rules.append({"rule": "HIGH_FREQUENCY", "detail": f"{recent_count} tx/hour"})
    
    # 规则3: 高风险国家检测（模拟）
    high_risk_countries = ["XX", "YY"]
    if tx.recipient_iban[:2] in high_risk_countries:
        score += 35
        rules.append({"rule": "HIGH_RISK_COUNTRY"})
    
    # 规则4: 结构模式检测（模拟）
    if is_structuring_pattern(tx.user_id, tx.source_amount):
        score += 40
        rules.append({"rule": "STRUCTURING"})
    
    tx.compliance_details = {
        "rules_triggered": rules,
        "total_score": score,
        "threshold": 80
    }
    return min(score, 100)
```

### 2.5 后端文件结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI 应用入口
│   ├── models.py                        # SQLModel 定义
│   ├── crud.py                          # CRUD 操作
│   ├── utils.py                         # 工具函数
│   ├── core/
│   │   ├── config.py                    # Settings (Pydantic BaseSettings)
│   │   ├── db.py                        # 数据库引擎
│   │   └── security.py                  # JWT + 密码哈希
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                      # 依赖注入 (get_current_user, get_db)
│   │   ├── main.py                      # APIRouter 汇总
│   │   └── routes/
│   │       ├── login.py                 # 认证路由（保留）
│   │       ├── users.py                 # 用户路由（保留）
│   │       ├── rates.py                 # 汇率路由（新增）
│   │       ├── transactions.py          # 交易/汇款路由（新增）
│   │       ├── compliance.py            # 合规审计路由（新增）
│   │       └── dashboard.py             # 仪表盘路由（新增）
│   ├── services/
│   │   ├── forex_simulator.py           # 汇率模拟器（生成随机汇率数据）
│   │   ├── queue_processor.py           # Azure Queue 消费者
│   │   ├── compliance_engine.py         # AML 合规规则引擎
│   │   └── rate_locker.py               # 汇率锁定服务
│   └── alembic/                         # 数据库迁移脚本
├── scripts/
│   ├── prestart.sh                      # 启动前脚本（迁移 + 初始化数据）
│   └── seed_forex.py                    # 种子数据：货币对 + 初始汇率
├── Dockerfile
├── pyproject.toml
└── alembic.ini
```

### 2.6 汇率模拟器

```python
# backend/app/services/forex_simulator.py

class ForexSimulator:
    """
    模拟实时汇率生成器。
    生产环境中，此数据来自外部 FX 数据源或 Azure Queue 消息模拟。
    """
    
    BASE_RATES = {
        ("USD", "EUR"): 0.9200,
        ("USD", "GBP"): 0.7900,
        ("USD", "JPY"): 150.50,
        ("USD", "CNY"): 7.2500,
        ("USD", "CHF"): 0.8900,
        ("USD", "AUD"): 1.5300,
        ("USD", "CAD"): 1.3600,
        ("EUR", "GBP"): 0.8587,
        ("EUR", "JPY"): 163.59,
        ("EUR", "CHF"): 0.9674,
        ("GBP", "JPY"): 190.51,
        ("AUD", "USD"): 0.6536,
    }
    
    async def generate_tick(self) -> list[RateSnapshot]:
        """生成一轮汇率快照"""
        snapshots = []
        for pair in await get_active_pairs():
            base = self.BASE_RATES.get((pair.base_currency, pair.quote_currency), 1.0)
            # 随机波动 ±0.5%
            noise = random.gauss(0, 0.002)
            mid = base * (1 + noise)
            spread = mid * 0.0003  # 3 pips spread
            snapshot = RateSnapshot(
                pair_id=pair.id,
                bid=round(mid - spread / 2, 6),
                ask=round(mid + spread / 2, 6),
                mid=round(mid, 6),
                source="SIMULATED",
            )
            snapshots.append(snapshot)
        return snapshots
```

---

## Part 3: 部署与 IaC 详细设计

### 3.1 架构拓扑

```
                          Internet
                             │
                    ┌────────┴────────┐
                    │   HTTPS :443    │
                    │  (ACA 自动 TLS)  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │      Azure Container Apps    │
              │                              │
              │  ┌──────────────────────┐   │
              │  │  frontend (React)     │   │
              │  │  CPU: 0.5 / Mem: 1Gi │   │
              │  │  Port: 80            │   │
              │  │  Ingress: External   │   │
              │  └──────────┬───────────┘   │
              │             │ /api/*        │
              │             │ (ACA 内网)     │
              │  ┌──────────┴───────────┐   │
              │  │  backend (FastAPI)   │   │
              │  │  CPU: 1.0 / Mem: 2Gi │   │
              │  │  Port: 8000          │   │
              │  │  Ingress: Internal   │   │
              │  └────┬───────────┬─────┘   │
              └───────┼───────────┼─────────┘
                      │           │
            ┌─────────┴──┐   ┌───┴──────────┐
            │  Azure     │   │  Azure         │
            │  Queue     │   │  PostgreSQL    │
            │  Storage   │   │  Flexible      │
            │ (异步消息)  │   │  Server        │
            └────────────┘   └───────────────┘
```

### 3.2 容器镜像

#### Dockerfile（后端）

```dockerfile
# backend/Dockerfile（保留现有）
FROM python:3.10
ENV PYTHONUNBUFFERED=1
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
WORKDIR /app/
ENV PATH="/app/.venv/bin:$PATH"
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-workspace --package app
COPY ./backend/scripts /app/backend/scripts
COPY ./backend/pyproject.toml ./backend/alembic.ini /app/backend/
COPY ./backend/app /app/backend/app
WORKDIR /app/backend/
CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
```

#### Dockerfile（前端）

```dockerfile
# frontend/Dockerfile（保留现有）
FROM oven/bun:1 AS build-stage
WORKDIR /app
COPY package.json bun.lock /app/
COPY frontend/package.json /app/frontend/
WORKDIR /app/frontend
RUN bun install
COPY ./frontend /app/frontend
ARG VITE_API_URL
RUN bun run build

FROM nginx:1
COPY --from=build-stage /app/frontend/dist/ /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./frontend/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
```

#### Nginx 配置（前端代理 /api → backend）

```nginx
# frontend/nginx-backend-not-found.conf
resolver 127.0.0.11 ipv6=off;

location /api {
    set $backend http://backend:8000;
    proxy_pass $backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### Docker Hub 发布

```bash
# 构建并推送后端
docker build -t <dockerhub-username>/forexchange-backend:latest -f backend/Dockerfile .
docker push <dockerhub-username>/forexchange-backend:latest

# 构建并推送前端
docker build -t <dockerhub-username>/forexchange-frontend:latest \
  --build-arg VITE_API_URL= \
  -f frontend/Dockerfile .
docker push <dockerhub-username>/forexchange-frontend:latest
```

### 3.3 Terraform 全量配置

#### 3.3.1 目录结构

```
terraform/
├── main.tf              # Provider + Resource Group
├── variables.tf         # 所有变量定义
├── terraform.tfvars     # 变量值（不提交 Git）
├── outputs.tf           # 输出（URL、连接串）
├── postgresql.tf        # Azure PostgreSQL Flexible Server
├── containerapps.tf     # Azure Container Apps + Environment
├── queue.tf             # Azure Queue Storage
└── keyvault.tf          # Azure Key Vault（存储机密）
```

#### 3.3.2 main.tf

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-forexchange-${var.environment}"
  location = var.location
}
```

#### 3.3.3 variables.tf

```hcl
variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  default     = "prod"
}

variable "dockerhub_username" {
  description = "Docker Hub username for container images"
  type        = string
}

variable "postgres_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "app_secret_key" {
  description = "FastAPI SECRET_KEY for JWT signing"
  type        = string
  sensitive   = true
}

variable "first_superuser_email" {
  description = "Initial superuser email"
  type        = string
  default     = "admin@forexchange.io"
}

variable "first_superuser_password" {
  description = "Initial superuser password"
  type        = string
  sensitive   = true
}
```

#### 3.3.4 terraform.tfvars（模板）

```hcl
# terraform.tfvars — 不提交到 Git
subscription_id        = "00000000-0000-0000-0000-000000000000"
location               = "eastus"
environment            = "prod"
dockerhub_username     = "your-dockerhub-username"
postgres_admin_password = "YourStr0ngP@ssw0rd!"
app_secret_key         = "change-this-to-a-random-64-char-string"
first_superuser_email  = "admin@forexchange.io"
first_superuser_password = "ChangeThisAdminP@ss!"
```

#### 3.3.5 postgresql.tf

```hcl
resource "azurerm_postgresql_flexible_server" "db" {
  name                = "psql-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  version                   = "16"
  administrator_login      = "psqladmin"
  administrator_password    = var.postgres_admin_password
  storage_mb               = 32768   # 32 GB
  sku_name                 = "B_Standard_B1ms"  # Burstable, 1 vCore, 2 GB RAM

  backup_retention_days = 7
  zone                 = "1"

  # 公网访问 + 防火墙白名单
  public_network_access_enabled = true

  high_availability {
    mode = "Disabled"
  }
}

# 防火墙规则：仅允许 Azure 服务访问
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"  # Azure 内部 IP 范围由服务端点控制
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "forexchange"
  server_id = azurerm_postgresql_flexible_server.db.id
}

# SSL 强制
resource "azurerm_postgresql_flexible_server_configuration" "ssl" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "on"
}
```

#### 3.3.6 containerapps.tf

```hcl
# Log Analytics Workspace（ACA 必需）
resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                = "cae-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id
}

# 后端 Container App（内部访问）
resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.environment}"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "docker.io/${var.dockerhub_username}/forexchange-backend:latest"
      cpu    = 1.0
      memory = "2Gi"

      env {
        name  = "POSTGRES_SERVER"
        value = azurerm_postgresql_flexible_server.db.fqdn
      }
      env {
        name  = "POSTGRES_PORT"
        value = "5432"
      }
      env {
        name  = "POSTGRES_DB"
        value = "forexchange"
      }
      env {
        name  = "POSTGRES_USER"
        value = "psqladmin"
      }
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "FRONTEND_HOST"
        value = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
      }
      env {
        name  = "BACKEND_CORS_ORIGINS"
        value = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
      }

      # 机密环境变量（从 Key Vault 读取）
      env {
        name        = "POSTGRES_PASSWORD"
        secret_name = "postgres-password"
        value       = var.postgres_admin_password
      }
      env {
        name        = "SECRET_KEY"
        secret_name = "app-secret-key"
        value       = var.app_secret_key
      }
      env {
        name        = "FIRST_SUPERUSER_PASSWORD"
        secret_name = "first-superuser-password"
        value       = var.first_superuser_password
      }
      env {
        name        = "AZURE_QUEUE_CONNECTION_STRING"
        secret_name = "queue-connection-string"
        value       = azurerm_storage_account.queue.primary_connection_string
      }
    }
  }

  ingress {
    external_enabled = false   # 仅内网访问，由前端代理
    target_port      = 8000
    transport        = "http"
  }
}

# 前端 Container App（外部访问）
resource "azurerm_container_app" "frontend" {
  name                         = "ca-frontend-${var.environment}"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  template {
    container {
      name   = "frontend"
      image  = "docker.io/${var.dockerhub_username}/forexchange-frontend:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "VITE_API_URL"
        value = ""  # 空值 → 通过 Nginx /api 代理到 backend:8000（ACA 内网）
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    # ACA 自动提供 HTTPS（免费 *.azurecontainerapps.io 域名 + 自动 TLS）
  }

  # 注册服务发现名称，使前端可通过 "backend" 主机名访问后端
  registry {
    server   = "docker.io"
    username = var.dockerhub_username
  }
}
```

#### 3.3.7 queue.tf

```hcl
resource "azurerm_storage_account" "queue" {
  name                     = "stfxqueue${var.environment}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location

  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_queue" "remittance" {
  name                 = "remittance-queue"
  storage_account_name = azurerm_storage_account.queue.name
}
```

#### 3.3.8 keyvault.tf

```hcl
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                = "kv-fx-${var.environment}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tenant_id           = data.azurerm_client_config.current.tenant_id

  sku_name = "standard"
}

resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "azurerm_key_vault_secret" "postgres_password" {
  name         = "postgres-password"
  key_vault_id = azurerm_key_vault.kv.id
  value        = var.postgres_admin_password
}

resource "azurerm_key_vault_secret" "app_secret_key" {
  name         = "app-secret-key"
  key_vault_id = azurerm_key_vault.kv.id
  value        = var.app_secret_key
}

resource "azurerm_key_vault_secret" "queue_connection_string" {
  name         = "queue-connection-string"
  key_vault_id = azurerm_key_vault.kv.id
  value        = azurerm_storage_account.queue.primary_connection_string
}
```

#### 3.3.9 outputs.tf

```hcl
output "frontend_url" {
  description = "Frontend application URL"
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
}

output "backend_fqdn" {
  description = "Backend internal FQDN"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "postgresql_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.db.fqdn
}

output "queue_name" {
  description = "Azure Queue name"
  value       = azurerm_storage_queue.remittance.name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.kv.vault_uri
}
```

### 3.4 部署流程

```bash
# === 第一步：构建并推送容器镜像 ===

# 登录 Docker Hub
docker login

# 构建后端
docker build -t <your-dockerhub>/forexchange-backend:latest -f backend/Dockerfile .
docker push <your-dockerhub>/forexchange-backend:latest

# 构建前端（VITE_API_URL 为空，走 Nginx /api 代理）
docker build -t <your-dockerhub>/forexchange-frontend:latest \
  --build-arg VITE_API_URL= \
  --build-arg NODE_ENV=production \
  -f frontend/Dockerfile .
docker push <your-dockerhub>/forexchange-frontend:latest

# === 第二步：Terraform 部署 ===

cd terraform

# 编辑 terraform.tfvars 填入实际值
# 初始化
terraform init

# 预览变更
terraform plan

# 部署全栈
terraform apply -auto-approve

# === 第三步：验证 ===

# Terraform 输出前端 URL
terraform output frontend_url

# 打开浏览器访问输出 URL
# 用 admin@forexchange.io / 设定的密码登录

# === 第四步：销毁（如需要）===

terraform destroy -auto-approve
```

### 3.5 成本估算（Azure 即用即付）

| 资源 | SKU | 月费估算 (USD) |
|------|-----|---------------|
| PostgreSQL Flexible Server | B_Standard_B1ms, 32GB | ~$30 |
| Container Apps Environment | 按 vCPU/内存/秒计费 | ~$25 |
| Frontend Container App | 0.5 vCPU / 1 GiB | 计入环境 |
| Backend Container App | 1.0 vCPU / 2 GiB | 计入环境 |
| Queue Storage | Standard LRS | ~$1 |
| Key Vault | Standard | ~$1 |
| Log Analytics | Per GB | ~$5 |
| **合计** | | **~$62/月** |

---

## 附录

### A. 环境变量汇总

#### 后端

| 变量 | 说明 | 示例 |
|------|------|------|
| `POSTGRES_SERVER` | PostgreSQL FQDN | `psql-forexchange-prod.postgres.database.azure.com` |
| `POSTGRES_PORT` | PostgreSQL 端口 | `5432` |
| `POSTGRES_DB` | 数据库名 | `forexchange` |
| `POSTGRES_USER` | 数据库用户 | `psqladmin` |
| `POSTGRES_PASSWORD` | 数据库密码 | (机密) |
| `SECRET_KEY` | JWT 签名密钥 | `随机 64 位字符串` |
| `FIRST_SUPERUSER` | 初始超管 Email | `admin@forexchange.io` |
| `FIRST_SUPERUSER_PASSWORD` | 初始超管密码 | (机密) |
| `ENVIRONMENT` | 环境标识 | `production` |
| `FRONTEND_HOST` | 前端 URL（CORS 用） | `https://ca-frontend-prod.xxx.azurecontainerapps.io` |
| `BACKEND_CORS_ORIGINS` | CORS 允许的源 | 同上 |
| `AZURE_QUEUE_CONNECTION_STRING` | Queue Storage 连接串 | (机密) |

#### 前端

| 变量 | 说明 | 示例 |
|------|------|------|
| `VITE_API_URL` | API 基地址 | 生产环境为空字符串（走 Nginx 代理） |

### B. 后续迭代建议

- **Phase 2**: WebSocket/SSE 推送替代轮询实现真正的实时汇率
- **Phase 3**: 集成真实 FX 数据源 API（如 ExchangeRate-API、Alpha Vantage）
- **Phase 4**: 增加 CI/CD Pipeline（GitHub Actions → Docker Hub → ACA 自动更新）
- **Phase 5**: 添加 Azure Application Insights 实现分布式追踪
