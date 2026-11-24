---
title: Einführung
description: Was Kalypzo Atrium ist, wie Core und Module zusammenspielen und wo Sie in der Dokumentation was finden – der Einstieg in Betrieb und Entwicklung.
order: 1
section: Erste Schritte
source: README.md
---

<script>
	import DocsOverview from '$lib/components/docs/DocsOverview.svelte';
</script>

Kalypzo Atrium ist eine **selbst gehostete, webbasierte Verwaltungsplattform**. Sie besteht aus einem neutralen, zweisprachigen (Deutsch/Englisch) **Core** und **Fachmodulen**, die Sie im laufenden Betrieb unter **Administration → Module** per GitHub-Link oder ZIP-Datei installieren. Technisch ist Atrium ein *modularer Monolith*: ein SvelteKit-Prozess, eine PostgreSQL-Datenbank, klar getrennte Schichten.

<DocsOverview lang="de" />

## Core und Module

Der Core bringt alles mit, was jede Verwaltungsanwendung braucht – aber keine Fachlogik:

- **Anmeldung** mit E-Mail/Passwort und optionaler Zwei-Faktor-Authentifizierung (TOTP, Backup-Codes)
- **Rollen und Berechtigungen** (RBAC) inklusive Einzelrechten am Benutzer
- **Modulverwaltung**: Module installieren, aktivieren, deaktivieren, aktualisieren
- **Einstellungen** in der Oberfläche, Secrets verschlüsselt in der Datenbank
- **REST-API** unter `/api/v1` mit API-Keys und OpenAPI-3.1-Spezifikation
- **Dienste** für PDF (Chromium), KI (OpenAI-kompatibel), Bilder, S3-Speicher, E-Mail sowie Benachrichtigungen per Web Push
- **Hintergrundjobs**, globale Suche, Dashboard, Audit-Log
- **Datensicherung**, Admin-Reset und Datenauskunft nach DSGVO

**Fachmodule** liefern die eigentlichen Anwendungsfälle (z. B. Mitglieder, Kasse, Termine). Sie liegen in eigenen Repositories; das Atrium-Repository enthält bewusst **keine** Fachmodule. Ein Beispiel ist [ep-intern-modules](https://github.com/Stamm-Edelweisspiraten/ep-intern-modules), die Fachmodule der Edelweißpiraten inklusive eines Profil-Moduls für das Erscheinungsbild der Organisation.

> **Hinweis:** Module sind vertrauenswürdiger Code. Sie laufen mit vollen Rechten im Server-Prozess – es gibt keine Sandbox. Installieren Sie nur Module aus Quellen, denen Sie vertrauen.

## Architektur in einem Satz

Atrium ist ein *modularer Monolith*: ein SvelteKit-Prozess, eine PostgreSQL-Datenbank, klar getrennte Schichten. Der Core entdeckt Module zur Build-Zeit, jedes Modul erhält ein eigenes Datenbankschema `mod_<id>`, und seine Rechte wirken nur, solange es aktiv ist. Mehr dazu unter [Architektur](/de/docs/architecture).

## Technologie

| Bereich | Technologie |
|---|---|
| Framework | SvelteKit 2 mit Svelte 5 (Runes), `adapter-node` |
| Sprache | TypeScript (strict) |
| Oberfläche | Tailwind CSS 4, shadcn-svelte (bits-ui), Lucide |
| Datenbank | PostgreSQL 17, Drizzle ORM |
| Authentifizierung | Better Auth (E-Mail/Passwort, 2FA/TOTP) |
| API | REST unter `/api/v1`, OpenAPI 3.1 |
| Validierung | Zod 4 |
| KI | offizielles `openai`-SDK |
| Speicher | S3-kompatibel (AWS S3, Hetzner, Cloudflare R2, Backblaze B2, MinIO …) |
| PDF | Playwright/Chromium (HTML → PDF) |
| Tests | Vitest mit PGlite, Playwright (E2E) |
| Betrieb | Docker Compose, nginx, Dokploy |

## Wo anfangen?

| Sie möchten … | Lesen Sie |
|---|---|
| Atrium lokal ausprobieren | [Schnellstart](/de/docs/quickstart) |
| Atrium auf einem eigenen Server betreiben | [Installation mit Docker Compose](/de/docs/installation) oder [Deployment mit Dokploy](/de/docs/dokploy) |
| eine frische Installation einrichten | [Erste Schritte nach der Installation](/de/docs/first-steps) |
| Konten, Rollen und Einstellungen verwalten | [Benutzer, Rollen und Rechte](/de/docs/users-roles) und [Einstellungen](/de/docs/settings) |
| Module installieren | [Module verwalten](/de/docs/module-management) |
| Daten sichern | [Datensicherung und Wiederherstellung](/de/docs/backup-restore) |
| ein Problem lösen | [Fehlerbehebung](/de/docs/troubleshooting) |
| ein eigenes Modul schreiben | [Module entwickeln](/de/docs/modules) und [Core-Services](/de/docs/core-services) |
| Atrium per Schnittstelle anbinden | [REST-API](/de/docs/api) |

Eine bebilderte Schritt-für-Schritt-Anleitung für die Bedienung finden Sie außerdem in der [Anleitung](/de/anleitung).
