---
title: Installation mit Docker Compose
description: Kalypzo Atrium produktiv mit Docker Compose betreiben – inklusive nginx mit HTTPS, automatischer Sicherung, Härtung, Updates und Wiederherstellung.
order: 20
section: Betrieb
source: docs/deployment.md
---

Für den Produktivbetrieb liefert Atrium eine gehärtete `docker-compose.yml` mit. Sie startet PostgreSQL und die Anwendung; nginx als Reverse Proxy und ein Sicherungsdienst lassen sich über Compose-Profile zuschalten. Wenn Sie Dokploy verwenden, folgen Sie stattdessen [Deployment mit Dokploy](/de/docs/dokploy).

## Bestandteile

| Datei / Dienst | Zweck |
|---|---|
| `Dockerfile` | Multi-Stage-Build auf `node:24.22.0-bookworm-slim` (gepinnt mit Digest), enthält Chromium für PDF, läuft als Benutzer `app` (UID 10001), Healthcheck auf `/api/v1/health` |
| `db` | PostgreSQL 17, Volume `db-data`, Healthcheck mit `pg_isready` |
| `app` | Atrium, gebaut aus dem `Dockerfile`; Port 3000 nur auf `127.0.0.1` |
| `nginx` (Profil `proxy`) | Reverse Proxy mit HTTP→HTTPS, TLS, Größengrenzen je Pfad |
| `db-backup` (Profil `backup`) | tägliche, verschlüsselte Sicherung mit restic |

Alle Images sind mit fester Version und Digest gepinnt.

## Voraussetzungen

- Linux-Server mit Docker und Docker Compose
- Empfehlung: **4 GB RAM, 2 vCPU**. Die Anwendung darf standardmäßig bis zu 4 GB belegen (`APP_MEM_LIMIT`), weil der Neubau beim Installieren von Modulen rund 3,5 GB braucht; ohne Modulinstallation genügen etwa 1,5 GB.
- Eine Domain mit TLS-Zertifikat (für das nginx-Profil)
- Ausgehender Zugriff auf `api.github.com` und `codeload.github.com` (Modulquellen) sowie ggf. `registry.npmjs.org`

## Installation

### 1. Repository klonen und `.env` anlegen

```bash
git clone https://github.com/KalypzoSolutions/kalypzo-atrium.git
cd kalypzo-atrium
cp .env.example .env
```

### 2. Pflichtwerte setzen

Tragen Sie in der `.env` mindestens ein:

```ini
# openssl rand -hex 24
POSTGRES_PASSWORD=
# openssl rand -base64 48
APP_SECRET=
ORIGIN=https://intern.example.org
# nur für den ersten Start, Passwort mindestens 12 Zeichen
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=
```

> **Achtung:** `ORIGIN` muss exakt der öffentlichen URL entsprechen und im Produktivbetrieb mit `https://` beginnen – sonst bricht der Start ab. Davon hängen sichere Cookies, CSRF-Schutz und Weiterleitungen der Anmeldung ab.

Alle weiteren Variablen finden Sie unter [Konfiguration](/de/docs/configuration).

### 3. Stack bauen und starten

```bash
docker compose up -d --build
docker compose ps        # app und db sollten "healthy" sein
```

Beim ersten Start laufen die Migrationen und die Modul-Synchronisation automatisch, anschließend wird der Administrator angelegt.

### 4. Nach dem ersten Start

1. Unter `ORIGIN/login` anmelden und das Passwort ändern.
2. 2FA für das Administratorkonto aktivieren.
3. `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` aus der `.env` entfernen – sonst bleibt das Passwort in der Container-Umgebung sichtbar.
4. Unter **Administration → Einstellungen** Systemname, E-Mail-Versand (SMTP), Speicher (S3), KI und PDF einrichten.
5. Unter **Administration → Module** die gewünschten Module installieren und aktivieren.

## nginx und HTTPS (Profil `proxy`)

```bash
mkdir -p deploy/nginx/certs      # fullchain.pem und privkey.pem hier ablegen
# in .env: INTERN_DOMAIN=intern.example.org
docker compose --profile proxy up -d
```

Alternativ aktivieren Sie Profile dauerhaft in der `.env`, z. B. `COMPOSE_PROFILES=proxy,backup`.

