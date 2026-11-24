<script lang="ts">
	import { GITHUB_URL, GUIDE_SLUG, type Lang } from '$lib/config';
	import { OPERATOR, legalHref } from '$lib/legal';
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import Logo from './Logo.svelte';
	import GithubIcon from './GithubIcon.svelte';

	let { lang }: { lang: Lang } = $props();
	const d = $derived(t(lang));
	const year = new Date().getFullYear();
	// Auf Doku-Seiten dasselbe breite Raster wie Header und Inhalt.
	const container = $derived(
		page.route.id?.startsWith('/[lang=lang]/docs') ? 'mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:px-8' : 'container-x'
	);

	type FooterLink = { href: string; label: string; ext?: boolean };
	const cols: { title: string; links: FooterLink[] }[] = $derived([
		{
			title: d.footer.product,
			links: [
				{ href: `/${lang}#features`, label: d.nav.features },
				{ href: `/${lang}#modules`, label: d.nav.modules },
				{ href: `/${lang}/${GUIDE_SLUG[lang]}`, label: d.nav.guide }
			]
		},
		{
			title: d.footer.resources,
			links: [
				{ href: `/${lang}/docs/quickstart`, label: d.nav.quickstart },
				{ href: `/${lang}/docs`, label: d.nav.docs },
				{ href: `/${lang}/docs/dokploy`, label: 'Dokploy' }
			]
		},
		{
			title: d.footer.community,
			links: [
				{ href: GITHUB_URL, label: d.footer.source, ext: true },
				{ href: `${GITHUB_URL}/issues`, label: d.footer.issues, ext: true },
				{ href: `${GITHUB_URL}/releases`, label: d.footer.releases, ext: true }
			]
		}
	]);
</script>

<footer class="mt-24 border-t border-ink-200/70 dark:border-ink-800/70">
	<div class="{container} grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
		<div>
			<a href="/{lang}" class="flex items-center gap-2.5 font-semibold text-ink-900 dark:text-white">
				<Logo class="size-8" />Kalypzo Atrium
			</a>
			<p class="mt-4 max-w-xs text-sm text-ink-600 dark:text-ink-400">{d.footer.tagline}</p>
			<a
				href={GITHUB_URL}
				class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-400"
				rel="noopener"
				target="_blank"
			>
				<GithubIcon class="size-4" />KalypzoSolutions/kalypzo-atrium
			</a>
		</div>
		{#each cols as c (c.title)}
			<div>
				<h2 class="text-sm font-semibold">{c.title}</h2>
				<ul class="mt-4 space-y-2.5 text-sm">
					{#each c.links as l (l.href)}
						<li>
							<a
								href={l.href}
								class="text-ink-600 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400"
								rel={l.ext ? 'noopener' : undefined}
								target={l.ext ? '_blank' : undefined}>{l.label}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<div class="border-t border-ink-200/70 dark:border-ink-800/70">
		<div class="{container} flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:justify-between">
			<p>© {year} {OPERATOR.name} · Kalypzo Atrium. {d.footer.rights}</p>
			<nav aria-label={d.footer.legal}>
				<ul class="flex gap-5">
					<li><a href={legalHref(lang, 'imprint')} class="hover:text-ink-900 dark:hover:text-white">{d.footer.imprint}</a></li>
					<li><a href={legalHref(lang, 'privacy')} class="hover:text-ink-900 dark:hover:text-white">{d.footer.privacy}</a></li>
				</ul>
			</nav>
		</div>
	</div>
</footer>
