#!/bin/bash
# Ensure .env exists and has APP_KEY. Run on server via SSH.
set -e
DIR="${1:-/home/gekymedia/web/barffoods.com/public_html}"
cd "$DIR" || exit 1
if [ ! -f .env ]; then
  echo "No .env found, copying from .env.example"
  cp .env.example .env
fi
php artisan key:generate --force
echo "APP_KEY has been set in .env"
