---
title: Benutzer, Rollen und Rechte
description: Konten anlegen, einladen und sperren, Rollen und Einzelrechte vergeben, admin-gleiche Rechte verstehen sowie Passwörter, Sitzungen und 2FA verwalten.
order: 11
section: Administration
source: docs/permissions.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium regelt den Zugriff über **rollenbasierte Rechte** (RBAC). Konten legen ausschließlich Personen mit Verwaltungsrechten an; eine Selbstregistrierung gibt es nicht. Diese Seite erklärt, wie Sie Konten verwalten, wie Rollen und Einzelrechte zusammenwirken und welche Schutzregeln Atrium dabei durchsetzt.

## Das Modell in Kürze

| Begriff | Bedeutung |
|---|---|
| **Berechtigung** | Ein Recht im Schema `modul.ressource.aktion`, z. B. `core.users.edit`. Core und Module registrieren ihre Rechte selbst. |
| **Rolle** | Eine benannte Menge von Berechtigungen, z. B. „Kassenwart“. |
| **Einzelrecht** | Eine Berechtigung direkt am Konto, zusätzlich zu den Rollen. |
| **Wirksame Rechte** | Vereinigung aus Rollen, von Modulen verliehenen Rollen und Einzelrechten. |

- Nur Rechte des Core und **aktiver** Module wirken. Deaktivieren Sie ein Modul, verlieren alle Konten (und API-Keys) dessen Rechte sofort.
- Geprüft wird ausschließlich auf dem Server. Die Oberfläche blendet nur aus, was Sie nicht dürfen.

## Benutzer verwalten

Unter **Administration → Benutzer** sehen Sie alle Konten mit Rollen, Status, 2FA und letzter Anmeldung. Die Liste lässt sich durchsuchen, nach Status (Aktiv, Deaktiviert, E-Mail unbestätigt, Nie angemeldet), 2FA und Rolle filtern und als **CSV** exportieren.

<DocShot name="09-users" lang="de" caption="Administration → Benutzer: Liste mit Suche, Filtern, Sammelaktionen und CSV-Export." />

### Konto anlegen oder einladen