`deploy/nginx/nginx.conf` ist eine Vorlage, in der beim Start nur `INTERN_DOMAIN` ersetzt wird. Sie enthält unter anderem:

- einen Default-Server, der unbekannte Hostnamen abweist
- TLS nach Mozilla „intermediate“
- Rate Limiting für Anmeldung und Passwort-Reset (30 Anfragen/min je IP)
- Größengrenzen je Pfad und ungepuffertes Durchreichen für Sicherungs-Uploads und -Downloads

HSTS und die übrigen Sicherheits-Header setzt die Anwendung selbst.

### Eigener Reverse Proxy

Atrium liest die Client-IP aus `X-Forwarded-For`. Die mitgelieferte Konfiguration setzt `ADDRESS_HEADER=X-Forwarded-For`, `XFF_DEPTH=1`, `PROTOCOL_HEADER=X-Forwarded-Proto` und `HOST_HEADER=X-Forwarded-Host`.

| Proxy | Einstellung |
|---|---|
| mitgeliefertes nginx | `XFF_DEPTH=1` |
| Traefik (z. B. Dokploy) als einziger Proxy | `XFF_DEPTH=1` |
| Cloudflare vor Traefik/nginx | `XFF_DEPTH=2`, oder `ADDRESS_HEADER=CF-Connecting-IP`, wenn die App ausschließlich über Cloudflare erreichbar ist |

Faustregel: `XFF_DEPTH` entspricht der Anzahl vertrauenswürdiger Proxys, die den Header ergänzen. Server-Sent Events (Live-Bearbeitung) dürfen nicht gepuffert werden, der Lese-Timeout muss über 20 Sekunden liegen.

> **Warnung:** Geben Sie Port 3000 nie öffentlich frei. Ist die App direkt erreichbar, kann jeder die Proxy-Kette fälschen und damit Rate Limits und Audit-IP beeinflussen.

## Automatische Sicherung (Profil `backup`)

Der Dienst `db-backup` sichert täglich um `BACKUP_TIME` (Standard 02:30, Zeitzone `TZ`, Standard Europe/Berlin):

1. `pg_dump` der Datenbank,
2. `rclone sync` des S3-Buckets (wenn `BACKUP_S3_*` gesetzt ist, sonst nur die Datenbank),
3. `restic backup` in ein verschlüsseltes, dedupliziertes Repository,
4. Aufräumen nach 7 täglichen, 4 wöchentlichen und 6 monatlichen Ständen; sonntags zusätzlich `restic check`.

Mindestkonfiguration in der `.env`:

```ini
COMPOSE_PROFILES=backup
# openssl rand -base64 32 – getrennt vom Server aufbewahren!
RESTIC_PASSWORD=
# Ziel außerhalb des Servers
RESTIC_REPOSITORY=s3:https://fsn1.your-objectstorage.com/ep-intern-backup
BACKUP_REPO_ACCESS_KEY_ID=
BACKUP_REPO_SECRET_ACCESS_KEY=
# optional: Heartbeat bei Erfolg (z. B. healthchecks.io), POST bei Fehlern (z. B. ntfy)
BACKUP_HEARTBEAT_URL=
BACKUP_NOTIFY_URL=
```

> **Wichtig:** Ohne `RESTIC_REPOSITORY` landen die Sicherungen im Volume `backup-repo` auf **demselben Host** – das schützt nur vor Fehlbedienung, nicht vor Serverausfall. Ohne `RESTIC_PASSWORD` ist keine Sicherung lesbar.

Nützliche Befehle:

```bash
docker compose run --rm db-backup run          # sofort sichern
docker compose run --rm db-backup snapshots    # Snapshots auflisten
docker compose run --rm db-backup check        # Repository vollständig prüfen
docker compose logs db-backup                  # Fehler erscheinen als "SICHERUNG FEHLGESCHLAGEN"
```

