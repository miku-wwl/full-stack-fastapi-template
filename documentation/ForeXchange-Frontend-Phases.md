# ForeXchange — 10-Day Frontend Development Plan

> **Date**: 2026-06-06
> **Project**: ForeXchange — Real-Time Remittance & Compliance Monitoring Platform
> **Language**: English (original Chinese version below)

---

## Schedule Overview

| Phase | Day | Core Module | Key Deliverables |
|-------|-----|-------------|------------------|
| 1 | 1 | Route Scaffold | All page routes, guarded layout, auth check |
| 2 | 2 | Auth UI | Login/Signup forms, useAuth hook, token management |
| 3 | 3 | Layout & Nav | Sidebar, header, role-based menu |
| 4 | 4 | Dashboard | Stat cards, recent transactions list |
| 5 | 5 | Live Rates | Rate cards, 5s polling display |
| 6 | 6 | Rate Charts | ApexCharts integration, 24h history |
| 7 | 7 | Remittance | Remittance form, rate lock UI, validation |
| 8 | 8 | History | Transaction table, pagination, detail modal |
| 9 | 9 | Compliance | Audit overview, flagged list, review actions |
| 10 | 10 | Polish | Error handling, responsive tweaks, final QA |

---

## Detailed Phase Plan

### Phase 1: Route Scaffold

**Goal**: All frontend routes accessible, protected routes redirect to login.

**Tasks:**
1. Initialise React + TypeScript + TanStack Router project
2. Create all page route files (including protected layout `_layout.tsx`)
3. Configure route guard — unauthorised redirect to login
4. Run `npm run generate-client` to generate initial API SDK

### Phase 2: Auth UI

**Goal**: Login and registration with full validation.

**Tasks:**
1. Build login/signup pages with shared auth layout
2. Implement `useAuth` hook for login, signup, logout
3. Configure JWT token auto-injection into request headers
4. Implement token persistence (localStorage)

### Phase 3: Layout & Navigation

**Goal**: Sidebar navigation with role-based menu items.

**Tasks:**
1. Implement AppSidebar with ForeXchange menu items
2. Add role check — Auditor sees "Compliance Audit" menu
3. Update AppHeader with user role badge
4. Set correct `<title>` for all pages

### Phase 4: Dashboard

**Goal**: Homepage with statistics cards and recent transactions.

**Tasks:**
1. Create `StatCard` reusable component
2. Create `RecentTransactions` component
3. Integrate both into dashboard homepage

### Phase 5: Live Rates

**Goal**: Real-time rate display with auto-refresh.

**Tasks:**
1. Implement `useForexRates` hook with 5s polling
2. Display rate cards for all 12 currency pairs
3. Show bid/ask/mid/spread/change percentage

### Phase 6: Rate Charts

**Goal**: Interactive exchange rate charts.

**Tasks:**
1. Integrate ApexCharts library
2. Create line chart for 24-hour rate history
3. Add pair selector for switching currencies

### Phase 7: Remittance

**Goal**: Complete remittance form with rate locking.

**Tasks:**
1. Build remittance form with all fields
2. Implement rate lock UI with countdown timer
3. Add IBAN validation feedback
4. Show confirmation after submission

### Phase 8: History

**Goal**: Transaction history with search and filtering.

**Tasks:**
1. Create transaction table component
2. Implement pagination controls
3. Add status filter dropdown
4. Create transaction detail modal

### Phase 9: Compliance

**Goal**: Auditor compliance dashboard.

**Tasks:**
1. Build compliance overview cards
2. Create flagged transactions list
3. Implement approve/reject buttons with confirmation
4. Display compliance details per transaction

### Phase 10: Polish

**Goal**: Final polish and quality assurance.

**Tasks:**
1. Add error boundaries to all pages
2. Implement loading states (skeleton loaders)
3. Responsive design fixes
4. Dark mode consistency check
5. Final QA and bug fixes

---

# ForeXchange — 前端分期开发与验证方案

> 配套文档：[ForeXchange-Design.md](./ForeXchange-Design.md)  
> 工期：10 期，每期 1-2 天，总计约 2-3 周  
> 原则：**每期独立可验证**，前后端接口对齐，验收标准明确

---

## 工期总览

```
Phase 1  ████ 路由骨架 + 环境打通
Phase 2  ████ 认证流程（登录/注册/JWT）
Phase 3  ████ 布局导航 + 角色菜单
Phase 4  ████ 仪表盘首页（统计卡片 + 概览）
Phase 5  ████ 实时汇率行情（轮询 + 行情卡片）
Phase 6  ████ 汇率走势图（ApexCharts 图表）
Phase 7  ████ 汇款表单（货币选择 + 汇率锁定）
Phase 8  ████ 交易历史（分页表格 + 详情弹窗）
Phase 9  ████ 合规审计（Auditor 专属 + 审核操作）
Phase 10 ████ 打磨上线（错误处理 + 加载态 + 联调）
```