Klicken Sie auf **Benutzer anlegen** und geben Sie Name, E-Mail und ein Passwort (mindestens 12 Zeichen) ein. Das Konto ist sofort aktiv. Alternativ wählen Sie **Stattdessen einladen**: Dann legt die Person ihr Passwort selbst über einen Link fest, der **7 Tage** gültig ist – dafür muss der [E-Mail-Versand](/de/docs/settings#e-mail-versand) eingerichtet sein.

Im Reiter **Rollen & Rechte** desselben Dialogs vergeben Sie gleich Rollen und Einzelrechte.

<DocShot name="26c-user-create" lang="de" />

### Sammelaktionen

Markieren Sie mehrere Konten (bis zu 500), um sie gemeinsam zu aktivieren oder zu deaktivieren, eine Zurücksetzen-Mail zu senden, sie auf allen Geräten abzumelden oder eine Rolle zu geben bzw. zu entziehen. Jedes Konto durchläuft dabei dieselben Prüfungen wie einzeln; Konten mit mehr Rechten als Ihren sowie Ihr eigenes Konto werden übersprungen und gemeldet.

### Deaktivieren oder löschen

- **Deaktivieren** meldet die Person sofort ab und sperrt die Anmeldung, bis das Konto wieder aktiv ist. Daten bleiben vollständig erhalten – meist die bessere Wahl.
- **Löschen** entfernt das Konto endgültig. Module räumen dabei ihre Daten zu diesem Konto auf (Hook `onUserDeleted`); was genau mitgelöscht wird, zeigt der Bestätigungsdialog.

## Die Detailseite eines Kontos

Ein Klick auf einen Namen öffnet die Detailseite mit den Reitern **Übersicht**, **Aktivität**, **Sitzungen**, **Sicherheit** und **Rechte**. Die Übersicht zeigt Kennzahlen wie letzte Anmeldung, aktive Sitzungen, API-Keys, Dateien und KI-Verbrauch; *Aktivität* stellt die Audit-Einträge der letzten 90 Tage dar, *Rechte* listet jedes wirksame Recht mit seiner Herkunft (Rolle, Einzelrecht oder Modul).

<DocShot name="26-user-detail" lang="de" />

### Passwort, Sitzungen und 2FA

Im Reiter **Sicherheit** helfen Sie Personen, die nicht mehr in ihr Konto kommen:

| Aktion | Wirkung |
|---|---|
| **Zurücksetzen-Mail senden** | Link an die Adresse der Person, 1 Stunde gültig. Das alte Passwort gilt, bis ein neues gesetzt ist. |
| **Link erzeugen** | Einmal-Link zum Zurücksetzen, 1 Stunde gültig, nur jetzt sichtbar – geben Sie ihn nur der Person selbst weiter. |
| **Passwort setzen** | Zufällig erzeugt (mindestens 16 Zeichen) oder selbst eingegeben, nur jetzt sichtbar. Alle Sitzungen und offenen Links enden. Optional „Beim nächsten Besuch ändern lassen“. |
| **Einladung erneut senden** | Für eingeladene Konten ohne eigenes Passwort. |
| **2FA zurücksetzen** | Entfernt Geheimnis und Backup-Codes; die Person meldet sich nur mit Passwort an und richtet 2FA neu ein. |

Im Reiter **Sitzungen** beenden Sie einzelne Sitzungen oder melden die Person mit **Alle abmelden** auf allen Geräten ab.

<DocShot name="26b-user-security" lang="de" />

> **Hinweis:** Für Ihr eigenes Konto sind diese Funktionen gesperrt – Passwort, 2FA und Sitzungen ändern Sie im eigenen [Profil](/de/docs/first-steps#das-eigene-profil).

### Als Person handeln

Mit **Als Person handeln** sehen und ändern Sie für 15, 30 oder 60 Minuten alles mit den Rechten einer anderen Person – etwa um ein Problem nachzuvollziehen. Dafür gelten strenge Regeln:

- Sie brauchen das admin-gleiche Recht `core.users.impersonate`, bestätigen mit Passwort (und 2FA-Code) und geben einen **Grund** an. Der Grund ist nur auf der Detailseite sichtbar, nicht im Audit-Log.
- Administratoren können nie Ziel sein, ebenso wenig Konten mit mehr Rechten als Ihren.
- Jede Aktion wird im Audit-Log mit Ihnen als handelnder Person vermerkt. Passwort, 2FA, Sitzungen, E-Mail und API-Keys der Person bleiben gesperrt.
- Ein Banner zeigt die Restzeit und **Beenden**. Standardmäßig erhält die Person eine E-Mail (Einstellung „Person informieren, wenn die Verwaltung als sie handelt“ unter *Allgemein*).

## Rollen

Unter **Administration → Rollen** bündeln Sie Berechtigungen. Jede Karte zeigt die Anzahl der Rechte und der zugewiesenen Konten.

<DocShot name="10-roles" lang="de" />

**Rolle anlegen** öffnet einen Dialog mit Name, Beschreibung und der Rechteauswahl. Die Rechte sind nach Core und Modulen gruppiert; das Suchfeld findet Rechte auch über ihre Beschreibung, „alle“/„keine“ wirken nur auf die Treffer.

<DocShot name="10b-role-edit" lang="de" caption="Rolle bearbeiten: Rechte nach Modulen gruppiert, mit Suche. Admin-gleiche Rechte sind markiert." />

### Die Rolle Administrator

Die Systemrolle **Administrator** besitzt konkret **alle** registrierten Berechtigungen – auch die neuer Module, die beim Start automatisch ergänzt werden. Ein Wildcard-Recht gibt es nicht. Systemrollen lassen sich weder umbenennen noch ändern noch löschen.

### Rollen aus Modulen

Module können Standardrollen mitbringen (z. B. „Mitglied“) und ihnen beim ersten Aktivieren Rechte geben. Diese Vergabe geschieht **einmalig**: Entziehen Sie ein solches Recht bewusst, kommt es nicht zurück. Manche Module verleihen Rollen außerdem automatisch (z. B. über Ämter); solche Rollen wirken nur, solange das Modul aktiv ist, und erscheinen auf der Detailseite mit dem Zusatz „über Modul“.

### Übersicht aller Berechtigungen

Der Reiter **Berechtigungen** listet jedes registrierte Recht mit Beschreibung und den Rollen, die es enthalten – praktisch, um zu prüfen, wer etwas darf.

<DocShot name="23-permissions" lang="de" />

## Schutz vor Rechteausweitung

Atrium verhindert, dass jemand über die Rechteverwaltung mehr Rechte erlangt, als er hat:

- **Vergeben** können Sie nur Rechte, die Sie selbst besitzen – für Rollen, Einzelrechte und API-Keys.
- Wer eine Rolle bearbeitet, löscht oder zuweist, muss **alle** ihre Rechte selbst besitzen. Zum Zuweisen braucht es zusätzlich `core.roles.assign`.
- Konten mit Rechten, die Sie nicht haben, können Sie ansehen, aber nicht ändern („Mehr Rechte als du – nicht änderbar“).
- Der **letzte aktive Administrator** kann weder deaktiviert noch gelöscht noch seiner Rolle beraubt werden. Sich selbst deaktivieren oder löschen ist gesperrt, eigene Einzelrechte können Sie sich nicht selbst entziehen.

### Admin-gleiche Rechte

Vier Rechte erlauben faktisch die Übernahme des ganzen Systems und sind deshalb **admin-gleich**. Sie tragen in der Rollenverwaltung das Abzeichen **„Admin-gleich“** und können nur von Administratoren vergeben werden:

| Recht | Warum admin-gleich |
|---|---|
| `core.system.backup` | Gesamt-Export aller Daten inklusive Zugangsdaten; Import einer Sicherung |
| `core.system.reset` | Löschen beliebiger Datenbereiche inklusive Konten und Rollen |
| `core.privacy.export` | Liest sämtliche Daten einer Person aus allen Modulen |
| `core.users.impersonate` | Handelt mit Rechten und Daten anderer Personen |

Zusätzlich ist `core.modules.install` privilegiert: Module installieren dürfen nur Administratoren, denn Modulcode läuft mit vollen Rechten (siehe [Module verwalten](/de/docs/module-management)). Als Administrator gilt, wer sämtliche Core-Rechte wirksam besitzt – die Rolle „Administrator“ hat sie immer.

## Core-Berechtigungen

| Schlüssel | Bedeutung |
|---|---|
| `core.users.view` / `.create` / `.edit` / `.delete` | Benutzer ansehen, anlegen, bearbeiten und deaktivieren, löschen |
| `core.users.impersonate` | Als andere Person handeln (admin-gleich) |
| `core.roles.view` / `.create` / `.edit` / `.delete` | Rollen und Berechtigungen ansehen, Rollen anlegen, bearbeiten, löschen |
| `core.roles.assign` | Rollen und Einzelrechte an Benutzer vergeben |
| `core.modules.view` / `.manage` | Module ansehen bzw. aktivieren und deaktivieren |
| `core.modules.install` | Module aus GitHub oder ZIP installieren und aktualisieren (nur Administratoren) |
| `core.jobs.manage` | Hintergrundjobs ansehen und manuell auslösen |
| `core.settings.view` / `.manage` | Systemeinstellungen ansehen bzw. ändern |
| `core.api.view` / `.manage` | API-Keys ansehen bzw. verwalten |
| `core.storage.read` / `.write` / `.delete` | Dateien im Core-Speicherbereich lesen, schreiben, löschen |
| `core.storage.manage` | Speicher konfigurieren und alle Speicherbereiche verwalten |
| `core.pdf.generate` / `.manage` | PDFs per API erzeugen bzw. PDF-Vorlagen konfigurieren |
| `core.ai.use` / `.manage` / `.view` | KI nutzen, konfigurieren, Nutzung ansehen |
| `core.audit.view` | Audit-Log ansehen |
| `core.system.reset` | Datenbereiche zurücksetzen (admin-gleich) |
| `core.system.backup` | Datensicherung exportieren und importieren (admin-gleich) |
| `core.privacy.export` | Datenauskunft nach DSGVO (admin-gleich) |

Die Rechte installierter Module erscheinen zusätzlich unter **Rollen → Berechtigungen**.

## Empfehlungen

- Arbeiten Sie im Alltag mit Rollen statt Einzelrechten – Einzelrechte sind für Ausnahmen gedacht.
- Vergeben Sie Rechte nach dem Prinzip der geringsten Rechte und prüfen Sie die Rollen regelmäßig.
- Geben Sie admin-gleiche Rechte nur Administratoren und aktivieren Sie für alle Konten mit Verwaltungsrechten die Zwei-Faktor-Anmeldung.

## Nächste Schritte

- Systemeinstellungen festlegen: [Einstellungen](/de/docs/settings)
- Externe Dienste per API-Key anbinden: [REST-API](/de/docs/api)
- Wer hat was geändert? [Datenschutz und Audit-Log](/de/docs/privacy)
