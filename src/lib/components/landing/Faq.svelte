<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { landing } from '$lib/content/landing';
	import SectionHeading from './SectionHeading.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));
</script>

<section id="faq" aria-labelledby="faq-title" class="section">
	<div class="container-narrow">
		<SectionHeading id="faq-title" eyebrow={c.faq.eyebrow} title={c.faq.title} />
		<div class="mt-10 border-t border-ink-200/80 dark:border-ink-800">
			{#each c.faq.items as item (item.q)}
				<details class="group border-b border-ink-200/80 dark:border-ink-800">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink-900 marker:hidden dark:text-white [&::-webkit-details-marker]:hidden"
					>
						<span>{item.q}</span>
						<Plus
							class="size-4 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-45 dark:text-ink-500"
							aria-hidden="true"
						/>
					</summary>
					<p class="-mt-1 pb-5 pr-8 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{item.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>
