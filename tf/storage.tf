# ─────────────────────────────────────────────────────────────
# ForeXchange — Storage Account (Blob Static Website + Queue)
# 学生优化：单个 StorageV2 账户共用 Blob 和 Queue
# ─────────────────────────────────────────────────────────────

# Fixed suffix so URL stays stable across redeploys
# Storage account name: must be 3-24 chars, lowercase, unique globally
# We use: stfx + env + 6-char fixed hash = stfxprod79rfgv
resource "azurerm_storage_account" "shared" {
  name                     = "stfx${var.environment}79rfgv"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location

  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  # Note: Static Website enabled via azurerm_storage_account_static_website below
  # (The inline static_website block is deprecated in azurerm v4.x)

  # 强制 HTTPS
  https_traffic_only_enabled = true
  min_tls_version           = "TLS1_2"

  tags = {
    project = "forexchange"
    env     = var.environment
  }
}

# ─────────────────────────────────────────────────────────────
# Queue Storage（与 Blob 共用 Storage Account）
# ─────────────────────────────────────────────────────────────

resource "azurerm_storage_queue" "remittance" {
  name               = "remittance-queue"
  storage_account_id = azurerm_storage_account.shared.id
}

# ─────────────────────────────────────────────────────────────
# Static Website (separate resource — azurerm v4.x)
# ─────────────────────────────────────────────────────────────

resource "azurerm_storage_account_static_website" "frontend" {
  storage_account_id = azurerm_storage_account.shared.id
  index_document     = "index.html"
  error_404_document = "index.html" # SPA fallback
}
