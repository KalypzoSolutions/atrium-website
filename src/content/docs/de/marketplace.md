---
title: Modul-Marktplatz
description: Modulquellen im Atrium-Marktplatz finden, per GitHub-Link installieren, die öffentliche Registry für Instanzen nutzen und eigene Module eintragen.
order: 13.5
section: Administration
---

Der [Marktplatz](/de/marktplatz) ist eine öffentliche Übersicht über **Modulquellen** für Atrium – also GitHub-Repositorys, die ein oder mehrere Fachmodule enthalten. Sie können dort nach Namen, Beschreibung und Schlagwörtern suchen, nach Kategorien filtern und den GitHub-Link einer Quelle mit einem Klick kopieren. Installiert wird wie gewohnt in Ihrer eigenen Atrium-Instanz unter **Administration → Module → Installieren** (siehe [Module verwalten](/de/docs/module-management)).

Dieselben Daten stehen zusätzlich als maschinenlesbare [Registry](#registry-fuer-atrium-instanzen) bereit, damit Atrium-Instanzen und andere Werkzeuge die Liste selbst abrufen können – ähnlich wie ein App Store.

> **Warnung:** Ein Eintrag im Marktplatz ist **keine Sicherheitsprüfung**. Modulcode läuft nach der Installation mit **vollen Rechten** im Server-Prozess, ohne Sandbox. Prüfen Sie jede Quelle selbst und installieren Sie nur Module, denen Sie vertrauen. Einträge mit der Markierung **Offiziell** stammen von Kalypzo Solutions.

## Was der Marktplatz zeigt

Jeder Eintrag beschreibt eine Quelle:

- Name, Beschreibung und Herausgeber (mit Markierung **Offiziell** für Quellen von Kalypzo Solutions),
- Kategorien und Schlagwörter, Lizenz und ggf. eine Projektseite,
- die enthaltenen Module mit Namen und Kurzbeschreibung,
- den GitHub-Link, den Sie in Atrium einfügen.

Die Modulliste dient nur der Orientierung. Maßgeblich ist der Katalog `atrium-modules.json` der Quelle selbst: Atrium liest ihn bei der Installation und zeigt den tatsächlichen Stand mit Version und festgehaltenem Commit.

| Kategorie | Bedeutung |
|---|---|
| `core` | Grundfunktionen und Erweiterungen des Kerns |
| `organisation` | Mitglieder, Termine, Gruppen, Organisation |
| `communication` | Nachrichten, Ankündigungen, Benachrichtigungen |
| `finance` | Kasse, Beiträge, Abrechnung |
| `files` | Dateien und Dokumente |
| `productivity` | Notizen, Aufgaben, Whiteboards |
| `integration` | Anbindung externer Dienste |
| `other` | Alles Übrige |

## Modul aus dem Marktplatz installieren

1. Öffnen Sie den [Marktplatz](/de/marktplatz) und suchen Sie die gewünschte Quelle, z. B. über die Suche oder einen Kategorienfilter.
2. Prüfen Sie Herausgeber, Repository und Lizenz. Öffnen Sie im Zweifel das Repository auf GitHub und sehen Sie sich den Code an.
3. Klicken Sie auf **Link kopieren**. Der GitHub-Link der Quelle liegt jetzt in der Zwischenablage.
4. Melden Sie sich in Ihrer Atrium-Instanz als Administrator an und öffnen Sie **Administration → Module → Installieren**.
5. Fügen Sie den Link in das Feld für den GitHub-Link ein und klicken Sie auf **Quelle laden**.
6. Wählen Sie die gewünschten Module aus und klicken Sie auf **Vorschau anzeigen**. Prüfen Sie Rechte, Migrationen, npm-Pakete und die Hinweise des Import-Scans.
7. Bestätigen Sie **Ich habe die Quelle geprüft und vertraue ihr.**, geben Sie Ihr Passwort (und ggf. den 2FA-Code) ein und klicken Sie auf **Installieren**.
8. Nach dem Neubau aktivieren Sie die Module im Reiter **Installiert**.

Die Schritte 5 bis 8 sind ausführlich unter [Module verwalten](/de/docs/module-management) beschrieben. Der Marktplatz umgeht weder Vorschau noch Vertrauensbestätigung noch die Abfrage von Passwort und 2FA.

> **Tipp:** Haben Sie unter **Erlaubte Quellen** eine Liste hinterlegt, lässt Atrium nur die dort eingetragenen Repositorys zu – auch wenn eine Quelle im Marktplatz steht. Ergänzen Sie die Quelle dann zuerst dort (siehe [GitHub-Token und erlaubte Quellen](/de/docs/module-management#github-token-und-erlaubte-quellen)).

## Registry für Atrium-Instanzen

Der Marktplatz wird beim Build zusätzlich als statische JSON-Datei veröffentlicht:

```text
GET https://atrium.kalypzo.de/marketplace/v1/index.json
```

Die Datei ist öffentlich, ohne Anmeldung abrufbar, mit CORS für alle Ursprünge (`Access-Control-Allow-Origin: *`) und wird 15 Minuten zwischengespeichert. Die Version im Pfad (`v1`) und das Feld `schema` ändern sich nur bei **inkompatiblen** Änderungen; neue Felder können jederzeit hinzukommen.

### Felder

| Feld | Typ | Bedeutung |
|---|---|---|
| `schema` | Zahl | Formatversion, derzeit `1` |
| `generatedAt` | Zeitstempel | Zeitpunkt des Builds (ISO 8601, UTC) |
| `site` | URL | Basis-URL der Website |
| `marketplace.de` / `marketplace.en` | URL | Marktplatz-Seite je Sprache |
| `sources[]` | Liste | Eingetragene Modulquellen |
| `sources[].id` | Text | Eindeutige, stabile ID der Quelle |
| `sources[].name` | Text | Anzeigename |
| `sources[].description.de` / `.en` | Text | Beschreibung je Sprache |
| `sources[].repository` | URL | GitHub-Repository |
| `sources[].source` | URL | Link zum Einfügen in Atrium (Repository oder Ordner) |
| `sources[].ref` | Text | optional: Branch oder Tag |
| `sources[].path` | Text | optional: Ordner im Repository |
| `sources[].publisher.name` / `.url` | Text / URL | Herausgeber |
| `sources[].official` | Wahrheitswert | `true` bei Quellen von Kalypzo Solutions |
| `sources[].categories` | Liste | Kategorien (siehe Tabelle oben) |
| `sources[].tags` | Liste | Freie Schlagwörter |
| `sources[].license` | Text | optional: SPDX-Lizenzkennung, z. B. `MIT` |
| `sources[].homepage` | URL | optional: Projektseite |
| `sources[].modules[]` | Liste | Enthaltene Module (nur zur Information) mit `id`, `name` und `description` je Sprache |
| `sources[].addedAt` | Datum | Tag der Aufnahme in den Marktplatz |

### Beispiel

```json
{
  "schema": 1,
  "generatedAt": "2026-11-25T12:00:00.000Z",
  "site": "https://atrium.kalypzo.de",
  "marketplace": {
    "de": "https://atrium.kalypzo.de/de/marktplatz",
    "en": "https://atrium.kalypzo.de/en/marketplace"
  },
  "sources": [
    {
      "id": "atrium-basic-modules",
      "name": "Atrium Basic Modules",
      "description": {
        "de": "Grundlegende Module: Termine, Dateien, Notizen, Aufgaben und Whiteboards.",
        "en": "Basic modules: events, files, notes, tasks and whiteboards."
      },
      "repository": "https://github.com/KalypzoSolutions/atrium-basic-modules",
      "source": "https://github.com/KalypzoSolutions/atrium-basic-modules",
      "ref": "main",
      "path": "modules",
      "publisher": { "name": "Kalypzo Solutions", "url": "https://github.com/KalypzoSolutions" },
      "official": true,
      "categories": ["organisation"],
      "tags": ["termine"],
      "license": "MIT",
      "modules": [
        {
          "id": "events",
          "name": { "de": "Termine", "en": "Events" },
          "description": { "de": "Termine und Kalender.", "en": "Events and calendar." }
        }
      ],
      "addedAt": "2026-11-25"
    }
  ]
}
```

### Abruf mit curl

```bash
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json

# nur IDs und Links der Quellen (mit jq)
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json \
  | jq -r '.sources[] | "\(.id)\t\(.source)"'
```

### Regeln für Clients

Wer die Registry in einer Atrium-Instanz oder einem anderen Werkzeug nutzt, sollte sich an Folgendes halten:

- **Zwischenspeichern:** Die Datei höchstens alle 15 Minuten abrufen und bei einem Fehler den letzten Stand weiterverwenden.
- **Schema prüfen:** Nur Antworten mit `schema` gleich `1` verarbeiten. Bei einem anderen Wert die Liste nicht anzeigen, sondern auf ein Update des Clients hinweisen.
- **Unbekannte Felder ignorieren:** Neue Felder sind keine inkompatible Änderung und dürfen nicht zu Fehlern führen.
- **Nur GitHub-Links übernehmen:** Ausschließlich URLs akzeptieren, die mit `https://github.com/` beginnen. Alle anderen Einträge verwerfen.
- **Nichts automatisch installieren:** Die Registry liefert nur Vorschläge. Die Installation läuft immer über die normale Vorschau mit Vertrauensbestätigung, Passwort und ggf. 2FA.
- **Erlaubte Quellen gelten weiter:** Eine eingestellte Liste erlaubter Quellen (Allowlist) hat Vorrang vor dem Marktplatz.
- **Katalog der Quelle ist maßgeblich:** Die Angaben unter `modules` dienen nur der Anzeige; verbindlich ist `atrium-modules.json` im Repository.

## Eigenes Modul eintragen

Neue Quellen werden per Pull Request im Repository der Website [KalypzoSolutions/atrium-website](https://github.com/KalypzoSolutions/atrium-website) eingetragen.

1. Stellen Sie sicher, dass Ihr Repository öffentlich auf GitHub liegt und einen gültigen Katalog `atrium-modules.json` enthält (siehe [Module entwickeln](/de/docs/modules)). Testen Sie die Installation in einer eigenen Instanz.
2. Forken Sie `atrium-website` und ergänzen Sie in `src/lib/marketplace.ts` einen Eintrag für Ihre Quelle.
3. Vergeben Sie eine eindeutige `id` (Kleinbuchstaben, Ziffern und Bindestriche), Beschreibungen auf **Deutsch und Englisch** sowie mindestens eine Kategorie aus der Liste oben. `official` bleibt `false` – diese Markierung ist Quellen von Kalypzo Solutions vorbehalten.
4. Prüfen Sie lokal mit `npm run build`. Der Build bricht bei ungültigen Einträgen ab, etwa bei doppelten IDs, Links außerhalb von `https://github.com`, fehlenden Übersetzungen oder unbekannten Kategorien.
5. Öffnen Sie einen Pull Request mit einer kurzen Beschreibung Ihrer Module. Nach dem Merge erscheint die Quelle auf der Marktplatz-Seite und in der Registry.

Ein Eintrag sieht zum Beispiel so aus:

```ts
{
	id: 'verein-kasse',
	name: 'Vereinskasse',
	description: {
		de: 'Kassenbuch, Mitgliedsbeiträge und Belege für Vereine.',
		en: 'Cash book, membership fees and receipts for clubs.'
	},
	repository: 'https://github.com/beispiel-org/atrium-kasse',
	source: 'https://github.com/beispiel-org/atrium-kasse',
	ref: 'main',
	publisher: { name: 'Beispiel e. V.', url: 'https://github.com/beispiel-org' },
	official: false,
	categories: ['finance'],
	tags: ['kasse', 'beiträge'],
	license: 'MIT',
	modules: [
		{
			id: 'treasury',
			name: { de: 'Kasse', en: 'Treasury' },
			description: { de: 'Einnahmen und Ausgaben erfassen.', en: 'Track income and expenses.' }
		}
	],
	addedAt: '2026-11-25'
}
```

> **Tipp:** Halten Sie den Eintrag aktuell. Kommen neue Module hinzu oder ändert sich der Ordner, passen Sie den Eintrag per Pull Request an. Die installierbaren Module selbst liest Atrium immer direkt aus Ihrem Repository.

## Nächste Schritte

- Module installieren und verwalten: [Module verwalten](/de/docs/module-management)
- Eigenes Modul schreiben: [Module entwickeln](/de/docs/modules)
- Marktplatz öffnen: [Marktplatz](/de/marktplatz)
