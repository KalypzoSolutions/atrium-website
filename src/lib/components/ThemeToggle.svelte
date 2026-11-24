<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	let { label }: { label: string } = $props();

	function toggle() {
		const dark = !document.documentElement.classList.contains('dark');
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			/* privater Modus */
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	class="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
	aria-label={label}
	title={label}
>
	<Sun class="hidden size-[1.1rem] dark:block" />
	<Moon class="size-[1.1rem] dark:hidden" />
</button>
