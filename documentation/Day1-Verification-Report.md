# Day 1 验证报告 — 环境搭建 + 路由骨架 + 后端基础

> **日期**: 2026-06-06  
> **对应阶段**: Day 1 / Phase 1  
> **构建方式**: `docker compose down -v && docker compose up -d --build`（全新构建，无持久化）  
> **数据库初始化**: SQLModel `create_all` 直接建表，不使用 Alembic  

---

## 一、服务状态总览

| 服务 | 容器名 | 状态 | 端口 |
|------|--------|------|------|
| PostgreSQL 18 | `db` | ✅ healthy | `localhost:5432` |
| FastAPI Backend | `backend` | ✅ healthy | `localhost:8000` |
| Frontend (Nginx) | `frontend` | ✅ running | `localhost:5173` |
| Prestart (建表+种子) | `prestart` | ✅ exited(0) | — |
| MailCatcher | `mailcatcher` | ✅ running | `localhost:1080` |

验证命令：
```bash
docker compose ps -a
```

截图位置：`______`（请截图 docker compose ps 输出）

---

## 二、后端验证

### 2.1 健康检查

```bash
curl http://localhost:8000/api/v1/utils/health-check/
```

| 期望 | 实际 | 结果 |
|------|------|------|
| HTTP 200，返回 `{"message":"Hello World"}` | `{"message":"Hello World"}` | ☐ 通过 |

### 2.2 登录接口（admin → auditor）

```bash
curl -X POST http://localhost:8000/api/v1/login/access-token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=changethis"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `access_token` + `role: "auditor"` | | ☐ 通过 |

### 2.3 获取当前用户

```bash
curl http://localhost:8000/api/v1/users/me -H "Authorization: Bearer $TOKEN"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `role: "auditor"`, `is_superuser: true` | | ☐ 通过 |

### 2.4 用户注册（默认 customer）

```bash
curl -X POST http://localhost:8000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","full_name":"Test User"}'
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `role: "customer"`, `is_superuser: false` | | ☐ 通过 |

### 2.5 OpenAPI 文档

```bash
curl -o /dev/null -w "%{http_code}" http://localhost:8000/docs
curl -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/openapi.json
```

| 期望 | 实际 | 结果 |
|------|------|------|
| Swagger UI 返回 200 | | ☐ 通过 |
| OpenAPI JSON 返回 200 | | ☐ 通过 |

截图位置：`______`（请截图 http://localhost:8000/docs 页面）

---

## 三、前端验证

### 3.1 前端可访问

```bash
curl -o /dev/null -w "%{http_code}" http://localhost:5173/
```

| 期望 | 实际 | 结果 |
|------|------|------|
| HTTP 200 | | ☐ 通过 |

### 3.2 新增路由文件

| 文件 | 说明 | 存在 |
|------|------|------|
| `routes/_layout/remittance.tsx` | 汇款页占位 | ☐ |
| `routes/_layout/history.tsx` | 交易历史页占位 | ☐ |
| `routes/_layout/compliance.tsx` | 合规审计页占位（含 Auditor 守卫） | ☐ |
| `routes/_layout/rates.tsx` | 实时汇率页占位 | ☐ |

### 3.3 页面标题

在浏览器中逐一访问，检查标签页标题：

| 路由 | 期望标题 | 实际 | 结果 |
|------|----------|------|------|
| `/login` | Log In - ForeXchange | | ☐ |
| `/signup` | Sign Up - ForeXchange | | ☐ |
| `/` | Dashboard - ForeXchange | | ☐ |
| `/remittance` | New Remittance - ForeXchange | | ☐ |
| `/history` | Transaction History - ForeXchange | | ☐ |
| `/compliance` | Compliance Audit - ForeXchange | | ☐ |
| `/rates` | Live Rates - ForeXchange | | ☐ |
| `/settings` | Settings - ForeXchange | | ☐ |

---

## 四、系统验证（浏览器手动测试）

> 以下用例需在浏览器中手动操作并截图。  
> 测试账号：`admin@example.com` / `changethis`

---

### TC-01: 未登录访问受保护页面 → 重定向到登录页

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 打开浏览器，访问 `http://localhost:5173/` | 自动跳转到 `/login` |
| 2 | 地址栏输入 `http://localhost:5173/remittance` 并回车 | 自动跳转到 `/login` |
| 3 | 地址栏输入 `http://localhost:5173/history` 并回车 | 自动跳转到 `/login` |
| 4 | 地址栏输入 `http://localhost:5173/compliance` 并回车 | 自动跳转到 `/login` |
| 5 | 地址栏输入 `http://localhost:5173/rates` 并回车 | 自动跳转到 `/login` |
| 6 | 地址栏输入 `http://localhost:5173/settings` 并回车 | 自动跳转到 `/login` |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-02: 登录页面渲染正确

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 访问 `http://localhost:5173/login` | 显示登录页面 |
| 2 | 观察页面布局 | 左侧品牌区 + 右侧登录表单 |
| 3 | 观察表单内容 | 有 Email 输入框、Password 输入框、登录按钮 |
| 4 | 观察浏览器标签标题 | 显示 `Log In - ForeXchange` |
| 5 | 观察页面底部 | 有 "Sign Up" 链接指向注册页 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-03: 登录成功 → 跳转仪表盘

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 在登录页输入 Email: `admin@example.com` | 输入框显示内容 |
| 2 | 输入 Password: `changethis` | 输入框显示密码遮盖 |
| 3 | 点击 [Login] 按钮 | 按钮显示 loading 状态 |
| 4 | 等待登录完成 | 页面跳转到 `/`（仪表盘） |
| 5 | 观察浏览器标签标题 | 显示 `Dashboard - ForeXchange` |
| 6 | 打开 DevTools → Application → Local Storage | 存在 `access_token` 和 `user_role` 键 |

