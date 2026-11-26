---
title: Installation with Docker Compose
description: Run Atrium in production with Docker Compose – first start, nginx with HTTPS, automatic backups and restore.
order: 20
section: Operations
source: docs/deployment.md
---

For production, Atrium ships a hardened `docker-compose.yml`. It starts PostgreSQL and the application; nginx as a reverse proxy and a backup service can be enabled via Compose profiles. If you use Dokploy, follow [Deploying with Dokploy](/en/docs/dokploy) instead.

## Components

| File / service | Purpose |
|---|---|
| `Dockerfile` | multi-stage build on `oven/bun:1.4.4-slim` (pinned by digest), includes Chromium for PDF, runs as user `app` (UID 10001), health check on `/api/v1/health` |
| `db` | PostgreSQL 17, volume `db-data`, health check via `pg_isready` |
| `app` | Atrium, built from the `Dockerfile`; port 3000 bound to `127.0.0.1` only |
| `nginx` (profile `proxy`) | reverse proxy with HTTP→HTTPS redirect, TLS, per-path size limits |
| `db-backup` (profile `backup`) | daily encrypted backup with restic |

All images are pinned to a fixed version and digest.

## Requirements

- A Linux server with Docker and Docker Compose
- Recommended: **4 GB RAM, 2 vCPUs**. By default the application may use up to 4 GB (`APP_MEM_LIMIT`) because rebuilding during module installation needs about 3.5 GB; without module installation, about 1.5 GB is enough.
- A domain with a TLS certificate (for the nginx profile)
- Outbound access to `api.github.com` and `codeload.github.com` (module sources) and, if needed, `registry.npmjs.org`

## Installation

### 1. Clone the repository and create `.env`

```bash
git clone https://github.com/KalypzoSolutions/kalypzo-atrium.git
cd kalypzo-atrium
cp .env.example .env
```

### 2. Set the required values

Set at least the following in `.env`:

```ini
# openssl rand -hex 24
POSTGRES_PASSWORD=
# openssl rand -base64 48
APP_SECRET=
ORIGIN=https://intern.example.org
# first start only, password at least 12 characters
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=
```

> **Caution:** `ORIGIN` must match the public URL exactly and start with `https://` in production – otherwise startup aborts. Secure cookies, CSRF protection and sign-in redirects depend on it.

All other variables are listed under [Configuration](/en/docs/configuration).

### 3. Build and start the stack

```bash
docker compose up -d --build
docker compose ps        # app and db should be "healthy"
```

On first start, migrations and module synchronization run automatically, then the administrator is created.

### 4. After the first start

