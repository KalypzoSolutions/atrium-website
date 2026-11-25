<script lang="ts">
	import { ArrowRight, Braces, GitPullRequest, SearchX, TriangleAlert } from '@lucide/svelte';
	import { MARKET_SLUG, SITE_NAME, SITE_URL } from '$lib/config';
	import { MARKET_CATEGORIES, MARKET_REGISTRY_PATH, sortedSources, type MarketCategory } from '$lib/marketplace';
	import { t } from '$lib/i18n';
	import Seo from '$lib/seo/Seo.svelte';
	import MarketCard from '$lib/components/marketplace/MarketCard.svelte';
	import MarketFilters from '$lib/components/marketplace/MarketFilters.svelte';
	import { filterSources } from '$lib/components/marketplace/filter';

	/** Repository der Website – neue Quellen kommen per Pull Request in src/lib/marketplace.ts. */
	const WEBSITE_REPO = 'https://github.com/KalypzoSolutions/atrium-website';

	/** Anker des Abschnitts „Eigenes Modul eintragen“ in der Marktplatz-Doku. */
	const SUBMIT_ANCHOR = { de: 'eigenes-modul-eintragen', en: 'listing-your-own-module' } as const;

	let { data } = $props();
	const lang = $derived(data.lang);
	const d = $derived(t(lang).market);
	const path = $derived(`/${lang}/${MARKET_SLUG[lang]}`);

	const sources = sortedSources();
	const moduleCount = sources.reduce((n, s) => n + s.modules.length, 0);
	/** Nur Kategorien anbieten, die mindestens eine Quelle hat. */
	const categories = MARKET_CATEGORIES.map((id) => ({
		id,
		count: sources.filter((s) => s.categories.includes(id)).length
	})).filter((c) => c.count > 0);

	// Filter: Progressive Enhancement – ohne JS bleiben alle Karten sichtbar und die Filter ausgeblendet.
	let ready = $state(false);
	$effect(() => {
		ready = true;
	});
	let query = $state('');
	let selected = $state<MarketCategory[]>([]);
	let official = $state(false);
	const filtered = $derived(filterSources(sources, { query, categories: selected, official }, lang, d.categories));

	function resetFilters() {
		query = '';
		selected = [];
		official = false;
	}

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: d.meta.title,
			description: d.meta.description,
			inLanguage: lang,
			url: SITE_URL + path,
			mainEntity: {
				'@type': 'ItemList',
				numberOfItems: sources.length,
				itemListElement: sources.map((s, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					item: {
						'@type': 'SoftwareSourceCode',
						name: s.name,
						description: s.description[lang],
						codeRepository: s.repository,
						url: `${SITE_URL}${path}#source-${s.id}`,
						author: { '@type': 'Organization', name: s.publisher.name, url: s.publisher.url },
						...(s.license ? { license: s.license } : {})
					}
				}))
			}
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/${lang}` },
				{ '@type': 'ListItem', position: 2, name: d.eyebrow, item: SITE_URL + path }
			]
		}
	]);

	const step =
		'inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-ink-200 font-mono text-[11px] font-medium text-ink-500 tabular-nums dark:border-ink-700 dark:text-ink-400';
</script>

<Seo title={d.meta.title} description={d.meta.description} {path} {lang} {jsonLd} />

<section aria-labelledby="market-title" class="relative isolate">
	<div class="hero-tint pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" aria-hidden="true"></div>
	<div class="container-x pt-16 pb-12 sm:pt-24 sm:pb-16">
		<div class="max-w-3xl">
			<p class="eyebrow">{d.eyebrow}</p>
			<h1 id="market-title" class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{d.title}</h1>
			<p class="lead mt-5 max-w-2xl">{d.lead}</p>
			<p class="mt-4 text-sm font-medium text-ink-500 tabular-nums dark:text-ink-400">
				{d.stats(sources.length, moduleCount)}
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a href="#sources" class="btn-primary">
					{d.listTitle}
					<ArrowRight class="size-4" aria-hidden="true" />
				</a>
				<a href="#install" class="btn-ghost">{d.install.title}</a>
			</div>
			<div
				class="mt-8 flex max-w-2xl items-start gap-3 rounded-lg border border-ink-200/80 bg-white/60 px-4 py-3 text-sm dark:border-ink-800 dark:bg-ink-900/40"
			>
				<Braces class="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden="true" />
				<div class="min-w-0">
					<a href={MARKET_REGISTRY_PATH} class="link-arrow" type="application/json">{d.registry}</a>
					<p class="mt-0.5 text-ink-500 dark:text-ink-400">{d.registryHint}</p>
					<code class="mt-1.5 block truncate font-mono text-xs text-ink-600 select-all dark:text-ink-300"
						>{SITE_URL + MARKET_REGISTRY_PATH}</code
					>
				</div>
			</div>
		</div>
	</div>
</section>

<section id="sources" aria-labelledby="sources-title" class="container-x">
	<h2 id="sources-title" class="sr-only">{d.listTitle}</h2>

	{#if ready}
		<div class="mb-8">
			<MarketFilters
				{lang}
				bind:query
				bind:selected
				bind:official
				{categories}
				results={filtered.length}
				total={sources.length}
			/>
		</div>
	{/if}

	{#if filtered.length}
		<ul class="grid gap-6 md:grid-cols-2">
			{#each filtered as s (s.id)}
				<li class="flex"><MarketCard source={s} {lang} /></li>
			{/each}
		</ul>
	{:else}
		<div
			class="rounded-xl border border-dashed border-ink-300 px-6 py-14 text-center dark:border-ink-700"
			role="status"
		>
			<SearchX class="mx-auto size-8 text-ink-400 dark:text-ink-500" aria-hidden="true" />
			<h3 class="mt-4 text-base font-semibold">{d.empty.title}</h3>
			<p class="mt-1 text-sm text-ink-500 dark:text-ink-400">{d.empty.text}</p>
			<button type="button" class="btn-ghost mt-6" onclick={resetFilters}>{d.filters.reset}</button>
		</div>
	{/if}
</section>

<section id="install" aria-labelledby="install-title" class="container-x pt-20 sm:pt-24">
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<div class="rounded-xl bg-ink-50 px-6 py-8 sm:px-10 sm:py-10 dark:bg-ink-900">
			<p class="eyebrow">{d.install.eyebrow}</p>
			<h2 id="install-title" class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{d.install.title}</h2>
			<p class="mt-3 text-ink-600 dark:text-ink-400">{d.install.lead}</p>
			<ol class="mt-8 space-y-5">
				{#each d.install.steps as s, i (s.title)}
					<li class="flex gap-3.5">
						<span class={step} aria-hidden="true">{i + 1}</span>
						<div>
							<h3 class="text-sm font-medium leading-6">{s.title}</h3>
							<p class="mt-0.5 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{s.text}</p>
						</div>
					</li>
				{/each}
			</ol>
			<div class="mt-8 flex flex-wrap gap-x-6 gap-y-2">
				<a href="/{lang}/docs/module-management" class="link-arrow">
					{d.install.docsManagement}
					<ArrowRight class="size-4" aria-hidden="true" />
				</a>
				<a href="/{lang}/docs/marketplace" class="link-arrow">
					{d.install.docsMarket}
					<ArrowRight class="size-4" aria-hidden="true" />
				</a>
			</div>
		</div>

		<div class="flex flex-col gap-6">
			<aside
				aria-labelledby="security-title"
				class="rounded-xl border-l-2 border-amber-400/80 bg-amber-50/50 px-6 py-6 dark:border-amber-500/50 dark:bg-amber-500/5"
			>
				<h2 id="security-title" class="flex items-center gap-2 text-base font-semibold">
					<TriangleAlert class="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
					{d.security.title}
				</h2>
				<p class="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{d.security.text}</p>
			</aside>

			<div class="card flex flex-1 flex-col px-6 py-6">
				<h2 class="flex items-center gap-2 text-base font-semibold">
					<GitPullRequest class="size-4 text-brand-500 dark:text-brand-400" aria-hidden="true" />
					{d.submit.title}
				</h2>
				<p class="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{d.submit.text}</p>
				<div class="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-5">
					<a href={WEBSITE_REPO} rel="noopener" target="_blank" class="btn-primary">
						{d.submit.cta}
						<ArrowRight class="size-4" aria-hidden="true" />
					</a>
					<a href="/{lang}/docs/marketplace#{SUBMIT_ANCHOR[lang]}" class="link-arrow">{d.submit.docs}</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-tint {
		background: radial-gradient(
			40rem 20rem at 20% -6rem,
			color-mix(in oklch, var(--color-brand-400) 12%, transparent),
			transparent 70%
		);
	}
</style>
