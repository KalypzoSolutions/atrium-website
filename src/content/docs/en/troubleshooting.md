---
title: Troubleshooting
description: Solve common problems: startup aborts, ORIGIN and cookies, proxies and live updates, storage, email, module installation, PDF and logs.
order: 25
section: Operations
source: docs/deployment.md
---

This page collects typical problems and their causes. Almost always start with two questions: **What does the health check say?** and **What is in the log?**

## Diagnosis: health, logs, request ID

```bash
docker compose ps                     # status of all services; app and db should be "healthy"
docker compose logs -f app            # application log
curl -i https://intern.example.org/api/v1/health
```

- `GET /api/v1/health` checks the database connection and returns `200`, otherwise `503`. The app only starts once the database is “healthy”.
- Error pages and API errors show a **reference** or `requestId`. Search the app log for this ID – the technical cause is there. Clients deliberately only receive `internal_error`.
- Logs are limited to 5 × 10 MB per container; older entries rotate out.

## Startup aborts

| Message or symptom | Cause and fix |
|---|---|
| Error about `APP_SECRET` | In production, `APP_SECRET` must be at least 32 characters, random and not a placeholder (at least 6 distinct characters). Generate one with `openssl rand -base64 48`. |
| Error about `ORIGIN` | `ORIGIN` is required in production and must start with `https://` (except `localhost`/`127.0.0.1`). |
| Service doesn’t start, error about `cpus` | A `*_CPUS` value is larger than the host’s number of CPU cores. Lower it. |
| No administrator created | `INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD` are missing, the password is shorter than 12 characters, or an administrator already exists. |
| App stays “starting” for a long time after an update | The supervisor is rebuilding installed modules for the new core version. This can take up to 15 minutes; the bundled build runs meanwhile. |

## Sign-in, cookies and CSRF

**Symptom:** sign-in “bounces” back to the sign-in page, forms report a 403 error, or write API calls from the interface fail.

**Cause:** `ORIGIN` doesn’t exactly match the address in the browser. Secure cookies, CSRF protection and redirects depend on it.

- `ORIGIN` must be exactly the public URL: same scheme (`https://`), same host name, no trailing slash, port if any.
- With `https://`, Atrium sets cookies with `Secure`. If you open the site via `http://`, the browser won’t store the session cookie.
- Behind a proxy, `PROTOCOL_HEADER=X-Forwarded-Proto` and `HOST_HEADER=X-Forwarded-Host` must be set and the proxy must forward these headers (the bundled Compose files do).
- Write API requests **with a session** must send an `Origin` header equal to `ORIGIN`. For scripts, use an [API key](/en/docs/api) instead.

**“Too many attempts” (429):** the rate limits for sign-in, password reset and 2FA apply. Five failed attempts within 15 minutes lock the IP out of that account; wait for the window to pass.

## Wrong client IP, everyone shares one limit

If the audit log and rate limits see the same IP (the proxy’s) for everyone, the proxy configuration is off:

- `ADDRESS_HEADER=X-Forwarded-For` and `XFF_DEPTH` = the number of trusted proxies that append to the header (bundled nginx or Traefik alone: `1`, Cloudflare in front: `2`).
- Port 3000 of the app must never be publicly reachable – otherwise the proxy chain can be forged.

