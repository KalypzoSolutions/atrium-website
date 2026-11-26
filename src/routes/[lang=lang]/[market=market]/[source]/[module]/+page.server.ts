import { error } from '@sveltejs/kit';
import { LANGS, MARKET_SLUG, type Lang } from '$lib/config';
import { marketSources, moduleSource } from '$lib/marketplace';
import { getModuleDetails, getSourceDetails } from '$lib/marketplace-details';
import { renderReadme } from '$lib/server/markdown';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => LANGS.flatMap((lang) => marketSources.flatMap((source) => source.modules.map((module) => ({ lang, market: MARKET_SLUG[lang], source: source.id, module: module.id }))));

export const load: PageServerLoad = async ({ params }) => {
	const lang = params.lang as Lang;
	const source = marketSources.find((s) => s.id === params.source);
	const module = source?.modules.find((m) => m.id === params.module);
	const details = getModuleDetails(params.source, params.module);
	const snapshot = getSourceDetails(params.source);
	if (params.market !== MARKET_SLUG[lang] || !source || !module || !details || !snapshot) error(404, 'Not found');
	const readme = details.readme && details.readmePath
		? await renderReadme(details.readme, { repository: snapshot.repository, commit: snapshot.commit, readmePath: details.readmePath, images: details.images, removeH1: true }) : null;
	// Nur eindeutig zuordenbare Abhängigkeiten verlinken; explizite Quellen berücksichtigen.
	const dependencies = (items: typeof details.dependencies) => Object.entries(items).map(([id, value]) => {
		const matches = marketSources.flatMap((s) => s.modules.filter((m) => m.id === id && (!value.source || value.source === s.id || value.source === s.source || value.source === moduleSource(s, m))).map((m) => ({ source: s, module: m })));
		return { id, ...value, match: matches.length === 1 ? matches[0] : undefined };
	});
	return { lang, source, module, details, readme, install: moduleSource(source, module), dependencies: dependencies(details.dependencies), optionalDependencies: dependencies(details.optionalDependencies) };
};
