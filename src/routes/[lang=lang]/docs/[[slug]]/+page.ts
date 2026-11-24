import { error } from '@sveltejs/kit';
import type { Lang } from '$lib/config';
import { allDocEntries, getDoc, getPrevNext, loadDocComponent } from '$lib/docs';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

/** Alle Sprache×Slug-Kombinationen; `index` wird zu /<lang>/docs (optionaler Parameter leer). */
export const entries: EntryGenerator = () =>
	allDocEntries().map(({ lang, slug }) => ({ lang, slug: slug === 'index' ? '' : slug }));

export const load: PageLoad = async ({ params }) => {
	const lang = params.lang as Lang;
	// /<lang>/docs/index wäre ein Duplikat von /<lang>/docs
	if (params.slug === 'index') error(404, 'Not found');
	const slug = params.slug ?? 'index';
	const doc = getDoc(lang, slug);
	const component = doc && (await loadDocComponent(lang, slug));
	if (!doc || !component) error(404, 'Not found');
	return { slug, doc, component, ...getPrevNext(lang, slug) };
};
