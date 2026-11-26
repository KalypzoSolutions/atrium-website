---
title: Configuration
description: Every Atrium environment variable as a reference – and which settings you make in the UI instead.
order: 22
section: Operations
source: docs/deployment.md
---

Atrium distinguishes two kinds of configuration:

- **Environment variables** for everything that must be known before startup: database, public URL, keys, resources, backups.
- **Settings in the UI** for everything functional: email, storage, AI, PDF, branding. They are stored in the database, with secrets encrypted.

Templates for the variables are in the repository: `.env.example` (Docker Compose), `.env.dokploy.example` and `.env.dokploy-external-s3.example` (Dokploy).

## Required variables

| Variable | Description |
|---|---|
| `APP_SECRET` | at least 32 random characters (`openssl rand -base64 48`). Signs sessions and encrypts stored secrets. In production, startup aborts if the value is a placeholder or has fewer than 6 distinct characters. |
| `ORIGIN` | public URL of the app, exactly as in the browser. Required in production and must use `https://` (except `localhost`/`127.0.0.1`). |
| `POSTGRES_PASSWORD` | password of the database container (Docker Compose, Dokploy) |
| `DATABASE_URL` | PostgreSQL connection, only for `bun run dev`/`bun run start` without Compose; the Compose files set it themselves |

> **Caution:** Don't change `APP_SECRET` later. Encrypted settings would become unreadable and all sessions invalid. Keep the value somewhere safe, separate from the server.

## General variables

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` / `POSTGRES_USER` | `ep_intern` | database name and user |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | – | creates the first administrator on startup if none exists (password ≥ 12 characters). Remove afterwards. |
| `APP_PORT` | `3000` | host port of the app, bound to `127.0.0.1` (`docker-compose.yml` only) |
| `DATABASE_POOL_MAX` | `10` | maximum number of database connections of the app |
| `JOBS_DAILY_WINDOW` | `6-20` | time window for daily background jobs in whole hours (Europe/Berlin), format `from-to` |
| `BACKUP_MAX_BYTES` | `4294967296` | largest backup file that can be uploaded, in bytes (4 GB) |
| `BACKUP_TMP_DIR` | `/var/tmp/ep-backup` | temporary directory for backups (volume `backup-tmp`, needs about twice the size of the largest backup) |
| `COMPOSE_PROFILES` | – | e.g. `proxy,backup` – enables nginx and/or the backup service |
| `INTERN_DOMAIN` | – | host name for the nginx profile; other hosts are rejected |
| `DEPLOY_ENV` | `prod` | Dokploy only: unique name per stack (`ep-intern-<DEPLOY_ENV>-app` etc.) |
| `TZ` | `Europe/Berlin` | time zone of the backup service |

## Proxy headers

The Compose files already set these for a single reverse proxy.

| Variable | Value in Compose | Description |
|---|---|---|
| `ADDRESS_HEADER` | `X-Forwarded-For` | header carrying the client IP |
| `XFF_DEPTH` | `1` | number of trusted proxies that append to the header |
| `PROTOCOL_HEADER` | `X-Forwarded-Proto` | protocol (`https`) |
| `HOST_HEADER` | `X-Forwarded-Host` | original host |

## Initial storage and email settings

These variables are only applied on the **first** start, as long as the setting in the database is still empty. In the Dokploy stacks the `S3_*` values are required; the plain `docker-compose.yml` doesn't pass them through – there, configure storage and email in the UI.

| Variable | Description |
|---|---|
| `S3_ENDPOINT` | endpoint of the S3 service; empty = AWS S3 |
| `S3_REGION` | region, e.g. `fsn1`, `auto` (R2), `eu-central-1` |
| `S3_BUCKET` | bucket (default in the MinIO stack: `ep-intern`) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | the app's credentials |
| `S3_FORCE_PATH_STYLE` | `true` for MinIO and providers without virtual-host-style addressing |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | MinIO stack only: root credentials, not used by the app |
| `SMTP_HOST` / `SMTP_PORT` | mail server and port (default `587`) |
| `SMTP_SECURE` | `true` for implicit TLS (port 465), otherwise `false` |
| `SMTP_USER` / `SMTP_PASSWORD` | mail server credentials |
| `SMTP_FROM` | sender, e.g. `Atrium <noreply@example.org>` |

## Module installation

| Variable | Default (image) | Description |
|---|---|---|
| `ATRIUM_MODULE_INSTALL` | `supervisor` | `supervisor` = rebuild inside the container, `copy` = development with `vite dev`, `off` = preview only |
| `ATRIUM_DATA_DIR` | `/data/atrium` | volume for build generations, status, sources and logs |
| `ATRIUM_MODULES_SEED` | – | seed list (path or JSON) from which a fresh server fetches its modules |
| `ATRIUM_GITHUB_TOKEN` / `GITHUB_TOKEN` | – | optional token for fetching seed modules |
| `ATRIUM_MODULES_DIR` | `modules` | module directory at build time (e.g. for tests) |

## Resources

| Variable | Default | Service |
|---|---|---|
| `APP_MEM_LIMIT` / `APP_CPUS` | `4g` / `1.0` | app (4 GB because of the rebuild during module installation) |
| `DB_MEM_LIMIT` / `DB_CPUS` | `1g` / `1.0` | PostgreSQL |
| `STORAGE_MEM_LIMIT` / `STORAGE_CPUS` | `512m` / `0.5` | MinIO (Dokploy stack with MinIO only) |
| `NGINX_MEM_LIMIT` / `NGINX_CPUS` | `128m` / `0.5` | nginx |
| `BACKUP_MEM_LIMIT` / `BACKUP_CPUS` | `512m` / `0.5` | backup service |

`cpus` must not exceed the number of host cores, otherwise the service won't start. On larger servers, e.g. `APP_CPUS=2` and `DB_CPUS=2` make sense. Monitor with `docker stats`.

For servers with **2 GB RAM** we recommend `APP_MEM_LIMIT=1024m`, `DB_MEM_LIMIT=512m`, `STORAGE_MEM_LIMIT=256m`, `BACKUP_MEM_LIMIT=256m`, plus 1–2 GB of swap; don't run large PDF batches and backups in parallel. This isn't enough for the rebuild during module installation (about 3.5 GB).

## Automatic backups

Variables of the `db-backup` service (profile `backup`):

| Variable | Default | Description |
|---|---|---|
| `RESTIC_PASSWORD` | – | **required**, ≥ 20 characters (`openssl rand -base64 32`). Without it, no backup can be read. |
| `RESTIC_REPOSITORY` | `/backups/restic` | target, e.g. `s3:https://…/bucket`, `b2:bucket:path`, `rest:https://…`. The default is a volume on the same host. |
| `BACKUP_REPO_ACCESS_KEY_ID` / `BACKUP_REPO_SECRET_ACCESS_KEY` / `BACKUP_REPO_REGION` | – | credentials for the S3 target |
| `BACKUP_S3_ENDPOINT` / `BACKUP_S3_BUCKET` / `BACKUP_S3_REGION` | – | source bucket for the file backup; empty = database only |
| `BACKUP_S3_ACCESS_KEY_ID` / `BACKUP_S3_SECRET_ACCESS_KEY` | – | credentials for the source (read access is enough) |
| `BACKUP_S3_FORCE_PATH_STYLE` | `true` | path-style addressing for the source |
| `BACKUP_TIME` | `02:30` | daily start time |
| `BACKUP_KEEP_DAILY` / `_WEEKLY` / `_MONTHLY` | `7` / `4` / `6` | retention |
| `BACKUP_RUN_ON_START` | `false` | run a backup immediately on startup |
| `BACKUP_HEARTBEAT_URL` | – | GET after every successful backup (e.g. healthchecks.io) |
| `BACKUP_NOTIFY_URL` | – | POST with the error message on every failure (e.g. ntfy) |

