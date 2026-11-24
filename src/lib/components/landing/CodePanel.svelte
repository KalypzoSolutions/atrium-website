<script lang="ts">
	interface Props {
		/** Dateiname/Titel in der Kopfzeile. */
		title: string;
		code: string;
		/** Zugängliche Beschreibung des Codebeispiels. */
		label: string;
		class?: string;
	}
	let { title, code, label, class: cls = '' }: Props = $props();
</script>

<figure class="overflow-hidden rounded-xl border border-ink-200/80 bg-ink-50 dark:border-ink-800 dark:bg-ink-900 {cls}">
	<figcaption class="flex items-center gap-3 border-b border-ink-200/80 px-4 py-2.5 dark:border-ink-800">
		<span class="flex gap-1.5" aria-hidden="true">
			<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
			<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
			<span class="size-2 rounded-full bg-ink-200 dark:bg-ink-700"></span>
		</span>
		<span class="font-mono text-xs text-ink-500 dark:text-ink-400">{title}</span>
		<span class="sr-only">– {label}</span>
	</figcaption>
	<pre class="overflow-x-auto p-4 text-[13px] leading-relaxed text-ink-800 sm:p-5 dark:text-ink-200"><code>{code}</code></pre>
</figure>
