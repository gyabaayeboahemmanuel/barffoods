#!/bin/bash
# Extract storage.zip in project and fix permissions. Run as root on server after uploading the zip.
set -e
DIR="${1:-/home/gekymedia/web/barffoods.com/public_html}"
WEB_USER="${2:-www-data}"
ZIP="$DIR/storage.zip"

if [ ! -f "$ZIP" ]; then
  echo "Error: $ZIP not found. Upload storage.zip to the project root via Hestia file manager first."
  exit 1
fi

echo "Extracting $ZIP in $DIR..."
cd "$DIR"
# Backup current storage
if [ -d storage ]; then
  mv storage "/tmp/storage-old-$(date +%Y%m%d%H%M%S)"
fi
mkdir -p storage
unzip -o "$ZIP" -d "$DIR"

# If zip had a top-level 'storage' folder we get DIR/storage/...
if [ -d "$DIR/storage/storage" ]; then
  mv "$DIR/storage/storage" "$DIR/storage-new"
  rm -rf "$DIR/storage"
  mv "$DIR/storage-new" "$DIR/storage"
fi
# If zip had framework/app/logs at root of zip
if [ -d "$DIR/framework" ]; then
  mkdir -p "$DIR/storage"
  for d in framework app logs; do [ -d "$DIR/$d" ] && mv "$DIR/$d" "$DIR/storage/"; done
fi

chown -R "$WEB_USER:$WEB_USER" "$DIR/storage" "$DIR/bootstrap/cache"
chmod -R 775 "$DIR/storage" "$DIR/bootstrap/cache"
rm -f "$ZIP"
echo "Done. Storage restored and permissions set."
