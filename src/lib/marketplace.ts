/**
 * Modul-Marktplatz („App Store“) für Kalypzo Atrium.
 *
 * Die Website führt eine kuratierte Liste von Modulquellen (GitHub-Repositories). Daraus entsteht
 * beim Build die öffentliche Registry unter MARKET_REGISTRY_PATH, die Atrium-Instanzen abrufen, um
 * Quellen zur Installation anzubieten. Der eigentliche Modulkatalog bleibt die Datei
 * `atrium-modules.json` der jeweiligen Quelle – die Modulliste hier ist nur informativ.
 * Jedes Modul hat zusätzlich einen eigenen Installationslink (`moduleSource`), der auf seinen
 * Ordner im Repository zeigt; die Registry gibt ihn als `sources[].modules[].source` aus.
 *
 * Neue Quelle eintragen: Eintrag in `marketSources` ergänzen. `validateSources` prüft die Liste
 * beim Build; ein fehlerhafter Eintrag lässt den Build fehlschlagen.
 */
import { LANGS, MARKET_SLUG, SITE_URL, type Lang } from '$lib/config';

/** Text in allen Website-Sprachen. */
export type Localized = Record<Lang, string>;

export type MarketCategory =
	| 'core'
	| 'organisation'
	| 'communication'
	| 'finance'
	| 'files'
	| 'productivity'
	| 'integration'
	| 'other';

/** Ein Modul einer Quelle (nur zur Anzeige; maßgeblich ist der Katalog der Quelle). */
export interface MarketModule {
	id: string;
	name: Localized;
	description: Localized;
	/** Eigener Installationslink; ohne Angabe der Modulordner im Repository (siehe moduleSource) */
	source?: string;
}

/** Eine Modulquelle, die Atrium über ihren GitHub-Link installieren kann. */
export interface MarketSource {
	/** kebab-case, eindeutig */
	id: string;
	name: string;
	description: Localized;
	/** https://github.com/owner/repo */
	repository: string;
	/** Installationslink für Atrium, z. B. https://github.com/owner/repo oder mit /tree/<ref>/<pfad> */
	source: string;
	ref?: string;
	path?: string;
	publisher: { name: string; url?: string };
	/** Von Kalypzo Solutions veröffentlicht */
	official: boolean;
	categories: MarketCategory[];
	tags: string[];
	license?: string;
	homepage?: string;
	/** Informativ; der echte Katalog ist die atrium-modules.json der Quelle */
	modules: MarketModule[];
	/** YYYY-MM-DD */
	addedAt: string;
}

/** Version des Registry-Formats. Nur bei inkompatiblen Änderungen erhöhen (neue Felder sind erlaubt). */
export const MARKET_SCHEMA = 1;

/** Öffentlicher Pfad der Registry (JSON), den Atrium-Instanzen abrufen. */
export const MARKET_REGISTRY_PATH = '/marketplace/v1/index.json';

/** Alle Kategorien in Anzeigereihenfolge. */
export const MARKET_CATEGORIES: MarketCategory[] = [
	'core',
	'organisation',
	'communication',
	'finance',
	'files',
	'productivity',
	'integration',
	'other'
];

/** Hilfsfunktion für Modul-Einträge. */
const mod = (id: string, de: [string, string], en: [string, string]): MarketModule => ({
	id,
	name: { de: de[0], en: en[0] },
	description: { de: de[1], en: en[1] }
});

/*
 * Module, Namen und Beschreibungen stammen aus den Katalogen modules/atrium-modules.json und den
 * Manifesten modules/<id>/atrium-module.json der Repositories (Stand 2026-11-25).
 * Beide Repositories geben auf GitHub keine Lizenz an, daher fehlt `license`.
 */
