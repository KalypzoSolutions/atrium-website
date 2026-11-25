import type { RequestHandler } from './$types';
import { SITE_URL, LANGS, GUIDE_SLUG, MARKET_SLUG, type Lang } from '$lib/config';

export const prerender = true;

const DEFAULT: Lang = 'de';

/**
 * Doku-Slugs je Sprache aus den Markdown-Dateien ableiten (nur die Pfade, nichts wird geladen),
 * damit die Sitemap automatisch mit src/content/docs/{lang}/{slug}.md synchron bleibt.
 */
const docFiles = Object.keys(import.meta.glob('/src/content/docs/*/*.md'));
const docSlugs = new Map<Lang, Set<string>>(LANGS.map((l) => [l, new Set<string>()]));
for (const file of docFiles) {
	const m = file.match(/\/src\/content\/docs\/([^/]+)\/([^/]+)\.md$/);
	if (!m) continue;
	const set = docSlugs.get(m[1] as Lang);
	if (set) set.add(m[2]);
}

const docPath = (lang: Lang, slug: string) => (slug === 'index' ? `/${lang}/docs` : `/${lang}/docs/${slug}`);

/** Eine Seite mit ihren Sprachvarianten (fehlende Übersetzungen werden ausgelassen). */
type Page = { variants: Partial<Record<Lang, string>>; priority: string; changefreq: string };

function pages(): Page[] {
	const list: Page[] = [
		{ variants: Object.fromEntries(LANGS.map((l) => [l, `/${l}`])), priority: '1.0', changefreq: 'weekly' },
		{
			variants: Object.fromEntries(LANGS.map((l) => [l, `/${l}/${GUIDE_SLUG[l]}`])),
			priority: '0.8',
			changefreq: 'monthly'
		},
		{
			variants: Object.fromEntries(LANGS.map((l) => [l, `/${l}/${MARKET_SLUG[l]}`])),
			priority: '0.8',
			changefreq: 'weekly'
		}
	];
	const allSlugs = [...new Set(LANGS.flatMap((l) => [...docSlugs.get(l)!]))].sort((a, b) =>
		a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b)
	);
	for (const slug of allSlugs) {
		const variants: Partial<Record<Lang, string>> = {};
		for (const l of LANGS) if (docSlugs.get(l)!.has(slug)) variants[l] = docPath(l, slug);
		list.push({ variants, priority: slug === 'index' ? '0.8' : '0.7', changefreq: 'monthly' });
	}
	return list;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = () => {
	const lastmod = new Date().toISOString().slice(0, 10);
	const urls: string[] = [];

	for (const page of pages()) {
		const entries = Object.entries(page.variants) as [Lang, string][];
		const xDefault = page.variants[DEFAULT] ?? entries[0][1];
		const alternates =
			entries.length > 1
				? [
						...entries.map(
							([l, p]) => `\t\t<xhtml:link rel="alternate" hreflang="${l}" href="${esc(SITE_URL + p)}"/>`
						),
						`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE_URL + xDefault)}"/>`
					].join('\n')
				: '';
		for (const [, path] of entries) {
			urls.push(
				[
					'\t<url>',
					`\t\t<loc>${esc(SITE_URL + path)}</loc>`,
					alternates,
					`\t\t<lastmod>${lastmod}</lastmod>`,
					`\t\t<changefreq>${page.changefreq}</changefreq>`,
					`\t\t<priority>${page.priority}</priority>`,
					'\t</url>'
				]
					.filter(Boolean)
					.join('\n')
			);
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
