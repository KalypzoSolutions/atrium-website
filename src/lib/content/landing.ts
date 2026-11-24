import type { Lang } from '$lib/config';

/** Icon-Schlüssel; die Zuordnung zu Lucide-Komponenten liegt in `components/landing/Features.svelte`. */
export type IconKey =
	| 'shield'
	| 'users'
	| 'scroll'
	| 'download'
	| 'file'
	| 'sparkles'
	| 'storage'
	| 'mail'
	| 'puzzle'
	| 'timer'
	| 'backup'
	| 'languages';

export interface FeatureItem {
	icon: IconKey;
	title: string;
	text: string;
}

export interface FaqItem {
	q: string;
	a: string;
}

interface DeployCard {
	title: string;
	text: string;
	steps: string[];
	cta: string;
}

export interface LandingCopy {
	seo: { title: string; description: string };
	hero: {
		badge: string;
		titleA: string;
		titleB: string;
		lead: string;
		ctaPrimary: string;
		ctaSecondary: string;
		shotAlt: string;
	};
	built: { label: string };
	features: {
		eyebrow: string;
		title: string;
		lead: string;
		groups: { title: string; items: FeatureItem[] }[];
	};
	modules: {
		eyebrow: string;
		title: string;
		lead: string;
		steps: { title: string; text: string }[];
		codeCaption: string;
		cta: string;
	};
	showcase: { eyebrow: string; title: string; lead: string; tabsLabel: string };
	api: {
		eyebrow: string;
		title: string;
		lead: string;
		points: { title: string; text: string }[];
		cta: string;
		codeLabel: string;
	};
	deploy: {
		eyebrow: string;
		title: string;
		lead: string;
		compose: DeployCard;
		dokploy: DeployCard;
		guide: { title: string; tag: string; text: string; cta: string };
	};
	faq: { eyebrow: string; title: string; items: FaqItem[] };
	cta: { title: string; lead: string; primary: string; secondary: string };
	ui: { step: string };
}

