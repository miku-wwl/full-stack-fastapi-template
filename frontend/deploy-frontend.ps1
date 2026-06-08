# ─────────────────────────────────────────────────────────────
# ForeXchange — 前端一键部署脚本
# 用法: .\deploy-frontend.ps1
# 自动读取 terraform output 的 backend_url，更新 .env.production，构建并上传
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1. 从 terraform output 获取后端 URL
Write-Host "📡 读取 Terraform outputs..." -ForegroundColor Cyan
$backendUrl = (terraform '-chdir=../tf' output -raw backend_url).TrimEnd('/')
Write-Host "   后端 URL: $backendUrl" -ForegroundColor Green

# 2. 写入 .env.production
Write-Host "📝 更新 .env.production..." -ForegroundColor Cyan
"VITE_API_URL=$backendUrl" | Set-Content -Path ".env.production" -NoNewline
Write-Host "   ✅ 已写入" -ForegroundColor Green

# 3. 构建前端
Write-Host "🔨 构建前端..." -ForegroundColor Cyan
npm run build
Write-Host "   ✅ 构建完成" -ForegroundColor Green

# 4. 获取 Storage Account Key 并上传
Write-Host "📤 上传到 Blob Static Website..." -ForegroundColor Cyan
$accountName = (terraform '-chdir=../tf' output -raw storage_account_name)
$rgName = (terraform '-chdir=../tf' output -raw resource_group_name)
$key = (az storage account keys list --account-name $accountName --resource-group $rgName --query "[0].value" -o tsv)
az storage blob upload-batch --account-name $accountName --account-key $key --destination '$web' --source ./dist --overwrite --no-progress
Write-Host "   ✅ 上传完成" -ForegroundColor Green

# 5. 输出结果
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  🚀 部署完成！" -ForegroundColor Yellow
Write-Host "  前端: https://${accountName}.z8.web.core.windows.net/" -ForegroundColor Cyan
Write-Host "  后端: $backendUrl" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
