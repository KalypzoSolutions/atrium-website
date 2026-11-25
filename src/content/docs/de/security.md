---
title: Sicherheit
description: Das Sicherheitsmodell von Atrium – Anmeldung, Rechte, Secrets, Audit-Log, bekannte Grenzen und Härtungs-Checkliste.
order: 23
section: Betrieb
source: docs/security.md
---

Atrium ist für den Betrieb mit personenbezogenen Daten gebaut. Diese Seite fasst zusammen, wie Anmeldung, Rechte, Secrets und Sicherungen funktionieren und was Sie als Betreiber beachten sollten.

## Anmeldung und Sitzungen

- Anmeldung per E-Mail und Passwort (Better Auth). **Selbstregistrierung ist deaktiviert** – Konten legen Administratoren an.
- Passwörter müssen 12–128 Zeichen lang sein.
- **Zwei-Faktor-Authentifizierung** per TOTP mit Backup-Codes, aktivierbar im Profil.
- Sitzungen gelten 7 Tage und werden nach einem Tag erneuert. Cookies sind `HttpOnly`, `SameSite=Lax` und bei HTTPS `Secure`. Im Profil sehen und widerrufen Sie aktive Sitzungen.
- Passwort-Reset per E-Mail: Der Link gilt eine Stunde, danach werden alle Sitzungen beendet. Die Antwort verrät nicht, ob ein Konto existiert.

### Schutz vor Brute-Force

- Rate Limits für Anmeldung (10/min), Passwort-Reset, TOTP und Profiländerungen.
- 5 Fehlversuche in 15 Minuten sperren nur die betreffende IP für dieses Konto – eine fremde IP kann Sie nicht aussperren.
- Ab 50 Fehlversuchen je Konto in 15 Minuten greift eine globale Kontosperre mit Hinweismail.

## Rollen und Berechtigungen

Atrium nutzt rollenbasierte Zugriffskontrolle (RBAC):

- Eine **Berechtigung** hat die Form `modul.ressource.aktion`, z. B. `core.users.edit`.
- Eine **Rolle** ist eine benannte Menge von Berechtigungen. Benutzer haben beliebig viele Rollen und zusätzlich Einzelrechte.
- Nur Berechtigungen des Core und **aktiver** Module sind wirksam.
- Geprüft wird ausschließlich serverseitig; die Oberfläche blendet nur aus.

Die Systemrolle **Administrator** besitzt konkret alle registrierten Berechtigungen (es gibt kein Wildcard-Recht) und kann weder geändert noch gelöscht werden.

### Schutz vor Rechteausweitung

- Rechte vergeben kann nur, wer sie selbst besitzt – für Rollen wie für API-Keys.
- Der **letzte aktive Administrator** kann weder deaktiviert noch gelöscht noch seiner Rolle beraubt werden.
- **Admin-gleiche Rechte** vergeben nur Administratoren: `core.system.backup`, `core.system.reset`, `core.privacy.export` und `core.users.impersonate`. Sie sind in der Rollenverwaltung mit dem Badge „Admin-gleich“ markiert.
- API-Keys erhalten nie mehr als die Schnittmenge aus Scopes und Rechten des Besitzers (siehe [REST-API](/de/docs/api)).

## Security-Header und CSRF

- Strikte Content Security Policy mit Nonces: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'` – keine Inline-Skripte.
- Zusätzlich `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` und HSTS bei HTTPS.
- **CSRF:** Formulare nutzen die Origin-Prüfung von SvelteKit. Schreibende API-Anfragen mit Sitzung müssen einen `Origin` gleich `ORIGIN` senden.
- Öffentliche Modul-Endpunkte sind ein bewusstes Opt-in mit Pflicht-Rate-Limit und verlangen `application/json`.

## Secrets und `APP_SECRET`

- Reversibel benötigte Secrets – SMTP-Passwort, S3-Zugangsdaten, OpenAI-Key – werden mit **AES-256-GCM** verschlüsselt. Der Schlüssel wird per HKDF-SHA-256 aus `APP_SECRET` abgeleitet.
- Secrets werden nie an den Browser oder in Logs ausgegeben; Audit-Einträge vermerken nur, dass ein Secret geändert wurde.
- API-Keys haben 256 Bit Zufall und werden nur als SHA-256-Hash gespeichert.