export const marketSources: MarketSource[] = [
	{
		id: 'atrium-basic-modules',
		name: 'Atrium – Basismodule',
		description: {
			de: 'Allgemeine Basismodule für Kalypzo Atrium: Termine, Dateien, Notizen, Aufgaben und Whiteboards. Ohne Pflichtabhängigkeiten zu anderen Quellen – ein guter Start für jede Instanz.',
			en: 'General-purpose base modules for Kalypzo Atrium: events, files, notes, tasks and whiteboards. No mandatory dependencies on other sources – a good starting point for every instance.'
		},
		repository: 'https://github.com/KalypzoSolutions/atrium-basic-modules',
		source: 'https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules',
		ref: 'main',
		path: 'modules',
		publisher: { name: 'Kalypzo Solutions', url: 'https://github.com/KalypzoSolutions' },
		official: true,
		categories: ['core', 'organisation', 'files', 'productivity'],
		tags: ['termine', 'kalender', 'dateien', 'notizen', 'aufgaben', 'kanban', 'whiteboard'],
		modules: [
			mod(
				'events',
				['Termine', 'Interne Termine und Termine für die Website – mit Serien, Freigabe und Kalender-Abo (iCal).'],
				['Events', 'Internal events and events for the public website – with recurrence, approval and calendar subscriptions (iCal).']
			),
			mod(
				'files',
				['Dateien', 'Cloud-Ablage mit Ordnern, Vorschau, Freigaben und öffentlichen Links.'],
				['Files', 'Cloud storage with folders, previews, sharing and public links.']
			),
			mod(
				'notes',
				[
					'Notizen',
					'Gemeinsame Notizen mit Unterseiten: live zusammen schreiben, Markdown, Tabellen, Bilder, eingebettete Whiteboards sowie Export als Markdown, PDF, Word oder HTML.'
				],
				[
					'Notes',
					'Shared notes with sub-pages: real-time collaborative editing, Markdown, tables, images, embedded whiteboards and export to Markdown, PDF, Word or HTML.'
				]
			),
			mod(
				'tasks',
				[
					'Aufgaben',
					'Kanban-Boards mit Phasen, Zeitleiste, Aufgaben, Unteraufgaben, Zuständigen und Vorlagen – auch für Aktionen.'
				],
				[
					'Tasks',
					'Kanban boards with phases, timeline, tasks, subtasks, assignees and templates – also for activities.'
				]
			),
			mod(
				'whiteboard',
				[
					'Whiteboards',
					'Gemeinsame Whiteboards zum Live-Bearbeiten: Kacheln und Formen, Verbinder, Freihand, Bilder, Dateien, Links und Karten aus anderen Modulen.'
				],
				[
					'Whiteboards',
					'Collaborative whiteboards with live editing: tiles and shapes, connectors, freehand drawing, images, files, links and cards from other modules.'
				]
			)
		],
		addedAt: '2026-11-25'
	},
	{
		id: 'ep-intern-modules',
		name: 'EP Intern – Fachmodule',
		description: {
			de: 'Fachmodule für die Stammesverwaltung der Edelweißpiraten: Mitglieder und Gruppen, Aktionen, Kasse, Material, Nachrichten, Galerien, Bestellungen und Stammeswebsite.',
			en: 'Domain modules for running the Edelweißpiraten scout group: members and groups, activities, treasury, equipment, messages, galleries, orders and the group website.'
		},
		repository: 'https://github.com/Stamm-Edelweisspiraten/ep-intern-modules',
		source: 'https://github.com/Stamm-Edelweisspiraten/ep-intern-modules/tree/main/modules',
		ref: 'main',
		path: 'modules',
		publisher: { name: 'Stamm Edelweißpiraten', url: 'https://github.com/Stamm-Edelweisspiraten' },
		official: false,
		categories: ['organisation', 'communication', 'finance', 'integration'],
		tags: ['pfadfinder', 'verein', 'mitglieder', 'kasse', 'material', 'website', 'e-mail'],
		modules: [
			mod(
				'actions',
				// Manifest ohne Beschreibung – Text selbst formuliert.
				['Aktionen', 'Fahrten, Lager und Veranstaltungen planen: Teilnehmende, Anmeldungen, Beiträge und Abrechnung.'],
				['Activities', 'Plan trips, camps and events: participants, registrations, fees and settlement.']
			),
			mod(
				'ep-stamm',
				[
					'Stammesprofil',
					'Aussehen und Vorgaben der Edelweißpiraten: Briefkopf, Mail-Kopf, Wappen als App-Icon und Ton der Schreibhilfe.'
				],
				[
					'Group profile',
					'Look and defaults of the Edelweißpiraten: letterhead, e-mail header, crest as app icon and tone of the writing assistant.'
				]
			),
			mod(
				'galleries',
				['Galerien', 'Bilder- und Videogalerien mit Freigaben, Termin-Zuordnung und Anbindung an die Stammeswebsite.'],
				['Galleries', 'Photo and video galleries with sharing, event assignment and integration with the group website.']
			),
			mod(
				'material',
				[
					'Material',
					'Materialverwaltung: Lager, Sets, Zelte, Verbrauchsmaterial und Vorräte, Reservierungen für Aktionen, Scannen per Kamera oder Barcode-Scanner, Etiketten und Listen.'
				],
				[
					'Equipment',
					'Equipment management: storage, sets, tents, consumables and supplies, reservations for activities, scanning by camera or barcode scanner, labels and lists.'
				]
			),
			mod(
				'members',
				// Manifest ohne Beschreibung – Text selbst formuliert.
				['Mitglieder & Gruppen', 'Mitgliederverwaltung mit Gruppen, eigenen Feldern, Leitungsrechten und Datenexport.'],
				['Members & groups', 'Member management with groups, custom fields, leader permissions and data export.']
			),
			mod(
				'messages',
				[
					'Nachrichten',
					'E-Mails an Mitglieder und Gruppen mit Editor, Anhängen und wählbarem Absender; Posteingang für Antworten per IMAP.'
				],
				[
					'Messages',
					'E-mails to members and groups with editor, attachments and selectable sender; inbox for replies via IMAP.'
				]
			),
			mod(
				'offices',
				['Ämter', 'Ämter mit Reihenfolge, E-Mail-Adressen, Inhaber*innen und verknüpften Rollen.'],
				['Offices', 'Offices with ordering, e-mail addresses, holders and linked roles.']
			),
			mod(
				'orders',
				[
					'Bestellungen',
					'Stammesartikel wie Halstuch oder Liederbuch bestellen – mit Rechnung über die Kasse, Lager und Einkauf.'
				],
				[
					'Orders',
					'Order group merchandise such as scarves or songbooks – with invoicing via the treasury, stock and purchasing.'
				]
			),
			mod(
				'treasury',
				[
					'Kasse',
					'Konten und Buchungen, offene Beiträge aus Aktionen, Rechnungen, Zahlungserinnerungen und Kassenberichte.'
				],
				[
					'Treasury',
					'Accounts and bookings, outstanding fees from activities, invoices, payment reminders and financial reports.'
				]
			),
			mod(
				'website',
				['Website', 'Inhalte der Stammeswebsite: Banner und Hinweise, häufige Fragen und Blog.'],
				['Website', 'Content for the group website: banners and notices, FAQ and blog.']
			)
		],
		addedAt: '2026-11-25'
	}
];

