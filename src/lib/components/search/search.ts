// Kleine, abhängigkeitsfreie Volltextsuche über die Dokumentation.
// Der Index (/search/<lang>.json) wird erst beim Öffnen der Suche geladen.

import type { Lang } from '$lib/config';

/** Ein Eintrag im Suchindex: eine Seite (heading leer) oder ein h2/h3-Abschnitt. */
export interface SearchEntry {
	url: string;
	page: string;
	heading: string;
	/** Bereich der Seite, z. B. „Administration“ oder „Anleitung“. */
	group: string;
	text: string;
	code: string;
}

interface Prepared extends SearchEntry {
	nPage: string;
	nHeading: string;
	nText: string;
	nCode: string;
}

export interface Segment {
	text: string;
	hit: boolean;
}

export interface SearchHit {
	id: string;
	url: string;
	/** Überschrift des Abschnitts oder (bei der Seite selbst) der Seitentitel. */
	title: Segment[];
	excerpt: Segment[];
	isPage: boolean;
	score: number;
}

export interface SearchGroup {
	page: string;
	group: string;
	url: string;
	hits: SearchHit[];
}

/* ── Normalisierung ──
   Kleinbuchstaben, Akzente entfernen, ß→ss und ae/oe/ue→a/o/u: so finden „Schlüssel“,
   „Schluessel“ und „Schlussel“ dasselbe. Text und Suchbegriffe werden gleich behandelt. */

function normChar(c: string): string {
	const l = c.toLowerCase();
	return l === 'ß' ? 'ss' : l.normalize('NFD').replace(/\p{M}/gu, '');
}

/** Normalisierter Text plus Zuordnung jeder Position zur Position im Original. */
function normalizeWithMap(s: string): { norm: string; map: number[] } {
	let norm = '';
	const map: number[] = [];
	let i = 0;
	for (const c of s) {
		const n = normChar(c);
		for (const ch of n) {
			const prev = norm[norm.length - 1];
			// Ersatzschreibung ae/oe/ue wie Umlaut behandeln.
			if (ch === 'e' && (prev === 'a' || prev === 'o' || prev === 'u')) continue;
			map.push(i);
			norm += ch;
		}
		i += c.length;
	}
	map.push(i);
	return { norm, map };
}

export function normalize(s: string): string {
	return normalizeWithMap(s).norm;
}

export function terms(query: string): string[] {
	const list = normalize(query)
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
	return [...new Set(list)];
}

/* ── Laden ── */

const cache = new Map<Lang, Promise<Prepared[]>>();

export function loadIndex(lang: Lang): Promise<Prepared[]> {
	let p = cache.get(lang);
	if (!p) {
		p = fetch(`/search/${lang}.json`)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json() as Promise<{ entries: SearchEntry[] }>;
			})
			.then(({ entries }) =>
				entries.map((e) => ({
					...e,
					nPage: normalize(e.page),
					nHeading: normalize(e.heading),
					nText: normalize(e.text),
					nCode: normalize(e.code)
				}))
			);
		p.catch(() => cache.delete(lang));
		cache.set(lang, p);
	}
	return p;
}

/* ── Bewertung ── */

const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/.test(c);

/** Punkte für einen Begriff in einem Feld: Wortanfang > ganzes Wort > irgendwo im Wort. */
function fieldScore(field: string, term: string, weight: number, countHits = false): number {
	if (!field) return 0;
	let best = 0;
	let hits = 0;
	let from = 0;
	for (;;) {
		const i = field.indexOf(term, from);
		if (i < 0) break;
		const start = !isWordChar(field[i - 1]);
		const whole = start && !isWordChar(field[i + term.length]);
		const s = whole ? weight * 1.3 : start ? weight : term.length >= 3 ? weight * 0.35 : 0;
		if (s > 0) hits++;
		if (s > best) best = s;
		if (!countHits && whole) break;
		if (hits >= 4) break;
		from = i + 1;
	}
	return countHits && hits > 1 ? best + Math.min(hits - 1, 3) * weight * 0.15 : best;
}

