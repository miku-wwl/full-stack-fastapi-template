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
├── documentation/    # 设计文档 & 验证报告
└── compose.yml       # Docker 编排
```

## 开发进度

| Day | 模块 | 状态 |
|-----|------|------|
| 1 | 环境搭建 + 路由骨架 | ✅ |
| 2 | 认证系统 | ✅ |
| 3 | 布局导航 + 汇率基础 | ✅ |
| 4 | 仪表盘首页 | ✅ |
| 5 | 实时汇率行情 | ✅ |
| 6-10 | 待开发 | 🚧 |
