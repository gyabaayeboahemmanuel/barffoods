#!/usr/bin/env bash
# Run ON the Hostinger VPS after copying exports into /tmp.
# Usage:
#   bash import-on-hostinger.sh <db_name> <db_user> <app_root> <sql.gz> <storage.tar.gz>
set -euo pipefail

DB_NAME="${1:?Usage: import-on-hostinger.sh <db_name> <db_user> <app_root> <sql.gz> <storage.tar.gz>}"
DB_USER="${2:?}"
APP_ROOT="${3:?}"
SQL_GZ="${4:?}"
STORAGE_TGZ="${5:?}"

echo "==> Importing database ${DB_NAME}"
gunzip -c "${SQL_GZ}" | mysql -u "${DB_USER}" -p "${DB_NAME}"

echo "==> Restoring storage + .env into ${APP_ROOT}"
tar -C "${APP_ROOT}" -xzf "${STORAGE_TGZ}"
cd "${APP_ROOT}"
php artisan storage:link || true
mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "==> Clearing / rebuilding caches"
php artisan optimize:clear || true
php artisan migrate --force
php artisan optimize || true

echo "Import complete. Verify APP_URL / DB_* in .env, then issue SSL and flip DNS."
