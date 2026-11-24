<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE_URL } from '$lib/config';

	// Statische Startseite: leitet je nach Browsersprache auf /de oder /en weiter.
	onMount(() => {
		const en = !/^de\b/i.test(navigator.language || 'de');
		location.replace(en ? '/en' : '/de');
	});
</script>

<svelte:head>
	<title>Kalypzo Atrium</title>
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="{SITE_URL}/de" />
	<link rel="alternate" hreflang="de" href="{SITE_URL}/de" />
	<link rel="alternate" hreflang="en" href="{SITE_URL}/en" />
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}/de" />
	<noscript><meta http-equiv="refresh" content="0; url=/de" /></noscript>
</svelte:head>

<main class="grid min-h-dvh place-items-center p-8 text-center">
	<p>
		<a href="/de" hreflang="de" class="font-semibold text-brand-600 underline">Deutsch</a> ·
		<a href="/en" hreflang="en" class="font-semibold text-brand-600 underline">English</a>
	</p>
</main>
