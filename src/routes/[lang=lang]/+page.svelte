<script lang="ts">
	import Seo from '$lib/seo/Seo.svelte';
	import { GITHUB_URL, SITE_NAME, SITE_URL } from '$lib/config';
	import { OPERATOR } from '$lib/legal';
	import { landing } from '$lib/content/landing';
	import Hero from '$lib/components/landing/Hero.svelte';
	import TechStrip from '$lib/components/landing/TechStrip.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import Modules from '$lib/components/landing/Modules.svelte';
	import Showcase from '$lib/components/landing/Showcase.svelte';
	import Api from '$lib/components/landing/Api.svelte';
	import Deploy from '$lib/components/landing/Deploy.svelte';
	import Faq from '$lib/components/landing/Faq.svelte';
	import FinalCta from '$lib/components/landing/FinalCta.svelte';

	let { data } = $props();
	const lang = $derived(data.lang);
	const c = $derived(landing(lang));
	const pageUrl = $derived(`${SITE_URL}/${lang}`);
	const inLanguage = $derived(lang === 'de' ? 'de-DE' : 'en-US');

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			'@id': `${SITE_URL}/#software`,
			name: SITE_NAME,
			description: c.seo.description,
			url: pageUrl,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Linux, Docker',
			inLanguage: ['de', 'en'],
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
			sameAs: [GITHUB_URL],
			publisher: { '@id': `${SITE_URL}/#author` }
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			'@id': `${SITE_URL}/#author`,
			name: OPERATOR.name,
			url: SITE_URL
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			'@id': `${SITE_URL}/#website`,
			name: SITE_NAME,
			url: SITE_URL,
			inLanguage,
			publisher: { '@id': `${SITE_URL}/#author` }
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			inLanguage,
			mainEntity: c.faq.items.map((f) => ({
				'@type': 'Question',
				name: f.q,
				acceptedAnswer: { '@type': 'Answer', text: f.a }
			}))
		}
	]);
</script>

<Seo title={c.seo.title} description={c.seo.description} path="/{lang}" {lang} {jsonLd} />

<Hero {lang} />
<TechStrip {lang} />
<Features {lang} />
<Modules {lang} />
<Showcase {lang} />
<Api {lang} />
<Deploy {lang} />
<Faq {lang} />
<FinalCta {lang} />
