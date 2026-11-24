<script lang="ts">
	import Seo from '$lib/seo/Seo.svelte';
	import Imprint from '$lib/components/legal/Imprint.svelte';
	import Privacy from '$lib/components/legal/Privacy.svelte';
	import { LEGAL_SLUGS, LEGAL_UPDATED } from '$lib/legal';

	let { data } = $props();
	const lang = $derived(data.lang);

	const TEXT = {
		imprint: {
			de: { title: 'Impressum', description: 'Impressum der Website zu Kalypzo Atrium – Angaben gemäß § 5 DDG.' },
			en: { title: 'Legal notice', description: 'Legal notice of the Kalypzo Atrium website – information pursuant to § 5 DDG.' }
		},
		privacy: {
			de: {
				title: 'Datenschutzerklärung',
				description: 'Wie die Website zu Kalypzo Atrium mit personenbezogenen Daten umgeht: keine Cookies, kein Tracking, gekürzte Server-Protokolle.'
			},
			en: {
				title: 'Privacy policy',
				description: 'How the Kalypzo Atrium website handles personal data: no cookies, no tracking, truncated server logs.'
			}
		}
	} as const;

	const text = $derived(TEXT[data.page][lang]);
	const path = $derived(`/${lang}/${LEGAL_SLUGS[data.page][lang]}`);
</script>

<Seo title={text.title} description={text.description} {path} {lang} />

<article class="container-narrow py-16 sm:py-24">
	<header class="mb-10 border-b border-ink-200/70 pb-8 dark:border-ink-800/70">
		<h1 class="text-4xl font-semibold tracking-tight">{text.title}</h1>
		<p class="mt-3 text-sm text-ink-500">{lang === 'de' ? 'Stand' : 'Last updated'}: {LEGAL_UPDATED[lang]}</p>
	</header>
	<div class="prose-atrium">
		{#if data.page === 'imprint'}
			<Imprint {lang} />
		{:else}
			<Privacy {lang} />
		{/if}
	</div>
</article>
