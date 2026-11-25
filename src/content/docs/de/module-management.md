---
title: Module verwalten
description: Fachmodule per GitHub-Link oder ZIP-Datei installieren, aktivieren, aktualisieren und entfernen.
order: 13
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Der Core von Atrium bringt bewusst **keine Fachmodule** mit. Mitglieder, Termine, Dateien, Kasse und alles Weitere kommen als Module aus eigenen Repositories, die Sie im laufenden Betrieb unter **Administration → Module** installieren. Diese Seite beschreibt die Bedienung; wie Sie selbst ein Modul schreiben, steht unter [Module entwickeln](/de/docs/modules).

> **Warnung:** Modulcode läuft nach der Installation mit **vollen Rechten** im Server-Prozess. Ein Modul kann alle Daten lesen und ändern und auf die Zugangsdaten des Servers zugreifen – es gibt keine Sandbox. Installieren Sie nur Module aus Quellen, denen Sie vertrauen.

## Wer darf was?

| Aktion | Voraussetzung |
|---|---|
| Module ansehen | `core.modules.view` |
| Aktivieren und deaktivieren | `core.modules.manage` |
| Installieren, aktualisieren, entfernen | Administrator, angemeldet per Sitzung (kein API-Key), Bestätigung mit Passwort und ggf. 2FA-Code |

