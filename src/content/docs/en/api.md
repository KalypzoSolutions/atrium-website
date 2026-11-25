---
title: REST API
description: The Kalypzo Atrium REST API under /api/v1 – API keys, scopes, error format, rate limits, OpenAPI and examples.
order: 33
section: Development
source: docs/api.md
---

Atrium exposes all approved core functions and the endpoints of enabled modules as a REST API under `/api/v1`. The UI and external services use the same endpoints – with a session or an API key, respectively.

## Authentication

| Method | Use |
|---|---|
| **API key** | Header `Authorization: Bearer epk_…` – for scripts and external services |
| **Session cookie** | Sign-in through the UI; write requests need a matching `Origin` header |

Invalid, revoked or expired keys result in `401 unauthenticated`. If a bearer header is present, the session is ignored.

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "https://intern.example.org/api/v1/users?limit=10"
```

## API keys

### Creating keys

Create API keys in the UI under **Administration → API keys** – or via the API with a session (API keys cannot create API keys):

```bash
curl -X POST https://intern.example.org/api/v1/api-keys \
  -H "Origin: https://intern.example.org" -H "Cookie: <session>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Export","scopes":["core.users.view"],"expiresAt":"2027-01-01T00:00:00Z"}'
```

- The response contains the key in plain text **once** (`epk_` + 43 characters).
- Only a SHA-256 hash and a display prefix are stored.
- `expiresAt` is optional and must be in the future.
- Revocation (`DELETE /api/v1/api-keys/:id`) takes effect immediately and is final.

### Scopes and permissions

Scopes are permission keys such as `core.users.view`. A key's effective permissions are always the **intersection of its scopes and the owner's current permissions**:

- A key can never do more than its owner.
- If the owner loses a permission (role removed, account deactivated, module disabled), the key loses it immediately.
- Scopes must exist and be held by the creator; admin-equivalent permissions can only be granted by administrators.

> **Tip:** Only grant the scopes a service really needs, and set an expiry date.

## Responses and errors

Successful responses have the form `{ "data": … }` (status `201` for POST, otherwise `200`). Every response includes `X-Request-Id`; protected endpoints also include `X-RateLimit-Remaining`. Lists support `limit` and `offset`.

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
| `payload_too_large` | 413 (JSON bodies over 1 MB) |
| `validation_failed` | 422 (`details` contains the Zod issues) |
| `rate_limited` | 429 (with `Retry-After`) |
| `internal_error` | 500 |
| `unavailable` | 503 |

## Rate limits

Per endpoint and identity (key → user → IP), the default is **120 requests per 60 seconds**, **30** for anonymous requests. Expensive endpoints like `/pdf` and `/ai/generate` are limited to 20 per 60 seconds. Every request is logged in `api_log` – without query strings, bodies or headers.

## Core endpoints

| Method | Path | Permission |
|---|---|---|
| GET | `/health` | Public |
| GET | `/openapi.json` | Signed in |
| GET | `/me` | Signed in – identity and effective permissions |
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
| GET / POST / DELETE | `/api-keys`, `/api-keys/:id` | `core.api.view` / `core.api.manage` (session only) |
| POST | `/pdf` | `core.pdf.generate` |
| POST | `/ai/generate` | `core.ai.use` |
| GET | `/ai/usage` | `core.ai.view` |
| GET / DELETE | `/storage/files` | `core.storage.manage` |
| POST | `/storage/upload-url` | `core.storage.manage` |
| GET | `/audit-logs` | `core.audit.view` |

**Module endpoints** live under `/api/v1/modules/<id>/…`. Disabled modules respond with `404 module_disabled`.

## OpenAPI specification

- **Live:** `GET /api/v1/openapi.json` (signed in) returns the OpenAPI 3.1 specification of all core and module endpoints.
- **Static:** `docs/openapi.json` in the repository, generated with:

```bash
npm run openapi
```

- **In the UI:** Under **Administration → API keys → API overview** (`/admin/api/docs`) you'll find every endpoint with schemas, errors and rate limits. You can try requests with your session and copy a curl snippet.

## Examples

### Query your own identity and permissions

```bash
curl -H "Authorization: Bearer $API_KEY" https://intern.example.org/api/v1/me
```

### Search users

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "https://intern.example.org/api/v1/users?search=anna&limit=20&offset=0"
```

### Generate a PDF

```bash
curl -X POST https://intern.example.org/api/v1/pdf \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" -o list.pdf \
  -d '{"title":"List","content":[{"type":"paragraph","text":"Hello"}]}'
```

### Update settings

```bash
curl -X PUT https://intern.example.org/api/v1/settings \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"values":{"core.system.name":"My organization"}}'
```

## Next steps

- Define your own endpoints in a module: [Developing modules](/en/docs/modules)
- Roles, permissions and scopes: [Users, roles and permissions](/en/docs/users-roles)
