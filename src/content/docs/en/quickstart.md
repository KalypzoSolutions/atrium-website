---
title: Quick start (local)
description: Run Kalypzo Atrium locally in minutes – Node.js 24, Docker for PostgreSQL and MinIO, a .env file and npm run dev.
order: 2
section: Getting started
source: README.md
---

This guide starts Atrium on your machine in development mode. PostgreSQL and the S3 storage (MinIO) run in Docker, the application itself via `npm run dev`. For a server, read [Installation](/en/docs/installation) or [Dokploy](/en/docs/dokploy) instead.

## Prerequisites

- **Node.js ≥ 24** (the version used by the Docker images is in `.nvmrc`)
- **Docker** with Docker Compose
- **Git**

## Up and running in five steps

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/KalypzoSolutions/kalypzo-atrium.git
cd kalypzo-atrium
npm install
```

### 2. Start PostgreSQL and MinIO

```bash
docker compose -f docker-compose.dev.yml up -d
```

`docker-compose.dev.yml` only starts the infrastructure; all ports are bound to `127.0.0.1`:

| Service | Address | Credentials |
|---|---|---|
| PostgreSQL 17 | `localhost:5432` | database/user `ep_intern`, password `dev-password` |
| MinIO (S3 API) | `localhost:9000` | `minioadmin` / `minioadmin`, bucket `ep-intern-dev` |
| MinIO (console) | `localhost:9001` | same as above |

### 3. Create `.env`

Create a `.env` file in the project directory (template: `.env.example`):

```ini
DATABASE_URL=postgres://ep_intern:dev-password@localhost:5432/ep_intern
APP_SECRET=<at least 32 random characters>
ORIGIN=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=ein-langes-passwort-123
```

Generate a suitable value for `APP_SECRET` like this:

```bash
openssl rand -base64 48
```

> **Important:** `APP_SECRET` encrypts stored secrets (such as SMTP and S3 credentials). Don't change it after the first start, otherwise those settings become unreadable.

### 4. Start the development server

```bash
npm run dev
```

On startup, Atrium automatically applies database migrations, registers and synchronizes modules and – if no administrator exists yet – creates one from `INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD`. The password must be at least 12 characters long.

### 5. Sign in

Open [http://localhost:5173/login](http://localhost:5173/login) and sign in with the credentials from your `.env`. Then change the password in your profile.

## Install Chromium for PDF

The PDF service renders HTML with Chromium. Locally, install the browser once via Playwright:

```bash
npx playwright install chromium
```

The Docker image already includes Chromium.

## Set up storage and email

SMTP, S3, AI and the PDF layout are configured **in the UI**, not through environment variables. For the local MinIO instance, enter the following under **Administration → Settings → Storage**:

| Field | Value |
|---|---|
| Endpoint | `http://localhost:9000` |
| Bucket | `ep-intern-dev` |
| Access key / secret | `minioadmin` / `minioadmin` |
| Path style | enabled |

Use **Test connection** to verify the settings. All settings are described under [Configuration](/en/docs/configuration).

## Try modules locally

The repository contains no feature modules; the `modules/` directory is empty and ignored by Git. Put a module into `modules/<id>/` and it appears under **Administration → Modules** after a restart – disabled at first. How modules are structured is explained in [Developing modules](/en/docs/modules).

## Next steps

- Run Atrium on a server: [Installation with Docker Compose](/en/docs/installation)
- All variables and settings: [Configuration](/en/docs/configuration)
- First steps in the interface: [First steps after installation](/en/docs/first-steps)
- Write your own module: [Developing modules](/en/docs/modules)
