import { GITHUB_URL, type Lang } from '$lib/config';

/**
 * Inhalte der bebilderten Anleitung (/de/anleitung, /en/guide).
 * In Texten markieren `Backticks` Code; die Darstellung übernimmt `components/guide/RichText.svelte`.
 */

export interface ShotRef {
	/** Namensteil des Screenshots, z. B. `04b-module-install-select`. */
	key: string;
	/** Hohe Screenshots als Ausschnitt zeigen; die Großansicht zeigt das ganze Bild. */
	crop?: boolean;
}

export interface CodeSample {
	title: string;
	code: string;
	/** Zugängliche Beschreibung. */
	label: string;
}

export interface Callout {
	kind: 'info' | 'warn' | 'tip';
	text: string;
}

export interface DeployStep {
	title: string;
	text: string;
	fields?: { label: string; value: string }[];
	code?: CodeSample;
	callout?: Callout;
}

export interface SubStep {
	title: string;
	text: string;
	shot: ShotRef;
	note?: string;
	callout?: Callout;
}

export interface GuideStep {
	id: string;
	/** Kurzer Titel für die Schrittnavigation. */
	short: string;
	title: string;
	text: string[];
	/** Klickpfad, dargestellt als schlichte Breadcrumb. */
	path: string[];
	shots: ShotRef[];
	substeps?: SubStep[];
	code?: CodeSample;
	callout?: Callout;
}

export interface GuideCopy {
	seo: { title: string; description: string };
	hero: {
		eyebrow: string;
		titleA: string;
		titleB: string;
		lead: string;
		time: string;
		timeLabel: string;
		parts: string;
		ctaStart: string;
		ctaDocs: string;
	};
	nav: { label: string; mobile: string; done: string };
	partA: {
		id: string;
		eyebrow: string;
		title: string;
		lead: string;
		dokploy: { id: string; short: string; badge: string; title: string; lead: string; steps: DeployStep[] };
		compose: {
			id: string;
			short: string;
			title: string;
			lead: string;
			code: CodeSample;
			note: string;
			links: { label: string; href: string }[];
		};
	};
	partB: { id: string; eyebrow: string; title: string; lead: string; steps: GuideStep[] };
	done: {
		id: string;
		title: string;
		lead: string;
		cards: { title: string; text: string; href: string; external?: boolean }[];
	};
	ui: {
		clickPath: string;
		copy: string;
		copied: string;
		step: string;
		partA: string;
		partB: string;
		moreShots: string;
		enlarge: string;
		close: string;
	};
	/** ISO-8601-Dauer für JSON-LD. */
	totalTime: string;
}

const ENV_DOKPLOY = `# Öffentliche URL – exakt wie unter „Domains“
ORIGIN=https://atrium.example.org

# Zufallswerte, z. B. mit: openssl rand -hex 24
APP_SECRET=…
POSTGRES_PASSWORD=…
MINIO_ROOT_USER=…
MINIO_ROOT_PASSWORD=…
S3_ACCESS_KEY_ID=…
S3_SECRET_ACCESS_KEY=…

# Erster Administrator (Passwort mind. 12 Zeichen)
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=…`;

const ENV_DOKPLOY_EN = `# Public URL – exactly as under "Domains"
ORIGIN=https://atrium.example.org

# Random values, e.g. from: openssl rand -hex 24
APP_SECRET=…
POSTGRES_PASSWORD=…
MINIO_ROOT_USER=…
MINIO_ROOT_PASSWORD=…
S3_ACCESS_KEY_ID=…
S3_SECRET_ACCESS_KEY=…

# First administrator (password at least 12 characters)
INITIAL_ADMIN_EMAIL=admin@example.org
INITIAL_ADMIN_PASSWORD=…`;

const SECRETS = `for v in APP_SECRET POSTGRES_PASSWORD MINIO_ROOT_USER \\
         MINIO_ROOT_PASSWORD S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY; do
  echo "$v=$(openssl rand -hex 24)"
done`;

const COMPOSE = (comment: string, health: string) => `git clone ${GITHUB_URL}.git
cd kalypzo-atrium
cp .env.example .env
# ${comment}
docker compose up -d --build
docker compose ps   # ${health}`;

const CURL = (comment: string) => `# ${comment}
export ATRIUM_KEY="epk_…"

curl -H "Authorization: Bearer $ATRIUM_KEY" \\
  "https://atrium.example.org/api/v1/users?limit=10"`;

