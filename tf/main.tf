# ─────────────────────────────────────────────────────────────
# ForeXchange — Terraform 全栈部署（学生优化版）
# Provider + Resource Group
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# ─────────────────────────────────────────────────────────────
# Resource Group
# ─────────────────────────────────────────────────────────────

resource "azurerm_resource_group" "rg" {
  name     = "rg-forexchange-${var.environment}"
  location = var.location
}
