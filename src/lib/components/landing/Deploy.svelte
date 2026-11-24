<script lang="ts">
	import { ArrowRight, BookOpen, Container, Rocket } from '@lucide/svelte';
	import { GUIDE_SLUG, type Lang } from '$lib/config';
	import { landing } from '$lib/content/landing';
	import SectionHeading from './SectionHeading.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
	const cards = $derived([
		{ ...c.deploy.compose, key: 'compose', icon: Container, href: `/${lang}/docs/installation` },
		{ ...c.deploy.dokploy, key: 'dokploy', icon: Rocket, href: `/${lang}/docs/dokploy` }
	]);
</script>

<section id="deploy" aria-labelledby="deploy-title" class="section">
	<div class="container-x">
		<SectionHeading id="deploy-title" eyebrow={c.deploy.eyebrow} title={c.deploy.title} lead={c.deploy.lead} />

		<div class="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-3">
			{#each cards as card (card.href)}
				{@const Icon = card.icon}
				<article class="card flex flex-col p-6" aria-labelledby="deploy-{card.key}">
					<Icon class="size-5 text-ink-400 dark:text-ink-500" aria-hidden="true" />
					<h3 id="deploy-{card.key}" class="mt-4 text-base font-semibold">{card.title}</h3>
					<p class="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{card.text}</p>
					<ol class="mt-5 space-y-2.5 text-sm">
						{#each card.steps as step, i (step)}
							<li class="flex gap-3">
								<span class="w-3 shrink-0 font-mono text-xs leading-5 text-ink-400 dark:text-ink-500" aria-hidden="true">{i + 1}</span>
								<span class="text-ink-700 dark:text-ink-300 {step.startsWith('docker') ? 'font-mono text-[13px]' : ''}">{step}</span>
							</li>
						{/each}
					</ol>
					<a href={card.href} class="link-arrow mt-auto pt-6">
						{card.cta}
						<ArrowRight class="size-4" aria-hidden="true" />
					</a>
				</article>
			{/each}

			<article class="card flex flex-col p-6 ring-1 ring-brand-200 dark:ring-brand-900" aria-labelledby="deploy-guide">
				<div class="flex items-center justify-between">
					<BookOpen class="size-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
					<span class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
						>{c.deploy.guide.tag}</span
					>
				</div>
				<h3 id="deploy-guide" class="mt-4 text-base font-semibold">{c.deploy.guide.title}</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{c.deploy.guide.text}</p>
				<a href="/{lang}/{GUIDE_SLUG[lang]}" class="link-arrow mt-auto pt-6">
					{c.deploy.guide.cta}
					<ArrowRight class="size-4" aria-hidden="true" />
				</a>
			</article>
		</div>
	</div>
</section>
