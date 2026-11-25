---
title: Updates
description: Atrium sicher aktualisieren – Ablauf mit Docker Compose oder Dokploy, Modul-Neubau, gepinnte Images, Rollback und Herunterfahren.
order: 24
section: Betrieb
source: docs/deployment.md
---

Ein Update von Atrium besteht aus einem neuen Image der Anwendung. Datenbank-Migrationen laufen beim Start automatisch, installierte Module werden bei Bedarf neu gebaut. Diese Seite beschreibt den Ablauf und worauf Sie achten sollten.

## Vor jedem Update

1. **Sicherung erstellen** – eine Datensicherung in der Oberfläche oder ein sofortiger Lauf des Sicherungsdienstes (`docker compose run --rm db-backup run`). Siehe [Datensicherung und Wiederherstellung](/de/docs/backup-restore).
2. **Änderungen lesen** – Release-Hinweise bzw. Commits im [Repository](https://github.com/KalypzoSolutions/kalypzo-atrium).
3. **Zeitpunkt wählen** – nicht während laufender Massenvorgänge (z. B. Mail-Versand an viele Empfänger) oder einer Wiederherstellung. Hintergrundjobs reagieren noch nicht auf das Herunterfahren.

> **Wichtig:** Migrationen sind nicht automatisch umkehrbar. Ein Rollback bedeutet: Image der Vorversion starten **und** die Datenbank aus der Sicherung wiederherstellen. Die Befehle dafür stehen unter [Installation – Wiederherstellung](/de/docs/installation#wiederherstellung).

## Mit Docker Compose

```bash
git pull
docker compose build app
docker compose up -d app     # Migrationen laufen beim Start
docker compose ps            # app sollte wieder "healthy" sein
```

Beim Start wendet Atrium zuerst die Core-Migrationen an, synchronisiert dann die Module und wendet die Migrationen bereits aktiver Module an. Eine Datenbanksperre (Advisory Lock) sorgt dafür, dass jede Migration genau einmal läuft – auch wenn zwei Starts sich überschneiden.

## Mit Dokploy

Dokploy deployt bei jedem Push auf den gewählten Branch automatisch (Autodeploy) oder auf Knopfdruck mit **Deploy**. Das Vorgehen ist dasselbe: vorher sichern ([Sicherung unter Dokploy](/de/docs/dokploy#sicherung-unter-dokploy)), danach im Log von `app` prüfen, dass Migrationen und Start durchgelaufen sind.

> **Tipp:** Wer Updates erst nach einer grünen CI einspielen möchte, lässt Pushes auf den Deploy-Branch nur über geschützte Pull Requests zu oder löst Dokploy per Webhook aus der CI aus.

## Installierte Module und Core-Versionen

Module, die Sie unter **Administration → Module** installiert haben, liegen in einer eigenen Build-Generation im Daten-Volume (`/data/atrium`). Bringt ein neues Image eine **andere Core-Version** mit, baut der Supervisor diese Module beim Start automatisch neu. Bis der Neubau fertig ist, läuft der mitgelieferte Build; der Healthcheck des Images wartet dafür bis zu 15 Minuten (`start-period`).

Module selbst aktualisieren Sie unabhängig vom Core über **Module → Nach Updates suchen** (siehe [Module verwalten](/de/docs/module-management#aktualisieren)). Passt ein Modul nicht mehr zur neuen Core-Version, zeigt die Installationsvorschau das an.

## Gepinnte Images

Alle Images sind mit **fester Version und Digest** gepinnt (`name:tag@sha256:…`), zum Beispiel Node `24.22.0-bookworm-slim`, `postgres:17.11-alpine3.24` und `nginx:1.30.6-alpine3.24`. Ein Deploy ändert damit nie unbemerkt eine Basisversion.

- Heben Sie bei einem Update **Tag und Digest gemeinsam** an.
- Ändern Sie beim PostgreSQL-Update den Dienst `db` und `deploy/backup/Dockerfile` zusammen, damit `pg_dump` zur Server-Version passt.
- Ein **Major-Wechsel** von PostgreSQL (z. B. 17 → 18) braucht Dump und Restore oder `pg_upgrade` – ein einfacher Image-Tausch genügt nicht.
- Das Repository hält Abhängigkeiten mit Dependabot aktuell (npm, Docker, GitHub Actions; wöchentlich).

## Herunterfahren

```bash
docker compose stop
```

Compose sendet SIGTERM und wartet je Dienst eine feste Zeit (`stop_grace_period`), bevor es den Prozess beendet:

| Dienst | Wartezeit |
|---|---|
| `app` | 30 s (in den Dokploy-Stacks 45 s) |
| `db`, `db-backup` | 60 s |

Der HTTP-Server schließt dabei geordnet. Hintergrundjobs, Chromium (PDF) und der Datenbank-Pool reagieren in der App aber noch **nicht** auf das Herunterfahren – ein laufender Job kann abbrechen. Ein abgebrochener Job gilt nach 10 Minuten ohne Lebenszeichen als beendet und läuft beim nächsten Takt erneut.

## Nur eine Instanz

Atrium ist für **eine** App-Instanz ausgelegt. Rate Limiter, Login-Sperre und Live-Bearbeitung arbeiten im Prozessspeicher. Starten Sie deshalb keine zweite Instanz parallel – auch nicht für ein „Rolling Update“.

## Nach dem Update prüfen

- [ ] `docker compose ps` bzw. Dokploy zeigt `app` als „healthy“
- [ ] `GET /api/v1/health` antwortet mit `200`
- [ ] Anmeldung funktioniert, unter **Administration → Module** sind alle Module aktiv und nicht „Defekt“
- [ ] Test-E-Mail und Speichertest unter **Einstellungen** erfolgreich

## Nächste Schritte

- Wenn etwas nicht startet: [Fehlerbehebung](/de/docs/troubleshooting)
- Sicherung und Rollback: [Datensicherung und Wiederherstellung](/de/docs/backup-restore)
