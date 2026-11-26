import { marketSources } from '$lib/marketplace';

export interface MarketImage { path: string; url: string }
export interface MarketVersion { version: string; date: string; url: string }
export interface MarketSourceDetails {
	id: string;
	repository: string;
	commit: string;
	syncedAt: string;
	catalog: { schema: number; name: string; description?: string; modules: { id: string; path: string }[] };
	readmePath: string | null;
	readme?: string;
}
export interface MarketModuleDetails {
	id: string;
	name: string;
	description?: string;
	version: string;
	core: string;
	dependencies: Record<string, { version: string; source?: string }>;
	optionalDependencies: Record<string, { version: string; source?: string }>;
	permissions: string[];
	versions: MarketVersion[];
	images: MarketImage[];
	readmePath: string | null;
	readme?: string;
}

const sources = import.meta.glob<MarketSourceDetails>('/src/content/marketplace/*/source.json', { eager: true, import: 'default' });
const modules = import.meta.glob<MarketModuleDetails>('/src/content/marketplace/*/modules/*.json', { eager: true, import: 'default' });
const readmes = import.meta.glob<string>('/src/content/marketplace/**/*.md', { eager: true, query: '?raw', import: 'default' });

for (const file of Object.keys(sources)) {
	const id = file.split('/')[4];
	if (!marketSources.some((source) => source.id === id)) console.warn(`Unbekannter Marktplatz-Snapshot: ${file}`);
}
for (const file of Object.keys(modules)) {
	const parts = file.split('/');
	const source = marketSources.find((item) => item.id === parts[4]);
	if (!source?.modules.some((item) => `${item.id}.json` === parts[6])) console.warn(`Unbekannter Modul-Snapshot: ${file}`);
}

/** Lädt den Snapshot einer bekannten Quelle, sofern vorhanden. */
export function getSourceDetails(sourceId: string): MarketSourceDetails | undefined {
	if (!marketSources.some((source) => source.id === sourceId)) return undefined;
	const base = `/src/content/marketplace/${sourceId}`;
	const data = sources[`${base}/source.json`];
	return data ? { ...data, readme: readmes[`${base}/README.md`] } : undefined;
}

/** Lädt den Snapshot eines bekannten Moduls, sofern vorhanden. */
export function getModuleDetails(sourceId: string, moduleId: string): MarketModuleDetails | undefined {
	if (!marketSources.find((source) => source.id === sourceId)?.modules.some((module) => module.id === moduleId)) return undefined;
	const base = `/src/content/marketplace/${sourceId}/modules/${moduleId}`;
	const data = modules[`${base}.json`];
	return data ? { ...data, readme: readmes[`${base}.md`] } : undefined;
}
