---
title: Architektur
description: Aufbau von Kalypzo Atrium – modularer Monolith, Schichten, Requestfluss, Modulaktivierung, Jobs und zentrale Entscheidungen.
order: 30
section: Entwickeln
source: docs/architecture.md
---

Atrium ist ein **modularer Monolith**: ein SvelteKit-Prozess, eine PostgreSQL-Datenbank und klar getrennte Schichten. Der Core stellt neutrale Dienste bereit, Fachmodule bauen darauf auf – und greifen ausschließlich über das Modul-SDK auf den Core zu.

## Überblick

```text
Browser / externe Dienste
        │
   hooks.server.ts  ── Security-Header, Session → locals, Guard
        │
   ┌────┴──────────────────┐
   │ Seiten (+page.server) │   /api/v1/[...path] → API-Router
   └────┬──────────────────┘
        │  (RequestContext)
   Core-Services  (src/lib/server/core/*)  ← Modul-SDK ($lib/sdk/server)
        │
   PostgreSQL · S3 · SMTP · OpenAI · Chromium
```

## Schichten

| Schicht | Ort | Aufgabe |
|---|---|---|
| **Core-Services** | `src/lib/server/core` | Authentifizierung, Berechtigungen, Module, Einstellungen, API, Datenbank, PDF, KI, Speicher, Bilder, Audit, Jobs, Suche, Sicherung, Datenschutz, System. Liegen unter `$lib/server` – SvelteKit verhindert, dass sie in Client-Bundles geraten. |
| **Modul-SDK** | `src/lib/sdk` (`server`, `client`, `types`) | Die einzige erlaubte Schnittstelle für Module. ESLint erzwingt die Grenze. |
| **Module** | `modules/<id>` | Manifest, Endpunkte, Migrationen, Oberfläche |
| **Administration** | `src/routes/(internal)/admin`, URLs unter `/admin` | Nutzt die Core-Services direkt in Load-Funktionen und Actions mit `locals.ctx`. Seitenleiste, Übersicht, Reiter und Befehlspalette stammen aus einer gemeinsamen Registry. |

Der Core kennt **keine Fachmodule im Voraus**. Ein Vite-Plugin (`tools/vite-plugin-atrium-modules.ts`) bindet zur Build-Zeit alle `modules/*/module.ts` ein – über virtuelle Module für die Server-Definitionen und die Oberflächen sowie eine Tailwind-Quelle für deren Klassen. Das Modulverzeichnis lässt sich mit `ATRIUM_MODULES_DIR` umstellen.

## Requestfluss für Seiten

`src/hooks.server.ts` verkettet vier Schritte: `handle = sequence(headers, init, authHandler, guard)`.

1. **`headers`** setzt Security-Header (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS bei HTTPS) und `Cache-Control: no-store` außer für `/_app/`. Die Content Security Policy mit Nonces kommt aus `svelte.config.js`.
2. **`init`** wartet auf `initCore()` (Migrationen, Registrierung, Modul-Synchronisation), erzeugt eine Request-ID, löst die Sitzung auf und füllt `locals.ctx` und `locals.user`.
3. **`authHandler`** beantwortet die Better-Auth-Endpunkte unter `/api/auth/*`.
4. **`guard`** leitet nicht angemeldete Personen auf `/login` um (Ausnahmen: Anmeldung, Passwort-Reset und öffentliche Modulseiten unter `/p/…`). `/modules/<id>/…` und `/p/<id>/…` liefern `404`, wenn das Modul nicht aktiv ist.

## Requestfluss der REST-API

Alle Anfragen an `/api/v1/*` landen in einem zentralen Router (`core/api/router.ts`):

1. Endpunkt per Methode und Pfad finden (`404`/`405`).
2. Modulstatus prüfen – ein deaktiviertes Modul antwortet mit `404 module_disabled`.
3. Authentifizieren: `Authorization: Bearer epk_…` (API-Key) oder Sitzungs-Cookie.
4. CSRF: Bei Sitzung und schreibender Methode muss `Origin` gleich `ORIGIN` sein.
5. Rate Limiting je Key, Benutzer oder IP und Endpunkt (Standard 120/min, anonym 30/min).
6. Autorisierung (`permission`, `authenticated`, `sessionOnly`).
7. Validierung von Parametern, Query und Body mit Zod (Body höchstens 1 MB).
8. Handler ausführen → `{ "data": … }` oder eine fertige `Response`.
9. Protokollierung in `api_log` – ohne Inhalte.

