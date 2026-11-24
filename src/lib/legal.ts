import type { Lang } from '$lib/config';

/** Angaben zum Anbieter (§ 5 DDG) – zentral gepflegt für Impressum und Datenschutzerklärung. */
export const OPERATOR = {
	name: 'Philipp Hethey',
	street: 'Rockwinkeler Heerstr. 140',
	zip: '28355',
	city: 'Bremen',
	country: { de: 'Deutschland', en: 'Germany' },
	email: 'kontakt@kalypzo.de'
} as const;

/** Hosting-Anbieter (Auftragsverarbeiter nach Art. 28 DSGVO). */
export const HOSTER = {
	name: 'Hetzner Online GmbH',
	street: 'Industriestr. 25',
	zip: '91710',
	city: 'Gunzenhausen',
	privacyUrl: 'https://www.hetzner.com/legal/privacy-policy'
} as const;

/** Zuständige Datenschutz-Aufsichtsbehörde (Sitz des Verantwortlichen: Bremen). */
export const AUTHORITY = {
	name: 'Die Landesbeauftragte für Datenschutz und Informationsfreiheit der Freien Hansestadt Bremen',
	street: 'Arndtstraße 1',
	zip: '27570',
	city: 'Bremerhaven',
	url: 'https://www.datenschutz.bremen.de'
} as const;

/** Stand der Rechtstexte. */
export const LEGAL_UPDATED = { de: 'November 2026', en: 'November 2026' } as const;

export const LEGAL_SLUGS = {
	imprint: { de: 'impressum', en: 'legal-notice' },
	privacy: { de: 'datenschutz', en: 'privacy' }
} as const;

export const legalHref = (lang: Lang, page: keyof typeof LEGAL_SLUGS) => `/${lang}/${LEGAL_SLUGS[page][lang]}`;
