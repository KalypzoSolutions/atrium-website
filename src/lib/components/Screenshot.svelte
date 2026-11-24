<script lang="ts">
	import { Maximize2, X } from '@lucide/svelte';
	import type { Shot } from '$lib/screenshots';

	interface Props {
		/** Eintrag aus `shots()`/`shot()`; liefert src, Maße, Titel und Route. */
		shot?: Shot;
		/** Alternativ: direkte Bildquelle (überschreibt `shot.src`). */
		src?: string;
		/** Alternativtext; Standard ist der Titel des Screenshots. */
		alt?: string;
		width?: number;
		height?: number;
		caption?: string;
		/** Above the fold: lädt sofort mit hoher Priorität. */
		eager?: boolean;
		/** Text in der Adressleiste des Fensterrahmens. */
		url?: string;
		/** Klick öffnet eine Großansicht (Standard: an). */
		zoomable?: boolean;
		/** Beschriftungen (Standard: deutsch, über `lang` umschaltbar). */
		lang?: 'de' | 'en';
		/** Rahmenstil: `window` (Standard, Ampel + Adressleiste) oder `minimal` (dünner Rahmen, dezente Punkte). */
		frame?: 'window' | 'minimal';
		/**
		 * Zuschnitt als CSS-Seitenverhältnis (z. B. `16/8`): zeigt nur den oberen Teil des Bildes,
		 * Die Großansicht zeigt weiterhin das ganze Bild.
		 */
		crop?: string;
		class?: string;
	}

	let {
		shot,
		src,
		alt,
		width,
		height,
		caption,
		eager = false,
		url,
		zoomable = true,
		lang = 'de',
		frame = 'window',
		crop,
		class: cls = ''
	}: Props = $props();

	const imgSrc = $derived(src ?? shot?.src);
	const w = $derived(width ?? shot?.width ?? 1440);
	const h = $derived(height ?? shot?.height ?? 900);
	const altText = $derived(alt ?? shot?.title ?? '');
	const address = $derived(url ?? `atrium.example.org${shot?.route ?? ''}`);
	const labels = $derived(
		lang === 'de'
			? { enlarge: 'Vergrößern', close: 'Schließen', preview: 'Vorschau' }
			: { enlarge: 'Enlarge', close: 'Close', preview: 'Preview' }
	);

	const minimal = $derived(frame === 'minimal');
	const imgClass = $derived(crop ? 'block size-full object-cover object-top' : 'block h-auto w-full');

	let dialog: HTMLDialogElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();

	function open() {
		dialog?.showModal();
	}
	function close() {
		dialog?.close();
	}
	function onBackdrop(e: MouseEvent) {
		if (e.target === dialog) close();
	}
	function onClose() {
		trigger?.focus();
	}
</script>