截图：`______`（仪表盘页面）| `______`（LocalStorage）

结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-04: 侧边栏导航 — 访问所有页面

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 查看左侧侧边栏 | 显示菜单列表 |
| 2 | 点击任意菜单项 | 页面正确切换，无白屏 |
| 3 | 地址栏访问 `/remittance` | 显示 "New Remittance" 占位页，标题正确 |
| 4 | 地址栏访问 `/history` | 显示 "Transaction History" 占位页，标题正确 |
| 5 | 地址栏访问 `/rates` | 显示 "Live Rates" 占位页，标题正确 |
| 6 | 地址栏访问 `/compliance` | 显示 "Compliance Audit" 占位页，标题正确 |
| 7 | 地址栏访问 `/settings` | 显示用户设置页面（已有功能） |
| 8 | 打开 DevTools Console (F12) | 无红色 Error 日志 |

截图：`______`（任选 2-3 个页面截图）

结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-05: 注册新用户

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 在登录页点击 "Sign Up" 链接 | 跳转到 `/signup` |
| 2 | 观察浏览器标签标题 | 显示 `Sign Up - ForeXchange` |
| 3 | Email 输入 `user@test.com` | 显示内容 |
| 4 | Full Name 输入 `Test User` | 显示内容 |
| 5 | Password 输入 `Test1234!` | 密码遮盖 |
| 6 | Confirm Password 输入 `Test1234!` | 密码遮盖 |
| 7 | 点击 [Sign Up] 按钮 | 注册成功，跳转到 `/login` |
| 8 | 用 `user@test.com` / `Test1234!` 登录 | 登录成功，进入仪表盘 |

截图：`______`（注册页）| `______`（注册后跳转登录页）

结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-06: 登出 → 清除令牌 → 跳回登录页

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 登录状态下，点击右上角用户头像/菜单 | 展开下拉菜单 |
| 2 | 点击 [Log Out] / [Sign Out] | 跳转到 `/login` |
| 3 | DevTools → Application → Local Storage | `access_token` 和 `user_role` 已清除 |
| 4 | 地址栏访问 `http://localhost:5173/` | 再次跳转到 `/login` |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-07: 刷新页面保持登录态

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 用 admin 账号登录，进入仪表盘 | 显示仪表盘内容 |
| 2 | 按 F5 刷新页面 | 页面重新加载，仍在仪表盘 |
| 3 | 观察右上角用户信息 | 仍然显示用户信息，未跳回登录页 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-08: Swagger UI 页面

