---
title: Module entwickeln
description: Eigene Fachmodule für Kalypzo Atrium entwickeln – Paketformat, defineModule, Seiten, Migrationen, Rechte, Hooks und Auslieferung.
order: 31
section: Entwickeln
source: docs/module-development.md
---

Fachmodule erweitern den Core um konkrete Anwendungsfälle. Diese Seite richtet sich an Entwickler; die Bedienung in der Oberfläche steht unter [Module verwalten](/de/docs/module-management). Jedes Modul bringt eigene Berechtigungen, Einstellungen, REST-Endpunkte, Datenbank-Migrationen und Seiten mit – und greift ausschließlich über das Modul-SDK (`$lib/sdk/*`) auf den Core zu. Wie Module im Gesamtsystem registriert, geroutet und aktiviert werden, erklärt die [Architektur](/de/docs/architecture#registrierung-routing-aktivierung).

## Aufbau eines Moduls

### Verzeichnislayout

```text
modules/
├── atrium-modules.json     # Katalog aller Module dieses Repositorys
└── members/
    ├── atrium-module.json  # Pflicht: Paketbeschreibung (statisch, wird nie ausgeführt)
    ├── module.ts           # Pflicht: export default defineModule({...})
    ├── ui.ts               # optional: Seiten
    ├── migrations/         # SQL im Schema mod_members, Namen NNNN_name.sql
    └── pages/              # Svelte-Komponenten
```

Der Ordnername muss der Modul-ID entsprechen. Atrium entdeckt `module.ts` zur Build-Zeit im Modulverzeichnis (Standard `modules/`, abweichend über `ATRIUM_MODULES_DIR`). Andere Dateien importieren Sie über den Alias `$modules/<id>/…`.

### Paketbeschreibung: `atrium-module.json`

Die Datei ist die einzige Quelle für Kennung, Name, Version und Abhängigkeiten. Sie wird nie ausgeführt und dient der Installation (Vorschau, Abhängigkeitsauflösung).

```json
{
  "schema": 1,
  "id": "treasury",
  "name": "Kasse",
  "description": "Konten, Buchungen und Rechnungen",
  "version": "1.2.0",
  "core": ">=2.0.0-0 <3.0.0",
  "dependencies": {
    "members": { "version": "^1.14.0", "source": "github:org/repo/modules/members" }
  },
  "optionalDependencies": { "offices": { "version": "^1.2.0" } },
  "permissions": ["treasury.account.manage"],
  "npm": {}
}
```

| Feld | Bedeutung |
|---|---|
| `core` | Passende Core-Versionen als SemVer-Bereich (Vorabversionen zählen mit) |
| `dependencies` / `optionalDependencies` | Je Modul ein Versionsbereich und optional `source` (`github:owner/repo[/pfad][#ref]` oder GitHub-URL); ohne `source` wird im selben Repository gesucht |
| `permissions` | Alle Rechte des Moduls – dieselbe Menge wie im Manifest |
| `npm` | Modulspezifische npm-Pakete mit **exakter** Version; alles andere liefert der Core |

### Katalog: `atrium-modules.json`

Der Katalog liegt im Modulverzeichnis bzw. im Repository und listet alle enthaltenen Module:

```json
{
  "schema": 1,
  "name": "Meine Atrium-Module",
  "description": "Fachmodule für …",
  "modules": [
    { "id": "members", "path": "members" },
    { "id": "treasury", "path": "treasury" }
  ]
}
```

## Modul definieren

### Manifest und Definition: `module.ts`

```ts
// modules/members/module.ts
import { defineModule, defineEndpoint, core, manifestFromPackage } from '$lib/sdk/server';
import { z } from 'zod';
import pkg from './atrium-module.json';
import m0001 from './migrations/0001_init.sql?raw';

export default defineModule({
  package: pkg,
  manifest: {
    ...manifestFromPackage(pkg), // id, name, description, version, Abhängigkeiten
    permissions: ['members.users.view', 'members.users.edit', 'members.storage.write'],
    navigation: [
      { label: 'Mitglieder', icon: 'users', path: '/modules/members', permission: 'members.users.view' }
    ]
  },
  settings: [
    { key: 'members.welcomeText', label: 'Begrüßung', schema: z.string().max(500), default: '' }
  ],
  migrations: [{ name: '0001_init', sql: m0001 }],
  endpoints: [
    defineEndpoint({
      method: 'GET',
      path: '/users', // erreichbar unter /api/v1/modules/members/users
      summary: 'Mitglieder auflisten',
      permission: 'members.users.view', // Pflicht, nie null
      handler: async ({ ctx }) => {
        return core.database.forModule('members').transaction(async (tx) => {
          // Drizzle-Abfragen auf Tabellen des Moduls
          return [];
        });
      }
    })
  ]
});
```

Beim Registrieren prüft Atrium unter anderem:

- **ID-Format** `[a-z][a-z0-9-]{1,30}`, nicht `core`, `api`, `auth`, `admin` oder `system`
- **Berechtigungen** im Schema `<modul>.<ressource>.<aktion>` mit eigener Modul-ID als Präfix
- **Einstellungsschlüssel** mit Präfix `<modul>.`, Navigationspfade unter `/modules/<modul>`
- `atrium-module.json` passt zum Manifest, `migrations` enthält alle Dateien aus `migrations/` in Namensreihenfolge

Ein Verstoß beendet den Start nicht: Das Modul wird nicht geladen und erscheint unter **Administration → Module** als „Defekt“ mit Begründung.

### Seiten: `ui.ts`

```ts
// modules/members/ui.ts
import type { ModuleUi } from '$lib/sdk/types/module-ui';

export default {
  routes: {
    '': () => import('./pages/Index.svelte'),   // /modules/members
    list: () => import('./pages/List.svelte'),  // /modules/members/list
    ':id': () => import('./pages/Detail.svelte') // Parameter als Prop "params"
  }
} satisfies ModuleUi;
```

Der Core liefert die Seiten über einen zentralen Catch-all aus und prüft vorher Modulstatus und Berechtigungen. Clientseitige API-Aufrufe laufen über `apiFetch` aus `$lib/sdk/client`. Öffentliche Seiten ohne Login deklarieren Sie unter `publicRoutes`; sie sind unter `/p/<modul>/<pfad>` erreichbar und dürfen nur öffentliche Endpunkte nutzen.

### Erlaubte Importe

In `modules/<id>/**` erzwingt ESLint diese Oberfläche:

| Ziel | Erlaubt |
|---|---|
| Eigene Moduldateien (`./…`, `$modules/<id>/…`) | Ja |
| `$lib/sdk/*` (`server`, `client`, `types`) | Ja |
| `$lib/components/ui`, `$lib/components/layout`, `$lib/components/forms` | Ja |
| `$lib/forms`, `$lib/pdf-lists`, `$lib/utils` | Ja |
| `$modules/<anderes>/contract` | Nur `import type` |
| Andere Dateien fremder Module | Nein |
| `$lib/server/*` und alle übrigen `$lib/*` | Nein |

Zur Laufzeit nutzen Sie Dienste anderer Module über `core.modules.use` bzw. `core.modules.useOptional`. Zusätzlich meldet ESLint direkte Zugriffe auf Core-Interna wie `core.database.db` oder `core.system`. Das ist eine Leitplanke, keine Sandbox.

## Daten, Rechte und Einstellungen

### Datenbank und Migrationen

- Jedes Modul besitzt das Schema `mod_<id>` (Bindestriche werden zu Unterstrichen); es wird beim Aktivieren angelegt.
- Migrationen laufen in Reihenfolge, einmalig und in einer Transaktion mit `search_path = mod_<id>`. Legen Sie Tabellen daher **unqualifiziert** an.
- Prüfsummen werden gespeichert: Eine angewendete Migration darf sich nie mehr ändern – legen Sie stattdessen eine neue Datei an.
- Zugriff im Code: `core.database.forModule('<id>').transaction(async (tx) => …)`, nur mit der eigenen ID. Drizzle-Tabellen definieren Sie mit `pgSchema('mod_<id>')`. Details: [core.database](/de/docs/core-services#core-database).

```sql
-- modules/members/migrations/0001_init.sql
CREATE TABLE member (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

> **Hinweis:** Rufen Sie Core-Services wie `core.storage` oder `core.audit` nicht innerhalb einer `forModule(...).transaction` auf, sondern davor oder danach.

### Berechtigungen und Einstellungen

- Berechtigungen werden beim Start übernommen und der Rolle *Administrator* automatisch zugewiesen. Prüfen Sie sie mit `await core.permissions.require(ctx, 'members.users.edit')`.
- Für Core-Dienste im Namen des Moduls deklarieren Sie Capability-Rechte: `<modul>.storage.read|write|delete` und `<modul>.ai.use`.
- Einstellungen sind per Zod typisiert und über `core.settings.get/set` nutzbar; `secret: true` speichert verschlüsselt.
- Die Aufrufe im Detail: [core.permissions](/de/docs/core-services#core-permissions) und [core.settings](/de/docs/core-services#core-settings).

## Hooks

Über weitere Felder in `defineModule` klinkt sich ein Modul in Abläufe des Core ein.

### Erscheinungsbild per Profil-Modul

Organisationsspezifisches Aussehen gehört nicht in den Core, sondern in ein **Profil-Modul**. Diese Hooks in `defineModule` wirken, solange das Modul aktiv ist:

| Hook | Wirkung |
|---|---|
| `settingDefaults` | Vorgaben für globale Einstellungen (z. B. Systemname, Sprache, KI-Ton); gespeicherte Werte haben Vorrang |
| `pdfTemplates` | Briefvorlagen; eine Vorlage mit der ID einer Core-Vorlage (`brief`, `briefkopf`, `briefkopf-quer`) ersetzt diese |
| `mailBranding` | Kopf des E-Mail-Layouts (`title`, optional `mark` und `emblem`) |
| `brandingLogo` | Ersatz-Logo (Data-URL, PNG) für Favicon, App-Icons, Seitenleiste und Login, solange kein Logo hochgeladen ist |

Ein Beispiel ist das Modul `ep-stamm` in [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules).

### Weitere Hooks (Auswahl)

| Feld | Zweck |
|---|---|
| `provides` | Dienste für andere Module (mit `satisfies <Vertrag>`) |
| `jobs` | Hintergrundjobs (`hourly`, `daily` oder alle n Minuten), siehe [Jobs und Suche](/de/docs/core-services#jobs-und-suche) |
| `search` | Quelle für die globale Suche |
| `onUserDeleted` | Pflicht, wenn das Modul Benutzer-IDs speichert |
| `subjectExport` | Beitrag zur DSGVO-Datenauskunft |
| `backup.rehash` | Pflicht für schlüsselgebundene Hashes, wenn eine Sicherung mit anderem `APP_SECRET` eingespielt wird |
| `onEnable` / `onDisable` | Nacharbeiten beim Aktivieren bzw. Deaktivieren |

## Module installieren

Wie Administratoren Module per GitHub-Link oder ZIP-Datei installieren, aktivieren, aktualisieren und entfernen, beschreibt [Module verwalten](/de/docs/module-management). Für Entwickler wichtig: Die Installation liest nur statische Dateien (`atrium-modules.json`, `atrium-module.json`, Migrationen) für die Vorschau, prüft Commit, Inhaltshash und Migrations-Prüfsummen und baut die Anwendung anschließend neu. Ihr Modul muss also ohne Codeausführung beschreibbar sein und darf angewendete Migrationen nie ändern.

Damit Administratoren Ihr Modul im [Marktplatz](/de/marktplatz) finden, tragen Sie die Quelle per Pull Request ein – siehe [Modul-Marktplatz: Eigenes Modul eintragen](/de/docs/marketplace#eigenes-modul-eintragen).

### Module beim ersten Start mitbringen (Seed)

Ein frischer Server kann seine Module selbst holen. Hinterlegen Sie dazu eine Seed-Liste in `deploy/modules.seed.json` oder direkt als JSON in `ATRIUM_MODULES_SEED`:

```json
{
  "schema": 1,
  "sources": [
    {
      "source": "github:org/repo",
      "commit": "<voller Commit, 40 Zeichen>",
      "modules": ["members", "treasury"],
      "contentHashes": { "members": "sha256-…" }
    }
  ]
}
```

Erlaubt sind nur volle Commits, keine Branches. Fehlt `modules`, werden alle Module der Quelle installiert; `contentHashes` ist optional.

## Checkliste

- [ ] Manifest valide, Berechtigungen mit Modulpräfix
- [ ] Nur erlaubte Importe (`npm run lint`)
- [ ] Migrationen im Modulschema, nie nachträglich geändert
- [ ] Jede Operation mit `ctx` und `core.permissions.require`
- [ ] Tests für Rechte und Modulstatus
- [ ] `onUserDeleted`, wenn das Modul Benutzer-IDs speichert
- [ ] `subjectExport` bei personenbezogenen Daten

## Nächste Schritte

- Die Dienste des `core`-Objekts: [Core-Services](/de/docs/core-services)
- Endpunkte von außen aufrufen: [REST-API](/de/docs/api)
- Entwicklungsumgebung und Tests: [Entwicklung](/de/docs/development)
