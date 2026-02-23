#!/bin/bash
# Fix Laravel storage/cache permissions on the server.
# Run on server: bash fix-storage-permissions.sh
# Or from PC: ssh root@gekymedia.com 'bash -s' < fix-storage-permissions.sh

set -e
DIR="${1:-/home/gekymedia/web/barffoods.com/public_html}"

# Typical web server user (change to nginx or apache if your server uses that)
WEB_USER="${2:-www-data}"

echo "Fixing permissions in: $DIR"
echo "Web server user: $WEB_USER"

cd "$DIR" || exit 1

# Ensure storage structure exists
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Owned by web server so PHP can write
chown -R "$WEB_USER:$WEB_USER" storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "Done. Reload the site."
