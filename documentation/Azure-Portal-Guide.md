# ForeXchange — Azure Portal Configuration Guide

> **Date**: 2026-07-10
> **Project**: ForeXchange — Real-Time Remittance & Compliance Monitoring Platform
> **Language**: English (original Chinese version below)

---

## Overview

This guide provides step-by-step instructions for configuring ForeXchange resources in the Azure Portal. It covers Container Apps, PostgreSQL Flexible Server, Key Vault, and Storage Account setup.

**Prerequisites:**
- Active Azure for Students subscription
- Contributor role access
- Terraform CLI installed (for initial deployment)

See the Chinese section below for detailed step-by-step instructions with screenshots.

---

# ForeXchange — Azure Portal 验证指南 & 学习手册

> **适用角色**: 学生 / 初学者  
> **前置**: Azure for Students 订阅 + Terraform 部署完成  

---

## Part A: Portal 验证清单

### A.1 资源组（Resource Group）

```
Azure Portal → 资源组 → rg-forexchange-prod
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| 资源存在 | 查看 Overview | 8+ 资源全部显示 "Succeeded" |
| 位置 | 查看 Overview 顶部 | `australiaeast` |
| Cost | 左侧 Cost Management | 查看当前费用 |

### A.2 PostgreSQL Flexible Server

```
rg-forexchange-prod → psql-forexchange-prod
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| 服务器运行 | Overview → Status | **Available** |
| SKU | Settings → Compute + Storage | `B_Standard_B1ms` (1 vCore, 2 GB) |
| 存储 | Settings → Compute + Storage | 32 GB |
| 数据库 | Settings → Databases | `forexchange` 存在 |
| SSL 强制 | Settings → Server parameters → `require_secure_transport` | **ON** |
| 防火墙 | Settings → Networking → Public access | Allow Azure services |
| 备份 | Settings → Backup | 7 天自动备份 |

📸 **截图位置**: `______`

### A.3 Storage Account

```
rg-forexchange-prod → stfxprod***
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| 静态网站 | Data management → Static website | **Enabled**, index=`index.html`, error=`index.html` |
| 队列 | Data storage → Queues | `remittance-queue` 存在 |
| 复制 | Overview → Redundancy | **LRS** |
| 主终结点 | Overview → Endpoints | Blob + Queue URL 可见 |

📸 **截图位置**: `______`

### A.4 Container Apps Environment + Backend

```
rg-forexchange-prod → ca-backend-prod
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| ACA 运行 | Overview → Application Url | URL 可访问，返回 `{"message":"Hello World"}` |
| 副本 | Revisions and replicas | 2 个活跃副本 |
| CPU/Mem | Containers → backend | 1 vCPU / 2 GiB |
| Ingress | Settings → Ingress | **Enabled**, target port 8000 |
| 缩放规则 | Settings → Scale | min=2, max=2 (固定) |
| 环境变量 | Containers → backend → Environment variables | PROJECT_NAME=ForeXchange, ENVIRONMENT=production |

📸 **截图位置**: `______`

### A.5 Key Vault

```
rg-forexchange-prod → kv-fx-prod-****
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| Secrets | Objects → Secrets | 5 个 secrets 存在 |
| `postgres-password` | 点击 → Current Version | 显示密码值 |
| `app-secret-key` | 点击 → Current Version | 显示 64 字符密钥 |

📸 **截图位置**: `______`

### A.6 Log Analytics

```
rg-forexchange-prod → law-forexchange-prod
```

| 验证项 | 步骤 | 期望 |
|--------|------|------|
| Workspace | Overview | SKU: PerGB2018, 30 days retention |

---

## Part B: Portal 学习指南

### B.1 核心概念速查

| 概念 | Azure Portal 位置 | 作用 |
|------|-------------------|------|
| **Resource Group** | Portal 首页 → Resource groups | 所有资源的逻辑容器，删除 RG = 删除所有资源 |
| **Subscription** | Portal 顶栏 | 计费单位，学生订阅 $100 信用额度 |
| **FQDN** | 资源 Overview | Fully Qualified Domain Name，服务的可访问域名 |
| **SKU** | 资源的 Pricing tier | 决定性能和费用（B1ms = Burstable, 1 vCore） |
| **LRS / GRS** | Storage Account → Redundancy | 本地冗余 / 全局冗余 |

### B.2 Portal 快捷操作

| 操作 | 导航路径 |
|------|----------|
| 查看所有资源 | Portal 首页 → All resources |
| 按标签筛选 | All resources → Add filter → Tags → `project=forexchange` |
| 查看费用 | Portal → Subscriptions → Azure for Students → Cost analysis |
| 查看配额 | Portal → Subscriptions → Usage + quotas |
| 停止 PostgreSQL（省钱） | PostgreSQL → Overview → Stop |
| 启动 PostgreSQL | PostgreSQL → Overview → Start |
| 重启 ACA | Container App → Overview → Stop → Start |
| 查看 ACA 日志 | Container App → Monitoring → Log stream |
| 上传文件到 Blob | Storage Account → Storage browser → `$web` → Upload |

### B.3 错误排查技巧

| 症状 | 排查步骤 |
|------|---------|
| ACA 503 / 不健康 | Container App → Revisions → 查看 Provisioning State + Logs |
| PostgreSQL 连接拒绝 | → Networking → 检查防火墙规则 |
| 静态网站 404 | → Storage Account → Static website → 确认 `index.html` 已上传 |
| Terraform apply 失败 | → `terraform plan -no-color` 查看完整错误 → 对照本文 Part C 的调试记录 |

### B.4 演示操作（terraform apply / destroy）

```bash
# 演示前 — 一键部署全栈
cd tf
terraform apply -auto-approve

# 演示后 — 一键销毁（省钱）
cd tf
terraform destroy -auto-approve
```

> 💡 学生场景：演示前 `apply`（~5min），演示后 `destroy`（~8min）。全栈按小时计费，几小时仅 ~$0.40，远低于 $100 credit。

---

## Part C: 学期项目展示要点

### C.1 Portal 截图素材

| 场景 | 截图内容 |
|------|----------|
| 架构全景 | Resource Group Overview（8+ 资源同框） |
| 前端 | 浏览器打开 `https://stfxprod79rfgv.z8.web.core.windows.net/` |
| 后端 | `curl https://ca-backend-prod.wittyisland-5741be7f.australiaeast.azurecontainerapps.io/api/v1/utils/health-check/` → `{"message":"Hello World"}` |
| 数据库 | PostgreSQL → Metrics → Active Connections |
| 固定副本 | ACA → Scale → min=2, max=2 |
| 安全 | Key Vault → Secrets（打码后） |
| 成本 | Cost Management → 月度费用明细 |
| 日志 | Log Analytics → 查询 ACA 容器日志 |

### C.2 展示话术模板

> "ForeXchange 是一个高可用实时换汇与合规审计平台，部署在 Azure australiaeast 区域。
> 前端采用 Blob Static Website + SPA 架构，后端运行在 Azure Container Apps 上，
> 配置 2 固定副本确保高可用。数据库使用 PostgreSQL Flexible Server (B1ms)，
> 异步换汇通过 Queue Storage 解耦。Docker 镜像通过 GitHub Actions 自动构建推送到 Docker Hub。
> 全栈通过 Terraform 代码化部署，一条命令即可完成所有资源的创建和销毁。"
