<script lang="ts">
	import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown } from '@lucide/svelte';
	import { GUIDE_SLUG, SITE_NAME, SITE_URL } from '$lib/config';
	import { guide, type GuideStep, type ShotRef } from '$lib/content/guide';
	import { shot } from '$lib/screenshots';
	import Seo from '$lib/seo/Seo.svelte';
	import GuideShot from '$lib/components/guide/GuideShot.svelte';
	import GuideCode from '$lib/components/guide/GuideCode.svelte';
	import GuideCallout from '$lib/components/guide/GuideCallout.svelte';
	import RichText from '$lib/components/guide/RichText.svelte';

	let { data } = $props();
	const lang = $derived(data.lang);
	const c = $derived(guide(lang));
	const path = $derived(`/${lang}/${GUIDE_SLUG[lang]}`);
	const A = $derived(c.partA);
	const B = $derived(c.partB);
	const shotLabels = $derived({ enlarge: c.ui.enlarge, close: c.ui.close });

	/** Schrittnavigation: Gruppen mit Ankern in Dokumentreihenfolge. */
	const navGroups = $derived([
		{
			label: c.ui.partA,
			href: `#${A.id}`,
			items: [
				{ id: A.dokploy.id, label: A.dokploy.short },
				{ id: A.compose.id, label: A.compose.short }
			]
		},
		{ label: c.ui.partB, href: `#${B.id}`, items: B.steps.map((s) => ({ id: s.id, label: s.short })) }
	]);
	const navIds = $derived([...navGroups.flatMap((g) => g.items.map((i) => i.id)), c.done.id]);

	// Aktuellen Schritt hervorheben (Progressive Enhancement – ohne JS funktionieren die Anker trotzdem).
	let activeId = $state('');
	$effect(() => {
		const ids = navIds;
		if (typeof IntersectionObserver === 'undefined') return;
		const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
		const visible = new Set<string>();
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) visible.add(e.target.id);
					else visible.delete(e.target.id);
				}
				const first = ids.find((id) => visible.has(id));
				if (first) activeId = first;
			},
			{ rootMargin: '-96px 0px -55% 0px' }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	const firstShotKey = (s: GuideStep) => s.shots[0]?.key ?? s.substeps?.[0]?.shot.key;
	/** Ein Hauptscreenshot je Schritt; alle weiteren werden zu kleinen Vorschauen. */
	const primaryShot = (s: GuideStep): ShotRef | undefined => s.shots[0] ?? s.substeps?.[0]?.shot;
	const pad = (n: number) => String(n).padStart(2, '0');
	const plain = (text: string) => text.replaceAll('`', '');

	const jsonLd = $derived.by(() => {
		const base = SITE_URL + path;
		const img = (key?: string) => {
			const s = key ? shot(lang, key) : undefined;
			return s ? SITE_URL + s.src : undefined;
		};
		const steps = [
			{
				'@type': 'HowToStep',
				name: A.dokploy.title,
				text: plain(A.dokploy.lead + ' ' + A.dokploy.steps.map((s) => s.title).join(' · ')),
				url: `${base}#${A.dokploy.id}`
			},
			...B.steps.map((s) => ({
				'@type': 'HowToStep',
				name: s.title,
				text: plain(s.text.join(' ')),
				url: `${base}#${s.id}`,
				image: img(firstShotKey(s))
			}))
		].map((s, i) => ({ ...s, position: i + 1 }));
		return [
			{
				'@context': 'https://schema.org',
				'@type': 'HowTo',
				name: c.seo.title,
				description: c.seo.description,
				inLanguage: lang,
				totalTime: c.totalTime,
				image: img('02-dashboard'),
				tool: [{ '@type': 'HowToTool', name: 'Dokploy' }, { '@type': 'HowToTool', name: 'Docker Compose' }],
				step: steps
			},
			{
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/${lang}` },
					{ '@type': 'ListItem', position: 2, name: c.hero.eyebrow, item: base }
				]
			}
		];
	});

	const text = 'leading-relaxed text-ink-600 dark:text-ink-300';
	const num =
		'inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-ink-200 font-mono text-[11px] font-medium text-ink-500 tabular-nums dark:border-ink-700 dark:text-ink-400';
</script>

<Seo title={c.seo.title} description={c.seo.description} {path} {lang} type="article" {jsonLd} />

{#snippet navLink(id: string, label: string)}
	{@const active = activeId === id}
	<a
		href="#{id}"
		aria-current={active ? 'location' : undefined}
		class="-ml-px block border-l py-1 pl-3 transition-colors {active
			? 'border-brand-500 font-medium text-ink-900 dark:border-brand-400 dark:text-white'
			: 'border-transparent text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white'}">{label}</a
	>
{/snippet}

{#snippet stepNav()}
	<ol class="space-y-6 text-[13px] leading-5">
		{#each navGroups as group (group.href)}
			<li>
				<a
					href={group.href}
					class="text-xs font-medium text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-200"
					>{group.label}</a
				>
				<ol class="mt-2 border-l border-ink-200 dark:border-ink-800">
					{#each group.items as item (item.id)}
						<li>{@render navLink(item.id, item.label)}</li>
					{/each}
				</ol>
			</li>
		{/each}
		<li class="border-l border-ink-200 dark:border-ink-800">{@render navLink(c.done.id, c.nav.done)}</li>
	</ol>
{/snippet}

{#snippet clickPath(items: string[])}
	<ol class="flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-ink-500 dark:text-ink-400" aria-label={c.ui.clickPath}>
		{#each items as item, i (i)}
			<li class="flex items-center gap-x-1.5">
				{#if i > 0}<span class="text-ink-300 dark:text-ink-600" aria-hidden="true">›</span>{/if}
				<span class={i === items.length - 1 ? 'text-ink-700 dark:text-ink-200' : ''}>{item}</span>
			</li>
		{/each}
	</ol>
{/snippet}

<div class="container-x pt-12 pb-24 sm:pt-16 sm:pb-32 lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
	<!-- Schrittnavigation (Desktop) -->
	<aside class="hidden lg:block">
		<nav
			aria-label={c.nav.label}
			class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-8 [scrollbar-width:thin]"
		>
			{@render stepNav()}
		</nav>
	</aside>

	<div class="min-w-0 max-w-3xl">
		<!-- Einstieg -->
		<header class="border-b border-ink-200/80 pb-12 dark:border-ink-800">
			<p class="eyebrow">{c.hero.eyebrow}</p>
			<h1 id="guide-title" class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
				{c.hero.titleA}
				{c.hero.titleB}
			</h1>
			<p class="lead mt-5 max-w-2xl">{c.hero.lead}</p>
			<p class="mt-4 text-sm text-ink-500 dark:text-ink-400">
				<span class="sr-only">{c.hero.timeLabel}: </span>{c.hero.time}
				<span aria-hidden="true" class="mx-1.5 text-ink-300 dark:text-ink-600">·</span>
				{c.hero.parts}
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a href="#{A.id}" class="btn-primary">
					{c.hero.ctaStart}
					<ArrowDown class="size-4" aria-hidden="true" />
				</a>
				<a href="/{lang}/docs/quickstart" class="btn-ghost">{c.hero.ctaDocs}</a>
			</div>
		</header>

		<!-- Schrittnavigation (Mobil) -->
		<details class="group mt-8 rounded-lg border border-ink-200 lg:hidden dark:border-ink-800">
			<summary
				class="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-200 [&::-webkit-details-marker]:hidden"
			>
				{c.nav.mobile}
				<ChevronDown class="size-4 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" />
			</summary>
			<nav aria-label={c.nav.label} class="border-t border-ink-200 px-4 py-4 dark:border-ink-800">
				{@render stepNav()}
			</nav>
		</details>

		<!-- Teil A: Installieren -->
		<section id={A.id} aria-labelledby="{A.id}-title" class="pt-14 sm:pt-16">
			<p class="eyebrow">{A.eyebrow}</p>
			<h2 id="{A.id}-title" class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{A.title}</h2>
			<p class="mt-3 max-w-2xl {text}">{A.lead}</p>

			<!-- Dokploy -->
			<article id={A.dokploy.id} aria-labelledby="{A.dokploy.id}-title" class="mt-12">
				<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<h3 id="{A.dokploy.id}-title" class="text-xl font-semibold tracking-tight">{A.dokploy.title}</h3>
					<span class="text-xs font-medium text-brand-600 dark:text-brand-400">{A.dokploy.badge}</span>
				</div>
				<p class="mt-2 {text}">{A.dokploy.lead}</p>

				<ol class="mt-8 space-y-8">
					{#each A.dokploy.steps as step, i (step.title)}
						<li class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4">
							<span class="{num} mt-px" aria-hidden="true">{i + 1}</span>
							<div class="min-w-0">
								<h4 class="text-base leading-6 font-semibold">
									<span class="sr-only">{c.ui.step} {i + 1}: </span>{step.title}
								</h4>
								<p class="mt-1 {text}"><RichText text={step.text} /></p>
								{#if step.fields}
									<dl
										class="mt-4 divide-y divide-ink-200 rounded-lg border border-ink-200 text-sm dark:divide-ink-800 dark:border-ink-800"
									>
										{#each step.fields as f (f.label)}
											<div class="grid gap-1 px-4 py-2 sm:grid-cols-[8.5rem_1fr]">
												<dt class="text-ink-500 dark:text-ink-400">{f.label}</dt>
												<dd class="min-w-0 font-mono text-[13px] break-all text-ink-800 dark:text-ink-100">{f.value}</dd>
											</div>
										{/each}
									</dl>
								{/if}
								{#if step.code}
									<GuideCode sample={step.code} copyLabel={c.ui.copy} copiedLabel={c.ui.copied} class="mt-4" />
								{/if}
								{#if step.callout}
									<GuideCallout callout={step.callout} class="mt-4" />
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</article>

			<!-- Docker Compose -->
			<article id={A.compose.id} aria-labelledby="{A.compose.id}-title" class="mt-16">
				<h3 id="{A.compose.id}-title" class="text-xl font-semibold tracking-tight">{A.compose.title}</h3>
				<p class="mt-2 {text}"><RichText text={A.compose.lead} /></p>
				<GuideCode sample={A.compose.code} copyLabel={c.ui.copy} copiedLabel={c.ui.copied} class="mt-5" />
				<p class="mt-4 text-sm text-ink-500 dark:text-ink-400">{A.compose.note}</p>
				<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
					{#each A.compose.links as l (l.href)}
						<li>
							<a href="/{lang}{l.href}" class="link-arrow">
								{l.label}
								<ArrowRight class="size-3.5" aria-hidden="true" />
							</a>
						</li>
					{/each}
				</ul>
			</article>
		</section>

		<!-- Teil B: Erste Schritte -->
		<section
			id={B.id}
			aria-labelledby="{B.id}-title"
			class="mt-20 border-t border-ink-200/80 pt-14 sm:mt-24 sm:pt-16 dark:border-ink-800"
		>
			<p class="eyebrow">{B.eyebrow}</p>
			<h2 id="{B.id}-title" class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{B.title}</h2>
			<p class="mt-3 max-w-2xl {text}">{B.lead}</p>

			<ol class="mt-12 space-y-16">
				{#each B.steps as step, i (step.id)}
					{@const primary = primaryShot(step)}
					{@const more = step.shots.slice(1)}
					<li id={step.id} class="relative sm:pl-11">
						<span
							class="mb-1.5 block font-mono text-xs font-medium text-ink-400 tabular-nums sm:absolute sm:top-[0.3rem] sm:left-0 sm:mb-0 sm:text-sm dark:text-ink-500"
							aria-hidden="true">{pad(i + 1)}</span
						>
						<h3 id="{step.id}-title" class="text-xl font-semibold tracking-tight">
							<span class="sr-only">{c.ui.step} {i + 1}: </span>{step.title}
						</h3>
						<div class="mt-2">{@render clickPath(step.path)}</div>

						<div class="mt-4 space-y-3 {text}">
							{#each step.text as p (p)}
								<p><RichText text={p} /></p>
							{/each}
						</div>
						{#if step.callout}
							<GuideCallout callout={step.callout} class="mt-5" />
						{/if}
						{#if step.code}
							<GuideCode sample={step.code} copyLabel={c.ui.copy} copiedLabel={c.ui.copied} class="mt-5" />
						{/if}

						{#if primary}
							<GuideShot ref={primary} {lang} labels={shotLabels} class="mt-7" />
						{/if}

						{#if more.length}
							<ul class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={c.ui.moreShots}>
								{#each more as ref (ref.key)}
									<li><GuideShot {ref} {lang} variant="thumb" labels={shotLabels} /></li>
								{/each}
							</ul>
						{/if}

						{#if step.substeps}
							<ol class="mt-8 space-y-7">
								{#each step.substeps as sub, k (sub.title)}
									{@const thumb = sub.shot.key !== primary?.key}
									<li class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4">
										<span class="{num} mt-px" aria-hidden="true">{k + 1}</span>
										<div class="min-w-0 {thumb ? 'sm:grid sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-x-6' : ''}">
											<div class="min-w-0">
												<h4 class="text-base leading-6 font-semibold">
													<span class="sr-only">{k + 1}. </span>{sub.title}
												</h4>
												<p class="mt-1 {text}"><RichText text={sub.text} /></p>
												{#if sub.callout}
													<GuideCallout callout={sub.callout} class="mt-4" />
												{/if}
												{#if sub.note}
													<p class="mt-3 text-sm text-ink-500 dark:text-ink-400">{sub.note}</p>
												{/if}
											</div>
											{#if thumb}
												<GuideShot
													ref={sub.shot}
													{lang}
													variant="thumb"
													labels={shotLabels}
													class="mt-4 max-w-[14rem] sm:mt-1 sm:max-w-none"
												/>
											{/if}
										</div>
									</li>
								{/each}
							</ol>
						{/if}
					</li>
				{/each}
			</ol>
		</section>

		<!-- Abschluss -->
		<section
			id={c.done.id}
			aria-labelledby="{c.done.id}-title"
			class="mt-20 border-t border-ink-200/80 pt-14 sm:mt-24 sm:pt-16 dark:border-ink-800"
		>
			<h2 id="{c.done.id}-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">{c.done.title}</h2>
			<p class="mt-3 {text}">{c.done.lead}</p>
			<ul class="mt-8 grid gap-3 sm:grid-cols-2">
				{#each c.done.cards as card (card.href)}
					<li>
						<a
							href={card.external ? card.href : `/${lang}${card.href}`}
							rel={card.external ? 'noopener' : undefined}
							class="group card block h-full px-4 py-3.5 transition-colors hover:border-ink-300 dark:hover:border-ink-700"
						>
							<span class="flex items-center gap-1.5 text-sm font-medium text-ink-900 dark:text-white">
								{card.title}
								{#if card.external}
									<ArrowUpRight class="size-3.5 text-ink-400" aria-hidden="true" />
								{:else}
									<ArrowRight
										class="size-3.5 text-ink-400 transition-transform group-hover:translate-x-0.5"
										aria-hidden="true"
									/>
								{/if}
							</span>
							<span class="mt-1 block text-sm text-ink-500 dark:text-ink-400">{card.text}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>
