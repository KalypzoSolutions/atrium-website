import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: ['bash', 'shell', 'ts', 'js', 'json', 'yaml', 'svelte', 'sql', 'nginx', 'dockerfile', 'text', 'ini', 'html', 'http']
});

/** Fügt Überschriften (h2/h3) eine id hinzu, damit Inhaltsverzeichnis und Anker funktionieren. */
function rehypeSlug() {
	const slugify = (s) =>
		s
			.toLowerCase()
			.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	const text = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(text).join(''));
	return (tree) => {
		const walk = (node) => {
			if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
				node.properties = node.properties ?? {};
				node.properties.id = node.properties.id ?? slugify(text(node));
			}
			(node.children ?? []).forEach(walk);
		};
		walk(tree);
	};
}

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	rehypePlugins: [rehypeSlug],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const language = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang: language,
					themes: { light: 'github-light', dark: 'github-dark' },
					defaultColor: false
				})
			);
			return `<div class="code-block" data-lang="${language}">{@html \`${html}\`}</div>`;
		}
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', precompress: true, strict: true }),
		alias: { $content: 'src/content' },
		prerender: {
			handleHttpError: 'fail',
			handleMissingId: 'warn',
			entries: ['*', '/de', '/en', '/sitemap.xml', '/robots.txt']
		}
	}
};

export default config;
