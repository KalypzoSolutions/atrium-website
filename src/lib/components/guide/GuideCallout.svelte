<script lang="ts">
	import { Info, Lightbulb, TriangleAlert } from '@lucide/svelte';
	import type { Callout } from '$lib/content/guide';
	import RichText from './RichText.svelte';

	let { callout, class: cls = '' }: { callout: Callout; class?: string } = $props();

	// Dezent: dünne Linie links, kaum Fläche.
	const styles = {
		info: { icon: Info, box: 'border-brand-400/70 bg-brand-50/40 dark:border-brand-500/60 dark:bg-brand-500/5', ic: 'text-brand-500 dark:text-brand-400' },
		tip: { icon: Lightbulb, box: 'border-emerald-400/70 bg-emerald-50/40 dark:border-emerald-500/50 dark:bg-emerald-500/5', ic: 'text-emerald-600 dark:text-emerald-400' },
		warn: { icon: TriangleAlert, box: 'border-amber-400/80 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/5', ic: 'text-amber-600 dark:text-amber-400' }
	};
	const s = $derived(styles[callout.kind]);
</script>

<div class="flex gap-2.5 border-l-2 py-2 pr-3 pl-3.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300 {s.box} {cls}">
	<s.icon class="mt-[3px] size-3.5 shrink-0 {s.ic}" aria-hidden="true" />
	<p><RichText text={callout.text} /></p>
</div>