Der Container wird `unhealthy`, wenn die letzte erfolgreiche Sicherung älter als 26 Stunden ist. Alle Variablen des Sicherungsdienstes stehen unter [Konfiguration](/de/docs/configuration#automatische-sicherung).

### Wiederherstellung

```bash
# 1. Gleiche RESTIC_*/BACKUP_REPO_*-Werte in .env, nur die Datenbank starten
docker compose up -d db
# 2. Snapshot in das Arbeitsvolume holen
docker compose run --rm db-backup restore latest /work/restore
# 3. Datenbank einspielen
docker compose run --rm db-backup restore-db /work/restore/work/db/ep_intern.dump
# 4. Dateien mit rclone zurück in den Bucket kopieren (Quelle: /work/restore/work/objects)
# 5. App mit DEMSELBEN APP_SECRET starten
docker compose up -d
```

> **Achtung:** Starten Sie die App nach einer Wiederherstellung mit demselben `APP_SECRET`, sonst sind verschlüsselte Einstellungen unlesbar. Testen Sie die Wiederherstellung regelmäßig auf einem separaten Testserver.

Eine manuelle Sicherung der Datenbank erstellen Sie mit:

```bash
docker compose exec db pg_dump -U $POSTGRES_USER -Fc $POSTGRES_DB > backup.dump
```

Zusätzlich bietet die Oberfläche eine verschlüsselte Datensicherung – siehe [Datensicherung und Wiederherstellung](/de/docs/backup-restore).

## Härtung

Die Compose-Dateien sind bereits gehärtet:

- schreibgeschütztes Dateisystem (`read_only`), `/tmp` als begrenztes tmpfs (256 MB)
- `cap_drop: ALL`, `no-new-privileges`, `init: true` (tini als PID 1)
- App-Port nur auf `127.0.0.1`, Datenbank ohne veröffentlichten Port
- Speicher-, CPU- und Prozessgrenzen je Dienst, Log-Rotation (höchstens 5 × 10 MB je Container)

Prüfen Sie zusätzlich:

- [ ] HTTPS erzwungen, `ORIGIN` mit `https://`
- [ ] `APP_SECRET` zufällig, sicher und getrennt vom Server aufbewahrt
- [ ] `INITIAL_ADMIN_*` entfernt, Administrator mit 2FA
- [ ] `XFF_DEPTH` passend zum Proxy
- [ ] S3-Bucket privat, Zugangsschlüssel nur mit Rechten auf diesen Bucket
- [ ] Sicherung mit Ziel außerhalb des Servers und getestete Wiederherstellung

### Ressourcen

| Dienst | Speicher (Variable) | CPU (Variable) |
|---|---|---|
| `app` | 4g (`APP_MEM_LIMIT`) | 1.0 (`APP_CPUS`) |
| `db` | 1g (`DB_MEM_LIMIT`) | 1.0 (`DB_CPUS`) |
| `nginx` | 128m (`NGINX_MEM_LIMIT`) | 0.5 (`NGINX_CPUS`) |
| `db-backup` | 512m (`BACKUP_MEM_LIMIT`) | 0.5 (`BACKUP_CPUS`) |

`cpus` darf die Kernzahl des Hosts nicht übersteigen, sonst startet der Dienst nicht. Auf größeren Servern sind z. B. `APP_CPUS=2` und `DB_CPUS=2` sinnvoll. Kontrolle mit `docker stats`.

## Updates und Herunterfahren

```bash
git pull
docker compose build app
docker compose up -d app     # Migrationen laufen beim Start
```

Erstellen Sie vorher eine Sicherung – Migrationen sind nicht automatisch umkehrbar. Rollback, gepinnte Images, Modul-Neubau und das Verhalten beim Herunterfahren beschreibt [Updates](/de/docs/updates).

## Healthchecks

- **App:** `GET /api/v1/health` prüft die Datenbankverbindung und antwortet mit `200` oder `503`.
- **Datenbank:** `pg_isready`; die App startet erst, wenn die Datenbank „healthy“ ist.

> **Hinweis:** Atrium ist für **eine** App-Instanz ausgelegt. Rate Limiter, Login-Sperre und Live-Bearbeitung arbeiten im Prozessspeicher.

## Nächste Schritte

- Nach dem ersten Start: [Erste Schritte nach der Installation](/de/docs/first-steps)
- Variablen nachschlagen: [Konfiguration](/de/docs/configuration)
- Sicherheitsmodell und Härtung: [Sicherheit](/de/docs/security)
- Module installieren: [Module verwalten](/de/docs/module-management)
