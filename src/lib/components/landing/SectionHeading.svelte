<script lang="ts">
	interface Props {
		id: string;
		eyebrow: string;
		title: string;
		lead?: string;
		class?: string;
	}
	let { id, eyebrow, title, lead, class: cls = '' }: Props = $props();
</script>

<div class="max-w-2xl {cls}">
	<p class="eyebrow">{eyebrow}</p>
	<h2 {id} class="heading-section mt-2">{title}</h2>
	{#if lead}
		<p class="lead mt-4">{lead}</p>
	{/if}
</div>
