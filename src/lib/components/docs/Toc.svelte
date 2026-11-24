<script lang="ts">
	import type { TocItem } from '$lib/docs';

	interface Props {
		items: TocItem[];
		title: string;
		/** Kompakte Variante ohne eigene Überschrift-Optik (z. B. in einer Disclosure). */
		compact?: boolean;
	}
	let { items, title, compact = false }: Props = $props();

	let active = $state<string | null>(null);

	// Progressive Enhancement: ohne JavaScript bleiben es einfache Anker-Links.
	$effect(() => {
		const ids = items.map((i) => i.id);
		active = null;
		if (typeof IntersectionObserver === 'undefined' || ids.length === 0) return;
		const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
		if (els.length === 0) return;

		const visible = new Set<string>();
		const update = () => {
			const first = ids.find((id) => visible.has(id));
			if (first) {
				active = first;
				return;
			}
			// Nichts im Fenster: letzte Überschrift oberhalb des Viewports.
			let last: string | null = null;
			for (const el of els) {
				if (el.getBoundingClientRect().top < 120) last = el.id;
				else break;
			}
			active = last;
		};
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) visible.add(e.target.id);
					else visible.delete(e.target.id);
				}
				update();
			},
			{ rootMargin: '-88px 0px -60% 0px', threshold: [0, 1] }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});
</script>

{#if items.length > 0}
	<nav aria-label={title} class="text-sm">
		{#if !compact}
			<p class="mb-2 text-xs font-medium text-ink-500 dark:text-ink-400">{title}</p>
		{/if}
		<ul class="space-y-1 border-l border-ink-200 dark:border-ink-800">
			{#each items as item (item.id)}
				<li>
					<a
						href="#{item.id}"
						aria-current={active === item.id ? 'location' : undefined}
						class={[
							'-ml-px block border-l-2 border-transparent py-1 pr-2 leading-snug text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-white',
							'aria-[current=location]:border-brand-500 aria-[current=location]:text-ink-900 dark:aria-[current=location]:border-brand-400 dark:aria-[current=location]:text-white',
							item.level === 3 ? 'pl-6 text-[0.8125rem]' : 'pl-3'
						]}>{item.text}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
