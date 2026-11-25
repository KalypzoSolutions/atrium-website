<script lang="ts">
	import { BadgeCheck, Check, Copy, ExternalLink, Scale } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { githubRepoSlug, type MarketSource } from '$lib/marketplace';
	import { t } from '$lib/i18n';
	import GithubIcon from '$lib/components/GithubIcon.svelte';

	let { source: s, lang }: { source: MarketSource; lang: Lang } = $props();
	const d = $derived(t(lang).market);
	const slug = $derived(githubRepoSlug(s.repository));
	const titleId = $derived(`source-${s.id}-title`);

	// Kopierstatus: kurzes visuelles Feedback plus Meldung für Screenreader.
	let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
	let message = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		clearTimeout(timer);
		try {
			await navigator.clipboard.writeText(s.source);
			copyState = 'copied';
			message = d.card.copiedMsg(s.name);
		} catch {
			copyState = 'failed';
			message = d.card.copyFailed;
		}
		timer = setTimeout(() => {
			copyState = 'idle';
			message = '';
		}, 2500);
	}

	$effect(() => () => clearTimeout(timer));

	const label = 'text-xs font-medium text-ink-500 dark:text-ink-400';
</script>

<article id="source-{s.id}" aria-labelledby={titleId} class="card flex flex-col p-6">
	<header>
		<div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
			<h3 id={titleId} class="text-lg font-semibold tracking-tight">{s.name}</h3>
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
		<p class="mt-1 text-sm text-ink-500 dark:text-ink-400">
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

	<p class="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{s.description[lang]}</p>

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
		{#if s.tags.length}
			<h4 class="sr-only">{d.card.tags}</h4>
			<ul class="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-xs text-ink-500 dark:text-ink-400">
				{#each s.tags as tag (tag)}
					<li><span aria-hidden="true">#</span>{tag}</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="mt-5">
		<h4 class={label}>{d.card.modules(s.modules.length)}</h4>
		<ul class="mt-2 flex flex-wrap gap-1.5">
			{#each s.modules as m (m.id)}
				<li
					class="rounded-md border border-ink-200 px-2 py-0.5 text-xs text-ink-700 dark:border-ink-700 dark:text-ink-200"
				>
					{m.name[lang]}
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-auto pt-6">
		<dl class="space-y-3 border-t border-ink-200/80 pt-5 text-sm dark:border-ink-800">
			<div class="flex items-center gap-2 text-ink-600 dark:text-ink-300">
				<dt><Scale class="size-4 text-ink-400" aria-hidden="true" /><span class="sr-only">{d.card.license}</span></dt>
				<dd>{s.license ?? d.card.noLicense}</dd>
			</div>
			<div>
				<dt class={label}>{d.card.source}</dt>
				<dd class="mt-1">
					<code
						class="block overflow-x-auto rounded-md bg-ink-50 px-2.5 py-1.5 font-mono text-xs whitespace-nowrap text-ink-700 select-all [scrollbar-width:thin] dark:bg-ink-900 dark:text-ink-200"
						>{s.source}</code
					>
				</dd>
			</div>
		</dl>

		<div class="mt-4 flex flex-wrap items-center gap-2">
			<button type="button" class="btn-primary" aria-label={d.card.copyLabel(s.name)} onclick={copy}>
				{#if copyState === 'copied'}
					<Check class="size-4" aria-hidden="true" />{d.card.copied}
				{:else}
					<Copy class="size-4" aria-hidden="true" />{d.card.copy}
				{/if}
			</button>
			<a
				href={s.repository}
				rel="noopener"
				target="_blank"
				class="btn-ghost"
				aria-label={d.card.githubLabel(s.name)}
				title={slug}
			>
				<GithubIcon class="size-4" />{d.card.github}
			</a>
			{#if s.homepage}
				<a href={s.homepage} rel="noopener" target="_blank" class="link-arrow ml-1">
					{d.card.homepage}
					<ExternalLink class="size-3.5" aria-hidden="true" />
				</a>
			{/if}
		</div>
		<p class="sr-only" role="status" aria-live="polite">{message}</p>
		{#if copyState === 'failed'}
			<p class="mt-2 text-xs text-amber-700 dark:text-amber-400" aria-hidden="true">{d.card.copyFailed}</p>
		{/if}
	</div>
</article>