---

## Phase 1: 路由骨架 + 环境打通

**目标**：所有页面路由可访问，前后端网络连通，自动生成的 API 客户端就绪。

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout.tsx` | 修改 | 将 `beforeLoad` 鉴权 + Dashboard AppLayout 作为受保护布局 |
| `frontend/src/routes/_layout/index.tsx` | 修改 | 仪表盘首页占位组件 |
| `frontend/src/routes/_layout/remittance.tsx` | 新建 | 汇款页占位 |
| `frontend/src/routes/_layout/history.tsx` | 新建 | 交易历史页占位 |
| `frontend/src/routes/_layout/compliance.tsx` | 新建 | 合规审计页占位 |
| `frontend/src/routes/_layout/rates.tsx` | 新建 | 实时汇率页占位 |
| `frontend/src/routes/_layout/settings.tsx` | 保留 | 用户设置页（已有） |
| `frontend/src/routes/login.tsx` | 保留 | 登录页（已有认证逻辑） |
| `frontend/src/routes/signup.tsx` | 保留 | 注册页（已有认证逻辑） |
| `frontend/src/routeTree.gen.ts` | 自动生成 | `vite build` 或 `vite dev` 自动更新 |
| `frontend/src/client/` | 重新生成 | 运行 `npm run generate-client` 拉取最新后端 OpenAPI |

### 验证方案

```bash
# 1. 启动全栈
docker compose up -d --build

# 2. 验证路由（未登录应重定向到 /login）
curl http://localhost:5173/              # → 302 /login
curl http://localhost:5173/remittance    # → 302 /login
curl http://localhost:5173/history       # → 302 /login
curl http://localhost:5173/compliance    # → 302 /login
curl http://localhost:5173/rates         # → 302 /login
curl http://localhost:5173/settings      # → 302 /login

# 3. 验证后端健康
curl http://localhost:8000/api/v1/utils/health-check/
# → {"message": "Hello World"}

# 4. 验证 API 文档可访问
curl http://localhost:8000/docs          # → Swagger UI
curl http://localhost:8000/api/v1/openapi.json  # → OpenAPI schema

# 5. 浏览器验证
# 打开 http://localhost:5173 → 重定向到 /login（登录页正常渲染）
# 登录后 → 跳转到 /（仪表盘占位内容正常渲染）
```

### 验收标准

- [ ] 所有 6 个受保护路由在未登录时自动重定向到 `/login`
- [ ] 登录后所有路由可正常访问（显示占位内容）
- [ ] `npm run generate-client` 成功生成包含 `RatesService`, `TransactionsService` 的 SDK
- [ ] 浏览器 Console 无报错

---

## Phase 2: 认证流程（登录/注册/JWT）

**目标**：完成登录/注册 UI 改造，JWT 令牌流转通畅，角色字段写入数据库。

### 后端配合（后端需先完成）

| 接口 | 说明 |
|------|------|
| `POST /api/v1/login/access-token` | 已有，需在响应中增加 `role` 字段 |
| `POST /api/v1/users/register` | 已有，需支持 `role` 参数（默认 `customer`） |
| `GET /api/v1/users/me` | 已有，需返回 `role` 字段 |
| Alembic 迁移 | `user` 表增加 `role VARCHAR DEFAULT 'customer'` |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/login.tsx` | 修改 | 使用 Dashboard 的 `AuthPageLayout` 包裹登录表单 |
| `frontend/src/routes/signup.tsx` | 修改 | 使用 Dashboard 的 `AuthPageLayout` 包裹注册表单 |
| `frontend/src/components/auth/SignInForm.tsx` | 修改 | 对接 `useAuth().loginMutation`，替换占位逻辑 |
| `frontend/src/components/auth/SignUpForm.tsx` | 修改 | 对接 `useAuth().signUpMutation`，替换占位逻辑 |
| `frontend/src/hooks/useAuth.ts` | 修改 | 增加 `role` 字段返回，导出 `isAuditor()` |

### 后端验证命令

```bash
# 1. 注册新用户
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@forexchange.io","password":"Test1234!","full_name":"Test User"}'
# → 返回用户信息

# 2. 登录获取 token
curl -X POST http://localhost:8000/api/v1/login/access-token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=changethis"
# → {"access_token":"eyJ...","token_type":"bearer"}

# 3. 获取当前用户（含 role）
export TOKEN="eyJ..."
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
# → {"email":"admin@example.com","role":"auditor",...}
```

### 前端验证

