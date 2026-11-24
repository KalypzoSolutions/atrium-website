<script lang="ts">
	import { Search } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { openSearch, platform } from './state.svelte';

	interface Props {
		lang: Lang;
		/** header: kompakter Knopf; sidebar: Suchfeld-Optik über volle Breite; icon: nur Symbol. */
		variant?: 'header' | 'sidebar' | 'icon';
		class?: string;
	}
	let { lang, variant = 'header', class: cls = '' }: Props = $props();
	const d = $derived(t(lang));
	const mod = $derived(platform.mac ? '⌘' : d.search.ctrl);
	// Beim Überfahren schon den Dialog-Code laden, damit das Öffnen sofort wirkt.
	const preload = () => void import('./SearchDialog.svelte');
</script>

{#if variant === 'icon'}
	<button
		type="button"
		onclick={openSearch}
		onpointerenter={preload}
		class="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white {cls}"
		aria-label={d.search.open}
		aria-haspopup="dialog"
	>
		<Search class="size-[1.1rem]" aria-hidden="true" />
	</button>
{:else}
	<button
		type="button"
		onclick={openSearch}
		onpointerenter={preload}
		onfocus={preload}
		aria-haspopup="dialog"
		aria-label={variant === 'sidebar' ? d.search.docs : undefined}
		aria-keyshortcuts="Control+K Meta+K /"
		class={[
			'group flex items-center gap-2 rounded-lg border border-ink-200 text-sm text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-800 dark:border-ink-800 dark:text-ink-400 dark:hover:border-ink-700 dark:hover:text-ink-100',
			variant === 'sidebar'
				? 'w-full bg-white px-3 py-2 shadow-xs dark:bg-ink-900/60'
				: 'bg-ink-50/70 py-1.5 pr-1.5 pl-2.5 dark:bg-ink-900/60',
			cls
		]}
	>
		<Search class="size-4 shrink-0" aria-hidden="true" />
		<span class={['truncate whitespace-nowrap', variant === 'sidebar' ? 'flex-1 text-left' : 'pr-3']}>
			{d.search.label}{variant === 'sidebar' ? ' …' : ''}
		</span>
		<span class="flex items-center gap-0.5" aria-hidden="true">
			<kbd class="kbd !py-0 !text-[0.6875rem] leading-5 text-ink-500 dark:text-ink-400">{mod}</kbd>
			<kbd class="kbd !py-0 !text-[0.6875rem] leading-5 text-ink-500 dark:text-ink-400">K</kbd>
		</span>
	</button>
{/if}
