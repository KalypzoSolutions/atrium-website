<script lang="ts">
	import type { Lang } from '$lib/config';
	import { OPERATOR, legalHref } from '$lib/legal';

	let { lang }: { lang: Lang } = $props();
	const o = OPERATOR;
</script>

{#if lang === 'de'}
	<h2 id="anbieter">Angaben gemäß § 5 DDG</h2>
	<address class="not-italic">
		{o.name}<br />
		{o.street}<br />
		{o.zip}
		{o.city}<br />
		{o.country.de}
	</address>

	<h2 id="kontakt">Kontakt</h2>
	<p>E-Mail: <a href="mailto:{o.email}">{o.email}</a></p>

	<h2 id="projekt">Über dieses Angebot</h2>
	<p>
		Diese Website stellt das Softwareprojekt Kalypzo Atrium vor und dokumentiert es. Sie wird privat und nicht
		gewerblich betrieben. „Kalypzo“ bzw. „Kalypzo Solutions“ ist der Projektname, keine eingetragene Firma.
	</p>

	<h2 id="haftung-links">Haftung für Links</h2>
	<p>
		Diese Website enthält Links zu externen Websites Dritter, etwa zu GitHub. Auf deren Inhalte habe ich keinen
		Einfluss; für sie ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung
		waren keine Rechtsverstöße erkennbar. Werden mir Rechtsverletzungen bekannt, entferne ich die betreffenden Links
		umgehend.
	</p>

	<h2 id="urheberrecht">Urheberrecht</h2>
	<p>
		Texte, Grafiken und Screenshots dieser Website unterliegen dem deutschen Urheberrecht. Die gezeigten Daten in
		Screenshots sind fiktive Beispieldaten. Für den Quellcode von Kalypzo Atrium gelten die Angaben im
		<a href="https://github.com/KalypzoSolutions/kalypzo-atrium" rel="noopener" target="_blank">GitHub-Repository</a>.
	</p>

	<p>Informationen zur Verarbeitung personenbezogener Daten finden Sie in der <a href={legalHref('de', 'privacy')}>Datenschutzerklärung</a>.</p>
{:else}
	<p class="rounded-lg border-l-2 border-brand-400 bg-brand-50/60 px-4 py-3 text-sm dark:bg-brand-900/20">
		This is an English translation for convenience. The legally binding version is the
		<a href={legalHref('de', 'imprint')} hreflang="de">German Impressum</a>.
	</p>

	<h2 id="provider">Information pursuant to § 5 DDG (German Digital Services Act)</h2>
	<address class="not-italic">
		{o.name}<br />
		{o.street}<br />
		{o.zip}
		{o.city}<br />
		{o.country.en}
	</address>

	<h2 id="contact">Contact</h2>
	<p>Email: <a href="mailto:{o.email}">{o.email}</a></p>

	<h2 id="about">About this website</h2>
	<p>
		This website presents and documents the software project Kalypzo Atrium. It is operated privately and
		non-commercially. “Kalypzo” or “Kalypzo Solutions” is the project name, not a registered company.
	</p>

	<h2 id="links">Liability for links</h2>
	<p>
		This website contains links to third-party websites such as GitHub. I have no influence on their content; the
		respective provider or operator is always responsible for it. No legal violations were apparent at the time of
		linking. If I become aware of any, I will remove the links immediately.
	</p>

	<h2 id="copyright">Copyright</h2>
	<p>
		Texts, graphics and screenshots on this website are subject to German copyright law. Data shown in screenshots is
		fictitious sample data. The source code of Kalypzo Atrium is governed by the information in the
		<a href="https://github.com/KalypzoSolutions/kalypzo-atrium" rel="noopener" target="_blank">GitHub repository</a>.
	</p>

	<p>For information on how personal data is processed, see the <a href={legalHref('en', 'privacy')}>privacy policy</a>.</p>
{/if}
