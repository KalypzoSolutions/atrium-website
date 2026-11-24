---
title: Datensicherung und Wiederherstellung
description: Verschlüsselte Sicherungen in der Oberfläche erstellen und einspielen, die automatische Sicherung mit restic nutzen und Datenbereiche gezielt zurücksetzen.
order: 14
section: Administration
source: docs/security.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium bietet zwei sich ergänzende Wege, Ihre Daten zu sichern:

| | Datensicherung in der Oberfläche | Automatische Sicherung (`db-backup`) |
|---|---|---|
| **Wo** | Administration → Datensicherung | Docker-Dienst `db-backup` (Compose-Profil `backup`) |
| **Wann** | auf Knopfdruck | täglich zur eingestellten Uhrzeit |
| **Format** | eine verschlüsselte Datei `.atriumbackup` | verschlüsseltes, dedupliziertes restic-Repository |
| **Inhalt** | alle oder ausgewählte Bereiche, optional Dateien | ganze Datenbank (`pg_dump`) und der S3-Bucket |
| **Ideal für** | Umzug auf einen anderen Server, Teil-Wiederherstellung, Zusammenführen | Katastrophenschutz, Versionsstände über Wochen und Monate |

Wir empfehlen beides: die automatische Sicherung mit einem Ziel **außerhalb** des Servers und gelegentlich eine Sicherung aus der Oberfläche, die Sie getrennt aufbewahren.

## Datensicherung in der Oberfläche

Die Seite **Administration → Datensicherung** erfordert das admin-gleiche Recht `core.system.backup`. Export und Import bestätigen Sie jeweils mit Ihrem Konto-Passwort und – falls aktiv – dem 2FA-Code.

### Sicherung erstellen

<DocShot name="14-backup" lang="de" caption="Datensicherung → Export: Bereiche wählen, Dateien einschließen und ein Sicherungs-Passwort festlegen." />

1. **Bereiche** wählen – alle oder einzelne Core- und Modulbereiche. Abhängige Bereiche gehen automatisch mit (die Oberfläche nennt den Grund).
2. Optional **Dateien einschließen**: hochgeladene Dateien der gewählten Bereiche aus dem S3-Speicher. Ohne Dateien ist die Sicherung kleiner, beim Wiederherstellen fehlen dann aber die Inhalte.
3. Ein **Sicherungs-Passwort** festlegen und wiederholen. Die Datei wird damit verschlüsselt (scrypt, AES-256-GCM).
4. **Sicherung erstellen** und mit Konto-Passwort bestätigen. Bei vielen Dateien dauert das einige Minuten – lassen Sie die Seite geöffnet.
5. Der Download startet automatisch. Der Link funktioniert nur **einmal** und **15 Minuten** lang.

> **Wichtig:** Die Sicherungsdatei enthält – innerhalb der Verschlüsselung – alle Daten einschließlich Passwort-Hashes und Zugangsdaten. Datei plus Sicherungs-Passwort bedeuten vollen Zugriff. Bewahren Sie beides getrennt und sicher auf. Ohne das Passwort lässt sich die Sicherung nicht wiederherstellen.

### Sicherung einspielen

Der Reiter **Import** führt in vier Schritten durch das Einspielen:

<DocShot name="31-backup-import" lang="de" />

1. **Datei wählen** und hochladen. Große Dateien gehen in 8-MB-Stücken hoch; die Obergrenze setzt `BACKUP_MAX_BYTES` (Standard 4 GB).
2. **Passwörter:** Sicherungs-Passwort zum Entschlüsseln und Ihr Konto-Passwort zur Bestätigung, dann **Prüfen**.
3. **Vorschau:** Atrium zeigt Erstellungszeitpunkt, Version und Herkunft, je Bereich die Zahl der Datensätze in der Sicherung und aktuell sowie Hinweise zur Kompatibilität. Hier wählen Sie den **Modus** und die Bereiche:
   - **Wiederherstellen** ersetzt die gewählten Bereiche vollständig durch den Stand der Sicherung.
   - **Zusammenführen** ergänzt nur fehlende Datensätze; Vorhandenes bleibt unverändert.
   - Optionen: **Mail-Zugang übernehmen** (SMTP aus der Sicherung statt der aktuellen Werte) und **Modulstatus übernehmen** (Module aktivieren bzw. deaktivieren wie zum Zeitpunkt der Sicherung).
4. **Bestätigen** – dazu tippen Sie das Bestätigungswort `WIEDERHERSTELLEN` bzw. `ZUSAMMENFÜHREN`.

Während des Laufs pausieren die Hintergrundjobs, und das System ist kurz nicht nutzbar. Spielen Sie Sicherungen daher zu einem ruhigen Zeitpunkt ein. Schlägt die Wiederherstellung fehl, werden die Änderungen zurückgerollt.

Gut zu wissen:

- **Ihr eigenes Konto:** Ist es mit demselben Passwort in der Sicherung enthalten, werden Sie danach abgemeldet und melden sich mit den Zugangsdaten aus der Sicherung neu an. Ist es nicht enthalten, bleibt Ihr aktuelles Konto zusätzlich erhalten, damit Sie sich nicht aussperren.
- **Anderer Server-Schlüssel:** Stammt die Sicherung von einem Server mit anderem `APP_SECRET`, verschlüsselt Atrium alle Secrets neu und berechnet schlüsselgebundene Prüfwerte neu. Was sich nicht neu berechnen lässt, meldet das Ergebnis.
- **Fehlende Module:** Ist ein Modul aus der Sicherung auf dem Zielserver nicht installiert, nennt der Import seine Quelle mit einem Link zur [Installation](/de/docs/module-management).
- **Ohne Speicher:** Ist kein S3-Speicher eingerichtet, werden Dateien übersprungen; die Datensätze werden trotzdem wiederhergestellt.
- Konten, Rollen und API-Keys dürfen nur Administratoren wiederherstellen oder zusammenführen.

