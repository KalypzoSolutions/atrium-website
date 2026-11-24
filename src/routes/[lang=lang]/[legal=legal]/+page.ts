import { error } from '@sveltejs/kit';
import { LEGAL_SLUGS } from '$lib/legal';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => [
	{ lang: 'de', legal: 'impressum' },
	{ lang: 'de', legal: 'datenschutz' },
	{ lang: 'en', legal: 'legal-notice' },
	{ lang: 'en', legal: 'privacy' }
];

export const load: PageLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	const page = (Object.keys(LEGAL_SLUGS) as (keyof typeof LEGAL_SLUGS)[]).find(
		(k) => LEGAL_SLUGS[k][lang] === params.legal
	);
	// /en/impressum o. Ä. gibt es nicht: Slug muss zur Sprache passen.
	if (!page) error(404, 'Not found');
	return { page };
};
