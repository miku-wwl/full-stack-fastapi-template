# Day 2 验证报告 — 认证流程（登录/注册/JWT）

> **日期**: 2026-06-06  
> **对应阶段**: Day 2 / Phase 2  
> **构建方式**: `docker compose down -v && docker compose up -d --build`（全新构建，无持久化）  
> **前提**: Day 1 全部验收通过，基础环境和路由骨架就绪  

---

## 一、服务状态总览

| 服务 | 容器名 | 状态 | 端口 |
|------|--------|------|------|
| PostgreSQL 18 | `db` | ✅ healthy | `localhost:5432` |
| FastAPI Backend | `backend` | ✅ healthy | `localhost:8000` |
| Frontend (Nginx) | `frontend` | ✅ running | `localhost:5173` |
| Prestart (建表+种子) | `prestart` | ✅ exited(0) | — |
| MailCatcher | `mailcatcher` | ✅ running | `localhost:1080` |

截图位置：`______`（docker compose ps 输出）

---

## 二、后端验证

### 2.1 健康检查

```bash
curl http://localhost:8000/api/v1/utils/health-check/
```

| 期望 | 实际 | 结果 |
|------|------|------|
| `{"message":"Hello World"}` | `{"message":"Hello World"}` | ☐ 通过 |

### 2.2 用户注册（默认 role=customer）

```bash
curl -X POST http://localhost:8000/api/v1/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"day2test@forexchange.io","password":"Test1234!","full_name":"Day2 Tester"}'
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `role: "customer"`, `is_superuser: false` | `role: customer` | ☐ 通过 |

### 2.3 管理员登录（auditor）

```bash
curl -X POST http://localhost:8000/api/v1/login/access-token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=changethis"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `access_token` + `role: "auditor"` | `role: auditor` | ☐ 通过 |

### 2.4 获取管理员用户信息

```bash
curl http://localhost:8000/api/v1/users/me -H "Authorization: Bearer $ADMIN_TOKEN"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| `role: "auditor"`, `is_superuser: true` | `role: auditor` | ☐ 通过 |

### 2.5 新用户登录（customer）

```bash
curl -X POST http://localhost:8000/api/v1/login/access-token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=day2test@forexchange.io&password=Test1234!"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 返回 `access_token` + `role: "customer"` | `role: customer` | ☐ 通过 |

### 2.6 获取新用户信息

```bash
curl http://localhost:8000/api/v1/users/me -H "Authorization: Bearer $NEW_TOKEN"
```

| 期望 | 实际 | 结果 |
|------|------|------|
| `role: "customer"`, `full_name: "Day2 Tester"` | | ☐ 通过 |

### 2.7 OpenAPI Token Schema

| 期望 | 实际 | 结果 |
|------|------|------|
| Token schema 包含 `role` 字段 | ✅ 存在 | ☐ 通过 |
| UserPublic schema 包含 `role` 字段 | ✅ 存在 | ☐ 通过 |

### 2.8 JWT 令牌自动注入

```typescript
// frontend/src/main.tsx
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}
```

| 期望 | 实际 | 结果 |
|------|------|------|
| OpenAPI.TOKEN 从 localStorage 读取 token | ✅ 已配置 | ☐ 通过 |

### 2.9 401/403 错误自动处理

```typescript
// frontend/src/main.tsx
const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}
```

| 期望 | 实际 | 结果 |
|------|------|------|
| 401/403 时清除 token 并跳转 /login | ✅ 已配置 | ☐ 通过 |

---

## 三、前端验证

### 3.1 前端可访问

| 期望 | 实际 | 结果 |
|------|------|------|
| HTTP 200 | | ☐ 通过 |

### 3.2 useAuth Hook 功能完整性

| 功能 | 实现方式 | 状态 |
|------|----------|------|
| `loginMutation` | OAuth2 密码流 → 存储 token + role 到 localStorage | ☐ |
| `signUpMutation` | POST /users/signup → 成功后跳转 /login | ☐ |
| `logout` | 清除 access_token + user_role + 清空 Query 缓存 → 跳转 /login | ☐ |
| `user` | useQuery 读取 /users/me，登录后自动拉取 | ☐ |
| `isAuditor()` | 检查 user.role 或 localStorage user_role | ☐ |

### 3.3 登录页（AuthLayout）

| 检查项 | 状态 |
|--------|------|
| 使用 `<AuthLayout>` 包裹 | ☐ |
| 有 Email 输入框 | ☐ |
| 有 Password 输入框 | ☐ |
| 有 "Log In" 提交按钮（LoadingButton） | ☐ |
| 有 "Forgot your password?" 链接 | ☐ |
| 有 "Sign up" 跳转链接 | ☐ |

