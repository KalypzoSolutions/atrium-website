---
title: Core services
description: The services of the core object in the module SDK – permissions, data, documents, AI, communication, audit and jobs.
order: 32
section: Development
source: docs/core-services.md
---

On the server, modules access the platform’s services through the `core` object:

```ts
import { core } from '$lib/sdk/server';
```

Every operation receives a **RequestContext** (`ctx`) and checks permissions itself – endpoints get it as an argument, pages as `locals.ctx` (see [Architecture](/en/docs/architecture#requestcontext)).

| Area | Services |
|---|---|
| [Permissions and settings](#permissions-and-settings) | `core.permissions`, `core.settings` |
| [Data and files](#data-and-files) | `core.database`, `core.crypto`, `core.storage` |
| [Documents, images and AI](#documents-images-and-ai) | `core.pdf`, `core.ai`, `core.images` |
| [Communication](#communication) | `core.mail`, `core.notifications` |
| [Audit and integration](#audit-and-integration) | `core.audit`, `core.modules`, jobs and search |
| [Further helpers](#further-helpers) | `core.users`, `core.roles`, `core.qr`, `core.app` |

## Errors

Services throw a `CoreError` with `code`, `status`, `message` and `details`. The API router automatically turns it into the [uniform error format](/en/docs/api#responses-and-errors), where you'll also find the table of all error codes with their HTTP status.

## Permissions and settings

### core.permissions

```ts
await core.permissions.require(ctx, 'members.users.edit'); // throws unauthenticated/forbidden
core.permissions.has(ctx, 'members.users.view');            // boolean, synchronous
await core.permissions.requireAny(ctx, ['a.b.c', 'd.e.f']);
core.permissions.assertCanGrant(ctx, ['members.users.view']); // privilege escalation guard
```

Check in every endpoint and action. The interface only hides things – the server is what counts.

### core.settings

```ts
const name = await core.settings.get<string>('core.system.name');
await core.settings.set(ctx, 'members.welcomeText', 'Welcome!'); // validated (Zod), audited
const many = await core.settings.getMany(['core.organization.name', 'core.organization.email']);
await core.settings.setMany(ctx, { 'members.a': 1, 'members.b': 2 }); // atomic
```

- Modules register settings in `defineModule({ settings })`; keys start with `<id>.`. Without their own page they appear under **Settings → Modules**.
- `secret: true` stores encrypted (AES-256-GCM). An empty value when setting keeps the old one, `null` deletes it.
- Global settings require their write permission (default `core.settings.manage`); user-specific ones (`scope: 'user'`) only for your own account.

## Data and files

### core.database

```ts
await core.database.forModule('members').transaction(async (tx) => {
  // search_path = "mod_members"; tx is a Drizzle transaction
});
```

Only with your **own** module ID – ESLint reports foreign IDs. Never call other core services (storage, audit, mail, notifications) inside this transaction; call them before or after.

### core.crypto

```ts
const c = core.crypto.forModule('treasury');  // your own module ID only
const enc = c.encrypt(iban);                   // AES-256-GCM, per-module key derived from APP_SECRET
const plain = c.decrypt(enc);
const h = c.hash(normalizedIban);              // HMAC-SHA256, e.g. for duplicate detection
```

`hash` is key-bound: after a restore on a server with a different `APP_SECRET`, stored hashes no longer match. Every `*_hash` column therefore needs the `backup.rehash` hook (see [Developing modules](/en/docs/modules#more-hooks-selection)).

### core.storage

| Function | Description |
|---|---|
| `upload(ctx, { module, path, file, contentType?, name? })` | Store or replace a file; multipart from 8 MB |
| `download(ctx, { module, path })` / `downloadStream(…)` | Read a file, also as a stream |
| `remove`, `removeMany`, `stat`, `list(ctx, { module, prefix? })` | Manage files; `list` returns files and virtual folders |
| `signedUploadUrl` / `confirmUpload` | Direct upload from the browser to the bucket, then confirmation |
| `signedDownloadUrl` | Time-limited download URL |
| `usage(ctx)`, `purge(…)` | Usage per module, or delete all files of a module |

To access storage on behalf of the module, declare the capability permissions `<module>.storage.read`, `.write` and `.delete`. Limits come from **Max. file size** and **Allowed file types** in the settings; objects are stored under non-derivable keys in the bucket.

## Documents, images and AI

### core.pdf

```ts
const pdf = await core.pdf.generate(ctx, {
  title: 'Member list',
  content: [
    { type: 'heading', text: 'Overview', level: 1 },
    { type: 'table', columns: ['Name', 'City'], rows: [['A', 'B']] }
  ],
  format: 'A4',
  orientation: 'portrait',
  module: 'members',
  store: { path: 'documents/list.pdf' } // optional: store directly in storage
});
// pdf.buffer, pdf.fileName, pdf.stored?
```

- Block types: `heading`, `paragraph`, `list`, `table`, `image`, `box`, `pageBreak` and `richText` (sanitized HTML). Everything else is HTML-escaped.
- Tables support `variant: 'grid'`, column widths, a total row and merged cells (`colspan`, `rowspan`), among other things.
- `core.pdf.generateMany` creates several documents and merges them into one PDF; `core.pdf.labels` prints labels (sheets or rolls, with QR and barcodes).
- Letter templates (`brief`, `briefkopf`, `briefkopf-quer`) with fold marks and an address field; `recipient` sets the address lines. Profile modules can replace them through `pdfTemplates`.
- Chromium renders without JavaScript and with external requests blocked. Header, footer and logo come from the [PDF settings](/en/docs/settings#pdf).

### core.ai

```ts
const r = await core.ai.generate(ctx, { module: 'members', prompt: '…' });
// r.text, r.usage = { model, inputTokens, outputTokens, estimatedCostUsd }
const obj = await core.ai.generateJson(ctx, { module: 'members', prompt: '…', schema: zodSchema });
for await (const chunk of core.ai.stream(ctx, { module: 'members', prompt: '…' })) {
  // text deltas
}
```

- Permission `<module>.ai.use` or `core.ai.manage`; module and model allow-lists, the global rate limit and the monthly limits per module apply on top.
- Only counters are stored (`ai_usage`), no prompts or responses.
- `files: [{ module, path }]` passes files from storage (images, text, CSV, JSON, PDF) – read with the permissions of the same context.
- For the writing assistant, modules register purposes via `defineModule({ assist })`; the UI provides matching input components.

### core.images

```ts
const img = await core.images.process(bytes, {
  variants: [
    { name: 'thumb', maxEdge: 480, format: 'webp', quality: 75 },
    { name: 'full', maxEdge: null, format: 'auto', quality: 90 }
  ]
});
// img.width, img.height, img.variants[i] = { name, bytes, contentType, extension, width, height }
```

Detects JPEG, PNG, WebP, AVIF and GIF by content (up to 50 megapixels and 25 MB), rotates according to EXIF and **strips all metadata** including GPS. Variants are never upscaled. HEIC is not supported. Store the results afterwards with `core.storage`.

## Communication

### core.mail

```ts
await core.mail.send({ to: 'person@example.org', subject: 'Hello', text: 'Text …' });
```

- `text` becomes paragraphs and links, `html` (optional) is a content fragment. Every email gets the [email layout](/en/docs/settings#email-layout) with header, signature and footer.
- Address and subject are checked against header injection. There is no outbox: if sending fails, the caller decides about retries.
- For notifications to accounts, prefer `core.notifications`.

### core.notifications

Notifications to **user accounts** by email or Web Push – the person chooses the channel in their profile.

```ts
// in defineModule
notifications: {
  types: [
    { key: 'task-assigned', label: 'New task', anyPermission: ['tasks.task.view'] },
    { key: 'inbox-new', label: 'New message', scoped: true, digest: true }
  ]
}

// send after the module transaction – never throws
const r = await core.notifications.send(ctx, 'tasks', [
  { type: 'task-assigned', userIds: [ownerId], title: 'New task', body: '…', link: '/modules/tasks/…' }
]); // → { email, push, queued, skipped }
```

- Per-type options: `mandatory` (cannot be turned off), `pushOnly`, `defaultChannel`, `digest` (immediately/daily) and `scoped` (per area, visible through `forUser`).
- Several entries of one call are bundled into **one** email per person. If push is chosen but can’t be delivered, Atrium falls back to email.

## Audit and integration

### core.audit

```ts
await core.audit.logFromContext(ctx, 'members.member.created', { target: id, metadata: { count: 1 } });
await core.audit.listForModule(ctx, 'members', { targets: [id], limit: 50 });
```

Metadata is sanitized: keys such as `password`, `secret`, `token` or `apiKey` become `[redacted]`, personal fields are removed or masked. Only write people as an ID in `target`. Action names follow the `module.resource.action` scheme.

### core.modules – services of other modules

```ts
// provider: defineModule({ provides: membersService satisfies MembersService })
const members = await core.modules.use<MembersService>('members', 'actions');
const offices = await core.modules.useOptional<OfficesService>('offices', 'actions'); // null if not enabled
```

`use` checks that the provider is listed in the dependencies and enabled. Contracts live as pure types in `modules/<id>/contract.ts` and are only imported with `import type`. Never call other modules’ services inside an open transaction.

### Jobs and search

Modules declare background jobs and search sources directly in `defineModule`:

```ts
jobs: [
  { id: 'reminders', summary: 'Send reminders', schedule: 'daily', run: async (ctx) => 'OK' }
],
search: {
  permission: 'members.member.view',
  run: async (ctx, query, limit) => [/* { id, title, subtitle?, href, icon?, type } … */]
}
```

Jobs only run for enabled modules, in the system context (see [Architecture](/en/docs/architecture#background-jobs)). A search source filters by sharing itself and only returns visible fields and relative links; global search skips a source that fails.

## Further helpers

- `core.users.directory(ctx, { search })` – active accounts (ID, name, email) for pickers, from 2 characters, at most 30 results.
- `core.roles.directory(ctx, { search })` – role directory, likewise without a special permission.
- `core.qr.dataUrl(text)` – a QR code as a PNG `data:` URL, e.g. for the PDF image block.
- `core.app.origin()` – the public base URL (`ORIGIN`), e.g. for links in emails.

> **Note:** `core.system` (reset), backups and data export are not meant for modules. Modules take part through the `resetAreas`, `backup.rehash` and `subjectExport` hooks.

## Next steps

- Set up a module: [Developing modules](/en/docs/modules)
- Endpoints and error format: [REST API](/en/docs/api)