```
1. 浏览器打开 http://localhost:5173 → 看到登录页（Dashboard AuthLayout 样式）
2. 输入 admin@example.com / changethis → 登录成功 → 跳转仪表盘
3. 刷新页面 → 仍保持登录状态（token 在 localStorage）
4. 打开浏览器 DevTools → Application → Local Storage → 存在 access_token
5. 点击右上角用户菜单 → [Log Out] → 清除 token → 跳回登录页
6. 注册新用户 → 注册成功 → 跳转登录页 → 用新账号登录成功
```

### 验收标准

- [ ] 登录页使用 Dashboard `AuthPageLayout`（左侧品牌区 + 右侧表单）
- [ ] OAuth2 密码流登录成功，JWT 存储到 localStorage
- [ ] 刷新页面不丢失登录态
- [ ] 登出清除 token 并跳转登录页
- [ ] `GET /users/me` 返回正确的 `role` 字段
- [ ] Console 无 401 错误

---

## Phase 3: 布局导航 + 角色菜单

**目标**：Dashboard 侧边栏适配 ForeXchange 菜单，角色差异化显示，页面标题正确。

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/layout/AppSidebar.tsx` | 修改 | 替换菜单项为 ForeXchange 导航（Dashboard / Remittance / History / Rates / Compliance(仅 Auditor) / Settings） |
| `frontend/src/layout/AppHeader.tsx` | 修改 | 用户下拉菜单显示角色标签（Customer / Auditor） |
| `frontend/src/components/header/UserDropdown.tsx` | 修改 | 增加角色徽章，移除 Sign In 链接 |
| `frontend/src/routes/_layout/index.tsx` | 修改 | 设置页面标题 `Dashboard - ForeXchange` |
| `frontend/src/routes/_layout/remittance.tsx` | 修改 | 设置页面标题 `New Remittance - ForeXchange` |
| `frontend/src/routes/_layout/history.tsx` | 修改 | 设置页面标题 `Transaction History - ForeXchange` |
| `frontend/src/routes/_layout/compliance.tsx` | 修改 | 设置页面标题 `Compliance Audit - ForeXchange` |
| `frontend/src/routes/_layout/rates.tsx` | 修改 | 设置页面标题 `Live Rates - ForeXchange` |

### 侧边栏菜单设计

```
📊 Dashboard           → /
💱 New Remittance      → /remittance
📋 Transaction History → /history
📈 Live Rates          → /rates
🔒 Compliance Audit    → /compliance    (仅 isAuditor)
⚙️ Settings            → /settings
```

### 菜单配置代码参考

```typescript
// frontend/src/layout/AppSidebar.tsx — navItems 部分
const mainItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CurrencyExchangeIcon />,   // 新图标
    name: "New Remittance",
    path: "/remittance",
  },
  {
    icon: <ListIcon />,
    name: "Transaction History",
    path: "/history",
  },
  {
    icon: <PieChartIcon />,
    name: "Live Rates",
    path: "/rates",
  },
];

// 仅 Auditor 可见
const auditorItems: NavItem[] = [
  {
    icon: <ShieldIcon />,
    name: "Compliance Audit",
    path: "/compliance",
  },
];
```

### 验证方案

```
1. 以 Customer 角色登录 → 侧边栏显示 5 个菜单（无 Compliance Audit）
2. 以 Auditor 角色登录 → 侧边栏显示 6 个菜单（含 Compliance Audit）
3. 点击每个菜单项 → 正确跳转 → 页面标题正确
4. 折叠/展开侧边栏 → 动画正常
5. 移动端 → 汉堡菜单正常打开/关闭
6. 右上角用户头像 → 下拉菜单中显示角色标识
```

### 验收标准

- [ ] Customer 角色看不到 `Compliance Audit` 菜单
- [ ] Auditor 角色可以看到全部菜单
- [ ] 直接 URL 访问 `/compliance` 时，Customer 角色被拦截（Phase 4 路由守卫）
- [ ] 所有菜单项点击后正确跳转并高亮当前页
- [ ] 页面 `<title>` 标签随路由变化正确更新

---

## Phase 4: 仪表盘首页（统计卡片 + 概览）

**目标**：首页展示核心业务指标，从后端聚合接口获取数据。

### 后端配合

| 接口 | 说明 |
|------|------|
| `GET /api/v1/dashboard/summary` | 返回 `active_pairs`, `today_transactions`, `total_volume_usd`, `flagged_count` |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout/index.tsx` | 重写 | 4 个统计卡片 + 最近交易列表 |
| `frontend/src/components/forex/StatCard.tsx` | 新建 | 统计卡片通用组件（图标/数值/标签/趋势箭头） |
| `frontend/src/components/forex/RecentTransactions.tsx` | 新建 | 最近 10 笔交易简表 |
| `frontend/src/client/sdk.gen.ts` | 重新生成 | 包含 DashboardService |

