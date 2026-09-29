#!/usr/bin/env bash
# Bootstrap a fresh Ubuntu Hostinger VPS for Laravel (Patrik Solutions / Barf Foods).
# Run as root on the new VPS: bash bootstrap-vps.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating packages"
apt-get update -y
apt-get upgrade -y

echo "==> Installing base packages"
apt-get install -y \
  curl wget git unzip zip software-properties-common \
  ufw fail2ban \
  nginx \
  mysql-server \
  redis-server \
  supervisor \
  certbot python3-certbot-nginx

echo "==> Installing PHP 8.3 and extensions"
if ! apt-cache show php8.3 >/dev/null 2>&1; then
  add-apt-repository -y ppa:ondrej/php
  apt-get update -y
fi

apt-get install -y \
  php8.3-fpm php8.3-cli php8.3-common \
  php8.3-mysql php8.3-pgsql php8.3-sqlite3 \
  php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
  php8.3-gd php8.3-intl php8.3-bcmath php8.3-soap \
  php8.3-redis php8.3-imagick

echo "==> Installing Composer"
if ! command -v composer >/dev/null 2>&1; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

echo "==> Installing Node.js 20 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Enabling services"
systemctl enable --now nginx php8.3-fpm mysql redis-server supervisor fail2ban

echo "==> Basic firewall (SSH + HTTP/HTTPS)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

echo ""
echo "Bootstrap complete."
echo "Next:"
echo "  1) Create MySQL databases/users for each site"
echo "  2) Run provision-site.sh for each domain"
echo "  3) Or install HestiaCP if you prefer the gekymedia-style panel layout"
echo ""
echo "Optional HestiaCP install (interactive):"
echo "  wget https://raw.githubusercontent.com/hestiacp/hestiacp/release/install/hst-install.sh"
echo "  bash hst-install.sh"
