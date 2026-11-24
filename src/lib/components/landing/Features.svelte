<script lang="ts">
	import {
		ShieldCheck,
		Users,
		ScrollText,
		Download,
		FileText,
		Sparkles,
		HardDrive,
		Mail,
		Puzzle,
		Timer,
		DatabaseBackup,
		Languages
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { Lang } from '$lib/config';
	import { landing, type IconKey } from '$lib/content/landing';
	import SectionHeading from './SectionHeading.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const icons: Record<IconKey, Component<any>> = {
		shield: ShieldCheck,
		users: Users,
		scroll: ScrollText,
		download: Download,
		file: FileText,
		sparkles: Sparkles,
		storage: HardDrive,
		mail: Mail,
		puzzle: Puzzle,
		timer: Timer,
		backup: DatabaseBackup,
		languages: Languages
	};
</script>

<section id="features" aria-labelledby="features-title" class="section">
	<div class="container-x">
		<SectionHeading id="features-title" eyebrow={c.features.eyebrow} title={c.features.title} lead={c.features.lead} />

		<div class="mt-14 grid gap-12 sm:mt-16 md:grid-cols-3 md:gap-10 lg:gap-16">
			{#each c.features.groups as group (group.title)}
				<div>
					<h3 class="border-b border-ink-200/80 pb-3 text-sm font-semibold dark:border-ink-800">{group.title}</h3>
					<ul class="mt-6 space-y-6">
						{#each group.items as item (item.title)}
							{@const Icon = icons[item.icon]}
							<li class="flex gap-3">
								<Icon class="mt-0.5 size-4 shrink-0 text-ink-400 dark:text-ink-500" aria-hidden="true" />
								<div>
									<h4 class="text-sm font-medium text-ink-900 dark:text-white">{item.title}</h4>
									<p class="mt-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{item.text}</p>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>
