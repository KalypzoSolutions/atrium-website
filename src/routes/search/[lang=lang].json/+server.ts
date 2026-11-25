import { json } from '@sveltejs/kit';
import pages from 'virtual:docs-search';
import { GUIDE_SLUG, LANGS, MARKET_SLUG, type Lang } from '$lib/config';
import { docHref } from '$lib/docs';
import { guide } from '$lib/content/guide';
import { sortedSources } from '$lib/marketplace';
import { t } from '$lib/i18n';
import type { SearchEntry } from '$lib/components/search/search';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * Statischer Suchindex je Sprache (/search/de.json, /search/en.json).
 * Wird beim Build vorgerendert und erst geladen, wenn jemand die Suche öffnet.
 */
export const prerender = true;
export const entries: EntryGenerator = () => LANGS.map((lang) => ({ lang }));

const plain = (s: string) => s.replace(/`([^`]*)`/g, '$1').replace(/\s+/g, ' ').trim();

function docEntries(lang: Lang): SearchEntry[] {
	const out: SearchEntry[] = [];
	for (const p of pages[lang] ?? []) {
		const href = docHref(lang, p.slug);
		for (const s of p.sections) {
			const intro = s.level === 0;
			out.push({
				url: intro ? href : `${href}#${s.id}`,
				page: p.title,
				heading: s.heading,
				group: p.section,
				text: intro ? [p.description, s.text].filter(Boolean).join(' ') : s.text,
				code: s.code
			});
		}
		// Seiten ohne Einleitungstext trotzdem als Ganzes auffindbar machen.
		if (!p.sections.some((s) => s.level === 0)) {
			out.push({ url: href, page: p.title, heading: '', group: p.section, text: p.description, code: '' });
		}
	}
	return out;
}

function guideEntries(lang: Lang): SearchEntry[] {
	const g = guide(lang);
	const base = `/${lang}/${GUIDE_SLUG[lang]}`;
	const page = t(lang).nav.guide;
	const group = page;
	const out: SearchEntry[] = [
		{ url: base, page, heading: '', group, text: plain(`${g.seo.description} ${g.hero.lead}`), code: '' },
		{
			url: `${base}#${g.partA.dokploy.id}`,
			page,
			heading: g.partA.dokploy.title,
			group,
			text: plain(
				[g.partA.dokploy.lead, ...g.partA.dokploy.steps.flatMap((s) => [s.title, s.text, s.callout?.text ?? ''])].join(' ')
			),
			code: g.partA.dokploy.steps.map((s) => s.code?.code ?? '').join(' ')
		},
		{
			url: `${base}#${g.partA.compose.id}`,
			page,
			heading: g.partA.compose.title,
			group,
			text: plain(`${g.partA.compose.lead} ${g.partA.compose.note}`),
			code: g.partA.compose.code.code
		}
	];
	for (const s of g.partB.steps) {
		out.push({
			url: `${base}#${s.id}`,
			page,
			heading: s.title,
			group,
			text: plain(
				[
					s.path.join(' → '),
					...s.text,
					s.callout?.text ?? '',
					...(s.substeps ?? []).flatMap((x) => [x.title, x.text, x.callout?.text ?? ''])
				].join(' ')
			),
			code: s.code?.code ?? ''
		});
	}
	return out;
}

/** Marktplatz: die Seite selbst und je Quelle ein Eintrag mit Anker auf ihre Karte. */
function marketEntries(lang: Lang): SearchEntry[] {
	const m = t(lang).market;
	const base = `/${lang}/${MARKET_SLUG[lang]}`;
	const page = t(lang).nav.marketplace;
	const group = page;
	const out: SearchEntry[] = [
		{ url: base, page, heading: '', group, text: plain(`${m.meta.description} ${m.lead}`), code: '' }
	];
	for (const s of sortedSources()) {
		out.push({
			url: `${base}#source-${s.id}`,
			page,
			heading: s.name,
			group,
			text: plain(
				[
					s.description[lang],
					s.publisher.name,
					...s.categories.map((c) => m.categories[c]),
					...s.tags,
					...s.modules.map((x) => x.name[lang])
				].join(' ')
			),
			code: s.source
		});
	}
	out.push({
		url: `${base}#install`,
		page,
		heading: m.install.title,
		group,
		text: plain(m.install.steps.map((x) => `${x.title} ${x.text}`).join(' ')),
		code: ''
	});
	return out;
}

export const GET: RequestHandler = ({ params }) => {
	const lang = params.lang as Lang;
	return json({ lang, entries: [...docEntries(lang), ...guideEntries(lang), ...marketEntries(lang)] });
};
