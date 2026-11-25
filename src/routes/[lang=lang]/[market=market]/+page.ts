import { error } from '@sveltejs/kit';
import { MARKET_SLUG, type Lang } from '$lib/config';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => [
	{ lang: 'de', market: 'marktplatz' },
	{ lang: 'en', market: 'marketplace' }
];

export const load: PageLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	// /de/marketplace und /en/marktplatz gibt es nicht – nur der Slug der jeweiligen Sprache ist gültig.
	if (params.market !== MARKET_SLUG[params.lang as Lang]) error(404, 'Not found');
	return { lang };
};
