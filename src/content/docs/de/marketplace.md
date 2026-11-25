---
title: Modul-Marktplatz
description: Modulquellen im Marktplatz finden, die öffentliche Registry nutzen und eigene Module eintragen.
order: 13.5
section: Administration
---

Der [Marktplatz](/de/marktplatz) ist eine öffentliche Übersicht über **Modulquellen** für Atrium – GitHub-Repositorys mit einem oder mehreren Fachmodulen. Sie suchen dort nach Name, Beschreibung und Schlagwörtern, filtern nach Kategorien und kopieren den GitHub-Link einer Quelle. Dieselben Daten stehen als maschinenlesbare [Registry](#registry-fuer-atrium-instanzen) bereit, damit Atrium-Instanzen und andere Werkzeuge die Liste selbst abrufen können.

> **Warnung:** Ein Eintrag im Marktplatz ist **keine Sicherheitsprüfung**. Modulcode läuft nach der Installation mit vollen Rechten im Server-Prozess (siehe [Module verwalten](/de/docs/module-management)). Prüfen Sie jede Quelle selbst. Die Markierung **Offiziell** tragen nur Quellen von Kalypzo Solutions.

## Was der Marktplatz zeigt

Jeder Eintrag beschreibt eine Quelle:

- Name, Beschreibung und Herausgeber, ggf. mit der Markierung **Offiziell**,
- Kategorien, Schlagwörter, Lizenz und ggf. eine Projektseite,
- die enthaltenen Module mit Name und Kurzbeschreibung,
- den GitHub-Link, den Sie in Atrium einfügen.

Die Modulliste dient nur der Orientierung. Maßgeblich ist der [Katalog](/de/docs/modules#katalog-atrium-modules-json) der Quelle, den Atrium bei der Installation liest.

| Kategorie | Bedeutung |
|---|---|
| `core` | Grundfunktionen und Erweiterungen des Core |
| `organisation` | Mitglieder, Termine, Gruppen, Organisation |
| `communication` | Nachrichten, Ankündigungen, Benachrichtigungen |
| `finance` | Kasse, Beiträge, Abrechnung |
| `files` | Dateien und Dokumente |
| `productivity` | Notizen, Aufgaben, Whiteboards |
| `integration` | Anbindung externer Dienste |
| `other` | Alles Übrige |

## Modul aus dem Marktplatz installieren

1. Suchen Sie im [Marktplatz](/de/marktplatz) die gewünschte Quelle und prüfen Sie Herausgeber, Repository und Lizenz.
2. Klicken Sie auf **Link kopieren**.
3. Fügen Sie den Link in Ihrer Atrium-Instanz unter **Administration → Module → Installieren** ein und fahren Sie fort wie unter [Module installieren](/de/docs/module-management#module-installieren) beschrieben.

Der Marktplatz liefert nur den Link; Vorschau und Bestätigung der Installation bleiben unverändert.

> **Tipp:** Haben Sie **Erlaubte Quellen** eingetragen, lässt Atrium nur diese Repositorys zu – auch wenn eine Quelle im Marktplatz steht (siehe [GitHub-Token und erlaubte Quellen](/de/docs/module-management#github-token-und-erlaubte-quellen)).

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
| `sources[].ref` | Text | Optional: Branch oder Tag |
| `sources[].path` | Text | Optional: Ordner im Repository |
| `sources[].publisher.name` / `.url` | Text / URL | Herausgeber |
| `sources[].official` | Wahrheitswert | `true` bei Quellen von Kalypzo Solutions |
| `sources[].categories` | Liste | Kategorien (siehe Tabelle oben) |
| `sources[].tags` | Liste | Freie Schlagwörter |
| `sources[].license` | Text | Optional: SPDX-Lizenzkennung, z. B. `MIT` |
| `sources[].homepage` | URL | Optional: Projektseite |
| `sources[].modules[]` | Liste | Enthaltene Module mit `id`, `name` und `description` je Sprache (nur zur Anzeige) |
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
- **Nichts automatisch installieren:** Die Registry liefert nur Vorschläge. Installiert wird immer über den normalen [Ablauf in Atrium](/de/docs/module-management#module-installieren).
- **Erlaubte Quellen gelten weiter:** Eingetragene [erlaubte Quellen](/de/docs/module-management#github-token-und-erlaubte-quellen) haben Vorrang vor dem Marktplatz.
- **Katalog der Quelle ist maßgeblich:** `modules` dient nur der Anzeige; verbindlich ist der Katalog im Repository.

## Eigenes Modul eintragen

Neue Quellen werden per Pull Request im Repository der Website [KalypzoSolutions/atrium-website](https://github.com/KalypzoSolutions/atrium-website) eingetragen.

1. Stellen Sie sicher, dass Ihr Repository öffentlich auf GitHub liegt und einen gültigen [Katalog](/de/docs/modules#katalog-atrium-modules-json) enthält. Testen Sie die Installation in einer eigenen Instanz.
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

> **Tipp:** Kommen neue Module hinzu oder ändert sich der Ordner, passen Sie den Eintrag per Pull Request an. Die installierbaren Module liest Atrium immer direkt aus Ihrem Repository.

## Nächste Schritte

- Module installieren und verwalten: [Module verwalten](/de/docs/module-management)
- Eigenes Modul schreiben: [Module entwickeln](/de/docs/modules)
- Grenzen des Sicherheitsmodells: [Sicherheit](/de/docs/security)
