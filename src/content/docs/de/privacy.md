---
title: Datenschutz und Audit-Log
description: Datenauskunft nach DSGVO, das unveränderliche Audit-Log, Aufbewahrungsfristen und welche Daten Atrium an Dritte übermittelt.
order: 15
section: Administration
source: docs/security.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium ist für die Verarbeitung personenbezogener Daten gebaut. Diese Seite beschreibt die Werkzeuge, die Sie als verantwortliche Stelle dafür in der Oberfläche finden: Datenauskunft, Audit-Log und Aufbewahrungsfristen – und welche externen Dienste wann Daten erhalten.

## Datenauskunft (Art. 15 und 20 DSGVO)

Unter **Administration → Datenauskunft** exportieren Sie alle gespeicherten Daten einer Person als JSON-Datei – für das Auskunftsrecht und die Datenübertragbarkeit. Das Recht `core.privacy.export` ist admin-gleich.

<DocShot name="24-privacy" lang="de" />

1. Person per Name oder E-Mail suchen (mindestens 2 Zeichen). Gefunden werden Benutzerkonten – auch deaktivierte – und, sofern ein Modul sie bereitstellt, weitere Personen wie Mitglieder.
2. Bei der richtigen Person auf **Auskunft (JSON)** klicken.

Der Export eines **Benutzerkontos** enthält: Konto, Rollen (auch aus Modulen), Sitzungen, API-Keys (ohne Schlüssel), persönliche Einstellungen, eigene Uploads (nur Metadaten), die Audit-Einträge der Person (höchstens 5000) und die Beiträge aller aktiven Module, die eine Datenauskunft unterstützen. **Dateiinhalte** (Dokumente, Bilder) sind nicht enthalten.

> **Achtung:** Die Datei enthält alle Angaben zur Person im Klartext – je nach Modulen auch Gesundheitsdaten. Geben Sie sie nur an die betroffene Person bzw. die Erziehungsberechtigten heraus und versenden Sie sie nicht unverschlüsselt per E-Mail. Jeder Export wird im Audit-Log vermerkt (nur mit IDs und Zählern).

## Audit-Log

Das **Audit-Log** unter **Administration → Audit-Log** (Recht `core.audit.view`) beantwortet die Frage: Wer hat wann was geändert?

<DocShot name="13-audit-log" lang="de" />

Protokolliert werden unter anderem:

- Anmeldungen, Fehlversuche und Sperren, Passwort- und 2FA-Änderungen,
- Änderungen an Benutzern, Rollen und Rechten, API-Keys,
- Einstellungen (bei Secrets nur der Hinweis auf eine Änderung),
- Modulaktivierungen, -installationen und -entfernungen,
- Datensicherungen, Wiederherstellungen, Zurücksetzen und Datenauskünfte,
- Aktionen, die die Verwaltung „als Person“ ausführt – mit der handelnden Person in jeder Zeile.

Die Liste lässt sich nach Akteur, Aktion, Ziel und Zeitraum filtern; **Aktion (Präfix)** grenzt z. B. auf `core.user` ein. Jeder Eintrag zeigt auf Wunsch Details und die Request-ID, mit der Sie einen Vorgang im Server-Protokoll wiederfinden.

Eigenschaften:

- **Unveränderlich:** Ein Datenbank-Trigger verhindert Ändern und Löschen. Ausnahmen gibt es nur kontrolliert für das Zurücksetzen, die Wiederherstellung und die Aufbewahrungsfristen.
- **Datensparsam:** Passwörter, Tokens und Schlüssel werden durch `[redacted]` ersetzt; E-Mail-Adressen bei Anmeldungen nur maskiert (`a***@domain`) gespeichert.
- Das API-Zugriffsprotokoll (`api_log`) speichert keine Inhalte – nur Methode, Pfadmuster, Status, IP, Akteur und API-Key.

> **Hinweis:** Gegen einen Datenbank-Superuser ist das Audit-Log nicht geschützt – der Trigger ließe sich entfernen. Schützen Sie den Datenbankzugang entsprechend.

