<script lang="ts">
	/** Rendert Text, in dem `Backticks` Inline-Code markieren. */
	let { text }: { text: string } = $props();
	const parts = $derived(text.split('`'));
</script>

{#each parts as part, i (i)}{#if i % 2 === 1}<code
			class="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.85em] break-words text-ink-800 dark:bg-ink-800/80 dark:text-ink-100"
			>{part}</code
		>{:else}{part}{/if}{/each}
