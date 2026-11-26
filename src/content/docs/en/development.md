---
title: Development
description: Contribute to the Kalypzo Atrium core – Bun scripts, project structure, tests and migrations.
order: 34
section: Development
source: README.md
---

This page is for everyone working on the Atrium core. Set up your local environment as described in the [quick start](/en/docs/quickstart).

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Development server (Vite) |
| `bun run build` / `bun run start` | Production build / start (`bun ./build/index.js`) |
| `bun run check` | `svelte-kit sync` and `svelte-check` |
| `bun run lint` / `bun run format` | Check / write ESLint and Prettier |
| `bun run test` | `bun test` (unit and integration) with fixture modules |
| `bun run test:unit` / `bun run test:integration` | Subsets of the tests |
| `bun run test:core` | Core tests with the fixture modules from `tests/fixtures/modules` |
| `bun run check:core` | Type check with the fixture modules |
| `bun run test:e2e` | Playwright end-to-end tests |
| `bun run db:generate` | Generate a Drizzle migration from the schema |
| `bun run db:migrate` | Apply migrations manually |
| `bun run db:studio` | Drizzle Studio |
| `bun run openapi` | Generate `docs/openapi.json` |

## Project structure

```text
src/
├── hooks.server.ts              session, guard, security headers, auth handler
├── lib/
│   ├── server/core/             core implementation (server only)
│   │   ├── auth/ permissions/ modules/ settings/ api/ jobs/ search/
│   │   ├── database/ pdf/ ai/ storage/ images/ audit/
│   │   ├── backup/ privacy/ system/
│   │   └── index.ts             core object
│   ├── sdk/{server,client,types}  public module SDK
│   └── components/{ui,layout,forms}  shadcn-svelte, layout building blocks, form builder
└── routes/
    ├── login/ forgot-password/ reset-password/
    ├── api/v1/[...path]/        central REST router
    ├── p/                       public module pages (/p/<module>/…)
    └── (internal)/              dashboard, profile, module pages, admin under /admin
modules/                         feature modules (empty, ignored by Git)
drizzle/                         core SQL migrations
deploy/nginx/  deploy/backup/    reverse proxy and backup service
tests/{unit,integration,e2e,helpers,fixtures}
docs/                            documentation
```

Feature modules are not part of the repository; a Vite plugin includes them from the module directory (`ATRIUM_MODULES_DIR`) at build time (see [Architecture](/en/docs/architecture#layers)).

## Tests

### Unit and integration tests

Tests run with **`bun test`** against **PGlite** – real PostgreSQL behavior (including triggers) without Docker. Since the repository contains no feature modules, the core tests use fixture modules:

```bash
bun run test:core     # bun test with ATRIUM_MODULES_DIR=tests/fixtures/modules
bun run check:core    # svelte-check with the fixture modules
```

### Testing against real PostgreSQL

PGlite has a single session only; test concurrency and advisory locks against a real server:

```bash
docker run -d --rm --name ep-pg-test -p 55432:5432 -e POSTGRES_PASSWORD=postgres postgres:17.11-alpine3.24
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres bun scripts/test.mjs ./tests/integration
docker stop ep-pg-test
```

Each test file gets its own database; the user needs the `CREATEDB` privilege.

### End-to-end tests

```bash
bun run playwright install chromium
bun run test:e2e
```

`test:e2e` starts a PGlite instance over a TCP socket – no Docker required. Set `E2E_DATABASE_URL` to test against a real PostgreSQL (see `scripts/e2e-server.mjs`).

## Database migrations

Core migrations live as SQL in `drizzle/` and are applied automatically on startup. When you change the schema:

1. Update `schema.ts`.
2. Generate a migration:

   ```bash
   bun run db:generate
   ```

3. Review and commit the generated SQL.

An advisory lock ensures that every migration runs exactly once – even if two instances start at the same time.

## Code quality

These checks should pass before you open a pull request (they also run in CI):

```bash
bun run check
bun run lint
bun run test
bun run build
```

CI (`.github/workflows/ci.yml`) runs on every push to `main`/`staging` and on pull requests; end-to-end tests run nightly.

## Next steps

- Build your own modules: [Developing modules](/en/docs/modules)
- Endpoints and OpenAPI: [REST API](/en/docs/api)
- Back to the [introduction](/en/docs)
