<script lang="ts">
	import { BadgeCheck, Search, X } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import type { MarketCategory } from '$lib/marketplace';
	import { t } from '$lib/i18n';

	interface Props {
		lang: Lang;
		query: string;
		selected: MarketCategory[];
		official: boolean;
		/** Kategorien, die mindestens eine Quelle hat, mit Anzahl. */
		categories: { id: MarketCategory; count: number }[];
		results: number;
		total: number;
	}

	let {
		lang,
		query = $bindable(),
		selected = $bindable(),
		official = $bindable(),
		categories,
		results,
		total
	}: Props = $props();
	const d = $derived(t(lang).market);
	const active = $derived(query.trim() !== '' || selected.length > 0 || official);

	function toggle(c: MarketCategory) {
		selected = selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c];
	}
	function reset() {
		query = '';
		selected = [];
		official = false;
	}

	const chip = (on: boolean) =>
		'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ' +
		(on
			? 'border-ink-900 bg-ink-900 text-white dark:border-white dark:bg-white dark:text-ink-900'
			: 'border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900 dark:border-ink-800 dark:text-ink-300 dark:hover:border-ink-700 dark:hover:text-white');
</script>

<div role="search" aria-label={d.filters.label} class="space-y-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<label for="market-search" class="sr-only">{d.filters.search}</label>
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400 dark:text-ink-500"
				aria-hidden="true"
			/>
			<input
				id="market-search"
				type="search"
				bind:value={query}
				placeholder={d.filters.placeholder}
				autocomplete="off"
				spellcheck="false"
				class="w-full rounded-lg border border-ink-200 bg-white py-2 pr-9 pl-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-500 dark:border-ink-800 dark:bg-ink-900 dark:text-white dark:placeholder:text-ink-500 [&::-webkit-search-cancel-button]:hidden"
			/>
			{#if query}
				<button
					type="button"
					class="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
					aria-label={d.filters.clear}
					onclick={() => (query = '')}
				>
					<X class="size-4" aria-hidden="true" />
				</button>
			{/if}
		</div>
		<label
			class="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 select-none has-[:checked]:border-brand-500 has-[:checked]:text-brand-700 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500 sm:self-auto dark:border-ink-800 dark:text-ink-200 dark:has-[:checked]:border-brand-400 dark:has-[:checked]:text-brand-300"
		>
			<input type="checkbox" bind:checked={official} class="peer sr-only" />
			<span
				class="relative h-4 w-7 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-600 after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-3 dark:bg-ink-700 dark:peer-checked:bg-brand-500"
				aria-hidden="true"
			></span>
			<BadgeCheck class="size-4" aria-hidden="true" />
			{d.filters.official}
		</label>
	</div>

	<div class="flex flex-wrap items-center gap-2" role="group" aria-label={d.filters.categories}>
		<button type="button" class={chip(selected.length === 0)} aria-pressed={selected.length === 0} onclick={() => (selected = [])}>
			{d.filters.all}
		</button>
		{#each categories as c (c.id)}
			<button type="button" class={chip(selected.includes(c.id))} aria-pressed={selected.includes(c.id)} onclick={() => toggle(c.id)}>
				{d.categories[c.id]}
				<span class="text-xs tabular-nums opacity-60">{c.count}</span>
			</button>
		{/each}
	</div>

	<div class="flex min-h-6 items-center justify-between gap-4 text-sm text-ink-500 dark:text-ink-400">
		<p aria-live="polite" aria-atomic="true">{d.filters.results(results, total)}</p>
		{#if active}
			<button type="button" class="link-arrow" onclick={reset}>{d.filters.reset}</button>
		{/if}
	</div>
</div>
