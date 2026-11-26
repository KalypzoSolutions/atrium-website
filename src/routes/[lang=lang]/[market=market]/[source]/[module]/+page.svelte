<script lang="ts">
	import { MARKET_SLUG, SITE_URL } from '$lib/config';
	import { marketModulePath, marketSourcePath } from '$lib/marketplace';
	import { t } from '$lib/i18n';
	import Seo from '$lib/seo/Seo.svelte';
	import MarketBreadcrumb from '$lib/components/marketplace/MarketBreadcrumb.svelte';
	import MarketInstall from '$lib/components/marketplace/MarketInstall.svelte';
	let { data } = $props();
	const { lang, source, module, details, readme, install, dependencies, optionalDependencies } = $derived(data);
	const d = $derived(t(lang).market);
	const name = $derived(module.name[lang]);
	const path = $derived(marketModulePath(lang, source.id, module.id));
	const jsonLd = $derived([
		{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name, description: module.description[lang], softwareVersion: details.version, applicationCategory: 'BusinessApplication', url: SITE_URL + path },
		{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: d.eyebrow, item: `${SITE_URL}/${lang}/${MARKET_SLUG[lang]}` }, { '@type': 'ListItem', position: 2, name: source.name, item: SITE_URL + marketSourcePath(lang, source.id) }, { '@type': 'ListItem', position: 3, name, item: SITE_URL + path }] }
	]);
</script>
<Seo title={name} description={module.description[lang]} {path} {lang} {jsonLd} />
<div class="container-x py-12 sm:py-16">
	<MarketBreadcrumb {lang} {source} module={name} />
	<header class="mt-8 max-w-3xl"><p class="eyebrow">{d.moduleCard.fromSource} {source.name}</p><h1 class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{name}</h1><p class="lead mt-5">{module.description[lang]}</p><p class="mt-4 text-sm text-ink-500 dark:text-ink-400">{d.detail.version}: {details.version} · {d.detail.core}: {details.core}</p></header>
	<div class="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
		<div class="min-w-0 space-y-12">
			{#if details.images.length}<section aria-labelledby="gallery-title"><h2 id="gallery-title" class="text-2xl font-semibold">{d.detail.gallery}</h2><ul class="mt-5 grid gap-4 sm:grid-cols-2">{#each details.images as image, i (image.url)}<li><a href={image.url} target="_blank" rel="noopener"><img src={image.url} alt={d.detail.imageAlt(name, i + 1)} loading="lazy" class="w-full rounded-lg border border-ink-200 dark:border-ink-800" /></a></li>{/each}</ul></section>{/if}
			<section aria-labelledby="readme-title"><h2 id="readme-title" class="text-2xl font-semibold">{d.detail.readme}</h2>{#if readme}<div class="prose mt-5 max-w-none dark:prose-invert">{@html readme.html}</div>{:else}<p class="mt-4 text-ink-600 dark:text-ink-400">{d.detail.readmeFallback}</p>{/if}</section>
			<section aria-labelledby="versions-title"><h2 id="versions-title" class="text-2xl font-semibold">{d.detail.versions}</h2>{#if details.versions.length}<ul class="mt-4 divide-y divide-ink-200 dark:divide-ink-800">{#each details.versions as version (version.url)}<li class="flex flex-wrap gap-x-4 gap-y-1 py-3 text-sm"><strong>{version.version}</strong><time datetime={version.date}>{new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(version.date))}</time><a class="link-arrow" href={version.url} rel="noopener">{d.detail.commit}</a></li>{/each}</ul>{:else}<p class="mt-3">{d.detail.none}</p>{/if}</section>
		</div>
		<aside class="space-y-6"><MarketInstall {lang} url={install} {name} module />
			<div class="card space-y-6 p-6 text-sm"><a class="link-arrow" href={install} rel="noopener">{d.detail.githubFolder}</a>
				{#each [{ title: d.detail.dependencies, items: dependencies }, { title: d.detail.optionalDependencies, items: optionalDependencies }] as group (group.title)}<section><h2 class="font-semibold">{group.title}</h2>{#if group.items.length}<ul class="mt-2 space-y-1">{#each group.items as dep (dep.id)}<li>{#if dep.match}<a class="link-arrow" href={marketModulePath(lang, dep.match.source.id, dep.match.module.id)}>{dep.match.module.name[lang]}</a>{:else}{dep.id}{/if} <span class="text-ink-500 dark:text-ink-400">{dep.version}</span></li>{/each}</ul>{:else}<p class="mt-2">{d.detail.none}</p>{/if}</section>{/each}
				<section><h2 class="font-semibold">{d.detail.permissions}</h2>{#if details.permissions.length}<ul class="mt-2 space-y-1 break-all font-mono text-xs">{#each details.permissions as permission (permission)}<li>{permission}</li>{/each}</ul>{:else}<p class="mt-2">{d.detail.none}</p>{/if}</section>
			</div><a class="link-arrow" href={marketSourcePath(lang, source.id)}>{d.detail.back}</a>
		</aside>
	</div>
</div>
