<script lang="ts">
	import { SITE_NAME, SITE_URL, LANGS, type Lang } from '$lib/config';
	import { switchLangPath } from '$lib/i18n';

	interface Props {
		title: string;
		description: string;
		/** Aktueller Pfad inkl. Sprachpräfix, z. B. "/de/docs/quickstart". */
		path: string;
		lang: Lang;
		image?: string;
		type?: 'website' | 'article';
		/** Ein oder mehrere JSON-LD-Objekte. */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
		noindex?: boolean;
	}

	let { title, description, path, lang, image = '/og-image.png', type = 'website', jsonLd, noindex = false }: Props =
		$props();

	const canonical = $derived(SITE_URL + path);
	const fullTitle = $derived(title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`);
	const imageUrl = $derived(image.startsWith('http') ? image : SITE_URL + image);
	const ld = $derived(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []);
	// JSON-LD sicher einbetten: "<" maskieren, damit das Script-Element nicht vorzeitig endet.
	const TAG = 'script';
	const ldHtml = $derived(
		ld.map((o) => `<${TAG} type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</${TAG}>`).join('')
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#each LANGS as l (l)}
		<link rel="alternate" hreflang={l} href={SITE_URL + switchLangPath(path, l)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={SITE_URL + switchLangPath(path, 'de')} />
	{#if noindex}<meta name="robots" content="noindex, follow" />{/if}

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={lang === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="og:locale:alternate" content={lang === 'de' ? 'en_US' : 'de_DE'} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html ldHtml}
</svelte:head>
