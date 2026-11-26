<script lang="ts">
	import { MARKET_SLUG, SITE_URL } from '$lib/config';
	import { marketModulePath, marketSourcePath } from '$lib/marketplace';
	import { t } from '$lib/i18n';
	import Seo from '$lib/seo/Seo.svelte';
	import MarketBreadcrumb from '$lib/components/marketplace/MarketBreadcrumb.svelte';
	import MarketInstall from '$lib/components/marketplace/MarketInstall.svelte';
	let { data } = $props();
	const { lang, source, details, modules, readme } = $derived(data);
	const d = $derived(t(lang).market);
	const path = $derived(marketSourcePath(lang, source.id));
	const jsonLd = $derived([
		{ '@context': 'https://schema.org', '@type': 'SoftwareSourceCode', name: source.name, description: source.description[lang], codeRepository: source.repository, url: SITE_URL + path, author: { '@type': 'Organization', name: source.publisher.name, url: source.publisher.url }, ...(source.license ? { license: source.license } : {}) },
		{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: d.eyebrow, item: `${SITE_URL}/${lang}/${MARKET_SLUG[lang]}` }, { '@type': 'ListItem', position: 2, name: source.name, item: SITE_URL + path }] }
	]);
</script>
<Seo title={source.name} description={source.description[lang]} {path} {lang} {jsonLd} />
<div class="container-x py-12 sm:py-16">
	<MarketBreadcrumb {lang} {source} />
	<header class="mt-8 max-w-3xl">
		{#if source.official}<p class="eyebrow" title={d.card.officialHint}>{d.card.official}</p>{/if}
		<h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{source.name}</h1>
		<p class="mt-3 text-sm text-ink-500 dark:text-ink-400">{d.detail.publisher}: {#if source.publisher.url}<a class="link-arrow" href={source.publisher.url} rel="noopener">{source.publisher.name}</a>{:else}{source.publisher.name}{/if}</p>
		<p class="lead mt-5">{source.description[lang]}</p>
	</header>
	<div class="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<div class="min-w-0 space-y-12">
			<section aria-labelledby="modules-title"><h2 id="modules-title" class="text-2xl font-semibold">{d.detail.modules}</h2>
				<ul class="mt-4 divide-y divide-ink-200 dark:divide-ink-800">{#each modules as module (module.id)}<li class="py-3"><a class="link-arrow" href={marketModulePath(lang, source.id, module.id)}>{module.name[lang]}</a>{#if module.version}<span class="ml-2 text-sm text-ink-500 dark:text-ink-400">{module.version}</span>{/if}</li>{/each}</ul>
			</section>
			{#if readme}<section aria-labelledby="readme-title"><h2 id="readme-title" class="text-2xl font-semibold">{d.detail.readme}</h2><div class="prose mt-5 max-w-none dark:prose-invert">{@html readme.html}</div></section>{/if}
		</div>
		<aside class="space-y-6">
			<MarketInstall {lang} url={source.source} name={source.name} />
			<div class="card space-y-5 p-6 text-sm">
				<div><h2 class="font-semibold">{d.card.categories}</h2><p class="mt-1">{source.categories.map((category) => d.categories[category]).join(', ')}</p></div>
				<div><h2 class="font-semibold">{d.card.tags}</h2><p class="mt-1">{source.tags.join(', ')}</p></div>
				<div><h2 class="font-semibold">{d.card.license}</h2><p class="mt-1">{source.license ?? d.card.noLicense}</p></div>
				<a class="link-arrow" href={source.repository} rel="noopener">{d.card.github}</a>
				<div><h2 class="font-semibold">{d.detail.snapshot}</h2><p class="mt-1"><time datetime={details.syncedAt}>{new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(details.syncedAt))}</time> · <a class="link-arrow" href="{source.repository}/commit/{details.commit}" rel="noopener">{d.detail.commit}</a></p></div>
			</div>
		</aside>
	</div>
</div>
