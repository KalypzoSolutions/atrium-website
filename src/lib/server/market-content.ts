/**
 * Inhalte der Marktplatz-Detailseiten: README und Modul-Manifest werden beim Prerender von GitHub
 * geladen und als sicheres HTML gerendert.
 *
 * Abrufe gehen an raw.githubusercontent.com und werden je URL zwischengespeichert (beide Sprachen
 * teilen sich einen Abruf). Fehlt eine Datei, wird der nächste Kandidat versucht; bei Netzwerkfehlern
 * oder Timeouts gibt es nur eine Warnung und kein Ergebnis – der Build schlägt deshalb nicht fehl.
 * Mit `MARKET_FETCH=off` werden alle Abrufe übersprungen (Offline-Entwicklung).
 *
 * Das Markdown wird mit unified gerendert und mit rehype-sanitize bereinigt (keine Skripte, Styles,
 * Event-Handler oder iframes). Erst danach greifen die eigenen Plugins: Überschriften herabstufen,
 * Links und Bilder umschreiben sowie Codeblöcke mit Shiki im Markup der Doku hervorheben.
 */
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { toString } from 'hast-util-to-string';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { bundledLanguages, createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import type { Lang } from '$lib/config';
import { slugify } from '$lib/docs-extract';
import { githubLocation, moduleSource, type MarketModule, type MarketSource } from '$lib/marketplace';

/** Gerendertes Markdown einer Datei aus GitHub. */
export interface RenderedMarkdown {
	html: string;
	/** GitHub-Ansicht der Datei (blob-URL) */
	url: string;
	/** Dateipfad im Repository, z. B. modules/notes/README.md */
	file: string;
}

/** Für die Anzeige relevante Angaben aus `atrium-module.json`. */
export interface ModuleManifest {
	version?: string;
	/** Unterstützte Atrium-Versionen (semver-Bereich) */
	core?: string;
	/** Modul-ID → Versionsbereich */
	dependencies: Record<string, string>;
	/** Modul-ID → Versionsbereich */
	optionalDependencies: Record<string, string>;
	permissions: string[];
}

/** Repository-Kontext einer Markdown-Datei; `dir` ist ihr Ordner ('' für das Root). */
export interface MarkdownContext {
	owner: string;
	repo: string;
	ref: string;
	dir: string;
}

const FETCH_TIMEOUT = 10_000;
/** Hosts, von denen README-Bilder eingebunden werden (siehe img-src in deploy/security-headers.conf). */
const IMAGE_HOSTS = new Set(['raw.githubusercontent.com', 'user-images.githubusercontent.com']);
const ID_PREFIX = 'readme-';

/* ------------------------------------------------------------------ Abruf */

type FetchResult = { status: 'ok'; text: string } | { status: 'missing' } | { status: 'error' };

const cache = new Map<string, Promise<FetchResult>>();

const fetchDisabled = () => process.env.MARKET_FETCH === 'off';

/** Pfad aus Segmenten bauen, leere Segmente entfernen. */
const joinPath = (...parts: string[]) => parts.flatMap((p) => p.split('/')).filter(Boolean).join('/');
const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

const rawUrl = (owner: string, repo: string, ref: string, path: string) =>
	`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${encodePath(path)}`;
const blobUrl = (owner: string, repo: string, ref: string, path: string) =>
	`https://github.com/${owner}/${repo}/blob/${encodeURIComponent(ref)}/${encodePath(path)}`;

/** Lädt eine Datei (zwischengespeichert je URL). 404 → 'missing', alles andere Unerwartete → 'error'. */
function fetchRaw(url: string): Promise<FetchResult> {
	let p = cache.get(url);
	if (!p) {
		p = (async (): Promise<FetchResult> => {
			try {
				const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
				if (res.status === 404) return { status: 'missing' };
				if (!res.ok) {
					console.warn(`[marktplatz] ${url}: HTTP ${res.status}`);
					return { status: 'error' };
				}
				return { status: 'ok', text: await res.text() };
			} catch (e) {
				console.warn(`[marktplatz] ${url} konnte nicht geladen werden: ${(e as Error)?.message ?? e}`);
				return { status: 'error' };
			}
		})();
		cache.set(url, p);
	}
	return p;
}

/** Erste vorhandene Datei aus `candidates` laden und rendern; null, wenn keine existiert oder ein Fehler auftritt. */
async function loadMarkdown(
	owner: string,
	repo: string,
	ref: string,
	candidates: string[]
): Promise<RenderedMarkdown | null> {
	if (fetchDisabled()) return null;
	for (const file of [...new Set(candidates)]) {
		const res = await fetchRaw(rawUrl(owner, repo, ref, file));
		if (res.status === 'missing') continue;
		if (res.status === 'error') return null;
		const dir = file.split('/').slice(0, -1).join('/');
		try {
			const html = await renderMarkdown(res.text, { owner, repo, ref, dir });
			return { html, url: blobUrl(owner, repo, ref, file), file };
		} catch (e) {
			console.warn(`[marktplatz] ${file} in ${owner}/${repo} konnte nicht gerendert werden: ${(e as Error)?.message ?? e}`);
			return null;
		}
	}
	return null;
}

/**
 * README einer Quelle: zuerst im Ordner `s.path` (README.<lang>.md, README.md), dann im
 * Repository-Root (README.<lang>.md, README.md).
 */
export async function loadSourceReadme(s: MarketSource, lang: Lang): Promise<RenderedMarkdown | null> {
	const { owner, repo } = githubLocation(s.repository);
	const dir = joinPath(s.path ?? '');
	const candidates = [
		...(dir ? [`${dir}/README.${lang}.md`, `${dir}/README.md`] : []),
		`README.${lang}.md`,
		'README.md'
	];
	return loadMarkdown(owner, repo, s.ref ?? 'main', candidates);
}

/** README und Manifest (`atrium-module.json`) aus dem Modulordner. */
export async function loadModuleContent(
	s: MarketSource,
	m: MarketModule,
	lang: Lang
): Promise<{ readme: RenderedMarkdown | null; manifest: ModuleManifest | null }> {
	const loc = githubLocation(moduleSource(s, m));
	const ref = loc.ref ?? s.ref ?? 'main';
	const file = (name: string) => joinPath(loc.path, name);
	const [readme, manifest] = await Promise.all([
		loadMarkdown(loc.owner, loc.repo, ref, [file(`README.${lang}.md`), file('README.md'), file('readme.md')]),
		loadManifest(rawUrl(loc.owner, loc.repo, ref, file('atrium-module.json')))
	]);
	return { readme, manifest };
}

async function loadManifest(url: string): Promise<ModuleManifest | null> {
	if (fetchDisabled()) return null;
	const res = await fetchRaw(url);
	if (res.status !== 'ok') return null;
	try {
		return parseManifest(JSON.parse(res.text));
	} catch (e) {
		console.warn(`[marktplatz] ${url}: ungültiges JSON (${(e as Error)?.message ?? e})`);
		return null;
	}
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Abhängigkeiten normalisieren: `{ id: '^1.0.0' }` oder `{ id: { version: '^1.0.0' } }` → `{ id: '^1.0.0' }`. */
function parseDeps(v: unknown): Record<string, string> {
	const out: Record<string, string> = {};
	if (!isObject(v)) return out;
	for (const [id, spec] of Object.entries(v)) {
		const version = str(spec) ?? (isObject(spec) ? str(spec.version) : undefined);
		out[id] = version ?? '*';
	}
	return out;
}

/** Manifest robust auslesen; fehlende oder falsche Felder werden ignoriert (das Feld `npm` immer). */
function parseManifest(json: unknown): ModuleManifest | null {
	if (!isObject(json)) return null;
	return {
		version: str(json.version),
		core: str(json.core),
		dependencies: parseDeps(json.dependencies),
		optionalDependencies: parseDeps(json.optionalDependencies),
		permissions: Array.isArray(json.permissions)
			? json.permissions.filter((p): p is string => typeof p === 'string' && !!p.trim())
			: []
	};
}

/* ------------------------------------------------------------- Rendering */

/**
 * Sanitize-Schema: GitHub-ähnliche Vorgabe (defaultSchema) ohne Skripte, Styles, Event-Handler oder
 * iframes; ids erhalten das Präfix `readme-`, Links nur http(s)/mailto, Bilder nur http(s).
 */
const sanitizeSchema: SanitizeSchema = {
	...defaultSchema,
	clobberPrefix: ID_PREFIX,
	protocols: { ...defaultSchema.protocols, href: ['http', 'https', 'mailto'], src: ['http', 'https'] }
};

let highlighter: Promise<Highlighter> | undefined;
/** Shiki-Highlighter einmalig und erst bei Bedarf erzeugen (Themes wie in svelte.config.js). */
const getHighlighter = () =>
	(highlighter ??= createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['text'] }));

