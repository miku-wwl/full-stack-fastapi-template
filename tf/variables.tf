# ─────────────────────────────────────────────────────────────
# ForeXchange — 变量定义
# ─────────────────────────────────────────────────────────────

# ── Azure 基础 ──────────────────────────────────────────────

variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "environment" {
  description = "Environment name (dev / prod)"
  type        = string
  default     = "prod"
}

# ── Docker Hub ───────────────────────────────────────────────

variable "dockerhub_username" {
  description = "Docker Hub username for container images"
  type        = string
  default     = "minglai"
}

variable "backend_image_tag" {
  description = "Backend Docker image tag"
  type        = string
  default     = "latest"
}

# ── PostgreSQL ───────────────────────────────────────────────

variable "postgres_admin_login" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "psqladmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "postgres_sku_name" {
  description = "PostgreSQL SKU"
  type        = string
  default     = "B_Standard_B1ms" # Burstable 1 vCore, 2 GB RAM
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage size (MB)"
  type        = number
  default     = 32768 # 32 GB
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "postgres_db_name" {
  description = "Application database name"
  type        = string
  default     = "forexchange"
}

# ── Redis ────────────────────────────────────────────────────

variable "redis_sku_name" {
  description = "Redis Cache SKU"
  type        = string
  default     = "Basic" # Basic C0
}

variable "redis_family" {
  description = "Redis family"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Redis Cache capacity (GB)"
  type        = number
  default     = 0 # 0 = 250 MB (C0); 1 = 1 GB (C1)
}

# ── Container Apps ───────────────────────────────────────────

variable "aca_backend_cpu" {
  description = "Backend ACA CPU (vCPUs)"
  type        = number
  default     = 1.0
}

variable "aca_backend_memory" {
  description = "Backend ACA memory (GiB)"
  type        = string
  default     = "2Gi"
}

variable "aca_min_replicas" {
  description = "Minimum backend replicas"
  type        = number
  default     = 1
}

variable "aca_max_replicas" {
  description = "Maximum backend replicas (学生 6 vCPU 限制 → max=2)"
  type        = number
  default     = 2
}

# ── App Secrets ──────────────────────────────────────────────

variable "app_secret_key" {
  description = "FastAPI SECRET_KEY for JWT signing (at least 32 chars)"
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

variable "smtp_host" {
  description = "SMTP host (optional — 学生部署可留空)"
  type        = string
  default     = ""
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
  default     = ""
}

variable "smtp_password" {
  description = "SMTP password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "emails_from_email" {
  description = "Sender email address"
  type        = string
  default     = "noreply@forexchange.io"
}

variable "sentry_dsn" {
  description = "Sentry DSN (optional)"
  type        = string
  default     = ""
}
