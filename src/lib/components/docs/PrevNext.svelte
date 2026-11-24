<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { docHref, type DocMeta } from '$lib/docs';

	interface Props {
		lang: Lang;
		prev?: DocMeta;
		next?: DocMeta;
	}
	let { lang, prev, next }: Props = $props();
	const d = $derived(t(lang));

	const link =
		'group flex flex-col gap-0.5 rounded-lg border border-ink-200 px-4 py-3 transition-colors hover:border-ink-300 hover:bg-ink-50 dark:border-ink-800 dark:hover:border-ink-700 dark:hover:bg-ink-900';
</script>

{#if prev || next}
	<nav aria-label="{d.docs.prev} / {d.docs.next}" class="grid gap-3 sm:grid-cols-2">
		{#if prev}
			<a href={docHref(lang, prev.slug)} rel="prev" class={link}>
				<span class="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
					<ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
					{d.docs.prev}
				</span>
				<span class="font-medium text-ink-900 dark:text-white">{prev.title}</span>
			</a>
		{:else}
			<span class="hidden sm:block"></span>
		{/if}
		{#if next}
			<a href={docHref(lang, next.slug)} rel="next" class="{link} items-end text-right">
				<span class="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
					{d.docs.next}
					<ArrowRight class="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
				</span>
				<span class="font-medium text-ink-900 dark:text-white">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
