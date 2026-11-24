import type { Lang } from '$lib/config';

/** Eintrag aus static/screenshots/manifest.json (erzeugt von scripts/screenshots.mjs). */
export interface ShotEntry {
	file: string; // z. B. "02-dashboard.webp"
	width: number;
	height: number;
	/** Abweichende Höhe der englischen Aufnahme (optional). */
	height_en?: number;
	title_de: string;
	title_en: string;
	caption_de: string;
	caption_en: string;
	route?: string;
}

export interface Shot {
	src: string;
	width: number;
	height: number;
	title: string;
	caption: string;
	route?: string;
}

// Wird zur Build-Zeit eingelesen; fehlt die Datei, ist die Liste leer.
const raw = import.meta.glob<ShotEntry[]>('/static/screenshots/manifest.json', { eager: true, import: 'default' });
const entries: ShotEntry[] = Object.values(raw)[0] ?? [];

/** Alle Screenshots für eine Sprache. */
export function shots(lang: Lang): Shot[] {
	return entries.map((e) => ({
		src: `/screenshots/${lang}/${e.file}`,
		width: e.width,
		height: lang === "en" && e.height_en ? e.height_en : e.height,
		title: lang === 'de' ? e.title_de : e.title_en,
		caption: lang === 'de' ? e.caption_de : e.caption_en,
		route: e.route
	}));
}

/** Screenshot über den Namensteil finden, z. B. shot('de', 'dashboard') → 02-dashboard.webp. */
export function shot(lang: Lang, key: string): Shot | undefined {
	return shots(lang).find((s) => s.src.replace(/\.webp$/, '').endsWith(key));
}