### 3.4 注册页（AuthLayout）

| 检查项 | 状态 |
|--------|------|
| 使用 `<AuthLayout>` 包裹 | ☐ |
| 有 Full Name 输入框 | ☐ |
| 有 Email 输入框 | ☐ |
| 有 Password 输入框 | ☐ |
| 有 Confirm Password 输入框 | ☐ |
| 有 "Sign Up" 提交按钮（LoadingButton） | ☐ |
| 有 "Log in" 跳转链接 | ☐ |
| 密码不匹配时显示错误提示 | ☐ |

---

## 四、系统验证（浏览器手动测试）

> 测试账号：`admin@example.com` / `changethis`

---

### TC-01: 登录页面渲染正确

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 打开 `http://localhost:5173` | 自动跳转到 `/login` |
| 2 | 观察页面布局 | 左侧品牌区 + 右侧登录表单 |
| 3 | 观察表单 | 有 Email、Password 输入框、Log In 按钮 |
| 4 | 观察浏览器标签标题 | `Log In - ForeXchange` |
| 5 | 页面底部 | 有 "Sign up" 链接 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-02: OAuth2 密码流登录成功

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | Email 输入 `admin@example.com` | 显示内容 |
| 2 | Password 输入 `changethis` | 密码遮盖 |
| 3 | 点击 [Log In] | 按钮显示 loading |
| 4 | 等待 | 跳转到 `/`（仪表盘） |
| 5 | DevTools → Application → Local Storage | 存在 `access_token` 和 `user_role: auditor` |
| 6 | 标签标题 | `Dashboard - ForeXchange` |

截图：`______`（仪表盘）| `______`（LocalStorage）

结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-03: 刷新页面保持登录态

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 登录状态下按 F5 | 页面重新加载 |
| 2 | 页面状态 | 仍在仪表盘，未跳回登录 |
| 3 | 右上角用户信息 | 显示邮箱（admin@example.com） |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-04: 右上角用户信息显示真实邮箱

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 登录状态下，观察右上角 | 显示 `admin`（邮箱前缀）或全名 |
| 2 | 点击用户头像 | 展开下拉菜单 |
| 3 | 下拉菜单顶部 | 显示 `admin@example.com` |
| 4 | Edit profile 项 | 灰色，点击无反应 |
| 5 | Account settings 项 | 灰色，点击无反应 |
| 6 | Support 项 | 灰色，点击无反应 |
| 7 | Sign out 项 | 可点击，高亮状态 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-05: 登出流程

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 点击右上角用户菜单 | 展开下拉 |
| 2 | 点击 [Sign out] | 下拉关闭，跳转到 `/login` |
| 3 | DevTools → Local Storage | `access_token` 和 `user_role` 已清除 |
| 4 | 地址栏输入 `http://localhost:5173/` | 再次跳转到 `/login` |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-06: 注册新用户

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 在登录页点击 "Sign up" | 跳转到 `/signup` |
| 2 | 标签标题 | `Sign Up - ForeXchange` |
| 3 | Full Name 输入 `Test User` | 显示内容 |
| 4 | Email 输入 `user@test.com` | 显示内容 |
| 5 | Password 输入 `Test1234!` | 密码遮盖 |
| 6 | Confirm Password 输入 `Test1234!` | 密码遮盖 |
| 7 | 点击 [Sign Up] | 注册成功，跳转到 `/login` |
| 8 | 用 `user@test.com` / `Test1234!` 登录 | 登录成功，进入仪表盘 |
| 9 | 右上角显示 | `user`（邮箱前缀） |

截图：`______`（注册页）| `______`（登录后仪表盘）

结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-07: 注册时密码不匹配

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 访问 `/signup` | 显示注册表单 |
| 2 | Password 输入 `Test1234!` | — |
| 3 | Confirm Password 输入 `Different123!` | — |
| 4 | 点击其他输入框（触发校验） | 显示 "The passwords don't match" 错误 |
| 5 | 点击 [Sign Up] | 提交被阻止 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-08: 登录错误提示

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 访问 `/login` | 显示登录表单 |
| 2 | Email 输入 `wrong@example.com` | — |
| 3 | Password 输入 `wrongpassword123` | — |
| 4 | 点击 [Log In] | 显示错误提示（Toast 或表单错误） |
| 5 | 页面 | 仍停留在 `/login`，未跳转 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-09: 未登录访问受保护页面 → 重定向

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 登出后，访问 `http://localhost:5173/` | 跳转 `/login` |
| 2 | 访问 `http://localhost:5173/remittance` | 跳转 `/login` |
| 3 | 访问 `http://localhost:5173/history` | 跳转 `/login` |
| 4 | 访问 `http://localhost:5173/settings` | 跳转 `/login` |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

