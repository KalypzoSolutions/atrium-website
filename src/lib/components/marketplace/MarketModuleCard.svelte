<script lang="ts">
	import { ArrowRight, BadgeCheck, Check, Copy, Package } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { marketModulePath, type MarketModuleEntry } from '$lib/marketplace';
	import { getModuleDetails } from '$lib/marketplace-details';
	import { t } from '$lib/i18n';
	import GithubIcon from '$lib/components/GithubIcon.svelte';
	import { LinkCopy } from './copy.svelte';

	let {
		entry,
		lang,
		onShowSource
	}: {
		entry: MarketModuleEntry;
		lang: Lang;
		/** Wechselt zur Paketansicht und springt zur Karte der Quelle. */
		onShowSource: (id: string) => void;
	} = $props();
	const d = $derived(t(lang).market);
	const m = $derived(entry.module);
	const s = $derived(entry.source);
	const name = $derived(m.name[lang]);
	const titleId = $derived(`module-${entry.key}-title`);
	const page = $derived(marketModulePath(lang, s.id, m.id));
	// Version aus dem synchronisierten Snapshot (fehlt, solange kein Snapshot vorliegt).
	const version = $derived(getModuleDetails(s.id, m.id)?.version);

	// Kopierstatus: kurzes visuelles Feedback plus Meldung für Screenreader.
	const copier = new LinkCopy();
	let sourceField = $state<HTMLInputElement>();
	const copy = () =>
		copier.copy(entry.install, sourceField, d.moduleCard.copiedMsg(name), d.card.copyFailed);

	$effect(() => () => copier.destroy());

	function showSource(e: MouseEvent) {
		// Mit gedrückter Taste (neuer Tab o. Ä.) dem Browser überlassen.
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
		e.preventDefault();
		onShowSource(s.id);
	}

	const label = 'text-xs font-medium text-ink-500 dark:text-ink-400';
</script>

<article id="module-{entry.key}" aria-labelledby={titleId} class="card flex w-full flex-col p-6">
	<header>
		<div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
			<h3 id={titleId} class="text-lg font-semibold tracking-tight">
				<a href={page} class="hover:text-brand-600 dark:hover:text-brand-400">{name}</a>
				{#if version}
					<span class="ml-1 align-middle font-mono text-xs font-normal text-ink-500 dark:text-ink-400"
						>v{version}</span
					>
				{/if}
			</h3>
			{#if s.official}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 ring-inset dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30"
					title={d.card.officialHint}
				>
					<BadgeCheck class="size-3.5" aria-hidden="true" />{d.card.official}
					<span class="sr-only">– {d.card.officialHint}</span>
				</span>
			{/if}
		</div>
		<p class="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
			<Package class="size-3.5 shrink-0" aria-hidden="true" />
			<span>
				{d.moduleCard.fromSource}
				<a
					href="#source-{s.id}"
					onclick={showSource}
					title={d.moduleCard.showSource(s.name)}
					class="font-medium text-ink-700 hover:text-brand-600 dark:text-ink-200 dark:hover:text-brand-400"
					>{s.name}</a
				>
			</span>
		</p>
		<p class="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
			{d.card.by}
			{#if s.publisher.url}
				<a
					href={s.publisher.url}
					rel="noopener"
					target="_blank"
					class="font-medium text-ink-700 hover:text-brand-600 dark:text-ink-200 dark:hover:text-brand-400"
					>{s.publisher.name}</a
				>
			{:else}
				<span class="font-medium text-ink-700 dark:text-ink-200">{s.publisher.name}</span>
			{/if}
		</p>
	</header>

	<p class="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{m.description[lang]}</p>

	<div class="mt-4">
		<h4 class="sr-only">{d.card.categories}</h4>
		<ul class="flex flex-wrap gap-1.5">
			{#each s.categories as c (c)}
				<li
					class="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200"
				>
					{d.categories[c]}
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-auto pt-6">
		<dl class="border-t border-ink-200/80 pt-5 text-sm dark:border-ink-800">
			<div>
				<dt class={label}>{d.card.source}</dt>
				<dd class="mt-1">
					<input
						bind:this={sourceField}
						type="text"
						readonly
						value={entry.install}
						aria-label={d.moduleCard.sourceLabel(name)}
						onfocus={(e) => e.currentTarget.select()}
						class="block w-full rounded-md border-0 bg-ink-50 px-2.5 py-1.5 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-200"
					/>
				</dd>
			</div>
		</dl>

		<div class="mt-4 flex flex-wrap items-center gap-2">
			<button type="button" class="btn-primary" aria-label={d.moduleCard.copyLabel(name)} onclick={copy}>
				{#if copier.state === 'copied'}
					<Check class="size-4" aria-hidden="true" />{d.card.copied}
				{:else}
					<Copy class="size-4" aria-hidden="true" />{d.card.copy}
				{/if}
			</button>
			<a
				href={entry.install}
				rel="noopener"
				target="_blank"
				class="btn-ghost"
				aria-label={d.moduleCard.githubLabel(name)}
			>
				<GithubIcon class="size-4" />{d.card.github}
			</a>
			<a href={page} class="btn-ghost" aria-label={d.moduleCard.detailsLabel(name)}>
				{d.card.details}<ArrowRight class="size-4" aria-hidden="true" />
			</a>
		</div>
		<p class="sr-only" role="status" aria-live="polite">{copier.message}</p>
		{#if copier.state === 'failed'}
			<p class="mt-2 text-xs text-amber-700 dark:text-amber-400" aria-hidden="true">{d.card.copyFailed}</p>
		{/if}
	</div>
</article>
