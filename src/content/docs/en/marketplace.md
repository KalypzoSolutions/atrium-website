---
title: Module marketplace
description: Find module sources in the marketplace, use the public registry and list your own modules.
order: 13.5
section: Administration
---

The [marketplace](/en/marketplace) is a public overview of **module sources** for Atrium – GitHub repositories with one or more feature modules. You can search by name, description and tags, filter by category and copy a source's GitHub link. The same data is available as a machine-readable [registry](#registry-for-atrium-instances), so Atrium instances and other tools can fetch the list themselves.

> **Warning:** Being listed in the marketplace is **not a security review**. After installation, module code runs with full privileges in the server process (see [Managing modules](/en/docs/module-management)). Review every source yourself. Only sources from Kalypzo Solutions are marked **Official**.

## What the marketplace shows

Each entry describes one source:

- name, description and publisher, marked **Official** where applicable,
- categories, tags, license and an optional project page,
- the modules it contains, with name and short description,
- the GitHub link you paste into Atrium.

The module list is for orientation only. The source's [catalog](/en/docs/modules#catalog-atrium-modules-json), which Atrium reads during installation, is authoritative.

| Category | Meaning |
|---|---|
| `core` | Basic functions and extensions of the core |
| `organisation` | Members, events, groups, organisation |
| `communication` | Messages, announcements, notifications |
| `finance` | Treasury, fees, billing |
| `files` | Files and documents |
| `productivity` | Notes, tasks, whiteboards |
| `integration` | Connections to external services |
| `other` | Everything else |

## Installing a module from the marketplace

1. Find the source you want in the [marketplace](/en/marketplace) and check the publisher, repository and license.
2. Click **Copy link**.
3. Paste the link in your Atrium instance under **Administration → Modules → Install** and continue as described in [Installing modules](/en/docs/module-management#installing-modules).

The marketplace only provides the link; the preview and confirmation of the installation stay the same.

> **Tip:** If you have entered **Allowed sources**, Atrium only accepts those repositories – even if a source is in the marketplace (see [GitHub token and allowed sources](/en/docs/module-management#github-token-and-allowed-sources)).

## Registry for Atrium instances

During the build, the marketplace is also published as a static JSON file:

```text
GET https://atrium.kalypzo.de/marketplace/v1/index.json
```

The file is public, needs no authentication, allows CORS from any origin (`Access-Control-Allow-Origin: *`) and is cached for 15 minutes. The version in the path (`v1`) and the `schema` field only change for **incompatible** changes; new fields may be added at any time.

### Fields

| Field | Type | Meaning |
|---|---|---|
| `schema` | Number | Format version, currently `1` |
| `generatedAt` | Timestamp | Build time (ISO 8601, UTC) |
| `site` | URL | Base URL of the website |
| `marketplace.de` / `marketplace.en` | URL | Marketplace page per language |
| `sources[]` | List | Listed module sources |
| `sources[].id` | Text | Unique, stable ID of the source |
| `sources[].name` | Text | Display name |
| `sources[].description.de` / `.en` | Text | Description per language |
| `sources[].repository` | URL | GitHub repository |
| `sources[].source` | URL | Link to paste into Atrium (repository or folder) |
| `sources[].ref` | Text | Optional: branch or tag |
| `sources[].path` | Text | Optional: folder in the repository |
| `sources[].publisher.name` / `.url` | Text / URL | Publisher |
| `sources[].official` | Boolean | `true` for sources from Kalypzo Solutions |
| `sources[].categories` | List | Categories (see table above) |
| `sources[].tags` | List | Free-form tags |
| `sources[].license` | Text | Optional: SPDX license identifier, e.g. `MIT` |
| `sources[].homepage` | URL | Optional: project page |
| `sources[].modules[]` | List | Contained modules with `id`, `name` and `description` per language (display only) |
| `sources[].addedAt` | Date | Day the source was added to the marketplace |

### Example

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

### Fetching with curl

```bash
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json

# only IDs and links of the sources (with jq)
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json \
  | jq -r '.sources[] | "\(.id)\t\(.source)"'
```

### Rules for clients

If you use the registry in an Atrium instance or another tool, follow these rules:

- **Cache:** Fetch the file at most every 15 minutes and keep using the last good copy if a request fails.
- **Check the schema:** Only process responses where `schema` equals `1`. For any other value, do not show the list; ask the user to update the client instead.
- **Ignore unknown fields:** New fields are not an incompatible change and must not cause errors.
- **Only accept GitHub links:** Only accept URLs starting with `https://github.com/` and discard all other entries.
- **Never install automatically:** The registry only provides suggestions. Installation always goes through the normal [process in Atrium](/en/docs/module-management#installing-modules).
- **Allowed sources still apply:** Configured [allowed sources](/en/docs/module-management#github-token-and-allowed-sources) take precedence over the marketplace.
- **The source's catalog is authoritative:** `modules` is for display only; the catalog in the repository is binding.

## Listing your own module

New sources are added by pull request to the website repository [KalypzoSolutions/atrium-website](https://github.com/KalypzoSolutions/atrium-website).

1. Make sure your repository is public on GitHub and contains a valid [catalog](/en/docs/modules#catalog-atrium-modules-json). Test the installation in your own instance.
2. Fork `atrium-website` and add an entry for your source in `src/lib/marketplace.ts`.
3. Choose a unique `id` (lowercase letters, digits and hyphens), descriptions in **German and English** and at least one category from the list above. Leave `official` set to `false` – this flag is reserved for sources from Kalypzo Solutions.
4. Check locally with `npm run build`. The build fails on invalid entries, such as duplicate IDs, links outside `https://github.com`, missing translations or unknown categories.
5. Open a pull request with a short description of your modules. After the merge, the source appears on the marketplace page and in the registry.

An entry looks like this:

```ts
{
	id: 'club-treasury',
	name: 'Club Treasury',
	description: {
		de: 'Kassenbuch, Mitgliedsbeiträge und Belege für Vereine.',
		en: 'Cash book, membership fees and receipts for clubs.'
	},
	repository: 'https://github.com/example-org/atrium-treasury',
	source: 'https://github.com/example-org/atrium-treasury',
	ref: 'main',
	publisher: { name: 'Example Club', url: 'https://github.com/example-org' },
	official: false,
	categories: ['finance'],
	tags: ['treasury', 'fees'],
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

> **Tip:** If you add modules or the folder changes, update the entry by pull request. Atrium always reads the installable modules directly from your repository.

## Next steps

- Install and manage modules: [Managing modules](/en/docs/module-management)
- Write your own module: [Developing modules](/en/docs/modules)
- Limits of the security model: [Security](/en/docs/security)