<figure class="group/shot {cls}">
	<div
		class="overflow-hidden rounded-xl border bg-white dark:bg-ink-900 {minimal
			? 'border-ink-200/80 shadow-lg shadow-ink-900/[0.04] dark:border-ink-800 dark:shadow-none'
			: 'border-ink-200 shadow-xl shadow-ink-900/5 dark:border-ink-700/80 dark:shadow-black/40'}"
	>
		<!-- Fensterrahmen -->
		{#if minimal}
			<div
				class="flex items-center gap-3 border-b border-ink-200/80 bg-ink-50/60 px-3 py-2 dark:border-ink-800 dark:bg-ink-900"
				aria-hidden="true"
			>
				<span class="flex gap-1.5">
					<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
					<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
					<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
				</span>
				<span class="mx-auto hidden truncate font-mono text-[11px] text-ink-400 sm:block dark:text-ink-500">{address}</span>
				<span class="w-10 max-sm:hidden"></span>
			</div>
		{:else}
			<div
				class="flex items-center gap-3 border-b border-ink-200 bg-ink-50 px-3.5 py-2.5 dark:border-ink-800 dark:bg-ink-900"
				aria-hidden="true"
			>
				<span class="flex gap-1.5">
					<span class="size-2.5 rounded-full bg-[#ff5f57]"></span>
					<span class="size-2.5 rounded-full bg-[#febc2e]"></span>
					<span class="size-2.5 rounded-full bg-[#28c840]"></span>
				</span>
				<span
					class="mx-auto hidden max-w-xs flex-1 truncate rounded-md border border-ink-200 bg-white px-3 py-0.5 text-center font-mono text-[11px] text-ink-500 sm:block dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400"
					>{address}</span
				>
				<span class="w-10 max-sm:hidden"></span>
			</div>
		{/if}

		{#if imgSrc}
			{#if zoomable}
				<button
					bind:this={trigger}
					type="button"
					onclick={open}
					class="relative block w-full cursor-zoom-in focus-visible:outline-offset-[-4px]"
					style={crop ? `aspect-ratio: ${crop}` : undefined}
					aria-label="{labels.enlarge}: {altText}"
				>
					<img
						src={imgSrc}
						alt={altText}
						width={w}
						height={h}
						loading={eager ? 'eager' : 'lazy'}
						fetchpriority={eager ? 'high' : 'auto'}
						decoding="async"
						class={imgClass}
					/>
					<span
						class="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/70 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover/shot:opacity-100 group-focus-within/shot:opacity-100"
						aria-hidden="true"
					>
						<Maximize2 class="size-3.5" />
						{labels.enlarge}
					</span>
				</button>
			{:else}
				<div style={crop ? `aspect-ratio: ${crop}` : undefined}>
				<img
					src={imgSrc}
					alt={altText}
					width={w}
					height={h}
					loading={eager ? 'eager' : 'lazy'}
					fetchpriority={eager ? 'high' : 'auto'}
					decoding="async"
					class={imgClass}
				/>
				</div>
			{/if}
		{:else}
			<!-- Platzhalter, solange kein Screenshot vorliegt -->
			<div
				role="img"
				aria-label={altText || labels.preview}
				class="relative grid grid-cols-[3.25rem_1fr] bg-white sm:grid-cols-[11rem_1fr] dark:bg-ink-950"
				style="aspect-ratio: {w} / {h}"
			>
				<div class="flex flex-col gap-2 border-r border-ink-100 bg-ink-50/70 p-3 dark:border-ink-800 dark:bg-ink-900/60" aria-hidden="true">
					<div class="mb-2 h-5 w-5 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 sm:w-24"></div>
					{#each [70, 55, 80, 60, 45, 65] as bw, i (i)}
						<div class="flex items-center gap-2">
							<div class="size-3 shrink-0 rounded {i === 0 ? 'bg-brand-500/70' : 'bg-ink-200 dark:bg-ink-700'}"></div>
							<div
								class="hidden h-2 rounded-full sm:block {i === 0 ? 'bg-brand-200 dark:bg-brand-800' : 'bg-ink-200 dark:bg-ink-800'}"
								style="width: {bw}%"
							></div>
						</div>
					{/each}
				</div>
				<div class="flex flex-col gap-3 p-3 sm:gap-4 sm:p-5" aria-hidden="true">
					<div class="flex items-center justify-between">
						<div class="h-3 w-1/3 rounded-full bg-ink-200 dark:bg-ink-700"></div>
						<div class="h-5 w-16 rounded-md bg-brand-500/80"></div>
					</div>
					<div class="grid grid-cols-3 gap-2 sm:gap-3">
						{#each [0, 1, 2] as i (i)}
							<div class="rounded-lg border border-ink-100 p-2 sm:p-3 dark:border-ink-800">
								<div class="h-1.5 w-1/2 rounded-full bg-ink-200 dark:bg-ink-700"></div>
								<div class="mt-2 h-3 w-2/3 rounded-full {i === 1 ? 'bg-accent-500/60' : 'bg-brand-300/70 dark:bg-brand-700/70'}"></div>
							</div>
						{/each}
					</div>
					<div class="flex min-h-0 flex-1 items-end gap-1.5 rounded-lg border border-ink-100 p-3 dark:border-ink-800">
						{#each [40, 65, 50, 80, 55, 90, 70, 60, 85, 45, 75, 95] as bh, i (i)}
							<div
								class="flex-1 rounded-t bg-gradient-to-t from-brand-500/70 to-accent-400/70"
								style="height: {bh}%"
							></div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
	{#if caption}
		<figcaption class="mt-3 text-center text-sm text-ink-600 dark:text-ink-400">{caption}</figcaption>
	{/if}
</figure>

{#if imgSrc && zoomable}
	<dialog
		bind:this={dialog}
		onclick={onBackdrop}
		onclose={onClose}
		aria-label={altText}
		class="m-auto max-h-[92vh] w-[min(96vw,1600px)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-ink-950/80 backdrop:backdrop-blur-sm"
	>
		<div class="relative">
			<button
				type="button"
				onclick={close}
				class="absolute -top-11 right-0 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
			>
				<X class="size-4" aria-hidden="true" />
				{labels.close}
			</button>
			<img
				src={imgSrc}
				alt={altText}
				width={w}
				height={h}
				loading="lazy"
				decoding="async"
				class="mx-auto block h-auto max-h-[85vh] w-auto max-w-full rounded-xl shadow-2xl"
			/>
			{#if caption}
				<p class="mt-3 text-center text-sm text-ink-200">{caption}</p>
			{/if}
		</div>
	</dialog>
{/if}

