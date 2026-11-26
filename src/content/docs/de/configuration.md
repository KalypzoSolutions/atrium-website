---
title: Konfiguration
description: Alle Umgebungsvariablen von Atrium als Referenz – und welche Einstellungen Sie stattdessen in der Oberfläche vornehmen.
order: 22
section: Betrieb
source: docs/deployment.md
---

Atrium trennt zwei Arten von Konfiguration:

- **Umgebungsvariablen** für alles, was vor dem Start feststehen muss: Datenbank, öffentliche URL, Schlüssel, Ressourcen, Sicherung.
- **Einstellungen in der Oberfläche** für alles Fachliche: E-Mail, Speicher, KI, PDF, Erscheinungsbild. Sie liegen in der Datenbank, Secrets darin verschlüsselt.

Vorlagen für die Variablen liegen im Repository: `.env.example` (Docker Compose), `.env.dokploy.example` und `.env.dokploy-external-s3.example` (Dokploy).

## Pflichtvariablen

| Variable | Beschreibung |
|---|---|
| `APP_SECRET` | mindestens 32 zufällige Zeichen (`openssl rand -base64 48`). Signiert Sitzungen und verschlüsselt gespeicherte Secrets. Im Produktivbetrieb bricht der Start ab, wenn der Wert ein Platzhalter ist oder weniger als 6 verschiedene Zeichen enthält. |
| `ORIGIN` | öffentliche URL der App, exakt wie im Browser. Im Produktivbetrieb Pflicht und mit `https://` (Ausnahme `localhost`/`127.0.0.1`). |
| `POSTGRES_PASSWORD` | Passwort des Datenbank-Containers (Docker Compose, Dokploy) |
| `DATABASE_URL` | PostgreSQL-Verbindung, nur bei `bun run dev`/`bun run start` ohne Compose; die Compose-Dateien setzen sie selbst |

> **Achtung:** Ändern Sie `APP_SECRET` nicht nachträglich. Verschlüsselte Einstellungen werden sonst unlesbar und alle Sitzungen ungültig. Bewahren Sie den Wert getrennt vom Server auf.

## Allgemeine Variablen

| Variable | Standard | Beschreibung |
|---|---|---|
| `POSTGRES_DB` / `POSTGRES_USER` | `ep_intern` | Name und Benutzer der Datenbank |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | – | legt beim Start den ersten Administrator an, falls keiner existiert (Passwort ≥ 12 Zeichen). Danach entfernen. |
| `APP_PORT` | `3000` | Host-Port der App, gebunden an `127.0.0.1` (nur `docker-compose.yml`) |
| `DATABASE_POOL_MAX` | `10` | maximale Datenbankverbindungen der App |
| `JOBS_DAILY_WINDOW` | `6-20` | Zeitfenster der täglichen Hintergrundjobs in vollen Stunden (Europe/Berlin), Format `von-bis` |
| `BACKUP_MAX_BYTES` | `4294967296` | größte hochladbare Sicherungsdatei in Byte (4 GB) |
| `BACKUP_TMP_DIR` | `/var/tmp/ep-backup` | Temp-Verzeichnis der Datensicherung (Volume `backup-tmp`, braucht etwa das Doppelte der größten Sicherung) |
| `COMPOSE_PROFILES` | – | z. B. `proxy,backup` – schaltet nginx bzw. den Sicherungsdienst ein |
| `INTERN_DOMAIN` | – | Hostname für das nginx-Profil; andere Hosts werden abgewiesen |
| `DEPLOY_ENV` | `prod` | nur Dokploy: eindeutiger Name je Stack (`ep-intern-<DEPLOY_ENV>-app` usw.) |
| `TZ` | `Europe/Berlin` | Zeitzone des Sicherungsdienstes |

## Proxy-Header

Diese Variablen setzen die Compose-Dateien bereits passend für einen einzelnen Reverse Proxy.

| Variable | Wert in Compose | Beschreibung |
|---|---|---|
| `ADDRESS_HEADER` | `X-Forwarded-For` | Header mit der Client-IP |
| `XFF_DEPTH` | `1` | Anzahl vertrauenswürdiger Proxys, die den Header ergänzen |
| `PROTOCOL_HEADER` | `X-Forwarded-Proto` | Protokoll (`https`) |
| `HOST_HEADER` | `X-Forwarded-Host` | ursprünglicher Host |

