<script lang="ts">
	import { Maximize2, X } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { t } from '$lib/i18n';
	import { shots } from '$lib/screenshots';

	interface Props {
		/** Dateiname ohne Endung, z. B. "07-settings-storage". */
		name: string;
		lang: Lang;
		/** Bildunterschrift; ohne Angabe der Titel aus dem Manifest. */
		caption?: string;
		/** Nur die obersten n Pixel (bezogen auf 1440 px Breite) zeigen – für sehr hohe Aufnahmen. */
		crop?: number | string;
	}
	let { name, lang, caption, crop }: Props = $props();

	const d = $derived(t(lang));
	const shot = $derived(shots(lang).find((s) => s.src.endsWith(`/${name}.webp`)));
	const cropPx = $derived(crop ? Math.min(Number(crop), shot?.height ?? Infinity) : undefined);
	const cropped = $derived(!!shot && !!cropPx && cropPx < shot.height);
	const label = $derived(caption ?? shot?.title ?? '');

	let dialog = $state<HTMLDialogElement>();
	const open = () => dialog?.showModal();
	const close = () => dialog?.close();
	// Klick auf den Hintergrund (das <dialog> selbst) schließt.
	const onBackdrop = (e: MouseEvent) => {
		if (e.target === dialog) close();
	};
</script>

{#if shot}
	<figure class="doc-shot not-prose my-8">
		<button
			type="button"
			onclick={open}
			class="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-ink-200 bg-ink-50 text-left dark:border-ink-800 dark:bg-ink-900"
			aria-label="{d.common.enlarge}: {shot.title}"
		>
			<span
				class="block overflow-hidden"
				style={cropped ? `aspect-ratio: ${shot.width} / ${cropPx}` : undefined}
			>
				<img
					src={shot.src}
					alt={shot.caption}
					width={shot.width}
					height={shot.height}
					loading="lazy"
					decoding="async"
					class="block h-auto w-full"
				/>
			</span>
			{#if cropped}
				<span
					class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
					aria-hidden="true"
				></span>
			{/if}
			<span
				class="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white/90 px-2 py-1 text-xs font-medium text-ink-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-ink-700 dark:bg-ink-900/90 dark:text-ink-300"
				aria-hidden="true"
			>
				<Maximize2 class="size-3.5" />
				{d.common.enlarge}
			</span>
		</button>
		{#if label}
			<figcaption class="mt-2.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{label}</figcaption>
		{/if}
	</figure>

	<dialog
		bind:this={dialog}
		onclick={onBackdrop}
		aria-label={shot.title}
		class="doc-shot-dialog not-prose m-auto max-h-[92dvh] w-[min(96vw,1440px)] max-w-none overflow-hidden rounded-xl border border-ink-200 bg-white p-0 text-ink-800 shadow-xl backdrop:bg-ink-950/70 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
	>
		<div class="flex items-center justify-between gap-4 border-b border-ink-200 px-4 py-2.5 dark:border-ink-800">
			<p class="truncate text-sm font-medium">{shot.title}</p>
			<button
				type="button"
				onclick={close}
				class="rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-white"
				aria-label={d.nav.close}
			>
				<X class="size-4" />
			</button>
		</div>
		<div class="max-h-[calc(92dvh-3rem)] overflow-auto">
			<img src={shot.src} alt={shot.caption} width={shot.width} height={shot.height} class="block h-auto w-full" />
			<p class="border-t border-ink-200 px-4 py-3 text-sm text-ink-600 dark:border-ink-800 dark:text-ink-400">
				{shot.caption}
			</p>
		</div>
	</dialog>
{/if}
