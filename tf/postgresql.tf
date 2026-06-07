# ─────────────────────────────────────────────────────────────
# ForeXchange — Azure PostgreSQL Flexible Server
# ─────────────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server" "db" {
  name                = "psql-forexchange-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  version = var.postgres_version # "16"

  # Burstable SKU（学生友好）
  sku_name = var.postgres_sku_name # "B_Standard_B1ms"

  storage_mb = var.postgres_storage_mb # 32768

  administrator_login    = var.postgres_admin_login
  administrator_password = var.postgres_admin_password

  # 公网访问（仅 Azure 服务 IP 白名单）
  public_network_access_enabled = true

  # SSL 强制
  # Note: PostgreSQL Flexible Server enforces SSL by default

  backup_retention_days = 7

  # 不启用多可用区（学生不需要）
  zone = "1"

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Firewall — 允许 Azure 服务访问 + 本地开发 IP
# ─────────────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0" # Azure 内部由服务端点控制实际范围
}

# 可选：本地开发机 IP（部署时可用 terraform apply -var 传入）
# resource "azurerm_postgresql_flexible_server_firewall_rule" "local_dev" {
#   name             = "allow-local-dev"
#   server_id        = azurerm_postgresql_flexible_server.db.id
#   start_ip_address = var.local_dev_ip
#   end_ip_address   = var.local_dev_ip
# }

# ─────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.postgres_db_name # "forexchange"
  server_id = azurerm_postgresql_flexible_server.db.id
}

# ─────────────────────────────────────────────────────────────
# PostgreSQL 配置：强制 SSL
# ─────────────────────────────────────────────────────────────

resource "azurerm_postgresql_flexible_server_configuration" "ssl_enforce" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "on"
}