### Umzug auf einen neuen Server

1. Auf dem alten Server eine Sicherung **mit Dateien** erstellen.
2. Den neuen Server installieren, Speicher einrichten und die benötigten Module installieren.
3. Die Sicherung im Modus **Wiederherstellen** einspielen. Ein anderes `APP_SECRET` auf dem neuen Server ist dabei kein Problem.

## Automatische Sicherung mit restic

Für den Dauerbetrieb sichert der Dienst `db-backup` täglich (Standard 02:30 Uhr, Zeitzone Europe/Berlin):

1. `pg_dump` der Datenbank,
2. `rclone sync` des S3-Buckets (wenn `BACKUP_S3_*` gesetzt ist),
3. `restic backup` in ein verschlüsseltes, dedupliziertes Repository,
4. Aufräumen nach 7 täglichen, 4 wöchentlichen und 6 monatlichen Ständen; sonntags zusätzlich `restic check`.

Sie aktivieren ihn mit `COMPOSE_PROFILES=backup` und mindestens `RESTIC_PASSWORD` sowie einem Ziel in `RESTIC_REPOSITORY`. Der Container wird `unhealthy`, wenn die letzte erfolgreiche Sicherung älter als 26 Stunden ist; optional meldet er Erfolge an `BACKUP_HEARTBEAT_URL` und Fehler an `BACKUP_NOTIFY_URL`.

```bash
docker compose run --rm db-backup run          # sofort sichern
docker compose run --rm db-backup snapshots    # Snapshots auflisten
docker compose logs db-backup                  # Fehler: "SICHERUNG FEHLGESCHLAGEN"
```

Einrichtung und alle Variablen: [Installation – Automatische Sicherung](/de/docs/installation#automatische-sicherung-profil-backup) und [Konfiguration](/de/docs/configuration#automatische-sicherung). Unter Dokploy gilt: Dessen eigene Datenbank-Backups erfassen die Datenbank dieses Stacks **nicht** – aktivieren Sie `db-backup` (siehe [Dokploy](/de/docs/dokploy#sicherung-unter-dokploy)).

### Aus restic wiederherstellen

Die Wiederherstellung aus dem restic-Repository erfolgt auf der Kommandozeile: Datenbank starten, Snapshot holen, Dump einspielen, Dateien in den Bucket zurückkopieren und die App mit **demselben** `APP_SECRET` starten. Die Befehle stehen unter [Installation – Wiederherstellung](/de/docs/installation#wiederherstellung).

> **Achtung:** Ohne `RESTIC_PASSWORD` ist keine Sicherung lesbar, ohne das ursprüngliche `APP_SECRET` sind verschlüsselte Einstellungen unlesbar. Bewahren Sie beide getrennt vom Server auf.

### Restore-Probe

Testen Sie die Wiederherstellung regelmäßig, z. B. halbjährlich, auf einem separaten Testserver:

- [ ] Snapshots zeigen tägliche Stände bis gestern.
- [ ] Wiederherstellung mit Kopie von `APP_SECRET` und `RESTIC_*` durchführen.
- [ ] Anmeldung als Administrator klappt, aktuelle Daten sind vorhanden.
- [ ] Ältere Dateien lassen sich herunterladen und öffnen.
- [ ] Eine verschlüsselte Einstellung ist lesbar (z. B. SMTP-Test-E-Mail).
- [ ] Testserver und Daten danach löschen.

## Zurücksetzen

**Administration → Zurücksetzen** löscht die Daten einzelner Bereiche – oder des ganzen Systems – **endgültig**, etwa um nach einer Testphase sauber zu starten. Das Recht `core.system.reset` ist admin-gleich und nur mit einer Sitzung nutzbar.

<DocShot name="25-reset" lang="de" crop="900" />

Der Ablauf hat vier Schritte:

1. **Bereiche wählen:** Core-Bereiche (API-Keys, Benutzer außer dem eigenen, Rollen außer Systemrollen, API-Protokoll, Job-Läufe, KI-Nutzung, Einstellungen, Audit-Log) und die Bereiche aktiver Module. Abhängige Bereiche werden automatisch mit gewählt.
2. **Vorschau:** Atrium zeigt je Tabelle die Zahl der Datensätze und je Modul die Dateien, die gelöscht werden.
3. **Sicherung:** Pflicht-Export der betroffenen Daten als verschlüsselte `.atriumbackup`-Datei (ohne hochgeladene Dateien). Sie bestätigen mit Ihrem Passwort und legen ein Sicherungs-Passwort fest (mindestens 12 Zeichen).
4. **Bestätigen:** Tippen Sie `ZURÜCKSETZEN` und klicken Sie auf **Endgültig zurücksetzen**.

Bei *Einstellungen* bleiben Speicher- und SMTP-Zugang sowie Secrets erhalten; beim *Audit-Log* bleibt nur der Eintrag über dieses Zurücksetzen. Die Pflicht-Sicherung spielen Sie bei Bedarf über **Datensicherung → Import** wieder ein.

## Nächste Schritte

- Datenauskunft und Audit-Log: [Datenschutz und Audit-Log](/de/docs/privacy)
- Updates sicher einspielen: [Updates](/de/docs/updates)
- Den Sicherungsdienst einrichten: [Installation mit Docker Compose](/de/docs/installation#automatische-sicherung-profil-backup)
