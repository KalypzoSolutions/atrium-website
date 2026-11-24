<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowRight, CornerDownLeft, FileText, Hash, LoaderCircle, Search, X } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { docHref, getDoc } from '$lib/docs';
	import { loadIndex, search, type Segment } from './search';
	import { searchUi } from './state.svelte';

	let { lang }: { lang: Lang } = $props();
	const d = $derived(t(lang));

	interface Option {
		id: string;
		url: string;
		title: Segment[];
		excerpt: Segment[];
		isPage: boolean;
	}

	let dialog = $state<HTMLDialogElement>();
	let input = $state<HTMLInputElement>();
	let query = $state('');
	let active = $state(0);
	let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let index = $state.raw<Awaited<ReturnType<typeof loadIndex>> | null>(null);

	function ensureIndex() {
		if (status === 'ready' || status === 'loading') return;
		status = 'loading';
		loadIndex(lang).then(
			(i) => {
				index = i;
				status = 'ready';
			},
			() => (status = 'error')
		);
	}

	const plain = (text: string): Segment[] => (text ? [{ text, hit: false }] : []);

	// Vorschläge für die leere Eingabe.
	const SUGGESTED = ['quickstart', 'dokploy', 'settings', 'module-management', 'backup-restore'];
	const suggestions = $derived<Option[]>(
		SUGGESTED.map((slug) => getDoc(lang, slug)?.meta)
			.filter((m) => m !== undefined)
			.map((m) => ({
				id: `sugg-${m.slug}`,
				url: docHref(lang, m.slug),
				title: plain(m.title),
				excerpt: plain(m.section),
				isPage: true
			}))
	);

	const trimmed = $derived(query.trim());
	const groups = $derived(index && trimmed ? search(index, trimmed) : []);
	const hitCount = $derived(groups.reduce((n, g) => n + g.hits.length, 0));
	const options = $derived<Option[]>(
		!trimmed ? suggestions : status !== 'ready' ? [] : groups.length ? groups.flatMap((g) => g.hits) : suggestions
	);
	const showSuggestions = $derived(!trimmed || (status === 'ready' && groups.length === 0));
	const activeId = $derived(options[active]?.id);

	$effect(() => {
		void trimmed;
		active = 0;
	});

	// Aktiven Eintrag beim Navigieren mit den Pfeiltasten sichtbar halten.
	$effect(() => {
		if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
	});

	// Öffnen/Schließen über den gemeinsamen Zustand.
	$effect(() => {
		if (!dialog) return;
		if (searchUi.open && !dialog.open) {
			dialog.showModal();
			document.documentElement.style.overflow = 'hidden';
			input?.focus();
			input?.select();
			ensureIndex();
		} else if (!searchUi.open && dialog.open) {
			dialog.close();
		}
	});

	function onClose() {
		searchUi.open = false;
		document.documentElement.style.overflow = '';
	}

	function close() {
		dialog?.close();
	}

	function choose(o: Option | undefined) {
		if (!o) return;
		close();
		void goto(o.url);
	}

	function onKeydown(e: KeyboardEvent) {
		const n = options.length;
		if (e.key === 'ArrowDown' && n) {
			e.preventDefault();
			active = (active + 1) % n;
		} else if (e.key === 'ArrowUp' && n) {
			e.preventDefault();
			active = (active - 1 + n) % n;
		} else if (e.key === 'Home' && n && e.ctrlKey) {
			active = 0;
		} else if (e.key === 'End' && n && e.ctrlKey) {
			active = n - 1;
		} else if (e.key === 'Enter' && !e.isComposing) {
			e.preventDefault();
			choose(options[active]);
		}
	}

	// Klick auf den abgedunkelten Hintergrund schließt.
	function onBackdrop(e: MouseEvent) {
		if (e.target === dialog) close();
	}

	// Normale Klicks schließen den Dialog; die Navigation übernimmt der SvelteKit-Router.
	function onOptionClick(e: MouseEvent) {
		if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) close();
	}
</script>

