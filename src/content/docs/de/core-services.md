---
title: Core-Services
description: Die Dienste des core-Objekts im Modul-SDK: Rechte, Einstellungen, Datenbank, PDF, KI, Bilder, Speicher, Mail, Benachrichtigungen, Jobs, Suche und Audit.
order: 32
section: Entwickeln
source: docs/core-services.md
---

Serverseitig greifen Module über das `core`-Objekt auf die Dienste der Plattform zu:

```ts
import { core } from '$lib/sdk/server';
```

Alle Operationen erhalten einen **RequestContext** (`ctx`) und prüfen Berechtigungen selbst – in Endpunkten bekommen Sie ihn als Argument, in Seiten als `locals.ctx` (siehe [Architektur](/de/docs/architecture#requestcontext)).

## Fehler

Dienste werfen einen `CoreError` mit `code`, `status`, `message` und `details`. Der API-Router macht daraus automatisch das [einheitliche Fehlerformat](/de/docs/api#antworten-und-fehler).

| Code | Status |
|---|---|
| `bad_request` | 400 |
| `unauthenticated` / `forbidden` | 401 / 403 |
| `not_found`, `module_disabled` | 404 |
| `conflict` | 409 |
| `payload_too_large` | 413 |
| `validation_failed` | 422 |
| `rate_limited` | 429 |
| `unavailable` / `internal_error` | 503 / 500 |

## core.permissions

```ts
await core.permissions.require(ctx, 'members.users.edit'); // wirft unauthenticated/forbidden
core.permissions.has(ctx, 'members.users.view');            // boolean, synchron
await core.permissions.requireAny(ctx, ['a.b.c', 'd.e.f']);
core.permissions.assertCanGrant(ctx, ['members.users.view']); // Schutz vor Rechteausweitung
```

Prüfen Sie in jedem Endpunkt und jeder Action. Die Oberfläche blendet nur aus – maßgeblich ist der Server.

## core.settings

```ts
const name = await core.settings.get<string>('core.system.name');
await core.settings.set(ctx, 'members.welcomeText', 'Willkommen!'); // validiert (Zod), auditiert
const many = await core.settings.getMany(['core.organization.name', 'core.organization.email']);
await core.settings.setMany(ctx, { 'members.a': 1, 'members.b': 2 }); // atomar
```

- Module registrieren Einstellungen in `defineModule({ settings })`; Schlüssel beginnen mit `<id>.`. Ohne eigene Seite erscheinen sie unter **Einstellungen → Module**.
- `secret: true` speichert verschlüsselt (AES-256-GCM). Ein leerer Wert beim Setzen behält den alten, `null` löscht.
- Globale Einstellungen erfordern ihr Schreibrecht (Standard `core.settings.manage`); benutzerspezifische (`scope: 'user'`) nur für das eigene Konto.

## core.database

```ts
await core.database.forModule('members').transaction(async (tx) => {
  // search_path = "mod_members"; tx ist eine Drizzle-Transaktion
});
```

Nur mit der **eigenen** Modul-ID – ESLint meldet fremde IDs. Rufen Sie andere Core-Services (Speicher, Audit, Mail, Benachrichtigungen) nie innerhalb dieser Transaktion auf, sondern davor oder danach.

## core.crypto

```ts
const c = core.crypto.forModule('treasury');  // nur die eigene Modul-ID
const enc = c.encrypt(iban);                   // AES-256-GCM, Schlüssel je Modul aus APP_SECRET
const plain = c.decrypt(enc);
const h = c.hash(normalizedIban);              // HMAC-SHA256, z. B. für Duplikatsuche
```

`hash` ist schlüsselgebunden: Nach einer Wiederherstellung auf einem Server mit anderem `APP_SECRET` passen gespeicherte Hashes nicht mehr. Jede `*_hash`-Spalte braucht deshalb den Hook `backup.rehash` (siehe [Module entwickeln](/de/docs/modules#weitere-hooks-auswahl)).

## core.storage

| Funktion | Beschreibung |
|---|---|
| `upload(ctx, { module, path, file, contentType?, name? })` | Datei ablegen oder ersetzen; Multipart ab 8 MB |
| `download(ctx, { module, path })` / `downloadStream(…)` | Datei lesen, auch als Stream |
| `remove`, `removeMany`, `stat`, `list(ctx, { module, prefix? })` | Verwalten; `list` liefert Dateien und virtuelle Ordner |
| `signedUploadUrl` / `confirmUpload` | Direkter Upload vom Browser in den Bucket, danach Bestätigung |
| `signedDownloadUrl` | Zeitlich begrenzte Download-URL |
| `usage(ctx)`, `purge(…)` | Verbrauch je Modul bzw. alle Dateien eines Moduls löschen |

Für den Zugriff im Namen des Moduls deklarieren Sie die Capability-Rechte `<modul>.storage.read`, `.write` und `.delete`. Grenzen setzen **Max. Dateigröße** und **Erlaubte Dateitypen** aus den Einstellungen; Objekte liegen unter nicht ableitbaren Schlüsseln im Bucket.

## core.pdf

```ts
const pdf = await core.pdf.generate(ctx, {
  title: 'Mitgliederliste',
  content: [
    { type: 'heading', text: 'Übersicht', level: 1 },
    { type: 'table', columns: ['Name', 'Ort'], rows: [['A', 'B']] }
  ],
  format: 'A4',
  orientation: 'portrait',
  module: 'members',
  store: { path: 'documents/liste.pdf' } // optional: direkt im Speicher ablegen
});
// pdf.buffer, pdf.fileName, pdf.stored?
```

- Blocktypen: `heading`, `paragraph`, `list`, `table`, `image`, `box`, `pageBreak` und `richText` (bereinigtes HTML). Alles andere wird HTML-escaped.
- Tabellen unterstützen u. a. `variant: 'grid'`, Spaltenbreiten, Summenzeile und zusammengefasste Zellen (`colspan`, `rowspan`).
- `core.pdf.generateMany` erzeugt mehrere Dokumente und fügt sie zu einem PDF zusammen, `core.pdf.labels` druckt Etiketten (Bögen oder Rollen, mit QR- und Barcodes).
- Briefvorlagen (`brief`, `briefkopf`, `briefkopf-quer`) mit Falzmarken und Adressfeld; `recipient` setzt die Adresszeilen. Profil-Module können sie über `pdfTemplates` ersetzen.
- Chromium rendert ohne JavaScript, externe Requests sind blockiert. Kopf, Fußzeile und Logo kommen aus den [PDF-Einstellungen](/de/docs/settings#pdf).

## core.ai

```ts
const r = await core.ai.generate(ctx, { module: 'members', prompt: '…' });
// r.text, r.usage = { model, inputTokens, outputTokens, estimatedCostUsd }
const obj = await core.ai.generateJson(ctx, { module: 'members', prompt: '…', schema: zodSchema });
for await (const chunk of core.ai.stream(ctx, { module: 'members', prompt: '…' })) {
  // Text-Deltas
}
```

- Berechtigung `<modul>.ai.use` oder `core.ai.manage`; dazu greifen Modul- und Modell-Freigaben, das globale Rate Limit und die Monatslimits je Modul.
- Gespeichert werden nur Zähler (`ai_usage`), keine Prompts oder Antworten.
- `files: [{ module, path }]` übergibt Dateien aus dem Speicher (Bilder, Text, CSV, JSON, PDF) – gelesen mit den Rechten desselben Kontexts.
- Für die Schreibhilfe melden Module Zwecke über `defineModule({ assist })` an; die Oberfläche liefert passende Eingabekomponenten.

## core.images

```ts
const img = await core.images.process(bytes, {
  variants: [
    { name: 'thumb', maxEdge: 480, format: 'webp', quality: 75 },
    { name: 'full', maxEdge: null, format: 'auto', quality: 90 }
  ]
});
// img.width, img.height, img.variants[i] = { name, bytes, contentType, extension, width, height }
```

Erkennt JPEG, PNG, WebP, AVIF und GIF am Inhalt (bis 50 Megapixel und 25 MB), dreht nach EXIF und **entfernt alle Metadaten** inklusive GPS. Varianten werden nie vergrößert. HEIC wird nicht unterstützt. Speichern Sie die Ergebnisse anschließend mit `core.storage`.

## core.mail

```ts
await core.mail.send({ to: 'person@example.org', subject: 'Hallo', text: 'Text …' });
```

- `text` wird zu Absätzen und Links, `html` (optional) ist ein Inhaltsfragment. Jede Mail erhält das [E-Mail-Layout](/de/docs/settings#e-mail-layout) mit Kopf, Signatur und Fußzeile.
- Adresse und Betreff werden gegen Header-Injection geprüft. Es gibt keine Outbox: Schlägt der Versand fehl, entscheidet der Aufrufer über Wiederholungen.
- Für Benachrichtigungen an Konten nutzen Sie besser `core.notifications`.

## core.notifications

Benachrichtigungen an **Benutzerkonten** per E-Mail oder Web Push – die Person wählt den Kanal im Profil.

```ts
// in defineModule
notifications: {
  types: [
    { key: 'task-assigned', label: 'Neue Aufgabe', anyPermission: ['tasks.task.view'] },
    { key: 'inbox-new', label: 'Neue Nachricht', scoped: true, digest: true }
  ]
}

// nach der Modul-Transaktion senden – wirft nie
const r = await core.notifications.send(ctx, 'tasks', [
  { type: 'task-assigned', userIds: [ownerId], title: 'Neue Aufgabe', body: '…', link: '/modules/tasks/…' }
]); // → { email, push, queued, skipped }
```

- Optionen je Typ: `mandatory` (nicht abschaltbar), `pushOnly`, `defaultChannel`, `digest` (Sofort/Täglich) und `scoped` (je Bereich, sichtbar über `forUser`).
- Mehrere Einträge eines Aufrufs werden je Person zu **einer** Mail gebündelt. Ist Push gewählt, aber nicht zustellbar, fällt Atrium auf E-Mail zurück.

## core.audit

```ts
await core.audit.logFromContext(ctx, 'members.member.created', { target: id, metadata: { count: 1 } });
await core.audit.listForModule(ctx, 'members', { targets: [id], limit: 50 });
```

Metadaten werden bereinigt: Schlüssel wie `password`, `secret`, `token` oder `apiKey` werden zu `[redacted]`, personenbezogene Felder entfernt oder maskiert. Schreiben Sie Personen nur als ID in `target`. Aktionsnamen folgen dem Schema `modul.ressource.aktion`.

## core.modules – Dienste anderer Module

```ts
// Anbieter: defineModule({ provides: membersService satisfies MembersService })
const members = await core.modules.use<MembersService>('members', 'actions');
const offices = await core.modules.useOptional<OfficesService>('offices', 'actions'); // null, wenn nicht aktiv
```

`use` prüft, dass der Anbieter in den Abhängigkeiten steht und aktiv ist. Verträge liegen als reine Typen in `modules/<id>/contract.ts` und werden nur per `import type` eingebunden. Rufen Sie Dienste anderer Module nie innerhalb einer offenen Transaktion auf.

## Jobs und Suche

Hintergrundjobs und Suchquellen deklarieren Module direkt in `defineModule`:

```ts
jobs: [
  { id: 'reminders', summary: 'Erinnerungen senden', schedule: 'daily', run: async (ctx) => 'OK' }
],
search: {
  permission: 'members.member.view',
  run: async (ctx, query, limit) => [/* { id, title, subtitle?, href, icon?, type } … */]
}
```

Jobs laufen nur für aktive Module im Systemkontext (siehe [Architektur](/de/docs/architecture#hintergrundjobs)). Eine Suchquelle filtert selbst nach Freigaben und liefert nur sichtbare Felder und relative Links; Fehler einer Quelle überspringt die globale Suche.

## Weitere Helfer

- `core.users.directory(ctx, { search })` – aktive Konten (ID, Name, E-Mail) für Auswahlfelder, ab 2 Zeichen, höchstens 30 Treffer.
- `core.roles.directory(ctx, { search })` – Rollenverzeichnis, ebenfalls ohne besonderes Recht.
- `core.qr.dataUrl(text)` – QR-Code als PNG-`data:`-URL, z. B. für den PDF-Bildblock.
- `core.app.origin()` – öffentliche Basis-URL (`ORIGIN`), z. B. für Links in E-Mails.

> **Hinweis:** `core.system` (Zurücksetzen), die Datensicherung und die Datenauskunft sind nicht für Module bestimmt. Module beteiligen sich über die Hooks `resetAreas`, `backup.rehash` und `subjectExport`.

## Nächste Schritte

- Ein Modul aufsetzen: [Module entwickeln](/de/docs/modules)
- Endpunkte und Fehlerformat: [REST-API](/de/docs/api)
