---
title: Architecture
description: How Kalypzo Atrium is built – modular monolith, layers, request flow for pages and the REST API, module registration and activation, jobs and key decisions.
order: 30
section: Development
source: docs/architecture.md
---

Atrium is a **modular monolith**: one SvelteKit process, one PostgreSQL database and clearly separated layers. The core provides neutral services, business modules build on top of them – and access the core exclusively through the module SDK.

## Overview

```text
Browser / external services
        │
   hooks.server.ts  ── security headers, session → locals, guard
        │
   ┌────┴──────────────────┐
   │ pages (+page.server)  │   /api/v1/[...path] → API router
   └────┬──────────────────┘
        │  (RequestContext)
   core services  (src/lib/server/core/*)  ← module SDK ($lib/sdk/server)
        │
   PostgreSQL · S3 · SMTP · OpenAI · Chromium
```

## Layers

| Layer | Location | Purpose |
|---|---|---|
| **Core services** | `src/lib/server/core` | Authentication, permissions, modules, settings, API, database, PDF, AI, storage, images, audit, jobs, search, backup, privacy, system. They live under `$lib/server` – SvelteKit keeps them out of client bundles. |
| **Module SDK** | `src/lib/sdk` (`server`, `client`, `types`) | The only interface modules may use. ESLint enforces the boundary. |
| **Modules** | `modules/<id>` | Manifest, endpoints, migrations, UI |
| **Administration** | `src/routes/(internal)/admin`, URLs under `/admin` | Uses the core services directly in load functions and actions with `locals.ctx`. Sidebar, overview, tabs and command palette come from a shared registry. |

The core knows **no business modules in advance**. A Vite plugin (`tools/vite-plugin-atrium-modules.ts`) pulls in every `modules/*/module.ts` at build time – through virtual modules for the server definitions and UIs, plus a Tailwind source for their classes. `ATRIUM_MODULES_DIR` changes the module directory.

## Request flow for pages

`src/hooks.server.ts` chains four steps: `handle = sequence(headers, init, authHandler, guard)`.

1. **`headers`** sets security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS over HTTPS) and `Cache-Control: no-store` except for `/_app/`. The Content Security Policy with nonces comes from `svelte.config.js`.
2. **`init`** waits for `initCore()` (migrations, registration, module sync), creates a request ID, resolves the session and fills `locals.ctx` and `locals.user`.
3. **`authHandler`** answers the Better Auth endpoints under `/api/auth/*`.
4. **`guard`** redirects signed-out visitors to `/login` (exceptions: sign-in, password reset and public module pages under `/p/…`). `/modules/<id>/…` and `/p/<id>/…` return `404` if the module is not enabled.

## Request flow of the REST API

Every request to `/api/v1/*` ends up in a central router (`core/api/router.ts`):

1. Find the endpoint by method and path (`404`/`405`).
2. Check the module status – a disabled module answers `404 module_disabled`.
3. Authenticate: `Authorization: Bearer epk_…` (API key) or session cookie.
4. CSRF: with a session and a write method, `Origin` must equal `ORIGIN`.
5. Rate limiting per key, user or IP and endpoint (default 120/min, anonymous 30/min).
6. Authorization (`permission`, `authenticated`, `sessionOnly`).
7. Validation of params, query and body with Zod (body at most 1 MB).
8. Run the handler → `{ "data": … }` or a ready-made `Response`.
9. Log to `api_log` – without content.

Errors from the core services (`CoreError` with `code` and `status`) are mapped by the router to the [uniform error format](/en/docs/api#responses-and-errors).

## RequestContext

Every core service operation receives a **RequestContext** and checks permissions itself:

```ts
interface RequestContext {
  actor: { type: 'user' | 'api_key' | 'system'; id: string | null; name: string };
  userId: string | null;            // for API keys: the owner
  permissions: ReadonlySet<string>; // effective permissions
  ip: string | null;
  requestId: string;
}
```

Pages get it as `locals.ctx`, API handlers as the `ctx` argument. The context is a snapshot – permission changes take effect from the next request. `core.auth.systemContext()` creates a context with all permissions, strictly for background work.

## Registration, routing, activation

Modules pass through three separate levels:

| Level | When | Effect |
|---|---|---|
| **Registration** | build and startup | The module is known to the build and its manifest is validated. An invalid module is not loaded and shows up as “Broken”. |
| **Routing** | build | Static catch-all routes `/modules/[moduleId]/[...path]` and `/api/v1/modules/<id>/…`, resolved at runtime |
| **Activation** | runtime | The `module_state` table decides reachability, navigation and effective permissions (with a 3 s cache) |

At startup `syncModules()` creates missing `module_state` rows (disabled), reconciles permissions and applies the migrations of already enabled modules.

## Database

- PostgreSQL 17 with Drizzle ORM; core tables in the `public` schema, migrations in `drizzle/`.
- **One schema per module** (`mod_<id>`). `core.database.forModule(id).transaction(…)` sets the `search_path` to it. Core tables and other modules’ schemas are therefore only unreachable **unqualified** – a convention, not a security mechanism.
- A database trigger makes the audit log immutable.
- An advisory lock ensures every migration runs exactly once.

## Background jobs

Modules (and the core) declare jobs with the schedule `hourly`, `daily` or `{ everyMinutes: n }`. The runner starts after initialization, checks **every minute** and runs due jobs of **enabled** modules in the system context:

- `daily` runs once per calendar day within the `JOBS_DAILY_WINDOW` window (default `6-20`, Europe/Berlin).
- After a failure, a retry follows after 15 minutes.
- The lock is an atomic upsert in `job_run`; running jobs write a heartbeat every minute, and a run without one for 10 minutes counts as aborted.
- `GET /api/v1/jobs` lists jobs with their last run, `POST /api/v1/jobs/<module>.<job>/run` starts one immediately (permission `core.jobs.manage`).

Core jobs include `core.housekeeping` (retention periods) and `core.notifications-digest` (daily summaries).

## Installing modules at runtime

The Docker image doesn’t start `node build` but `scripts/supervisor.mjs`. The supervisor runs the app as a child process and rebuilds it when modules are installed:

1. Copy the modules of the running generation, add the new content (must match the content hash of the preview), install the modules’ own npm packages,
2. `svelte-kit sync` and `vite build` into a new **generation** under `/data/atrium/gen/<id>`,
3. Trial run: load and check the modules without a database,
4. Swap and restart, health check (120 s) – otherwise return to the previous generation.

## Decisions

| Decision | Reason |
|---|---|
| SvelteKit 2 instead of 3 | Better Auth declares `@sveltejs/kit@^2` as a peer dependency; Svelte 5 with runes is unchanged. |
| Users only created by administrators | Self-registration is disabled; accounts are created through administration. |
| PGlite for tests | Integration tests run without Docker against real PostgreSQL behavior including triggers. |
| Catch-all routing for module UIs | A central router checks module status and permissions; modules don’t put files into `routes/`. |
| Session or API key | The same endpoints serve the UI and external services; sensitive endpoints are `sessionOnly`. |
| Effective permissions = scopes ∩ owner permissions | An API key can never do more than its owner. |
| SHA-256 for API keys | Keys have 256 bits of entropy; a fast hash is enough and allows lookups by index. |
| In-memory rate limiter | Simple and without extra infrastructure – in exchange, only one app instance. |

## Next steps

- The services in detail: [Core services](/en/docs/core-services)
- Build your own module: [Developing modules](/en/docs/modules)
- Endpoints from outside: [REST API](/en/docs/api)
