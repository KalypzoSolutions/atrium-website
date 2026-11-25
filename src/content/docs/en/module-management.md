---
title: Managing modules
description: Install feature modules from a GitHub link or ZIP file, enable, update and remove them.
order: 13
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

The Atrium core deliberately ships **without feature modules**. Members, events, files, treasury and everything else come as modules from their own repositories, which you install at runtime under **Administration → Modules**. This page covers operating them; how to write a module yourself is described in [Developing modules](/en/docs/modules).

> **Warning:** after installation, module code runs with **full privileges** in the server process. A module can read and change all data and access the server’s credentials – there is no sandbox. Only install modules from sources you trust.

## Who may do what?

| Action | Requirement |
|---|---|
| View modules | `core.modules.view` |
| Enable and disable | `core.modules.manage` |
| Install, update, remove | administrator, signed in with a session (no API key), confirmation with password and 2FA code if enabled |

The server must also allow installing: the bundled Docker images set `ATRIUM_MODULE_INSTALL=supervisor`. With `off`, only the preview works (see [Configuration](/en/docs/configuration#module-installation)).

## Installing modules

Installation takes three steps in the **Install** tab; the server then rebuilds the application.

### 1. Choose a source

Enter a **GitHub link** – a whole repository, a folder, or a branch or tag – or choose a **ZIP file** (max. 50 MB). Then click **Load source**.

<DocShot name="04-module-install" lang="en" />

Valid inputs include:

```text
https://github.com/KalypzoSolutions/atrium-basic-modules
https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules
github:org/repo/modules/kasse#v2.0.0
```

Public sources include [atrium-basic-modules](https://github.com/KalypzoSolutions/atrium-basic-modules) (events, files, notes, tasks, whiteboards) and [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules).

### 2. Select modules

Atrium reads the source’s `atrium-modules.json` catalog and lists every module with ID, version and description plus the **pinned commit**. Tick the modules you want and click **Show preview**.

<DocShot name="04b-module-install-select" lang="en" crop="900" />

### 3. Review the preview and install

The preview **does not run any module code**. For each module it shows:

- version, source with commit and the required core version,
- **new and dropped permissions**, new **database migrations**, its own **npm packages** and the number of files,
- automatically added dependencies and recommended optional modules,
- findings from an import scan, e.g. “reads environment variables (process.env)”, “starts processes (child_process)” or “opens network connections”.

<DocShot name="04c-module-install-preview" lang="en" crop="1200" />

If everything looks right, tick **I have checked the source and trust it.**, enter your account password (and 2FA code if enabled) and click **Install**.

Installation is **blocked** if, for example, the core version doesn’t match, an already applied migration was modified or is missing, an npm package conflicts with the core, or a dependency cannot be resolved. The preview then states the reason.

### Rebuild and restart

After you confirm, the server rebuilds the application with the new modules: copy files, install packages, build, start a trial run and switch over only after a successful health check. The page shows the progress (Queued, Building, Verifying, Restarting) and updates itself. Downtime is that of a restart, a few seconds; if the check fails, the previous version stays in service.

Afterwards the modules are available under **Installed** – disabled at first. Enable them there (see [Installed modules](#installed-modules)).

> **Tip:** the rebuild needs memory (around 3.5 GB), so the bundled Compose files allow the app up to 4 GB. Outbound access to `api.github.com`, `codeload.github.com` and, for modules with their own packages, `registry.npmjs.org` is required.

### GitHub token and allowed sources

Below the source form on the **Install** tab you find two settings:

- **GitHub token:** only needed for private repositories or higher rate limits – read access is enough. The token is stored encrypted and only sent to the GitHub API.
- **Allowed sources:** one `owner/repo` or `owner/*` per line. Empty means all GitHub sources and ZIP files are allowed. As soon as you enter sources, **ZIP files are blocked** and only the listed repositories are permitted.

### What Atrium checks during installation

- GitHub refs are resolved to a fixed **commit**; source, commit and content hash are stored. Downloads only come from `api.github.com` and `codeload.github.com`.
- Archives are only unpacked in memory: no symlinks, no paths with `..`, no hidden files, no `.git` or `node_modules`, at most 5000 files and 50 MB (at most 10 MB per file).
- Already applied migrations must not change; new ones must sort after the applied ones.
- A preview is valid for 15 minutes and bound to the person and content. Every installation is recorded in the audit log.

## Installed modules

The **Installed** tab lists all modules in the current build with version, origin, dependencies and permissions. On a fresh installation the list is empty.

<DocShot name="03-modules" lang="en" />

- **Enable:** newly installed modules start out **disabled**. When enabled, Atrium creates the module’s database schema and runs its migrations. The module then appears in the navigation and the API, and its permissions take effect (the *Administrator* role receives them automatically).
- **Disable:** the module disappears from the navigation and API and its permissions no longer apply – **data is kept**. A module other enabled modules depend on can only be disabled once those are disabled.

### “Broken” and “Not installed”

Under **Not loaded** Atrium shows modules that are not running – your data is kept:

- **Broken:** the module is present but violates a rule (e.g. an invalid manifest or a missing migration). It is not loaded; the reason is shown next to it. Updating the module usually fixes it.
- **Not installed:** according to the database the module was there (possibly “was active”), but its code is missing from the running version – for example after a restore on a new server. Install it again, or remove its leftovers with **Delete data**.

If several installed modules are missing after a restore or after losing the data volume, the page offers **Restore from the database** at the top: GitHub modules are reloaded at their stored commit; ZIP modules only while the file is still on the server.

## Updating

**Check for updates** compares, for every module installed from GitHub, the stored commit with the current state of the source (“up to date” or “Update available”). **Update** opens the installation with the source pre-filled; the preview shows changed files, new migrations and permissions.

> **Important:** create a [backup](/en/docs/backup-restore) before every update. Migrations cannot be undone.

Modules included directly in the build (origin “included in the build”) are updated together with the server.

## Removing

**Remove …** is only available for disabled modules that no other module needs. The server then rebuilds without the module.

- **Default – keep data:** tables, settings, permissions and files are kept and are back after reinstalling.
- **Delete data:** permanently deletes the module’s schema, migration state, permissions including role and individual grants, settings, notification preferences, job runs and files. To confirm, enter the module ID.

## History

The **History** tab lists the **installed sources** (module, version, source, commit, install time) and every operation – Installed, Updated, Reinstalled, Older version, Removed – with person and status.

<DocShot name="22-module-history" lang="en" />

The origin of modules is part of the [backup](/en/docs/backup-restore). If a module is missing when a backup is imported, the import names its source with a link to the installation.

## Bringing modules on first start

A new server can fetch its modules itself on first start if a seed list exists (`deploy/modules.seed.json` or `ATRIUM_MODULES_SEED`). Only full commits are allowed; the format is described in [Developing modules](/en/docs/modules#bringing-modules-along-on-first-start-seed).

## Next steps

- Settings of enabled modules: [Settings → Modules](/en/docs/settings#modules)
- Adjust roles for new module permissions: [Users, roles and permissions](/en/docs/users-roles)
- Write your own module: [Developing modules](/en/docs/modules)