function scoreEntry(e: Prepared, ts: string[], phrase: string): number {
	let total = 0;
	for (const t of ts) {
		const s =
			fieldScore(e.nPage, t, 10) +
			fieldScore(e.nHeading, t, 8) +
			fieldScore(e.nText, t, 2, true) +
			fieldScore(e.nCode, t, 0.8);
		// Alle Begriffe müssen vorkommen (UND).
		if (s === 0) return 0;
		total += s;
	}
	if (ts.length > 1 && phrase) {
		if (e.nHeading.includes(phrase) || e.nPage.includes(phrase)) total += 8;
		else if (e.nText.includes(phrase)) total += 4;
	}
	// Seiten-Einträge leicht bevorzugen, wenn der Seitentitel passt.
	if (!e.heading && ts.every((t) => e.nPage.includes(t))) total += 4;
	return total;
}

/* ── Hervorhebung und Ausschnitt ── */

function hitRanges(text: string, ts: string[]): { norm: string; map: number[]; ranges: [number, number][] } {
	const { norm, map } = normalizeWithMap(text);
	const ranges: [number, number][] = [];
	for (const t of ts) {
		let from = 0;
		for (;;) {
			const i = norm.indexOf(t, from);
			if (i < 0) break;
			// Sehr kurze Begriffe nur am Wortanfang hervorheben.
			if (t.length >= 3 || !isWordChar(norm[i - 1])) ranges.push([map[i]!, map[i + t.length]!]);
			from = i + t.length;
		}
	}
	ranges.sort((a, b) => a[0] - b[0]);
	const merged: [number, number][] = [];
	for (const r of ranges) {
		const last = merged[merged.length - 1];
		if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
		else merged.push([r[0], r[1]]);
	}
	return { norm, map, ranges: merged };
}

export function highlight(text: string, ts: string[]): Segment[] {
	const { ranges } = hitRanges(text, ts);
	const out: Segment[] = [];
	let pos = 0;
	for (const [a, b] of ranges) {
		if (a > pos) out.push({ text: text.slice(pos, a), hit: false });
		out.push({ text: text.slice(a, b), hit: true });
		pos = b;
	}
	if (pos < text.length) out.push({ text: text.slice(pos), hit: false });
	return out;
}

/** Ausschnitt rund um den ersten Treffer (ca. 160 Zeichen). */
export function excerpt(text: string, ts: string[], length = 160): string {
	if (text.length <= length) return text;
	const { ranges } = hitRanges(text, ts);
	const first = ranges[0]?.[0] ?? 0;
	let start = Math.max(0, first - 50);
	if (start > 0) {
		const space = text.indexOf(' ', start);
		if (space > 0 && space < first) start = space + 1;
	}
	let end = Math.min(text.length, start + length);
	if (end < text.length) {
		const space = text.lastIndexOf(' ', end);
		if (space > first) end = space;
	}
	return (start > 0 ? '… ' : '') + text.slice(start, end) + (end < text.length ? ' …' : '');
}

/* ── Suche ── */

export function search(index: Prepared[], query: string, opts = { maxGroups: 8, perGroup: 4 }): SearchGroup[] {
	const ts = terms(query);
	if (ts.length === 0) return [];
	const phrase = ts.join(' ');

	const scored: { e: Prepared; score: number }[] = [];
	for (const e of index) {
		const score = scoreEntry(e, ts, phrase);
		if (score > 0) scored.push({ e, score });
	}
	scored.sort((a, b) => b.score - a.score);

	const groups = new Map<string, SearchGroup>();
	let n = 0;
	for (const { e, score } of scored) {
		const key = e.url.split('#')[0]!;
		let g = groups.get(key);
		if (!g) {
			if (groups.size >= opts.maxGroups) continue;
			g = { page: e.page, group: e.group, url: key, hits: [] };
			groups.set(key, g);
		}
		if (g.hits.length >= opts.perGroup) continue;
		const isPage = !e.heading;
		const source = e.text || e.code;
		const textHasHit = ts.some((t) => e.nText.includes(t));
		const ex = excerpt(textHasHit || !e.code ? e.text : e.code, ts);
		g.hits.push({
			id: `hit-${n++}`,
			url: e.url,
			title: highlight(isPage ? e.page : e.heading, ts),
			excerpt: source ? highlight(ex, ts) : [],
			isPage,
			score
		});
	}
	return [...groups.values()];
}
