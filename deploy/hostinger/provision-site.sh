#!/usr/bin/env bash
# Provision a Laravel site on a Hostinger VPS (plain Nginx + PHP-FPM).
# Usage (as root):
#   bash provision-site.sh patriksolutions.com [git-repo-url] [deploy-user]
#
# Document root will be /var/www/<domain>/public
# App root will be     /var/www/<domain>
set -euo pipefail

DOMAIN="${1:?Usage: provision-site.sh <domain> [git-repo-url] [deploy-user]}"
REPO_URL="${2:-https://github.com/gyabaayeboahemmanuel/barffoods.git}"
DEPLOY_USER="${3:-www-data}"
APP_ROOT="/var/www/${DOMAIN}"
PHP_VERSION="${PHP_VERSION:-8.3}"

echo "==> Creating ${APP_ROOT}"
mkdir -p "${APP_ROOT}"

if [ ! -d "${APP_ROOT}/.git" ]; then
  if [ -z "$(ls -A "${APP_ROOT}" 2>/dev/null || true)" ]; then
    git clone "${REPO_URL}" "${APP_ROOT}"
  else
    echo "ERROR: ${APP_ROOT} is not empty and is not a git repo."
    exit 1
  fi
else
  echo "Git repo already present — skipping clone"
fi

cd "${APP_ROOT}"

echo "==> Composer install"
composer install --no-dev --optimize-autoloader --no-interaction

if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate --force || true
  echo "Created .env — edit DB_* and APP_URL before going live"
fi

mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_ROOT}"
chmod -R 775 storage bootstrap/cache

echo "==> Writing Nginx site config"
cat > "/etc/nginx/sites-available/${DOMAIN}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${APP_ROOT}/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \\.php\$ {
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\\.(?!well-known).* {
        deny all;
    }
}
EOF

ln -sfn "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl reload nginx

echo "==> Supervisor queue worker"
cat > "/etc/supervisor/conf.d/${DOMAIN}-worker.conf" <<EOF
[program:${DOMAIN}-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${APP_ROOT}/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=${DEPLOY_USER}
numprocs=1
redirect_stderr=true
stdout_logfile=${APP_ROOT}/storage/logs/worker.log
stopwaitsecs=3600
EOF

supervisorctl reread
supervisorctl update
supervisorctl start "${DOMAIN}-worker:*" || supervisorctl restart "${DOMAIN}-worker:*" || true

CRON_LINE="* * * * * cd ${APP_ROOT} && php artisan schedule:run >> /dev/null 2>&1"
(crontab -u "${DEPLOY_USER}" -l 2>/dev/null | grep -v "artisan schedule:run" || true; echo "${CRON_LINE}") | crontab -u "${DEPLOY_USER}" -

echo ""
echo "Site provisioned: ${DOMAIN}"
echo "  App root: ${APP_ROOT}"
echo "  Next: import DB, restore storage, edit .env, then:"
echo "    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "    cd ${APP_ROOT} && npm ci && npm run build && php artisan migrate --force && php artisan optimize"
