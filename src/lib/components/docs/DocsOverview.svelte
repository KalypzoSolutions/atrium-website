<script lang="ts">
	import { BookOpen, ChevronRight, Code2, Server, ShieldCheck } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { docHref, listDocs, SECTION_INFO, type SectionIcon } from '$lib/docs';

	interface Props {
		lang: Lang;
	}
	let { lang }: Props = $props();

	const icons: Record<SectionIcon, typeof BookOpen> = {
		start: BookOpen,
		admin: ShieldCheck,
		ops: Server,
		dev: Code2
	};
	// Die Einführung selbst nicht noch einmal verlinken.
	const groups = $derived(
		listDocs(lang)
			.map((g) => ({ ...g, docs: g.docs.filter((x) => x.slug !== 'index') }))
			.filter((g) => g.docs.length > 0)
	);
	const label = $derived(t(lang).docs.sectionsLabel);
</script>

<section aria-label={label} class="not-prose my-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each groups as g (g.section)}
		{@const info = SECTION_INFO[lang][g.section]}
		{@const Icon = icons[info?.icon ?? 'start']}
		<div class="card flex flex-col p-5">
			<div class="flex items-center gap-2.5">
				<span
					class="inline-flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
					aria-hidden="true"
				>
					<Icon class="size-4" />
				</span>
				<h2 class="text-base font-semibold">{g.section}</h2>
			</div>
			{#if info}
				<p class="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{info.description}</p>
			{/if}
			<ul class="-mx-2 mt-3 space-y-px border-t border-ink-100 pt-3 text-sm dark:border-ink-800">
				{#each g.docs as doc (doc.slug)}
					<li>
						<a
							href={docHref(lang, doc.slug)}
							class="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-ink-700 hover:bg-ink-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-ink-800/60 dark:hover:text-brand-200"
							><span>{doc.title}</span><ChevronRight
								class="size-3.5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-current dark:text-ink-600"
								aria-hidden="true"
							/></a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</section>
