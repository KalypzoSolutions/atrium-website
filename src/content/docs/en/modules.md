---
title: Developing modules
description: Build your own feature modules for Kalypzo Atrium – package format, defineModule, pages, migrations, permissions, hooks and delivery.
order: 31
section: Development
source: docs/module-development.md
---

Feature modules extend the core with concrete use cases. This page is for developers; operating modules in the interface is covered in [Managing modules](/en/docs/module-management). Each module brings its own permissions, settings, REST endpoints, database migrations and pages – and accesses the core exclusively through the module SDK (`$lib/sdk/*`). How modules are registered, routed and enabled within the overall system is explained in [Architecture](/en/docs/architecture#registration-routing-activation).

## Structure of a module

### Directory layout

```text
modules/
├── atrium-modules.json     # catalog of all modules in this repository
└── members/
    ├── atrium-module.json  # required: package description (static, never executed)
    ├── module.ts           # required: export default defineModule({...})
    ├── ui.ts               # optional: pages
    ├── migrations/         # SQL in schema mod_members, named NNNN_name.sql
    └── pages/              # Svelte components
```

The folder name must match the module ID. Atrium discovers `module.ts` at build time in the module directory (default `modules/`, configurable via `ATRIUM_MODULES_DIR`). Import other files through the `$modules/<id>/…` alias.

### Package description: `atrium-module.json`

This file is the single source of truth for ID, name, version and dependencies. It is never executed and is used for installation (preview, dependency resolution).

```json
{
  "schema": 1,
  "id": "treasury",
  "name": "Treasury",
  "description": "Accounts, bookings and invoices",
  "version": "1.2.0",
  "core": ">=2.0.0-0 <3.0.0",
  "dependencies": {
    "members": { "version": "^1.14.0", "source": "github:org/repo/modules/members" }
  },
  "optionalDependencies": { "offices": { "version": "^1.2.0" } },
  "permissions": ["treasury.account.manage"],
  "npm": {}
}
```

| Field | Meaning |
|---|---|
| `core` | Compatible core versions as a SemVer range (pre-releases included) |
| `dependencies` / `optionalDependencies` | A version range per module and an optional `source` (`github:owner/repo[/path][#ref]` or a GitHub URL); without `source`, the same repository is searched |
| `permissions` | All permissions of the module – the same set as in the manifest |
| `npm` | Module-specific npm packages with an **exact** version; everything else is provided by the core |

### Catalog: `atrium-modules.json`

The catalog lives in the module directory or repository and lists all modules it contains:

```json
{
  "schema": 1,
  "name": "My Atrium modules",
  "description": "Feature modules for …",
  "modules": [
    { "id": "members", "path": "members" },
    { "id": "treasury", "path": "treasury" }
  ]
}
```

## Defining the module

### Manifest and definition: `module.ts`

```ts
// modules/members/module.ts
import { defineModule, defineEndpoint, core, manifestFromPackage } from '$lib/sdk/server';
import { z } from 'zod';
import pkg from './atrium-module.json';
import m0001 from './migrations/0001_init.sql?raw';

export default defineModule({
  package: pkg,
  manifest: {
    ...manifestFromPackage(pkg), // id, name, description, version, dependencies
    permissions: ['members.users.view', 'members.users.edit', 'members.storage.write'],
    navigation: [
      { label: 'Members', icon: 'users', path: '/modules/members', permission: 'members.users.view' }
    ]
  },
  settings: [
    { key: 'members.welcomeText', label: 'Welcome text', schema: z.string().max(500), default: '' }
  ],
  migrations: [{ name: '0001_init', sql: m0001 }],
  endpoints: [
    defineEndpoint({
      method: 'GET',
      path: '/users', // available at /api/v1/modules/members/users
      summary: 'List members',
      permission: 'members.users.view', // required, never null
      handler: async ({ ctx }) => {
        return core.database.forModule('members').transaction(async (tx) => {
          // Drizzle queries on the module's tables
          return [];
        });
      }
    })
  ]
});
```

On registration, Atrium checks, among other things:

- **ID format** `[a-z][a-z0-9-]{1,30}`, not `core`, `api`, `auth`, `admin` or `system`
- **Permissions** in the form `<module>.<resource>.<action>`, prefixed with the module's own ID
- **Setting keys** prefixed with `<module>.`, navigation paths under `/modules/<module>`
- `atrium-module.json` matches the manifest, and `migrations` contains all files from `migrations/` in name order

A violation doesn't stop startup: the module is not loaded and shows up as “Broken” with a reason under **Administration → Modules**.

### Pages: `ui.ts`

```ts
// modules/members/ui.ts
import type { ModuleUi } from '$lib/sdk/types/module-ui';

export default {
  routes: {
    '': () => import('./pages/Index.svelte'),   // /modules/members
    list: () => import('./pages/List.svelte'),  // /modules/members/list
    ':id': () => import('./pages/Detail.svelte') // parameter passed as prop "params"
  }
} satisfies ModuleUi;
```

The core serves the pages through a central catch-all route and checks module status and permissions first. Client-side API calls go through `apiFetch` from `$lib/sdk/client`. Public pages without sign-in are declared under `publicRoutes`; they are available at `/p/<module>/<path>` and may only use public endpoints.

### Allowed imports

ESLint enforces this surface in `modules/<id>/**`:

| Target | Allowed |
|---|---|
| The module's own files (`./…`, `$modules/<id>/…`) | Yes |
| `$lib/sdk/*` (`server`, `client`, `types`) | Yes |
| `$lib/components/ui`, `$lib/components/layout`, `$lib/components/forms` | Yes |
| `$lib/forms`, `$lib/pdf-lists`, `$lib/utils` | Yes |
| `$modules/<other>/contract` | `import type` only |
| Other files of foreign modules | No |
| `$lib/server/*` and all other `$lib/*` | No |

At runtime, use services of other modules via `core.modules.use` or `core.modules.useOptional`. ESLint additionally flags direct access to core internals such as `core.database.db` or `core.system`. This is a guardrail, not a sandbox.

## Data, permissions and settings

### Database and migrations

- Every module owns the schema `mod_<id>` (hyphens become underscores); it is created when the module is enabled.
- Migrations run in order, once, in a transaction with `search_path = mod_<id>`. Create tables **unqualified**.
- Checksums are stored: an applied migration must never change – create a new file instead.
- Access in code: `core.database.forModule('<id>').transaction(async (tx) => …)`, with your own ID only. Define Drizzle tables with `pgSchema('mod_<id>')`. Details: [core.database](/en/docs/core-services#core-database).

```sql
-- modules/members/migrations/0001_init.sql
CREATE TABLE member (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

> **Note:** Don't call core services like `core.storage` or `core.audit` inside a `forModule(...).transaction` – call them before or after.

### Permissions and settings

- Permissions are registered on startup and automatically granted to the *Administrator* role. Check them with `await core.permissions.require(ctx, 'members.users.edit')`.
- For core services acting on behalf of the module, declare capability permissions: `<module>.storage.read|write|delete` and `<module>.ai.use`.
- Settings are typed with Zod and available through `core.settings.get/set`; `secret: true` stores them encrypted.
- The calls in detail: [core.permissions](/en/docs/core-services#core-permissions) and [core.settings](/en/docs/core-services#core-settings).

## Hooks

Further fields in `defineModule` let a module hook into core processes.

### Branding via a profile module

Organization-specific branding doesn't belong in the core but in a **profile module**. These `defineModule` hooks take effect while the module is enabled:

| Hook | Effect |
|---|---|
| `settingDefaults` | Defaults for global settings (e.g. system name, language, AI tone); stored values take precedence |
| `pdfTemplates` | Letter templates; a template with the ID of a core template (`brief`, `briefkopf`, `briefkopf-quer`) replaces it |
| `mailBranding` | Header of the email layout (`title`, optional `mark` and `emblem`) |
| `brandingLogo` | Fallback logo (data URL, PNG) for favicon, app icons, sidebar and sign-in page, as long as no logo has been uploaded |

One example is the `ep-stamm` module in [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules).

### More hooks (selection)

| Field | Purpose |
|---|---|
| `provides` | Services for other modules (with `satisfies <Contract>`) |
| `jobs` | Background jobs (`hourly`, `daily` or every n minutes), see [Jobs and search](/en/docs/core-services#jobs-and-search) |
| `search` | Source for the global search |
| `onUserDeleted` | Required if the module stores user IDs |
| `subjectExport` | Contribution to the GDPR data export |
| `backup.rehash` | Required for key-bound hashes when a backup with a different `APP_SECRET` is restored |
| `onEnable` / `onDisable` | Follow-up work when enabling or disabling |

## Installing modules

How administrators install, enable, update and remove modules from a GitHub link or ZIP file is described in [Managing modules](/en/docs/module-management). What matters for developers: for the preview, installation only reads static files (`atrium-modules.json`, `atrium-module.json`, migrations), checks the commit, content hash and migration checksums, and then rebuilds the application. Your module must therefore be describable without running code and must never change applied migrations.

### Bringing modules along on first start (seed)

A fresh server can fetch its modules by itself. Provide a seed list in `deploy/modules.seed.json` or as JSON directly in `ATRIUM_MODULES_SEED`:

```json
{
  "schema": 1,
  "sources": [
    {
      "source": "github:org/repo",
      "commit": "<full commit, 40 characters>",
      "modules": ["members", "treasury"],
      "contentHashes": { "members": "sha256-…" }
    }
  ]
}
```

Only full commits are allowed, no branches. If `modules` is omitted, all modules of the source are installed; `contentHashes` is optional.

## Checklist

- [ ] Manifest valid, permissions prefixed with the module ID
- [ ] Only allowed imports (`npm run lint`)
- [ ] Migrations in the module schema, never changed after release
- [ ] Every operation uses `ctx` and `core.permissions.require`
- [ ] Tests for permissions and module status
- [ ] `onUserDeleted` if the module stores user IDs
- [ ] `subjectExport` for personal data

## Next steps

- The services of the `core` object: [Core services](/en/docs/core-services)
- Call endpoints from outside: [REST API](/en/docs/api)
- Development environment and tests: [Development](/en/docs/development)