> **Achtung:** Ein neuer `APP_SECRET` macht gespeicherte Secrets unlesbar und beendet alle Sitzungen. Eine automatische Neuverschlüsselung gibt es nicht. Wenn Sie den Schlüssel wechseln müssen: Secrets notieren, `APP_SECRET` ändern, Werte in der Oberfläche neu eingeben – oder eine Datensicherung erstellen und auf dem Server mit neuem `APP_SECRET` wiederherstellen (dabei wird alles neu verschlüsselt).

## Audit-Log

Die Tabelle `audit_log` ist per Datenbank-Trigger **unveränderlich** (append-only). Protokolliert werden unter anderem Anmeldungen und Fehlversuche, Sperren, Passwortänderungen, Änderungen an Benutzern, Rollen und Rechten, API-Keys, Einstellungen und Modulaktivierungen. Personenbezogene Felder werden maskiert bzw. entfernt. Das Zugriffsprotokoll der API (`api_log`) enthält keine Inhalte. Einsehen können es Benutzer mit `core.audit.view`.

## Datensicherung und Datenschutz

- **Sicherungen** aus der Oberfläche sind mit einem eigenen Sicherungs-Passwort verschlüsselt (scrypt, AES-256-GCM); Export und Import verlangen Konto-Passwort und 2FA. Die Datei enthält innerhalb der Verschlüsselung alle Daten inklusive Zugangsdaten – Datei plus Passwort bedeuten vollen Zugriff. Details: [Datensicherung und Wiederherstellung](/de/docs/backup-restore).
- **Datenauskunft**, Aufbewahrungsfristen und die Übermittlung an Dritte beschreibt [Datenschutz und Audit-Log](/de/docs/privacy).
- **KI-Datenminimierung:** Prompts und Antworten werden weder gespeichert noch geloggt.
- **Drittanbieter:** Alle Verbindungen zu externen Diensten (SMTP, S3, KI, GitHub, Push) gehen vom Server aus, nicht vom Browser.

## PDF-Renderer

PDFs rendert Chromium ohne JavaScript und mit blockierten Netzwerkzugriffen; alle Inhalte werden HTML-escaped. Die Variable `PDF_CHROMIUM_SANDBOX` steuert die Chromium-Sandbox:

| Wert | Verhalten |
|---|---|
| `auto` (Standard) | erst mit Sandbox; scheitert der Start (typisch im Container ohne passendes seccomp-Profil), einmaliger Rückfall auf `--no-sandbox` mit Warnung im Log |
| `on` | nie ohne Sandbox – PDFs schlagen sonst fehl |
| `off` | ausdrücklich ohne Sandbox |

Für den Produktivbetrieb empfiehlt das Projekt `on` mit einem seccomp-Profil, das Chromium User-Namespaces erlaubt, oder einen eigenen Container für den Renderer.

## Bekannte Einschränkungen

- Rate Limiter und Login-Sperre arbeiten im Prozessspeicher und gehen bei einem Neustart verloren; Mehr-Instanz-Betrieb wird nicht unterstützt.
- Das Audit-Log ist nicht gegen Datenbank-Superuser geschützt.
- Die Trennung der Modul-Schemas ist eine Konvention, kein Sicherheitsmechanismus – Module sind vertrauenswürdiger Code.
- Uploads werden nicht auf Viren gescannt.

## Härtungs-Checkliste

- [ ] HTTPS erzwungen, `ORIGIN` mit `https://`, HSTS aktiv
- [ ] `APP_SECRET` zufällig (≥ 32 Zeichen), sicher gesichert, nicht im Repository
- [ ] `INITIAL_ADMIN_*` nach dem ersten Start entfernt, Admin-Passwort geändert, 2FA für Administratoren aktiv
- [ ] `ADDRESS_HEADER`/`XFF_DEPTH` passend zum Proxy
- [ ] Datenbank nicht öffentlich erreichbar
- [ ] S3-Bucket privat, minimale Rechte, CORS nur für `ORIGIN`
- [ ] regelmäßige Sicherungen mit Ziel außerhalb des Servers, inklusive Restore-Test
- [ ] Rollen und API-Key-Scopes nach dem Prinzip der geringsten Rechte, kurze Key-Laufzeiten
- [ ] Audit-Log regelmäßig prüfen, Abhängigkeiten aktuell halten

## Nächste Schritte

- Rollen und admin-gleiche Rechte: [Benutzer, Rollen und Rechte](/de/docs/users-roles)
- Module sicher installieren: [Module verwalten](/de/docs/module-management)
- Betrieb und Sicherung einrichten: [Installation](/de/docs/installation)
- Datenschutz und Audit-Log im Detail: [Datenschutz und Audit-Log](/de/docs/privacy)