Außerdem muss der Server das Installieren erlauben: Die mitgelieferten Docker-Images setzen `ATRIUM_MODULE_INSTALL=supervisor`. Steht der Wert auf `off`, funktioniert nur die Vorschau (siehe [Konfiguration](/de/docs/configuration#modulinstallation)).

## Module installieren

Die Installation läuft in drei Schritten im Reiter **Installieren**; danach baut der Server die Anwendung neu.

### 1. Quelle wählen

Tragen Sie einen **GitHub-Link** ein – ein ganzes Repository, einen Ordner oder einen Branch bzw. Tag – oder wählen Sie eine **ZIP-Datei** (höchstens 50 MB). Klicken Sie dann auf **Quelle laden**.

<DocShot name="04-module-install" lang="de" />

Gültige Angaben sind zum Beispiel:

```text
https://github.com/KalypzoSolutions/atrium-basic-modules
https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules
github:org/repo/modules/kasse#v2.0.0
```

Öffentliche Quellen sind etwa [atrium-basic-modules](https://github.com/KalypzoSolutions/atrium-basic-modules) (Termine, Dateien, Notizen, Aufgaben, Whiteboards) und [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules).

### 2. Module auswählen

Atrium liest den Katalog `atrium-modules.json` der Quelle und zeigt alle enthaltenen Module mit ID, Version und Beschreibung sowie den **festgehaltenen Commit**. Kreuzen Sie die gewünschten Module an und klicken Sie auf **Vorschau anzeigen**.

<DocShot name="04b-module-install-select" lang="de" crop="900" />

### 3. Vorschau prüfen und installieren

Die Vorschau führt **keinen Modulcode aus**. Sie zeigt für jedes Modul:

- Version, Quelle mit Commit und die benötigte Core-Version,
- **neue und entfallende Rechte**, neue **Datenbank-Migrationen**, eigene **npm-Pakete** und die Zahl der Dateien,
- automatisch ergänzte Abhängigkeiten und empfohlene optionale Module,
- Hinweise aus einem Import-Scan, z. B. „liest Umgebungsvariablen (process.env)“, „startet Prozesse (child_process)“ oder „öffnet Netzwerkverbindungen“.

<DocShot name="04c-module-install-preview" lang="de" crop="1200" />

Ist alles in Ordnung, bestätigen Sie **Ich habe die Quelle geprüft und vertraue ihr.**, geben Ihr Konto-Passwort (und ggf. den 2FA-Code) ein und klicken auf **Installieren**.

Die Installation ist **gesperrt**, wenn zum Beispiel die Core-Version nicht passt, eine bereits angewendete Migration verändert wurde oder fehlt, ein npm-Paket mit dem Core kollidiert oder eine Abhängigkeit nicht auflösbar ist. Die Vorschau nennt dann den Grund.

### Neubau und Neustart

Nach dem Bestätigen baut der Server die Anwendung mit den neuen Modulen neu: Dateien kopieren, Pakete installieren, bauen, probeweise starten und erst nach erfolgreicher Health-Prüfung umschalten. Die Seite zeigt den Fortschritt (Wartet, Baut, Prüft, Startet neu) und aktualisiert sich selbst. Die Ausfallzeit entspricht einem Neustart von wenigen Sekunden; schlägt die Prüfung fehl, bleibt die vorige Version in Betrieb.

Anschließend stehen die Module unter **Installiert** bereit – zunächst deaktiviert. Aktivieren Sie sie dort (siehe [Installierte Module](#installierte-module)).

> **Tipp:** Der Neubau braucht Arbeitsspeicher (rund 3,5 GB). Die mitgelieferten Compose-Dateien erlauben der App deshalb bis zu 4 GB. Für ausgehende Verbindungen müssen `api.github.com`, `codeload.github.com` und bei Modulen mit eigenen Paketen `registry.npmjs.org` erreichbar sein.

### GitHub-Token und erlaubte Quellen

Unterhalb des Quellen-Formulars im Reiter **Installieren** finden Sie zwei Einstellungen:

- **GitHub-Token:** nur für private Repositorys oder höhere Abruflimits nötig – Lesezugriff genügt. Das Token wird verschlüsselt gespeichert und nur an die GitHub-API gesendet.
- **Erlaubte Quellen:** je Zeile `owner/repo` oder `owner/*`. Leer bedeutet: alle GitHub-Quellen und ZIP-Dateien sind erlaubt. Sobald Sie Quellen eintragen, sind **ZIP-Dateien gesperrt** und nur die gelisteten Repositorys zulässig.

### Was Atrium bei der Installation prüft

- GitHub-Refs werden auf einen festen **Commit** aufgelöst; gespeichert werden Quelle, Commit und Inhaltshash. Abgerufen wird nur von `api.github.com` und `codeload.github.com`.
- Archive werden nur im Speicher entpackt: keine Symlinks, keine Pfade mit `..`, keine versteckten Dateien, kein `.git` und kein `node_modules`, höchstens 5000 Dateien und 50 MB (je Datei höchstens 10 MB).
- Bereits angewendete Migrationen dürfen sich nicht ändern; neue müssen hinter den angewendeten einsortiert sein.
- Eine Vorschau ist 15 Minuten gültig und an Person und Inhalt gebunden. Jede Installation wird im Audit-Log protokolliert.

## Installierte Module

Der Reiter **Installiert** listet alle Module im aktuellen Build mit Version, Herkunft, Abhängigkeiten und Berechtigungen. In einer frischen Installation ist die Liste leer.

<DocShot name="03-modules" lang="de" />

- **Aktivieren:** Neu installierte Module sind zunächst **deaktiviert**. Beim Aktivieren legt Atrium das Datenbankschema des Moduls an und führt seine Migrationen aus. Danach erscheint das Modul in der Navigation und in der API, und seine Rechte wirken (die Rolle *Administrator* erhält sie automatisch).
- **Deaktivieren:** Das Modul verschwindet aus Navigation und API, seine Rechte wirken nicht mehr – **Daten bleiben erhalten**. Ein Modul, von dem andere aktive Module abhängen, lässt sich erst deaktivieren, wenn diese deaktiviert sind.

### Zustände „Defekt“ und „Nicht installiert“

Unter **Nicht geladen** zeigt Atrium Module, die nicht laufen – Ihre Daten bleiben dabei erhalten:

- **Defekt:** Das Modul ist vorhanden, verletzt aber eine Regel (z. B. ungültiges Manifest oder fehlende Migration). Es wird nicht geladen; die Begründung steht dabei. Abhilfe ist meist ein Update des Moduls.
- **Nicht installiert:** Laut Datenbank war das Modul da (ggf. „war aktiv“), der Code fehlt aber im laufenden Stand – etwa nach einer Wiederherstellung auf einem neuen Server. Installieren Sie es erneut oder löschen Sie mit **Daten löschen** seine Reste.

Fehlen nach einer Wiederherstellung oder dem Verlust des Daten-Volumes mehrere installierte Module, bietet die Seite oben **Aus der Datenbank wiederherstellen** an: GitHub-Module werden am gespeicherten Commit neu geladen; ZIP-Module nur, solange die Datei noch auf dem Server liegt.

## Aktualisieren

**Nach Updates suchen** vergleicht für jedes aus GitHub installierte Modul den gespeicherten Commit mit dem aktuellen Stand der Quelle („aktuell“ oder „Update verfügbar“). **Aktualisieren** öffnet die Installation mit vorbelegter Quelle; die Vorschau zeigt geänderte Dateien, neue Migrationen und Rechte.

> **Wichtig:** Erstellen Sie vor jedem Update eine [Datensicherung](/de/docs/backup-restore). Migrationen lassen sich nicht rückgängig machen.

Module, die direkt im Build enthalten sind (Herkunft „im Build enthalten“), werden mit dem Server selbst aktualisiert.

## Entfernen

**Entfernen …** steht nur für deaktivierte Module zur Verfügung, die kein anderes Modul mehr braucht. Der Server baut danach ohne das Modul neu.

- **Standard – Daten behalten:** Tabellen, Einstellungen, Rechte und Dateien bleiben erhalten und sind nach einer erneuten Installation wieder da.
- **Daten löschen:** löscht endgültig Schema, Migrationsstand, Rechte samt Rollen- und Einzelrechten, Einstellungen, Benachrichtigungs-Einstellungen, Job-Läufe und Dateien des Moduls. Zur Bestätigung geben Sie die Modul-ID ein.

## Verlauf

Der Reiter **Verlauf** listet die **installierten Quellen** (Modul, Version, Quelle, Commit, Installationszeitpunkt) und jeden Vorgang – Installiert, Aktualisiert, Neu eingespielt, Ältere Version, Entfernt – mit Person und Status.

<DocShot name="22-module-history" lang="de" />

Die Herkunft der Module gehört zur [Datensicherung](/de/docs/backup-restore). Fehlt beim Einspielen einer Sicherung ein Modul, nennt der Import dessen Quelle mit einem Link zur Installation.

## Module beim ersten Start mitbringen

Ein neuer Server kann seine Module beim ersten Start selbst holen, wenn eine Seed-Liste vorliegt (`deploy/modules.seed.json` oder `ATRIUM_MODULES_SEED`). Erlaubt sind nur volle Commits; das Format steht unter [Module entwickeln](/de/docs/modules#module-beim-ersten-start-mitbringen-seed).

## Nächste Schritte

- Einstellungen der aktiven Module: [Einstellungen → Module](/de/docs/settings#module)
- Rollen für neue Modulrechte anpassen: [Benutzer, Rollen und Rechte](/de/docs/users-roles)
- Eigenes Modul schreiben: [Module entwickeln](/de/docs/modules)
