<script lang="ts">
	let { class: cls = 'size-8' }: { class?: string } = $props();
	const uid = $props.id();
</script>

<!-- Atrium: stilisierter Innenhof, vier Flügel um einen offenen Kern -->
<svg class={cls} viewBox="0 0 32 32" fill="none" aria-hidden="true">
	<defs>
		<linearGradient id="atrium-g-{uid}" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
			<stop stop-color="#5b4bf5" />
			<stop offset="1" stop-color="#22b8d6" />
		</linearGradient>
	</defs>
	<rect width="32" height="32" rx="8" fill="url(#atrium-g-{uid})" />
	<rect x="8" y="8" width="6.5" height="6.5" rx="1.6" fill="white" fill-opacity=".95" />
	<rect x="17.5" y="8" width="6.5" height="6.5" rx="1.6" fill="white" fill-opacity=".7" />
	<rect x="8" y="17.5" width="6.5" height="6.5" rx="1.6" fill="white" fill-opacity=".7" />
	<rect x="17.5" y="17.5" width="6.5" height="6.5" rx="1.6" fill="white" fill-opacity=".45" />
</svg>
