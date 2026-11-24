---
title: Dashboard, Suche und Benachrichtigungen
description: Das Dashboard anpassen, mit Strg+K alles finden, Benachrichtigungen per E-Mail oder Web Push einstellen und Atrium als App auf dem Handy nutzen.
order: 16
section: Administration
source: docs/core-services.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Diese Seite beschreibt die Funktionen, die alle Personen im Alltag nutzen: das Dashboard als Startseite, die globale Suche und die Benachrichtigungen. Was davon zu sehen ist, hängt von den aktiven Modulen und den eigenen Rechten ab.

## Dashboard

Nach der Anmeldung öffnet sich das **Dashboard** (`/dashboard`) – sofern die Person im Profil keine andere Startseite gewählt hat. Es besteht aus **Kacheln**: Der Core liefert z. B. „Zu erledigen“, „Diese Woche“, „Schnellzugriff“, „Kennzahlen“ und „Letzte Aktivitäten“, Module ergänzen eigene.

<DocShot name="02-dashboard" lang="de" />

- Jede Person sieht nur Kacheln **aktiver** Module, für die sie die nötigen Rechte hat. Das Dashboard passt sich so automatisch an Rollen an.
- Haben Kacheln gerade nichts Wichtiges zu zeigen, klappt das Dashboard sie zu einer Zeile „Nichts Neues bei …“ zusammen.

### Dashboard anpassen

Über **Anpassen** blendet jede Person Kacheln ein oder aus und ändert ihre Reihenfolge – per Ziehen oder mit den Pfeiltasten. Änderungen werden sofort gespeichert; **Standard wiederherstellen** setzt die Anordnung zurück. Die Anordnung gilt nur für das eigene Konto.

<DocShot name="30-dashboard-customize" lang="de" />

## Globale Suche

Mit <kbd>Strg</kbd>+<kbd>K</kbd> oder dem Suchfeld oben öffnet sich die Befehlspalette. Sie findet:

- **Seiten** – Navigation, Modulseiten und alle Verwaltungsbereiche bis hin zu einzelnen Einstellungen (z. B. „SMTP“, „Logo“, „IBAN“),
- **Daten** – Benutzer und Rollen sowie Inhalte aktiver Module, die eine Suche anbieten (z. B. Mitglieder oder Termine).

<DocShot name="15-search" lang="de" />

Mit <kbd>↑</kbd> <kbd>↓</kbd> wählen Sie einen Treffer, <kbd>Enter</kbd> öffnet ihn, <kbd>Esc</kbd> schließt die Suche. Die Ergebnisse berücksichtigen immer Ihre Rechte: Jedes Modul liefert nur, was Sie sehen dürfen.

> **Tipp:** Auch die Übersicht unter **Administration** hat ein Suchfeld für Einstellungen; <kbd>Enter</kbd> öffnet dort direkt den ersten Treffer.

## Benachrichtigungen

Module können Personen benachrichtigen – etwa über neue Aufgaben, Nachrichten oder Freigaben. Atrium stellt Benachrichtigungen per **E-Mail** und per **Web Push** zu.

### Kanal je Benachrichtigung wählen

Im **Profil → Benachrichtigungen** wählt jede Person unter „Was bekomme ich wie?“ für jede Benachrichtigung: **Aus**, **E-Mail**, **Beides** oder nur **Push**. Manche Benachrichtigungen bieten zusätzlich **Sofort** oder **Täglich** (eine tägliche Zusammenfassung per E-Mail). Pflicht-Benachrichtigungen lassen sich nicht abschalten. Welche Benachrichtigungen es gibt, bestimmen die aktiven Module und die eigenen Rechte.

Mehrere Benachrichtigungen aus einem Vorgang bündelt Atrium zu **einer** E-Mail. Ist Push gewählt, aber auf keinem Gerät aktiv oder systemweit ausgeschaltet, kommt die Benachrichtigung ersatzweise per E-Mail.

### Push auf einem Gerät aktivieren

Push-Benachrichtigungen erscheinen direkt auf dem Handy oder Computer, auch wenn Atrium gerade nicht geöffnet ist.

1. Im **Profil → Benachrichtigungen** unter *Dieses Gerät* auf **Push aktivieren** klicken und die Nachfrage des Browsers erlauben.
2. Mit **Test senden** prüfen, ob die Zustellung klappt.
3. Unter *Registrierte Geräte* sehen und entfernen Sie Ihre Geräte (höchstens 10 je Person).

Voraussetzungen und Besonderheiten:

- **HTTPS** ist Pflicht (`localhost` gilt als sicher).
- **iPhone/iPad** (ab iOS/iPadOS 16.4): Push nur, wenn Atrium über Safari → **Teilen** → **Zum Home-Bildschirm** hinzugefügt und von dort geöffnet wurde. Der Profil-Reiter zeigt diese Schritte selbst an.
- **Android:** Chrome, Edge und Firefox können Push auch ohne Installation. Über das Browser-Menü → **Zum Startbildschirm hinzufügen** öffnet sich Atrium wie eine App.
- Wurden Benachrichtigungen für die Seite im Browser abgelehnt, erlauben Sie sie in den Website-Einstellungen des Browsers und laden die Seite neu.

### Für Administratoren

Unter **Einstellungen → Benachrichtigungen** schalten Sie Push systemweit ein oder aus und sehen die Zahl registrierter Geräte (siehe [Einstellungen](/de/docs/settings#benachrichtigungen)). Die VAPID-Schlüssel erzeugt Atrium selbst; sie liegen verschlüsselt in der Datenbank und wandern mit der Datensicherung. Ausgehende HTTPS-Verbindungen zu den Push-Diensten (`fcm.googleapis.com`, `*.push.apple.com`, `*.push.services.mozilla.com`, `*.notify.windows.com`) müssen erlaubt sein.

## Darstellung und Startseite

Im **Profil → Darstellung** passt jede Person Atrium an: Theme (Vorschläge oder eigene Themes mit Hintergrund und Akzentfarbe), Hell/Dunkel/System, Akzentfarbe, Sprache der Oberfläche und der E-Mails, Dichte (Normal oder Kompakt), Einträge pro Seite (10 bis 100) und die **Startseite** nach der Anmeldung.

<DocShot name="29b-profile-appearance" lang="de" crop="900" />

## Nächste Schritte

- Erste Einrichtung und Profil: [Erste Schritte nach der Installation](/de/docs/first-steps)
- Push und E-Mail für das ganze System: [Einstellungen](/de/docs/settings)
- Eigene Kacheln, Suche und Benachrichtigungen in Modulen: [Module entwickeln](/de/docs/modules)
