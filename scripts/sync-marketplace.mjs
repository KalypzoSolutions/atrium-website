// Synchronisiert die kuratierten Quellen. Optional erhöht GITHUB_TOKEN das GitHub-API-Limit.
// Vites SSR-Loader versteht TypeScript und $lib; so bleibt marketSources die einzige Quellenliste.
import { createServer } from 'vite';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

const vite = await createServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
const { marketSources, githubRepoSlug } = await vite.ssrLoadModule('/src/lib/marketplace.ts');
await vite.close();
const headers = { 'User-Agent': 'atrium-marketplace-sync', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
const limit = 5 * 1024 * 1024;
async function request(url, optional = false) {
	const res = await fetch(url, { headers });
	if (optional && res.status === 404) return null;
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status} ${res.statusText}${res.status === 403 ? ' (GITHUB_TOKEN oder API-Limit prüfen)' : ''}`);
	return res;
}
async function json(url) { return (await request(url)).json(); }
async function save(file, data) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, data); }
const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');
const validId = (id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
try {
	for (const source of marketSources) {
		const repo = githubRepoSlug(source.repository);
		const api = `https://api.github.com/repos/${repo}`;
		const commit = (await json(`${api}/commits/${encodeURIComponent(source.ref ?? 'main')}`)).sha;
		const raw = (file, sha = commit) => `https://raw.githubusercontent.com/${repo}/${sha}/${encodePath(file)}`;
		const tree = await json(`${api}/git/trees/${commit}?recursive=1`);
		if (tree.truncated) throw new Error(`${repo}: Dateibaum unvollständig`);
		const files = new Set(tree.tree.filter((f) => f.type === 'blob').map((f) => f.path));
		const base = (source.path ?? '').replace(/^\/+|\/+$/g, '');
		const catalogPath = [base, 'atrium-modules.json'].filter(Boolean).join('/');
		const catalog = await json(raw(catalogPath));
		const out = `src/content/marketplace/${source.id}`;
		const assets = `static/marketplace/${source.id}`;
		await rm(out, { recursive: true, force: true });
		await rm(assets, { recursive: true, force: true });
		const syncedAt = new Date().toISOString();
		const sourceReadme = files.has('README.md') ? 'README.md' : files.has(`${base}/README.md`) ? `${base}/README.md` : null;
		await save(`${out}/source.json`, JSON.stringify({ id: source.id, repository: source.repository, commit, syncedAt, catalog, readmePath: sourceReadme }, null, '\t') + '\n');
		if (sourceReadme) await save(`${out}/README.md`, await (await request(raw(sourceReadme))).text());
		for (const entry of catalog.modules) {
			if (!validId(entry.id) || !source.modules.some((m) => m.id === entry.id)) { console.warn(`${source.id}: unbekanntes Modul ${entry.id}, übersprungen`); continue; }
			const dir = path.posix.normalize([base, entry.path].filter(Boolean).join('/'));
			if (dir.startsWith('../') || dir.startsWith('/')) throw new Error(`Ungültiger Modulpfad: ${entry.path}`);
			const manifestPath = `${dir}/atrium-module.json`;
			const manifest = await json(raw(manifestPath));
			const readmePath = [`${dir}/README.md`, `${dir}/docs/README.md`, `${dir}/doc/README.md`].find((p) => files.has(p));
			const readme = readmePath ? await (await request(raw(readmePath))).text() : null;
			if (readme) await save(`${out}/modules/${entry.id}.md`, readme);
			const candidates = new Set([...files].filter((p) => p.startsWith(`${dir}/screenshots/`)));
			if (readme) marked.walkTokens(marked.lexer(readme), (token) => {
				if (token.type !== 'image') return;
				const url = token.href;
				if (!/^(?:[a-z]+:|\/|#)/i.test(url)) {
					try { candidates.add(path.posix.normalize(path.posix.join(path.posix.dirname(readmePath), decodeURIComponent(url.split(/[?#]/)[0])))); }
					catch { console.warn('Ungültiger Bildpfad:', url); }
				}
			});
			const images = [];
			for (const file of candidates) {
				if (!file.startsWith(`${dir}/`) || !files.has(file) || !/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) continue;
				const response = await request(raw(file));
				if (Number(response.headers.get('content-length')) > limit) { console.warn(`${file}: Bild zu groß`); continue; }
				let data = Buffer.from(await response.arrayBuffer());
				if (data.length > limit) { console.warn(`${file}: Bild zu groß`); continue; }
				// Nur einfache SVG-Geometrie ohne aktive Inhalte oder externe Referenzen übernehmen.
				if (/\.svg$/i.test(file)) {
					const clean = sanitizeHtml(data.toString('utf8'), {
						parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
						allowedTags: ['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'title', 'desc'],
						allowedAttributes: { '*': ['viewBox', 'xmlns', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform'] },
						transformTags: { '*': (tagName, attribs) => ({ tagName, attribs: Object.fromEntries(Object.entries(attribs).filter(([, value]) => !/url\s*\(/i.test(value))) }) }
					});
					if (!clean.startsWith('<svg')) continue;
					data = Buffer.from(clean);
				}
				const relative = file.slice(dir.length + 1);
				await save(`${assets}/${entry.id}/${relative}`, data);
				images.push({ path: file, url: `/marketplace/${source.id}/${entry.id}/${relative.split('/').map(encodeURIComponent).join('/')}` });
			}
			const commits = await json(`${api}/commits?sha=${commit}&path=${encodeURIComponent(manifestPath)}&per_page=100`);
			const versions = [];
			for (const item of commits.reverse()) {
				const response = await request(raw(manifestPath, item.sha), true);
				if (!response) continue;
				const version = (await response.json()).version;
				if (version && !versions.some((v) => v.version === version)) versions.push({ version, date: item.commit.author.date, url: item.html_url });
			}
			versions.reverse().splice(20);
			await save(`${out}/modules/${entry.id}.json`, JSON.stringify({ ...manifest, readmePath: readmePath ?? null, images, versions }, null, '\t') + '\n');
			console.log(`${source.id}/${entry.id}: ${manifest.version}, ${versions.length} Versionen`);
		}
	}
} catch (error) { console.error('Marktplatz-Synchronisierung fehlgeschlagen:', error); process.exitCode = 1; }