### TC-10: Swagger UI 登录测试

| # | 操作 | 期望结果 |
|---|------|----------|
| 1 | 访问 `http://localhost:8000/docs` | 显示 Swagger UI |
| 2 | 展开 `POST /api/v1/login/access-token` | 可看到接口 |
| 3 | 点击 "Try it out" → 输入 admin 账号 → Execute | 返回含 `role: "auditor"` 的 Token |
| 4 | 展开 `GET /api/v1/users/me` → 点击 "Authorize" | 输入 token 后可获取用户信息 |

截图：`______`　　结果：☐ 通过 ☐ 不通过　　备注：`______`

---

## 五、验收标准总表

| # | 验收项 | 后端 | 前端 | 系统 |
|---|--------|------|------|------|
| 1 | 注册新用户成功，role 默认 customer | ☐ 2.2 | — | ☐ TC-06 |
| 2 | 管理员登录返回 role=auditor | ☐ 2.3 | — | ☐ TC-02 |
| 3 | GET /users/me 返回正确的 role | ☐ 2.4/2.6 | — | — |
| 4 | 登录页使用 AuthLayout | — | ☐ 3.3 | ☐ TC-01 |
| 5 | 注册页使用 AuthLayout | — | ☐ 3.4 | ☐ TC-06 |
| 6 | OAuth2 密码流登录成功 | ☐ 2.3 | — | ☐ TC-02 |
| 7 | JWT 存储到 localStorage | — | ☐ 2.8 | ☐ TC-02 |
| 8 | 刷新页面不丢失登录态 | — | — | ☐ TC-03 |
| 9 | 登出清除 token 跳转登录页 | — | ☐ 3.2 | ☐ TC-05 |
| 10 | 右上角显示真实邮箱 | — | — | ☐ TC-04 |
| 11 | Edit/Account/Support 禁用 | — | — | ☐ TC-04 |
| 12 | Sign out 正确登出 | — | — | ☐ TC-05 |
| 13 | 401 自动清除 token | — | ☐ 2.9 | — |
| 14 | OpenAPI Token schema 含 role | ☐ 2.7 | — | — |
| 15 | 密码不匹配校验 | — | — | ☐ TC-07 |
| 16 | 登录错误提示 | — | — | ☐ TC-08 |
| 17 | 未登录重定向到 /login | — | — | ☐ TC-09 |
| 18 | `docker compose up -d --build` 成功 | ☐ 一 | ☐ 一 | — |
| 19 | 浏览器 Console 无报错 | — | — | ☐ TC-02/06 |

---

## 六、已知问题

| 问题 | 影响 | 处理计划 |
|------|------|----------|
| 注册接口路径 `/users/signup` 而非 `/users/register` | 前端已适配，不影响功能 | 后续统一命名 |
| `SECRET_KEY` 使用默认值 `changethis` | 仅限本地开发 | Day 10 上线前替换 |

---

## 七、核心代码位置

| 功能 | 文件 | 关键代码 |
|------|------|----------|
| JWT 令牌注入 | `frontend/src/main.tsx` | `OpenAPI.TOKEN = async () => localStorage.getItem("access_token")` |
| 401/403 自动处理 | `frontend/src/main.tsx` | `handleApiError` 清除 token + 跳转 /login |
| 登录逻辑 | `frontend/src/hooks/useAuth.ts` | `loginMutation` → 存储 token + role |
| 注册逻辑 | `frontend/src/hooks/useAuth.ts` | `signUpMutation` → POST /signup |
| 登出逻辑 | `frontend/src/hooks/useAuth.ts` | `logout()` → 清除 localStorage + 清 Query 缓存 |
| 角色判断 | `frontend/src/hooks/useAuth.ts` | `isAuditor()` |
| 登录表单 | `frontend/src/routes/login.tsx` | react-hook-form + zod + AuthLayout |
| 注册表单 | `frontend/src/routes/signup.tsx` | react-hook-form + zod + AuthLayout |
| 用户信息显示 | `frontend/src/components/header/UserDropdown.tsx` | useAuth 获取 user.email |
| 后端登录 | `backend/app/api/routes/login.py` | 返回 Token(access_token, role) |
| 后端注册 | `backend/app/api/routes/users.py` | POST /signup 支持 role 参数 |
| 后端用户信息 | `backend/app/api/routes/users.py` | GET /me 返回 UserPublic(含 role) |
