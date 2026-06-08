# ForeXchange — Azure 上云部署验证报告

> **日期**: 2026-06-08  
> **区域**: `australiaeast` 🇦🇺  
> **订阅**: Azure for Students (`7c73b89d...`)  
> **工具**: Terraform v1.x + azurerm provider v4.76.0  
> **状态**: ✅ **生产就绪** — 全栈部署成功，前后端均在线  

---

## 一、部署总览

### 1.1 部署时间线

| 阶段 | 状态 | 耗时 |
|------|------|------|
| `terraform init` | ✅ 成功 | < 10s |
| `terraform plan` | ✅ 成功 | < 30s |
| `terraform apply` | ✅ 成功（3 轮调试） | ~7min |
| Key Vault Secrets 导入 | ✅ 5/5 导入成功 | < 2min |
| 资源验证 | ✅ 全部 Succeeded | < 1min |
| 前端构建 + 上传 | ✅ 成功 | ~3min |
| 后端健康检查 | ✅ `{"message":"Hello World"}` | < 2s |

### 1.2 调试问题记录

| # | 错误 | 原因 | 修复 |
|---|------|------|------|
| 1 | `Unsupported argument: zone_redundant_ha_enabled` | azurerm v4 属性名变更 | → `high_availability { mode = ... }`，再改为删除整个 block |
| 2 | `Unsupported argument: enable_non_ssl_port` | v4 改名 | → `non_ssl_port_enabled` |
| 3 | `Unsupported argument: enable_https_traffic_only` | v4 改名 | → `https_traffic_only_enabled` |
| 4 | CDN rule name 不能有连字符 | Azure 命名限制 | → `nocachehtml` / `longcacheassets` |
| 5 | `Error: creation of new CDN resources is no longer permitted` | Azure CDN (classic) 已停用 | → **移除 CDN**，直接用 Blob Static Website |
| 6 | `ContainerAppSecretRefNotFound` | ACA secrets 需 `secret` block（azurerm v3 风格） | → 改为 env `value` 直接注入（v4 无 `secret` block） |
| 7 | `UNAUTHORIZED: authentication required` | Docker Hub 镜像为私有 | → 使用 `python:3.10-slim` 占位（TODO: push 真实镜像） |
| 8 | `resource already exists` | 前次失败 apply 残留 | → `az containerapp delete` 手动删除后重试 |
| 9 | `storage_account_name deprecated` | v4 弃用 | → `storage_account_id` |
| 10 | Key Vault Secrets `resource already exists` | 前次部署 Key Vault 仍保留旧 secrets | → `terraform import` 将 5 个 secrets 逐条导入 state |
| 11 | Backend CrashLoopBackOff #1 | `ENVIRONMENT=prod` 不符合后端期望（需 `production`） | → 改为 `ENVIRONMENT=production` |
| 12 | Backend CrashLoopBackOff #2 | 缺少 `PROJECT_NAME` 环境变量 | → 添加 `PROJECT_NAME=ForeXchange` |
| 13 | `npm install` peer dependency conflict | `@react-jvectormap/core` 需要 React 16-18，项目用 React 19 | → `npm install --legacy-peer-deps` |
| 14 | `az storage blob upload-batch` 权限拒绝 | `--auth-mode login` 需要 Storage Blob Data Contributor 角色 | → 改用 `--account-key` 认证 |
| 15 | 前端仍请求 `localhost:8000`（CORS 报错） | `VITE_API_URL` 未在构建时正确注入 | → 创建 `.env.production`，Vite 构建时自动读取 |
| 16 | POST `/login/access-token` 返回 500 | 数据库表未创建 (`relation \"user\" does not exist`) | → ACA 启动命令加入 `bash scripts/prestart.sh` 建表+种子数据 |
| 17 | Key Vault Secrets 在手动删 RG 后仍 `already exists` | Key Vault 软删除：secrets 删除后保留 90 天，重建同名 KV 时旧 secrets 仍在 | → 见下方 §1.2.1 详细分析；根治方案：`keyvault.tf` 加 `purge_soft_delete_on_destroy = true` |

