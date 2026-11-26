---
title: Schnellstart (lokal)
description: Kalypzo Atrium lokal im Entwicklungsmodus starten – mit Bun, Docker für PostgreSQL und MinIO und bun run dev.
order: 2
section: Erste Schritte
source: README.md
---

Diese Anleitung startet Atrium auf Ihrem Rechner im Entwicklungsmodus. PostgreSQL und der S3-Speicher (MinIO) laufen in Docker, die Anwendung selbst per `bun run dev`. Für einen Server lesen Sie stattdessen [Installation](/de/docs/installation) oder [Dokploy](/de/docs/dokploy).

## Voraussetzungen

- **[Bun](https://bun.sh) ≥ 1.4.4** (die Version der Docker-Images steht in `.bun-version`)
- **Docker** mit Docker Compose
- **Git**

## In fünf Schritten zum laufenden System

### 1. Repository klonen und Abhängigkeiten installieren

```bash
git clone https://github.com/KalypzoSolutions/kalypzo-atrium.git
cd kalypzo-atrium
bun install
```

### 2. PostgreSQL und MinIO starten

```bash
docker compose -f docker-compose.dev.yml up -d
```

`docker-compose.dev.yml` startet nur die Infrastruktur, alle Ports sind ausschließlich an `127.0.0.1` gebunden:

| Dienst | Adresse | Zugang |
|---|---|---|
| PostgreSQL 17 | `localhost:5432` | Datenbank/Benutzer `ep_intern`, Passwort `dev-password` |
| MinIO (S3-API) | `localhost:9000` | `minioadmin` / `minioadmin`, Bucket `ep-intern-dev` |
| MinIO (Konsole) | `localhost:9001` | wie oben |

### 3. `.env` anlegen

Legen Sie im Projektverzeichnis eine Datei `.env` an (Vorlage: `.env.example`):

```ini
DATABASE_URL=postgres://ep_intern:dev-password@localhost:5432/ep_intern
APP_SECRET=<mindestens 32 zufällige Zeichen>
ORIGIN=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=ein-langes-passwort-123
```

Einen geeigneten Wert für `APP_SECRET` erzeugen Sie so:

```bash
openssl rand -base64 48
```

> **Wichtig:** `APP_SECRET` verschlüsselt gespeicherte Secrets (z. B. SMTP- und S3-Zugangsdaten). Ändern Sie den Wert nach dem ersten Start nicht mehr, sonst sind diese Einstellungen unlesbar.

### 4. Entwicklungsserver starten

```bash
bun run dev
```

Beim Start wendet Atrium automatisch die Datenbank-Migrationen an, registriert und synchronisiert die Module und legt – falls noch kein Administrator existiert – den Administrator aus `INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD` an. Das Passwort muss mindestens 12 Zeichen lang sein.

### 5. Anmelden

Öffnen Sie [http://localhost:5173/login](http://localhost:5173/login) und melden Sie sich mit den Zugangsdaten aus der `.env` an. Ändern Sie anschließend das Passwort im Profil (siehe [Passwort ändern](/de/docs/first-steps#passwort-aendern)).

## Speicher und E-Mail einrichten

SMTP, S3, KI und PDF-Layout richten Sie **in der Oberfläche** ein, nicht über Umgebungsvariablen. Für die lokale MinIO-Instanz tragen Sie unter **Administration → Einstellungen → Speicher** ein:

| Feld | Wert |
|---|---|
| Endpoint | `http://localhost:9000` |
| Bucket | `ep-intern-dev` |
| Access Key / Secret | `minioadmin` / `minioadmin` |
| Path-Style | aktiviert |

Mit **Verbindung testen** prüfen Sie die Einstellungen. Einen SMTP-Server tragen Sie bei Bedarf unter **Einstellungen → E-Mail-Versand** ein; ohne ihn funktionieren Einladungen und Passwort-Links per E-Mail nicht. Alle Felder beschreibt [Einstellungen](/de/docs/settings#speicher).

## Optionale Nacharbeiten

Atrium läuft jetzt. Die folgenden Schritte brauchen Sie nur für PDFs und eigene Module.

### Chromium für PDF installieren

Der PDF-Service rendert HTML mit Chromium. Lokal installieren Sie den Browser einmalig über Playwright:

```bash
bun run playwright install chromium
```

Im Docker-Image ist Chromium bereits enthalten.

### Module lokal ausprobieren

Das Repository enthält keine Fachmodule; das Verzeichnis `modules/` ist leer und von Git ausgenommen. Legen Sie ein Modul als `modules/<id>/` ab, erscheint es nach dem Neustart unter **Administration → Module** – zunächst deaktiviert. Wie Module aufgebaut sind, erklärt [Module entwickeln](/de/docs/modules).

## Nächste Schritte

- Atrium auf einem Server betreiben: [Installation mit Docker Compose](/de/docs/installation)
- Alle Variablen und Einstellungen: [Konfiguration](/de/docs/configuration)
- Die ersten Handgriffe in der Oberfläche: [Erste Schritte nach der Installation](/de/docs/first-steps)
- Ein eigenes Modul schreiben: [Module entwickeln](/de/docs/modules)
