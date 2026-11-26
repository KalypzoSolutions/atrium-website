---
title: Module marketplace
description: Find module sources in the marketplace, use the public registry and list your own modules.
order: 13.5
section: Administration
---

The [marketplace](/en/marketplace) is a public overview of **module sources** for Atrium – GitHub repositories with one or more feature modules. You can browse whole **packages** (module sources) or **individual modules**, open a dedicated [detail page](#detail-pages) for every package and module, search by name, description and tags, filter by category and copy the GitHub link of a package or of a single module. The same data is available as a machine-readable [registry](#registry-for-atrium-instances), so Atrium instances and other tools can fetch the list themselves.

> **Warning:** Being listed in the marketplace is **not a security review**. After installation, module code runs with full privileges in the server process (see [Managing modules](/en/docs/module-management)). Review every source yourself. Only sources from Kalypzo Solutions are marked **Official**.

## What the marketplace shows

Above the list, you choose between two views:

| View | Shows |
|---|---|
| **Packages** | Each module source (a repository with several modules) as its own card |
| **Individual modules** | Each module of all sources as its own card |

Search, categories and **Official only** apply in both views. Without JavaScript, the page only shows the package view.

### Packages

Each card describes one source:

- name, description and publisher, marked **Official** where applicable,
- categories, tags, license and an optional project page,
- the modules it contains, with name and short description, each linking to the module page,
- the GitHub link you paste into Atrium.

Clicking the package name or **Details** opens the package page.

### Individual modules

Each card describes one module:

- the module's name, version (if known) and description and a **from package** reference with the source's name,
- the publisher, the **Official** mark where applicable, and the categories – the module inherits both from its source,
- its own installation link with **Copy link**,
- a link to the module's folder on GitHub.

Clicking the module name or **Details** opens the module page; **from package** jumps to the source's card in the package view.

Here, search covers the module ID, module name and description, package name, publisher, tags and categories. The website search also finds packages and individual modules and opens their detail page directly.

### Detail pages

Every package and every module has its own page with a stable address:

| Page | Address |
|---|---|
| Package | `/en/marketplace/<source-id>` or `/de/marktplatz/<source-id>` |
| Module | `/en/marketplace/<source-id>/<module-id>` or `/de/marktplatz/<source-id>/<module-id>` |

Besides the details from the card, the package page shows the repository's README and all modules it contains. The module page also shows what the module's manifest declares – such as version, required core version, dependencies and permissions –, the previous versions and the module's README and images, where available. This information comes from a [snapshot](#source-snapshot) that is built into the website; it reflects the last synchronisation, not necessarily the current state of the repository.

All detail pages are listed in the sitemap.

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

You can install either a **whole package** or an **individual module**:

| Link | Atrium offers |
|---|---|
| Package (**Packages** view) | All modules of the source; you select the ones you want |
| Individual module (**Individual modules** view) | Only this module |

1. Find the package or module you want in the [marketplace](/en/marketplace) and check the publisher, repository and license.
2. Click **Copy link** on its card.
3. Paste the link in your Atrium instance under **Administration → Modules → Install** and continue as described in [Installing modules](/en/docs/module-management#installing-modules).

The marketplace only provides the link; the preview and confirmation of the installation stay the same. If a module needs other modules, the preview shows these dependencies. If a dependency cannot be resolved, the installation is blocked and the preview states the reason.

> **Tip:** If a module depends on other modules from the same package, use the package link instead and select the required modules together.

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
| `sources[].modules[]` | List | Contained modules with `id`, `name` and `description` per language plus `source` (display only) |
| `sources[].modules[].source` | URL | Link to paste into Atrium for this individual module (the module's folder) |
| `sources[].modules[].page.de` / `.en` | URL | Detail page of the module per language |
| `sources[].page.de` / `.en` | URL | Detail page of the source per language |
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

### Fetching with curl

```bash
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json

# only IDs and links of the sources (with jq)
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json \
  | jq -r '.sources[] | "\(.id)\t\(.source)"'

# IDs and links of all individual modules (with jq)
curl -s https://atrium.kalypzo.de/marketplace/v1/index.json \
  | jq -r '.sources[].modules[] | "\(.id)\t\(.source)"'
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
4. Check locally with `npm run build`. The build fails on invalid entries, such as duplicate IDs, links outside `https://github.com` (the short form `github:…` is not allowed either), `official: true` outside KalypzoSolutions, missing translations, unknown categories or a module `source` that does not start with `https://github.com/` or does not point into the source's repository.
5. Optionally run `npm run sync:marketplace` to create the [snapshot](#source-snapshot) for the detail pages and commit it as well.
6. Open a pull request with a short description of your modules. After the merge, the source appears on the marketplace page, with its own detail pages, and in the registry.

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

The website builds the installation links of individual modules automatically from `repository`, `ref` (default `main`), `path` and the module ID: `<repository>/tree/<ref>/<path>/<module-id>`. In the example without `path`, this gives `https://github.com/example-org/atrium-treasury/tree/main/treasury`. If a module lives in a different folder, set a `source` field in the module entry:

```ts
{
	id: 'treasury',
	name: { de: 'Kasse', en: 'Treasury' },
	description: { de: 'Einnahmen und Ausgaben erfassen.', en: 'Track income and expenses.' },
	source: 'https://github.com/example-org/atrium-treasury/tree/main/packages/treasury'
}
```

> **Tip:** If you add modules or the folder changes, update the entry by pull request. Atrium always reads the installable modules directly from your repository.

### Source snapshot

The website does not fetch READMEs, manifests, versions and images for the [detail pages](#detail-pages) from GitHub on each request; it reads them from a snapshot stored in the website repository. Create the snapshot with:

```bash
npm run sync:marketplace

# optionally with a token for a higher GitHub API limit
GITHUB_TOKEN=ghp_… npm run sync:marketplace
```

For each source in `src/lib/marketplace.ts`, the script reads the current commit of `ref`, the catalog and the manifests of the listed modules and stores the results as follows:

| Location | Content |
|---|---|
| `src/content/marketplace/<source-id>/source.json` | Commit, time of synchronisation and the source's catalog |
| `src/content/marketplace/<source-id>/README.md` | The repository's README (if present) |
| `src/content/marketplace/<source-id>/modules/<module-id>.json` | The module's manifest, versions (from the manifest's Git history) and images |
| `src/content/marketplace/<source-id>/modules/<module-id>.md` | The module's README (if present) |
| `static/marketplace/<source-id>/<module-id>/…` | Module images from `screenshots/` and from the README (at most 5 MB per file) |

Each run replaces a source's snapshot completely. Modules not listed in `src/lib/marketplace.ts` are skipped. Commit the changed files together with your entry; without a snapshot, the detail pages only show the information from `src/lib/marketplace.ts`.

> **Note:** READMEs are converted to safe HTML during the build. Raw HTML and images from external servers are not shown; embed images with a relative path from the module folder.

## Next steps

- Install and manage modules: [Managing modules](/en/docs/module-management)
- Write your own module: [Developing modules](/en/docs/modules)
- Limits of the security model: [Security](/en/docs/security)
