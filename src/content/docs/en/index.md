---
title: Introduction
description: What Kalypzo Atrium is, how core and modules work together and where to find what in the documentation.
order: 1
section: Getting started
source: README.md
---

<script>
	import DocsOverview from '$lib/components/docs/DocsOverview.svelte';
</script>

Kalypzo Atrium is a **self-hosted, web-based administration platform**. It consists of a neutral, multilingual (currently German and English) **core** and **feature modules** that you install at runtime under **Administration → Modules** from a GitHub link or a ZIP file.

<DocsOverview lang="en" />

## Core and modules

The core ships everything an administration application needs – but no business logic:

- **Sign-in** with email/password and optional two-factor authentication (TOTP, backup codes)
- **Roles and permissions** (RBAC), including individual permissions per user
- **Module management**: install, enable, disable and update modules
- **Settings** in the UI, with secrets encrypted in the database
- **REST API** under `/api/v1` with API keys and an OpenAPI 3.1 specification
- **Services** for PDF (Chromium), AI (OpenAI-compatible), images, S3 storage, email and Web Push notifications
- **Background jobs**, global search, dashboard, audit log
- **Backups**, admin reset and GDPR data export

**Feature modules** provide the actual use cases (e.g. members, treasury, events). They live in their own repositories; the Atrium repository intentionally contains **no** feature modules. One example is [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules), the feature modules of the Edelweißpiraten scouts, including a profile module for the organization's branding.

> **Note:** Modules are trusted code. They run with full privileges inside the server process – there is no sandbox. Only install modules from sources you trust. How to install and enable modules is described in [Managing modules](/en/docs/module-management).

## Architecture in one sentence

Atrium is a *modular monolith*: one SvelteKit process, one PostgreSQL database, clearly separated layers. The core discovers modules at build time, each module gets its own database schema `mod_<id>`, and its permissions only apply while it is enabled. More in [Architecture](/en/docs/architecture).

## Technology

The main building blocks at a glance; how they fit together is explained in [Architecture](/en/docs/architecture).

| Area | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) (app, supervisor, scripts, tests) |
| Framework | SvelteKit 2 with Svelte 5 (runes), `adapter-node` (output runs on Bun) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS 4, shadcn-svelte (bits-ui), Lucide |
| Database | PostgreSQL 17, Drizzle ORM |
| Authentication | Better Auth (email/password, 2FA/TOTP) |
| API | REST under `/api/v1`, OpenAPI 3.1 |
| Validation | Zod 4 |
| AI | official `openai` SDK |
| Storage | S3-compatible (AWS S3, Hetzner, Cloudflare R2, Backblaze B2, MinIO …) |
| PDF | Playwright/Chromium (HTML → PDF) |
| Tests | `bun test` with PGlite, Playwright (E2E) |
| Operations | Docker Compose, nginx, Dokploy |

## Where to start?

| You want to … | Read |
|---|---|
| try Atrium locally | [Quick start](/en/docs/quickstart) |
| run Atrium on your own server | [Installation with Docker Compose](/en/docs/installation) or [Deploying with Dokploy](/en/docs/dokploy) |
| set up a fresh installation | [First steps after installation](/en/docs/first-steps) |
| manage accounts, roles and settings | [Users, roles and permissions](/en/docs/users-roles) and [Settings](/en/docs/settings) |
| install modules | [Managing modules](/en/docs/module-management) |
| back up your data | [Backup and restore](/en/docs/backup-restore) |
| solve a problem | [Troubleshooting](/en/docs/troubleshooting) |
| write your own module | [Developing modules](/en/docs/modules) and [Core services](/en/docs/core-services) |
| connect Atrium through its API | [REST API](/en/docs/api) |

For an illustrated step-by-step walkthrough of the interface, see the [guide](/en/guide).
