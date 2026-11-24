---
title: Entwicklung
description: Am Core von Kalypzo Atrium entwickeln – npm-Skripte, Projektstruktur, Migrationen sowie Tests mit Vitest, PGlite und Playwright.
order: 34
section: Entwickeln
source: README.md
---

Diese Seite richtet sich an alle, die am Core von Atrium mitarbeiten. Die lokale Umgebung richten Sie wie im [Schnellstart](/de/docs/quickstart) beschrieben ein.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver (Vite) |
| `npm run build` / `npm start` | Produktions-Build / Start (`node build`) |
| `npm run check` | `svelte-kit sync` und `svelte-check` |
| `npm run lint` / `npm run format` | ESLint und Prettier prüfen / schreiben |
| `npm test` | Vitest (Unit und Integration) mit Fixture-Modulen |
| `npm run test:unit` / `npm run test:integration` | Teilmengen der Tests |
| `npm run test:core` | Core-Tests mit den Fixture-Modulen aus `tests/fixtures/modules` |
| `npm run check:core` | Typprüfung mit den Fixture-Modulen |
| `npm run test:e2e` | Playwright-E2E-Tests |
| `npm run db:generate` | Drizzle-Migration aus dem Schema erzeugen |
| `npm run db:migrate` | Migrationen manuell anwenden |
| `npm run db:studio` | Drizzle Studio |
| `npm run openapi` | `docs/openapi.json` erzeugen |

## Projektstruktur

```text
src/
├── hooks.server.ts              Session, Guard, Security-Header, Auth-Handler
├── lib/
│   ├── server/core/             Core-Implementierung (nur Server)
│   │   ├── auth/ permissions/ modules/ settings/ api/ jobs/ search/
│   │   ├── database/ pdf/ ai/ storage/ images/ audit/
│   │   ├── backup/ privacy/ system/
│   │   └── index.ts             core-Objekt
│   ├── sdk/{server,client,types}  öffentliche Modul-SDK-Schnittstelle
│   └── components/{ui,layout,forms}  shadcn-svelte, Layout-Bausteine, Formular-Builder
└── routes/
    ├── login/ forgot-password/ reset-password/
    ├── api/v1/[...path]/        zentraler REST-Router
    ├── p/                       öffentliche Modulseiten (/p/<modul>/…)
    └── (internal)/              Dashboard, Profil, Modulseiten, Verwaltung unter /admin
modules/                         Fachmodule (leer, von Git ausgenommen)
drizzle/                         SQL-Migrationen des Core
deploy/nginx/  deploy/backup/    Reverse Proxy und Sicherungsdienst
tests/{unit,integration,e2e,helpers,fixtures}
docs/                            Dokumentation
```

Der Core kennt keine Fachmodule: Ein Vite-Plugin (`tools/vite-plugin-atrium-modules.ts`) bindet die Module aus dem Modulverzeichnis zur Build-Zeit ein. Das Verzeichnis lässt sich über `ATRIUM_MODULES_DIR` umstellen.

## Tests

### Unit- und Integrationstests

Die Tests laufen mit **Vitest** gegen **PGlite** – echtes PostgreSQL-Verhalten (inklusive Trigger) ohne Docker. Da das Repository keine Fachmodule enthält, nutzen die Core-Tests Fixture-Module:

```bash
npm run test:core     # Vitest mit ATRIUM_MODULES_DIR=tests/fixtures/modules
npm run check:core    # svelte-check mit den Fixture-Modulen
```

### Gegen echtes PostgreSQL testen

PGlite hat nur eine Sitzung; Nebenläufigkeit und Advisory-Sperren prüfen Sie gegen einen echten Server:

```bash
docker run -d --rm --name ep-pg-test -p 55432:5432 -e POSTGRES_PASSWORD=postgres postgres:17.11-alpine3.24
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres npx vitest run tests/integration
docker stop ep-pg-test
```

Jede Testdatei erhält dabei eine eigene Datenbank; der Benutzer braucht das Recht `CREATEDB`.

### End-to-End-Tests

```bash
npx playwright install chromium
npm run test:e2e
```

`test:e2e` startet eine PGlite-Instanz per TCP-Socket – Docker ist nicht nötig. Mit `E2E_DATABASE_URL` testen Sie gegen ein echtes PostgreSQL (siehe `scripts/e2e-server.mjs`).

## Datenbankmigrationen

Die Core-Migrationen liegen als SQL in `drizzle/` und werden beim Start automatisch angewendet. Bei einer Schemaänderung:

1. `schema.ts` anpassen.
2. Migration erzeugen:

   ```bash
   npm run db:generate
   ```

3. Das erzeugte SQL prüfen und committen.

Eine Advisory-Sperre sorgt dafür, dass jede Migration genau einmal läuft – auch wenn zwei Instanzen gleichzeitig starten.

## Code-Qualität

Vor einem Pull Request sollten diese Prüfungen grün sein (sie laufen auch in der CI):

```bash
npm run check
npm run lint
npm test
npm run build
```

Die CI (`.github/workflows/ci.yml`) läuft bei jedem Push auf `main`/`staging` und bei Pull Requests; die E2E-Tests laufen nächtlich.

## Nächste Schritte

- Eigene Module schreiben: [Module entwickeln](/de/docs/modules)
- Endpunkte und OpenAPI: [REST-API](/de/docs/api)
- Zurück zur [Einführung](/de/docs)
