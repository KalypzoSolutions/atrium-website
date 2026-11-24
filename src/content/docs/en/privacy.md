---
title: Privacy and audit log
description: GDPR data export (Art. 15/20), the immutable audit log, retention periods, deleting accounts and which data Atrium sends to third parties.
order: 15
section: Administration
source: docs/security.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium is built for processing personal data. This page describes the tools the interface gives you as the data controller: data export, audit log and retention periods – and which external services receive data, and when.

## Data export (GDPR Art. 15 and 20)

**Administration → Data export** exports all stored data about a person as a JSON file – for the right of access and data portability. The permission `core.privacy.export` is admin-level.

<DocShot name="24-privacy" lang="en" />

1. Search for the person by name or email (at least 2 characters). The search finds user accounts – including disabled ones – and, if a module provides them, other people such as members.
2. Click **Export (JSON)** next to the right person.

The export of a **user account** contains: the account, roles (including those from modules), sessions, API keys (without the key), personal settings, own uploads (metadata only), the person’s audit entries (at most 5000) and the contributions of all enabled modules that support data export. **File contents** (documents, images) are not included.

> **Caution:** the file contains everything about the person in plain text – depending on the modules, including health data. Only hand it to the person concerned or their legal guardians, and don’t send it unencrypted by email. Every export is recorded in the audit log (only with IDs and counts).

## Audit log

The **audit log** under **Administration → Audit log** (permission `core.audit.view`) answers the question: who changed what, and when?

<DocShot name="13-audit-log" lang="en" />

Among other things, it records:

- sign-ins, failed attempts and locks, password and 2FA changes,
- changes to users, roles and permissions, API keys,
- settings (for secrets only the fact that something changed),
- module activations, installations and removals,
- backups, restores, resets and data exports,
- actions an administrator performs “as a user” – with the acting person in every row.

You can filter the list by actor, action, target and period; **Action (prefix)** narrows it down, e.g. to `core.user`. Each entry can show details and the request ID, which lets you find the operation in the server log.

Properties:

- **Immutable:** a database trigger prevents changes and deletion. Controlled exceptions exist only for resets, restores and retention periods.
- **Data-minimizing:** passwords, tokens and keys are replaced with `[redacted]`; email addresses in sign-in entries are only stored masked (`a***@domain`).
- The API access log (`api_log`) stores no content – only method, path pattern, status, IP, actor and API key.

> **Note:** the audit log is not protected against a database superuser – the trigger could be removed. Protect database access accordingly.

## Retention periods

Logs with IP addresses are only kept as long as you set under **Settings → General → Retention periods**. The daily job `core.housekeeping` deletes older entries:

| Data | Default |
|---|---|
| API access log | 30 days |
| IP addresses in the audit log (the entry stays) | 90 days |
| Audit log | 730 days (0 = never delete) |

Your organization sets the actual periods and records them in its record of processing activities. Backups contain the logs as they were at export time.

## Deleting accounts

When an account is deleted, every module cleans up its data for that account: personal data is deleted, shared content is handed over depending on the module. Disabling an account, by contrast, deletes nothing. See [Users, roles and permissions](/en/docs/users-roles#disabling-or-deleting).

## Data sent to third parties

All connections to external services originate **from the server**, not from users’ browsers. The core contacts these recipients:

| Recipient | When | What |
|---|---|---|
| SMTP server | with every email | recipient address, subject, text, attachments |
| S3 storage | on uploads and downloads | file contents |
| AI provider | only on demand in the writing assistant, or when modules use AI | the text in the field and key facts; email addresses, phone numbers and IBANs masked first |
| Web Push services (Google, Apple, Mozilla, Microsoft) | only for people who turned on push | title, short text and link path, end-to-end encrypted |
| GitHub | only when loading a module source | repository and ref, optionally the GitHub token – no personal data |

Sign a data processing agreement with mail, storage and AI providers unless you run them yourself, and check the legal basis for transfers to providers outside the EU. Modules can add further recipients – their documentation names them.

## AI and data minimization

Prompts and responses are neither stored nor logged; Atrium only counts requests, tokens and estimated costs. Module and model allow-lists, rate limits and monthly limits cap usage (see [Settings → AI](/en/docs/settings#ai)).

## Next steps

- Security model and hardening: [Security](/en/docs/security)
- Backups and deleting whole areas: [Backup and restore](/en/docs/backup-restore)
