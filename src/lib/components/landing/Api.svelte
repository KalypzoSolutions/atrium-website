<script lang="ts">
	import { ArrowRight, Check } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { landing, API_SAMPLE } from '$lib/content/landing';
	import SectionHeading from './SectionHeading.svelte';
	import CodePanel from './CodePanel.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
</script>

<section id="api" aria-labelledby="api-title" class="section">
	<div class="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
		<div>
			<SectionHeading id="api-title" eyebrow={c.api.eyebrow} title={c.api.title} lead={c.api.lead} />
			<ul class="mt-8 space-y-4">
				{#each c.api.points as p (p.title)}
					<li class="flex gap-3 text-sm">
						<Check class="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
						<p class="leading-relaxed text-ink-500 dark:text-ink-400">
							<span class="font-medium text-ink-900 dark:text-white">{p.title}.</span>
							{p.text}
						</p>
					</li>
				{/each}
			</ul>
			<a href="/{lang}/docs/api" class="link-arrow mt-8">
				{c.api.cta}
				<ArrowRight class="size-4" aria-hidden="true" />
			</a>
		</div>
		<div class="min-w-0">
			<CodePanel title="terminal" code={API_SAMPLE} label={c.api.codeLabel} />
		</div>
	</div>
</section>
