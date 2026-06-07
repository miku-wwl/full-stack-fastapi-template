# ─────────────────────────────────────────────────────────────
# ForeXchange — Azure Key Vault（机密管理）
# ─────────────────────────────────────────────────────────────

data "azurerm_client_config" "current" {}

# Fixed suffix so URL stays stable across redeploys
# Key Vault name: kv-fx-prod-bb2e
resource "azurerm_key_vault" "kv" {
  name                = "kv-fx-${var.environment}-bb2e"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  tenant_id = data.azurerm_client_config.current.tenant_id

  sku_name = "standard"

  # 允许当前用户（你 / CLI 登录身份）访问
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Create", "Delete", "Update"
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
    ]
  }

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Secrets
# ─────────────────────────────────────────────────────────────

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

resource "azurerm_key_vault_secret" "first_superuser_password" {
  name         = "first-superuser-password"
  key_vault_id = azurerm_key_vault.kv.id
  value        = var.first_superuser_password
}

resource "azurerm_key_vault_secret" "smtp_password" {
  name         = "smtp-password"
  key_vault_id = azurerm_key_vault.kv.id
  value        = var.smtp_password
}

resource "azurerm_key_vault_secret" "queue_connection_string" {
  name         = "queue-connection-string"
  key_vault_id = azurerm_key_vault.kv.id
  value        = azurerm_storage_account.shared.primary_connection_string
}


