// Wird zur Build-Zeit (Vite-Plugin in vite.config.ts) ausgeführt: liest Frontmatter und
// Überschriften aus den Markdown-Dateien, damit der Client nur einen kleinen Index lädt.

/** Identisch mit rehypeSlug in svelte.config.js, sonst passen die Anker nicht. */
export const slugify = (s: string): string =>
	s
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/** Entfernt Inline-Markdown, sodass der Text dem Textinhalt der gerenderten Überschrift entspricht. */
function plainText(md: string): string {
	return (
		md
			.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
			.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
			// Nur *-Hervorhebung auflösen: Unterstriche kommen in Bezeichnern wie APP_SECRET vor.
			.replace(/\*\*(.*?)\*\*/g, '$1')
			.replace(/\*(.*?)\*/g, '$1')
			.replace(/`([^`]*)`/g, '$1')
			.replace(/<[^>]+>/g, '')
			.replace(/&amp;/g, '&')
			.replace(/&#123;/g, '{')
			.replace(/&#125;/g, '}')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/\s+#+\s*$/, '')
			.trim()
	);
}

/** h2/h3 aus Markdown lesen (Codeblöcke werden übersprungen). */
export function extractToc(md: string): { id: string; text: string; level: 2 | 3 }[] {
	const items: { id: string; text: string; level: 2 | 3 }[] = [];
	let fence: string | null = null;
	for (const line of md.split(/\r?\n/)) {
		const f = /^\s*(`{3,}|~{3,})/.exec(line);
		if (f) {
			const marker = f[1]!;
			if (fence === null) fence = marker[0]!.repeat(marker.length);
			else if (marker.startsWith(fence)) fence = null;
			continue;
		}
		if (fence !== null) continue;
		const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
		if (!m) continue;
		const text = plainText(m[2]!);
		items.push({ id: slugify(text), text, level: m[1]!.length as 2 | 3 });
	}
	return items;
}

/** Einfaches Frontmatter (key: value je Zeile) lesen. */
export function parseFrontmatter(md: string): { data: Record<string, string>; body: string } {
	const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
	const data: Record<string, string> = {};
	if (!m) return { data, body: md };
	for (const line of m[1]!.split(/\r?\n/)) {
		const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
		if (!kv) continue;
		let v = kv[2]!.trim();
		if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
		data[kv[1]!] = v;
	}
	return { data, body: md.slice(m[0].length) };
}

/** Ein Abschnitt (Einleitung oder h2/h3) einer Doku-Seite für den Suchindex. */
export interface SearchSection {
	/** Anker der Überschrift; leer für den Text vor der ersten Überschrift. */
	id: string;
	heading: string;
	level: 0 | 2 | 3;
	/** Fließtext ohne Markdown. */
	text: string;
	/** Inhalt der Codeblöcke (gekürzt), nur zum Finden. */
	code: string;
}

const MAX_CODE_PER_BLOCK = 600;

/** Eine Fließtextzeile in reinen Text umwandeln (Tabellen, Listen, Zitate, Komponenten). */
function proseLine(line: string): string {
	let s = line.trim();
	if (!s) return '';
	// Svelte-Komponenten wie <DocShot … /> ignorieren.
	if (/^<[A-Z][^>]*\/?>$/.test(s)) return '';
	s = s.replace(/<[A-Z][^>]*\/>/g, '');
	if (s.startsWith('|')) s = s.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean).join(' · ');
	s = s.replace(/^#{4,6}\s+/, '').replace(/^>\s?/, '').replace(/^(?:[-*+]|\d+\.)\s+/, '');
	return plainText(s);
}

/** Markdown in Abschnitte (Einleitung, h2, h3) mit reinem Text zerlegen. */
export function extractSections(md: string): SearchSection[] {
	const body = parseFrontmatter(md).body.replace(/<script[\s\S]*?<\/script>/g, '');
	const sections: SearchSection[] = [];
	let cur = { id: '', heading: '', level: 0 as 0 | 2 | 3, text: [] as string[], code: [] as string[] };
	const flush = () => {
		const text = cur.text.join(' ').replace(/\s+/g, ' ').trim();
		const code = cur.code.join(' ').replace(/\s+/g, ' ').trim();
		if (cur.level > 0 || text || code) sections.push({ id: cur.id, heading: cur.heading, level: cur.level, text, code });
	};
	let fence: string | null = null;
	let block = '';
	for (const line of body.split(/\r?\n/)) {
		const f = /^\s*(`{3,}|~{3,})/.exec(line);
		if (f) {
			const marker = f[1]!;
			if (fence === null) {
				fence = marker[0]!.repeat(marker.length);
				block = '';
			} else if (marker.startsWith(fence)) {
				fence = null;
				cur.code.push(block.slice(0, MAX_CODE_PER_BLOCK));
			}
			continue;
		}
		if (fence !== null) {
			block += line + '\n';
			continue;
		}
		const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
		if (m) {
			flush();
			const heading = plainText(m[2]!);
			cur = { id: slugify(heading), heading, level: m[1]!.length as 2 | 3, text: [], code: [] };
			continue;
		}
		// Tabellen-Trennzeile: die Kopfzeile davor ist für die Suche nur Rauschen.
		if (/^\s*\|?\s*:?-{2,}/.test(line)) {
			cur.text.pop();
			continue;
		}
		const p = proseLine(line);
		if (p) cur.text.push(p);
	}
	flush();
	return sections;
}