/** Ein paar übliche Kurzformen auf Shiki-Sprachen abbilden. */
const LANG_ALIASES: Record<string, string> = { sh: 'bash', zsh: 'bash', console: 'bash', yml: 'yaml', env: 'ini' };

/** Sprache laden, falls Shiki sie kennt; sonst 'text'. */
async function resolveLang(h: Highlighter, lang: string): Promise<string> {
	const l = LANG_ALIASES[lang] ?? lang;
	if (h.getLoadedLanguages().includes(l)) return l;
	if (l in bundledLanguages) {
		await h.loadLanguage(l as BundledLanguage);
		return l;
	}
	return 'text';
}

/** Überschriften um eine Ebene herabstufen (h1 → h2 … h5 → h6) und ids `readme-<slug>` vergeben. */
function rehypeHeadings() {
	return (tree: Root) => {
		const seen = new Map<string, number>();
		visit(tree, 'element', (node: Element) => {
			const m = /^h([1-6])$/.exec(node.tagName);
			if (!m) return;
			node.tagName = `h${Math.min(Number(m[1]) + 1, 6)}`;
			// Von rehype-sanitize bereits präfixierte ids (z. B. Fußnoten-Überschrift) bleiben erhalten.
			const existing = typeof node.properties.id === 'string' ? node.properties.id : '';
			if (existing.startsWith(ID_PREFIX)) return;
			const base = slugify(toString(node)) || 'abschnitt';
			const n = seen.get(base) ?? 0;
			seen.set(base, n + 1);
			node.properties.id = ID_PREFIX + (n ? `${base}-${n}` : base);
		});
	};
}

