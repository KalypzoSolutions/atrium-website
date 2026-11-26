<script lang="ts">
	import { MARKET_SLUG, type Lang } from '$lib/config';
	import { marketSourcePath } from '$lib/marketplace';
	import { t } from '$lib/i18n';
	let { lang, source, module }: { lang: Lang; source: { id: string; name: string }; module?: string } = $props();
	const d = $derived(t(lang).market);
</script>
<nav aria-label={d.detail.breadcrumb} class="text-sm text-ink-500 dark:text-ink-400">
	<ol class="flex flex-wrap items-center gap-2">
		<li><a class="hover:underline" href="/{lang}/{MARKET_SLUG[lang]}">{d.eyebrow}</a></li>
		<li aria-hidden="true">/</li>
		<li>{#if module}<a class="hover:underline" href={marketSourcePath(lang, source.id)}>{source.name}</a>{:else}<span aria-current="page">{source.name}</span>{/if}</li>
		{#if module}<li aria-hidden="true">/</li><li aria-current="page">{module}</li>{/if}
	</ol>
</nav>