const de: LandingCopy = {
	seo: {
		title: 'Kalypzo Atrium – modulare, selbst gehostete Verwaltungsplattform',
		description:
			'Selbst gehostete Verwaltungsplattform mit 2FA, Rollen & Rechten, REST-API, PDF-, KI- und S3-Diensten. Fachmodule per GitHub-Link oder ZIP installieren, mit Docker oder Dokploy betreiben.'
	},
	hero: {
		badge: 'Modular · zweisprachig · mit REST-API',
		titleA: 'Ihre Verwaltungsplattform.',
		titleB: 'Selbst gehostet.',
		lead: 'Ein schlanker Core mit 2FA, Rollen und Rechten, REST-API sowie PDF-, KI- und S3-Diensten – erweiterbar über Module, betrieben mit Docker.',
		ctaPrimary: 'Schnellstart',
		ctaSecondary: 'GitHub',
		shotAlt: 'Dashboard von Kalypzo Atrium mit Navigation, Aufgaben und Wochenübersicht'
	},
	built: { label: 'Gebaut mit' },
	features: {
		eyebrow: 'Funktionen',
		title: 'Alles Wichtige – schon im Core',
		lead: 'Sicherheit, Plattform-Dienste und Betrieb sind eingebaut. Die Fachlichkeit Ihrer Organisation kommt über Module.',
		groups: [
			{
				title: 'Sicherheit',
				items: [
					{ icon: 'shield', title: 'Anmeldung mit 2FA', text: 'TOTP, Backup-Codes und Schutz vor Brute-Force.' },
					{ icon: 'users', title: 'Rollen & Berechtigungen', text: 'Feingranulares RBAC, serverseitig geprüft.' },
					{ icon: 'scroll', title: 'Unveränderliches Audit-Log', text: 'Per Datenbank-Trigger unveränderlich.' },
					{ icon: 'download', title: 'Datenauskunft nach DSGVO', text: 'Personenbezogene Daten gebündelt exportieren.' }
				]
			},
			{
				title: 'Plattform-Dienste',
				items: [
					{ icon: 'file', title: 'PDF-Service', text: 'HTML zu PDF mit Playwright/Chromium.' },
					{ icon: 'sparkles', title: 'KI-Service', text: 'Texte über das OpenAI-SDK, je Modul freigegeben.' },
					{ icon: 'storage', title: 'S3-Storage & Bilder', text: 'Jeder S3-kompatible Speicher, etwa MinIO.' },
					{ icon: 'mail', title: 'Mail & Web Push', text: 'SMTP-Versand und Browser-Benachrichtigungen.' }
				]
			},
			{
				title: 'Betrieb',
				items: [
					{ icon: 'puzzle', title: 'Modulverwaltung', text: 'Per GitHub-Link oder ZIP, mit automatischem Rückfall.' },
					{ icon: 'timer', title: 'Jobs, Suche & Dashboard', text: 'Hintergrundjobs, globale Suche, zentraler Einstieg.' },
					{ icon: 'backup', title: 'Datensicherung & Reset', text: 'Sicherungen und geprüfte Wiederherstellung.' },
					{ icon: 'languages', title: 'Zweisprachig & eigenes Branding', text: 'Deutsch/Englisch, Logo und Briefkopf per Profil-Modul.' }
				]
			}
		]
	},
	modules: {
		eyebrow: 'Module',
		title: 'Fachmodule in drei Schritten',
		lead: 'Eigenständige Pakete aus Ihrem Repository – geprüft, neu gebaut und erst aktiv, wenn alles läuft.',
		steps: [
			{ title: 'Quelle angeben', text: 'GitHub-Link eintragen oder ZIP-Archiv hochladen.' },
			{ title: 'Vorschau prüfen', text: 'Core-Version und Abhängigkeiten werden vorab abgeglichen.' },
			{ title: 'Neu bauen & aktivieren', text: 'Probelauf und Health-Check – bei Fehlern läuft die vorige Version weiter.' }
		],
		codeCaption: 'atrium-module.json – die statische Paketbeschreibung jedes Moduls',
		cta: 'Module im Detail'
	},
	showcase: {
		eyebrow: 'Einblicke',
		title: 'Eine aufgeräumte Oberfläche',
		lead: 'Im hellen wie im dunklen Modus. Zum Vergrößern anklicken.',
		tabsLabel: 'Screenshots auswählen'
	},
	api: {
		eyebrow: 'REST-API',
		title: 'Eine API für Oberfläche und Integrationen',
		lead: 'Freigegebene Core- und Modulfunktionen unter /api/v1 – mit denselben Rechten wie in der Oberfläche.',
		points: [
			{ title: 'API-Keys mit Scopes', text: 'Ein Key kann nie mehr als sein Besitzer.' },
			{ title: 'OpenAPI 3.1', text: 'Aus den Zod-Schemas erzeugt, abrufbar unter /api/v1/openapi.json.' },
			{ title: 'Klare Konventionen', text: 'Einheitliche Fehler mit Request-ID und Rate Limiting je Key.' }
		],
		cta: 'API-Dokumentation',
		codeLabel: 'Beispielaufruf mit API-Key'
	},
	deploy: {
		eyebrow: 'Deployment',
		title: 'In wenigen Minuten auf Ihrem Server',
		lead: 'Ein Docker-Stack mit PostgreSQL und S3-Speicher. Wählen Sie den passenden Weg.',
		compose: {
			title: 'Docker Compose',
			text: 'Für den eigenen Server, optional mit Nginx für HTTPS.',
			steps: ['.env aus .env.example anlegen', 'APP_SECRET, ORIGIN und Admin setzen', 'docker compose up -d --build'],
			cta: 'Installation'
		},
		dokploy: {
			title: 'Dokploy',
			text: 'Git-Deployment mit App, PostgreSQL und MinIO in einem Stack.',
			steps: ['Compose-Service mit Git-Provider anlegen', 'Pfad ./docker-compose.dokploy.yml wählen', 'Variablen eintragen und deployen'],
			cta: 'Dokploy-Anleitung'
		},
		guide: {
			title: 'Schritt für Schritt',
			tag: 'Bebildert',
			text: 'Die Anleitung führt Sie mit Screenshots von der Installation bis zum ersten eigenen Modul.',
			cta: 'Zur Anleitung'
		}
	},
	faq: {
		eyebrow: 'FAQ',
		title: 'Häufige Fragen',
		items: [
			{
				q: 'Was ist Kalypzo Atrium?',
				a: 'Eine selbst gehostete, webbasierte Verwaltungsplattform. Ein neutraler, zweisprachiger Core stellt Anmeldung mit 2FA, Rollen und Rechte, Einstellungen, REST-API, PDF-, KI-, Bild- und S3-Dienste, Mail, Benachrichtigungen, Hintergrundjobs, Suche, Audit-Log und Datensicherung bereit. Die Fachlichkeit kommt über installierbare Module.'
			},
			{
				q: 'Für welche Organisationen eignet sich Atrium?',
				a: 'Für alle, die interne Abläufe auf eigener Infrastruktur verwalten möchten. Die Funktionen bestimmen die Module: Die Modulsammlung ep-intern-modules der Edelweißpiraten zeigt etwa, wie eine Vereinsverwaltung mit Mitgliedern, Kasse und Veranstaltungen auf Atrium aufbaut.'
			},
			{
				q: 'Wie installiere ich Module?',
				a: 'Unter Administration → Module → Installieren geben Sie einen GitHub-Link an oder laden ein ZIP hoch. Atrium zeigt eine Vorschau mit Abhängigkeiten, baut die Anwendung im Container neu und startet sie nach erfolgreichem Health-Check. Schlägt etwas fehl, läuft die vorige Version weiter.'
			},
			{
				q: 'Kann ich eigene Module entwickeln?',
				a: 'Ja. Ein Modul besteht aus atrium-module.json, module.ts, optionalen Seiten und SQL-Migrationen. Über das Modul-SDK nutzt es die Core-Dienste, erhält ein eigenes PostgreSQL-Schema und kann eigene Berechtigungen, Einstellungen und API-Endpunkte definieren.'
			},
			{
				q: 'Was brauche ich für den Betrieb?',
				a: 'Einen Server mit Docker. Der Stack umfasst die App, PostgreSQL und einen S3-kompatiblen Speicher wie MinIO. Für den Neubau beim Installieren von Modulen sehen die Dokploy-Compose-Dateien standardmäßig 4 GB Arbeitsspeicher für den App-Container vor. Für die lokale Entwicklung benötigen Sie Node.js 24 oder neuer.'
			},
			{
				q: 'Wo liegen meine Daten?',
				a: 'Ausschließlich auf Ihrer Infrastruktur: in Ihrer PostgreSQL-Datenbank und Ihrem S3-Speicher. Zugangsdaten wie SMTP- oder S3-Secrets werden AES-256-GCM-verschlüsselt in der Datenbank abgelegt.'
			},
			{
				q: 'Kann ich das Erscheinungsbild anpassen?',
				a: 'Ja. Ein Profil-Modul liefert über Hooks Logo, Mail-Kopf, PDF-Briefkopf und Standardwerte der Einstellungen. Der Core selbst bleibt dadurch neutral und updatefähig.'
			},
			{
				q: 'Gibt es eine API für andere Systeme?',
				a: 'Ja. Die REST-API unter /api/v1 nutzt API-Keys mit Scopes, ist als OpenAPI 3.1 beschrieben und deckt Core- wie Modul-Endpunkte ab.'
			}
		]
	},
	cta: {
		title: 'Bereit für Ihre eigene Plattform?',
		lead: 'Repository klonen, Stack starten, erstes Modul installieren.',
		primary: 'Schnellstart',
		secondary: 'GitHub'
	},
	ui: { step: 'Schritt' }
};