### 统计卡片设计

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  💱           │  │  📊           │  │  💰           │  │  🚨           │
│  Active Pairs │  │  Today's Tx  │  │  Total Volume │  │  Alerts      │
│     12        │  │     47       │  │  $284,500.50  │  │     3        │
│  ↑ 2 this wk  │  │  ↑ 12% vs yd │  │  ≈ €261,740   │  │  Needs Review│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### 后端验证

```bash
curl http://localhost:8000/api/v1/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
# → {"active_pairs":12,"today_transactions":47,"total_volume_usd":284500.50,"flagged_count":3,...}
```

### 前端验证

```
1. 登录后进入首页 → 4 个统计卡片正确显示数据
2. 后端返回 0 时 → 卡片显示 "0" 或 "No data" 而非空白/报错
3. 后端接口故障时 → 卡片显示错误提示（React Query error state）
4. 手动刷新 → 数据重新拉取
5. 模拟不同角色 → Auditor 额外看到 flagged_count 红色高亮
```

### 验收标准

- [ ] 4 个统计卡片数据与后端 `/dashboard/summary` 返回一致
- [ ] 加载中有 Skeleton 占位动画
- [ ] 接口报错时卡片显示友好错误提示（非白屏）
- [ ] 最近交易列表显示最近 10 条记录

---

## Phase 5: 实时汇率行情（轮询 + 行情卡片）

**目标**：实时汇率行情页，每 5 秒自动刷新，显示多个货币对的买入/卖出/中间价。

### 后端配合

| 接口 | 说明 |
|------|------|
| `GET /api/v1/rates/live` | 返回所有活跃货币对当前汇率 |
| `GET /api/v1/rates/live/{pair}` | 返回指定货币对汇率 |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout/rates.tsx` | 重写 | 实时汇率页面主体 |
| `frontend/src/components/forex/RateCard.tsx` | 新建 | 单个汇率卡片（货币对/买入/卖出/涨跌幅） |
| `frontend/src/components/forex/RateTicker.tsx` | 新建 | 顶部汇率滚动条（可选，锦上添花） |
| `frontend/src/hooks/useForexRates.ts` | 新建 | 封装 `useQuery` + 5s 轮询 |

### 汇率卡片设计

```
┌─────────────────────┐
│  USD/EUR            │
│  Bid: 0.9215        │  ← 绿色（买价）
│  Ask: 0.9220        │  ← 红色（卖价）
│  Mid:  0.92175      │
│  Spread: 0.5 pip    │
│  ▲ 0.15%            │  ← 绿色涨/红色跌
│  Updated: 10:30:05  │
└─────────────────────┘
```

### useForexRates Hook

```typescript
// frontend/src/hooks/useForexRates.ts
import { useQuery } from "@tanstack/react-query"
import { RatesService } from "@/client"

export function useForexRates(pair?: string) {
  return useQuery({
    queryKey: ["rates", "live", pair],
    queryFn: () => pair 
      ? RatesService.readRatePair({ path: { pair } })
      : RatesService.readRatesLive(),
    refetchInterval: 5000,  // 5 秒轮询
    staleTime: 0,           // 始终视为过期
  })
}
```

### 后端验证

```bash
# 启动汇率模拟器（或种子数据确保有活跃货币对）
curl http://localhost:8000/api/v1/rates/live \
  -H "Authorization: Bearer $TOKEN"
# → {"data":[{"pair":"USD/EUR","bid":0.9215,...},{...}]}
```

### 前端验证

```
1. 打开 /rates 页面 → 显示所有活跃货币对卡片
2. 等待 5 秒 → 汇率数据自动刷新（观察 bid/ask 数字变化）
3. 切换到其他页面再切回 → 立即拉取最新数据
4. 关闭浏览器标签页 → 轮询停止（React Query 自动清理）
5. 后端模拟器停掉 → 卡片显示最后已知数据 + 过期提示
```

### 验收标准

- [ ] 页面显示所有活跃货币对（至少 12 个）
- [ ] 每 5 秒自动刷新，数字变化可见
- [ ] 涨跌幅颜色正确（涨绿跌红）
- [ ] 后端停机时不白屏，显示最后数据 + "更新失败"标签
- [ ] 手动刷新按钮可触发立即拉取

---

## Phase 6: 汇率走势图（ApexCharts 图表）

**目标**：仪表盘首页嵌入实时走势图和 ApexCharts 历史走势图。

### 后端配合

| 接口 | 说明 |
|------|------|
| `GET /api/v1/rates/history/{pair}?interval=1m&range=24h` | 返回时间序列数据 |
| `GET /api/v1/dashboard/summary` | Phase 4 已有 |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/components/forex/RateChart.tsx` | 新建 | ApexCharts 折线图/蜡烛图组件 |
| `frontend/src/components/forex/MiniChart.tsx` | 新建 | 迷你趋势图（用于统计卡片内嵌） |
| `frontend/src/routes/_layout/index.tsx` | 修改 | 在仪表盘集成走势图 |
| `frontend/src/routes/_layout/rates.tsx` | 修改 | 在汇率页集成深度图表 |

