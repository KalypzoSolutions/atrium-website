import type { MarketCategory } from '$lib/marketplace';

export const de = {
	meta: {
		title: 'Kalypzo Atrium – modulare, selbst gehostete Verwaltungsplattform',
		description:
			'Kalypzo Atrium ist eine modulare Verwaltungsplattform zum Selbsthosten: 2FA, Rollen & Rechte, REST-API, PDF, KI und S3. Fachmodule installieren Sie per GitHub-Link oder ZIP. Mit Docker oder Dokploy in wenigen Minuten startklar.'
	},
	nav: {
		features: 'Funktionen',
		modules: 'Module',
		docs: 'Dokumentation',
		quickstart: 'Schnellstart',
		guide: 'Anleitung',
		marketplace: 'Marktplatz',
		github: 'GitHub',
		skip: 'Zum Inhalt springen',
		menu: 'Menü',
		close: 'Schließen',
		theme: 'Farbschema wechseln',
		language: 'Sprache',
		switchTo: 'English'
	},
	footer: {
		tagline: 'Modulare Verwaltungsplattform zum Selbsthosten.',
		product: 'Produkt',
		resources: 'Ressourcen',
		community: 'Community',
		source: 'Quellcode',
		issues: 'Issues melden',
		releases: 'Releases',
		rights: 'Privates, nicht kommerzielles Projekt.',
		legal: 'Rechtliches',
		imprint: 'Impressum',
		privacy: 'Datenschutz'
	},
	docs: {
		title: 'Dokumentation',
		onThisPage: 'Auf dieser Seite',
		editOnGithub: 'Quelle auf GitHub ansehen',
		prev: 'Zurück',
		next: 'Weiter',
		home: 'Start',
		navigation: 'Navigation',
		openNav: 'Navigation öffnen',
		closeNav: 'Navigation schließen',
		sectionsLabel: 'Bereiche der Dokumentation',
		pages: 'Seiten'
	},
	search: {
		label: 'Suchen',
		open: 'Suche öffnen',
		docs: 'Dokumentation durchsuchen',
		placeholder: 'Dokumentation durchsuchen …',
		loading: 'Suchindex wird geladen …',
		error: 'Der Suchindex konnte nicht geladen werden.',
		retry: 'Erneut versuchen',
		noResults: 'Keine Treffer für',
		noResultsHint: 'Prüfen Sie die Schreibweise oder versuchen Sie einen allgemeineren Begriff.',
		suggestions: 'Häufig gesucht',
		results: 'Suchergebnisse',
		count: (n: number) => (n === 1 ? '1 Treffer' : `${n} Treffer`),
		navigate: 'Auswählen',
		select: 'Öffnen',
		close: 'Schließen',
		clear: 'Eingabe löschen',
		ctrl: 'Strg'
	},
	common: {
		copy: 'Kopieren',
		copied: 'Kopiert',
		backHome: 'Zur Startseite',
		notFound: 'Seite nicht gefunden',
		notFoundText: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
		enlarge: 'Vergrößern',
		starOnGithub: 'Auf GitHub ansehen'
	},
	market: {
		meta: {
			title: 'Modul-Marktplatz für Kalypzo Atrium',
			description:
				'Modulquellen für Kalypzo Atrium finden: Termine, Dateien, Mitglieder, Kasse und mehr. GitHub-Link kopieren und in Ihrer Instanz unter Administration → Module installieren.'
		},
		eyebrow: 'Marktplatz',
		title: 'Module für Ihre Atrium-Instanz',
		lead: 'Modulquellen aus GitHub-Repositorys – offiziell von Kalypzo Solutions oder aus der Community. Link kopieren, in Atrium einfügen, Vorschau prüfen und installieren.',
		stats: (sources: number, modules: number) =>
			`${sources} ${sources === 1 ? 'Quelle' : 'Quellen'} · ${modules} ${modules === 1 ? 'Modul' : 'Module'}`,
		registry: 'JSON-Registry für Atrium-Instanzen',
		registryHint: 'Dieselbe Liste maschinenlesbar – zum Abruf durch Atrium-Instanzen und eigene Werkzeuge.',
		listTitle: 'Modulquellen',
		discover: 'Module im Marktplatz entdecken',
		filters: {
			label: 'Quellen filtern',
			search: 'Quellen durchsuchen',
			placeholder: 'Name, Modul, Schlagwort oder Herausgeber …',
			clear: 'Suche löschen',
			categories: 'Kategorien',
			all: 'Alle',
			official: 'Nur offizielle',
			results: (n: number, total: number) =>
				n === total ? `${total} ${total === 1 ? 'Quelle' : 'Quellen'}` : `${n} von ${total} Quellen`,
			reset: 'Filter zurücksetzen'
		},
		categories: {
			core: 'Kern',
			organisation: 'Organisation',
			communication: 'Kommunikation',
			finance: 'Finanzen',
			files: 'Dateien',
			productivity: 'Produktivität',
			integration: 'Integration',
			other: 'Sonstiges'
		} satisfies Record<MarketCategory, string>,
		card: {
			official: 'Offiziell',
			officialHint: 'Veröffentlicht von Kalypzo Solutions',
			by: 'von',
			categories: 'Kategorien',
			tags: 'Schlagwörter',
			modules: (n: number) => `Enthaltene Module (${n})`,
			license: 'Lizenz',
			noLicense: 'Keine Lizenz angegeben',
			source: 'Installationslink',
			github: 'GitHub',
			githubLabel: (name: string) => `${name} auf GitHub öffnen`,
			homepage: 'Projektseite',
			copy: 'Link kopieren',
			copied: 'Kopiert',
			copyLabel: (name: string) => `Installationslink von ${name} kopieren`,
			copiedMsg: (name: string) => `Installationslink von ${name} in die Zwischenablage kopiert.`,
			copyFailed: 'Kopieren nicht möglich – bitte den Link markieren und manuell kopieren.'
		},
		empty: {
			title: 'Keine passenden Quellen',
			text: 'Versuchen Sie einen anderen Suchbegriff oder setzen Sie die Filter zurück.'
		},
		install: {
			eyebrow: 'Installation',
			title: 'In Atrium installieren',
			lead: 'Installiert wird in Ihrer eigenen Instanz – der Marktplatz liefert nur den Link.',
			steps: [
				{ title: 'Link kopieren', text: 'Bei der gewünschten Quelle auf „Link kopieren“ klicken.' },
				{
					title: 'Quelle laden',
					text: 'In Atrium Administration → Module → Installieren öffnen, den Link einfügen und auf „Quelle laden“ klicken.'
				},
				{
					title: 'Prüfen und installieren',
					text: 'Module auswählen, die Vorschau mit Version, Abhängigkeiten und Commit prüfen und installieren.'
				}
			],
			docsManagement: 'Module verwalten',
			docsMarket: 'Marktplatz & Registry'
		},
		security: {
			title: 'Sicherheitshinweis',
			text: 'Ein Eintrag im Marktplatz ist keine Sicherheitsprüfung. Modulcode läuft nach der Installation mit vollen Rechten im Server-Prozess, ohne Sandbox. Prüfen Sie jede Quelle und installieren Sie nur Module, denen Sie vertrauen.'
		},
		submit: {
			title: 'Eigenes Modul eintragen',
			text: 'Sie pflegen eine Modulquelle für Atrium? Ergänzen Sie sie in src/lib/marketplace.ts und öffnen Sie einen Pull Request im Website-Repository.',
			cta: 'Eigenes Modul eintragen',
			docs: 'Anleitung zum Eintragen'
		}
	}
};
