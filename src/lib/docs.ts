import type { Component } from 'svelte';
import { LANGS, type Lang } from '$lib/config';
import docsIndex from 'virtual:docs-index';

/** Frontmatter einer Dokumentationsseite (src/content/docs/<lang>/<slug>.md). */
export interface DocMeta {
	lang: Lang;
	slug: string;
	title: string;
	description: string;
	order: number;
	section: string;
	/** Pfad im Atrium-Repository, z. B. "docs/deployment.md". */
	source?: string;
}

export interface TocItem {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface DocSection {
	section: string;
	docs: DocMeta[];
}

export interface Doc {
	meta: DocMeta;
	toc: TocItem[];
}

type MdModule = { default: Component };
type IndexEntry = DocMeta & { toc: TocItem[] };

// Kleiner Index (Frontmatter + Inhaltsverzeichnis) aus dem Vite-Plugin in vite.config.ts.
// Die Seiteninhalte werden erst beim Aufruf einer Seite geladen (je Seite ein eigener Chunk).
const loaders = import.meta.glob<MdModule>("/src/content/docs/*/*.md");

export { slugify } from "./docs-extract";

const docs: Doc[] = (docsIndex as unknown as IndexEntry[])
	.filter((e) => (LANGS as readonly string[]).includes(e.lang))
	.map(({ toc, ...meta }) => ({ meta, toc }))
	.sort((a, b) => a.meta.order - b.meta.order || a.meta.slug.localeCompare(b.meta.slug));

/** Lädt die Svelte-Komponente einer Doku-Seite. */
export async function loadDocComponent(lang: Lang, slug: string): Promise<Component | undefined> {
	const load = loaders[`/src/content/docs/${lang}/${slug}.md`];
	return load ? (await load()).default : undefined;
}

/** Alle Seiten einer Sprache, in Sidebar-Reihenfolge. */
export function listFlat(lang: Lang): DocMeta[] {
	return listDocs(lang).flatMap((s) => s.docs);
}

/** Kurzbeschreibung und Symbol je Abschnitt (für die Übersicht auf /<lang>/docs). */
export type SectionIcon = 'start' | 'admin' | 'ops' | 'dev';
export const SECTION_INFO: Record<Lang, Record<string, { description: string; icon: SectionIcon }>> = {
	de: {
		'Erste Schritte': {
			icon: 'start',
			description: 'Was Atrium ist und wie Sie es in wenigen Minuten lokal starten.'
		},
		Administration: {
			icon: 'admin',
			description: 'Das Handbuch für die Oberfläche: Konten, Rollen, Einstellungen, Module, Sicherung und Datenschutz.'
		},
		Betrieb: {
			icon: 'ops',
			description: 'Installation mit Docker Compose oder Dokploy, Konfiguration, Sicherheit, Updates und Fehlersuche.'
		},
		Entwickeln: {
			icon: 'dev',
			description: 'Architektur, Module, Core-Services, REST-API und die Arbeit am Core.'
		}
	},
	en: {
		'Getting started': {
			icon: 'start',
			description: 'What Atrium is and how to run it locally in a few minutes.'
		},
		Administration: {
			icon: 'admin',
			description: 'The handbook for the interface: accounts, roles, settings, modules, backups and privacy.'
		},
		Operations: {
			icon: 'ops',
			description: 'Installing with Docker Compose or Dokploy, configuration, security, updates and troubleshooting.'
		},
		Development: {
			icon: 'dev',
			description: 'Architecture, modules, core services, the REST API and working on the core.'
		}
	}
};

/** Seiten einer Sprache, gruppiert nach `section` (Gruppen nach kleinster `order`). */
export function listDocs(lang: Lang): DocSection[] {
	const groups = new Map<string, DocMeta[]>();
	for (const d of docs) {
		if (d.meta.lang !== lang) continue;
		const list = groups.get(d.meta.section) ?? [];
		list.push(d.meta);
		groups.set(d.meta.section, list);
	}
	return [...groups.entries()].map(([section, list]) => ({ section, docs: list }));
}

export function getDoc(lang: Lang, slug: string): Doc | undefined {
	return docs.find((d) => d.meta.lang === lang && d.meta.slug === slug);
}

export function getPrevNext(lang: Lang, slug: string): { prev?: DocMeta; next?: DocMeta } {
	const flat = listFlat(lang);
	const i = flat.findIndex((d) => d.slug === slug);
	if (i < 0) return {};
	return { prev: flat[i - 1], next: flat[i + 1] };
}

/** URL einer Doku-Seite; `index` liegt direkt unter /<lang>/docs. */
export const docHref = (lang: Lang, slug: string) => (slug === 'index' ? `/${lang}/docs` : `/${lang}/docs/${slug}`);

/** Alle (Sprache, Slug)-Paare für das Prerendering. */
export function allDocEntries(): { lang: Lang; slug: string }[] {
	return docs.map((d) => ({ lang: d.meta.lang, slug: d.meta.slug }));
}
