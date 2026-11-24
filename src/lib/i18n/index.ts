import type { Lang } from '$lib/config';
import { de } from './de';
import { en } from './en';

export type Dict = typeof de;
const dicts: Record<Lang, Dict> = { de, en };
export const t = (lang: Lang): Dict => dicts[lang];
export const otherLang = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

/**
 * Übersetzt einen Pfad in die andere Sprache. Berücksichtigt lokalisierte Slugs (anleitung ↔ guide).
 */
export function switchLangPath(pathname: string, to: Lang): string {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] === 'de' || parts[0] === 'en') parts.shift();
	const slugPairs: [string, string][] = [
		['anleitung', 'guide'],
		['impressum', 'legal-notice'],
		['datenschutz', 'privacy']
	];
	for (const [deSlug, enSlug] of slugPairs) {
		if (parts[0] === deSlug || parts[0] === enSlug) parts[0] = to === 'de' ? deSlug : enSlug;
	}
	return '/' + [to, ...parts].join('/');
}
