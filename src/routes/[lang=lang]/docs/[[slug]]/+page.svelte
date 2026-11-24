<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import Seo from '$lib/seo/Seo.svelte';
	import { absUrl, githubFile, GITHUB_URL, SITE_NAME } from '$lib/config';
	import { OPERATOR } from '$lib/legal';
	import { t } from '$lib/i18n';
	import { docHref } from '$lib/docs';
	import DocsSidebar from '$lib/components/docs/DocsSidebar.svelte';
	import DocsMobileBar from '$lib/components/docs/DocsMobileBar.svelte';
	import Toc from '$lib/components/docs/Toc.svelte';
	import PrevNext from '$lib/components/docs/PrevNext.svelte';
	import Breadcrumb from '$lib/components/docs/Breadcrumb.svelte';
	import { codeCopy } from '$lib/components/docs/code-copy';
	import GithubIcon from '$lib/components/GithubIcon.svelte';

	let { data } = $props();

	const lang = $derived(data.lang);
	const d = $derived(t(lang));
	const meta = $derived(data.doc.meta);
	const Content = $derived(data.component);
	const path = $derived(docHref(lang, data.slug));
	const isIndex = $derived(data.slug === 'index');

	const crumbs = $derived(
		isIndex
			? [
					{ name: d.docs.home, href: `/${lang}` },
					{ name: d.docs.title, href: `/${lang}/docs` }
				]
			: [
					{ name: d.docs.home, href: `/${lang}` },
					{ name: d.docs.title, href: `/${lang}/docs` },
					{ name: meta.title, href: path }
				]
	);

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: crumbs.map((c, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: c.name,
				item: absUrl(c.href)
			}))
		},
		{
			'@context': 'https://schema.org',
			'@type': 'TechArticle',
			headline: meta.title,
			description: meta.description,
			inLanguage: lang,
			url: absUrl(path),
			mainEntityOfPage: absUrl(path),
			articleSection: meta.section,
			isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absUrl(`/${lang}`) },
			about: { '@type': 'SoftwareApplication', name: SITE_NAME, applicationCategory: 'BusinessApplication', url: GITHUB_URL },
			author: { '@type': 'Person', name: OPERATOR.name },
			publisher: { '@type': 'Person', name: OPERATOR.name }
		}
	]);

	// TOC-Disclosure (unterhalb von xl) nach Navigation schließen.
	let tocOpen = $state(false);
	$effect(() => {
		void data.slug;
		tocOpen = false;
	});
</script>

<Seo title={meta.title} description={meta.description} {path} {lang} type="article" {jsonLd} />

