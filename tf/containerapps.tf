# ─────────────────────────────────────────────────────────────
# ForeXchange — Azure Container Apps
# 学生优化：仅 Backend（无前端容器），max=2 副本
# ─────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────
# Log Analytics Workspace（ACA 环境必需）
# ─────────────────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  sku               = "PerGB2018"
  retention_in_days = 30

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Container Apps Environment
# ─────────────────────────────────────────────────────────────

resource "azurerm_container_app_environment" "env" {
  name                = "cae-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Backend Container App
# ─────────────────────────────────────────────────────────────

resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.environment}"
  resource_group_name          = azurerm_resource_group.rg.name
  container_app_environment_id = azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  # ── Template ─────────────────────────────────────────────

  template {
    min_replicas = var.aca_max_replicas # 演示：直接用 max 副本 (2 vCPU)
    max_replicas = var.aca_max_replicas # 2 (学生 6 vCPU 硬限制)

    container {
      name   = "backend"
      # TODO: Replace with actual Docker Hub image after push:
      #   docker build -t weilathefox/forexchange-backend:latest -f backend/Dockerfile .
      #   docker push weilathefox/forexchange-backend:latest
      # Then change image to: "docker.io/weilathefox/forexchange-backend:latest"
      image  = "docker.io/minglai/forexchange-backend:latest"
      cpu    = var.aca_backend_cpu    # 1.0
      memory = var.aca_backend_memory # "2Gi"

      # ── 环境变量 ────────────────────────────────────────

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
        value = azurerm_postgresql_flexible_server_database.app.name
      }
      env {
        name  = "POSTGRES_USER"
        value = var.postgres_admin_login
      }
      env {
        name  = "PROJECT_NAME"
        value = "ForeXchange"
      }
      env {
        name  = "ENVIRONMENT"
        value = "production"
      }
      env {
        name  = "DOMAIN"
        value = var.location
      }
      env {
        name  = "FRONTEND_HOST"
        value = azurerm_storage_account.shared.primary_web_endpoint
      }
      env {
        name  = "BACKEND_CORS_ORIGINS"
        value = azurerm_storage_account.shared.primary_web_endpoint
      }
      env {
        name  = "FIRST_SUPERUSER"
        value = var.first_superuser_email
      }
      env {
        name  = "AZURE_QUEUE_CONNECTION_STRING"
        value = azurerm_storage_account.shared.primary_connection_string
      }
      env {
        name  = "AZURE_QUEUE_NAME"
        value = azurerm_storage_queue.remittance.name
      }
      # Note: Redis removed (Azure Cache for Redis is retired).
      # Backend uses PostgreSQL for rates with built-in fallback.

      # ── 可选环境变量 ──────────────────────────────────

      env {
        name  = "SMTP_HOST"
        value = var.smtp_host
      }
      env {
        name  = "SMTP_USER"
        value = var.smtp_user
      }
      env {
        name  = "EMAILS_FROM_EMAIL"
        value = var.emails_from_email
      }
      env {
        name  = "SENTRY_DSN"
        value = var.sentry_dsn
      }

      # ── 机密环境变量（ACA 直接注入值） ──────────────────

      env {
        name  = "POSTGRES_PASSWORD"
        value = var.postgres_admin_password
      }
      env {
        name  = "SECRET_KEY"
        value = var.app_secret_key
      }
      env {
        name  = "FIRST_SUPERUSER_PASSWORD"
        value = var.first_superuser_password
      }
      env {
        name  = "SMTP_PASSWORD"
        value = var.smtp_password
      }
    }
  }

  # ── Ingress (External HTTPS) ────────────────────────────

  ingress {
    external_enabled = true
    target_port      = 8000
    transport        = "http"
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  # ── Docker Hub 注册表身份验证 ───────────────────────────

  # 如果 Docker Hub 仓库是公开的，无需 registry 块
  # 如果是私有的，需要注册表凭据
  # registry {
  #   server   = "docker.io"
  #   username = var.dockerhub_username
  #   password_secret_name = "dockerhub-password"
  # }

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}