**操作步骤：**

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 新标签页访问 `http://localhost:8000/docs` | 显示 Swagger UI |
| 2 | 展开 `login` → `POST /api/v1/login/access-token` | 看到请求/响应 Schema |
| 3 | 展开 `users` → `GET /api/v1/users/me` | 看到接口文档 |
| 4 | 展开 `utils` → `GET /api/v1/utils/health-check/` | 看到接口文档 |
| 5 | 点击 "Try it out" → 输入账号密码 → 点 "Execute" | 返回含 `role` 的 Token |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

## 五、验收标准总表

| # | 验收项 | 后端 | 前端 | 系统 |
|---|--------|------|------|------|
| 1 | 健康检查返回 `{"message":"Hello World"}` | ☐ 2.1 | — | — |
| 2 | 登录返回 `role` 字段 | ☐ 2.2 | — | ☐ TC-03 |
| 3 | `GET /users/me` 返回 `role` | ☐ 2.3 | — | — |
| 4 | 注册默认 `role=customer` | ☐ 2.4 | — | ☐ TC-05 |
| 5 | 超级用户自动 `role=auditor` | ☐ 2.2 | — | — |
| 6 | 数据库建表成功（SQLModel create_all） | ☐ 2.1 | — | ☐ TC-03 |
| 7 | OpenAPI 文档可访问 | ☐ 2.5 | — | ☐ TC-08 |
| 8 | 4 条新路由已创建 | — | ☐ 3.2 | ☐ TC-04 |
| 9 | 页面标题全部更新为 ForeXchange | — | ☐ 3.3 | ☐ TC-02/03/04 |
| 10 | 未登录重定向到 `/login` | — | — | ☐ TC-01 |
| 11 | 登录/登出流程正常 | — | — | ☐ TC-03/06 |
| 12 | 刷新保持登录态 | — | — | ☐ TC-07 |
| 13 | `docker compose up -d --build` 成功 | ☐ 一 | ☐ 一 | — |
| 14 | 浏览器 Console 无报错 | — | — | ☐ TC-04 |

---

## 六、已知问题

| 问题 | 影响 | 处理计划 |
|------|------|----------|
| `SECRET_KEY` 使用默认值 `changethis` | 仅限本地开发 | Day 10 上线前替换 |
| 前端 API 客户端为静态 `openapi.json` | 后端接口变更后需重新生成 | Phase 2 运行 `npm run generate-client` |

---

## 七、变更文件清单

```
backend/
├── scripts/prestart.sh                              # 去掉 alembic，直接 python initial_data
├── app/
│   ├── models.py                                    # UserBase 新增 role: str 字段
│   ├── core/db.py                                   # SQLModel.create_all 建表 + 超级用户 role=auditor
│   └── api/routes/
│       ├── login.py                                 # login 响应新增 role 字段
│       └── utils.py                                 # health-check 返回 Message

frontend/
├── src/
│   ├── routeTree.gen.ts                             # 注册 4 条新路由
│   ├── hooks/useAuth.ts                             # 新增 isAuditor()，登录存储 role
│   ├── client/types.gen.ts                          # Token/UserPublic/UserRegister/UserCreate 加 role
│   └── routes/
│       ├── login.tsx                                # 标题 → ForeXchange
│       ├── signup.tsx                               # 标题 → ForeXchange
│       └── _layout/
│           ├── index.tsx                            # 标题 → Dashboard - ForeXchange
│           ├── settings.tsx                         # 标题 → Settings - ForeXchange
│           ├── remittance.tsx                       # 新建占位
│           ├── history.tsx                          # 新建占位
│           ├── compliance.tsx                       # 新建占位 + Auditor 路由守卫
│           └── rates.tsx                            # 新建占位
```
