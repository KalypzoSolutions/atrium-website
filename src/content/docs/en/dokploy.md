---
title: Deploying with Dokploy
description: Deploy Atrium from Git with Dokploy – external S3 (recommended) or MinIO in the stack, domain, backups and migration.
order: 21
section: Operations
source: docs/deployment.md
---

[Dokploy](https://dokploy.com) builds Atrium straight from the Git repository and handles the domain and HTTPS via Traefik. Atrium ships two ready-made Compose files for it:

| Compose file | Storage | Template for "Environment" | Recommendation |
|---|---|---|---|
| `docker-compose.dokploy-external-s3.yml` | external S3 service (Hetzner Object Storage, Cloudflare R2, Backblaze B2, AWS S3 …) | `.env.dokploy-external-s3.example` | **recommended for production** |
| `docker-compose.dokploy.yml` | MinIO inside the stack (internal only) | `.env.dokploy.example` | for testing and small installations |

Both stacks contain PostgreSQL 17 (`db`), the application (`app`, built from the `Dockerfile`) and the optional backup service `db-backup`.

> **Why external S3?** The MinIO image `bitnamilegacy/minio` is frozen and no longer receives security updates. The app does use a dedicated MinIO user without admin rights, but for long-term operation an external S3 service is the better choice.

## Option A: with external S3 (recommended)

### 1. Prepare the bucket

At your S3 provider, create a **private** bucket and an access key that may **only** read, write, delete and list objects in that bucket.

### 2. Create the service in Dokploy

1. Open your project → **Create Service** → **Compose**.
2. Provider **Git**: repository `https://github.com/KalypzoSolutions/kalypzo-atrium.git` and a branch (e.g. `main`).
3. Compose path: `./docker-compose.dokploy-external-s3.yml`, type **Docker Compose**.

### 3. Fill in the environment

Paste the contents of `.env.dokploy-external-s3.example` into the **Environment** tab and fill it in. Generate all secrets randomly, e.g. with `openssl rand -hex 24` (passwords) and `openssl rand -base64 48` (`APP_SECRET`).

| Variable | Required | Description |
|---|---|---|
| `DEPLOY_ENV` | – | stack name, e.g. `prod` or `staging` (default `prod`); lowercase letters, digits and hyphens only |
| `ORIGIN` | yes | public URL exactly as shown in the browser, with `https://`, no trailing slash |
| `APP_SECRET` | yes | at least 32 random characters; never change it after the first start |
| `POSTGRES_PASSWORD` | yes | database password |
| `S3_ENDPOINT` | – | provider endpoint; empty = AWS S3 |
| `S3_REGION` | yes | e.g. `fsn1` (Hetzner), `auto` (R2), `eu-central-1` (AWS) |
| `S3_BUCKET` | yes | bucket name |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | yes | access key for that bucket |
| `S3_FORCE_PATH_STYLE` | – | `true` only for providers without virtual-host-style addressing (default `false`) |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | first start | creates the first administrator (password ≥ 12 characters) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | – | initial email settings |

Examples for `S3_ENDPOINT` and `S3_REGION`:

```ini
# Hetzner Object Storage
S3_ENDPOINT=https://fsn1.your-objectstorage.com
S3_REGION=fsn1
# Cloudflare R2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
# Backblaze B2
S3_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
S3_REGION=eu-central-003
# AWS S3: leave S3_ENDPOINT empty
S3_REGION=eu-central-1
```

> **Note:** `S3_*` and `SMTP_*` are only copied into the settings on the **first** start, as long as nothing is stored there yet. Make later changes in the UI under **Administration → Settings**.

### 4. Set up the domain

In the **Domains** tab: point the domain to service **`app`**, port **`3000`**, and enable **HTTPS** (Let's Encrypt). `ORIGIN` must match this URL exactly.

### 5. Deploy

Click **Deploy**. On first start, migrations, module synchronization and creation of the administrator run automatically.

### 6. After deployment

1. Sign in at `https://your-domain/login`, change the password and enable 2FA.
2. Under **Administration → Settings → Storage**, click **Test connection** and upload and download a file.
3. Under **Administration → Modules**, install and enable the modules you need.
4. Remove `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from the environment and redeploy.

In detail: [First steps after installation](/en/docs/first-steps).

## Option B: with MinIO in the stack

The procedure is the same as option A, with these differences:

- Compose path: `./docker-compose.dokploy.yml`, template `.env.dokploy.example`.
- The stack additionally contains `storage` (MinIO, internal only) and the one-off container `storage-init`. On every deploy it creates the bucket as private and sets up an app user that can only access this bucket.
- The server reaches the storage internally at `http://storage:9000`; browsers don't need direct access.

| Variable | Required | Description |
|---|---|---|
| `ORIGIN`, `APP_SECRET`, `POSTGRES_PASSWORD` | yes | as in option A |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | yes | MinIO root credentials; only `storage` and `storage-init` receive them, not the app |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | yes | the app's storage credentials; must differ from `MINIO_ROOT_USER` (access key ≥ 3, secret ≥ 8 characters) |
| `S3_BUCKET` | – | default `ep-intern` |
| `S3_REGION` | – | default `us-east-1` |

```bash
# generate random values
openssl rand -hex 12   # MINIO_ROOT_USER, S3_ACCESS_KEY_ID
openssl rand -hex 24   # MINIO_ROOT_PASSWORD, S3_SECRET_ACCESS_KEY, POSTGRES_PASSWORD
```

After a successful deploy, the `storage-init` log shows "Bucket … und App-Benutzer eingerichtet" (bucket and app user set up).

## Backups on Dokploy

> **Important:** Dokploy's database backups only cover databases managed by Dokploy itself – **not** the `db` service in this stack. Enable Atrium's backup service instead.

The `db-backup` service works as described under [Installation – Automatic backups](/en/docs/installation#automatic-backups-profile-backup). Add to the environment:

```ini
COMPOSE_PROFILES=backup
RESTIC_PASSWORD=
RESTIC_REPOSITORY=s3:https://fsn1.your-objectstorage.com/ep-intern-backup
BACKUP_REPO_ACCESS_KEY_ID=
BACKUP_REPO_SECRET_ACCESS_KEY=
```

- `db-backup` backs up the database and, by default, also mirrors the app bucket using the app's credentials. A read-only key via `BACKUP_S3_ACCESS_KEY_ID` and `BACKUP_S3_SECRET_ACCESS_KEY` is better.
- With AWS (empty `S3_ENDPOINT`), `BACKUP_S3_ENDPOINT` must be set, otherwise only the database is backed up.
- Never put `RESTIC_REPOSITORY` into the app bucket – ideally use a different provider or location.
- Keep `RESTIC_PASSWORD` and `APP_SECRET` separate from the server.

Run commands such as `snapshots` or `restore` on the server in the project directory using the project name (`docker compose -p <project> …`) or via `docker exec` in the running container (`ep-backup snapshots`). The restore procedure is described under [Installation – Restore](/en/docs/installation#restore); all variables are listed under [Configuration](/en/docs/configuration#automatic-backups).

## Multiple stacks on one server

If you run, for example, staging and production on the same Dokploy server, set a distinct `DEPLOY_ENV` per stack (`prod`, `staging`). Services then address each other via unique names like `ep-intern-prod-app` and `ep-intern-prod-db` and don't get mixed up in the shared `dokploy-network`.

## Migrating from MinIO to external S3

1. Plan a maintenance window and create a backup.
2. Copy the data with `rclone sync` from the MinIO bucket (volume `s3-data`, internally `ep-intern-<env>-storage:9000`) into the new bucket.
3. Under **Administration → Settings → Storage**, switch to the new provider and click **Test connection**.
4. Check that uploads and downloads work.
5. In Dokploy, change the compose path to `./docker-compose.dokploy-external-s3.yml`, adjust the environment and deploy.
6. Only delete the `s3-data` volume after everything has been verified.

> **Note:** With an existing database, the storage settings in the UI apply, not the `S3_*` variables. That's why you switch storage in the UI.

## Good to know

- **Uploads:** Traefik doesn't limit body size; the Node limit applies (`BODY_SIZE_LIMIT=110M` in the `Dockerfile`), followed by the application's own limits.
- **Browser uploads via signed URLs** require CORS on the bucket allowing `PUT` from your own `ORIGIN`.
- **Module installation:** The stacks set `ATRIUM_MODULE_INSTALL=supervisor` and keep builds in the `atrium-data` volume. Outbound access to `api.github.com`, `codeload.github.com` and, if needed, `registry.npmjs.org` is required.
- **Auto-deploy:** Dokploy deploys on every push to the selected branch. What to watch out for when updating is described under [Updates](/en/docs/updates#with-dokploy).

## Next steps

- All variables at a glance: [Configuration](/en/docs/configuration)
- After the first start: [First steps after installation](/en/docs/first-steps)
- Install modules: [Managing modules](/en/docs/module-management)
- Backups: [Backup and restore](/en/docs/backup-restore)
- Update safely: [Updates](/en/docs/updates)
