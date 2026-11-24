<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { t } from '$lib/i18n';

	const lang = $derived(page.url.pathname.startsWith('/en') ? 'en' : 'de');
	const d = $derived(t(lang));
</script>

<svelte:head>
	<title>{page.status} · {d.common.notFound} · Kalypzo Atrium</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Header {lang} />
<main id="main" class="container-x grid min-h-[60vh] place-items-center py-24 text-center">
	<div>
		<p class="text-gradient text-7xl font-bold">{page.status}</p>
		<h1 class="mt-4 text-3xl font-semibold">{d.common.notFound}</h1>
		<p class="mt-3 text-ink-600 dark:text-ink-400">{d.common.notFoundText}</p>
		<a href="/{lang}" class="btn-primary mt-8">{d.common.backHome}</a>
	</div>
</main>
<Footer {lang} />