const de: GuideCopy = {
	seo: {
		title: 'Anleitung: Kalypzo Atrium installieren und einrichten',
		description:
			'Bebilderte Schritt-für-Schritt-Anleitung: Kalypzo Atrium mit Dokploy oder Docker Compose installieren, Konto mit 2FA absichern, E-Mail, Speicher und PDF einrichten, Module installieren, Rollen und API-Keys anlegen.'
	},
	hero: {
		eyebrow: 'Bebilderte Anleitung',
		titleA: 'Von null zur laufenden',
		titleB: 'Atrium-Instanz',
		lead: 'Installation mit Dokploy oder Docker Compose und die ersten Handgriffe in Atrium – jeder Schritt mit Klickpfad und echtem Screenshot.',
		time: 'ca. 45 Minuten',
		timeLabel: 'Zeitaufwand',
		parts: '2 Teile · 22 Screenshots',
		ctaStart: 'Los geht’s',
		ctaDocs: 'Schnellstart in den Docs'
	},
	nav: { label: 'Schritte der Anleitung', mobile: 'Inhalt', done: 'Geschafft' },
	partA: {
		id: 'installieren',
		eyebrow: 'Teil A',
		title: 'Atrium installieren',
		lead: 'Empfohlen ist Dokploy: Repository verbinden, Variablen eintragen, „Deploy“ klicken. Alternativ geht es direkt mit Docker Compose.',
		dokploy: {
			id: 'dokploy',
			short: 'Mit Dokploy installieren',
			badge: 'Empfohlen',
			title: 'Installation mit Dokploy',
			lead: 'Dokploy baut die App direkt aus dem Repository, startet PostgreSQL und (optional) MinIO als S3-Speicher und kümmert sich über Traefik um HTTPS.',
			steps: [
				{
					title: 'Voraussetzungen prüfen',
					text: 'Sie brauchen einen Server mit laufender Dokploy-Installation und eine (Sub-)Domain, deren DNS-Eintrag auf diesen Server zeigt – zum Beispiel `atrium.example.org`. Legen Sie in Dokploy ein Projekt an oder öffnen Sie ein bestehendes.'
				},
				{
					title: 'Compose-Service aus Git anlegen',
					text: 'Im Projekt auf „Create Service“ → „Compose“ klicken. Als Provider „Git“ wählen und die folgenden Werte eintragen, Typ „Docker Compose“.',
					fields: [
						{ label: 'Repository', value: `${GITHUB_URL}` },
						{ label: 'Branch', value: 'main' },
						{ label: 'Compose-Pfad', value: './docker-compose.dokploy.yml' }
					],
					callout: {
						kind: 'tip',
						text: 'Für den Produktivbetrieb empfehlen wir einen externen S3-Dienst (z. B. Hetzner Object Storage, Cloudflare R2, AWS S3). Verwenden Sie dann den Compose-Pfad `./docker-compose.dokploy-external-s3.yml` – der Stack kommt ohne MinIO aus.'
					}
				},
				{
					title: 'Geheimnisse erzeugen',
					text: 'Alle Passwörter und Schlüssel sollten zufällig sein. Auf jedem Rechner mit OpenSSL erzeugt dieser Befehl passende Werte, die Sie direkt in die Environment übernehmen können:',
					code: { title: 'Terminal', code: SECRETS, label: 'Shell-Befehl zum Erzeugen zufälliger Werte' }
				},
				{
					title: 'Environment ausfüllen',
					text: 'Im Reiter „Environment“ die Pflichtvariablen eintragen und speichern. Die Vorlage `.env.dokploy.example` im Repository enthält alle weiteren, optionalen Variablen (z. B. `SMTP_*` für den E-Mail-Versand).',
					code: { title: 'Environment', code: ENV_DOKPLOY, label: 'Pflichtvariablen für den Dokploy-Stack' },
					callout: {
						kind: 'info',
						text: 'Mit externem S3 entfallen `MINIO_*`. Setzen Sie stattdessen `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` und bei Bedarf `S3_ENDPOINT` (leer = AWS) sowie `S3_FORCE_PATH_STYLE`.'
					}
				},
				{
					title: 'Domain verbinden',
					text: 'Im Reiter „Domains“ eine Domain für den Service `app` mit Port `3000` anlegen und HTTPS aktivieren.',
					callout: {
						kind: 'warn',
						text: '`ORIGIN` muss exakt der öffentlichen URL entsprechen, inklusive `https://` und ohne Schrägstrich am Ende. Davon hängen Cookies, CSRF-Schutz und Anmelde-Weiterleitungen ab.'
					}
				},
				{
					title: 'Deploy klicken',
					text: 'Mit „Deploy“ baut Dokploy das Image und startet den Stack. Beim ersten Start laufen Datenbank-Migrationen, Modul-Sync und das Anlegen des Administrators automatisch. Speicher- und E-Mail-Werte aus der Environment werden in die Einstellungen übernommen, solange dort noch nichts gesetzt ist.'
				},
				{
					title: 'Aufräumen',
					text: 'Sobald Sie sich angemeldet und Ihr Passwort geändert haben (siehe Teil B), entfernen Sie `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` wieder aus der Environment. Bewahren Sie `APP_SECRET` getrennt und sicher auf – ohne ihn lassen sich gespeicherte Geheimnisse nicht mehr entschlüsseln.'
				}
			]
		},
		compose: {
			id: 'docker-compose',
			short: 'Alternative: Docker Compose',
			title: 'Alternative: Docker Compose',
			lead: 'Ohne Dokploy starten Sie Atrium mit der mitgelieferten `docker-compose.yml` (PostgreSQL und App). Die App lauscht nur auf `127.0.0.1`; für HTTPS schalten Sie das Profil `proxy` mit nginx ein oder nutzen einen eigenen Reverse Proxy.',
			code: {
				title: 'Terminal',
				code: COMPOSE('ORIGIN, APP_SECRET, POSTGRES_PASSWORD und INITIAL_ADMIN_* in .env setzen', 'app und db: healthy'),
				label: 'Befehle für die Installation mit Docker Compose'
			},
			note: 'Alle Variablen, das nginx-Profil, automatische Sicherungen und Updates beschreibt die Dokumentation ausführlich.',
			links: [
				{ label: 'Installation mit Docker', href: '/docs/installation' },
				{ label: 'Dokploy im Detail', href: '/docs/dokploy' }
			]
		}
	},
	partB: {
		id: 'erste-schritte',
		eyebrow: 'Teil B',
		title: 'Erste Schritte in Atrium',
		lead: 'Ihre Instanz läuft. Jetzt melden Sie sich an, sichern Ihr Konto ab, richten die wichtigsten Dienste ein und installieren das erste Modul.',
		steps: [
			{
				id: 'anmelden',
				short: 'Anmelden',
				title: 'Zum ersten Mal anmelden',
				text: [
					'Öffnen Sie Ihre Domain im Browser. Atrium leitet auf die Anmeldeseite weiter. Melden Sie sich mit den Werten aus `INITIAL_ADMIN_EMAIL` und `INITIAL_ADMIN_PASSWORD` an.',
					'Rechts sehen Sie einen QR-Code: Später können Sie sich damit ohne Passwort anmelden, indem Sie ihn mit einem bereits angemeldeten Handy scannen.'
				],
				path: ['atrium.example.org/login'],
				shots: [{ key: '01-login' }]
			},
			{
				id: 'orientieren',
				short: 'Orientieren',
				title: 'Sich orientieren: Dashboard und Administration',
				text: [
					'Nach dem Login landen Sie auf dem Dashboard. Links finden Sie die Navigation, oben die globale Suche, den Hell/Dunkel-Schalter und das Benutzermenü.',
					'Unter „Administration“ sehen Sie Kennzahlen und alle Verwaltungsbereiche: Personen & Rechte, Einstellungen, Module, Schnittstellen sowie Protokoll & Wartung. Das Suchfeld oben springt direkt zu einer Einstellung.'
				],
				path: ['Administration'],
				shots: [{ key: '02-dashboard' }, { key: '02b-admin-overview' }]
			},
			{
				id: 'konto-absichern',
				short: 'Konto absichern (2FA)',
				title: 'Passwort ändern und 2FA aktivieren',
				text: [
					'Ändern Sie als Erstes das Start-Passwort aus der Environment (mindestens 12 Zeichen). Schalten Sie danach die Zwei-Faktor-Authentifizierung mit „Aktivieren“ ein und bestätigen Sie mit Ihrem Passwort („Weiter“).',
					'Scannen Sie den QR-Code mit Ihrer Authenticator-App, legen Sie die zehn Backup-Codes sicher ab, geben Sie den 6-stelligen Code ein und klicken Sie auf „Aktivierung abschließen“.'
				],
				path: ['Benutzermenü', 'Profil', 'Sicherheit'],
				shots: [{ key: '12-2fa' }, { key: '12b-2fa-setup' }],
				callout: {
					kind: 'tip',
					text: 'Die Administrations-Übersicht zählt „Administrator*innen ohne 2FA“ – so behalten Sie im Blick, wer noch nachziehen muss.'
				}
			},
			{
				id: 'organisation',
				short: 'Organisation',
				title: 'Organisation und Systemname eintragen',
				text: [
					'Tragen Sie Systemname, Systemsprache sowie Name, Anschrift und Kontakt Ihrer Organisation ein. Diese Angaben erscheinen in Briefen und PDFs. Logo und Akzentfarbe legen Sie im Tab „Design“ fest.'
				],
				path: ['Administration', 'Einstellungen', 'Allgemein'],
				shots: [{ key: '05-settings' }]
			},
			{
				id: 'e-mail',
				short: 'E-Mail-Versand',
				title: 'E-Mail-Versand einrichten',
				text: [
					'Tragen Sie SMTP-Host, Port, Benutzer, Passwort und Absenderadresse ein und speichern Sie. Das Passwort wird verschlüsselt gespeichert und nie an den Browser übertragen.',
					'Prüfen Sie die Verbindung im Abschnitt „Test-E-Mail“: Empfänger eingeben und „Test-E-Mail senden“ klicken.'
				],
				path: ['Administration', 'Einstellungen', 'E-Mail-Versand'],
				shots: [{ key: '06-settings-mail' }]
			},
			{
				id: 'speicher',
				short: 'Speicher (S3)',
				title: 'Speicher prüfen',
				text: [
					'Mit dem Dokploy-Stack ist MinIO bereits vorkonfiguriert; bei externem S3 stehen hier die Werte aus der Environment. Klicken Sie auf „Verbindung testen“, um den Zugriff zu prüfen. Endpoint, Bucket, Schlüssel, maximale Dateigröße und erlaubte Dateitypen können Sie hier jederzeit ändern.'
				],
				path: ['Administration', 'Einstellungen', 'Speicher'],
				shots: [{ key: '07-settings-storage', crop: true }]
			},
			{
				id: 'pdf',
				short: 'PDF-Layout',
				title: 'PDF-Layout festlegen',
				text: [
					'Ein Layout für alle erzeugten Dokumente: Seitenformat, Ausrichtung, Ränder, Kopf- und Fußzeile sowie das Logo im Header. Logo und Organisationsdaten kommen aus „Design“ bzw. „Allgemein“.'
				],
				path: ['Administration', 'Einstellungen', 'PDF'],
				shots: [{ key: '08-settings-pdf' }]
			},
			{
				id: 'module',
				short: 'Modul installieren',
				title: 'Das erste Modul installieren',
				text: [
					'Der Core bringt bewusst keine Fachmodule mit. Termine, Dateien, Notizen, Aufgaben und mehr installieren Sie direkt in der Oberfläche – per GitHub-Link oder ZIP-Datei, ohne Terminal.'
				],
				path: ['Administration', 'Module', 'Installieren'],
				shots: [],
				substeps: [
					{
						title: 'Quelle wählen',
						text: 'Fügen Sie einen GitHub-Link ein – ein ganzes Repository, einen Ordner oder einen Branch/Tag, z. B. `github:org/repo/modules/x#v2.0.0` – oder wählen Sie eine ZIP-Datei (höchstens 50 MB). Klicken Sie auf „Quelle laden“. Zum Ausprobieren eignen sich die Basismodule unter `https://github.com/KalypzoSolutions/atrium-basic-modules`.',
						shot: { key: '04-module-install' },
						callout: {
							kind: 'info',
							text: 'Auf derselben Seite hinterlegen Sie optional einen GitHub-Token (für private Repositorys) und schränken unter „Erlaubte Quellen“ ein, aus welchen Repositorys installiert werden darf (je Zeile `owner/repo` oder `owner/*`).'
						}
					},
					{
						title: 'Module auswählen',
						text: 'Atrium liest den Katalog `atrium-modules.json` der Quelle und listet alle Module mit ID, Version und Beschreibung. Der Commit wird festgehalten, damit genau dieser Stand installiert wird. Gewünschte Module ankreuzen und „Vorschau anzeigen“ klicken.',
						shot: { key: '04b-module-install-select', crop: true }
					},
					{
						title: 'Vorschau prüfen und installieren',
						text: 'Die Vorschau zeigt je Modul Version, Quelle mit Commit, benötigte Core-Version, neue Rechte, Datenbank-Migrationen, npm-Pakete und Dateianzahl sowie empfohlene optionale Module. Kreuzen Sie „Ich habe die Quelle geprüft und vertraue ihr.“ an, geben Sie Ihr Konto-Passwort (und ggf. den 2FA-Code) ein und klicken Sie auf „Installieren“.',
						shot: { key: '04c-module-install-preview', crop: true },
						callout: {
							kind: 'warn',
							text: 'Modulcode läuft mit vollen Rechten auf Ihrem Server. Installieren Sie nur Module aus Quellen, denen Sie vertrauen.'
						}
					},
					{
						title: 'Neu starten lassen und aktivieren',
						text: 'Atrium baut die App im Hintergrund neu und startet sie automatisch. Neue Module sind zunächst deaktiviert: Aktivieren Sie sie im Tab „Installiert“ – danach erscheinen sie in Navigation und API.',
						shot: { key: '03-modules' },
						note: 'Der Screenshot zeigt den Tab „Installiert“ im Ausgangszustand der Demo-Instanz, noch ohne Module.'
					}
				]
			},
			{
				id: 'benutzer',
				short: 'Benutzer anlegen',
				title: 'Benutzer*innen anlegen',
				text: [
					'Mit „Benutzer anlegen“ erstellen Sie Konten für Ihr Team und weisen Rollen zu. Die Liste zeigt Rollen, Status, 2FA und letzte Anmeldung; Suche, Filter und CSV-Export helfen bei vielen Konten.'
				],
				path: ['Administration', 'Benutzer'],
				shots: [{ key: '09-users' }]
			},
			{
				id: 'rollen',
				short: 'Rollen & Rechte',
				title: 'Rollen und Berechtigungen festlegen',
				text: [
					'Rollen bündeln Berechtigungen. Mit „Rolle anlegen“ erstellen Sie eigene Rollen und kreuzen die Rechte je Bereich an; die Systemrolle „Administrator“ ist schreibgeschützt.',
					'Sie können nur Rechte vergeben, die Sie selbst besitzen. Als „Admin-gleich“ markierte Rechte – etwa Modulinstallation, Datensicherung oder Zurücksetzen – dürfen nur Administrator*innen vergeben.'
				],
				path: ['Administration', 'Rollen'],
				shots: [{ key: '10-roles' }, { key: '10b-role-edit' }]
			},
			{
				id: 'api-keys',
				short: 'API-Key erstellen',
				title: 'Einen API-Key erstellen',
				text: [
					'Klicken Sie auf „API-Key erstellen“, vergeben Sie einen Namen, optional ein Ablaufdatum, und wählen Sie die benötigten Scopes. Der Schlüssel wird nur ein einziges Mal angezeigt – kopieren Sie ihn sofort.',
					'Wirksam ist die Schnittmenge aus Scopes und Ihren eigenen Berechtigungen. Für das Beispiel unten braucht der Key den Scope `core.users.view`; die Antwort kommt als `{ "data": … }`.'
				],
				path: ['Administration', 'Schnittstellen', 'API-Keys'],
				shots: [{ key: '11-api-keys' }, { key: '11b-api-key-create' }],
				code: {
					title: 'Terminal',
					code: CURL('Schlüssel aus dem Dialog (wird nur einmal angezeigt)'),
					label: 'curl-Beispiel für einen Aufruf der REST-API mit API-Key'
				}
			},
			{
				id: 'audit-log',
				short: 'Audit-Log',
				title: 'Im Audit-Log nachvollziehen, was passiert',
				text: [
					'Sicherheitsrelevante Ereignisse – Anmeldungen, neue Keys, Rechteänderungen – landen unveränderlich im Audit-Log, mit Zeitpunkt, Akteur, Ziel und IP-Adresse. Filtern Sie nach Text, Aktions-Präfix (z. B. `core.user`) und Zeitraum.'
				],
				path: ['Administration', 'Audit-Log'],
				shots: [{ key: '13-audit-log' }]
			},
			{
				id: 'datensicherung',
				short: 'Datensicherung',
				title: 'Eine Datensicherung anlegen',
				text: [
					'Wählen Sie im Tab „Export“ die Bereiche (Benutzer, Rollen, Einstellungen, Audit-Log, optional Dateien …) und legen Sie ein Sicherungs-Passwort fest – die Datei wird damit verschlüsselt. Über „Import“ spielen Sie eine Sicherung wieder ein.'
				],
				path: ['Administration', 'Datensicherung'],
				shots: [{ key: '14-backup' }],
				callout: {
					kind: 'warn',
					text: 'Bewahren Sie Sicherungs-Passwort und `APP_SECRET` getrennt von der Sicherungsdatei auf. Für automatische Datenbank-Sicherungen gibt es zusätzlich den Dienst `db-backup` (siehe Dokumentation).'
				}
			},
			{
				id: 'suche',
				short: 'Globale Suche',
				title: 'Alles finden mit Strg + K',
				text: [
					'Die globale Suche öffnet sich über das Suchfeld oben oder mit Strg + K. Sie findet Benutzer*innen, Rollen, Verwaltungsseiten und Inhalte der Module. Mit ↑/↓ wählen, Enter öffnet, Esc schließt.'
				],
				path: ['Suchen', 'Strg + K'],
				shots: [{ key: '15-search' }]
			},
			{
				id: 'api-uebersicht',
				short: 'API-Übersicht',
				title: 'Die API erkunden',
				text: [
					'Die API-Übersicht listet alle REST-Endpunkte von Core und installierten Modulen – automatisch aus dem Code erzeugt, mit Methode, Pfad, Beschreibung und Zugriff. „OpenAPI (JSON)“ liefert die Spezifikation unter `/api/v1/openapi.json`, etwa für Code-Generatoren.'
				],
				path: ['Administration', 'Schnittstellen', 'API-Übersicht'],
				shots: [{ key: '16-api-docs' }]
			}
		]
	},
	done: {
		id: 'geschafft',
		title: 'Geschafft!',
		lead: 'Ihre Instanz läuft, ist abgesichert und bereit für Ihr Team. So geht es weiter:',
		cards: [
			{ title: 'Module', text: 'Module installieren, aktualisieren und selbst entwickeln.', href: '/docs/modules' },
			{ title: 'REST-API', text: 'Authentifizierung, Endpunkte, Fehler und Beispiele.', href: '/docs/api' },
			{ title: 'Sicherheit', text: '2FA, Rechte, Secrets und Härtung im Betrieb.', href: '/docs/security' },
			{ title: 'GitHub', text: 'Quellcode, Issues und Releases von Kalypzo Atrium.', href: GITHUB_URL, external: true }
		]
	},
	ui: {
		clickPath: 'Klickpfad',
		copy: 'Kopieren',
		copied: 'Kopiert',
		step: 'Schritt',
		partA: 'Teil A · Installieren',
		partB: 'Teil B · Erste Schritte',
		moreShots: 'Weitere Screenshots',
		enlarge: 'Vergrößern',
		close: 'Schließen'
	},
	totalTime: 'PT45M'
};