Fehler aus den Core-Services (`CoreError` mit `code` und `status`) bildet der Router auf das [einheitliche Fehlerformat](/de/docs/api#antworten-und-fehler) ab.

## RequestContext

Jede Operation eines Core-Service erhält einen **RequestContext** und prüft die Berechtigung selbst:

```ts
interface RequestContext {
  actor: { type: 'user' | 'api_key' | 'system'; id: string | null; name: string };
  userId: string | null;            // bei API-Keys: Besitzer
  permissions: ReadonlySet<string>; // wirksame Rechte
  ip: string | null;
  requestId: string;
}
```

In Seiten steht er als `locals.ctx` bereit, in API-Handlern als Argument `ctx`. Der Kontext ist ein Schnappschuss – Rechteänderungen wirken ab der nächsten Anfrage. `core.auth.systemContext()` erzeugt einen Kontext mit allen Rechten, ausschließlich für Hintergrundarbeit.

## Registrierung, Routing, Aktivierung

Module durchlaufen drei voneinander getrennte Ebenen:

| Ebene | Wann | Wirkung |
|---|---|---|
| **Registrierung** | Build und Start | Das Modul ist im Build bekannt, sein Manifest wird validiert. Ein ungültiges Modul wird nicht geladen und als „Defekt“ angezeigt ([Prüfungen](/de/docs/modules#manifest-und-definition-module-ts)). |
| **Routing** | Build | Statische Catch-all-Routen `/modules/[moduleId]/[...path]` und `/api/v1/modules/<id>/…`, aufgelöst zur Laufzeit |
| **Aktivierung** | Laufzeit | Tabelle `module_state` entscheidet über Erreichbarkeit, Navigation und wirksame Rechte (mit 3 s Cache) |

Beim Start legt `syncModules()` fehlende Einträge in `module_state` an (deaktiviert), gleicht Berechtigungen ab und wendet Migrationen bereits aktiver Module an.

## Datenbank

- PostgreSQL 17 mit Drizzle ORM; Core-Tabellen im Schema `public`, Migrationen in `drizzle/`.
- **Ein Schema je Modul** (`mod_<id>`). `core.database.forModule(id).transaction(…)` setzt den `search_path` darauf. Core-Tabellen und fremde Modulschemas sind damit nur **unqualifiziert** unerreichbar – eine Konvention, kein Sicherheitsmechanismus. Wie Module Tabellen und Migrationen anlegen, steht unter [Datenbank und Migrationen](/de/docs/modules#datenbank-und-migrationen).
- Das Audit-Log ist per Datenbank-Trigger unveränderlich.
- Eine Advisory-Sperre sorgt dafür, dass jede Migration genau einmal läuft.

## Hintergrundjobs

Module (und der Core) deklarieren Jobs mit dem Zeitplan `hourly`, `daily` oder `{ everyMinutes: n }`. Der Runner startet nach der Initialisierung, prüft **jede Minute** und führt fällige Jobs **aktiver** Module im Systemkontext aus. Wie ein Modul Jobs deklariert, zeigt [Jobs und Suche](/de/docs/core-services#jobs-und-suche).

Für den Runner gilt:

- `daily` läuft einmal je Kalendertag im Zeitfenster `JOBS_DAILY_WINDOW` (Standard `6-20`, Europe/Berlin).
- Nach einem Fehlschlag folgt ein neuer Versuch nach 15 Minuten.
- Die Sperre ist ein atomares Upsert in `job_run`; laufende Jobs schreiben jede Minute ein Lebenszeichen, nach 10 Minuten ohne gilt ein Lauf als abgebrochen.
- `GET /api/v1/jobs` listet Jobs mit letztem Lauf, `POST /api/v1/jobs/<modul>.<job>/run` startet einen sofort (Recht `core.jobs.manage`).

Core-Jobs sind z. B. `core.housekeeping` (Aufbewahrungsfristen) und `core.notifications-digest` (tägliche Zusammenfassungen).

## Modulinstallation zur Laufzeit

Das Docker-Image startet nicht `node build`, sondern `scripts/supervisor.mjs`. Der Supervisor startet die App als Kindprozess und baut sie neu, wenn Module installiert werden (Bedienung siehe [Module verwalten](/de/docs/module-management)):

1. Module der laufenden Generation kopieren, neuen Inhalt einspielen (muss zum Inhaltshash der Vorschau passen), eigene npm-Pakete der Module installieren,
2. `svelte-kit sync` und `vite build` in eine neue **Generation** unter `/data/atrium/gen/<id>`,
3. Probelauf: Module laden und prüfen, ohne Datenbank,
4. Tausch und Neustart, Health-Prüfung (120 s) – sonst Rückkehr zur vorigen Generation.

## Entscheidungen

| Entscheidung | Begründung |
|---|---|
| SvelteKit 2 statt 3 | Better Auth deklariert `@sveltejs/kit@^2` als Peer-Abhängigkeit; Svelte 5 mit Runes bleibt unverändert. |
| Benutzer nur administrativ | Selbstregistrierung ist deaktiviert; Konten entstehen über die Verwaltung. |
| PGlite für Tests | Integrationstests laufen ohne Docker gegen echtes PostgreSQL-Verhalten inklusive Trigger. |
| Catch-all-Routing für Modul-UI | Ein zentraler Router prüft Modulstatus und Rechte; Module legen keine Dateien in `routes/` ab. |
| Sitzung oder API-Key | Gleiche Endpunkte für Oberfläche und externe Dienste; sensible Endpunkte sind `sessionOnly`. |
| Wirksame Rechte = Scopes ∩ Besitzerrechte | Ein API-Key kann nie mehr als sein Besitzer. |
| SHA-256 für API-Keys | Keys haben 256 Bit Entropie; ein schneller Hash genügt und erlaubt den Lookup per Index. |
| In-Memory-Rate-Limiter | Einfach und ohne Zusatzinfrastruktur – dafür nur eine App-Instanz. |

## Nächste Schritte

- Die Dienste im Detail: [Core-Services](/de/docs/core-services)
- Ein eigenes Modul bauen: [Module entwickeln](/de/docs/modules)
- Endpunkte von außen: [REST-API](/de/docs/api)
