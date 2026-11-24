---
title: Erste Schritte nach der Installation
description: Anmelden, Passwort ändern, Zwei-Faktor-Anmeldung einrichten und die Organisation konfigurieren – die ersten Handgriffe in einer frischen Atrium-Installation.
order: 10
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Diese Seite führt Sie durch die ersten Minuten in einer frisch installierten Atrium-Instanz – vom ersten Anmelden bis zur eingerichteten Organisation. Sie setzt voraus, dass Atrium läuft, etwa nach dem [Schnellstart](/de/docs/quickstart), der [Installation mit Docker Compose](/de/docs/installation) oder dem [Deployment mit Dokploy](/de/docs/dokploy).

## Der erste Administrator

Atrium kennt **keine Selbstregistrierung**. Das erste Konto entsteht beim Start aus den Umgebungsvariablen `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` (Passwort mindestens 12 Zeichen) – aber nur, solange noch kein Administrator existiert. Alle weiteren Konten legen Sie anschließend in der Oberfläche an.

> **Wichtig:** Entfernen Sie `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` nach dem ersten Start aus der `.env` bzw. der Dokploy-Environment. Sonst bleibt das Passwort in der Container-Umgebung sichtbar.

## Anmelden

Öffnen Sie `https://<ihre-domain>/login` und melden Sie sich mit E-Mail und Passwort an. Ist die Zwei-Faktor-Anmeldung aktiv, fragt Atrium anschließend nach dem 6-stelligen Code aus der Authenticator-App.

<DocShot name="01-login" lang="de" caption="Die Anmeldeseite mit E-Mail und Passwort, alternativ der QR-Code für die Anmeldung über ein bereits angemeldetes Handy." />

Weitere Möglichkeiten auf der Anmeldeseite:

- **Mit dem Handy anmelden:** Scannen Sie den QR-Code mit einem Handy, auf dem Sie bereits angemeldet sind, und bestätigen Sie dort. Der Code erneuert sich regelmäßig; bestätigen Sie nur, wenn Sie selbst vor dem anderen Gerät sitzen.
- **Sprache:** Unten auf der Seite wechseln Sie zwischen Deutsch und English.
- **Passwort vergessen?** fordert einen Link zum Zurücksetzen per E-Mail an (siehe unten).

Nach der Anmeldung landen Sie auf dem [Dashboard](/de/docs/search-dashboard). Links finden Sie die Navigation, oben die globale Suche (<kbd>Strg</kbd>+<kbd>K</kbd>), den Hell/Dunkel-Schalter und das Benutzermenü.

## Passwort ändern

Ändern Sie das Startpasswort direkt nach der ersten Anmeldung: **Benutzermenü → Profil → Sicherheit → Passwort**. Das neue Passwort muss 12 bis 128 Zeichen lang sein. Mit **Alle anderen Sitzungen beenden** melden Sie gleichzeitig alle übrigen Geräte ab.

Hat die Verwaltung Ihr Passwort gesetzt und „Beim nächsten Besuch ändern lassen“ gewählt, leitet Atrium Sie nach der Anmeldung so lange auf diese Seite, bis Sie ein eigenes Passwort festgelegt haben.

## Zwei-Faktor-Anmeldung einrichten

Für Administratoren ist die Zwei-Faktor-Anmeldung (2FA) dringend empfohlen. Die Übersicht unter **Administration** zählt sogar eigens die „Administrator\*innen ohne 2FA“. Sie brauchen eine Authenticator-App (TOTP), z. B. die App Ihres Passwortmanagers.

<DocShot name="12-2fa" lang="de" caption="Profil → Sicherheit: Passwort, Zwei-Faktor-Authentifizierung, Sitzungen und API-Schlüssel." />

1. Öffnen Sie **Profil → Sicherheit** und klicken Sie bei *Zwei-Faktor-Authentifizierung* auf **Aktivieren**.
2. Bestätigen Sie mit Ihrem Passwort und klicken Sie auf **Weiter**.
3. Scannen Sie den QR-Code mit der Authenticator-App.
4. Sichern Sie die **Backup-Codes** (**Codes kopieren**). Jeder Code gilt nur einmal, und Sie sehen sie nur jetzt.
5. Geben Sie den angezeigten **Bestätigungscode** ein und klicken Sie auf **Aktivierung abschließen**.

