---
title: Settings
description: Every tab under Administration → Settings – from organization and design to email, storage, AI, PDF and modules.
order: 12
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Everything business-related – email, storage, AI, PDF, appearance – is configured in the interface under **Administration → Settings**. The values live in the database; credentials are stored encrypted and never sent back to the browser. You only need environment variables for what must be fixed before startup (see [Configuration](/en/docs/configuration)).

## How settings work

- **Tabs:** General, Design, Email delivery, Email layout, Storage, Notifications, AI, PDF and Modules. You only see the tabs you have permissions for.
- **Search instead of clicking:** the search box on the `/admin` overview and global search (<kbd>Ctrl</kbd>+<kbd>K</kbd>) find individual settings directly, e.g. “SMTP”, “logo” or “IBAN”.
- **Permissions:** viewing requires `core.settings.view`, changing requires `core.settings.manage`. The Storage tab requires `core.storage.manage`, the AI tab `core.ai.view` or `core.ai.manage`, the PDF templates `core.pdf.manage`.
- **Secrets:** a stored password or key is only shown as “set – leave empty to keep”. If you leave the field empty, the old value stays.
- **Secrets follow their target:** if you change the SMTP host, port or user, the AI base URL or the S3 endpoint, Atrium discards the related secret – unless you enter it again in the same save. The message names what needs to be re-entered. This prevents redirecting a stored password to a foreign server.
- Every change is recorded in the [audit log](/en/docs/privacy#audit-log); for secrets only the fact that something changed.

## Organization and appearance

### General

<DocShot name="05-settings" lang="en" caption="Settings → General: system and organization." />

| Field | Meaning |
|---|---|
| **System name** | Name of the application, e.g. in the sidebar and the browser title; also used in PDFs and emails if no organization is entered |
| **Language** | Language for everyone who hasn’t chosen their own. “Automatic” follows the browser language (otherwise German). |
| **Name for “everyone”** | What sharing with all people is called, e.g. “Club” or “Team” |
| **Organization, address, contact email, phone** | Used in letters, PDF header and footer, and the email layout |
| **Privacy policy (URL), legal notice (URL)** | Links in the footer of the sign-in page and all public pages. If a link is missing, the page points it out. |
| **Notify users when an administrator acts as them** | Email to the person when “Act as user” starts |

### Retention periods

Also on the **General** tab, you set how long logs are kept. The daily job `core.housekeeping` enforces these periods. Set them to match your record of processing activities (background under [Privacy → Retention periods](/en/docs/privacy#retention-periods)):

| Setting | Default | Effect |
|---|---|---|
| Keep API log | 30 days (1–3650) | older entries of the API access log are deleted |
| Keep IP addresses in the audit log | 90 days (1–3650) | the IP is removed from audit entries, the entry stays |
| Keep audit log | 730 days (0 = never, otherwise ≥ 30) | older audit entries are deleted |

### Design

<DocShot name="17-settings-design" lang="en" />

- **Accent color:** color for buttons and highlights. Atrium shows the text contrast on primary buttons and warns below 4.5 : 1.
- **App icon background:** fill color behind the logo for app icons on the home screen (iOS, Android).
- **Logo:** PNG, JPEG or WebP, can be cropped after upload (square works best). The logo appears in PDFs, the sidebar, the sign-in page, as the favicon and as the app icon. Uploading requires configured [storage](#storage) and write access to it.

Everyone can additionally choose their own theme and accent color under *Appearance* in their profile (see [Appearance and start page](/en/docs/search-dashboard#appearance-and-start-page)).

## Email

### Email delivery

Atrium sends all emails through this SMTP server: password links, invitations, notifications and the modules’ emails.

<DocShot name="06-settings-mail" lang="en" />

| Field | Note |
|---|---|
| **SMTP host**, **SMTP port** | e.g. `smtp.example.org` and `587` |
| **Direct TLS (port 465)** | enable for port 465. With authentication, STARTTLS is mandatory on other ports – otherwise sending aborts. |
| **SMTP user**, **SMTP password** | sign-in to the mail server; the password is stored encrypted |
| **Sender address** | e.g. `Atrium <noreply@example.org>` |

Save first, then send a message under **Test email**. If delivery fails, the interface deliberately reports only a generic error – the details (host, port, server response) are in the server log.

### Email layout

If you like, every outgoing email gets a consistent layout: a header with your logo and organization name, the content, a signature and a footer.

<DocShot name="18-settings-mail-layout" lang="en" crop="1180" />

- **Use the organization layout for emails** turns the layout on or off.
- **Show emblem in the header** applies when an enabled profile module provides an emblem.
- **Signature** (e.g. “Best regards”) and **Footer** (small print, e.g. registration details) – empty means none.
- The **preview** shows a sample email with the saved values; after saving, reload the preview. The accent color comes from *Design*.

## Storage and services

### Storage

Atrium stores files, receipts, images and logos in S3-compatible object storage (AWS S3, Hetzner Object Storage, Cloudflare R2, Backblaze B2, MinIO …).

<DocShot name="07-settings-storage" lang="en" crop="900" />

| Field | Note |
|---|---|
| **S3 endpoint** | empty = AWS S3; otherwise e.g. `https://fsn1.your-objectstorage.com` |
| **Region** | e.g. `fsn1`, `eu-central-1`, `auto` for Cloudflare R2 |
| **Bucket** | name of the bucket – keep it private |
| **Access key ID**, **Secret access key** | access to this bucket only (read, write, delete, list) |
| **Path-style URLs (MinIO)** | enable for MinIO and providers without virtual host names |
| **Max. file size (MB)** | limit per file (default 50 MB); at most the server’s 110 MB apply |
| **Allowed file types** | empty = default list (PDF, images, text, ZIP, Office/OpenDocument; no macro formats, HTML/SVG only explicitly) |

**Test connection** checks the credentials and bucket. Below it, *Storage usage per module* shows how many files and bytes each module uses.

> **Note:** If browsers upload files directly through signed URLs, the bucket’s CORS configuration must allow your `ORIGIN` for `PUT`.

### Notifications

Here you turn **Web Push** on or off system-wide and see the number of registered devices. Everyone then chooses in their profile what they get by email, push or both; with push off, everything arrives by email. How people set this up is described in [Notifications](/en/docs/search-dashboard#notifications).

<DocShot name="19-settings-notifications" lang="en" />

- Atrium generates the **VAPID keys** automatically when first needed; the private key is stored encrypted in the database and travels with [backups](/en/docs/backup-restore).
- Only use **Regenerate keys** if the key may have fallen into the wrong hands – afterwards everyone has to re-enable push on their devices.
- The server needs outbound HTTPS connections to the push services (`fcm.googleapis.com`, `*.push.apple.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`).

### AI

Atrium connects to an OpenAI-compatible AI service that modules use, for example for the **writing assistant**.

<DocShot name="20-settings-ai" lang="en" crop="1000" />

**Configuration:**

| Field | Note |
|---|---|
| **OpenAI API key** | stored encrypted, never leaves the server |
| **API base URL (optional)** | for other OpenAI-compatible providers |
| **Default model** | e.g. `gpt-4o-mini` |
| **Allowed models**, **Modules with AI access** | one entry per line; empty = all |
| **Monthly token limit** and **cost limit per module** | 0 = unlimited |
| **Max. requests per minute (total)** | global rate limit |
| **Prices per 1M tokens** | basis for the estimated costs |

**Writing assistant:** token limit per person and month, default form of address (du, ihr, Sie), tone, closing, a short “who is writing?” description and further style notes. Two switches – sending received emails for reply drafts and gallery images for image descriptions – are off by default.

At the top, the page shows **usage** this month and per module. Only counters are stored (requests, tokens, estimated costs) – **no prompts and no responses**.

> **Privacy:** everything modules send to the AI goes to the configured provider – possibly outside the EU. What to settle before turning it on is described under [AI and data minimization](/en/docs/privacy#ai-and-data-minimization).

### PDF

Atrium generates PDFs on the server with Chromium – for lists, letters and module exports.

<DocShot name="08-settings-pdf" lang="en" />

- **Default page size** and **default orientation** (portrait or landscape), **margins** top, right, bottom and left.
- **Header (right)**, **Footer (center)** and **Logo in the header**.
- The **letter templates** (`brief`, `briefkopf`, `briefkopf-quer`) are shown with a page preview; a test PDF shows the result with the current settings. An enabled profile module can replace them; the card then names the replacing module.

## Modules

The **Modules** tab collects the settings of all enabled modules that don’t bring their own settings form. If a module has its own settings page, only a link to it appears here. Without enabled modules with settings, the tab is empty.

In addition, **Modules → Install** has two settings for module installation: an optional **GitHub token** and the **Allowed sources** list (see [Managing modules](/en/docs/module-management#github-token-and-allowed-sources)).

## Pre-filling on first start

For automated setups, storage and email can be pre-filled through environment variables (`S3_*`, `SMTP_*`). This is only a **starting value**: it is applied while the setting in the database is still empty. Afterwards only the **value in the database** applies – what you set here. The variables are listed under [Configuration](/en/docs/configuration#initial-storage-and-email-settings).

## Next steps

- Add and configure modules: [Managing modules](/en/docs/module-management)
- Push and notifications for people: [Dashboard, search and notifications](/en/docs/search-dashboard)
- Security of secrets and `APP_SECRET`: [Security](/en/docs/security)