{#snippet segments(list: Segment[])}
	{#each list as s, i (i)}{#if s.hit}<mark>{s.text}</mark>{:else}{s.text}{/if}{/each}
{/snippet}

{#snippet option(o: Option, i: number)}
	<a
		id={o.id}
		href={o.url}
		role="option"
		aria-selected={i === active}
		tabindex="-1"
		onclick={onOptionClick}
		onmousemove={() => (active = i)}
		class="search-option group flex items-start gap-3 rounded-lg px-3 py-2.5 text-ink-700 aria-selected:bg-ink-100 aria-selected:text-ink-900 dark:text-ink-300 dark:aria-selected:bg-ink-800/80 dark:aria-selected:text-white"
	>
		<span
			class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-ink-200 bg-white text-ink-500 group-aria-selected:border-brand-200 group-aria-selected:text-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400 dark:group-aria-selected:border-brand-800 dark:group-aria-selected:text-brand-300"
			aria-hidden="true"
		>
			{#if o.isPage}<FileText class="size-3.5" />{:else}<Hash class="size-3.5" />{/if}
		</span>
		<span class="min-w-0 flex-1">
			<span class="block truncate text-sm font-medium">{@render segments(o.title)}</span>
			{#if o.excerpt.length}
				<span class="mt-0.5 line-clamp-2 block text-[0.8125rem] leading-snug text-ink-500 dark:text-ink-400"
					>{@render segments(o.excerpt)}</span
				>
			{/if}
		</span>
		<CornerDownLeft
			class="mt-1 size-3.5 shrink-0 text-ink-400 opacity-0 group-aria-selected:opacity-100"
			aria-hidden="true"
		/>
	</a>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={onClose}
	onclick={onBackdrop}
	aria-label={d.search.docs}
	class="search-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink-800 sm:mx-auto sm:mt-[8vh] sm:h-auto sm:max-h-[min(42rem,84vh)] sm:w-[min(42rem,calc(100%-2rem))] dark:text-ink-200"
>
	<div
		class="flex h-full max-h-[inherit] flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-ink-900/10 sm:rounded-xl dark:bg-ink-900 dark:ring-white/10"
	>
		<div class="flex items-center gap-3 border-b border-ink-200 px-4 dark:border-ink-800">
			{#if status === 'loading'}
				<LoaderCircle class="size-5 shrink-0 animate-spin text-ink-400" aria-hidden="true" />
			{:else}
				<Search class="size-5 shrink-0 text-ink-400" aria-hidden="true" />
			{/if}
			<input
				bind:this={input}
				bind:value={query}
				onkeydown={onKeydown}
				type="text"
				role="combobox"
				aria-expanded="true"
				aria-controls="search-listbox"
				aria-activedescendant={activeId}
				aria-autocomplete="list"
				aria-label={d.search.docs}
				placeholder={d.search.placeholder}
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				enterkeyhint="go"
				class="h-14 min-w-0 flex-1 bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-400 dark:text-white"
			/>
			{#if query}
				<button
					type="button"
					onclick={() => {
						query = '';
						input?.focus();
					}}
					class="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
					aria-label={d.search.clear}
				>
					<X class="size-4" aria-hidden="true" />
				</button>
			{/if}
			<button
				type="button"
				onclick={close}
				class="kbd hidden cursor-pointer !px-2 !py-1 text-ink-500 hover:text-ink-800 sm:block dark:text-ink-400 dark:hover:text-ink-100"
				aria-label={d.search.close}>Esc</button
			>
			<button
				type="button"
				onclick={close}
				class="-mr-1 rounded-md px-2 py-1 text-sm font-medium text-brand-600 sm:hidden dark:text-brand-400"
				>{d.search.close}</button
			>
		</div>

		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
			<p class="sr-only" aria-live="polite">
				{#if trimmed && status === 'ready'}{groups.length ? d.search.count(hitCount) : `${d.search.noResults} „${trimmed}“`}{/if}
			</p>

			<div id="search-listbox" role="listbox" aria-label={d.search.results}>
				{#if status === 'error' && trimmed}
					<div class="px-4 py-10 text-center text-sm text-ink-500 dark:text-ink-400">
						<p>{d.search.error}</p>
						<button type="button" class="btn-ghost mt-4" onclick={ensureIndex}>{d.search.retry}</button>
					</div>
				{:else if trimmed && status !== 'ready'}
					<p class="px-4 py-10 text-center text-sm text-ink-500 dark:text-ink-400">{d.search.loading}</p>
				{:else if trimmed && groups.length > 0}
					{@const offsets = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.hits.length, 0))}
					{#each groups as g, gi (g.url)}
						<div role="group" aria-labelledby="search-group-{gi}" class={gi > 0 ? 'mt-2' : ''}>
							<p
								id="search-group-{gi}"
								class="flex items-baseline gap-2 px-3 pt-2 pb-1 text-xs font-medium text-ink-500 dark:text-ink-400"
							>
								<span class="truncate text-ink-800 dark:text-ink-100">{g.page}</span>
								{#if g.group && g.group !== g.page}<span class="shrink-0">{g.group}</span>{/if}
							</p>
							{#each g.hits as o, hi (o.id)}
								{@render option(o, offsets[gi]! + hi)}
							{/each}
						</div>
					{/each}
				{:else}
					{#if trimmed}
						<div class="px-4 pt-8 pb-4 text-center">
							<p class="text-sm font-medium text-ink-800 dark:text-ink-100">
								{d.search.noResults} „{trimmed}“
							</p>
							<p class="mt-1 text-sm text-ink-500 dark:text-ink-400">{d.search.noResultsHint}</p>
						</div>
					{/if}
					{#if showSuggestions}
						<div role="group" aria-labelledby="search-suggestions">
							<p id="search-suggestions" class="px-3 pt-2 pb-1 text-xs font-medium text-ink-500 dark:text-ink-400">
								{d.search.suggestions}
							</p>
							{#each suggestions as o, i (o.id)}
								{@render option(o, i)}
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<footer
			class="hidden items-center gap-4 border-t border-ink-200 px-4 py-2.5 text-xs text-ink-500 sm:flex dark:border-ink-800 dark:text-ink-400"
		>
			<span class="flex items-center gap-1.5"><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd>{d.search.navigate}</span>
			<span class="flex items-center gap-1.5"><kbd class="kbd">↵</kbd>{d.search.select}</span>
			<span class="flex items-center gap-1.5"><kbd class="kbd">Esc</kbd>{d.search.close}</span>
			<a
				href={docHref(lang, 'index')}
				onclick={onOptionClick}
				class="ml-auto inline-flex items-center gap-1 hover:text-ink-800 dark:hover:text-ink-100"
				>{d.docs.title}<ArrowRight class="size-3" aria-hidden="true" /></a
			>
		</footer>
	</div>
</dialog>

<style>
	.search-dialog::backdrop {
		background: color-mix(in oklch, var(--color-ink-950) 45%, transparent);
		backdrop-filter: blur(4px);
	}
	.search-dialog[open] {
		animation: search-in 140ms ease-out;
	}
	@keyframes search-in {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.99);
		}
	}
	.search-dialog :global(mark) {
		border-radius: 0.2rem;
		background: color-mix(in oklch, var(--color-brand-200) 70%, transparent);
		color: inherit;
		padding: 0 0.05em;
	}
	:global(.dark) .search-dialog :global(mark) {
		background: color-mix(in oklch, var(--color-brand-500) 40%, transparent);
	}
</style>
