<script lang="ts">
	import type { Lang } from '$lib/config';
	import { landing, TECH_STACK } from '$lib/content/landing';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
</script>

<div class="container-x">
	<p class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
		<span class="text-ink-400 dark:text-ink-500">{c.built.label}</span>
		{#each TECH_STACK as tech (tech)}
			<span class="font-medium text-ink-600 dark:text-ink-300">{tech}</span>
		{/each}
	</p>
</div>
