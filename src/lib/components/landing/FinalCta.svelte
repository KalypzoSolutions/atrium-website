<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { GITHUB_URL, type Lang } from '$lib/config';
	import { landing } from '$lib/content/landing';
	import GithubIcon from '$lib/components/GithubIcon.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
</script>

<section aria-labelledby="cta-title" class="pb-20 sm:pb-28">
	<div class="container-x">
		<div class="rounded-xl bg-ink-50 px-6 py-14 text-center sm:px-12 sm:py-16 dark:bg-ink-900">
			<h2 id="cta-title" class="heading-section">{c.cta.title}</h2>
			<p class="lead mx-auto mt-3 max-w-xl">{c.cta.lead}</p>
			<div class="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
				<a href="/{lang}/docs/quickstart" class="btn-primary group px-5 py-2.5">
					{c.cta.primary}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
				</a>
				<a href={GITHUB_URL} rel="noopener" class="btn-ghost bg-white px-5 py-2.5 dark:bg-ink-950">
					<GithubIcon class="size-4" />
					{c.cta.secondary}
				</a>
			</div>
		</div>
	</div>
</section>
