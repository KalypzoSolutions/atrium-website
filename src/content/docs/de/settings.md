---
title: Einstellungen
description: Alle Reiter unter Administration → Einstellungen – von Organisation und Design über E-Mail und Speicher bis zu KI, PDF und Modulen.
order: 12
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Alles Fachliche – E-Mail, Speicher, KI, PDF, Erscheinungsbild – stellen Sie in der Oberfläche unter **Administration → Einstellungen** ein. Die Werte liegen in der Datenbank; Zugangsdaten werden verschlüsselt gespeichert und nie an den Browser zurückgegeben. Umgebungsvariablen brauchen Sie nur für das, was vor dem Start feststehen muss (siehe [Konfiguration](/de/docs/configuration)).

## So funktionieren die Einstellungen

- **Reiter:** Allgemein, Design, E-Mail-Versand, E-Mail-Layout, Speicher, Benachrichtigungen, KI, PDF und Module. Sie sehen nur die Reiter, für die Sie Rechte haben.
- **Suchen statt Klicken:** Das Suchfeld auf der Übersicht `/admin` und die globale Suche (<kbd>Strg</kbd>+<kbd>K</kbd>) finden einzelne Einstellungen direkt, z. B. „SMTP“, „Logo“ oder „IBAN“.
- **Rechte:** Ansehen erfordert `core.settings.view`, Ändern `core.settings.manage`. Der Speicher-Reiter verlangt `core.storage.manage`, der KI-Reiter `core.ai.view` bzw. `core.ai.manage`, die PDF-Vorlagen `core.pdf.manage`.
- **Secrets:** Ein gespeichertes Passwort oder einen Schlüssel sehen Sie nur als „gesetzt – leer lassen, um beizubehalten“. Lassen Sie das Feld leer, bleibt der alte Wert.
- **Secrets folgen ihrem Ziel:** Ändern Sie SMTP-Host, -Port oder -Benutzer, die KI-Basis-URL oder den S3-Endpoint, verwirft Atrium das zugehörige Secret – außer Sie geben es im selben Speichervorgang neu ein. Die Meldung nennt, was neu einzugeben ist. So lässt sich ein gespeichertes Passwort nicht an einen fremden Server umleiten.
- Jede Änderung landet im [Audit-Log](/de/docs/privacy#audit-log); bei Secrets nur der Hinweis, dass sich etwas geändert hat.

## Organisation und Erscheinungsbild

### Allgemein

<DocShot name="05-settings" lang="de" caption="Einstellungen → Allgemein: System und Organisation." />

| Feld | Bedeutung |
|---|---|
| **Systemname** | Name der Anwendung, z. B. in der Seitenleiste und im Browser-Titel; ersatzweise auch in PDFs und E-Mails, wenn keine Organisation eingetragen ist |
| **Sprache** | Sprache für alle, die keine eigene gewählt haben. „Automatisch“ folgt der Browsersprache (sonst Deutsch). |
| **Bezeichnung für „alle“** | So heißt die Freigabe an alle Personen, z. B. „Verein“ oder „Team“ |
| **Organisation, Anschrift, Kontakt-E-Mail, Telefon** | Erscheinen in Briefen, PDF-Kopf und -Fußzeile sowie im E-Mail-Layout |
| **Datenschutzerklärung (URL), Impressum (URL)** | Links in der Fußzeile der Anmeldeseite und aller öffentlichen Seiten. Fehlt ein Link, weist die Seite darauf hin. |
| **Person informieren, wenn die Verwaltung als sie handelt** | E-Mail an die Person beim Start von „Als Person handeln“ |

### Aufbewahrungsfristen

Ebenfalls im Reiter **Allgemein** legen Sie fest, wie lange Protokolle erhalten bleiben. Der tägliche Job `core.housekeeping` setzt diese Fristen durch. Legen Sie sie passend zu Ihrem Verarbeitungsverzeichnis fest (Hintergrund unter [Datenschutz → Aufbewahrungsfristen](/de/docs/privacy#aufbewahrungsfristen)):

| Einstellung | Standard | Wirkung |
|---|---|---|
| API-Protokoll aufbewahren | 30 Tage (1–3650) | ältere Einträge des API-Zugriffsprotokolls werden gelöscht |
| IP-Adressen im Audit-Log aufbewahren | 90 Tage (1–3650) | die IP wird aus Audit-Einträgen entfernt, der Eintrag bleibt |
| Audit-Log aufbewahren | 730 Tage (0 = nie, sonst ≥ 30) | ältere Audit-Einträge werden gelöscht |

### Design

<DocShot name="17-settings-design" lang="de" />

- **Akzentfarbe:** Farbe für Knöpfe und Hervorhebungen. Atrium zeigt den Kontrast der Schrift auf Primärknöpfen an und warnt unter 4,5 : 1.
- **Hintergrund der App-Icons:** Füllfarbe hinter dem Logo bei App-Icons auf dem Home-Bildschirm (iOS, Android).
- **Logo:** PNG, JPEG oder WebP, nach dem Hochladen zuschneidbar (quadratisch passt am besten). Das Logo erscheint in PDFs, in der Seitenleiste, auf der Anmeldeseite, als Favicon und als App-Icon. Zum Hochladen braucht es einen eingerichteten [Speicher](#speicher) und Schreibrechte darauf.

Jede Person kann zusätzlich im Profil unter *Darstellung* ein eigenes Theme und eine eigene Akzentfarbe wählen (siehe [Darstellung und Startseite](/de/docs/search-dashboard#darstellung-und-startseite)).

## E-Mail

### E-Mail-Versand

Über diesen SMTP-Server verschickt Atrium alle E-Mails: Passwort-Links, Einladungen, Benachrichtigungen und die Mails der Module.

<DocShot name="06-settings-mail" lang="de" />

| Feld | Hinweis |
|---|---|
| **SMTP-Host**, **SMTP-Port** | z. B. `smtp.example.org` und `587` |
| **TLS direkt (Port 465)** | aktivieren für Port 465. Mit Anmeldung ist auf anderen Ports STARTTLS Pflicht – sonst bricht der Versand ab. |
| **SMTP-Benutzer**, **SMTP-Passwort** | Anmeldung am Mailserver; das Passwort wird verschlüsselt gespeichert |
| **Absenderadresse** | z. B. `Atrium <noreply@example.org>` |

Speichern Sie zuerst, dann senden Sie unter **Test-E-Mail** eine Testnachricht. Schlägt der Versand fehl, meldet die Oberfläche bewusst nur einen allgemeinen Fehler – die Details (Host, Port, Serverantwort) stehen im Server-Protokoll.

### E-Mail-Layout

Jede ausgehende E-Mail erhält auf Wunsch ein einheitliches Layout: Kopf mit Logo und Name der Organisation, Inhalt, Signatur und Fußzeile.

<DocShot name="18-settings-mail-layout" lang="de" crop="1180" />

- **Einheitliches Layout für E-Mails verwenden** schaltet das Layout ein oder aus.
- **Emblem im Kopf anzeigen** wirkt, wenn ein aktives Profil-Modul ein Emblem mitbringt.
- **Signatur** (z. B. „Viele Grüße“) und **Fußzeile** (Kleingedrucktes, z. B. Vereinsnachweis) – leer bedeutet: keine.
- Die **Vorschau** zeigt eine Beispiel-Mail mit gespeicherten Werten; nach dem Speichern **Vorschau neu laden**. Die Akzentfarbe stammt aus *Design*.

## Speicher und Dienste

### Speicher

Dateien, Belege, Bilder und Logos speichert Atrium in einem S3-kompatiblen Objektspeicher (AWS S3, Hetzner Object Storage, Cloudflare R2, Backblaze B2, MinIO …).

<DocShot name="07-settings-storage" lang="de" crop="900" />

| Feld | Hinweis |
|---|---|
| **S3-Endpoint** | leer = AWS S3; sonst z. B. `https://fsn1.your-objectstorage.com` |
| **Region** | z. B. `fsn1`, `eu-central-1`, `auto` für Cloudflare R2 |
| **Bucket** | Name des Buckets – privat lassen |
| **Access Key ID**, **Secret Access Key** | Zugang nur für diesen Bucket (Lesen, Schreiben, Löschen, Auflisten) |
| **Path-Style-URLs (MinIO)** | für MinIO und Anbieter ohne virtuelle Host-Namen aktivieren |
| **Max. Dateigröße (MB)** | Obergrenze je Datei (Standard 50 MB); wirksam sind höchstens die 110 MB des Servers |
| **Erlaubte Dateitypen** | leer = Standardliste (PDF, Bilder, Text, ZIP, Office/OpenDocument; keine Makro-Formate, HTML/SVG nur ausdrücklich) |

Mit **Verbindung testen** prüfen Sie Zugang und Bucket. Darunter zeigt *Speicherverbrauch je Modul*, wie viele Dateien und Bytes jedes Modul belegt.

> **Hinweis:** Laden Browser Dateien direkt über signierte URLs hoch, muss die CORS-Konfiguration des Buckets Ihren `ORIGIN` für `PUT` erlauben.

### Benachrichtigungen

Hier schalten Sie **Web Push** systemweit ein oder aus und sehen die Zahl der registrierten Geräte. Jede Person wählt danach im Profil selbst, was sie per E-Mail, Push oder beidem bekommt; ist Push aus, kommt alles per E-Mail. Wie Personen das einrichten, beschreibt [Benachrichtigungen](/de/docs/search-dashboard#benachrichtigungen).

<DocShot name="19-settings-notifications" lang="de" />

- Die **VAPID-Schlüssel** erzeugt Atrium beim ersten Bedarf automatisch; der private Schlüssel wird verschlüsselt in der Datenbank gespeichert und wandert mit der [Datensicherung](/de/docs/backup-restore).
- **Schlüssel neu erzeugen** nur, wenn er in falsche Hände geraten sein könnte – danach müssen alle Personen Push auf ihren Geräten neu aktivieren.
- Der Server braucht ausgehende HTTPS-Verbindungen zu den Push-Diensten (`fcm.googleapis.com`, `*.push.apple.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`).

### KI

Atrium bindet einen OpenAI-kompatiblen KI-Dienst an, den Module z. B. für die **Schreibhilfe** nutzen.

<DocShot name="20-settings-ai" lang="de" crop="1000" />

**Konfiguration:**

| Feld | Hinweis |
|---|---|
| **OpenAI API-Key** | wird verschlüsselt gespeichert und verlässt den Server nie |
| **API Base-URL (optional)** | für andere OpenAI-kompatible Anbieter |
| **Standardmodell** | z. B. `gpt-4o-mini` |
| **Erlaubte Modelle**, **Module mit KI-Zugriff** | je Zeile ein Eintrag; leer = alle |
| **Monatliches Token-Limit** und **Kostenlimit je Modul** | 0 = unbegrenzt |
| **Max. Anfragen pro Minute (gesamt)** | globales Rate Limit |
| **Preise je 1M Tokens** | Grundlage für die geschätzten Kosten |

**Schreibhilfe:** Token-Limit je Person und Monat, Standard-Anrede (du, ihr, Sie), Ton, Grußformel, eine kurze Beschreibung „Wer schreibt?“ und weitere Stilhinweise. Zwei Schalter – eingegangene Mails für Antwortentwürfe und Galeriebilder für Bildbeschreibungen übermitteln – sind standardmäßig aus.

Oben zeigt die Seite die **Nutzung** im laufenden Monat und je Modul. Gespeichert werden nur Zähler (Anfragen, Tokens, geschätzte Kosten), **keine Prompts und keine Antworten**.

> **Datenschutz:** Alles, was Module an die KI schicken, geht an den eingetragenen Anbieter – gegebenenfalls außerhalb der EU. Was Sie vor dem Einschalten regeln sollten, steht unter [KI und Datenminimierung](/de/docs/privacy#ki-und-datenminimierung).

### PDF

Atrium erzeugt PDFs serverseitig mit Chromium – für Listen, Briefe und Exporte der Module.

<DocShot name="08-settings-pdf" lang="de" />

- **Standard-Seitenformat** und **Standard-Ausrichtung** (Hoch- oder Querformat), **Ränder** oben, rechts, unten und links.
- **Kopfzeile (rechts)**, **Fußzeile (Mitte)** und **Logo im Header**.
- Die **Briefvorlagen** (`brief`, `briefkopf`, `briefkopf-quer`) sehen Sie mit Seitenvorschau; ein Test-PDF zeigt das Ergebnis mit den aktuellen Einstellungen. Ein aktives Profil-Modul kann sie ersetzen; die Karte zeigt dann „Ersetzt durch Modul“.

## Module

Der Reiter **Module** sammelt die Einstellungen aller aktiven Module, die kein eigenes Einstellungsformular mitbringen. Hat ein Modul eine eigene Einstellungsseite, erscheint hier nur ein Link dorthin. Ohne aktive Module mit Einstellungen bleibt der Reiter leer.

Zusätzlich gibt es unter **Module → Installieren** zwei Einstellungen zur Modulinstallation: ein optionales **GitHub-Token** und die Liste **Erlaubte Quellen** (siehe [Module verwalten](/de/docs/module-management#github-token-und-erlaubte-quellen)).

## Vorbelegung beim ersten Start

Speicher und E-Mail lassen sich für eine automatisierte Einrichtung über Umgebungsvariablen (`S3_*`, `SMTP_*`) vorbelegen. Das ist nur ein **Startwert**: Er wird übernommen, solange die Einstellung in der Datenbank noch leer ist. Danach gilt ausschließlich der **Wert in der Datenbank**, also das, was Sie hier einstellen. Die Variablen stehen unter [Konfiguration](/de/docs/configuration#vorbelegung-von-speicher-und-e-mail).

## Nächste Schritte

- Module hinzufügen und konfigurieren: [Module verwalten](/de/docs/module-management)
- Push und Benachrichtigungen für Personen: [Dashboard, Suche und Benachrichtigungen](/de/docs/search-dashboard)
- Sicherheit der Secrets und `APP_SECRET`: [Sicherheit](/de/docs/security)
