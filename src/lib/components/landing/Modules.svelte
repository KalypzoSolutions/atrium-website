<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { landing, MODULE_JSON_SAMPLE } from '$lib/content/landing';
	import SectionHeading from './SectionHeading.svelte';
	import CodePanel from './CodePanel.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
</script>

<section id="modules" aria-labelledby="modules-title" class="section">
	<div class="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
		<div>
			<SectionHeading id="modules-title" eyebrow={c.modules.eyebrow} title={c.modules.title} lead={c.modules.lead} />

			<ol class="mt-8 space-y-5">
				{#each c.modules.steps as step, i (step.title)}
					<li class="flex gap-4">
						<span class="w-5 shrink-0 font-mono text-xs leading-6 text-ink-400 dark:text-ink-500" aria-hidden="true"
							>0{i + 1}</span
						>
						<div>
							<h3 class="text-sm font-medium leading-6">
								<span class="sr-only">{c.ui.step} {i + 1}: </span>{step.title}
							</h3>
							<p class="mt-0.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{step.text}</p>
						</div>
					</li>
				{/each}
			</ol>

			<a href="/{lang}/docs/modules" class="link-arrow mt-8">
				{c.modules.cta}
				<ArrowRight class="size-4" aria-hidden="true" />
			</a>
		</div>

		<div class="min-w-0">
			<CodePanel title="atrium-module.json" code={MODULE_JSON_SAMPLE} label={c.modules.codeCaption} />
			<p class="mt-3 text-sm text-ink-500 dark:text-ink-400">{c.modules.codeCaption}</p>
		</div>
	</div>
</section>