### 图表技术选型

```
react-apexcharts 已在 Phase 0 安装（Dashboard 模板自带）
图表类型：
  - 折线图 (line):  24h 中间价趋势
  - 蜡烛图 (candlestick): 模拟 OHLC 数据（可选）
  - 迷你图 (sparkline): 统计卡片内嵌
```

### 后端验证

```bash
curl "http://localhost:8000/api/v1/rates/history/USD/EUR?interval=5m&range=1h" \
  -H "Authorization: Bearer $TOKEN"
# → {"data":[{"timestamp":"2026-06-06T10:00:00Z","bid":0.9210,"ask":0.9215,"mid":0.92125},...]}
```

### 前端验证

```
1. 仪表盘首页 → 默认货币对（USD/EUR）走势图正常渲染
2. 切换货币对下拉 → 图表数据立即切换
3. 切换时间范围（1H / 6H / 24H / 7D）→ 图表重新拉取
4. 鼠标悬停 → Tooltip 显示具体时间和汇率
5. 暗色模式切换 → 图表颜色适配（坐标轴/网格线颜色）
```

### 验收标准

- [ ] ApexCharts 图表正常渲染，无空白
- [ ] 货币对切换和时间范围切换正常工作
- [ ] Tooltip 交互正常
- [ ] 暗色模式下图表的坐标轴、标签颜色正确
- [ ] 无数据时图表显示空状态

---

## Phase 7: 汇款表单（货币选择 + 汇率锁定）

**目标**：完整的跨境汇款表单，含货币选择器、实时汇率显示、手续费计算、收款方信息。

### 后端配合

| 接口 | 说明 |
|------|------|
| `POST /api/v1/rates/lock` | 锁定当前汇率，返回 `{lock_id, rate, expires_at}` |
| `POST /api/v1/transactions` | 创建汇款交易，推入 Azure Queue |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout/remittance.tsx` | 重写 | 汇款表单页面主体 |
| `frontend/src/components/forex/RemittanceForm.tsx` | 新建 | 表单组件（react-hook-form + zod） |
| `frontend/src/components/forex/CurrencySelector.tsx` | 新建 | 货币对选择器（源币种 / 目标币种） |
| `frontend/src/components/forex/RateLockBadge.tsx` | 新建 | 汇率锁定倒计时标签 |

### 表单 Schema（zod）

```typescript
const remittanceSchema = z.object({
  source_currency: z.string().length(3),
  target_currency: z.string().length(3),
  source_amount: z.number().min(1).max(50000),
  recipient_name: z.string().min(1).max(255),
  recipient_iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/, "Invalid IBAN"),
  purpose: z.enum(["family_support", "business", "education", "medical", "other"]),
})
```

### 后端验证

```bash
# 1. 锁定汇率
curl -X POST http://localhost:8000/api/v1/rates/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pair":"USD/EUR"}'
# → {"lock_id":"uuid","rate":0.92175,"expires_at":"2026-06-06T10:30:30Z"}

# 2. 创建汇款
curl -X POST http://localhost:8000/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pair":"USD/EUR",
    "source_amount":1000.00,
    "locked_rate_id":"uuid-from-lock",
    "recipient_name":"Jean Dupont",
    "recipient_iban":"FR7630001007941234567890185",
    "purpose":"family_support"
  }'
# → {"transaction_id":"uuid","status":"pending"}
```

### 前端验证

```
1. 打开 /remittance → 表单完整渲染
2. 选择源币种 USD、目标币种 EUR → 自动获取实时汇率
3. 输入金额 1000 → 实时计算预估到账金额、手续费
4. [Lock Rate] 按钮 → 汇率锁定 30 秒倒计时开始
5. 填写收款方信息 → IBAN 格式校验（输入错误格式 → 红色提示）
6. [Submit Transfer] → 成功提示 → 显示 transaction_id
7. 锁定过期 → 按钮变灰 + "Please refresh rate" 提示
```

### 验收标准

- [ ] 货币对选择器可从活跃列表中选取
- [ ] 实时汇率在表单中显示且随轮询更新
- [ ] 汇率锁定 30 秒倒计时正常工作
- [ ] IBAN 格式校验生效
- [ ] 提交成功后显示确认信息（含 transaction_id）
- [ ] 所有表单字段必填校验生效

---

## Phase 8: 交易历史（分页表格 + 详情弹窗）

**目标**：完整的交易历史页面，支持分页、筛选、详情弹窗。

### 后端配合

| 接口 | 说明 |
|------|------|
| `GET /api/v1/transactions?skip=0&limit=20` | 分页交易列表 |
| `GET /api/v1/transactions?status=flagged` | 按状态筛选 |
| `GET /api/v1/transactions/{id}` | 单笔交易详情 |

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout/history.tsx` | 重写 | 交易历史页面主体 |
| `frontend/src/components/forex/TransactionTable.tsx` | 新建 | 交易表格组件 |
| `frontend/src/components/forex/TransactionDetail.tsx` | 新建 | 交易详情弹窗/抽屉 |
| `frontend/src/components/forex/StatusBadge.tsx` | 新建 | 交易状态标签（彩色） |

