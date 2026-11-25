import type { Lang } from '$lib/config';
import type { MarketCategory, MarketSource } from '$lib/marketplace';

/** Filterzustand der Marktplatz-Seite. */
export interface MarketFilter {
	query: string;
	categories: MarketCategory[];
	official: boolean;
}

/** Kleinschreibung ohne diakritische Zeichen, damit „aufgaben“ auch „Aufgaben“ und „aufgabén“ findet. */
export const normalize = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();

/** Durchsuchbarer Text einer Quelle: Name, Beschreibung, Module, Schlagwörter, Herausgeber, Kategorien. */
export function haystack(s: MarketSource, lang: Lang, categoryLabels: Record<MarketCategory, string>): string {
	return normalize(
		[
			s.name,
			s.id,
			s.description[lang],
			s.publisher.name,
			...s.tags,
			...s.categories.map((c) => categoryLabels[c]),
			...s.modules.flatMap((m) => [m.id, m.name[lang], m.name.de, m.name.en])
		].join(' ')
	);
}

/**
 * Wendet Suche und Filter an. Alle Suchwörter müssen vorkommen (UND); mehrere Kategorien
 * werden ODER-verknüpft.
 */
export function filterSources(
	list: MarketSource[],
	f: MarketFilter,
	lang: Lang,
	categoryLabels: Record<MarketCategory, string>
): MarketSource[] {
	const terms = normalize(f.query).split(/\s+/).filter(Boolean);
	return list.filter((s) => {
		if (f.official && !s.official) return false;
		if (f.categories.length && !s.categories.some((c) => f.categories.includes(c))) return false;
		if (!terms.length) return true;
		const text = haystack(s, lang, categoryLabels);
		return terms.every((t) => text.includes(t));
	});
}
