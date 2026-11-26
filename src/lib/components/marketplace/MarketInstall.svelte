<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import { t } from '$lib/i18n';
	import type { Lang } from '$lib/config';
	import { LinkCopy } from './copy.svelte';
	let { lang, url, name, module = false }: { lang: Lang; url: string; name: string; module?: boolean } = $props();
	const d = $derived(t(lang).market);
	const copier = new LinkCopy();
	let field = $state<HTMLInputElement>();
	$effect(() => () => copier.destroy());
</script>
<div class="card p-6">
	<label for="install-link" class="text-sm font-medium">{d.card.source}</label>
	<input id="install-link" bind:this={field} readonly value={url} onfocus={(e) => e.currentTarget.select()} class="mt-2 block w-full rounded-md bg-ink-50 px-3 py-2 font-mono text-xs text-ink-700 dark:bg-ink-900 dark:text-ink-200" />
	<button type="button" class="btn-primary mt-4" aria-label={module ? d.moduleCard.copyLabel(name) : d.card.copyLabel(name)} onclick={() => copier.copy(url, field, module ? d.moduleCard.copiedMsg(name) : d.card.copiedMsg(name), d.card.copyFailed)}>
		{#if copier.state === 'copied'}<Check class="size-4" aria-hidden="true" />{d.card.copied}{:else}<Copy class="size-4" aria-hidden="true" />{d.card.copy}{/if}
	</button>
	<p class="sr-only" role="status" aria-live="polite">{copier.message}</p>
	{#if copier.state === 'failed'}<p class="mt-2 text-xs text-amber-700 dark:text-amber-400" aria-hidden="true">{d.card.copyFailed}</p>{/if}
</div>
