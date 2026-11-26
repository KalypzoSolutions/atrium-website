---
title: Modul-Marktplatz
description: Modulquellen im Marktplatz finden, die öffentliche Registry nutzen und eigene Module eintragen.
order: 13.5
section: Administration
---

Der [Marktplatz](/de/marktplatz) ist eine öffentliche Übersicht über **Modulquellen** für Atrium – GitHub-Repositorys mit einem oder mehreren Fachmodulen. Sie sehen dort entweder ganze **Pakete** (Modulquellen) oder **einzelne Module**, öffnen zu jedem Paket und Modul eine eigene [Detailseite](#detailseiten), suchen nach Name, Beschreibung und Schlagwörtern, filtern nach Kategorien und kopieren den GitHub-Link eines Pakets oder eines einzelnen Moduls. Dieselben Daten stehen als maschinenlesbare [Registry](#registry-fuer-atrium-instanzen) bereit, damit Atrium-Instanzen und andere Werkzeuge die Liste selbst abrufen können.

> **Warnung:** Ein Eintrag im Marktplatz ist **keine Sicherheitsprüfung**. Modulcode läuft nach der Installation mit vollen Rechten im Server-Prozess (siehe [Module verwalten](/de/docs/module-management)). Prüfen Sie jede Quelle selbst. Die Markierung **Offiziell** tragen nur Quellen von Kalypzo Solutions.

## Was der Marktplatz zeigt

Oberhalb der Liste wählen Sie zwischen zwei Ansichten:

| Ansicht | Zeigt |
|---|---|
| **Pakete** | Jede Modulquelle (ein Repository mit mehreren Modulen) als eigene Karte |
| **Einzelne Module** | Jedes Modul aller Quellen als eigene Karte |

Suche, Kategorien und **Nur offizielle** wirken in beiden Ansichten. Ohne JavaScript zeigt die Seite nur die Paketansicht.

### Pakete

Jede Karte beschreibt eine Quelle:

- Name, Beschreibung und Herausgeber, ggf. mit der Markierung **Offiziell**,
- Kategorien, Schlagwörter, Lizenz und ggf. eine Projektseite,
- die enthaltenen Module mit Name und Kurzbeschreibung, jeweils als Link auf die Modulseite,
- den GitHub-Link, den Sie in Atrium einfügen.

Ein Klick auf den Namen des Pakets oder auf **Details** öffnet die Paketseite.

### Einzelne Module

Jede Karte beschreibt ein Modul:

- Name, Version (sofern bekannt) und Beschreibung des Moduls sowie den Verweis **aus Paket** mit dem Namen der Quelle,
- Herausgeber, ggf. die Markierung **Offiziell**, und Kategorien – beides übernimmt das Modul von seiner Quelle,
- einen eigenen Installationslink mit **Link kopieren**,
- einen Link auf den Ordner des Moduls auf GitHub.

Ein Klick auf den Modulnamen oder auf **Details** öffnet die Modulseite; **aus Paket** springt zur Karte der Quelle in der Paketansicht.

Die Suche durchsucht hier Modul-ID, Modulname und -beschreibung, Paketname, Herausgeber, Schlagwörter und Kategorien. Auch die Suche der Website findet Pakete und einzelne Module und öffnet direkt deren Detailseite.

### Detailseiten

Jedes Paket und jedes Modul hat eine eigene Seite mit fester Adresse:

| Seite | Adresse |
|---|---|
| Paket | `/de/marktplatz/<quell-id>` bzw. `/en/marketplace/<quell-id>` |
| Modul | `/de/marktplatz/<quell-id>/<modul-id>` bzw. `/en/marketplace/<quell-id>/<modul-id>` |

Die Paketseite zeigt neben den Angaben der Karte das README des Repositorys und alle enthaltenen Module. Die Modulseite zeigt zusätzlich, was das Manifest des Moduls angibt – etwa Version, benötigte Core-Version, Abhängigkeiten und Berechtigungen –, die bisherigen Versionen sowie README und Bilder des Moduls, sofern vorhanden. Diese Angaben stammen aus einem [Snapshot](#snapshot-der-quellen), der beim Build fest in die Website eingebaut ist; sie geben also den Stand der letzten Synchronisierung wieder, nicht unbedingt den aktuellen Stand im Repository.

Alle Detailseiten stehen in der Sitemap.

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

Sie installieren entweder ein **ganzes Paket** oder ein **einzelnes Modul**:

| Link | Atrium bietet an |
|---|---|
| Paket (Ansicht **Pakete**) | Alle Module der Quelle; Sie wählen die gewünschten aus |
| Einzelnes Modul (Ansicht **Einzelne Module**) | Nur dieses Modul |

1. Suchen Sie im [Marktplatz](/de/marktplatz) das gewünschte Paket oder Modul und prüfen Sie Herausgeber, Repository und Lizenz.
2. Klicken Sie auf der Karte auf **Link kopieren**.
3. Fügen Sie den Link in Ihrer Atrium-Instanz unter **Administration → Module → Installieren** ein und fahren Sie fort wie unter [Module installieren](/de/docs/module-management#module-installieren) beschrieben.

Der Marktplatz liefert nur den Link; Vorschau und Bestätigung der Installation bleiben unverändert. Benötigt ein Modul weitere Module, zeigt die Vorschau diese Abhängigkeiten an. Ist eine Abhängigkeit nicht auflösbar, ist die Installation gesperrt und die Vorschau nennt den Grund.

> **Tipp:** Hängt ein Modul von anderen Modulen aus demselben Paket ab, nutzen Sie besser den Link des Pakets und wählen die benötigten Module gemeinsam aus.

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
| `sources[].modules[]` | Liste | Enthaltene Module mit `id`, `name` und `description` je Sprache sowie `source` (nur zur Anzeige) |
| `sources[].modules[].source` | URL | Link zum Einfügen in Atrium für dieses einzelne Modul (Ordner des Moduls) |
| `sources[].modules[].page.de` / `.en` | URL | Detailseite des Moduls je Sprache |
| `sources[].page.de` / `.en` | URL | Detailseite der Quelle je Sprache |
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
          "description": { "de": "Termine und Kalender.", "en": "Events and calendar." },
          "source": "https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules/events",
          "page": {
            "de": "https://atrium.kalypzo.de/de/marktplatz/atrium-basic-modules/events",
            "en": "https://atrium.kalypzo.de/en/marketplace/atrium-basic-modules/events"
          }
        }
      ],
      "addedAt": "2026-11-25",
      "page": {
        "de": "https://atrium.kalypzo.de/de/marktplatz/atrium-basic-modules",
        "en": "https://atrium.kalypzo.de/en/marketplace/atrium-basic-modules"
      }
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

# IDs und Links aller einzelnen Module (mit jq)
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json \
  | jq -r '.sources[].modules[] | "\(.id)\t\(.source)"'
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
4. Prüfen Sie lokal mit `npm run build`. Der Build bricht bei ungültigen Einträgen ab, etwa bei doppelten IDs, Links außerhalb von `https://github.com` (auch die Kurzform `github:…` ist nicht erlaubt), `official: true` außerhalb von KalypzoSolutions, fehlenden Übersetzungen, unbekannten Kategorien oder einem Modul-`source`, das nicht mit `https://github.com/` beginnt oder nicht ins Repository der Quelle zeigt.
5. Erzeugen Sie optional mit `npm run sync:marketplace` den [Snapshot](#snapshot-der-quellen) für die Detailseiten und committen Sie ihn mit.
6. Öffnen Sie einen Pull Request mit einer kurzen Beschreibung Ihrer Module. Nach dem Merge erscheint die Quelle auf der Marktplatz-Seite, mit eigenen Detailseiten und in der Registry.

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

Die Installationslinks der einzelnen Module bildet die Website automatisch aus `repository`, `ref` (Standard `main`), `path` und der Modul-ID: `<repository>/tree/<ref>/<path>/<modul-id>`. Im Beispiel ohne `path` ergibt das `https://github.com/beispiel-org/atrium-kasse/tree/main/treasury`. Liegt ein Modul in einem abweichenden Ordner, setzen Sie im Modul-Eintrag ein eigenes Feld `source`:

```ts
{
	id: 'treasury',
	name: { de: 'Kasse', en: 'Treasury' },
	description: { de: 'Einnahmen und Ausgaben erfassen.', en: 'Track income and expenses.' },
	source: 'https://github.com/beispiel-org/atrium-kasse/tree/main/packages/treasury'
}
```

> **Tipp:** Kommen neue Module hinzu oder ändert sich der Ordner, passen Sie den Eintrag per Pull Request an. Die installierbaren Module liest Atrium immer direkt aus Ihrem Repository.

### Snapshot der Quellen

README, Manifeste, Versionen und Bilder für die [Detailseiten](#detailseiten) liest die Website nicht beim Aufruf von GitHub, sondern aus einem Snapshot im Repository der Website. Den Snapshot erzeugen Sie mit:

```bash
npm run sync:marketplace

# optional mit Token für ein höheres GitHub-API-Limit
GITHUB_TOKEN=ghp_… npm run sync:marketplace
```

Das Skript liest für jede Quelle aus `src/lib/marketplace.ts` den aktuellen Commit von `ref`, den Katalog und die Manifeste der eingetragenen Module und legt die Ergebnisse so ab:

| Ablage | Inhalt |
|---|---|
| `src/content/marketplace/<quell-id>/source.json` | Commit, Zeitpunkt der Synchronisierung und Katalog der Quelle |
| `src/content/marketplace/<quell-id>/README.md` | README des Repositorys (falls vorhanden) |
| `src/content/marketplace/<quell-id>/modules/<modul-id>.json` | Manifest des Moduls, Versionen (aus der Git-Historie des Manifests) und Bilder |
| `src/content/marketplace/<quell-id>/modules/<modul-id>.md` | README des Moduls (falls vorhanden) |
| `static/marketplace/<quell-id>/<modul-id>/…` | Bilder des Moduls aus `screenshots/` und aus dem README (höchstens 5 MB je Datei) |

Jeder Lauf ersetzt den Snapshot einer Quelle vollständig. Module, die nicht in `src/lib/marketplace.ts` stehen, überspringt das Skript. Committen Sie die geänderten Dateien zusammen mit Ihrem Eintrag; fehlt ein Snapshot, zeigen die Detailseiten nur die Angaben aus `src/lib/marketplace.ts`.

> **Hinweis:** READMEs werden beim Build in sicheres HTML umgewandelt. Eigenes HTML und Bilder von fremden Servern erscheinen nicht; binden Sie Bilder mit relativem Pfad aus dem Modulordner ein.

## Nächste Schritte

- Module installieren und verwalten: [Module verwalten](/de/docs/module-management)
- Eigenes Modul schreiben: [Module entwickeln](/de/docs/modules)
- Grenzen des Sicherheitsmodells: [Sicherheit](/de/docs/security)