### 状态标签设计

```
Pending    → 黄色 badge  + 沙漏图标
Processing → 蓝色 badge  + 旋转图标
Completed  → 绿色 badge  + 对勾图标
Flagged    → 橙色 badge  + 旗帜图标
Rejected   → 红色 badge  + 叉号图标
```

### 详情弹窗内容

```
┌──────────────────────────────────┐
│  Transaction #uuid               │
│  ──────────────────────────────  │
│  Status:        Completed  ✅    │
│  Created:       2026-06-06 10:30 │
│  Completed:     2026-06-06 10:31 │
│                                  │
│  Source:    USD 1,000.00        │
│  Target:    EUR   913.10        │
│  Rate:      0.92175             │
│  Fee:       $5.00 (0.5%)       │
│                                  │
│  Recipient: Jean Dupont         │
│  IBAN:      FR76******0185      │
│  Purpose:   Family Support      │
│                                  │
│  Compliance: Pass (Score: 15)   │
│                                  │
│                         [Close] │
└──────────────────────────────────┘
```

### 后端验证

```bash
# 分页查询
curl "http://localhost:8000/api/v1/transactions?skip=0&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 按状态筛选
curl "http://localhost:8000/api/v1/transactions?status=flagged&skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 单笔详情
curl http://localhost:8000/api/v1/transactions/<transaction-id> \
  -H "Authorization: Bearer $TOKEN"
```

### 前端验证

```
1. 打开 /history → 表格显示交易列表，按时间倒序
2. 底部 [Load More] 或分页器 → 数据追加/翻页正常
3. 状态筛选下拉 → 选择 "Flagged" → 表格只显示 Flagged 交易
4. 点击某一行 → 弹出详情抽屉
5. 详情抽屉中 IBAN 中间部分脱敏显示
6. 空数据状态 → 显示 "No transactions yet" 空状态插图
```

### 验收标准

- [ ] 表格列：ID / Date / Source→Target / Amount / Fee / Status
- [ ] 分页/加载更多正常工作
- [ ] 状态筛选功能正常
- [ ] 点击行 → 详情弹窗/抽屉正常展示
- [ ] 加载中显示 Skeleton
- [ ] 空列表显示友好空状态

---

## Phase 9: 合规审计（Auditor 专属 + 审核操作）

**目标**：完整的合规审计页面，仅 Auditor 角色可访问，支持审核操作。

### 后端配合

| 接口 | 说明 |
|------|------|
| `GET /api/v1/compliance/overview` | 合规统计数据 |
| `GET /api/v1/compliance/flagged` | Flagged 交易列表 |
| `GET /api/v1/compliance/{tx_id}` | 单笔交易合规详情 |
| `POST /api/v1/compliance/review/{tx_id}` | 审核操作（approve/reject） |

### 路由守卫

```typescript
// frontend/src/routes/_layout/compliance.tsx
export const Route = createFileRoute("/_layout/compliance")({
  component: CompliancePage,
  beforeLoad: async () => {
    // 重定向非 Auditor 用户
    const user = await getCurrentUser()
    if (user?.role !== "auditor") {
      throw redirect({ to: "/" })
    }
  },
})
```

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/routes/_layout/compliance.tsx` | 重写 | 合规审计页面主体 + 路由守卫 |
| `frontend/src/components/forex/ComplianceStats.tsx` | 新建 | 合规统计卡片 |
| `frontend/src/components/forex/FlaggedTable.tsx` | 新建 | Flagged 交易表格（按风险降序） |
| `frontend/src/components/forex/ComplianceDetail.tsx` | 新建 | 合规详情面板（风险规则明细） |
| `frontend/src/components/forex/ReviewActions.tsx` | 新建 | [Approve] / [Reject] 操作按钮 |

### 合规详情面板

```
┌────────────────────────────────────────┐
│  Compliance Review #tx-uuid            │
│  ────────────────────────────────────  │
│  Risk Score:  85 / 100  🔴 HIGH       │
│                                         │
│  Rules Triggered:                       │
│  ⚠ LARGE_AMOUNT     $15,000 > $10,000  │
│  ⚠ HIGH_FREQUENCY   8 tx/hour > 5      │
│  ⚠ HIGH_RISK_COUNTRY Recipient: XX     │
│                                         │
│  Transaction Details:                   │
│  Source:   USD 15,000.00               │
│  Target:   EUR (pending)               │
│  IBAN:     XX12******3456              │
│                                         │
│  [🔍 Investigate]                       │
│  [✅ Approve]      [❌ Reject]         │
└────────────────────────────────────────┘
```

### 后端验证

```bash
# 合规概览
curl http://localhost:8000/api/v1/compliance/overview \
  -H "Authorization: Bearer $AUDITOR_TOKEN"

