---
title: Security
description: The Atrium security model – sign-in, permissions, secrets, audit log, known limitations and hardening checklist.
order: 23
section: Operations
source: docs/security.md
---

Atrium is built for handling personal data. This page summarizes how sign-in, permissions, secrets and backups work and what you should keep in mind as an operator.

## Sign-in and sessions

- Sign-in with email and password (Better Auth). **Self-registration is disabled** – administrators create accounts.
- Passwords must be 12–128 characters long.
- **Two-factor authentication** via TOTP with backup codes, enabled in the profile.
- Sessions last 7 days and are renewed after one day. Cookies are `HttpOnly`, `SameSite=Lax` and `Secure` over HTTPS. Users can view and revoke active sessions in their profile.
- Password reset via email: the link is valid for one hour, after which all sessions are ended. The response doesn't reveal whether an account exists.

### Brute-force protection

- Rate limits for sign-in (10/min), password reset, TOTP and profile changes.
- 5 failed attempts within 15 minutes only lock that IP out of that account – a foreign IP cannot lock you out.
- From 50 failed attempts per account within 15 minutes, a global account lock applies and the owner is notified by email.

## Roles and permissions

Atrium uses role-based access control (RBAC):

- A **permission** has the form `module.resource.action`, e.g. `core.users.edit`.
- A **role** is a named set of permissions. Users can have any number of roles plus individual permissions.
- Only permissions of the core and of **enabled** modules take effect.
- Checks happen exclusively on the server; the UI merely hides things.

The system role **Administrator** holds every registered permission explicitly (there is no wildcard permission) and can be neither modified nor deleted.

### Protection against privilege escalation

- Only someone who holds a permission can grant it – for roles as well as API keys.
- The **last active administrator** can't be deactivated, deleted or stripped of the role.
- **Admin-equivalent permissions** can only be granted by administrators: `core.system.backup`, `core.system.reset`, `core.privacy.export` and `core.users.impersonate`. Role management marks them with an "admin-equivalent" badge.
- API keys never get more than the intersection of their scopes and the owner's permissions (see [REST API](/en/docs/api)).

## Security headers and CSRF

- Strict content security policy with nonces: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'` – no inline scripts.
- In addition `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and HSTS over HTTPS.
- **CSRF:** Forms use SvelteKit's origin check. Session-authenticated API write requests must send an `Origin` equal to `ORIGIN`.
- Public module endpoints are a deliberate opt-in with a mandatory rate limit and require `application/json`.

## Secrets and `APP_SECRET`

- Secrets that must be recoverable – SMTP password, S3 credentials, OpenAI key – are encrypted with **AES-256-GCM**. The key is derived from `APP_SECRET` using HKDF-SHA-256.
- Secrets are never sent to the browser or written to logs; audit entries only record that a secret was changed.
- API keys have 256 bits of randomness and are stored only as a SHA-256 hash.

> **Caution:** A new `APP_SECRET` makes stored secrets unreadable and ends all sessions. There is no automatic re-encryption. If you must rotate the key: note down your secrets, change `APP_SECRET`, re-enter the values in the UI – or create a backup and restore it on the server with the new `APP_SECRET` (which re-encrypts everything).

## Audit log

The `audit_log` table is **immutable** (append-only), enforced by a database trigger. It records, among other things, sign-ins and failed attempts, lockouts, password changes, changes to users, roles and permissions, API keys, settings and module activation. Personal fields are masked or removed. The API access log (`api_log`) contains no payloads. Users with `core.audit.view` can view the audit log.

## Backups and privacy

- **Backups** from the interface are encrypted with their own backup password (scrypt, AES-256-GCM); export and import require the account password and 2FA. Inside the encryption the file contains all data including credentials – file plus password mean full access. Details: [Backup and restore](/en/docs/backup-restore).
- **Data export**, retention periods and data sent to third parties are covered in [Privacy and audit log](/en/docs/privacy).
- **AI data minimization:** prompts and responses are neither stored nor logged.
- **Third parties:** all connections to external services (SMTP, S3, AI, GitHub, push) originate from the server, not the browser.

## PDF renderer

Chromium renders PDFs without JavaScript and with network access blocked; all content is HTML-escaped. The `PDF_CHROMIUM_SANDBOX` variable controls the Chromium sandbox:

| Value | Behavior |
|---|---|
| `auto` (default) | starts with the sandbox first; if that fails (typically in a container without a suitable seccomp profile), falls back once to `--no-sandbox` with a warning in the log |
| `on` | never without the sandbox – PDFs fail otherwise |
| `off` | explicitly without the sandbox |

For production the project recommends `on` with a seccomp profile that allows Chromium user namespaces, or a separate container for the renderer.

## Known limitations

- Rate limiter and login lockout live in process memory and are lost on restart; multi-instance operation is not supported.
- The audit log is not protected against database superusers.
- Separation of module schemas is a convention, not a security mechanism – modules are trusted code.
- Uploads are not scanned for viruses.

## Hardening checklist

- [ ] HTTPS enforced, `ORIGIN` with `https://`, HSTS active
- [ ] `APP_SECRET` random (≥ 32 characters), backed up securely, not in the repository
- [ ] `INITIAL_ADMIN_*` removed after the first start, admin password changed, 2FA enabled for administrators
- [ ] `ADDRESS_HEADER`/`XFF_DEPTH` match the proxy
- [ ] database not publicly reachable
- [ ] S3 bucket private, minimal permissions, CORS for `ORIGIN` only
- [ ] regular backups stored off the server, including restore tests
- [ ] roles and API key scopes following least privilege, short key lifetimes
- [ ] review the audit log regularly, keep dependencies up to date

## Next steps

- Roles and admin-level permissions: [Users, roles and permissions](/en/docs/users-roles)
- Install modules safely: [Managing modules](/en/docs/module-management)
- Set up operations and backups: [Installation](/en/docs/installation)
- Privacy and audit log in detail: [Privacy and audit log](/en/docs/privacy)