In the Dokploy stacks, the `BACKUP_S3_*` values default to the app's `S3_*` values.

## Settings in the UI

Configure SMTP, S3, AI and the PDF layout under **Administration → Settings** (`/admin/settings/…`). The search on `/admin` or <kbd>Ctrl</kbd>+<kbd>K</kbd> also finds individual fields, e.g. "smtp" or "logo".

| Area | Contents |
|---|---|
| **General** | system name, organization |
| **Email delivery** | SMTP server, port, TLS, credentials, sender, test email |
| **Email layout** | header with logo, signature, footer, live preview |
| **Storage** | S3 endpoint (empty = AWS), region (`auto` for R2), bucket, access key, secret, path style (enable for MinIO), connection test |
| **AI** | OpenAI-compatible service: API key, base URL, models, allowed modules, limits |
| **PDF** | format, orientation, margins, header and footer, logo; preview of the letter templates |
| **Modules** | settings of the enabled modules |

Good to know:

- **Secrets** (SMTP password, S3 credentials, AI API key) are stored encrypted with AES-256-GCM and never sent to the browser.
- **Secrets are bound to their target:** If you change the SMTP host, port or user, the AI base URL or the S3 endpoint, the corresponding secret is discarded and must be re-entered. This prevents redirecting a stored password to someone else's server.
- **SMTP and TLS:** Port 465 uses implicit TLS; with authentication, STARTTLS is mandatory otherwise.
- **AI:** Prompts and responses are not stored – only counters for tokens and cost.
- **Keep the bucket private.** For browser uploads via signed URLs, CORS on the bucket must allow `PUT` from your own `ORIGIN`.

## Next steps

- Every setting in the interface in detail: [Settings](/en/docs/settings)
- Security model and secrets: [Security](/en/docs/security)
- When something doesn't work: [Troubleshooting](/en/docs/troubleshooting)
