---
title: Dashboard, search and notifications
description: Customize the dashboard, find anything with Ctrl+K, choose notifications by email or Web Push, and use Atrium as an app on your phone.
order: 16
section: Administration
source: docs/core-services.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

This page describes the features everyone uses day to day: the dashboard as the start page, global search and notifications. What you see depends on the enabled modules and your own permissions.

## Dashboard

After signing in, the **dashboard** (`/dashboard`) opens – unless the person has chosen a different start page in their profile. It consists of **tiles**: the core provides, for example, “To do”, “This week”, quick links, key figures and recent activity, and modules add their own.

<DocShot name="02-dashboard" lang="en" />

- Everyone only sees tiles of **enabled** modules they have the permissions for. The dashboard therefore adapts to roles automatically.
- If tiles have nothing important to show, the dashboard collapses them into a single “Nothing new in …” line.

### Customizing the dashboard

With **Customize**, everyone can show or hide tiles and change their order – by dragging or with the arrow buttons. Changes are saved immediately; **Restore default** resets the layout. The layout applies to your own account only.

<DocShot name="30-dashboard-customize" lang="en" />

## Global search

<kbd>Ctrl</kbd>+<kbd>K</kbd> or the search box at the top opens the command palette. It finds:

- **pages** – navigation, module pages and every admin area down to individual settings (e.g. “SMTP”, “logo”, “IBAN”),
- **data** – users and roles, plus content from enabled modules that offer search (e.g. members or events).

<DocShot name="15-search" lang="en" />

Use <kbd>↑</kbd> <kbd>↓</kbd> to select a result, <kbd>Enter</kbd> to open it and <kbd>Esc</kbd> to close the search. Results always respect your permissions: each module only returns what you are allowed to see.

> **Tip:** the **Administration** overview also has a search box for settings; <kbd>Enter</kbd> opens the first result directly.

## Notifications

Modules can notify people – about new tasks, messages or shares, for example. Atrium delivers notifications by **email** and **Web Push**.

### Choosing the channel per notification

In **Profile → Notifications**, under “What do I get, and how?”, everyone chooses for each notification: **Off**, **Email**, **Both** or only **Push**. Some notifications additionally offer **Immediately** or **Daily** (a daily summary by email). Mandatory notifications cannot be turned off. Which notifications exist depends on the enabled modules and your permissions.

Atrium bundles several notifications from one operation into **one** email. If push is chosen but not active on any device or turned off system-wide, the notification falls back to email.

### Turning on push on a device

Push notifications appear directly on your phone or computer, even when Atrium isn’t open.

1. In **Profile → Notifications**, under *This device*, click **Turn on push** and allow the browser prompt.
2. Use **Send test** to check delivery.
3. Under *Registered devices* you see and remove your devices (at most 10 per person).

Requirements and specifics:

- **HTTPS** is required (`localhost` counts as secure).
- **iPhone/iPad** (iOS/iPadOS 16.4 or later): push only works if Atrium was added via Safari → **Share** → **Add to Home Screen** and opened from there. The profile tab shows these steps itself.
- **Android:** Chrome, Edge and Firefox support push without installing. The browser menu → **Add to Home screen** opens Atrium like an app.
- If notifications for the site were denied in the browser, allow them in the browser’s site settings and reload the page.

### For administrators

Under **Settings → Notifications** you turn push on or off system-wide and see the number of registered devices (see [Settings](/en/docs/settings#notifications)). Atrium generates the VAPID keys itself; they are stored encrypted in the database and travel with backups. Outbound HTTPS connections to the push services (`fcm.googleapis.com`, `*.push.apple.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`) must be allowed.

## Appearance and start page

In **Profile → Appearance**, everyone can adapt Atrium: theme (suggestions or custom themes with background and accent color), light/dark/system, accent color, language of the interface and emails, density (normal or compact), entries per page (10 to 100) and the **start page** after signing in.

<DocShot name="29b-profile-appearance" lang="en" crop="900" />

## Next steps

- Initial setup and profile: [First steps after installation](/en/docs/first-steps)
- Push and email for the whole system: [Settings](/en/docs/settings)
- Your own tiles, search and notifications in modules: [Developing modules](/en/docs/modules)