1. Sign in at `ORIGIN/login` and change the password.
2. Enable 2FA for the administrator account.
3. Remove `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from `.env` – otherwise the password stays visible in the container environment.
4. Under **Administration → Settings**, configure the system name, email delivery (SMTP), storage (S3), AI and PDF.
5. Under **Administration → Modules**, install and enable the modules you need.

In detail: [First steps after installation](/en/docs/first-steps).

## nginx and HTTPS (profile `proxy`)

```bash
mkdir -p deploy/nginx/certs      # put fullchain.pem and privkey.pem here
# in .env: INTERN_DOMAIN=intern.example.org
docker compose --profile proxy up -d
```

Alternatively, enable profiles permanently in `.env`, e.g. `COMPOSE_PROFILES=proxy,backup`.

`deploy/nginx/nginx.conf` is a template in which only `INTERN_DOMAIN` is substituted at startup. Among other things it contains:

- a default server that rejects unknown host names
- TLS following Mozilla "intermediate"
- rate limiting for sign-in and password reset (30 requests/min per IP)
- per-path size limits and unbuffered pass-through for backup uploads and downloads

HSTS and the remaining security headers are set by the application itself.

### Using your own reverse proxy

Atrium reads the client IP from `X-Forwarded-For`. The shipped configuration sets `ADDRESS_HEADER=X-Forwarded-For`, `XFF_DEPTH=1`, `PROTOCOL_HEADER=X-Forwarded-Proto` and `HOST_HEADER=X-Forwarded-Host` (see [Configuration](/en/docs/configuration#proxy-headers)).

| Proxy | Setting |
|---|---|
| bundled nginx | `XFF_DEPTH=1` |
| Traefik (e.g. Dokploy) as the only proxy | `XFF_DEPTH=1` |
| Cloudflare in front of Traefik/nginx | `XFF_DEPTH=2`, or `ADDRESS_HEADER=CF-Connecting-IP` if the app is reachable through Cloudflare only |

Rule of thumb: `XFF_DEPTH` equals the number of trusted proxies that append to the header. Server-sent events (live editing) must not be buffered, and the read timeout must be longer than 20 seconds.

> **Warning:** Never expose port 3000 publicly. If the app is reachable directly, anyone can forge the proxy chain and thereby influence rate limits and the audit IP.

## Automatic backups (profile `backup`)

The `db-backup` service runs daily at `BACKUP_TIME` (default 02:30, time zone `TZ`, default Europe/Berlin):

1. `pg_dump` of the database,
2. `rclone sync` of the S3 bucket (if `BACKUP_S3_*` is set, otherwise database only),
3. `restic backup` into an encrypted, deduplicated repository,
4. pruning to 7 daily, 4 weekly and 6 monthly snapshots; on Sundays an additional `restic check`.

Minimal configuration in `.env`:

```ini
COMPOSE_PROFILES=backup
# openssl rand -base64 32 – store it separately from the server!
RESTIC_PASSWORD=
# a target outside the server
RESTIC_REPOSITORY=s3:https://fsn1.your-objectstorage.com/ep-intern-backup
BACKUP_REPO_ACCESS_KEY_ID=
BACKUP_REPO_SECRET_ACCESS_KEY=
# optional: heartbeat on success (e.g. healthchecks.io), POST on failure (e.g. ntfy)
BACKUP_HEARTBEAT_URL=
BACKUP_NOTIFY_URL=
```

> **Important:** Without `RESTIC_REPOSITORY`, backups end up in the `backup-repo` volume on the **same host** – that only protects against mistakes, not against losing the server. Without `RESTIC_PASSWORD`, no backup can be read.

Useful commands:

```bash
docker compose run --rm db-backup run          # back up now
docker compose run --rm db-backup snapshots    # list snapshots
docker compose run --rm db-backup check        # fully verify the repository
docker compose logs db-backup                  # failures show up as "SICHERUNG FEHLGESCHLAGEN"
```

The container turns `unhealthy` if the last successful backup is older than 26 hours. All variables of the backup service are listed under [Configuration](/en/docs/configuration#automatic-backups).

### Restore

```bash
# 1. Same RESTIC_*/BACKUP_REPO_* values in .env, start only the database
docker compose up -d db
# 2. Fetch a snapshot into the work volume
docker compose run --rm db-backup restore latest /work/restore
# 3. Restore the database
docker compose run --rm db-backup restore-db /work/restore/work/db/ep_intern.dump
# 4. Copy files back into the bucket with rclone (source: /work/restore/work/objects)
# 5. Start the app with the SAME APP_SECRET
docker compose up -d
```

> **Caution:** After a restore, start the app with the same `APP_SECRET`, otherwise encrypted settings are unreadable. Test restores regularly on a separate test server.

To create a manual database dump:

```bash
docker compose exec db pg_dump -U $POSTGRES_USER -Fc $POSTGRES_DB > backup.dump
```

The UI additionally offers an encrypted backup – see [Backup and restore](/en/docs/backup-restore).

## Hardening

The Compose files are already hardened:

- read-only file system (`read_only`), `/tmp` as a size-limited tmpfs (256 MB)
- `cap_drop: ALL`, `no-new-privileges`, `init: true` (tini as PID 1)
- app port on `127.0.0.1` only, database without a published port
- memory, CPU and process limits per service, log rotation (at most 5 × 10 MB per container)

What you should additionally check as an operator is summarized in the [hardening checklist](/en/docs/security#hardening-checklist).

### Resources

By default, `app` may use up to 4 GB of memory and 1 CPU, `db` 1 GB and 1 CPU, `nginx` and `db-backup` 0.5 CPU each. All limits, their variables and a recommendation for small servers are listed under [Configuration](/en/docs/configuration#resources).

## Updates and shutdown

An update consists of `git pull`, rebuilding `app` and restarting it; migrations run automatically. Create a backup first – migrations are not automatically reversible. The commands, rollback, pinned images, module rebuilds and shutdown behavior are covered in [Updates](/en/docs/updates#with-docker-compose).

## Health checks

- **App:** `GET /api/v1/health` checks the database connection and responds with `200` or `503`.
- **Database:** `pg_isready`; the app only starts once the database is "healthy".

> **Note:** Atrium is designed for **one** app instance – see [Updates – Only one instance](/en/docs/updates#only-one-instance).

## Next steps

- After the first start: [First steps after installation](/en/docs/first-steps)
- Look up variables: [Configuration](/en/docs/configuration)
- Security model and hardening: [Security](/en/docs/security)
- Install modules: [Managing modules](/en/docs/module-management)
- If something doesn't start: [Troubleshooting](/en/docs/troubleshooting)