Details: [Installation – using your own reverse proxy](/en/docs/installation#using-your-own-reverse-proxy).

## Live updates don’t arrive

Modules with live editing use server-sent events. A reverse proxy must **not buffer** these connections, and its read timeout must be above 20 seconds. With your own proxy, check `proxy_buffering off` (nginx) or the equivalent setting, and the timeouts.

## Uploads fail

| Symptom | Fix |
|---|---|
| `413` or “too large” | Limits apply along the chain proxy ≥ Node ≥ business limit. Node allows 110 MB (`BODY_SIZE_LIMIT`), the bundled nginx less per path (pages 10 MB, REST JSON 2 MB, module uploads 110 MB). On top of that comes **Settings → Storage → Max. file size** (default 50 MB). |
| File type rejected | The type isn’t in **Allowed file types**; HTML and SVG are only allowed explicitly. |
| Direct browser upload fails (CORS) | The bucket’s CORS configuration must allow your `ORIGIN` for `PUT`. |
| Backup can’t be uploaded | The file is larger than `BACKUP_MAX_BYTES` (default 4 GB), or the `backup-tmp` volume is too small (needs about twice the largest backup). |

## Storage (S3/MinIO)

**Test connection** fails:

- **Endpoint:** empty for AWS S3, otherwise the provider’s full URL with `https://`.
- **Region:** matching the provider (`fsn1`, `auto` for R2, `eu-central-1` …).
- Enable **path-style URLs** for MinIO and providers without virtual host names.
- The access key needs read, write, delete and list permissions on the bucket.
- After changing the endpoint, Atrium discards the access key and secret – enter both again.

**MinIO in the Dokploy stack:** the `storage-init` log must contain “Bucket … und App-Benutzer eingerichtet”. Note: `S3_*` variables are only applied on the **first** start. Later changes – such as new app keys – go into **Settings → Storage**.

## Email delivery

The test email deliberately only reports “Email delivery failed”. The details (host, port, server response) are in the app log.

- **Port 465** needs **Direct TLS**; on port 587 with authentication, STARTTLS is mandatory – if the server doesn’t offer it, sending aborts.
- An SMTP user without a stored password results in “SMTP is not configured” (503). After changing host, port or user, re-enter the password.
- Each email has a time limit of 25 seconds; firewalls blocking outbound SMTP show up as timeouts.

## Settings unreadable after a move

If the app starts with a **different** `APP_SECRET` than before, all encrypted values become unreadable (SMTP password, S3 credentials, AI key, push keys) and all sessions become invalid. Pages that need these values may fail with an error.

- Simplest fix: set the original `APP_SECRET` again.
- Otherwise: re-enter the affected secrets in the interface – or import a [backup](/en/docs/backup-restore) from the old server; Atrium then re-encrypts everything with the new key.

## Module installation

| Message | Fix |
|---|---|
| “Installing is turned off on this server (ATRIUM_MODULE_INSTALL)” | Set `ATRIUM_MODULE_INSTALL=supervisor` (the image default). The preview works anyway. |
| “The server is not running under the supervisor” | The app was started with `node build` instead of the image or `scripts/supervisor.mjs`. |
| “GitHub rate limit reached” | Try again later or store a GitHub token under **Modules → Install**. |
| “Repository not found (or private without a token)” | Check the link; for private repositories, store a token with read access. |
| “Source … is not allowed” / ZIP blocked | The **Allowed sources** list is set. Add the source or clear the list. |
| “A rebuild is already running” | Wait until the running rebuild has finished. |
| Rebuild fails or aborts | Read the **log** on the installation page. Often memory is short: the rebuild needs around 3.5 GB (`APP_MEM_LIMIT` default 4 GB, heap via `ATRIUM_BUILD_HEAP`). The previous version stays in service. |
| Module “Broken” | The module violates a rule (manifest, migrations, permissions). The reason is shown in the module list; updating the module usually helps. |

Outbound access to `api.github.com`, `codeload.github.com` and, for modules with their own packages, `registry.npmjs.org` is required.

## PDF generation

- **Locally**, Chromium is often missing: `npx playwright install chromium`. The Docker image includes it.
- With `PDF_CHROMIUM_SANDBOX=auto` (default), Chromium first starts with its sandbox and, in a container without a suitable seccomp profile, falls back once to `--no-sandbox` – with a warning in the log. That is expected; background in [Security](/en/docs/security).
- PDFs need 300–500 MB of memory per run. On small servers, don’t run large PDF batches and backups at the same time.

## Push notifications

- Push only works over **HTTPS**.
- On iPhone and iPad, Atrium must first be added to the home screen via Safari (iOS 16.4 or later).
- Outbound connections to the browser vendors’ push services must be allowed.
- If someone denied notifications in the browser, they have to allow them again in the site settings.

## Backup service is “unhealthy”

The `db-backup` container reports `unhealthy` if the last successful backup is older than 26 hours. Failures appear in the log as “SICHERUNG FEHLGESCHLAGEN”:

```bash
docker compose logs db-backup
docker compose run --rm db-backup check
```

Common causes: a wrong `RESTIC_PASSWORD`, missing credentials for the target (`BACKUP_REPO_*`), or on AWS a missing `BACKUP_S3_ENDPOINT`.

## Getting help

If you can’t find the cause, open an [issue on GitHub](https://github.com/KalypzoSolutions/kalypzo-atrium/issues) with the version, the deployment type (Compose or Dokploy), the relevant log lines and the request ID. Remove secrets and personal data from the logs first.

## Next steps

- Look up variables: [Configuration](/en/docs/configuration)
- Update safely: [Updates](/en/docs/updates)