## Vorbelegung von Speicher und E-Mail

Diese Variablen werden nur beim **ersten** Start übernommen, solange die Einstellung in der Datenbank noch leer ist. In den Dokploy-Stacks sind die `S3_*`-Werte Pflicht; die einfache `docker-compose.yml` reicht sie nicht durch – dort richten Sie Speicher und E-Mail in der Oberfläche ein.

| Variable | Beschreibung |
|---|---|
| `S3_ENDPOINT` | Endpoint des S3-Dienstes; leer = AWS S3 |
| `S3_REGION` | Region, z. B. `fsn1`, `auto` (R2), `eu-central-1` |
| `S3_BUCKET` | Bucket (Standard im MinIO-Stack `ep-intern`) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Zugang der App |
| `S3_FORCE_PATH_STYLE` | `true` für MinIO und Anbieter ohne virtuelle Host-Namen |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | nur MinIO-Stack: Root-Zugang, nicht für die App |
| `SMTP_HOST` / `SMTP_PORT` | Mailserver und Port (Standard `587`) |
| `SMTP_SECURE` | `true` für TLS direkt (Port 465), sonst `false` |
| `SMTP_USER` / `SMTP_PASSWORD` | Anmeldung am Mailserver |
| `SMTP_FROM` | Absender, z. B. `Atrium <noreply@example.org>` |

## Modulinstallation

| Variable | Standard (Image) | Beschreibung |
|---|---|---|
| `ATRIUM_MODULE_INSTALL` | `supervisor` | `supervisor` = Neubau im Container, `copy` = Entwicklung mit `vite dev`, `off` = nur Vorschau |
| `ATRIUM_DATA_DIR` | `/data/atrium` | Volume für Build-Generationen, Status, Quellen und Protokolle |
| `ATRIUM_MODULES_SEED` | – | Seed-Liste (Pfad oder JSON), aus der ein frischer Server seine Module selbst holt |
| `ATRIUM_GITHUB_TOKEN` / `GITHUB_TOKEN` | – | optionales Token für den Abruf der Seed-Module |
| `ATRIUM_MODULES_DIR` | `modules` | Modulverzeichnis zur Build-Zeit (z. B. für Tests) |

## Ressourcen

| Variable | Standard | Dienst |
|---|---|---|
| `APP_MEM_LIMIT` / `APP_CPUS` | `4g` / `1.0` | App (4 GB wegen des Neubaus bei Modulinstallation) |
| `DB_MEM_LIMIT` / `DB_CPUS` | `1g` / `1.0` | PostgreSQL |
| `STORAGE_MEM_LIMIT` / `STORAGE_CPUS` | `512m` / `0.5` | MinIO (nur Dokploy-Stack mit MinIO) |
| `NGINX_MEM_LIMIT` / `NGINX_CPUS` | `128m` / `0.5` | nginx |
| `BACKUP_MEM_LIMIT` / `BACKUP_CPUS` | `512m` / `0.5` | Sicherungsdienst |

`cpus` darf die Kernzahl des Hosts nicht übersteigen, sonst startet der Dienst nicht. Auf größeren Servern sind z. B. `APP_CPUS=2` und `DB_CPUS=2` sinnvoll. Kontrolle mit `docker stats`.

Für Server mit **2 GB RAM** empfiehlt sich: `APP_MEM_LIMIT=1024m`, `DB_MEM_LIMIT=512m`, `STORAGE_MEM_LIMIT=256m`, `BACKUP_MEM_LIMIT=256m`, dazu 1–2 GB Swap; große PDF-Massenläufe und Sicherungen nicht parallel starten. Für den Neubau beim Installieren von Modulen (rund 3,5 GB) reicht das nicht aus.

## Automatische Sicherung

Variablen des Dienstes `db-backup` (Profil `backup`):

