<script lang="ts">
	import { Menu, X } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { listFlat } from '$lib/docs';
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import DocsNav from './DocsNav.svelte';

	interface Props {
		lang: Lang;
		current: string;
	}
	let { lang, current }: Props = $props();
	const d = $derived(t(lang));
	const currentDoc = $derived(listFlat(lang).find((x) => x.slug === current));

	let drawer = $state<HTMLDialogElement>();
	const open = () => drawer?.showModal();
	const close = () => drawer?.close();

	// Nach jeder Navigation schließen.
	$effect(() => {
		void current;
		close();
	});
	const onBackdrop = (e: MouseEvent) => {
		if (e.target === drawer) close();
	};
</script>

<!-- Mobil/Tablet: Leiste unter dem Header mit Navigation (Schublade) und Suche -->
<div
	class="sticky top-16 z-30 -mx-4 flex items-center gap-2 border-b border-ink-200 bg-white/90 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden dark:border-ink-800 dark:bg-ink-950/85"
>
	<button
		type="button"
		onclick={open}
		aria-haspopup="dialog"
		class="-ml-2 flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-ink-100 dark:hover:bg-ink-800"
		aria-label="{d.docs.openNav}: {currentDoc?.title ?? d.docs.title}"
	>
		<Menu class="size-4 shrink-0 text-ink-500" aria-hidden="true" />
		<span class="min-w-0 truncate">
			{#if currentDoc?.section}<span class="text-ink-500 dark:text-ink-400">{currentDoc.section}</span
				><span class="px-1.5 text-ink-300 dark:text-ink-600" aria-hidden="true">/</span>{/if}<span
				class="font-medium text-ink-900 dark:text-white">{currentDoc?.title ?? d.docs.title}</span
			>
		</span>
	</button>
	<SearchButton {lang} variant="icon" class="-mr-2" />
</div>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={drawer}
	onclick={onBackdrop}
	aria-label={d.docs.navigation}
	class="docs-drawer m-0 h-dvh max-h-none w-[min(20rem,86vw)] max-w-none bg-white p-0 text-ink-800 shadow-2xl dark:bg-ink-950 dark:text-ink-200"
>
	<div class="flex h-full flex-col">
		<div class="flex h-16 shrink-0 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-800">
			<span class="text-sm font-semibold text-ink-900 dark:text-white">{d.docs.title}</span>
			<button
				type="button"
				onclick={close}
				class="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
				aria-label={d.docs.closeNav}
			>
				<X class="size-5" aria-hidden="true" />
			</button>
		</div>
		<div class="flex-1 overflow-y-auto overscroll-contain px-2 py-5">
			<DocsNav {lang} {current} idPrefix="docs-nav-m" />
		</div>
	</div>
</dialog>

<style>
	.docs-drawer::backdrop {
		background: color-mix(in oklch, var(--color-ink-950) 40%, transparent);
	}
	.docs-drawer[open] {
		animation: drawer-in 180ms ease-out;
	}
	@keyframes drawer-in {
		from {
			transform: translateX(-100%);
		}
	}
</style>
