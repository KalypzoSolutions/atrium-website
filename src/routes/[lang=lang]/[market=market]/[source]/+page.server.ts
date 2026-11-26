import { error } from '@sveltejs/kit';
import { LANGS, MARKET_SLUG, type Lang } from '$lib/config';
import { marketSources } from '$lib/marketplace';
import { getModuleDetails, getSourceDetails } from '$lib/marketplace-details';
import { renderReadme } from '$lib/server/markdown';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => LANGS.flatMap((lang) => marketSources.map((source) => ({ lang, market: MARKET_SLUG[lang], source: source.id })));

export const load: PageServerLoad = async ({ params }) => {
	const lang = params.lang as Lang;
	const source = marketSources.find((s) => s.id === params.source);
	const details = getSourceDetails(params.source);
	if (params.market !== MARKET_SLUG[lang] || !source || !details) error(404, 'Not found');
	const readme = details.readme && details.readmePath
		? await renderReadme(details.readme, { repository: details.repository, commit: details.commit, readmePath: details.readmePath, images: [], removeH1: true }) : null;
	return { lang, source, details, readme, modules: source.modules.map((module) => ({ ...module, version: getModuleDetails(source.id, module.id)?.version })) };
};