# Flagged 列表
curl http://localhost:8000/api/v1/compliance/flagged \
  -H "Authorization: Bearer $AUDITOR_TOKEN"

# 合规详情
curl http://localhost:8000/api/v1/compliance/<tx-id> \
  -H "Authorization: Bearer $AUDITOR_TOKEN"

# 审核操作
curl -X POST http://localhost:8000/api/v1/compliance/review/<tx-id> \
  -H "Authorization: Bearer $AUDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","reason":"Legitimate business payment"}'
# → {"status":"approved"}
```

### 前端验证

```
1. Customer 角色访问 /compliance → 自动重定向到 /
2. Auditor 角色访问 /compliance → 页面正常显示
3. 合规统计卡片显示：今日 Flagged 数 / 审核通过率 / 平均处理时间
4. Flagged 列表按风险评分降序排列
5. 点击某笔交易 → 风险规则详情展开
6. [Approve] → 确认弹窗 → 交易状态变为 Completed
7. [Reject] → 确认弹窗（必填 reason）→ 交易状态变为 Rejected
8. 操作后列表自动刷新
```

### 验收标准

- [ ] Customer 角色无法访问 `/compliance`，自动重定向到首页
- [ ] Auditor 角色可正常访问
- [ ] Flagged 交易按风险评分降序排列
- [ ] 审核操作后可看到状态变化
- [ ] Approve/Reject 前有二次确认弹窗
- [ ] Reject 时必须填写原因

---

## Phase 10: 打磨上线（错误处理 + 加载态 + 联调）

**目标**：全面打磨用户体验，处理所有边界情况，完成前后端联调。

### 创建/修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/components/Common/ErrorComponent.tsx` | 修改 | 区分 401/403（重定向）/ 500（重试）/ Network Error 等 |
| `frontend/src/components/Common/NotFound.tsx` | 修改 | ForeXchange 品牌 404 页面 |
| `frontend/src/components/forex/*.tsx` | 修改 | 所有组件增加 Loading / Empty / Error 三态 |
| `frontend/src/hooks/useAuth.ts` | 修改 | Token 过期自动刷新（或优雅降级） |
| `frontend/src/main.tsx` | 修改 | 全局 ErrorBoundary 配置 |
| `frontend/src/client/core/OpenAPI.ts` | 修改 | 配置 `WITH_CREDENTIALS` 和请求超时 |

### 打磨清单

#### 全局

- [ ] **令牌过期处理**: 401 → 清除 token → 重定向 `/login`（已有） → 显示 toast "Session expired. Please log in again."
- [ ] **网络断开**: 显示 "Network Error" toast + 手动重试按钮
- [ ] **5xx 服务器错误**: 错误页显示 "Service temporarily unavailable" + [Retry] 按钮
- [ ] **404 页面**: ForeXchange 品牌定制 404，含 [Go Home] 链接

#### 仪表盘

- [ ] 统计卡片: Skeleton 加载 → 数据填充过渡动画
- [ ] 汇率图表: 空数据时显示 "Waiting for market data..."
- [ ] 轮询失败: 不白屏，显示最后已知数据 + "Update failed" 标签

#### 汇率页

- [ ] 货币对为空时: "No active currency pairs configured"
- [ ] 轮询延迟指示: 右上角显示 "Last updated: Xs ago"

#### 汇款表单

- [ ] 提交中: Submit 按钮显示 Loading spinner + "Processing..."
- [ ] 提交失败: toast 错误详情 + 表单保持填写状态
- [ ] 汇率锁定过期: 自动重新获取 + toast 提示
- [ ] 额度超限 (>$50,000): 表单校验阻止提交

#### 交易历史

- [ ] 空列表: "You haven't made any transactions yet. [Start your first remittance →]"
- [ ] 加载更多: 滚动到底部自动加载（IntersectionObserver）
- [ ] 详情加载失败: 弹窗内显示 retry 按钮

#### 合规审计

- [ ] 无 Flagged 交易: "All clear! No flagged transactions pending review."
- [ ] 审核提交中: 按钮 Loading 态
- [ ] 并发审核冲突: 另一 Auditor 已处理 → toast 提示 + 列表刷新

### 全链路联调验证

