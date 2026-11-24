<script lang="ts">
	import type { Lang } from '$lib/config';
	import { shots as allShots } from '$lib/screenshots';
	import { landing } from '$lib/content/landing';
	import Screenshot from '$lib/components/Screenshot.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(landing(lang));

	/** Auswahl in dieser Reihenfolge; das Dashboard zeigt bereits der Hero. */
	const PREFERRED = ['admin-overview', 'modules', 'settings', 'roles', 'api-keys', 'audit-log'];
	const list = $derived.by(() => {
		const keyOf = (src: string) => src.split('/').pop()?.replace(/^\d+[a-z]?-/, '').replace(/\.webp$/, '') ?? '';
		const all = allShots(lang).filter((s) => PREFERRED.includes(keyOf(s.src)));
		return all.sort((a, b) => PREFERRED.indexOf(keyOf(a.src)) - PREFERRED.indexOf(keyOf(b.src)));
	});

	let active = $state(0);
	const current = $derived(list[Math.min(active, list.length - 1)]);
	let tabEls: HTMLButtonElement[] = $state([]);

	function onKey(e: KeyboardEvent, i: number) {
		let next = i;
		if (e.key === 'ArrowRight') next = (i + 1) % list.length;
		else if (e.key === 'ArrowLeft') next = (i - 1 + list.length) % list.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = list.length - 1;
		else return;
		e.preventDefault();
		active = next;
		tabEls[next]?.focus();
	}
</script>

{#if list.length > 0 && current}
	<section aria-labelledby="showcase-title" class="section">
		<div class="container-x">
			<SectionHeading id="showcase-title" eyebrow={c.showcase.eyebrow} title={c.showcase.title} lead={c.showcase.lead} />

			{#if list.length > 1}
				<div
					role="tablist"
					aria-label={c.showcase.tabsLabel}
					class="mt-12 flex gap-6 overflow-x-auto border-b border-ink-200/80 [scrollbar-width:none] dark:border-ink-800"
				>
					{#each list as s, i (s.src)}
						<button
							bind:this={tabEls[i]}
							type="button"
							role="tab"
							id="shot-tab-{i}"
							aria-selected={i === active}
							aria-controls="shot-panel"
							tabindex={i === active ? 0 : -1}
							onclick={() => (active = i)}
							onkeydown={(e) => onKey(e, i)}
							class="-mb-px shrink-0 border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors {i === active
								? 'border-ink-900 text-ink-900 dark:border-white dark:text-white'
								: 'border-transparent text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white'}"
						>
							{s.title}
						</button>
					{/each}
				</div>
			{/if}

			<div
				id="shot-panel"
				role={list.length > 1 ? 'tabpanel' : undefined}
				aria-labelledby={list.length > 1 ? `shot-tab-${active}` : undefined}
				class="mt-8"
			>
				{#key current.src}
					<Screenshot shot={current} {lang} frame="minimal" />
				{/key}
			</div>
		</div>
	</section>
{/if}
