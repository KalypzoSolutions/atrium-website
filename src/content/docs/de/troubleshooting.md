---
title: Fehlerbehebung
description: Typische Probleme nach Themen – Start, Anmeldung und Proxy, Speicher, E-Mail, Secrets, Module, PDF und Sicherung.
order: 25
section: Betrieb
source: docs/deployment.md
---

Diese Seite sammelt typische Probleme und ihre Ursachen, gruppiert nach Themen. Fangen Sie fast immer mit zwei Fragen an: **Was sagt der Healthcheck?** und **Was steht im Log?**

## Diagnose: Health, Logs, Request-ID

```bash
docker compose ps                     # Status aller Dienste, app und db sollten "healthy" sein
docker compose logs -f app            # Log der Anwendung
curl -i https://intern.example.org/api/v1/health
```

- `GET /api/v1/health` prüft die Datenbankverbindung und antwortet mit `200`, sonst mit `503`. Die App startet erst, wenn die Datenbank „healthy“ ist.
- Fehlerseiten und API-Fehler nennen eine **Referenz** bzw. `requestId`. Suchen Sie diese ID im Log der App – dort steht die technische Ursache. Clients erhalten bewusst nur `internal_error`.
- Logs sind je Container auf 5 × 10 MB begrenzt. Ältere Einträge rotieren heraus.

## Start und Sicherungsdienst

### Der Start bricht ab

