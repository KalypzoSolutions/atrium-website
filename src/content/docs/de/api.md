---
title: REST-API
description: Die REST-API von Kalypzo Atrium unter /api/v1 – API-Keys, Scopes, Fehlerformat, Rate Limits, OpenAPI und Beispiele.
order: 33
section: Entwickeln
source: docs/api.md
---

Atrium stellt alle freigegebenen Core-Funktionen und die Endpunkte der aktiven Module als REST-API unter `/api/v1` bereit. Oberfläche und externe Dienste nutzen dieselben Endpunkte – mit Sitzung bzw. mit API-Key.

## Authentifizierung

| Verfahren | Verwendung |
|---|---|
| **API-Key** | Header `Authorization: Bearer epk_…` – für Skripte und externe Dienste |
| **Sitzungs-Cookie** | Anmeldung über die Oberfläche; schreibende Anfragen brauchen einen passenden `Origin`-Header |

Ungültige, widerrufene oder abgelaufene Keys führen zu `401 unauthenticated`. Ist ein Bearer-Header gesetzt, wird die Sitzung ignoriert.

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "https://intern.example.org/api/v1/users?limit=10"
```

## API-Keys

### Anlegen

API-Keys legen Sie in der Oberfläche unter **Administration → API-Keys** an – oder per API mit einer Sitzung (API-Keys können keine API-Keys erzeugen):

```bash
curl -X POST https://intern.example.org/api/v1/api-keys \
  -H "Origin: https://intern.example.org" -H "Cookie: <session>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Export","scopes":["core.users.view"],"expiresAt":"2027-01-01T00:00:00Z"}'
```

- Die Antwort enthält den Key **einmalig** im Klartext (`epk_` + 43 Zeichen).
- Gespeichert werden nur ein SHA-256-Hash und ein Präfix zur Anzeige.
- `expiresAt` ist optional und muss in der Zukunft liegen.
- Widerruf (`DELETE /api/v1/api-keys/:id`) wirkt sofort und ist endgültig.

### Scopes und Berechtigungen

Scopes sind Berechtigungsschlüssel wie `core.users.view`. Die wirksamen Rechte eines Keys sind immer die **Schnittmenge aus Scopes und den aktuellen Rechten des Besitzers**:

- Ein Key kann nie mehr als sein Besitzer.
- Verliert der Besitzer ein Recht (Rolle entzogen, Konto deaktiviert, Modul deaktiviert), verliert es der Key sofort.
- Scopes müssen existieren und vom Ersteller selbst gehalten werden; admin-gleiche Rechte vergeben nur Administratoren.

> **Tipp:** Vergeben Sie nur die Scopes, die ein Dienst wirklich braucht, und setzen Sie ein Ablaufdatum.

## Antworten und Fehler

Erfolgreiche Antworten haben die Form `{ "data": … }` (Status `201` bei POST, sonst `200`). Jede Antwort enthält `X-Request-Id`, geschützte Endpunkte zusätzlich `X-RateLimit-Remaining`. Listen unterstützen `limit` und `offset`.

```json
{
  "error": {
    "code": "forbidden",
    "message": "Berechtigung fehlt: core.users.view",
    "details": null,
    "requestId": "…"
  }
}
```

| Code | Status |
|---|---|
| `bad_request` | 400 |
| `unauthenticated` | 401 |
| `forbidden` | 403 |
| `not_found`, `module_disabled` | 404 |
| `method_not_allowed` | 405 |
| `conflict` | 409 |
| `payload_too_large` | 413 (JSON-Bodies über 1 MB) |
| `validation_failed` | 422 (`details` enthält die Zod-Fehler) |
| `rate_limited` | 429 (mit `Retry-After`) |
| `internal_error` | 500 |
| `unavailable` | 503 |

## Rate Limits

Je Endpunkt und Identität (Key → Benutzer → IP) gelten standardmäßig **120 Anfragen pro 60 Sekunden**, anonym **30**. Teure Endpunkte wie `/pdf` und `/ai/generate` sind auf 20 pro 60 Sekunden begrenzt. Jede Anfrage wird in `api_log` protokolliert – ohne Query-Strings, Bodies oder Header.

## Core-Endpunkte

| Methode | Pfad | Berechtigung |
|---|---|---|
| GET | `/health` | Öffentlich |
| GET | `/openapi.json` | Angemeldet |
| GET | `/me` | Angemeldet – Identität und wirksame Rechte |
| GET | `/users`, `/users/:id` | `core.users.view` |
| POST | `/users` | `core.users.create` |
| PATCH | `/users/:id` | `core.users.edit` |
| DELETE | `/users/:id` | `core.users.delete` |
| GET / POST | `/roles` | `core.roles.view` / `core.roles.create` |
| PATCH / DELETE | `/roles/:id` | `core.roles.edit` / `core.roles.delete` |
| GET | `/permissions` | `core.roles.view` |
| GET | `/modules` | `core.modules.view` |
| POST | `/modules/:id/enable`, `/modules/:id/disable` | `core.modules.manage` |
| GET | `/jobs` | `core.jobs.manage` |
| POST | `/jobs/:key/run` | `core.jobs.manage` |
| GET / PUT | `/settings` | `core.settings.view` / `core.settings.manage` |
| GET / POST / DELETE | `/api-keys`, `/api-keys/:id` | `core.api.view` / `core.api.manage` (nur Sitzung) |
| POST | `/pdf` | `core.pdf.generate` |
| POST | `/ai/generate` | `core.ai.use` |
| GET | `/ai/usage` | `core.ai.view` |
| GET / DELETE | `/storage/files` | `core.storage.manage` |
| POST | `/storage/upload-url` | `core.storage.manage` |
| GET | `/audit-logs` | `core.audit.view` |

**Modul-Endpunkte** liegen unter `/api/v1/modules/<id>/…`. Deaktivierte Module antworten mit `404 module_disabled`.

## OpenAPI-Spezifikation

- **Live:** `GET /api/v1/openapi.json` (angemeldet) liefert die OpenAPI-3.1-Spezifikation aller Core- und Modul-Endpunkte.
- **Statisch:** `docs/openapi.json` im Repository, erzeugt mit:

```bash
bun run openapi
```

- **In der Oberfläche:** Unter **Administration → API-Keys → API-Übersicht** (`/admin/api/docs`) finden Sie alle Endpunkte mit Schemas, Fehlern und Rate Limits. Dort können Sie Anfragen mit Ihrer Sitzung ausprobieren und ein curl-Snippet kopieren.

## Beispiele

### Eigene Identität und Rechte abfragen

```bash
curl -H "Authorization: Bearer $API_KEY" https://intern.example.org/api/v1/me
```

### Benutzer suchen

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "https://intern.example.org/api/v1/users?search=anna&limit=20&offset=0"
```

### PDF erzeugen

```bash
curl -X POST https://intern.example.org/api/v1/pdf \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" -o liste.pdf \
  -d '{"title":"Liste","content":[{"type":"paragraph","text":"Hallo"}]}'
```

### Einstellungen setzen

```bash
curl -X PUT https://intern.example.org/api/v1/settings \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"values":{"core.system.name":"Meine Organisation"}}'
```

## Nächste Schritte

- Eigene Endpunkte im Modul definieren: [Module entwickeln](/de/docs/modules)
- Rollen, Rechte und Scopes: [Benutzer, Rollen und Rechte](/de/docs/users-roles)
