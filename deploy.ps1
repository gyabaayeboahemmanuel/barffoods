# BarfFoods Production Deployment Script (PowerShell)
# Live site: https://barffoods.com
# Server: gekymedia.com
# Path: /home/gekymedia/web/barffoods.com/public_html
# First time? Run .\server-setup.ps1 once to clone and set up the server.

$ErrorActionPreference = "Stop"

# Run from script directory so git runs in the project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Committing and pushing local changes..." -ForegroundColor Cyan
git add .
$commitMsg = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMsg 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "No changes to commit (working tree clean)" -ForegroundColor Yellow }
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Push failed. Aborting deploy." -ForegroundColor Red; exit 1 }

Write-Host "Deploying to production..." -ForegroundColor Cyan
$remotePath = "/home/gekymedia/web/barffoods.com/public_html"
$remoteCmd = "cd $remotePath && git pull origin main && composer install --no-dev --optimize-autoloader --no-interaction && npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund && npm run build && php artisan migrate --force && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize && php artisan queue:restart 2>/dev/null || true && echo Deploy done."
ssh root@gekymedia.com $remoteCmd
if ($LASTEXITCODE -ne 0) { Write-Host "Remote deploy failed." -ForegroundColor Red; exit 1 }
Write-Host "Deploy complete." -ForegroundColor Green
