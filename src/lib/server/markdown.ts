import { marked, Renderer } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { createHighlighter } from 'shiki';
import { posix } from 'node:path';
import { slugify } from '$lib/docs-extract';
import type { MarketImage } from '$lib/marketplace-details';

export interface ReadmeContext {
	/** GitHub-Repository als owner/repo oder vollständige GitHub-URL. */
	repository: string;
	commit: string;
	/** Repository-Pfad der README-Datei. */
	readmePath: string;
	images: MarketImage[];
	removeH1?: boolean;
}
export interface ReadmeTocEntry { id: string; text: string; level: 2 | 3 }

const highlighter = createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: ['bash', 'shell', 'ts', 'js', 'json', 'yaml', 'svelte', 'sql', 'nginx', 'dockerfile', 'text', 'ini', 'html', 'http']
});

/** Rendert fremde README-Inhalte als bereinigtes HTML und Inhaltsverzeichnis. */
export async function renderReadme(md: string, ctx: ReadmeContext): Promise<{ html: string; toc: ReadmeTocEntry[] }> {
	const shiki = await highlighter;
	const toc: ReadmeTocEntry[] = [];
	const used = new Map<string, number>();
	let removedH1 = false;
	const renderer = new Renderer();
	renderer.html = () => '';
	renderer.heading = function ({ tokens, depth }) {
		if (depth === 1 && ctx.removeH1 && !removedH1) { removedH1 = true; return ''; }
		const content = this.parser.parseInline(tokens);
		const text = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
		const base = slugify(text) || 'abschnitt';
		const count = used.get(base) ?? 0;
		used.set(base, count + 1);
		const id = count ? `${base}-${count}` : base;
		if (depth === 2 || depth === 3) toc.push({ id, text, level: depth });
		return `<h${depth} id="${id}">${content}</h${depth}>`;
	};
	renderer.image = ({ href, text }) => {
		if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return '';
		let file: string;
		try { file = posix.normalize(posix.join(posix.dirname(ctx.readmePath), decodeURIComponent(href.split(/[?#]/)[0]!))); } catch { return ''; }
		const image = ctx.images.find((item) => item.path === file);
		return image ? `<img src="${sanitizeHtml(image.url, { allowedTags: [], allowedAttributes: {} })}" alt="${sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} })}">` : '';
	};
	renderer.link = function ({ href, title, tokens }) {
		let url = href;
		if (!/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) {
			const repo = ctx.repository.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
			const [file, suffix = ''] = href.split(/(?=[?#])/);
			url = `https://github.com/${repo}/blob/${encodeURIComponent(ctx.commit)}/${posix.normalize(posix.join(posix.dirname(ctx.readmePath), file!)).split('/').map(encodeURIComponent).join('/')}${suffix}`;
		}
		const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return `<a href="${escape(url)}"${title ? ` title="${escape(title)}"` : ''}${/^https?:/i.test(url) ? ' rel="noopener"' : ''}>${this.parser.parseInline(tokens)}</a>`;
	};
	renderer.code = ({ text, lang }) => {
		const language = lang?.split(/\s+/)[0] ?? 'text';
		const safeLang = shiki.getLoadedLanguages().includes(language) ? language : 'text';
		return `<div class="code-block" data-lang="${safeLang}">${shiki.codeToHtml(text, { lang: safeLang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false })}</div>`;
	};
	const rendered = await marked.parse(md, { renderer });
	const html = sanitizeHtml(rendered, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'span'],
		allowedAttributes: { '*': ['id', 'class'], a: ['href', 'title', 'rel'], img: ['src', 'alt'], div: ['data-lang'], span: ['style'], pre: ['style', 'tabindex'] },
		allowedStyles: { '*': { 'background-color': [/^#[0-9a-f]{3,8}$/i], color: [/^#[0-9a-f]{3,8}$/i], '--shiki-light': [/^#[0-9a-f]{3,8}$/i], '--shiki-dark': [/^#[0-9a-f]{3,8}$/i], '--shiki-light-bg': [/^#[0-9a-f]{3,8}$/i], '--shiki-dark-bg': [/^#[0-9a-f]{3,8}$/i] } }
	});
	return { html, toc };
}
