---
title: Updates
description: Update Atrium safely – with Docker Compose or Dokploy, module rebuilds, pinned images, rollback and shutdown.
order: 24
section: Operations
source: docs/deployment.md
---

An Atrium update consists of a new application image. Database migrations run automatically at startup, and installed modules are rebuilt when needed. This page describes the process and what to watch out for.

## Before every update

1. **Create a backup** – a backup from the interface or an immediate run of the backup service (`docker compose run --rm db-backup run`). See [Backup and restore](/en/docs/backup-restore).
2. **Read the changes** – release notes or commits in the [repository](https://github.com/KalypzoSolutions/kalypzo-atrium).
3. **Pick the time** – not during bulk operations (e.g. sending mail to many recipients) or a restore. Background jobs don't react to shutdown yet.

> **Important:** Migrations are not automatically reversible. A rollback means: start the image of the previous version **and** restore the database from the backup. The commands are listed under [Installation – Restore](/en/docs/installation#restore).

## With Docker Compose

```bash
git pull
docker compose build app
docker compose up -d app     # migrations run at startup
docker compose ps            # app should be "healthy" again
```

At startup Atrium first applies the core migrations, then synchronizes the modules and applies the migrations of already enabled modules. A database lock (advisory lock) ensures every migration runs exactly once – even if two starts overlap.

## With Dokploy

Dokploy deploys automatically on every push to the selected branch (autodeploy), or on demand with **Deploy**. The procedure is the same: back up first ([Backups on Dokploy](/en/docs/dokploy#backups-on-dokploy)), then check in the `app` log that migrations and startup completed.

> **Tip:** If you only want to deploy after a green CI run, allow pushes to the deploy branch only through protected pull requests, or trigger Dokploy via webhook from the CI.

## Installed modules and core versions

Modules you installed under **Administration → Modules** live in their own build generation in the data volume (`/data/atrium`). If a new image brings a **different core version**, the supervisor rebuilds these modules automatically at startup. Until the rebuild is finished, the bundled build runs; the image's health check waits up to 15 minutes for this (`start-period`).

You update modules themselves independently of the core via **Modules → Check for updates** (see [Managing modules](/en/docs/module-management#updating)). If a module no longer matches the new core version, the installation preview says so.

## Pinned images

All images are pinned with a **fixed version and digest** (`name:tag@sha256:…`), for example Node `24.22.0-bookworm-slim`, `postgres:17.11-alpine3.24` and `nginx:1.30.6-alpine3.24`. A deploy therefore never changes a base version unnoticed.

- Bump **tag and digest together** when updating.
- When updating PostgreSQL, change the `db` service and `deploy/backup/Dockerfile` together so that `pg_dump` matches the server version.
- A PostgreSQL **major upgrade** (e.g. 17 → 18) requires a dump and restore or `pg_upgrade` – swapping the image is not enough.
- The repository keeps dependencies current with Dependabot (npm, Docker, GitHub Actions; weekly).

## Shutting down

```bash
docker compose stop
```

Compose sends SIGTERM and waits a fixed time per service (`stop_grace_period`) before stopping the process:

| Service | Grace period |
|---|---|
| `app` | 30 s (45 s in the Dokploy stacks) |
| `db`, `db-backup` | 60 s |

The HTTP server closes in an orderly way. Background jobs, Chromium (PDF) and the database pool in the app do **not** react to shutdown yet, though – a running job may be interrupted. An interrupted job counts as finished after 10 minutes without a heartbeat and runs again on a later tick.

## Only one instance

Atrium is designed for **one** app instance. Rate limiters, the sign-in lock and live editing work in process memory. Don't start a second instance in parallel – not even for a "rolling update".

## Checks after the update

- [ ] `docker compose ps` or Dokploy shows `app` as "healthy"
- [ ] `GET /api/v1/health` returns `200`
- [ ] Signing in works; under **Administration → Modules** all modules are enabled and none is "Broken"
- [ ] Test email and storage test under **Settings** succeed

## Next steps

- If something doesn't start: [Troubleshooting](/en/docs/troubleshooting)
- Backups and rollback: [Backup and restore](/en/docs/backup-restore)