<DocShot name="12b-2fa-setup" lang="de" caption="Einrichtung der Zwei-Faktor-Anmeldung: QR-Code scannen, Backup-Codes sichern, Code bestätigen." />

> **Tipp:** Verlieren Sie Ihr Gerät, melden Sie sich mit einem Backup-Code an. Eine andere Person mit Verwaltungsrechten kann Ihre 2FA außerdem auf Ihrer Kontoseite zurücksetzen (siehe [Benutzer, Rollen und Rechte](/de/docs/users-roles#passwort-sitzungen-und-2fa)).

## Passwort vergessen

Über **Passwort vergessen?** auf der Anmeldeseite fordern Sie einen Link an. Er ist **eine Stunde** gültig; nach dem Zurücksetzen werden alle Sitzungen beendet. Die Antwort verrät bewusst nicht, ob zu der Adresse ein Konto existiert. Voraussetzung ist ein eingerichteter [E-Mail-Versand](/de/docs/settings#e-mail-versand).

<DocShot name="27-forgot-password" lang="de" />

## Die Organisation einrichten

Alles Fachliche konfigurieren Sie in der Oberfläche unter **Administration → Einstellungen** – nicht über Umgebungsvariablen. Für den Start empfehlen wir diese Reihenfolge:

| Schritt | Wo | Was |
|---|---|---|
| 1 | Einstellungen → **Allgemein** | Systemname, Sprache, Name, Anschrift und Kontakt der Organisation, Links zu Impressum und Datenschutzerklärung |
| 2 | Einstellungen → **E-Mail-Versand** | SMTP-Server eintragen und eine Test-E-Mail senden |
| 3 | Einstellungen → **Speicher** | S3-Bucket eintragen und **Verbindung testen** |
| 4 | Einstellungen → **Design** | Logo hochladen und Akzentfarbe wählen |
| 5 | **Module** | Fachmodule installieren und aktivieren |
| 6 | **Benutzer** und **Rollen** | Konten anlegen, Rollen nach dem Prinzip der geringsten Rechte vergeben |

Was die einzelnen Bereiche bedeuten, beschreibt [Einstellungen](/de/docs/settings) im Detail.

<DocShot name="02b-admin-overview" lang="de" caption="Die Übersicht unter Administration: Kennzahlen und alle Verwaltungsbereiche. Das Suchfeld oben findet einzelne Einstellungen direkt." />

## Das eigene Profil

Unter **Profil** (Benutzermenü oben rechts) pflegt jede Person ihr eigenes Konto:

- **Konto:** Profilbild (PNG, JPEG oder WebP; braucht einen eingerichteten Speicher), Name und E-Mail-Adresse. Eine neue Adresse wird erst nach Klick auf den Bestätigungslink übernommen, der an die neue Adresse geht.
- **Sicherheit:** Passwort, Zwei-Faktor-Anmeldung, angemeldete Sitzungen und eigene API-Schlüssel.
- **Darstellung:** Theme, Hell/Dunkel/System, Akzentfarbe, Sprache, Dichte, Einträge pro Seite und Startseite nach der Anmeldung.
- **Benachrichtigungen:** Push auf diesem Gerät und je Benachrichtigung der Kanal (siehe [Dashboard, Suche und Benachrichtigungen](/de/docs/search-dashboard#benachrichtigungen)).

<DocShot name="28-profile" lang="de" />

## Checkliste

- [ ] Startpasswort geändert, 2FA für alle Administratoren aktiv
- [ ] `INITIAL_ADMIN_*` aus der Umgebung entfernt
- [ ] Systemname und Organisation eingetragen, Impressum und Datenschutzerklärung verlinkt
- [ ] Test-E-Mail erfolgreich versendet
- [ ] Speicherverbindung erfolgreich getestet
- [ ] Datensicherung eingerichtet (siehe [Datensicherung und Wiederherstellung](/de/docs/backup-restore))

## Nächste Schritte

- Konten und Rollen anlegen: [Benutzer, Rollen und Rechte](/de/docs/users-roles)
- Alle Einstellungen im Überblick: [Einstellungen](/de/docs/settings)
- Fachmodule hinzufügen: [Module verwalten](/de/docs/module-management)