| Meldung bzw. Symptom | Ursache und Lösung |
|---|---|
| Fehler zu `APP_SECRET` | Im Produktivbetrieb muss `APP_SECRET` mindestens 32 Zeichen lang, zufällig und kein Platzhalter sein (mindestens 6 verschiedene Zeichen). Erzeugen mit `openssl rand -base64 48`. |
| Fehler zu `ORIGIN` | `ORIGIN` ist im Produktivbetrieb Pflicht und muss mit `https://` beginnen (Ausnahme `localhost`/`127.0.0.1`). |
| Dienst startet nicht, Fehler zu `cpus` | Ein `*_CPUS`-Wert ist größer als die Zahl der CPU-Kerne des Hosts. Werte senken. |
| Kein Administrator angelegt | `INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD` fehlen, das Passwort ist kürzer als 12 Zeichen oder es existiert bereits ein Administrator. |
| App bleibt lange „starting“ nach einem Update | Der Supervisor baut installierte Module für die neue Core-Version neu. Das darf bis zu 15 Minuten dauern; bis dahin läuft der mitgelieferte Build. Siehe [Updates](/de/docs/updates#installierte-module-und-core-versionen). |

### Sicherungsdienst ist „unhealthy“

Der Container `db-backup` meldet sich `unhealthy`, wenn die letzte erfolgreiche Sicherung älter als 26 Stunden ist. Fehler stehen im Log als „SICHERUNG FEHLGESCHLAGEN“:

```bash
docker compose logs db-backup
docker compose run --rm db-backup check
```

Häufige Ursachen: falsches `RESTIC_PASSWORD`, fehlende Zugangsdaten zum Ziel (`BACKUP_REPO_*`) oder bei AWS ein fehlender `BACKUP_S3_ENDPOINT`. Alle Variablen stehen unter [Konfiguration](/de/docs/configuration#automatische-sicherung).

## Anmeldung und Proxy

### Anmeldung, Cookies und CSRF

**Symptom:** Die Anmeldung „springt“ zurück zur Anmeldeseite, Formulare melden einen 403-Fehler, oder schreibende API-Aufrufe aus der Oberfläche schlagen fehl.

**Ursache:** `ORIGIN` passt nicht exakt zur Adresse im Browser. Davon hängen sichere Cookies, der CSRF-Schutz und die Weiterleitungen ab.

- `ORIGIN` muss genau so lauten wie die öffentliche URL: gleiches Schema (`https://`), gleicher Hostname, kein Slash am Ende, ggf. Port.
- Bei `https://` setzt Atrium Cookies mit `Secure`. Rufen Sie die Seite per `http://` auf, speichert der Browser das Sitzungs-Cookie nicht.
- Hinter einem Proxy müssen `PROTOCOL_HEADER=X-Forwarded-Proto` und `HOST_HEADER=X-Forwarded-Host` gesetzt sein und der Proxy diese Header weitergeben (die mitgelieferten Compose-Dateien tun das).
- Schreibende API-Anfragen **mit Sitzung** müssen einen `Origin`-Header gleich `ORIGIN` senden. Für Skripte verwenden Sie stattdessen einen [API-Key](/de/docs/api).

**„Zu viele Versuche“ (429):** Die Rate Limits für Anmeldung, Passwort-Reset und 2FA greifen. Fünf Fehlversuche in 15 Minuten sperren die IP für dieses Konto; warten Sie das Zeitfenster ab.

### Falsche Client-IP, alle teilen sich ein Limit

Sehen Audit-Log und Rate Limits für alle Personen dieselbe IP (die des Proxys), passt die Proxy-Konfiguration nicht:

- `ADDRESS_HEADER=X-Forwarded-For` und `XFF_DEPTH` = Anzahl der vertrauenswürdigen Proxys, die den Header ergänzen (mitgeliefertes nginx oder Traefik allein: `1`, Cloudflare davor: `2`).
- Port 3000 der App darf nie öffentlich erreichbar sein – sonst lässt sich die Proxy-Kette fälschen.

Details: [Installation – Eigener Reverse Proxy](/de/docs/installation#eigener-reverse-proxy).

### Live-Aktualisierungen kommen nicht an

Module mit Live-Bearbeitung nutzen Server-Sent Events. Ein Reverse Proxy darf diese Verbindungen **nicht puffern**, und sein Lese-Timeout muss über 20 Sekunden liegen. Prüfen Sie bei einem eigenen Proxy `proxy_buffering off` (nginx) bzw. die entsprechende Einstellung und die Timeouts.

## Dateien und Speicher

### Uploads schlagen fehl

| Symptom | Ursache und Lösung |
|---|---|
| `413` bzw. „zu groß“ | Grenzen gelten in der Kette Proxy ≥ Node ≥ fachliche Grenze. Node erlaubt 110 MB (`BODY_SIZE_LIMIT`), das mitgelieferte nginx je Pfad weniger (Seiten 10 MB, REST-JSON 2 MB, Modul-Uploads 110 MB). Dazu kommt **Einstellungen → Speicher → Max. Dateigröße** (Standard 50 MB). |
| Dateityp abgelehnt | Typ nicht in der Liste **Erlaubte Dateitypen**; HTML und SVG sind nur ausdrücklich erlaubt. |
| Direkter Browser-Upload scheitert (CORS) | Die CORS-Konfiguration des Buckets muss Ihren `ORIGIN` für `PUT` erlauben. |
| Sicherung lässt sich nicht hochladen | Die Datei ist größer als `BACKUP_MAX_BYTES` (Standard 4 GB) oder das Temp-Volume `backup-tmp` ist zu klein (braucht etwa das Doppelte der größten Sicherung). |

### Speicher (S3/MinIO)

**Verbindung testen** schlägt fehl:

- **Endpoint:** leer für AWS S3, sonst die vollständige URL des Anbieters mit `https://`.
- **Region:** passend zum Anbieter (`fsn1`, `auto` für R2, `eu-central-1` …).
- **Path-Style-URLs** für MinIO und Anbieter ohne virtuelle Host-Namen aktivieren.
- Der Zugangsschlüssel braucht für den Bucket Lesen, Schreiben, Löschen und Auflisten.
- Nach einer Änderung des Endpoints verwirft Atrium Access Key und Secret – geben Sie beide neu ein.

**MinIO im Dokploy-Stack:** Im Log von `storage-init` muss „Bucket … und App-Benutzer eingerichtet“ stehen. Beachten Sie: `S3_*`-Variablen werden nur beim **ersten** Start übernommen. Spätere Änderungen – etwa neue App-Schlüssel – tragen Sie unter **Einstellungen → Speicher** ein.

## E-Mail und Push

### E-Mail-Versand

Die Test-E-Mail meldet bewusst nur „E-Mail-Versand fehlgeschlagen“. Die Einzelheiten (Host, Port, Serverantwort) stehen im Log der App.

- **Port 465** braucht **TLS direkt**; auf Port 587 mit Anmeldung ist STARTTLS Pflicht – bietet der Server es nicht an, bricht der Versand ab.
- Ein SMTP-Benutzer ohne gespeichertes Passwort ergibt „SMTP ist nicht konfiguriert“ (503). Nach einer Änderung von Host, Port oder Benutzer ist das Passwort neu einzugeben.
- Je Mail gilt eine Zeitgrenze von 25 Sekunden; Firewalls, die ausgehendes SMTP blockieren, zeigen sich als Zeitüberschreitung.

### Push-Benachrichtigungen

- Push funktioniert nur über **HTTPS**.
- Auf iPhone und iPad muss Atrium zuerst über Safari zum Home-Bildschirm hinzugefügt werden (ab iOS 16.4).
- Ausgehende Verbindungen zu den Push-Diensten der Browser-Hersteller müssen erlaubt sein.
- Hat jemand Benachrichtigungen im Browser abgelehnt, muss er sie in den Website-Einstellungen wieder erlauben.

## Secrets und `APP_SECRET`

### Einstellungen nach einem Umzug unlesbar

Startet die App mit einem **anderen** `APP_SECRET` als vorher, sind alle verschlüsselt gespeicherten Werte unlesbar (SMTP-Passwort, S3-Zugang, KI-Key, Push-Schlüssel), und alle Sitzungen sind ungültig. Seiten, die diese Werte brauchen, können mit einem Fehler abbrechen.

- Am einfachsten: das ursprüngliche `APP_SECRET` wieder setzen.
- Sonst: die betroffenen Secrets in der Oberfläche neu eingeben – oder eine [Datensicherung](/de/docs/backup-restore) vom alten Server einspielen; dabei verschlüsselt Atrium alles mit dem neuen Schlüssel neu.

## Module und PDF

### Modulinstallation

| Meldung | Ursache und Lösung |
|---|---|
| „Installieren ist auf diesem Server ausgeschaltet (ATRIUM_MODULE_INSTALL)“ | `ATRIUM_MODULE_INSTALL=supervisor` setzen (Standard im Image). Die Vorschau funktioniert auch so. |
| „Der Server läuft nicht unter dem Supervisor“ | Die App wurde mit `bun ./build/index.js` statt über das Image bzw. `scripts/supervisor.mjs` gestartet. |
| „GitHub-Abruflimit erreicht“ | Später erneut versuchen oder unter **Module → Installieren** ein GitHub-Token hinterlegen. |
| „Repository nicht gefunden (oder privat ohne Token)“ | Link prüfen; für private Repositorys ein Token mit Lesezugriff hinterlegen. |
| „Quelle … ist nicht freigegeben“ / ZIP gesperrt | Die Liste **Erlaubte Quellen** ist gesetzt. Quelle ergänzen oder Liste leeren. |
| „Es läuft bereits ein Neubau“ | Warten, bis der laufende Neubau fertig ist. |
| Neubau schlägt fehl oder bricht ab | Das **Protokoll** auf der Installationsseite lesen. Häufig fehlt Arbeitsspeicher: Der Neubau braucht rund 3,5 GB (`APP_MEM_LIMIT` Standard 4 GB). Die vorige Version bleibt in Betrieb. |
| Modul „Defekt“ | Das Modul verletzt eine Regel (Manifest, Migrationen, Rechte). Die Begründung steht in der Modulliste; meist hilft ein Update des Moduls. |

Ausgehend müssen `api.github.com`, `codeload.github.com` und für Module mit eigenen Paketen `registry.npmjs.org` erreichbar sein.

### PDF-Erzeugung

- **Lokal** fehlt oft Chromium: `bun run playwright install chromium`. Im Docker-Image ist es enthalten.
- Mit `PDF_CHROMIUM_SANDBOX=auto` (Standard) startet Chromium erst mit Sandbox und fällt im Container ohne passendes seccomp-Profil einmalig auf `--no-sandbox` zurück – mit einer Warnung im Log. Das ist erwartet; Hintergründe unter [Sicherheit](/de/docs/security#pdf-renderer).
- PDFs brauchen pro Lauf 300–500 MB Arbeitsspeicher. Starten Sie auf kleinen Servern große PDF-Massenläufe und Sicherungen nicht gleichzeitig.

## Hilfe holen

Finden Sie die Ursache nicht, eröffnen Sie ein [Issue auf GitHub](https://github.com/KalypzoSolutions/kalypzo-atrium/issues) mit Version, Betriebsart (Compose oder Dokploy), den relevanten Log-Zeilen und der Request-ID. Entfernen Sie vorher Secrets und personenbezogene Daten aus den Logs.

## Nächste Schritte

- Variablen nachschlagen: [Konfiguration](/de/docs/configuration)
- Sicher aktualisieren: [Updates](/de/docs/updates)
