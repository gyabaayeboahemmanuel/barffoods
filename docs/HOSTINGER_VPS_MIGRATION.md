# Hostinger VPS Migration — Barf Foods

Migrate **barffoods.com** from the current HestiaCP host (`gekymedia.com`) to a new Hostinger VPS.

## Current production

| Item | Value |
|------|-------|
| Live URL | https://barffoods.com |
| Old server | `root@gekymedia.com` |
| Old path | `/home/gekymedia/web/barffoods.com/public_html` |
| Stack | Laravel 12, React + Inertia, PHP 8.2+, MySQL, Redis queues, Stripe, EasyPost |
| Deploy | `deploy.ps1` (SSH) + GitHub Actions on related repos |

## Target (Hostinger VPS)

Recommended layout (HestiaCP on Hostinger — keeps paths familiar):

| Item | Value |
|------|-------|
| SSH | `root@<HOSTINGER_VPS_IP>` |
| Site path | `/home/<user>/web/barffoods.com/public_html` |
| PHP | 8.3 |
| Node | 20 LTS |
| DB | MySQL 8 |
| Redis | Required for queues/cache in production |
| SSL | Let's Encrypt via panel or Certbot |

If you skip Hestia and use a plain LEMP install, default path becomes:

```text
/var/www/barffoods.com
```

## What you must provide before cutover

1. **Hostinger VPS IP** (and optional hostname)
2. **Root (or sudo) SSH access** — password or private key
3. **Panel choice**: HestiaCP (recommended) or bare Ubuntu LEMP
4. **System user / site path** if not using default Hestia layout
5. **DNS access** for `barffoods.com` (and `www`) A/AAAA records
6. Access to copy **MySQL dump**, **`.env`**, and **`storage/`** (product images, uploads) from the old server
7. Stripe / EasyPost webhook URL updates after DNS cutover

## Migration phases

### Phase 1 — Provision the VPS

On a fresh Ubuntu 22.04/24.04 Hostinger VPS (can be shared with Patrik Solutions):

```bash
bash deploy/hostinger/bootstrap-vps.sh
```

Then either:

- **Option A (Hestia):** create user + domain `barffoods.com`, document root → Laravel `public/`
- **Option B (LEMP):** `bash deploy/hostinger/provision-site.sh barffoods.com`

### Phase 2 — Deploy application code

```powershell
$env:VPS_HOST = "<HOSTINGER_VPS_IP>"
$env:VPS_USER = "root"
$env:DEPLOY_PATH = "/home/<user>/web/barffoods.com/public_html"
.\deploy\hostinger\setup-site.ps1
```

Or on the VPS:

```bash
cd /path/to/site
git clone https://github.com/gyabaayeboahemmanuel/barffoods.git .
composer install --no-dev --optimize-autoloader
cp .env.example .env   # prefer copying production .env from old server
npm ci && npm run build
```

### Phase 3 — Copy data from old server

On the **old** server:

```bash
mysqldump -u USER -p DATABASE > /tmp/barffoods.sql

cd /home/gekymedia/web/barffoods.com/public_html
# Prefer existing helpers if available:
#   bash fix-hestia-permissions.sh
#   zip -r /tmp/storage.zip storage
tar czf /tmp/barffoods-storage.tar.gz storage/app public/storage 2>/dev/null || \
  tar czf /tmp/barffoods-storage.tar.gz storage/app
```

Restore on Hostinger:

```bash
mysql -u USER -p NEW_DATABASE < /tmp/barffoods.sql
cd /path/to/site
tar xzf /tmp/barffoods-storage.tar.gz
php artisan storage:link
chown -R USER:USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

`.env` notes for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://barffoods.com
# Keep the same APP_KEY from the old server
DB_CONNECTION=mysql
QUEUE_CONNECTION=redis
CACHE_STORE=redis
# Update Stripe + EasyPost keys/webhook secrets as needed
```

### Phase 4 — Cron, queue, SSL, webhooks

```cron
* * * * * cd /path/to/site && php artisan schedule:run >> /dev/null 2>&1
```

Ensure Redis + a queue worker (Supervisor config is created by `provision-site.sh`).

After DNS points to Hostinger, update:

- Stripe webhook endpoint → `https://barffoods.com/...`
- EasyPost webhook → new URL
- Any CDN / CORS / mail domain settings

### Phase 5 — DNS cutover

1. Lower TTL ahead of time if possible
2. Point `barffoods.com` A/AAAA to Hostinger
3. Smoke-test: homepage, login, cart, checkout, admin, image uploads, order emails
4. Keep old server available 48–72h for rollback

### Phase 6 — Update deploy tooling

```powershell
$env:VPS_HOST = "<HOSTINGER_VPS_IP>"
$env:VPS_USER = "root"
$env:DEPLOY_PATH = "/home/<user>/web/barffoods.com/public_html"
.\deploy.ps1
```

GitHub Actions secrets (if used): `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY`, `DEPLOY_PATH`.

## Shared VPS with Patrik Solutions

Both sites can share one Hostinger VPS:

- Separate Nginx (or Hestia) vhosts
- Separate MySQL databases/users
- Separate Supervisor workers
- Enough RAM for PHP-FPM + Redis + two Node build processes during deploys (build on CI or deploy machine when possible)

## Rollback

Point DNS back to the old `gekymedia.com` IP. Avoid writing new orders on both servers during the window.

## Checklist

- [ ] Hostinger VPS SSH works
- [ ] PHP 8.3, Composer, Node 20, MySQL, Redis, Nginx
- [ ] Site + document root → `public/`
- [ ] Code deployed
- [ ] DB imported
- [ ] `storage/` + images restored
- [ ] `.env` + same `APP_KEY`
- [ ] Scheduler + queue worker + Redis
- [ ] SSL
- [ ] Stripe / EasyPost webhooks updated
- [ ] DNS cutover verified
- [ ] Deploy scripts / CI secrets updated
- [ ] Old server kept briefly for rollback