## Aufbewahrungsfristen

Protokolle mit IP-Adressen bleiben nur so lange erhalten, wie Sie unter **Einstellungen → Allgemein → Aufbewahrungsfristen** festlegen; der tägliche Job `core.housekeeping` löscht ältere Einträge. Betroffen sind das API-Zugriffsprotokoll, die IP-Adressen im Audit-Log (der Eintrag selbst bleibt) und das Audit-Log. Standardwerte und erlaubte Bereiche stehen unter [Einstellungen → Aufbewahrungsfristen](/de/docs/settings#aufbewahrungsfristen).

Die konkreten Fristen legt Ihre Organisation fest und trägt sie ins Verzeichnis der Verarbeitungstätigkeiten ein. Sicherungen enthalten die Protokolle im Zustand zum Exportzeitpunkt.

## Konten löschen

Beim Löschen eines Kontos räumen alle Module ihre Daten zu diesem Konto auf: Persönliches wird gelöscht, gemeinsam genutzte Inhalte werden je nach Modul übergeben. Das Deaktivieren eines Kontos löscht dagegen nichts. Wie Sie Konten deaktivieren oder löschen, beschreibt [Benutzer, Rollen und Rechte](/de/docs/users-roles#deaktivieren-oder-loeschen).

## Übermittlung an Dritte

Alle Verbindungen zu externen Diensten gehen **vom Server** aus, nicht vom Browser der Nutzenden. Der Core spricht diese Empfänger an:

| Empfänger | Wann | Was |
|---|---|---|
| SMTP-Server | bei jeder E-Mail | Empfängeradresse, Betreff, Text, Anhänge |
| S3-Speicher | bei Uploads und Downloads | Dateiinhalte |
| KI-Anbieter | nur auf Knopfdruck in der Schreibhilfe bzw. wenn Module die KI nutzen | Text im Feld und Eckdaten; E-Mail-Adressen, Telefonnummern und IBANs vorher maskiert |
| Web-Push-Dienste (Google, Apple, Mozilla, Microsoft) | nur für Personen, die Push aktiviert haben | Titel, kurzer Text und Link-Pfad, Ende-zu-Ende verschlüsselt |
| GitHub | nur beim Laden einer Modulquelle | Repository und Ref, optional das GitHub-Token – keine Personendaten |

Schließen Sie mit Mail-, Speicher- und KI-Anbieter, sofern Sie sie nicht selbst betreiben, einen Auftragsverarbeitungsvertrag ab und prüfen Sie bei Anbietern außerhalb der EU die Übermittlungsgrundlage. Module können weitere Empfänger hinzufügen – deren Dokumentation nennt sie.

## KI und Datenminimierung

Alles, was Module an die KI schicken, geht an den eingetragenen Anbieter – gegebenenfalls außerhalb der EU. Für den Datenschutz gilt:

- Schließen Sie vor dem Einschalten einen Auftragsverarbeitungsvertrag ab und nehmen Sie die Schreibhilfe in Ihre Datenschutzerklärung auf.
- E-Mail-Adressen, Telefonnummern und IBANs maskiert die Schreibhilfe vor dem Senden.
- Eingegangene Mails für Antwortentwürfe und Galeriebilder für Bildbeschreibungen werden nur übermittelt, wenn Sie die zugehörigen Schalter einschalten; standardmäßig sind sie aus.
- Prompts und Antworten werden weder gespeichert noch protokolliert; Atrium zählt nur Anfragen, Tokens und geschätzte Kosten.

Modul- und Modell-Freigaben, Rate Limits und Monatslimits begrenzen den Verbrauch. Wie Sie das einstellen, beschreibt [Einstellungen → KI](/de/docs/settings#ki).

## Nächste Schritte

- Sicherheitsmodell und Härtung: [Sicherheit](/de/docs/security)
- Sicherungen und Löschen ganzer Bereiche: [Datensicherung und Wiederherstellung](/de/docs/backup-restore)
