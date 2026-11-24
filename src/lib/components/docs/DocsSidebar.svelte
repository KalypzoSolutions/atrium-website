<script lang="ts">
	import type { Lang } from '$lib/config';
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import DocsNav from './DocsNav.svelte';

	interface Props {
		lang: Lang;
		/** Slug der aktuellen Seite. */
		current: string;
	}
	let { lang, current }: Props = $props();
</script>

<!-- Desktop: feste Seitenleiste mit eigener Scrollleiste -->
<div
	class="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto overscroll-contain pr-5 pb-10 [scrollbar-gutter:stable] [scrollbar-width:thin]"
>
	<div class="sticky top-0 z-10 bg-white pt-6 pb-5 dark:bg-ink-950">
		<SearchButton {lang} variant="sidebar" />
	</div>
	<DocsNav {lang} {current} idPrefix="docs-nav" />
</div>