/** 'owner/repo' aus einer GitHub-URL (https://github.com/owner/repo[/…]) oder 'github:owner/repo…'. */
export function githubRepoSlug(url: string): string {
	const m =
		url.match(/^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/) ??
		url.match(/^github:([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:[/#].*)?$/);
	if (!m) throw new Error(`Keine gültige GitHub-URL: ${url}`);
	return `${m[1]}/${m[2]}`;
}

/**
 * Installationslink eines einzelnen Moduls: `m.source`, falls gesetzt, sonst der Modulordner
 * `<repository>/tree/<ref>/<path>/<id>`.
 */
export function moduleSource(s: MarketSource, m: MarketModule): string {
	if (m.source) return m.source;
	// Leere Segmente entfernen, damit weder „//“ noch ein führender „/“ entsteht (z. B. path: '/').
	const segments = (s.path ?? '').split('/').filter(Boolean);
	const dir = segments.length ? segments.join('/') + '/' : '';
	return `${s.repository}/tree/${s.ref ?? 'main'}/${dir}${m.id}`;
}

/** Pfad der Detailseite einer Quelle, z. B. /de/marktplatz/<quell-id>. */
export const marketSourcePath = (lang: Lang, sourceId: string): string => `/${lang}/${MARKET_SLUG[lang]}/${sourceId}`;

/** Pfad der Detailseite eines Moduls, z. B. /de/marktplatz/<quell-id>/<modul-id>. */
export const marketModulePath = (lang: Lang, sourceId: string, moduleId: string): string =>
	`${marketSourcePath(lang, sourceId)}/${moduleId}`;

/**
 * Zerlegt https://github.com/owner/repo[/tree/<ref>/<pfad>] in seine Teile. `path` hat weder
 * führenden noch abschließenden Slash und ist '' für das Repository-Root; `ref` fehlt ohne /tree/….
 */
export function githubLocation(url: string): { owner: string; repo: string; ref?: string; path: string } {
	const m = url.match(
		/^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:\/tree\/([^\s/?#]+)(?:\/([^\s?#]*))?)?\/?(?:[?#].*)?$/
	);
	if (!m) throw new Error(`Keine gültige GitHub-URL: ${url}`);
	const path = (m[4] ?? '').split('/').filter(Boolean).join('/');
	return { owner: m[1]!, repo: m[2]!, ...(m[3] ? { ref: m[3] } : {}), path };
}

/** Absolute URLs einer Detailseite in allen Sprachen. */
const localizedPage = (path: (l: Lang) => string): Localized =>
	Object.fromEntries(LANGS.map((l) => [l, SITE_URL + path(l)])) as Localized;

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
/**
 * Installationslinks im Marktplatz: nur https://github.com/…, weil Registry-Clients alle
 * anderen Links verwerfen (die Kurzform github:… ist hier deshalb nicht erlaubt).
 */
const SOURCE_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+(?:\/tree\/[^\s/]+(?:\/[^\s]+)?)?$/;
/**
 * Prüft einen Installationslink, der SOURCE_URL erfüllt, gegen das Repository: leere
 * Pfadsegmente sowie „.“/„..“ (auch kodiert) sind verboten, und nach der Normalisierung per
 * URL muss der Link weiterhin auf `owner/repo` des Repositorys zeigen.
 */
function sourceMatchesRepo(source: string, repository: string): boolean {
	for (const seg of source.slice('https://github.com/'.length).split('/')) {
		let decoded: string;
		try {
			decoded = decodeURIComponent(seg);
		} catch {
			return false;
		}
		if (!seg || decoded === '.' || decoded === '..' || /[/\\]/.test(decoded)) return false;
	}
	let url: URL;
	try {
		url = new URL(source);
	} catch {
		return false;
	}
	if (url.origin !== 'https://github.com') return false;
	const [owner, repo] = url.pathname.split('/').slice(1);
	return `${owner}/${repo}`.toLowerCase() === githubRepoSlug(repository).toLowerCase();
}
/** GitHub-Owner, dessen Quellen als offiziell markiert werden dürfen. */
const OFFICIAL_OWNER = 'kalypzosolutions';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Prüft, ob alle Sprachen einen nicht leeren Text haben. */
function checkLocalized(value: Localized | undefined, where: string, errors: string[]) {
	for (const l of LANGS) {
		if (!value || typeof value[l] !== 'string' || !value[l].trim()) errors.push(`${where}: Übersetzung „${l}“ fehlt`);
	}
}

/**
 * Prüft die Quellenliste und wirft beim Build einen Fehler, wenn ein Eintrag ungültig ist
 * (doppelte IDs, falsches Repository, ungültiger Installationslink, unberechtigte
 * Markierung „official“, unbekannte Kategorie,
 * fehlende Übersetzung …). Alle Fehler werden gesammelt gemeldet.
 */
export function validateSources(list: MarketSource[]): MarketSource[] {
	const errors: string[] = [];
	const ids = new Set<string>();
	for (const [i, s] of list.entries()) {
		const where = `marketSources[${i}] (${s.id || '?'})`;
		if (!KEBAB.test(s.id ?? '')) errors.push(`${where}: id muss kebab-case sein`);
		if (ids.has(s.id)) errors.push(`${where}: id ist doppelt`);
		ids.add(s.id);
		if (!s.name?.trim()) errors.push(`${where}: name fehlt`);
		checkLocalized(s.description, `${where}.description`, errors);
		if (!REPO_URL.test(s.repository ?? '')) {
			errors.push(`${where}: repository muss https://github.com/owner/repo sein`);
		}
		if (!SOURCE_URL.test(s.source ?? '')) {
			errors.push(`${where}: source muss https://github.com/owner/repo[/tree/…] sein`);
		} else if (REPO_URL.test(s.repository ?? '')) {
			if (!sourceMatchesRepo(s.source, s.repository)) {
				errors.push(`${where}: source zeigt nicht auf repository (oder enthält leere, „.“- bzw. „..“-Pfadsegmente)`);
			}
		}
		if (typeof s.official !== 'boolean') {
			errors.push(`${where}: official muss true oder false sein`);
		} else if (s.official) {
			const owner = REPO_URL.test(s.repository ?? '') ? githubRepoSlug(s.repository).split('/')[0] : '';
			if (owner.toLowerCase() !== OFFICIAL_OWNER) {
				errors.push(`${where}: official ist Repositorys von KalypzoSolutions vorbehalten`);
			}
		}
		if (!s.publisher?.name?.trim()) errors.push(`${where}: publisher.name fehlt`);
		if (s.publisher?.url && !/^https:\/\//.test(s.publisher.url)) errors.push(`${where}: publisher.url muss https sein`);
		if (s.homepage && !/^https:\/\//.test(s.homepage)) errors.push(`${where}: homepage muss https sein`);
		if (!Array.isArray(s.categories) || s.categories.length === 0) errors.push(`${where}: categories ist leer`);
		for (const c of s.categories ?? []) {
			if (!MARKET_CATEGORIES.includes(c)) errors.push(`${where}: unbekannte Kategorie „${c}“`);
		}
		if (!DATE.test(s.addedAt ?? '') || Number.isNaN(Date.parse(s.addedAt))) {
			errors.push(`${where}: addedAt muss YYYY-MM-DD sein`);
		}
		const modIds = new Set<string>();
		for (const m of s.modules ?? []) {
			if (!KEBAB.test(m.id ?? '')) errors.push(`${where}: Modul-id „${m.id}“ muss kebab-case sein`);
			if (modIds.has(m.id)) errors.push(`${where}: Modul-id „${m.id}“ ist doppelt`);
			modIds.add(m.id);
			checkLocalized(m.name, `${where}.modules.${m.id}.name`, errors);
			checkLocalized(m.description, `${where}.modules.${m.id}.description`, errors);
			const install = moduleSource(s, m);
			if (!SOURCE_URL.test(install)) {
				errors.push(`${where}: Installationslink von Modul „${m.id}“ muss https://github.com/owner/repo[/tree/…] sein`);
			} else if (REPO_URL.test(s.repository ?? '')) {
				if (!sourceMatchesRepo(install, s.repository)) {
					errors.push(`${where}: Installationslink von Modul „${m.id}“ zeigt nicht auf repository (oder enthält leere, „.“- bzw. „..“-Pfadsegmente)`);
				}
			}
		}
	}
	if (errors.length) throw new Error(`Ungültige Marktplatz-Quellen:\n- ${errors.join('\n- ')}`);
	return list;
}

// Beim Laden prüfen, damit ein fehlerhafter Eintrag den Build abbricht.
validateSources(marketSources);

/** Quellen sortiert: offizielle zuerst, dann nach Name. */
export const sortedSources = (list: MarketSource[] = marketSources): MarketSource[] =>
	[...list].sort((a, b) => Number(b.official) - Number(a.official) || a.name.localeCompare(b.name, 'de'));

/** Ein einzelnes Modul mit seiner Quelle – für die Modulansicht des Marktplatzes. */
export interface MarketModuleEntry {
	module: MarketModule;
	source: MarketSource;
	/** Installationslink des Moduls (moduleSource) */
	install: string;
	/** Eindeutiger Schlüssel `<quell-id>--<modul-id>`, Anker der Karte: `#module-<key>` */
	key: string;
}

/** Alle Module einzeln: Quellen in der Reihenfolge von sortedSources, darin nach Modulname (de). */
export function marketModules(list: MarketSource[] = sortedSources()): MarketModuleEntry[] {
	return list.flatMap((source) =>
		[...source.modules]
			.sort((a, b) => a.name.de.localeCompare(b.name.de, 'de'))
			.map((module) => ({
				module,
				source,
				install: moduleSource(source, module),
				key: `${source.id}--${module.id}`
			}))
	);
}

/** Öffentliche Registry (JSON), die unter MARKET_REGISTRY_PATH ausgeliefert wird. */
export function marketRegistry() {
	return {
		schema: MARKET_SCHEMA,
		generatedAt: new Date().toISOString(),
		site: SITE_URL,
		marketplace: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}/${MARKET_SLUG[l]}`])) as Localized,
		// Jedes Modul zusätzlich mit seinem eigenen Installationslink; Quellen und Module mit der
		// absoluten URL ihrer Detailseite je Sprache (`page`).
		sources: sortedSources().map((s) => ({
			...s,
			page: localizedPage((l) => marketSourcePath(l, s.id)),
			modules: s.modules.map((m) => ({
				...m,
				source: moduleSource(s, m),
				page: localizedPage((l) => marketModulePath(l, s.id, m.id))
			}))
		}))
	};
}
