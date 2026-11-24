<script lang="ts">
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { docHref, listDocs } from '$lib/docs';

	interface Props {
		lang: Lang;
		/** Slug der aktuellen Seite. */
		current: string;
		/** Präfix für die ids der Gruppenüberschriften (Navigation kommt ggf. zweimal vor). */
		idPrefix: string;
	}
	let { lang, current, idPrefix }: Props = $props();
	const d = $derived(t(lang));
	const groups = $derived(listDocs(lang));
</script>

<nav aria-label={d.docs.title} class="space-y-7 text-sm">
	{#each groups as g, gi (g.section)}
		<div>
			<p id="{idPrefix}-{gi}" class="mb-2 px-2.5 text-xs font-semibold tracking-wide text-ink-900 dark:text-white">
				{g.section}
			</p>
			<ul class="space-y-px" aria-labelledby="{idPrefix}-{gi}">
				{#each g.docs as doc (doc.slug)}
					<li>
						<a
							href={docHref(lang, doc.slug)}
							aria-current={doc.slug === current ? 'page' : undefined}
							class="block rounded-md px-2.5 py-1.5 leading-snug text-ink-600 transition-colors hover:bg-ink-100/70 hover:text-ink-900 aria-[current=page]:bg-brand-50 aria-[current=page]:font-medium aria-[current=page]:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-800/60 dark:hover:text-white dark:aria-[current=page]:bg-brand-900/30 dark:aria-[current=page]:text-brand-200"
							>{doc.title}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
