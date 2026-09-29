# BarfFoods Production Deployment Script (PowerShell)
# Live site: https://barffoods.com
#
# Defaults still target the legacy Hestia host. For Hostinger, set:
#   $env:VPS_HOST = "<HOSTINGER_IP>"
#   $env:VPS_USER = "root"
#   $env:DEPLOY_PATH = "/var/www/barffoods.com"
#     or Hestia: "/home/<user>/web/barffoods.com/public_html"
# See docs/HOSTINGER_VPS_MIGRATION.md
# First time on a new server? Run .\deploy\hostinger\setup-site.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$VpsHost = if ($env:VPS_HOST) { $env:VPS_HOST } else { "gekymedia.com" }
$VpsUser = if ($env:VPS_USER) { $env:VPS_USER } else { "root" }
$DeployPath = if ($env:DEPLOY_PATH) { $env:DEPLOY_PATH } else { "/home/gekymedia/web/barffoods.com/public_html" }

Write-Host "Committing and pushing local changes..." -ForegroundColor Cyan
git add .
$commitMsg = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMsg 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "No changes to commit (working tree clean)" -ForegroundColor Yellow }
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Push failed. Aborting deploy." -ForegroundColor Red; exit 1 }

Write-Host "Deploying to ${VpsUser}@${VpsHost}:${DeployPath}..." -ForegroundColor Cyan
$remoteCmd = "cd '${DeployPath}' && git pull origin main && composer install --no-dev --optimize-autoloader --no-interaction && npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund && npm run build && php artisan migrate --force && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize && php artisan queue:restart 2>/dev/null || true && echo Deploy done."
ssh "${VpsUser}@${VpsHost}" $remoteCmd
if ($LASTEXITCODE -ne 0) { Write-Host "Remote deploy failed." -ForegroundColor Red; exit 1 }
Write-Host "Deploy complete." -ForegroundColor Green
