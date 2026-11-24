<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import type { CodeSample } from '$lib/content/guide';

	interface Props {
		sample: CodeSample;
		copyLabel: string;
		copiedLabel: string;
		class?: string;
	}
	let { sample, copyLabel, copiedLabel, class: cls = '' }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(sample.code);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch {
			/* Zwischenablage nicht verfügbar – der Code bleibt markierbar. */
		}
	}
</script>

<figure class="overflow-hidden rounded-lg border border-ink-200 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60 {cls}">
	<figcaption
		class="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-1.5 dark:border-ink-800"
	>
		<span class="font-mono text-xs text-ink-500 dark:text-ink-400">{sample.title}<span class="sr-only"> – {sample.label}</span></span>
		<button
			type="button"
			onclick={copy}
			class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-200/70 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
		>
			{#if copied}
				<Check class="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
			{:else}
				<Copy class="size-3.5" aria-hidden="true" />
			{/if}
			<span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
		</button>
	</figcaption>
	<pre
		class="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ink-800 dark:text-ink-100"><code>{sample.code}</code></pre>
</figure>