#### 1.2.1 案例：Key Vault 软删除导致 "resource already exists"

**现象**：手动在 Portal 删除 Resource Group → 删本地 `terraform.tfstate` → `terraform apply` 报错：
```
Error: a resource with the ID "https://kv-fx-prod-bb2e.vault.azure.net/secrets/..." already exists
```

**根因**：Azure Key Vault 默认启用**软删除（soft-delete）**，secrets 被删除后并不真删，而是保留 90 天（可恢复状态）。手动删 RG 绕过了 Terraform 的正常 destroy 流程，Terraform 不知道这些 secrets 还存在。重建同名 KV 后，旧 secrets 仍在 KV 中，Terraform 尝试创建同名 secret 时报冲突。

**临时修复**：
```bash
# 将 5 个残留 secrets 逐条导入 Terraform state
terraform import azurerm_key_vault_secret.postgres_password "https://kv-fx-prod-bb2e.vault.azure.net/secrets/postgres-password/<version-id>"
terraform import azurerm_key_vault_secret.app_secret_key "https://kv-fx-prod-bb2e.vault.azure.net/secrets/app-secret-key/<version-id>"
# ... (共 5 条)
terraform apply -auto-approve  # 同步 state
```

**根治方案**：`keyvault.tf` 添加 `purge_soft_delete_on_destroy = true`，之后 `terraform destroy` 会彻底清除 KV 及全部 secrets，不再残留。

**教训**：始终用 `terraform destroy` 而非手动删 RG。学生场景反复 create/destroy，软删除是常见陷阱。

### 1.3 成功部署的资源

| # | 资源 | 名称 | SKU | 状态 |
|---|------|------|-----|------|
| 1 | Resource Group | `rg-forexchange-prod` | — | ✅ |
| 2 | Storage Account (Shared) | `stfxprod79rfgv` | LRS | ✅ |
| 3 | Blob Static Website | `$web` | — | ✅ |
| 4 | Queue Storage | `remittance-queue` | — | ✅ |
| 5 | Log Analytics Workspace | `law-forexchange-prod` | PerGB2018 | ✅ |
| 6 | ACA Environment | `cae-forexchange-prod` | — | ✅ |
| 7 | ACA Backend (2 replicas) | `ca-backend-prod` | 1CPU/2Gi × 2 | ✅ |
| 8 | PostgreSQL Flexible Server | `psql-forexchange-prod` | B1ms, 32GB | ✅ |
| 9 | PostgreSQL Database | `forexchange` | — | ✅ |
| 10 | Key Vault | `kv-fx-prod-bb2e` | Standard | ✅ |
| 11 | Key Vault Secrets (5) | password/secret-key/etc | — | ✅ |
| 12 | PostgreSQL Firewall Rule | `allow-azure-services` | — | ✅ |

### 1.4 未部署的资源（架构调整）

| 资源 | 原因 |
|------|------|
| ~~Redis Cache~~ | Azure Cache for Redis 已退休（2025-10） |
| ~~CDN Profile + Endpoint~~ | Azure CDN (Standard Microsoft) 已停用新创建 |
| ~~ACA Frontend Container~~ | 前端改为 Blob Static Website（0 vCPU） |
| ~~Redis Connection Secret~~ | 随 Redis 一起移除 |

---

## 二、部署端点

### 2.1 生产 URL（固定不变，每次 apply 复用）

| 层 | URL |
|----|-----|
| **前端 (Blob Static)** | `https://stfxprod79rfgv.z8.web.core.windows.net/` |
| **后端 (ACA)** | `https://ca-backend-prod.wittyisland-5741be7f.australiaeast.azurecontainerapps.io` |
| **PostgreSQL** | `psql-forexchange-prod.postgres.database.azure.com:5432` |
| **Key Vault** | `https://kv-fx-prod-bb2e.vault.azure.net/` |
| **Queue** | `remittance-queue` @ `stfxprod79rfgv.queue.core.windows.net` |