| Variable | Standard | Beschreibung |
|---|---|---|
| `RESTIC_PASSWORD` | – | **Pflicht**, ≥ 20 Zeichen (`openssl rand -base64 32`). Ohne ihn ist keine Sicherung lesbar. |
| `RESTIC_REPOSITORY` | `/backups/restic` | Ziel, z. B. `s3:https://…/bucket`, `b2:bucket:pfad`, `rest:https://…`. Standard ist ein Volume auf demselben Host. |
| `BACKUP_REPO_ACCESS_KEY_ID` / `BACKUP_REPO_SECRET_ACCESS_KEY` / `BACKUP_REPO_REGION` | – | Zugang zum S3-Ziel |
| `BACKUP_S3_ENDPOINT` / `BACKUP_S3_BUCKET` / `BACKUP_S3_REGION` | – | Quell-Bucket für die Dateisicherung; leer = nur Datenbank |
| `BACKUP_S3_ACCESS_KEY_ID` / `BACKUP_S3_SECRET_ACCESS_KEY` | – | Zugang zur Quelle (Lesezugriff genügt) |
| `BACKUP_S3_FORCE_PATH_STYLE` | `true` | Path-Style für die Quelle |
| `BACKUP_TIME` | `02:30` | tägliche Startzeit |
| `BACKUP_KEEP_DAILY` / `_WEEKLY` / `_MONTHLY` | `7` / `4` / `6` | Aufbewahrung |
| `BACKUP_RUN_ON_START` | `false` | Sicherung sofort beim Start |
| `BACKUP_HEARTBEAT_URL` | – | GET nach jeder erfolgreichen Sicherung (z. B. healthchecks.io) |
| `BACKUP_NOTIFY_URL` | – | POST mit Fehlertext bei jedem Fehlschlag (z. B. ntfy) |

In den Dokploy-Stacks übernehmen die `BACKUP_S3_*`-Werte standardmäßig die `S3_*`-Werte der App.

## Einstellungen in der Oberfläche

SMTP, S3, KI und PDF-Layout richten Sie unter **Administration → Einstellungen** (`/admin/settings/…`) ein. Die Suche auf `/admin` bzw. <kbd>Strg</kbd>+<kbd>K</kbd> findet auch einzelne Felder, z. B. „smtp“ oder „logo“.

| Bereich | Inhalt |
|---|---|
| **Allgemein** | Systemname, Organisation |
| **E-Mail-Versand** | SMTP-Server, Port, TLS, Zugang, Absender, Testmail |
| **E-Mail-Layout** | Kopf mit Logo, Signatur, Fußzeile, Live-Vorschau |
| **Speicher** | S3-Endpoint (leer = AWS), Region (`auto` für R2), Bucket, Access Key, Secret, Path-Style (für MinIO aktivieren), Verbindungstest |
| **KI** | OpenAI-kompatibler Dienst: API-Key, Basis-URL, Modelle, freigegebene Module, Limits |
| **PDF** | Format, Ausrichtung, Ränder, Kopf- und Fußzeile, Logo; Vorschau der Briefvorlagen |
| **Module** | Einstellungen der aktiven Module |

Gut zu wissen:

- **Secrets** (SMTP-Passwort, S3-Zugang, KI-API-Key) werden mit AES-256-GCM verschlüsselt gespeichert und nie an den Browser ausgegeben.
- **Secrets folgen ihrem Ziel:** Ändern Sie SMTP-Host, -Port oder -Benutzer, die KI-Basis-URL oder den S3-Endpoint, wird das zugehörige Secret verworfen und muss neu eingegeben werden. So lässt sich kein gespeichertes Passwort an einen fremden Server umleiten.
- **SMTP und TLS:** Port 465 nutzt TLS direkt; mit Anmeldung ist sonst STARTTLS Pflicht.
- **KI:** Prompts und Antworten werden nicht gespeichert, nur Zähler für Tokens und Kosten.
- **Bucket privat lassen.** Für Browser-Uploads über signierte URLs muss CORS am Bucket den eigenen `ORIGIN` für `PUT` erlauben.

## Nächste Schritte

- Alle Einstellungen der Oberfläche im Detail: [Einstellungen](/de/docs/settings)
- Sicherheitsmodell und Secrets: [Sicherheit](/de/docs/security)
- Wenn etwas nicht funktioniert: [Fehlerbehebung](/de/docs/troubleshooting)