/** Relativen Pfad (auch „/…“ für das Repository-Root) gegen `dir` auflösen; null bei absoluten URLs. */
function resolveRelative(href: string, dir: string): { path: string; search: string; hash: string } | null {
	if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null;
	const base = new URL(`https://repo.invalid/${dir ? dir + '/' : ''}`);
	const url = new URL(href, base);
	return { path: decodeURIComponent(url.pathname.replace(/^\/+/, '')), search: url.search, hash: url.hash };
}

/** Anker in der README auf die ids mit Präfix abbilden. */
const anchor = (hash: string) => {
	let id = hash.replace(/^#/, '');
	try {
		id = decodeURIComponent(id);
	} catch {
		// unverändert lassen
	}
	if (id.startsWith(ID_PREFIX)) return `#${id}`;
	return `#${ID_PREFIX}${slugify(id)}`;
};

/** GitHub-Datei-Links (blob/raw) eines Bildes auf raw.githubusercontent.com umschreiben. */
function githubImageToRaw(src: string): string {
	const m = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\/(?:blob|raw)\/(.+?)(?:\?.*)?$/.exec(src);
	return m ? `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}` : src;
}

/** Links und Bilder umschreiben (relative Pfade, Anker, externe Links, erlaubte Bild-Hosts). */
function rehypeLinksAndImages(ctx: MarkdownContext) {
	return (tree: Root) => {
		visit(tree, 'element', (node: Element, index, parent) => {
			if (node.tagName === 'a') {
				const href = typeof node.properties.href === 'string' ? node.properties.href.trim() : '';
				if (!href) return;
				if (href.startsWith('#')) {
					node.properties.href = anchor(href);
					return;
				}
				const rel = resolveRelative(href, ctx.dir);
				const target = rel ? blobUrl(ctx.owner, ctx.repo, ctx.ref, rel.path) + rel.search + rel.hash : href;
				if (!/^(https?|mailto):/i.test(target)) {
					// Sollte nach dem Sanitizing nicht vorkommen – sicherheitshalber Link entfernen.
					delete node.properties.href;
					return;
				}
				node.properties.href = target;
				if (/^https?:/i.test(target)) {
					node.properties.target = '_blank';
					node.properties.rel = ['noopener', 'nofollow'];
				}
				return;
			}
			if (node.tagName === 'img' && parent && typeof index === 'number') {
				const src = typeof node.properties.src === 'string' ? node.properties.src.trim() : '';
				const rel = src ? resolveRelative(src, ctx.dir) : null;
				const url = rel ? rawUrl(ctx.owner, ctx.repo, ctx.ref, rel.path) + rel.search : githubImageToRaw(src);
				let host = '';
				try {
					host = new URL(url).protocol === 'https:' ? new URL(url).hostname : '';
				} catch {
					// ungültige URL → kein Host
				}
				if (IMAGE_HOSTS.has(host)) {
					node.properties.src = url;
					node.properties.loading = 'lazy';
					node.properties.decoding = 'async';
					return;
				}
				// Fremdes Bild: durch einen Link mit Alt-Text ersetzen (in Links nur durch den Text).
				const alt = typeof node.properties.alt === 'string' && node.properties.alt.trim() ? node.properties.alt : url;
				const text: ElementContent = { type: 'text', value: alt || '' };
				const inLink = parent.type === 'element' && parent.tagName === 'a';
				const replacement: ElementContent =
					inLink || !/^https?:/i.test(url)
						? text
						: {
								type: 'element',
								tagName: 'a',
								properties: { href: url, target: '_blank', rel: ['noopener', 'nofollow'] },
								children: [text]
							};
				(parent.children as RootContent[]).splice(index, 1, replacement);
				return [SKIP, index + 1];
			}
		});
	};
}

/**
 * Codeblöcke (`pre > code.language-x`) mit Shiki hervorheben – im gleichen Markup wie die Doku:
 * `<div class="code-block" data-lang="x">…</div>`. Läuft nach dem Sanitizing; das Shiki-HTML wird als
 * raw-Knoten eingesetzt, damit seine Styles (CSS-Variablen der Themes) erhalten bleiben.
 */
function rehypeShiki() {
	return async (tree: Root) => {
		const blocks: { node: Element; index: number; parent: Root | Element; code: string; lang: string }[] = [];
		visit(tree, 'element', (node: Element, index, parent) => {
			if (node.tagName !== 'pre' || !parent || typeof index !== 'number') return;
			const code = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
			if (!code) return;
			const cls = Array.isArray(code.properties.className) ? code.properties.className.map(String) : [];
			const lang = cls.find((c) => c.startsWith('language-'))?.slice('language-'.length).toLowerCase() ?? 'text';
			blocks.push({ node, index, parent, code: toString(code).replace(/\n$/, ''), lang });
			return SKIP;
		});
		if (!blocks.length) return;
		const h = await getHighlighter();
		for (const b of blocks) {
			const language = await resolveLang(h, b.lang);
			const html = h.codeToHtml(b.code, {
				lang: language,
				themes: { light: 'github-light', dark: 'github-dark' },
				defaultColor: false
			});
			b.parent.children[b.index] = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['code-block'], dataLang: language },
				children: [{ type: 'raw', value: html } as unknown as ElementContent]
			};
		}
	};
}

/** Markdown (GFM, inkl. HTML) sicher zu HTML rendern; `ctx` bestimmt, wohin relative Links zeigen. */
export async function renderMarkdown(md: string, ctx: MarkdownContext): Promise<string> {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		// Footnote-ids ohne eigenes Präfix – das vergibt rehype-sanitize (clobberPrefix).
		.use(remarkRehype, { allowDangerousHtml: true, clobberPrefix: '' })
		.use(rehypeRaw)
		.use(rehypeSanitize, sanitizeSchema)
		.use(rehypeHeadings)
		.use(rehypeLinksAndImages, ctx)
		.use(rehypeShiki)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(md);
	return String(file);
}
