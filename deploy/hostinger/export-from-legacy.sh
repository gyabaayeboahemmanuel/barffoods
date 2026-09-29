#!/usr/bin/env bash
# Run ON the legacy server (gekymedia.com) to export DB + storage for Hostinger.
# Usage:
#   bash export-from-legacy.sh <db_name> <db_user> [app_root]
set -euo pipefail

DB_NAME="${1:?Usage: export-from-legacy.sh <db_name> <db_user> [app_root]}"
DB_USER="${2:?Usage: export-from-legacy.sh <db_name> <db_user> [app_root]}"
APP_ROOT="${3:-/home/gekymedia/web/barffoods.com/public_html}"
OUT_DIR="${OUT_DIR:-/tmp/hostinger-migration}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "${OUT_DIR}"
echo "==> Dumping MySQL ${DB_NAME}"
mysqldump -u "${DB_USER}" -p --single-transaction --routines --triggers "${DB_NAME}" \
  | gzip > "${OUT_DIR}/${DB_NAME}-${STAMP}.sql.gz"

echo "==> Archiving storage from ${APP_ROOT}"
tar -C "${APP_ROOT}" -czf "${OUT_DIR}/storage-${STAMP}.tar.gz" \
  --exclude='storage/framework/cache/*' \
  --exclude='storage/framework/sessions/*' \
  --exclude='storage/framework/views/*' \
  storage/app .env 2>/dev/null || \
tar -C "${APP_ROOT}" -czf "${OUT_DIR}/storage-${STAMP}.tar.gz" storage/app .env

echo ""
echo "Exports ready in ${OUT_DIR}:"
ls -lh "${OUT_DIR}"/*"${STAMP}"*
echo ""
echo "Copy to Hostinger:"
echo "  scp ${OUT_DIR}/*${STAMP}* root@<HOSTINGER_IP>:/tmp/"
