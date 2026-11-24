<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

	interface Crumb {
		name: string;
		href: string;
	}
	interface Props {
		items: Crumb[];
		label?: string;
	}
	let { items, label = 'Breadcrumb' }: Props = $props();
</script>

<nav aria-label={label} class="text-sm">
	<ol class="flex flex-wrap items-center gap-1 text-ink-500 dark:text-ink-400">
		{#each items as item, i (item.href)}
			<li class="flex items-center gap-1">
				{#if i > 0}<ChevronRight class="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />{/if}
				{#if i === items.length - 1}
					<span aria-current="page" class="font-medium text-ink-700 dark:text-ink-200">{item.name}</span>
				{:else}
					<a href={item.href} class="hover:text-brand-600 dark:hover:text-brand-300">{item.name}</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