const en: LandingCopy = {
	seo: {
		title: 'Kalypzo Atrium – modular, self-hosted admin platform',
		description:
			'A self-hosted admin platform with 2FA, roles & permissions, a REST API, PDF, AI and S3 services. Install modules from a GitHub link or ZIP and run it with Docker or Dokploy.'
	},
	hero: {
		badge: 'Modular · bilingual · REST API included',
		titleA: 'Your admin platform.',
		titleB: 'Self-hosted.',
		lead: 'A lean core with 2FA, roles and permissions, a REST API and PDF, AI and S3 services – extended through modules, run with Docker.',
		ctaPrimary: 'Quickstart',
		ctaSecondary: 'GitHub',
		shotAlt: 'Kalypzo Atrium dashboard with navigation, to-dos and the weekly overview'
	},
	built: { label: 'Built with' },
	features: {
		eyebrow: 'Features',
		title: 'Everything essential, right in the core',
		lead: 'Security, platform services and operations are built in. Your organisation’s domain logic arrives as modules.',
		groups: [
			{
				title: 'Security',
				items: [
					{ icon: 'shield', title: 'Sign-in with 2FA', text: 'TOTP, backup codes and brute-force protection.' },
					{ icon: 'users', title: 'Roles & permissions', text: 'Fine-grained RBAC, enforced on the server.' },
					{ icon: 'scroll', title: 'Append-only audit log', text: 'Append-only, enforced by a database trigger.' },
					{ icon: 'download', title: 'GDPR data export', text: 'Export a person’s data in one go.' }
				]
			},
			{
				title: 'Platform services',
				items: [
					{ icon: 'file', title: 'PDF service', text: 'HTML to PDF with Playwright/Chromium.' },
					{ icon: 'sparkles', title: 'AI service', text: 'Text via the OpenAI SDK, enabled per module.' },
					{ icon: 'storage', title: 'S3 storage & images', text: 'Any S3-compatible store, such as MinIO.' },
					{ icon: 'mail', title: 'Mail & Web Push', text: 'SMTP email and browser notifications.' }
				]
			},
			{
				title: 'Operations',
				items: [
					{ icon: 'puzzle', title: 'Module management', text: 'From a GitHub link or ZIP, with automatic rollback.' },
					{ icon: 'timer', title: 'Jobs, search & dashboard', text: 'Background jobs, global search, one start page.' },
					{ icon: 'backup', title: 'Backup & reset', text: 'Backups and verified restores.' },
					{ icon: 'languages', title: 'Bilingual & your branding', text: 'German/English, logo and letterhead via a profile module.' }
				]
			}
		]
	},
	modules: {
		eyebrow: 'Modules',
		title: 'Feature modules in three steps',
		lead: 'Self-contained packages from your repository – checked, rebuilt and only switched on once everything is healthy.',
		steps: [
			{ title: 'Add a source', text: 'Paste a GitHub link or upload a ZIP archive.' },
			{ title: 'Review the preview', text: 'Core version and dependencies are checked up front.' },
			{ title: 'Rebuild & enable', text: 'Dry run and health check – on failure the previous version keeps running.' }
		],
		codeCaption: 'atrium-module.json – the static descriptor every module ships',
		cta: 'Modules in depth'
	},
	showcase: {
		eyebrow: 'Take a look',
		title: 'A clean, focused interface',
		lead: 'In light and dark mode. Click to enlarge.',
		tabsLabel: 'Choose a screenshot'
	},
	api: {
		eyebrow: 'REST API',
		title: 'One API for the UI and your integrations',
		lead: 'Exposed core and module features live under /api/v1 – with exactly the same permissions as in the UI.',
		points: [
			{ title: 'Scoped API keys', text: 'A key can never do more than its owner.' },
			{ title: 'OpenAPI 3.1', text: 'Generated from the Zod schemas, served at /api/v1/openapi.json.' },
			{ title: 'Sensible conventions', text: 'Uniform errors with request IDs and per-key rate limiting.' }
		],
		cta: 'API documentation',
		codeLabel: 'Example request with an API key'
	},
	deploy: {
		eyebrow: 'Deployment',
		title: 'Running on your server in minutes',
		lead: 'A Docker stack with PostgreSQL and S3 storage. Pick the path that fits.',
		compose: {
			title: 'Docker Compose',
			text: 'For your own server, optionally with Nginx for HTTPS.',
			steps: ['Create .env from .env.example', 'Set APP_SECRET, ORIGIN and the admin', 'docker compose up -d --build'],
			cta: 'Installation'
		},
		dokploy: {
			title: 'Dokploy',
			text: 'Git-based deployment with app, PostgreSQL and MinIO in one stack.',
			steps: ['Create a Compose service with the Git provider', 'Choose ./docker-compose.dokploy.yml', 'Add the variables and deploy'],
			cta: 'Dokploy guide'
		},
		guide: {
			title: 'Step by step',
			tag: 'Illustrated',
			text: 'The guide walks you through installation to your very first module, with screenshots.',
			cta: 'Open the guide'
		}
	},
	faq: {
		eyebrow: 'FAQ',
		title: 'Frequently asked questions',
		items: [
			{
				q: 'What is Kalypzo Atrium?',
				a: 'A self-hosted, web-based admin platform. A neutral, bilingual core provides sign-in with 2FA, roles and permissions, settings, a REST API, PDF, AI, image and S3 services, mail, notifications, background jobs, search, an audit log and backups. Domain features are added as installable modules.'
			},
			{
				q: 'What kind of organisations is Atrium for?',
				a: 'For anyone who wants to run internal processes on their own infrastructure. The modules define what the platform does: the ep-intern-modules collection by the Edelweißpiraten, for example, shows how a club management system with members, treasury and events is built on Atrium.'
			},
			{
				q: 'How do I install modules?',
				a: 'Go to Administration → Modules → Install and enter a GitHub link or upload a ZIP. Atrium shows a preview including dependencies, rebuilds the app inside the container and starts it after a successful health check. If anything fails, the previous version keeps running.'
			},
			{
				q: 'Can I build my own modules?',
				a: 'Yes. A module consists of atrium-module.json, module.ts, optional pages and SQL migrations. Through the module SDK it uses the core services, gets its own PostgreSQL schema and can define its own permissions, settings and API endpoints.'
			},
			{
				q: 'What do I need to run it?',
				a: 'A server with Docker. The stack consists of the app, PostgreSQL and S3-compatible storage such as MinIO. To rebuild when installing modules, the Dokploy compose files reserve 4 GB of memory for the app container by default. For local development you need Node.js 24 or newer.'
			},
			{
				q: 'Where is my data stored?',
				a: 'Only on your infrastructure: in your PostgreSQL database and your S3 storage. Credentials such as SMTP or S3 secrets are stored in the database encrypted with AES-256-GCM.'
			},
			{
				q: 'Can I customise the look and feel?',
				a: 'Yes. A profile module supplies the logo, mail header, PDF letterhead and default settings through hooks, so the core itself stays neutral and easy to update.'
			},
			{
				q: 'Is there an API for other systems?',
				a: 'Yes. The REST API under /api/v1 uses scoped API keys, is described as OpenAPI 3.1 and covers both core and module endpoints.'
			}
		]
	},
	cta: {
		title: 'Ready for a platform of your own?',
		lead: 'Clone the repository, start the stack, install your first module.',
		primary: 'Quickstart',
		secondary: 'GitHub'
	},
	ui: { step: 'Step' }
};

const copy: Record<Lang, LandingCopy> = { de, en };
export const landing = (lang: Lang): LandingCopy => copy[lang];

/** Technik-Zeile („Gebaut mit“), sprachneutral – bewusst nur die wichtigsten. */
export const TECH_STACK = [
	'SvelteKit',
	'Svelte 5',
	'TypeScript',
	'Tailwind CSS',
	'PostgreSQL',
	'Drizzle ORM',
	'Docker'
] as const;

export const MODULE_JSON_SAMPLE = `{
  "schema": 1,
  "id": "events",
  "name": "Veranstaltungen",
  "version": "1.0.0",
  "core": ">=2.0.0-0 <3.0.0",
  "dependencies": {
    "members": { "version": "^1.14.0" }
  },
  "permissions": ["events.event.view", "events.event.manage"]
}`;

export const API_SAMPLE = `curl -H "Authorization: Bearer $API_KEY" \\
  "https://atrium.example.org/api/v1/users?limit=10"

# → 200 OK
{ "data": [ { "id": "…", "name": "…", "email": "…" } ] }`;
