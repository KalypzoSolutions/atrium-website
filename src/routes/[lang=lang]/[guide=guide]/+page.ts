import { error } from '@sveltejs/kit';
import { GUIDE_SLUG, type Lang } from '$lib/config';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => [
	{ lang: 'de', guide: 'anleitung' },
	{ lang: 'en', guide: 'guide' }
];

export const load: PageLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	// /de/guide und /en/anleitung gibt es nicht – nur der Slug der jeweiligen Sprache ist gültig.
	if (params.guide !== GUIDE_SLUG[params.lang as Lang]) error(404, 'Not found');
	return { lang };
};
