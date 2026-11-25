---
title: Deployment mit Dokploy
description: Atrium mit Dokploy aus Git deployen – externer S3 (empfohlen) oder MinIO im Stack, Domain, Sicherung und Umzug.
order: 21
section: Betrieb
source: docs/deployment.md
---

[Dokploy](https://dokploy.com) baut Atrium direkt aus dem Git-Repository und übernimmt Domain und HTTPS über Traefik. Atrium bringt dafür zwei fertige Compose-Dateien mit:

| Compose-Datei | Speicher | Vorlage für „Environment“ | Empfehlung |
|---|---|---|---|
| `docker-compose.dokploy-external-s3.yml` | externer S3-Dienst (Hetzner Object Storage, Cloudflare R2, Backblaze B2, AWS S3 …) | `.env.dokploy-external-s3.example` | **empfohlen für Produktion** |
| `docker-compose.dokploy.yml` | MinIO im Stack (nur intern erreichbar) | `.env.dokploy.example` | für Tests und kleine Installationen |

Beide Stacks enthalten PostgreSQL 17 (`db`), die Anwendung (`app`, gebaut aus dem `Dockerfile`) und optional den Sicherungsdienst `db-backup`.

> **Warum externer S3?** Das MinIO-Image `bitnamilegacy/minio` ist eingefroren und erhält keine Sicherheitsupdates mehr. Die App nutzt zwar einen eigenen MinIO-Benutzer ohne Admin-Rechte, für den Dauerbetrieb ist ein externer S3-Dienst aber die bessere Wahl.

## Variante A: mit externem S3 (empfohlen)

### 1. Bucket vorbereiten

Legen Sie beim S3-Anbieter einen **privaten** Bucket und einen Zugangsschlüssel an, der **nur** für diesen Bucket Lesen, Schreiben, Löschen und Auflisten darf.

### 2. Service in Dokploy anlegen

1. Projekt öffnen → **Create Service** → **Compose**.
2. Provider **Git**: Repository `https://github.com/KalypzoSolutions/kalypzo-atrium.git` und Branch (z. B. `main`).
3. Compose-Pfad: `./docker-compose.dokploy-external-s3.yml`, Typ **Docker Compose**.

### 3. Environment ausfüllen

Kopieren Sie den Inhalt von `.env.dokploy-external-s3.example` in den Reiter **Environment** und füllen Sie ihn aus. Erzeugen Sie alle Secrets zufällig, z. B. mit `openssl rand -hex 24` (Passwörter) und `openssl rand -base64 48` (`APP_SECRET`).

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `DEPLOY_ENV` | – | Name des Stacks, z. B. `prod` oder `staging` (Standard `prod`); nur Kleinbuchstaben, Ziffern, Bindestrich |
| `ORIGIN` | ja | öffentliche URL exakt wie im Browser, mit `https://`, ohne Slash am Ende |
| `APP_SECRET` | ja | mindestens 32 zufällige Zeichen; nach dem ersten Start nicht mehr ändern |
| `POSTGRES_PASSWORD` | ja | Passwort der Datenbank |
| `S3_ENDPOINT` | – | Endpoint des Anbieters; leer = AWS S3 |
| `S3_REGION` | ja | z. B. `fsn1` (Hetzner), `auto` (R2), `eu-central-1` (AWS) |
| `S3_BUCKET` | ja | Name des Buckets |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | ja | Zugangsschlüssel für diesen Bucket |
| `S3_FORCE_PATH_STYLE` | – | `true` nur für Anbieter ohne virtuelle Host-Namen (Standard `false`) |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | erster Start | legt den ersten Administrator an (Passwort ≥ 12 Zeichen) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | – | Vorbelegung des E-Mail-Versands |

Beispiele für `S3_ENDPOINT` und `S3_REGION`:

```ini
# Hetzner Object Storage
S3_ENDPOINT=https://fsn1.your-objectstorage.com
S3_REGION=fsn1
# Cloudflare R2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
# Backblaze B2
S3_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
S3_REGION=eu-central-003
# AWS S3: S3_ENDPOINT leer lassen
S3_REGION=eu-central-1
```

> **Hinweis:** `S3_*` und `SMTP_*` werden nur beim **ersten** Start in die Einstellungen übernommen, solange dort noch nichts gesetzt ist. Spätere Änderungen nehmen Sie in der Oberfläche unter **Administration → Einstellungen** vor.

### 4. Domain einrichten

Im Reiter **Domains**: Domain auf den Service **`app`**, Port **`3000`**, **HTTPS** aktivieren (Let's Encrypt). `ORIGIN` muss exakt dieser URL entsprechen.

### 5. Deploy

Klicken Sie auf **Deploy**. Beim ersten Start laufen Migrationen, Modul-Synchronisation und das Anlegen des Administrators automatisch.

### 6. Nach dem Deployment

1. Unter `https://ihre-domain/login` anmelden und das Passwort ändern, 2FA aktivieren.
2. Unter **Administration → Einstellungen → Speicher** auf **Verbindung testen** klicken und eine Datei hoch- und herunterladen.
3. Unter **Administration → Module** die gewünschten Module installieren und aktivieren.
4. `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` aus der Environment entfernen und neu deployen.

Ausführlich: [Erste Schritte nach der Installation](/de/docs/first-steps).

## Variante B: mit MinIO im Stack

Das Vorgehen entspricht Variante A, mit diesen Unterschieden:

- Compose-Pfad: `./docker-compose.dokploy.yml`, Vorlage `.env.dokploy.example`.
- Der Stack enthält zusätzlich `storage` (MinIO, nur intern) und den Einmal-Container `storage-init`. Dieser legt bei jedem Deploy den Bucket privat an und richtet einen App-Benutzer ein, der nur auf diesen Bucket zugreifen darf.
- Der Server erreicht den Speicher intern unter `http://storage:9000`; Browser brauchen keinen direkten Zugriff.

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `ORIGIN`, `APP_SECRET`, `POSTGRES_PASSWORD` | ja | wie in Variante A |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | ja | Root-Zugang von MinIO; erhalten nur `storage` und `storage-init`, nicht die App |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | ja | App-Zugang zum Speicher; muss sich von `MINIO_ROOT_USER` unterscheiden (Access Key ≥ 3, Secret ≥ 8 Zeichen) |
| `S3_BUCKET` | – | Standard `ep-intern` |
| `S3_REGION` | – | Standard `us-east-1` |

```bash
# Zufallswerte erzeugen
openssl rand -hex 12   # MINIO_ROOT_USER, S3_ACCESS_KEY_ID
openssl rand -hex 24   # MINIO_ROOT_PASSWORD, S3_SECRET_ACCESS_KEY, POSTGRES_PASSWORD
```

Im Log von `storage-init` erscheint nach erfolgreichem Deploy „Bucket … und App-Benutzer eingerichtet“.

## Sicherung unter Dokploy

> **Wichtig:** Die Datenbank-Backups von Dokploy gelten nur für Datenbanken, die Dokploy selbst verwaltet – **nicht** für `db` in diesem Stack. Aktivieren Sie deshalb den Sicherungsdienst von Atrium.

Der Dienst `db-backup` arbeitet wie unter [Installation – Automatische Sicherung](/de/docs/installation#automatische-sicherung-profil-backup) beschrieben. Ergänzen Sie in der Environment:

```ini
COMPOSE_PROFILES=backup
RESTIC_PASSWORD=
RESTIC_REPOSITORY=s3:https://fsn1.your-objectstorage.com/ep-intern-backup
BACKUP_REPO_ACCESS_KEY_ID=
BACKUP_REPO_SECRET_ACCESS_KEY=
```

- `db-backup` sichert die Datenbank und spiegelt standardmäßig auch den App-Bucket mit dem App-Zugang. Besser ist ein Nur-Lese-Schlüssel über `BACKUP_S3_ACCESS_KEY_ID` und `BACKUP_S3_SECRET_ACCESS_KEY`.
- Bei AWS (leerer `S3_ENDPOINT`) muss `BACKUP_S3_ENDPOINT` gesetzt werden, sonst wird nur die Datenbank gesichert.
- Legen Sie `RESTIC_REPOSITORY` nie in den App-Bucket – idealerweise zu einem anderen Anbieter oder Standort.
- Bewahren Sie `RESTIC_PASSWORD` und `APP_SECRET` getrennt vom Server auf.

Befehle wie `snapshots` oder `restore` führen Sie auf dem Server im Projektverzeichnis mit dem Projektnamen aus (`docker compose -p <projekt> …`) oder per `docker exec` im laufenden Container (`ep-backup snapshots`). Den Ablauf der Wiederherstellung beschreibt [Installation – Wiederherstellung](/de/docs/installation#wiederherstellung); alle Variablen stehen unter [Konfiguration](/de/docs/configuration#automatische-sicherung).

## Mehrere Stacks auf einem Server

Betreiben Sie z. B. Staging und Produktion auf demselben Dokploy-Server, setzen Sie je Stack einen eigenen `DEPLOY_ENV` (`prod`, `staging`). Die Dienste sprechen sich dann über eindeutige Namen wie `ep-intern-prod-app` und `ep-intern-prod-db` an und vermischen sich nicht im gemeinsamen `dokploy-network`.

## Umzug von MinIO zu externem S3

1. Wartungsfenster planen und eine Sicherung erstellen.
2. Daten mit `rclone sync` vom MinIO-Bucket (Volume `s3-data`, intern `ep-intern-<env>-storage:9000`) in den neuen Bucket kopieren.
3. Unter **Administration → Einstellungen → Speicher** auf den neuen Anbieter umstellen und **Verbindung testen**.
4. Hoch- und Herunterladen prüfen.
5. In Dokploy den Compose-Pfad auf `./docker-compose.dokploy-external-s3.yml` ändern, Environment anpassen und deployen.
6. Das Volume `s3-data` erst nach erfolgreicher Prüfung löschen.

> **Hinweis:** Bei bestehender Datenbank gelten die Speicher-Einstellungen aus der Oberfläche, nicht die `S3_*`-Variablen. Stellen Sie den Speicher deshalb in der Oberfläche um.

## Gut zu wissen

- **Uploads:** Traefik begrenzt die Body-Größe nicht; es gilt die Grenze von Node (`BODY_SIZE_LIMIT=110M` im `Dockerfile`) und danach die fachlichen Grenzen.
- **Browser-Uploads per signierter URL** brauchen CORS am Bucket für den eigenen `ORIGIN` (Methode `PUT`).
- **Modulinstallation:** Die Stacks setzen `ATRIUM_MODULE_INSTALL=supervisor` und speichern Builds im Volume `atrium-data`. Ausgehend nötig sind `api.github.com`, `codeload.github.com` und ggf. `registry.npmjs.org`.
- **Autodeploy:** Dokploy deployt bei jedem Push auf den gewählten Branch. Worauf Sie bei Updates achten sollten, steht unter [Updates](/de/docs/updates#mit-dokploy).

## Nächste Schritte

- Alle Variablen im Überblick: [Konfiguration](/de/docs/configuration)
- Nach dem ersten Start: [Erste Schritte nach der Installation](/de/docs/first-steps)
- Module installieren: [Module verwalten](/de/docs/module-management)
- Sicherungen: [Datensicherung und Wiederherstellung](/de/docs/backup-restore)
- Sicher aktualisieren: [Updates](/de/docs/updates)