<div class="mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:px-8">
	<div
		class={[
			'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10',
			!isIndex && 'xl:grid-cols-[16rem_minmax(0,1fr)_13.5rem] xl:gap-12 2xl:grid-cols-[17rem_minmax(0,1fr)_15rem]'
		]}
	>
		<aside class="hidden border-r border-ink-200/80 lg:block dark:border-ink-800/80">
			<DocsSidebar {lang} current={data.slug} />
		</aside>

		<div class="min-w-0">
			<DocsMobileBar {lang} current={data.slug} />

			<div class="pt-6 pb-16 lg:pt-8 lg:pb-20">
				<Breadcrumb items={crumbs} label={d.docs.title} />

				<header class="mt-4 mb-8 max-w-[48rem]">
					<h1 class="text-3xl font-semibold tracking-tight sm:text-[2.25rem] sm:leading-tight">{meta.title}</h1>
					{#if meta.description}
						<p class="mt-3 text-lg leading-relaxed text-ink-600 dark:text-ink-400">{meta.description}</p>
					{/if}
					{#if meta.source}
						<p class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 dark:text-ink-400">
							{#if meta.section && !isIndex}<span
									class="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600 dark:bg-ink-800 dark:text-ink-300"
									>{meta.section}</span
								>{/if}
							<a
								href={githubFile(meta.source)}
								rel="noopener"
								target="_blank"
								class="inline-flex items-center gap-1.5 hover:text-ink-900 dark:hover:text-white"
							>
								<GithubIcon class="size-3.5" />
								{d.docs.editOnGithub}
							</a>
						</p>
					{/if}
				</header>

				{#if data.doc.toc.length > 0 && !isIndex}
					<details
						bind:open={tocOpen}
						class="group mb-8 max-w-[48rem] rounded-lg border border-ink-200 xl:hidden dark:border-ink-800"
					>
						<summary
							class="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden"
						>
							{d.docs.onThisPage}
							<ChevronDown class="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
						</summary>
						<div class="border-t border-ink-200 px-4 py-3 dark:border-ink-800">
							<Toc items={data.doc.toc} title={d.docs.onThisPage} compact />
						</div>
					</details>
				{/if}

				<article
					class="docs-article prose-atrium [&_table]:block [&_table]:overflow-x-auto [&_table]:whitespace-normal"
					{@attach codeCopy({ copy: d.common.copy, copied: d.common.copied })}
				>
					<Content />
				</article>

				<footer class="mt-14 border-t border-ink-200 pt-8 dark:border-ink-800">
					<PrevNext {lang} prev={data.prev} next={data.next} />
				</footer>
			</div>
		</div>

		{#if !isIndex}
			<aside class="hidden xl:block">
				<div class="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto pt-8 pb-10 [scrollbar-width:thin]">
					<Toc items={data.doc.toc} title={d.docs.onThisPage} />
				</div>
			</aside>
		{/if}
	</div>
</div>

<style>
	/* Ruhigere Prosa für die Doku (ergänzt .prose-atrium aus app.css) */
	.docs-article {
		font-size: 1rem;
		line-height: 1.75;
	}
	.docs-article :global(> h2) {
		margin-top: 2.75em;
		margin-bottom: 0.75em;
		font-size: 1.375rem;
		letter-spacing: -0.01em;
	}
	.docs-article :global(> h3) {
		margin-top: 2em;
		margin-bottom: 0.5em;
		font-size: 1.0625rem;
	}
	/* Angenehme Zeilenlänge für Fließtext; Tabellen, Code und Screenshots nutzen die volle Breite. */
	.docs-article > :global(:is(p, ul, ol, h2, h3, h4, blockquote, dl, hr)) {
		max-width: 48rem;
	}
	.docs-article :global(> :first-child) {
		margin-top: 0;
	}
	.docs-article :global(blockquote) {
		margin: 1.5em 0;
		padding: 0.25em 1em;
		border-left: 2px solid var(--color-brand-300);
		border-radius: 0 0.375rem 0.375rem 0;
		background: color-mix(in oklch, var(--color-brand-50) 55%, transparent);
		color: var(--color-ink-700);
		font-style: normal;
		font-weight: 400;
	}
	.docs-article :global(blockquote p) {
		margin: 0.6em 0;
	}
	:global(.dark) .docs-article :global(blockquote) {
		border-left-color: var(--color-brand-700);
		background: color-mix(in oklch, var(--color-brand-900) 18%, transparent);
		color: var(--color-ink-300);
	}
	.docs-article :global(table) {
		width: max-content;
		max-width: 100%;
		margin: 1.5em 0;
		border: 1px solid var(--color-ink-200);
		border-radius: 0.5rem;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.875rem;
	}
	.docs-article :global(thead) {
		background: var(--color-ink-50);
	}
	.docs-article :global(th),
	.docs-article :global(td) {
		padding: 0.55em 0.85em;
		vertical-align: top;
	}
	.docs-article :global(thead th) {
		border-bottom: 1px solid var(--color-ink-200);
		font-weight: 600;
	}
	.docs-article :global(tbody td) {
		border-bottom: 1px solid var(--color-ink-100);
	}
	.docs-article :global(tbody tr:last-child td) {
		border-bottom: 0;
	}
	:global(.dark) .docs-article :global(table) {
		border-color: var(--color-ink-800);
	}
	:global(.dark) .docs-article :global(thead) {
		background: var(--color-ink-900);
	}
	:global(.dark) .docs-article :global(thead th) {
		border-bottom-color: var(--color-ink-800);
	}
	:global(.dark) .docs-article :global(tbody td) {
		border-bottom-color: color-mix(in oklch, var(--color-ink-800) 70%, transparent);
	}
	.docs-article :global(li > p) {
		margin: 0.25em 0;
	}
</style>