> 所有名称使用固定后缀（`79rfgv` / `bb2e`），`terraform destroy` 后重新 `apply` 仍复用相同 URL。

### 2.2 vCPU 消耗（演示模式 — 直接用 max 副本）

```
配额上限:        6 vCPUs
ACA Backend (2 副本): 2 vCPUs ← 33% usage
其余 (PaaS):      0 vCPUs
安全余量:        4 vCPUs (67%)
```

> 演示前 `terraform apply`，演示后 `terraform destroy`，全程几小时。

---

## 三、后续 TODO（全部完成）

| # | 任务 | 状态 |
|---|------|------|
| 1 | `docker login` | ✅ 用户已配置 `minglai` |
| 2 | `docker build -t minglai/forexchange-backend:latest -f backend/Dockerfile .` | ✅ |
| 3 | `docker push minglai/forexchange-backend:latest` | ✅ |
| 4 | `bun run build` 构建前端 | ✅ |
| 5 | `az storage blob upload-batch` 上传 `dist/` 到 Blob `$web` | ✅ |
| 6 | `terraform apply` 用真实镜像部署 | ✅ |
| 7 | 验证后端健康检查 | ✅ `{"message":"Hello World"}` |
| 8 | 浏览器验证前端页面 | ✅ 打开显示 ForeXchange 登录页 |

---

## 四、成本（演示场景 — 只跑几小时）

| 资源 | 按小时估算 | 月费（如不销毁） |
|------|-----------|-----------------|
| Storage Account + Queue | < $0.01 | ~$1 |
| ACA Backend (2 副本, 1CPU/2Gi) | ~$0.04/h | ~$30 |
| PostgreSQL B1ms (32GB) | ~$0.05/h | ~$36 |
| Log Analytics | < $0.01 | ~$3 |
| Key Vault | < $0.01 | ~$1 |
| **演示 4 小时合计** | **~$0.40** | — |
| **月费（不 destroy）** | — | **~$71** |

> `terraform destroy` 后费用归零。每月 $100 credit 轻松覆盖。

---

## 五、文件清单

### 5.1 Terraform (`tf/`)

```
tf/
├── main.tf              # Provider + Resource Group
├── variables.tf          # 22 参数（dockerhub: minglai, location: australiaeast）
├── terraform.tfvars      # 实际值（含密码，.gitignore 排除，内网传递）
├── terraform.tfvars.example  # 模板（可安全提交 Git）
├── outputs.tf            # 11 输出（URL + FQDN + KV + DB）
├── storage.tf            # StorageV2 (Blob $web + Queue 共用, 固定后缀)
├── postgresql.tf         # PostgreSQL Flexible B1ms + DB + 防火墙 + SSL
├── containerapps.tf       # ACA Env + Backend (2 副本, prestart 建表, minglai 镜像)
├── keyvault.tf           # Key Vault + 5 Secrets
└── .gitignore
```

### 5.2 前端双环境配置 (`frontend/`)

```
frontend/
├── .env                  # 本地开发: VITE_API_URL=http://localhost:8000
├── .env.production       # 云端部署（deploy-frontend.ps1 自动生成，.gitignore 排除）
├── .env.production.example  # 模板（可安全提交 Git）
├── deploy-frontend.ps1   # 一键部署脚本：读 terraform output → 更新 .env → 构建 → 上传
└── .gitignore            # 已排除 *.local 和 .env.production
```

> **设计说明**: `deploy-frontend.ps1` 自动从 `terraform output` 读取后端 URL，
> 写入 `.env.production` 后构建上传。**每次 destroy 后重建无需手动改任何 URL。**
