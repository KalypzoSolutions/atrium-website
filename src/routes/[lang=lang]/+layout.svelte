<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { data, children } = $props();
</script>

<Header lang={data.lang} />
<main id="main">
	{@render children()}
</main>
<Footer lang={data.lang} />
