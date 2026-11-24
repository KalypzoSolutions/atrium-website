<script lang="ts">
	import { Maximize2, X } from '@lucide/svelte';
	import type { Lang } from '$lib/config';
	import { shot as findShot } from '$lib/screenshots';
	import type { ShotRef } from '$lib/content/guide';

	interface Props {
		ref: ShotRef;
		lang: Lang;
		/** `primary`: volle Inhaltsbreite; `thumb`: kleine Vorschau für weitere Screenshots. */
		variant?: 'primary' | 'thumb';
		eager?: boolean;
		labels: { enlarge: string; close: string };
		class?: string;
	}
	let { ref, lang, variant = 'primary', eager = false, labels, class: cls = '' }: Props = $props();

	const s = $derived(findShot(lang, ref.key));
	const thumb = $derived(variant === 'thumb');
	// Hohe Aufnahmen als Ausschnitt; die Großansicht zeigt immer das ganze Bild.
	const cropped = $derived(!thumb && !!ref.crop);

	// Hohe Bilder in der Großansicht scrollen statt verkleinern.
	const tall = $derived(!!s && s.height / s.width > 0.8);

	let dialog: HTMLDialogElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();

	const open = () => dialog?.showModal();
	const close = () => dialog?.close();
	const onBackdrop = (e: MouseEvent) => {
		if (e.target === dialog) close();
	};
</script>

{#if s}
	<figure class="group/shot {cls}">
		<button
			bind:this={trigger}
			type="button"
			onclick={open}
			aria-label="{labels.enlarge}: {s.caption}"
			class="relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-ink-200 bg-ink-50 transition-colors hover:border-ink-300 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-ink-700 {thumb
				? 'aspect-[16/10]'
				: ''}"
		>
			<img
				src={s.src}
				alt={s.caption}
				width={s.width}
				height={s.height}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				decoding="async"
				class="block w-full {thumb
					? 'h-full object-cover object-top'
					: cropped
						? 'h-auto max-h-[22rem] object-cover object-top sm:max-h-[30rem]'
						: 'h-auto'}"
			/>
			{#if cropped}
				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-ink-950"
				></span>
			{/if}
			<span
				aria-hidden="true"
				class="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white/95 px-2 py-1 text-xs font-medium text-ink-600 transition-opacity dark:border-ink-700 dark:bg-ink-900/95 dark:text-ink-300 {cropped
					? ''
					: 'opacity-0 group-hover/shot:opacity-100 group-focus-within/shot:opacity-100'} {thumb ? 'hidden' : ''}"
			>
				<Maximize2 class="size-3" />
				{labels.enlarge}
			</span>
		</button>
		<figcaption class="mt-2 text-xs text-ink-500 dark:text-ink-400 {thumb ? 'line-clamp-2' : ''}">{s.title}</figcaption>
	</figure>

	<dialog
		bind:this={dialog}
		onclick={onBackdrop}
		onclose={() => trigger?.focus()}
		aria-label={s.title}
		class="m-auto max-h-[94vh] w-[min(96vw,1600px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-ink-950/80 backdrop:backdrop-blur-sm"
	>
		<div class="relative">
			<button
				type="button"
				onclick={close}
				class="absolute -top-10 right-0 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-sm font-medium text-white hover:bg-white/20"
			>
				<X class="size-4" aria-hidden="true" />
				{labels.close}
			</button>
			{#if tall}
				<div class="mx-auto max-h-[86vh] max-w-6xl overflow-y-auto rounded-lg">
					<img src={s.src} alt={s.caption} width={s.width} height={s.height} loading="lazy" decoding="async" class="block h-auto w-full" />
				</div>
			{:else}
				<img
					src={s.src}
					alt={s.caption}
					width={s.width}
					height={s.height}
					loading="lazy"
					decoding="async"
					class="mx-auto block h-auto max-h-[86vh] w-auto max-w-full rounded-lg"
				/>
			{/if}
			<p class="mt-2 text-center text-sm text-ink-300">{s.title}</p>
		</div>
	</dialog>
{/if}
