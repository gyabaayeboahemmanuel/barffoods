#!/bin/bash
# Run on server via: bash -s < server-git-init.sh
# Backs up storage and .env, inits git, pulls from GitHub, restores backup.

set -e
REMOTE_PATH="/home/gekymedia/web/barffoods.com/public_html"
REPO_URL="https://github.com/gyabaayeboahemmanuel/barffoods.git"

cd "$REMOTE_PATH" || { echo "Error: directory not found: $REMOTE_PATH"; exit 1; }

BACKUP="/tmp/barffoods-backup-$(date +%Y%m%d%H%M%S)"
echo "--- Backing up storage and .env to $BACKUP ---"
mkdir -p "$BACKUP"
cp -a storage "$BACKUP/storage" 2>/dev/null || true
cp -a .env "$BACKUP/.env" 2>/dev/null || true
if [ -d public/storage ]; then cp -a public/storage "$BACKUP/public_storage" 2>/dev/null || true; fi

echo "--- Initializing git and pulling from GitHub ---"
rm -rf .git 2>/dev/null || true
git init
git remote add origin "$REPO_URL"
git fetch origin main
git reset --hard origin/main

echo "--- Restoring storage and .env ---"
rm -rf storage
cp -a "$BACKUP/storage" ./storage 2>/dev/null || true
cp "$BACKUP/.env" .env 2>/dev/null || true
if [ -d "$BACKUP/public_storage" ]; then cp -a "$BACKUP/public_storage"/* public/storage/ 2>/dev/null || true; fi

echo "--- Composer install ---"
composer install --no-dev --optimize-autoloader --no-interaction

echo "--- NPM install and build ---"
npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund
npm run build

echo "--- Laravel optimize ---"
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
( php artisan queue:restart 2>/dev/null ) || true

echo "--- Done. Storage and .env kept intact. ---"
