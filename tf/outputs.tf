# ─────────────────────────────────────────────────────────────
# ForeXchange — Outputs
# ─────────────────────────────────────────────────────────────

output "resource_group_name" {
  description = "Resource Group name"
  value       = azurerm_resource_group.rg.name
}

# ── Frontend (Blob Static Website) ──────────────────────────

output "frontend_url" {
  description = "Frontend URL (Blob Static Website)"
  value       = azurerm_storage_account.shared.primary_web_endpoint
}

# ── Backend ──────────────────────────────────────────────────

output "backend_fqdn" {
  description = "Backend Container App FQDN"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "backend_url" {
  description = "Backend full URL"
  value       = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
}

# ── PostgreSQL ───────────────────────────────────────────────

output "postgresql_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.db.fqdn
}

output "postgresql_db_name" {
  description = "PostgreSQL database name"
  value       = azurerm_postgresql_flexible_server_database.app.name
}

# ── Queue ────────────────────────────────────────────────────

output "queue_name" {
  description = "Remittance queue name"
  value       = azurerm_storage_queue.remittance.name
}

output "storage_account_name" {
  description = "Shared Storage Account name"
  value       = azurerm_storage_account.shared.name
}

# ── Key Vault ────────────────────────────────────────────────

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.kv.vault_uri
}

# ── Quick-Start ──────────────────────────────────────────────

output "deployment_summary" {
  description = "Deployment summary"
  value = <<EOT

═══════════════════════════════════════════════════════════════
  ForeXchange Deployment Complete!
═══════════════════════════════════════════════════════════════

  Frontend:  ${azurerm_storage_account.shared.primary_web_endpoint}
  Backend:   ${azurerm_container_app.backend.latest_revision_fqdn}
  PostgreSQL: ${azurerm_postgresql_flexible_server.db.fqdn}

═══════════════════════════════════════════════════════════════
EOT
}
