<script lang="ts">
	import { page } from '$app/state';
	import { Menu, X, Languages } from '@lucide/svelte';
	import { GITHUB_URL, GUIDE_SLUG, MARKET_SLUG, type Lang } from '$lib/config';
	import { t, otherLang, switchLangPath } from '$lib/i18n';
	import Logo from './Logo.svelte';
	import GithubIcon from './GithubIcon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import SearchButton from './search/SearchButton.svelte';
	import { detectMac, openSearch, platform, searchUi } from './search/state.svelte';
	import type { Component } from 'svelte';

	/** `wide`: breiteres Raster passend zur Doku; ohne Angabe automatisch auf Doku-Seiten. */
	let { lang, wide }: { lang: Lang; wide?: boolean } = $props();
	const d = $derived(t(lang));
	let open = $state(false);
	const isWide = $derived(wide ?? page.route.id?.startsWith('/[lang=lang]/docs') ?? false);
	const container = $derived(isWide ? 'mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:px-8' : 'container-x');

	// Suche: Dialog-Code erst beim ersten Öffnen laden.
	let SearchDialog = $state<Component<{ lang: Lang }> | null>(null);
	$effect(() => {
		if (searchUi.open && !SearchDialog) {
			import('./search/SearchDialog.svelte').then((m) => (SearchDialog = m.default));
		}
	});
	$effect(() => {
		platform.mac = detectMac();
	});
	const isTyping = (el: EventTarget | null) =>
		el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
	function onKeydown(e: KeyboardEvent) {
		if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
			e.preventDefault();
			searchUi.open = !searchUi.open;
		} else if (e.key === '/' && !searchUi.open && !isTyping(e.target) && !e.metaKey && !e.ctrlKey) {
			e.preventDefault();
			openSearch();
		}
	}

	const links: { href: string; label: string; xl?: boolean }[] = $derived([
		{ href: `/${lang}#features`, label: d.nav.features },
		{ href: `/${lang}#modules`, label: d.nav.modules },
		{ href: `/${lang}/${MARKET_SLUG[lang]}`, label: d.nav.marketplace },
		// Auf lg ist die Leiste knapp – der Schnellstart erscheint dort erst ab xl (im Menü und Footer immer).
		{ href: `/${lang}/docs/quickstart`, label: d.nav.quickstart, xl: true },
		{ href: `/${lang}/docs`, label: d.nav.docs },
		{ href: `/${lang}/${GUIDE_SLUG[lang]}`, label: d.nav.guide }
	]);
	const isActive = (href: string) => !href.includes('#') && page.url.pathname === href;
	const alt = $derived(otherLang(lang));
	const altHref = $derived(switchLangPath(page.url.pathname, alt));

	$effect(() => {
		void page.url.pathname;
		open = false;
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#if SearchDialog}<SearchDialog {lang} />{/if}

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg dark:focus:bg-ink-900"
	>{d.nav.skip}</a
>

<header
	class="sticky top-0 z-50 border-b border-ink-200/70 bg-white/75 backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/70"
>
	<nav class="{container} flex h-16 items-center gap-6" aria-label="Main">
		<a href="/{lang}" class="flex shrink-0 items-center gap-2.5 font-semibold whitespace-nowrap text-ink-900 dark:text-white">
			<Logo class="size-8" />
			<span class="text-[1.05rem] tracking-tight"
				>Kalypzo <span class="text-brand-600 dark:text-brand-400">Atrium</span></span
			>
		</a>

		<ul class="ml-4 hidden items-center gap-1 lg:flex">
			{#each links as l (l.href)}
				<li class={l.xl ? 'hidden xl:block' : undefined}>
					<a
						href={l.href}
						aria-current={isActive(l.href) ? 'page' : undefined}
						class="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 aria-[current=page]:text-brand-600 dark:text-ink-300 dark:hover:text-white dark:aria-[current=page]:text-brand-400"
						>{l.label}</a
					>
				</li>
			{/each}
		</ul>

		<div class="ml-auto flex items-center gap-1">
			<SearchButton {lang} class="mr-2 hidden xl:flex" />
			<!-- Auf Doku-Seiten hat die Leiste unter dem Header (mobil) einen eigenen Suchknopf. -->
			<SearchButton {lang} variant="icon" class={isWide ? 'hidden lg:grid xl:hidden' : 'xl:hidden'} />
			<a
				href={altHref}
				hreflang={alt}
				lang={alt}
				class="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 sm:flex dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
				aria-label={d.nav.switchTo}
				data-sveltekit-reload
			>
				<Languages class="size-4" />{alt.toUpperCase()}
			</a>
			<ThemeToggle label={d.nav.theme} />
			<a href={GITHUB_URL} class="btn-ghost ml-2 hidden !px-3.5 !py-2 sm:inline-flex" rel="noopener" target="_blank">
				<GithubIcon class="size-4" />GitHub
			</a>
			<button
				type="button"
				class="grid size-9 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden dark:text-ink-200 dark:hover:bg-ink-800"
				aria-expanded={open}
				aria-controls="mobile-nav"
				aria-label={open ? d.nav.close : d.nav.menu}
				onclick={() => (open = !open)}
			>
				{#if open}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
			</button>
		</div>
	</nav>

	{#if open}
		<div id="mobile-nav" class="border-t border-ink-200 lg:hidden dark:border-ink-800">
			<ul class="{container} flex flex-col gap-1 py-4">
				{#each links as l (l.href)}
					<li>
						<a href={l.href} class="block rounded-lg px-3 py-2.5 font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
							>{l.label}</a
						>
					</li>
				{/each}
				<li class="mt-2 flex gap-2">
					<a href={GITHUB_URL} class="btn-ghost flex-1" rel="noopener" target="_blank"
						><GithubIcon class="size-4" />GitHub</a
					>
					<a href={altHref} hreflang={alt} lang={alt} class="btn-ghost flex-1" data-sveltekit-reload
						><Languages class="size-4" />{d.nav.switchTo}</a
					>
				</li>
			</ul>
		</div>
	{/if}
</header>