```bash
# === 完整用户旅程 ===

# 1. 注册 → 登录 → 仪表盘
# 浏览器操作：注册新账号 → 登录 → 看到仪表盘首页

# 2. 仪表盘数据
curl http://localhost:8000/api/v1/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"

# 3. 实时汇率
curl http://localhost:8000/api/v1/rates/live \
  -H "Authorization: Bearer $TOKEN"

# 4. 锁定汇率 → 创建汇款
LOCK=$(curl -s -X POST http://localhost:8000/api/v1/rates/lock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pair":"USD/EUR"}')
LOCK_ID=$(echo $LOCK | jq -r '.lock_id')

TX=$(curl -s -X POST http://localhost:8000/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"pair\":\"USD/EUR\",
    \"source_amount\":5000.00,
    \"locked_rate_id\":\"$LOCK_ID\",
    \"recipient_name\":\"Maria Garcia\",
    \"recipient_iban\":\"ES9121000418450200051332\",
    \"purpose\":\"family_support\"
  }")
TX_ID=$(echo $TX | jq -r '.transaction_id')
echo "Created: $TX_ID"

# 5. 查看交易历史
curl "http://localhost:8000/api/v1/transactions?skip=0&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 6. 查询单笔交易状态
curl http://localhost:8000/api/v1/transactions/$TX_ID \
  -H "Authorization: Bearer $TOKEN"

# 7. Auditor 审核（如果该笔被 Flagged）
curl http://localhost:8000/api/v1/compliance/flagged \
  -H "Authorization: Bearer $AUDITOR_TOKEN"
```

### 最终验收标准

- [ ] 全 10 个 Phase 的验收标准全部通过
- [ ] 浏览器 Console 无 Error（除第三方库 warning）
- [ ] Network 标签无 401/403/500 未处理错误
- [ ] 页面加载时间 < 3 秒（首屏）
- [ ] 所有表单校验生效，错误提示清晰
- [ ] 暗色/亮色模式切换无样式异常
- [ ] 移动端（375px 宽度）布局正常

---

## 附录：每期前后端对应接口清单

| Phase | 前端重点 | 后端需提供的接口 |
|-------|----------|-----------------|
| 1 | 路由骨架 | `GET /utils/health-check` |
| 2 | 认证 | `POST /login/access-token`, `POST /users/register`, `GET /users/me`（增加 role） |
| 3 | 导航菜单 | `GET /users/me`（role 字段） |
| 4 | 仪表盘 | `GET /dashboard/summary`, `GET /transactions?limit=10` |
| 5 | 汇率行情 | `GET /rates/live`, `GET /rates/live/{pair}` |
| 6 | 图表 | `GET /rates/history/{pair}?interval=&range=` |
| 7 | 汇款 | `POST /rates/lock`, `POST /transactions` |
| 8 | 历史 | `GET /transactions?skip=&limit=&status=`, `GET /transactions/{id}` |
| 9 | 合规 | `GET /compliance/overview`, `GET /compliance/flagged`, `GET /compliance/{tx_id}`, `POST /compliance/review/{tx_id}` |
| 10 | 打磨 | 以上全部 + 错误场景模拟 |

---

## 附录：前端文件创建汇总

```
frontend/src/
├── hooks/
│   └── useForexRates.ts                          # Phase 5 新建
├── components/
│   └── forex/
│       ├── StatCard.tsx                           # Phase 4 新建
│       ├── RecentTransactions.tsx                 # Phase 4 新建
│       ├── RateCard.tsx                           # Phase 5 新建
│       ├── RateTicker.tsx                         # Phase 5 新建
│       ├── RateChart.tsx                          # Phase 6 新建
│       ├── MiniChart.tsx                          # Phase 6 新建
│       ├── CurrencySelector.tsx                   # Phase 7 新建
│       ├── RemittanceForm.tsx                     # Phase 7 新建
│       ├── RateLockBadge.tsx                      # Phase 7 新建
│       ├── TransactionTable.tsx                   # Phase 8 新建
│       ├── TransactionDetail.tsx                  # Phase 8 新建
│       ├── StatusBadge.tsx                        # Phase 8 新建
│       ├── ComplianceStats.tsx                    # Phase 9 新建
│       ├── FlaggedTable.tsx                       # Phase 9 新建
│       ├── ComplianceDetail.tsx                   # Phase 9 新建
│       └── ReviewActions.tsx                      # Phase 9 新建
├── routes/
│   └── _layout/
│       ├── index.tsx                              # Phase 4 重写
│       ├── remittance.tsx                         # Phase 7 重写
│       ├── history.tsx                            # Phase 8 重写
│       ├── compliance.tsx                         # Phase 9 重写
│       └── rates.tsx                              # Phase 5 重写
└── layout/
    └── AppSidebar.tsx                             # Phase 3 修改
```
