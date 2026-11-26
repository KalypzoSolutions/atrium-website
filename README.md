# Kalypzo Atrium – Website

Produktwebsite und Dokumentation für [Kalypzo Atrium](https://github.com/KalypzoSolutions/kalypzo-atrium), die modulare, selbst gehostete Verwaltungsplattform.

**Live:** <https://atrium.kalypzo.de> · Sprachen: Deutsch (`/de`) und Englisch (`/en`)

## Technik

- **SvelteKit 2** + **Svelte 5** mit `@sveltejs/adapter-static`: Alle Seiten werden beim Build vorgerendert (kein Node-Server zur Laufzeit).
- **Tailwind CSS 4** (inkl. `@tailwindcss/typography`)
- **mdsvex** für die Doku in Markdown, Syntax-Highlighting mit **Shiki** (helles und dunkles Theme)
- **nginx** (`nginx-unprivileged`, läuft ohne Root) liefert den Build im Docker-Container aus, inklusive vorkomprimierter `.gz`-Dateien, Cache-Regeln und Sicherheits-Headern
- SEO: Canonical- und `hreflang`-Links, JSON-LD, `sitemap.xml`, `robots.txt`, Open-Graph-Bild, Web-App-Manifest

## Lokale Entwicklung

Voraussetzung: Node.js ≥ 22 (empfohlen: 24).

```bash
npm install        # Abhängigkeiten installieren
npm run dev        # Entwicklungsserver auf http://localhost:5173
npm run build      # statischen Build nach build/ erzeugen
npm run preview    # Build lokal ansehen
npm run check      # Typprüfung (svelte-check)
```

Die Basis-URL für Canonical-Links, hreflang, Sitemap und robots.txt kommt aus `PUBLIC_SITE_URL` (Standard: `https://atrium.kalypzo.de`). Für abweichende Umgebungen `.env.example` nach `.env` kopieren und anpassen.

## Struktur

```
src/
  app.html                    HTML-Grundgerüst (Theme-Skript, Icons, Manifest)
  app.css                     Tailwind und Design-Tokens (Markenfarben)
  lib/
    config.ts                 SITE_URL, Sprachen, Slugs, GitHub-Links
    marketplace.ts            Einträge des Modul-Marktplatzes (mit Build-Validierung)
    i18n/                     UI-Texte (de/en)
    components/               Header, Footer, Landing-Abschnitte, Screenshot …
    seo/                      Seo-Komponente (Meta, hreflang, JSON-LD)
  content/docs/{de,en}/*.md   Dokumentationsseiten (Markdown)
  routes/
    +page.svelte              "/" -> leitet auf /de oder /en weiter
    [lang=lang]/              Startseite, Anleitung (/de/anleitung, /en/guide), Doku (/{lang}/docs/…),
                              Marktplatz (/de/marktplatz, /en/marketplace)
    marketplace/v1/index.json Öffentliche Registry des Marktplatzes (wird vorgerendert)
    sitemap.xml/+server.ts    Sitemap (wird vorgerendert)
    robots.txt/+server.ts     robots.txt (wird vorgerendert)
static/                       Favicon, Icons, og-image.png, site.webmanifest, screenshots/
scripts/screenshots.mjs       Screenshots einer laufenden Atrium-Instanz erzeugen
deploy/nginx.conf             nginx-Server-Konfiguration
deploy/security-headers.conf  Sicherheits-Header (CSP, HSTS …)
Dockerfile                    Multi-Stage-Build (Node -> nginx)
docker-compose.yml            Compose-Datei für Dokploy
docker-compose.local.yml      Override für lokalen Test (Port 8080)
```

## Doku-Seiten hinzufügen

Jede Seite ist eine Markdown-Datei unter `src/content/docs/<sprache>/<slug>.md`. Die URL ist `/<sprache>/docs/<slug>`; `index.md` ist die Übersichtsseite unter `/<sprache>/docs`. Lege jede Seite möglichst in **beiden** Sprachen mit demselben Dateinamen an, damit die Sprachumschaltung und die `hreflang`-Verweise passen.

```markdown
---
title: Schnellstart
description: In fünf Minuten zur laufenden Atrium-Instanz.
order: 2
section: Erste Schritte
source: docs/quickstart.md
---

## Voraussetzungen

…
```

| Feld          | Bedeutung                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| `title`       | Seitentitel (H1, `<title>`, Navigation)                                      |
| `description` | Meta-Description und Teaser (ca. 120–160 Zeichen)                           |
| `order`       | Sortierung in der Seitennavigation (aufsteigend)                             |
| `section`     | Gruppe in der Seitennavigation                                               |
| `source`      | optional: Pfad der Quelldatei im Atrium-Repository (Link „Auf GitHub ansehen“) |

Überschriften `##`/`###` bekommen automatisch Anker-IDs (für das Inhaltsverzeichnis). Neue Seiten landen automatisch in der Sitemap und werden beim Build vorgerendert.

## Module im Marktplatz eintragen

Die Einträge des Marktplatzes (`/de/marktplatz`, `/en/marketplace`) stehen in `src/lib/marketplace.ts`; neue Quellen kommen per Pull Request in dieses Repository. `validateSources` prüft die Liste beim Build, ein ungültiger Eintrag lässt `npm run build` abbrechen. Aus denselben Daten entsteht die Registry `/marketplace/v1/index.json`.

Jedes Paket und jedes Modul hat eine eigene Detailseite (`/de/marktplatz/<quelle>[/<modul>]`, `/en/marketplace/<quelle>[/<modul>]`); die Registry verlinkt sie im Feld `page`. README, Manifeste, Versionen und Bilder dafür stammen aus einem Snapshot, den `npm run sync:marketplace` von GitHub holt (optional mit `GITHUB_TOKEN`) und unter `src/content/marketplace/` bzw. `static/marketplace/` ablegt. Den Snapshot nach Änderungen an einer Quelle neu erzeugen und mitcommitten.

Felder, Kategorien, Ablauf und das Registry-Format beschreibt die Doku unter [`/de/docs/marketplace`](src/content/docs/de/marketplace.md) bzw. [`/en/docs/marketplace`](src/content/docs/en/marketplace.md).

## Screenshots neu erzeugen

Die Screenshots für Startseite und Anleitung werden aus einer laufenden Atrium-Instanz aufgenommen (Playwright) und als WebP unter `static/screenshots/<de|en>/` abgelegt:

```bash
ATRIUM_URL=http://localhost:4310 \
ATRIUM_EMAIL=admin@example.org \
ATRIUM_PASSWORD='…' \
OUT_DIR=static/screenshots \
LOCALE=both \
npm run screenshots
```

| Variable          | Bedeutung                                              | Standard                  |
| ----------------- | ------------------------------------------------------ | ------------------------- |
| `ATRIUM_URL`      | Basis-URL der laufenden Atrium-Instanz                 | `http://localhost:4310`   |
| `ATRIUM_EMAIL`    | E-Mail des Admin-Kontos                                | `admin@example.org`       |
| `ATRIUM_PASSWORD` | Passwort des Admin-Kontos (**Pflicht**)                | –                         |
| `OUT_DIR`         | Zielordner                                             | `static/screenshots`      |
| `LOCALE`          | `de`, `en` oder `both`                                 | `both`                    |

`playwright` und `sharp` sind keine Projektabhängigkeiten. Entweder einmalig installieren (`npm i --no-save playwright sharp && npx playwright install chromium`) oder mit `TOOLS_DIR=<ordner>` auf einen Ordner zeigen, dessen `node_modules` beides enthält. Weitere Optionen (z. B. `ONLY`, `SEED`, `INSTALL_MODULES`) stehen im Kopf von `scripts/screenshots.mjs`. Nutze für Screenshots eine Instanz mit neutralen Demodaten, keine Produktivdaten.

## Deployment mit Dokploy

Die Website läuft als ein Container: Im Build-Stage erzeugt Node den statischen Build, nginx liefert ihn auf **Port 8080** aus. TLS und Zertifikate übernimmt Traefik von Dokploy. Der Container braucht weder Datenbank noch Volumes.

### Vorbereitung

1. Repository `KalypzoSolutions/atrium-website` in Dokploy verfügbar machen (GitHub-Provider einrichten oder öffentliche Git-URL verwenden).
2. DNS: einen `A`- (und ggf. `AAAA`-)Eintrag für `atrium.kalypzo.de` auf die IP des Dokploy-Servers setzen.

### Variante A: Compose (empfohlen)

1. In Dokploy ein Projekt öffnen und **Create Service → Compose** wählen, Typ **Docker Compose**.
2. **General → Provider:** Git bzw. GitHub, Repository `atrium-website`, Branch `main`, **Compose Path** `./docker-compose.yml`.
3. **Environment:** optional `PUBLIC_SITE_URL=https://atrium.kalypzo.de` setzen (das ist auch der Standardwert). Die Variable wird beim Build eingebettet. Nach einer Änderung neu deployen.
4. **Domains → Add Domain:**
   - Host: `atrium.kalypzo.de`
   - Path: `/`
   - Service Name: `website`
   - Container Port: `8080`
   - HTTPS: aktivieren, Certificate Provider: **Let's Encrypt**
5. **Deploy** klicken. Der Status ist erst dann „healthy“, wenn `/healthz` mit `200 ok` antwortet.
6. Optional: unter **General → Autodeploy** bzw. per Webhook bei jedem Push auf `main` neu bauen lassen.

Die Compose-Datei veröffentlicht bewusst **keine Host-Ports** (`expose: 8080`). Traefik erreicht den Container über das Dokploy-Netzwerk. Der Container läuft schreibgeschützt (`read_only`, tmpfs für `/tmp`), ohne Linux-Capabilities, mit `no-new-privileges`, Speicherlimit und Log-Rotation.

### Variante B: Application mit Dockerfile

1. **Create Service → Application**.
2. **Provider:** Git bzw. GitHub, Repository `atrium-website`, Branch `main`.
3. **Build Type:** `Dockerfile`, Docker File `Dockerfile`, Docker Context Path `.`.
4. **Environment → Build-time Arguments:** `PUBLIC_SITE_URL=https://atrium.kalypzo.de` (optional, Standardwert).
5. **Domains → Add Domain:** Host `atrium.kalypzo.de`, Path `/`, Container Port **`8080`**, HTTPS an, Let's Encrypt.
6. **Deploy**.

### Nach dem Deployment prüfen

```bash
curl -I https://atrium.kalypzo.de/             # 302 -> /de (oder /en bei englischem Browser)
curl -I https://atrium.kalypzo.de/de           # 200, Sicherheits-Header, Cache-Control: no-cache
curl    https://atrium.kalypzo.de/robots.txt
curl    https://atrium.kalypzo.de/sitemap.xml
```

Danach die Sitemap in der Google Search Console bzw. den Bing Webmaster Tools einreichen.

### Ohne Dokploy: Docker direkt

```bash
docker build -t atrium-website --build-arg PUBLIC_SITE_URL=https://atrium.kalypzo.de .
docker run --rm -p 8080:8080 --read-only --tmpfs /tmp --cap-drop ALL atrium-website
# -> http://localhost:8080
```

Oder mit Compose und lokalem Port:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

### nginx-Verhalten im Überblick

- `/` → `302` auf `/de` bzw. `/en` (anhand von `Accept-Language`)
- Abschließende Schrägstriche werden per `301` entfernt (`/de/docs/` → `/de/docs`)
- `/_app/immutable/*`: 1 Jahr Cache (`immutable`); Bilder und `/screenshots/`: 30 Tage; HTML: `no-cache`
- `/marketplace/v1/index.json`: Registry des Marktplatzes als JSON mit CORS `*` (`GET`, `HEAD`, `OPTIONS`) und 15 Minuten Cache
- Vorkomprimierte `.gz`-Dateien werden direkt ausgeliefert (`gzip_static`)
- Unbekannte Pfade liefern `404.html` mit Status 404
- Sicherheits-Header: HSTS, CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- `/healthz` → `200 ok` für Health-Checks

## Lizenz

Für Code und Inhalte dieser Website gilt die proprietäre [LICENSE](LICENSE) („Alle Rechte vorbehalten“, `UNLICENSED`), Copyright (c) 2026 Philipp Hethey. Die Namen „Kalypzo“ und „Kalypzo Atrium“, das Logo und das Vorschaubild sind zusätzlich als Marken ausgenommen, siehe [TRADEMARKS.md](TRADEMARKS.md). Der Quellcode von Kalypzo Atrium selbst unterliegt den Lizenzangaben im [Atrium-Repository](https://github.com/KalypzoSolutions/kalypzo-atrium).

## Impressum und Datenschutz

Betreiberangaben (Name, Anschrift, E-Mail), Hoster und Aufsichtsbehörde stehen zentral in `src/lib/legal.ts`;
die Texte in `src/lib/components/legal/`. Die Datenschutzerklärung beschreibt den tatsächlichen Betrieb:

- nginx protokolliert IP-Adressen nur **gekürzt** (`deploy/nginx.conf`, `log_format atrium_anon`).
- Keine Cookies, kein Tracking, keine externen Ressourcen. Nur das Farbschema liegt im `localStorage`.
- Wer etwas Externes einbindet (Schriften, Analytics, Videos, Badges), muss die Datenschutzerklärung und die CSP anpassen.
- In Dokploy sollten Zugriffsprotokolle von Traefik ausgeschaltet bleiben (sie enthielten ungekürzte IP-Adressen),
  sonst die Datenschutzerklärung ergänzen.
