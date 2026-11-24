declare module 'virtual:docs-index' {
	const entries: Array<Record<string, unknown>>;
	export default entries;
}

declare module 'virtual:docs-search' {
	import type { SearchSection } from '$lib/docs-extract';
	const pages: Record<
		string,
		Array<{ slug: string; title: string; description: string; section: string; sections: SearchSection[] }>
	>;
	export default pages;
}
