#!/bin/bash
# Restore .env and storage from backup on server.
set -e
BACKUP="${1:-/tmp/barffoods-backup-20260223142516}"
LIVE="${2:-/home/gekymedia/web/barffoods.com/public_html}"
WEB_USER="${3:-www-data}"

if [ ! -d "$BACKUP" ]; then echo "Error: Backup not found at $BACKUP"; exit 1; fi
if [ ! -d "$LIVE" ]; then echo "Error: Live path not found at $LIVE"; exit 1; fi

echo "Restoring .env..."
cp "$BACKUP/.env" "$LIVE/.env"

echo "Restoring storage..."
rm -rf "$LIVE/storage"
cp -a "$BACKUP/storage" "$LIVE/storage"

echo "Fixing permissions (owner: $WEB_USER)..."
chown -R "$WEB_USER:$WEB_USER" "$LIVE/storage" "$LIVE/bootstrap/cache"
chmod -R 775 "$LIVE/storage" "$LIVE/bootstrap/cache"

echo "Done. .env and storage restored."
