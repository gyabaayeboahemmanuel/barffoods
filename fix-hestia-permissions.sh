#!/bin/bash
# Fix permissions so: (1) Hestia user can upload via file manager, (2) Laravel can write to storage.
# Run as root on server: bash fix-hestia-permissions.sh

set -e
DIR="${1:-/home/gekymedia/web/barffoods.com/public_html}"
WEB_USER="${2:-www-data}"
# User that owns the domain in Hestia (can upload via file manager)
FILES_USER="${3:-gekymedia}"

echo "Fixing permissions for: $DIR"
echo "Web server user: $WEB_USER | File manager user: $FILES_USER"

# Whole project owned by FILES_USER so Hestia uploads work
chown -R "$FILES_USER:$FILES_USER" "$DIR"
# Default dir and file perms (faster than find)
chmod -R u+rwX,go+rX,go-w "$DIR"

# storage and bootstrap/cache must be writable by web server
mkdir -p "$DIR/storage/framework"{/sessions,/views,/cache} "$DIR/storage/logs" "$DIR/bootstrap/cache"
chown -R "$WEB_USER:$FILES_USER" "$DIR/storage" "$DIR/bootstrap/cache"
chmod -R 775 "$DIR/storage" "$DIR/bootstrap/cache"

# Ensure www-data is in FILES_USER group so it can write to group-owned dirs
if getent group "$FILES_USER" >/dev/null; then
  usermod -aG "$FILES_USER" "$WEB_USER" 2>/dev/null || true
fi

echo "Done. You can upload files via Hestia file manager now."
echo "After uploading storage.zip, run: bash extract-storage-zip.sh"
