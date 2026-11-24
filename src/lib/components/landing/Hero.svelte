<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { GITHUB_URL, type Lang } from '$lib/config';
	import { shot } from '$lib/screenshots';
	import { landing } from '$lib/content/landing';
	import GithubIcon from '$lib/components/GithubIcon.svelte';
	import Screenshot from '$lib/components/Screenshot.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
	const dashboard = $derived(shot(lang, 'dashboard'));
</script>

<section aria-labelledby="hero-title" class="relative isolate">
	<div class="hero-tint pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" aria-hidden="true"></div>

	<div class="container-x pt-20 pb-16 sm:pt-28 sm:pb-24">
		<div class="rise mx-auto flex max-w-3xl flex-col items-center text-center">
			<p
				class="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 dark:border-ink-800 dark:text-ink-400"
			>
				{c.hero.badge}
			</p>

			<h1 id="hero-title" class="mt-6 text-[2rem]/[1.1] font-semibold tracking-tight sm:text-6xl/[1.05]">
				{c.hero.titleA}
				<span class="block text-ink-400 dark:text-ink-500">{c.hero.titleB}</span>
			</h1>

			<p class="lead mt-6 max-w-xl max-sm:text-base">{c.hero.lead}</p>

			<div class="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
				<a href="/{lang}/docs/quickstart" class="btn-primary group px-5 py-2.5">
					{c.hero.ctaPrimary}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
				</a>
				<a href={GITHUB_URL} class="btn-ghost px-5 py-2.5" rel="noopener">
					<GithubIcon class="size-4" />
					{c.hero.ctaSecondary}
				</a>
			</div>
		</div>

		<div class="mx-auto mt-16 max-w-5xl sm:mt-20">
			<Screenshot shot={dashboard} alt={c.hero.shotAlt} eager {lang} url="atrium.example.org" frame="minimal" crop="16/6.6" />
		</div>
	</div>
</section>

<style>
	.hero-tint {
		background: radial-gradient(42rem 22rem at 50% -6rem, color-mix(in oklch, var(--color-brand-400) 14%, transparent), transparent 70%);
	}
	.rise {
		animation: rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rise {
			animation: none;
		}
	}
</style>
