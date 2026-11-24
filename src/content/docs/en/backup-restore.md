---
title: Backup and restore
description: Create and import encrypted backups in the interface, use the automatic restic backup service, and delete data areas selectively with “Reset”.
order: 14
section: Administration
source: docs/security.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium offers two complementary ways to back up your data:

| | Backup in the interface | Automatic backup (`db-backup`) |
|---|---|---|
| **Where** | Administration → Backup | Docker service `db-backup` (Compose profile `backup`) |
| **When** | on demand | daily at the configured time |
| **Format** | one encrypted `.atriumbackup` file | encrypted, deduplicated restic repository |
| **Content** | all or selected areas, files optional | the whole database (`pg_dump`) and the S3 bucket |
| **Best for** | moving to another server, partial restores, merging | disaster recovery, versions over weeks and months |

We recommend both: the automatic backup with a target **outside** the server, plus an occasional backup from the interface that you keep separately.

## Backup in the interface

**Administration → Backup** requires the admin-level permission `core.system.backup`. You confirm both export and import with your account password and – if enabled – your 2FA code.

### Creating a backup

<DocShot name="14-backup" lang="en" caption="Backup → Export: choose areas, include files and set a backup password." />

1. Choose the **areas** – all, or individual core and module areas. Dependent areas are included automatically (the interface tells you why).
2. Optionally **Include files**: uploaded files of the chosen areas from S3 storage. Without files the backup is smaller, but the contents are missing when you restore.
3. Set and repeat a **backup password**. The file is encrypted with it (scrypt, AES-256-GCM).
4. Click **Create backup** and confirm with your account password. With many files this takes a few minutes – keep the page open.
5. The download starts automatically. The link works only **once** and for **15 minutes**.

> **Important:** inside the encryption, the backup file contains all data including password hashes and credentials. File plus backup password mean full access. Keep both separately and safely. Without the password the backup cannot be restored.

### Importing a backup

The **Import** tab guides you through four steps:

<DocShot name="31-backup-import" lang="en" />

1. **Choose file** and upload it. Large files are uploaded in 8 MB chunks; the limit is set by `BACKUP_MAX_BYTES` (default 4 GB).
2. **Passwords:** the backup password decrypts the file, your account password confirms the operation; then click **Check**.
3. **Preview:** Atrium shows the creation time, version and origin, the number of records per area in the backup and currently, and compatibility notes. Here you choose the **mode** and areas:
   - **Restore** completely replaces the chosen areas with the state in the backup.
   - **Merge** only adds missing records; existing data stays unchanged.
   - Options: **Take over mail access** (SMTP settings from the backup instead of the current ones) and **Take over module status** (enable or disable modules as they were when the backup was made).
4. **Confirm** – type the confirmation word `RESTORE` or `MERGE`.

Background jobs pause during the run and the system is briefly unavailable, so import backups at a quiet time. If the restore fails, the changes are rolled back.

Good to know:

- **Your own account:** if it is in the backup with the same password, you are signed out afterwards and sign in again with the credentials from the backup. If it is not in the backup, your current account is kept as well so you don’t lock yourself out.
- **Different server key:** if the backup comes from a server with a different `APP_SECRET`, Atrium re-encrypts all secrets and recalculates key-bound check values. Anything that cannot be recalculated is reported in the result.
- **Missing modules:** if a module from the backup is not installed on the target server, the import names its source with a link to the [installation](/en/docs/module-management).
- **No storage:** if no S3 storage is configured, files are skipped; the records are restored anyway.
- Only administrators may restore or merge accounts, roles and API keys.

### Moving to a new server

1. Create a backup **with files** on the old server.
2. Install the new server, configure storage and install the required modules.
3. Import the backup in **Restore** mode. A different `APP_SECRET` on the new server is no problem.

## Automatic backup with restic

For ongoing operation the `db-backup` service runs daily (default 02:30, time zone Europe/Berlin):

1. `pg_dump` of the database,
2. `rclone sync` of the S3 bucket (if `BACKUP_S3_*` is set),
3. `restic backup` into an encrypted, deduplicated repository,
4. pruning to 7 daily, 4 weekly and 6 monthly snapshots; on Sundays also `restic check`.

Enable it with `COMPOSE_PROFILES=backup` and at least `RESTIC_PASSWORD` plus a target in `RESTIC_REPOSITORY`. The container becomes `unhealthy` if the last successful backup is older than 26 hours; optionally it reports success to `BACKUP_HEARTBEAT_URL` and failures to `BACKUP_NOTIFY_URL`.

```bash
docker compose run --rm db-backup run          # back up now
docker compose run --rm db-backup snapshots    # list snapshots
docker compose logs db-backup                  # failures show up as "SICHERUNG FEHLGESCHLAGEN"
```

Setup and all variables: [Installation – automatic backups](/en/docs/installation#automatic-backups-profile-backup) and [Configuration](/en/docs/configuration#automatic-backups). On Dokploy, note that its own database backups do **not** cover this stack’s database – enable `db-backup` (see [Dokploy](/en/docs/dokploy#backups-on-dokploy)).

### Restoring from restic

Restoring from the restic repository happens on the command line: start the database, fetch a snapshot, load the dump, copy the files back into the bucket and start the app with the **same** `APP_SECRET`. The commands are listed under [Installation – Restore](/en/docs/installation#restore).

> **Caution:** without `RESTIC_PASSWORD` no backup is readable, and without the original `APP_SECRET` encrypted settings cannot be read. Keep both separate from the server.

### Restore drill

Test restoring regularly, e.g. every six months, on a separate test server:

- [ ] Snapshots show daily states up to yesterday.
- [ ] Restore using copies of `APP_SECRET` and `RESTIC_*`.
- [ ] Signing in as administrator works, current data is present.
- [ ] Older files can be downloaded and opened.
- [ ] An encrypted setting is readable (e.g. SMTP test email).
- [ ] Delete the test server and data afterwards.

## Reset

**Administration → Reset** **permanently** deletes the data of individual areas – or the whole system – for example to start fresh after a trial period. The permission `core.system.reset` is admin-level and only usable with a session.

<DocShot name="25-reset" lang="en" crop="900" />

The process has four steps:

1. **Choose areas:** core areas (API keys, users except your own, roles except system roles, API log, job runs, AI usage, settings, audit log) and the areas of enabled modules. Dependent areas are selected automatically.
2. **Preview:** Atrium shows the number of records per table and the files per module that will be deleted.
3. **Backup:** a mandatory export of the affected data as an encrypted `.atriumbackup` file (without uploaded files). You confirm with your password and set a backup password (at least 12 characters).
4. **Confirm:** type `RESET` and click **Reset permanently**.

For *Settings*, storage and SMTP access as well as secrets are kept; for the *Audit log*, only the entry about this reset remains. If needed, import the mandatory backup again via **Backup → Import**.

## Next steps

- Data export and audit log: [Privacy and audit log](/en/docs/privacy)
- Apply updates safely: [Updates](/en/docs/updates)
- Set up the backup service: [Docker Compose installation](/en/docs/installation#automatic-backups-profile-backup)
