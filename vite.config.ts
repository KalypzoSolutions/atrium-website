import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { extractSections, extractToc, parseFrontmatter } from './src/lib/docs-extract';

const DOCS_DIR = resolve('src/content/docs');
const VIRTUAL_ID = 'virtual:docs-index';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const SEARCH_ID = 'virtual:docs-search';
const RESOLVED_SEARCH_ID = '\0' + SEARCH_ID;

/** Volltext je Abschnitt für den Suchindex (nur serverseitig importiert, siehe src/routes/search). */
function buildSearch(): string {
	const out: Record<string, unknown[]> = {};
	for (const lang of readdirSync(DOCS_DIR)) {
		const pages = [];
		for (const file of readdirSync(join(DOCS_DIR, lang))) {
			if (!file.endsWith('.md')) continue;
			const md = readFileSync(join(DOCS_DIR, lang, file), 'utf8');
			const { data } = parseFrontmatter(md);
			const slug = file.slice(0, -3);
			pages.push({
				order: Number(data.order ?? 999),
				slug,
				title: data.title ?? slug,
				description: data.description ?? '',
				section: data.section ?? '',
				sections: extractSections(md)
			});
		}
		pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
		out[lang] = pages.map(({ order: _order, ...p }) => p);
	}
	return `export default ${JSON.stringify(out)};`;
}

/** Stellt einen kleinen Index aller Doku-Seiten bereit (Frontmatter + Inhaltsverzeichnis). */
function docsIndex(): Plugin {
	const build = () => {
		const entries = [];
		for (const lang of readdirSync(DOCS_DIR)) {
			for (const file of readdirSync(join(DOCS_DIR, lang))) {
				if (!file.endsWith('.md')) continue;
				const md = readFileSync(join(DOCS_DIR, lang, file), 'utf8');
				const { data } = parseFrontmatter(md);
				entries.push({
					lang,
					slug: file.slice(0, -3),
					title: data.title ?? file,
					description: data.description ?? '',
					order: Number(data.order ?? 999),
					section: data.section ?? '',
					source: data.source || undefined,
					toc: extractToc(md)
				});
			}
		}
		return `export default ${JSON.stringify(entries)};`;
	};
	return {
		name: 'atrium-docs-index',
		resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : id === SEARCH_ID ? RESOLVED_SEARCH_ID : undefined),
		load: (id) => (id === RESOLVED_ID ? build() : id === RESOLVED_SEARCH_ID ? buildSearch() : undefined),
		handleHotUpdate({ file, server }) {
			if (file.replace(/\\/g, '/').includes('/src/content/docs/')) {
				for (const id of [RESOLVED_ID, RESOLVED_SEARCH_ID]) {
					const mod = server.moduleGraph.getModuleById(id);
					if (mod) server.moduleGraph.invalidateModule(mod);
				}
			}
		}
	};
}

export default defineConfig({
	plugins: [docsIndex(), tailwindcss(), sveltekit()]
});