const en: GuideCopy = {
	seo: {
		title: 'Guide: install and set up Kalypzo Atrium',
		description:
			'Illustrated step-by-step guide: install Kalypzo Atrium with Dokploy or Docker Compose, secure your account with 2FA, set up email, storage and PDF, install modules, create roles and API keys.'
	},
	hero: {
		eyebrow: 'Illustrated guide',
		titleA: 'From zero to a running',
		titleB: 'Atrium instance',
		lead: 'Install with Dokploy or Docker Compose, then take your first steps in Atrium – every step with its click path and a real screenshot.',
		time: 'about 45 minutes',
		timeLabel: 'Time needed',
		parts: '2 parts · 22 screenshots',
		ctaStart: 'Let’s go',
		ctaDocs: 'Quickstart in the docs'
	},
	nav: { label: 'Guide steps', mobile: 'Contents', done: 'Done' },
	partA: {
		id: 'install',
		eyebrow: 'Part A',
		title: 'Install Atrium',
		lead: 'Dokploy is recommended: connect the repository, fill in a few variables, click “Deploy”. Docker Compose works as an alternative.',
		dokploy: {
			id: 'dokploy',
			short: 'Install with Dokploy',
			badge: 'Recommended',
			title: 'Install with Dokploy',
			lead: 'Dokploy builds the app straight from the repository, starts PostgreSQL and (optionally) MinIO as S3 storage, and handles HTTPS through Traefik.',
			steps: [
				{
					title: 'Check the prerequisites',
					text: 'You need a server running Dokploy and a (sub)domain whose DNS record points to it – for example `atrium.example.org`. Create a project in Dokploy or open an existing one.'
				},
				{
					title: 'Create a Compose service from Git',
					text: 'In the project, click “Create Service” → “Compose”. Choose “Git” as the provider, enter the values below and pick the type “Docker Compose”.',
					fields: [
						{ label: 'Repository', value: `${GITHUB_URL}` },
						{ label: 'Branch', value: 'main' },
						{ label: 'Compose path', value: './docker-compose.dokploy.yml' }
					],
					callout: {
						kind: 'tip',
						text: 'For production we recommend an external S3 service (e.g. Hetzner Object Storage, Cloudflare R2, AWS S3). Use the compose path `./docker-compose.dokploy-external-s3.yml` – that stack runs without MinIO.'
					}
				},
				{
					title: 'Generate secrets',
					text: 'Every password and key should be random. On any machine with OpenSSL, this command prints suitable values you can paste straight into the environment:',
					code: { title: 'Terminal', code: SECRETS, label: 'Shell command that generates random values' }
				},
				{
					title: 'Fill in the environment',
					text: 'On the “Environment” tab, enter the required variables and save. The template `.env.dokploy.example` in the repository lists every other, optional variable (e.g. `SMTP_*` for email delivery).',
					code: { title: 'Environment', code: ENV_DOKPLOY_EN, label: 'Required variables for the Dokploy stack' },
					callout: {
						kind: 'info',
						text: 'With external S3, drop `MINIO_*`. Set `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` instead, plus `S3_ENDPOINT` (empty = AWS) and `S3_FORCE_PATH_STYLE` if needed.'
					}
				},
				{
					title: 'Connect the domain',
					text: 'On the “Domains” tab, add a domain for the service `app` on port `3000` and enable HTTPS.',
					callout: {
						kind: 'warn',
						text: '`ORIGIN` must match the public URL exactly, including `https://` and without a trailing slash. Cookies, CSRF protection and sign-in redirects depend on it.'
					}
				},
				{
					title: 'Click Deploy',
					text: '“Deploy” builds the image and starts the stack. On first start, database migrations, module sync and creating the administrator happen automatically. Storage and email values from the environment are copied into the settings as long as nothing is set there yet.'
				},
				{
					title: 'Clean up',
					text: 'Once you have signed in and changed your password (see part B), remove `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from the environment again. Keep `APP_SECRET` safe and separate – without it, stored secrets can no longer be decrypted.'
				}
			]
		},
		compose: {
			id: 'docker-compose',
			short: 'Alternative: Docker Compose',
			title: 'Alternative: Docker Compose',
			lead: 'Without Dokploy, start Atrium with the bundled `docker-compose.yml` (PostgreSQL and the app). The app only listens on `127.0.0.1`; for HTTPS, enable the `proxy` profile with nginx or put your own reverse proxy in front.',
			code: {
				title: 'Terminal',
				code: COMPOSE('set ORIGIN, APP_SECRET, POSTGRES_PASSWORD and INITIAL_ADMIN_* in .env', 'app and db: healthy'),
				label: 'Commands to install with Docker Compose'
			},
			note: 'The documentation covers every variable, the nginx profile, automatic backups and updates in detail.',
			links: [
				{ label: 'Install with Docker', href: '/docs/installation' },
				{ label: 'Dokploy in detail', href: '/docs/dokploy' }
			]
		}
	},
	partB: {
		id: 'first-steps',
		eyebrow: 'Part B',
		title: 'First steps in Atrium',
		lead: 'Your instance is running. Now sign in, secure your account, set up the key services and install your first module.',
		steps: [
			{
				id: 'sign-in',
				short: 'Sign in',
				title: 'Sign in for the first time',
				text: [
					'Open your domain in the browser; Atrium redirects to the sign-in page. Sign in with the values from `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`.',
					'The QR code on the right lets you sign in later without a password, by scanning it with a phone that is already signed in.'
				],
				path: ['atrium.example.org/login'],
				shots: [{ key: '01-login' }]
			},
			{
				id: 'orientation',
				short: 'Find your way',
				title: 'Find your way: dashboard and administration',
				text: [
					'After signing in you land on the dashboard. The navigation is on the left; global search, the light/dark toggle and the user menu are at the top.',
					'“Administration” shows key figures and every admin area: People & permissions, Settings, Modules, Interfaces and Log & maintenance. The search box at the top jumps straight to a setting.'
				],
				path: ['Administration'],
				shots: [{ key: '02-dashboard' }, { key: '02b-admin-overview' }]
			},
			{
				id: 'secure-account',
				short: 'Secure your account (2FA)',
				title: 'Change your password and turn on 2FA',
				text: [
					'First, change the initial password from the environment (at least 12 characters). Then turn on two-factor authentication with “Turn on” and confirm with your password (“Next”).',
					'Scan the QR code with your authenticator app, store the ten backup codes safely, enter the 6-digit code and click “Finish activation”.'
				],
				path: ['User menu', 'Profile', 'Security'],
				shots: [{ key: '12-2fa' }, { key: '12b-2fa-setup' }],
				callout: {
					kind: 'tip',
					text: 'The administration overview counts “administrators without 2FA” – an easy way to see who still has to catch up.'
				}
			},
			{
				id: 'organization',
				short: 'Organization',
				title: 'Enter your organization and system name',
				text: [
					'Enter the system name, system language and your organization’s name, address and contact details. They appear in letters and PDFs. Set the logo and accent colour on the “Design” tab.'
				],
				path: ['Administration', 'Settings', 'General'],
				shots: [{ key: '05-settings' }]
			},
			{
				id: 'email',
				short: 'Email delivery',
				title: 'Set up email delivery',
				text: [
					'Enter the SMTP host, port, user, password and sender address, then save. The password is stored encrypted and never sent to the browser.',
					'Check the connection in the “Test email” section: enter a recipient and click “Send test email”.'
				],
				path: ['Administration', 'Settings', 'Email delivery'],
				shots: [{ key: '06-settings-mail' }]
			},
			{
				id: 'storage',
				short: 'Storage (S3)',
				title: 'Check storage',
				text: [
					'With the Dokploy stack, MinIO is preconfigured; with external S3 you will see the values from the environment. Click “Test connection” to verify access. You can change endpoint, bucket, keys, maximum file size and allowed file types here at any time.'
				],
				path: ['Administration', 'Settings', 'Storage'],
				shots: [{ key: '07-settings-storage', crop: true }]
			},
			{
				id: 'pdf',
				short: 'PDF layout',
				title: 'Define the PDF layout',
				text: [
					'One layout for every generated document: page format, orientation, margins, header and footer, and the logo in the header. Logo and organization details come from “Design” and “General”.'
				],
				path: ['Administration', 'Settings', 'PDF'],
				shots: [{ key: '08-settings-pdf' }]
			},
			{
				id: 'modules',
				short: 'Install a module',
				title: 'Install your first module',
				text: [
					'The core deliberately ships without business modules. You install events, files, notes, tasks and more right in the UI – from a GitHub link or a ZIP file, no terminal needed.'
				],
				path: ['Administration', 'Modules', 'Install'],
				shots: [],
				substeps: [
					{
						title: 'Choose a source',
						text: 'Paste a GitHub link – a whole repository, a folder or a branch/tag, e.g. `github:org/repo/modules/x#v2.0.0` – or pick a ZIP file (max. 50 MB). Click “Load source”. To try it out, use the basic modules at `https://github.com/KalypzoSolutions/atrium-basic-modules`.',
						shot: { key: '04-module-install' },
						callout: {
							kind: 'info',
							text: 'The same page lets you store an optional GitHub token (for private repositories) and restrict under “Allowed sources” which repositories may be installed from (one `owner/repo` or `owner/*` per line).'
						}
					},
					{
						title: 'Select modules',
						text: 'Atrium reads the source’s `atrium-modules.json` catalog and lists every module with ID, version and description. The commit is pinned so exactly that state gets installed. Tick the modules you want and click “Show preview”.',
						shot: { key: '04b-module-install-select', crop: true }
					},
					{
						title: 'Review the preview and install',
						text: 'For each module the preview shows version, source with commit, required core version, new permissions, database migrations, npm packages and file count, plus recommended optional modules. Tick “I have checked the source and trust it.”, enter your account password (and 2FA code if enabled) and click “Install”.',
						shot: { key: '04c-module-install-preview', crop: true },
						callout: {
							kind: 'warn',
							text: 'Module code runs with full privileges on your server. Only install modules from sources you trust.'
						}
					},
					{
						title: 'Let it restart, then enable',
						text: 'Atrium rebuilds the app in the background and restarts it automatically. New modules start out disabled: enable them on the “Installed” tab – then they appear in the navigation and the API.',
						shot: { key: '03-modules' },
						note: 'The screenshot shows the “Installed” tab in the demo instance’s initial state, before any module is installed.'
					}
				]
			},
			{
				id: 'users',
				short: 'Create users',
				title: 'Create user accounts',
				text: [
					'“Create user” adds accounts for your team and assigns roles. The list shows roles, status, 2FA and last sign-in; search, filters and CSV export help once there are many accounts.'
				],
				path: ['Administration', 'Users'],
				shots: [{ key: '09-users' }]
			},
			{
				id: 'roles',
				short: 'Roles & permissions',
				title: 'Define roles and permissions',
				text: [
					'Roles bundle permissions. “Create role” lets you add your own roles and tick permissions per area; the system role “Administrator” is read-only.',
					'You can only grant permissions you have yourself. Permissions marked “Admin-level” – such as module installation, backup or reset – can only be granted by administrators.'
				],
				path: ['Administration', 'Roles'],
				shots: [{ key: '10-roles' }, { key: '10b-role-edit' }]
			},
			{
				id: 'api-keys',
				short: 'Create an API key',
				title: 'Create an API key',
				text: [
					'Click “Create API key”, enter a name, optionally an expiry date, and select the scopes you need. The key is shown only once – copy it right away.',
					'Effective rights are the intersection of the scopes and your own permissions. The example below needs the scope `core.users.view`; responses come as `{ "data": … }`.'
				],
				path: ['Administration', 'Interfaces', 'API keys'],
				shots: [{ key: '11-api-keys' }, { key: '11b-api-key-create' }],
				code: {
					title: 'Terminal',
					code: CURL('Key from the dialog (shown only once)'),
					label: 'curl example calling the REST API with an API key'
				}
			},
			{
				id: 'audit-log',
				short: 'Audit log',
				title: 'Trace what happened in the audit log',
				text: [
					'Security-relevant events – sign-ins, new keys, permission changes – are recorded in the append-only audit log with time, actor, target and IP address. Filter by text, action prefix (e.g. `core.user`) and date range.'
				],
				path: ['Administration', 'Audit log'],
				shots: [{ key: '13-audit-log' }]
			},
			{
				id: 'backup',
				short: 'Backup',
				title: 'Create a backup',
				text: [
					'On the “Export” tab, choose the areas (users, roles, settings, audit log, optionally files …) and set a backup password – the file is encrypted with it. “Import” restores a backup.'
				],
				path: ['Administration', 'Backup'],
				shots: [{ key: '14-backup' }],
				callout: {
					kind: 'warn',
					text: 'Keep the backup password and `APP_SECRET` separate from the backup file. For automatic database backups there is also the `db-backup` service (see the documentation).'
				}
			},
			{
				id: 'search',
				short: 'Global search',
				title: 'Find anything with Ctrl + K',
				text: [
					'Global search opens from the search box at the top or with Ctrl + K. It finds users, roles, admin pages and module content. Select with ↑/↓, Enter opens, Esc closes.'
				],
				path: ['Search', 'Ctrl + K'],
				shots: [{ key: '15-search' }]
			},
			{
				id: 'api-overview',
				short: 'API overview',
				title: 'Explore the API',
				text: [
					'The API overview lists every REST endpoint of the core and installed modules – generated from the code, with method, path, description and access. “OpenAPI (JSON)” serves the specification at `/api/v1/openapi.json`, e.g. for code generators.'
				],
				path: ['Administration', 'Interfaces', 'API overview'],
				shots: [{ key: '16-api-docs' }]
			}
		]
	},
	done: {
		id: 'done',
		title: 'Done!',
		lead: 'Your instance is running, secured and ready for your team. Where to go next:',
		cards: [
			{ title: 'Modules', text: 'Install, update and build your own modules.', href: '/docs/modules' },
			{ title: 'REST API', text: 'Authentication, endpoints, errors and examples.', href: '/docs/api' },
			{ title: 'Security', text: '2FA, permissions, secrets and hardening in production.', href: '/docs/security' },
			{ title: 'GitHub', text: 'Source code, issues and releases of Kalypzo Atrium.', href: GITHUB_URL, external: true }
		]
	},
	ui: {
		clickPath: 'Click path',
		copy: 'Copy',
		copied: 'Copied',
		step: 'Step',
		partA: 'Part A · Install',
		partB: 'Part B · First steps',
		moreShots: 'More screenshots',
		enlarge: 'Enlarge',
		close: 'Close'
	},
	totalTime: 'PT45M'
};

const copies: Record<Lang, GuideCopy> = { de, en };
export const guide = (lang: Lang): GuideCopy => copies[lang];
