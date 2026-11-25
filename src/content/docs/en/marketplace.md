---
title: Module marketplace
description: Find module sources in the Atrium marketplace, install them from a GitHub link, use the public registry for instances and list your own modules.
order: 13.5
section: Administration
---

The [marketplace](/en/marketplace) is a public overview of **module sources** for Atrium – GitHub repositories that contain one or more business modules. You can search by name, description and tags, filter by category and copy a source's GitHub link with one click. Installation happens as usual in your own Atrium instance under **Administration → Modules → Install** (see [Managing modules](/en/docs/module-management)).

The same data is also published as a machine-readable [registry](#registry-for-atrium-instances), so Atrium instances and other tools can fetch the list themselves – much like an app store.

> **Warning:** Being listed in the marketplace is **not a security review**. After installation, module code runs with **full privileges** in the server process, without a sandbox. Review every source yourself and only install modules you trust. Entries marked **Official** come from Kalypzo Solutions.

## What the marketplace shows

Each entry describes one source:

- name, description and publisher (marked **Official** for sources from Kalypzo Solutions),
- categories and tags, license and an optional project page,
- the modules it contains, with name and short description,
- the GitHub link you paste into Atrium.

The module list is for orientation only. The authoritative catalog is the source's own `atrium-modules.json`: Atrium reads it during installation and shows the actual state with version and pinned commit.

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

1. Open the [marketplace](/en/marketplace) and find the source you want, e.g. with the search or a category filter.
2. Check the publisher, repository and license. If in doubt, open the repository on GitHub and look at the code.
3. Click **Copy link**. The source's GitHub link is now on your clipboard.
4. Sign in to your Atrium instance as an administrator and open **Administration → Modules → Install**.
5. Paste the link into the GitHub link field and click **Load source**.
6. Select the modules you want and click **Show preview**. Review permissions, migrations, npm packages and the import scan notes.
7. Confirm **I have checked the source and trust it.**, enter your password (and 2FA code, if enabled) and click **Install**.
8. After the rebuild, enable the modules in the **Installed** tab.

Steps 5 to 8 are described in detail under [Managing modules](/en/docs/module-management). The marketplace bypasses neither the preview, the trust confirmation nor the password and 2FA check.

> **Tip:** If you have configured a list under **Allowed sources**, Atrium only accepts the repositories listed there – even if a source is in the marketplace. Add the source there first (see [GitHub token and allowed sources](/en/docs/module-management#github-token-and-allowed-sources)).

## Registry for Atrium instances

During the build, the marketplace is also published as a static JSON file:

```text
GET https://atrium.kalypzo.de/marketplace/v1/index.json
```

The file is public, needs no authentication, allows CORS from any origin (`Access-Control-Allow-Origin: *`) and is cached for 15 minutes. The version in the path (`v1`) and the `schema` field only change for **incompatible** changes; new fields may be added at any time.

### Fields

| Field | Type | Meaning |
|---|---|---|
| `schema` | number | Format version, currently `1` |
| `generatedAt` | timestamp | Build time (ISO 8601, UTC) |
| `site` | URL | Base URL of the website |
| `marketplace.de` / `marketplace.en` | URL | Marketplace page per language |
| `sources[]` | list | Listed module sources |
| `sources[].id` | text | Unique, stable ID of the source |
| `sources[].name` | text | Display name |
| `sources[].description.de` / `.en` | text | Description per language |
| `sources[].repository` | URL | GitHub repository |
| `sources[].source` | URL | Link to paste into Atrium (repository or folder) |
| `sources[].ref` | text | optional: branch or tag |
| `sources[].path` | text | optional: folder in the repository |
| `sources[].publisher.name` / `.url` | text / URL | Publisher |
| `sources[].official` | boolean | `true` for sources from Kalypzo Solutions |
| `sources[].categories` | list | Categories (see table above) |
| `sources[].tags` | list | Free-form tags |
| `sources[].license` | text | optional: SPDX license identifier, e.g. `MIT` |
| `sources[].homepage` | URL | optional: project page |
| `sources[].modules[]` | list | Contained modules (informational only) with `id`, `name` and `description` per language |
| `sources[].addedAt` | date | Day the source was added to the marketplace |

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
- **Never install automatically:** The registry only provides suggestions. Installation always goes through the normal preview with trust confirmation, password and 2FA if enabled.
- **Allowed sources still apply:** A configured list of allowed sources (allowlist) takes precedence over the marketplace.
- **The source's catalog is authoritative:** The `modules` data is for display only; `atrium-modules.json` in the repository is binding.

## Listing your own module

New sources are added by pull request to the website repository [KalypzoSolutions/atrium-website](https://github.com/KalypzoSolutions/atrium-website).

1. Make sure your repository is public on GitHub and contains a valid `atrium-modules.json` catalog (see [Developing modules](/en/docs/modules)). Test the installation in your own instance.
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

> **Tip:** Keep your entry up to date. If you add modules or the folder changes, update the entry by pull request. Atrium always reads the installable modules directly from your repository.

## Next steps

- Install and manage modules: [Managing modules](/en/docs/module-management)
- Write your own module: [Developing modules](/en/docs/modules)
- Open the marketplace: [Marketplace](/en/marketplace)
