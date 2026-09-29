# One-time: clone Barf Foods onto the new Hostinger VPS and install deps.
# Set these before running:
#   $env:VPS_HOST = "1.2.3.4"
#   $env:VPS_USER = "root"   # optional, default root
#   $env:DEPLOY_PATH = "/var/www/barffoods.com"  # or Hestia public_html path
#   $env:GIT_REPO = "https://github.com/gyabaayeboahemmanuel/barffoods.git"  # optional

$ErrorActionPreference = "Stop"

$VpsHost = $env:VPS_HOST
$VpsUser = if ($env:VPS_USER) { $env:VPS_USER } else { "root" }
$DeployPath = if ($env:DEPLOY_PATH) { $env:DEPLOY_PATH } else { "/var/www/barffoods.com" }
$GitRepo = if ($env:GIT_REPO) { $env:GIT_REPO } else { "https://github.com/gyabaayeboahemmanuel/barffoods.git" }

if (-not $VpsHost) {
    Write-Host "Set VPS_HOST to your Hostinger VPS IP first." -ForegroundColor Red
    exit 1
}

Write-Host "Setting up ${DeployPath} on ${VpsUser}@${VpsHost}..." -ForegroundColor Cyan

$remote = @"
set -e
mkdir -p '$(Split-Path $DeployPath -Parent)'
if [ ! -d '${DeployPath}/.git' ]; then
  if [ -d '${DeployPath}' ] && [ -n "`$(ls -A '${DeployPath}' 2>/dev/null || true)" ]; then
    echo 'Target exists and is not empty — aborting'
    exit 1
  fi
  git clone '${GitRepo}' '${DeployPath}'
fi
cd '${DeployPath}'
composer install --no-dev --optimize-autoloader --no-interaction
[ -f .env ] || cp .env.example .env
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
echo 'Clone + composer done. Configure .env, import DB, restore storage, then deploy.ps1'
"@

ssh "${VpsUser}@${VpsHost}" $remote
Write-Host "Done." -ForegroundColor Green
