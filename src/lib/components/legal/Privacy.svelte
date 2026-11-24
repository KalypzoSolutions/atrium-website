<script lang="ts">
	import type { Lang } from '$lib/config';
	import { AUTHORITY, HOSTER, OPERATOR, legalHref } from '$lib/legal';

	let { lang }: { lang: Lang } = $props();
	const o = OPERATOR;
	const h = HOSTER;
	const a = AUTHORITY;
</script>

{#if lang === 'de'}
	<h2 id="ueberblick">Auf einen Blick</h2>
	<p>
		Diese Website setzt <strong>keine Cookies</strong>, verwendet <strong>kein Tracking und keine Analyse-Tools</strong> und
		lädt <strong>keine Inhalte von Drittanbietern</strong> (keine externen Schriftarten, Skripte, Videos oder Karten).
		Verarbeitet werden nur die Daten, die für die Auslieferung der Seiten technisch nötig sind, sowie Ihre Angaben, wenn
		Sie mir eine E-Mail schreiben.
	</p>

	<h2 id="verantwortlicher">1. Verantwortlicher</h2>
	<p>Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
	<address class="not-italic">
		{o.name}<br />
		{o.street}<br />
		{o.zip}
		{o.city}<br />
		E-Mail: <a href="mailto:{o.email}">{o.email}</a>
	</address>
	<p>Ein Datenschutzbeauftragter ist nicht bestellt, da hierzu keine gesetzliche Pflicht besteht.</p>

	<h2 id="hosting">2. Hosting</h2>
	<p>
		Die Website wird auf einem Server der {h.name}, {h.street}, {h.zip}
		{h.city}, gehostet. Der Server steht in einem Rechenzentrum in Deutschland oder Finnland, also innerhalb der
		Europäischen Union. Hetzner verarbeitet die beim Aufruf anfallenden Daten ausschließlich in meinem Auftrag und nach
		meinen Weisungen; mit Hetzner besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO. Weitere
		Informationen: <a href={h.privacyUrl} rel="noopener" target="_blank">Datenschutzerklärung von Hetzner</a>.
	</p>

	<h2 id="server-logfiles">3. Aufruf der Website und Server-Protokolle</h2>
	<p>
		Beim Aufruf einer Seite übermittelt Ihr Browser technisch bedingt Daten an den Server. Damit die Website
		ausgeliefert werden kann, wird Ihre IP-Adresse kurzzeitig im Arbeitsspeicher verarbeitet. In Zugriffsprotokollen
		werden gespeichert:
	</p>
	<ul>
		<li>die <strong>gekürzte</strong> IP-Adresse (bei IPv4 wird das letzte Oktett durch 0 ersetzt, bei IPv6 werden nur die ersten drei Blöcke gespeichert), sodass kein Rückschluss auf Ihren Anschluss möglich ist,</li>
		<li>Datum und Uhrzeit des Zugriffs,</li>
		<li>die aufgerufene Seite bzw. Datei, der HTTP-Statuscode und die übertragene Datenmenge,</li>
		<li>die Kennung des Browsers (User-Agent).</li>
	</ul>
	<p>
		Die Verarbeitung dient dem sicheren und stabilen Betrieb der Website, etwa um Fehler und Angriffe zu erkennen.
		Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; mein berechtigtes Interesse liegt in der technischen
		Bereitstellung und Sicherheit der Website. Die Protokolle werden fortlaufend rotiert, ältere Einträge werden dabei
		automatisch gelöscht. Eine Zusammenführung mit anderen Datenquellen oder eine Auswertung zu Werbezwecken findet
		nicht statt.
	</p>

	<h2 id="verschluesselung">4. SSL-/TLS-Verschlüsselung</h2>
	<p>
		Die Website wird ausschließlich über HTTPS ausgeliefert. Sie erkennen die verschlüsselte Verbindung an „https://“
		und dem Schloss-Symbol in der Adresszeile Ihres Browsers.
	</p>

	<h2 id="lokale-speicherung">5. Keine Cookies – lokale Speicherung der Farbeinstellung</h2>
	<p>
		Es werden keine Cookies gesetzt. Wenn Sie über den Schalter in der Kopfzeile zwischen hellem und dunklem
		Farbschema wechseln, speichert die Website Ihre Wahl („light“ oder „dark“) im lokalen Speicher Ihres Browsers
		(<code>localStorage</code>, Schlüssel <code>theme</code>). Dieser Wert verlässt Ihr Gerät nicht und wird nicht an
		den Server übertragen. Die Speicherung ist für die von Ihnen ausdrücklich gewünschte Funktion unbedingt
		erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können den Eintrag jederzeit über die Einstellungen Ihres Browsers
		löschen.
	</p>
	<p>
		Die Suchfunktion der Dokumentation läuft vollständig in Ihrem Browser; Suchbegriffe werden nicht an den Server
		gesendet oder gespeichert.
	</p>

	<h2 id="kontakt">6. Kontakt per E-Mail</h2>
	<p>
		Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre E-Mail-Adresse, Ihren Namen (falls angegeben) und den
		Inhalt Ihrer Nachricht, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
		Interesse an der Beantwortung von Anfragen) bzw. Art. 6 Abs. 1 lit. b DSGVO, wenn Ihre Anfrage auf einen Vertrag
		gerichtet ist. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und keine gesetzlichen
		Aufbewahrungspflichten entgegenstehen.
	</p>

	<h2 id="externe-links">7. Links zu anderen Websites (GitHub)</h2>
	<p>
		Die Website verlinkt auf GitHub, einen Dienst der GitHub, Inc. (USA). Die Links sind einfache Verweise; es werden
		keine Inhalte von GitHub eingebunden und beim Aufruf dieser Website keine Daten an GitHub übertragen. Erst wenn Sie
		einen Link anklicken, gelangen Sie auf die Website von GitHub, für die deren
		<a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener" target="_blank">Datenschutzerklärung</a>
		gilt.
	</p>

	<h2 id="rechte">8. Ihre Rechte</h2>
	<p>Sie haben gegenüber mir folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
	<ul>
		<li>Auskunft (Art. 15 DSGVO),</li>
		<li>Berichtigung (Art. 16 DSGVO),</li>
		<li>Löschung (Art. 17 DSGVO),</li>
		<li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
		<li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
		<li>
			<strong>Widerspruch</strong> gegen Verarbeitungen, die auf Art. 6 Abs. 1 lit. f DSGVO beruhen, aus Gründen, die
			sich aus Ihrer besonderen Situation ergeben (Art. 21 DSGVO).
		</li>
	</ul>
	<p>Eine formlose Nachricht an <a href="mailto:{o.email}">{o.email}</a> genügt.</p>

	<h2 id="beschwerde">9. Beschwerderecht bei der Aufsichtsbehörde</h2>
	<p>
		Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig für mich
		ist:
	</p>
	<address class="not-italic">
		{a.name}<br />
		{a.street}<br />
		{a.zip}
		{a.city}<br />
		<a href={a.url} rel="noopener" target="_blank">{a.url.replace('https://', '')}</a>
	</address>

	<h2 id="pflicht">10. Pflicht zur Bereitstellung, automatisierte Entscheidungen</h2>
	<p>
		Sie sind nicht verpflichtet, personenbezogene Daten bereitzustellen; ohne die technisch nötigen Verbindungsdaten
		kann die Website jedoch nicht angezeigt werden. Eine automatisierte Entscheidungsfindung einschließlich Profiling
		(Art. 22 DSGVO) findet nicht statt.
	</p>

	<h2 id="aenderungen">11. Änderungen</h2>
	<p>
		Ich passe diese Datenschutzerklärung an, wenn sich die Website oder die Rechtslage ändert. Es gilt die jeweils hier
		veröffentlichte Fassung. Siehe auch das <a href={legalHref('de', 'imprint')}>Impressum</a>.
	</p>
{:else}
	<p class="rounded-lg border-l-2 border-brand-400 bg-brand-50/60 px-4 py-3 text-sm dark:bg-brand-900/20">
		This is an English translation for convenience. The legally binding version is the
		<a href={legalHref('de', 'privacy')} hreflang="de">German Datenschutzerklärung</a>.
	</p>

	<h2 id="summary">Summary</h2>
	<p>
		This website sets <strong>no cookies</strong>, uses <strong>no tracking or analytics</strong> and loads
		<strong>no third-party content</strong> (no external fonts, scripts, videos or maps). Only the data technically required
		to deliver the pages is processed, plus your details if you send me an email.
	</p>

	<h2 id="controller">1. Controller</h2>
	<p>The controller for data processing on this website within the meaning of the GDPR is:</p>
	<address class="not-italic">
		{o.name}<br />
		{o.street}<br />
		{o.zip}
		{o.city}, {o.country.en}<br />
		Email: <a href="mailto:{o.email}">{o.email}</a>
	</address>
	<p>No data protection officer has been appointed, as there is no legal obligation to do so.</p>

	<h2 id="hosting">2. Hosting</h2>
	<p>
		The website is hosted on a server of {h.name}, {h.street}, {h.zip}
		{h.city}, Germany, in a data centre within the European Union (Germany or Finland). Hetzner processes the data
		arising from page requests solely on my behalf and according to my instructions; a data processing agreement
		pursuant to Art. 28 GDPR is in place. More information:
		<a href={h.privacyUrl} rel="noopener" target="_blank">Hetzner privacy policy</a>.
	</p>

	<h2 id="server-logs">3. Visiting the website and server logs</h2>
	<p>
		When you request a page, your browser necessarily transmits data to the server. Your IP address is briefly processed
		in memory so that the page can be delivered. The access logs store:
	</p>
	<ul>
		<li>the <strong>truncated</strong> IP address (for IPv4 the last octet is replaced by 0, for IPv6 only the first three blocks are kept), so it cannot be traced back to your connection,</li>
		<li>date and time of the request,</li>
		<li>the requested page or file, the HTTP status code and the amount of data transferred,</li>
		<li>the browser identification (user agent).</li>
	</ul>
	<p>
		This serves the secure and stable operation of the website, e.g. to detect errors and attacks. The legal basis is
		Art. 6(1)(f) GDPR; my legitimate interest is the technical provision and security of the website. The logs are
		rotated continuously and older entries are deleted automatically. They are not combined with other data sources or
		used for advertising.
	</p>

	<h2 id="encryption">4. SSL/TLS encryption</h2>
	<p>The website is served exclusively via HTTPS, recognisable by “https://” and the lock icon in your browser.</p>

	<h2 id="local-storage">5. No cookies – local storage of the colour scheme</h2>
	<p>
		No cookies are set. If you switch between the light and dark colour scheme using the toggle in the header, the
		website stores your choice (“light” or “dark”) in your browser’s local storage (<code>localStorage</code>, key
		<code>theme</code>). This value never leaves your device and is not sent to the server. Storing it is strictly
		necessary for the function you explicitly requested (§ 25(2) no. 2 TDDDG). You can delete it at any time in your
		browser settings.
	</p>
	<p>The documentation search runs entirely in your browser; search terms are not sent to or stored on the server.</p>

	<h2 id="contact">6. Contact by email</h2>
	<p>
		If you email me, I process your email address, your name (if provided) and the content of your message in order to
		answer your enquiry. The legal basis is Art. 6(1)(f) GDPR (legitimate interest in answering enquiries) or Art.
		6(1)(b) GDPR if your enquiry relates to a contract. The data is deleted once your enquiry has been fully dealt with
		and no statutory retention obligations apply.
	</p>

	<h2 id="external-links">7. Links to other websites (GitHub)</h2>
	<p>
		The website links to GitHub, a service of GitHub, Inc. (USA). These are plain links; no GitHub content is embedded
		and no data is sent to GitHub when you visit this website. Only when you click a link are you taken to GitHub,
		where GitHub’s
		<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener" target="_blank">privacy statement</a>
		applies.
	</p>

	<h2 id="rights">8. Your rights</h2>
	<p>You have the following rights regarding your personal data:</p>
	<ul>
		<li>access (Art. 15 GDPR),</li>
		<li>rectification (Art. 16 GDPR),</li>
		<li>erasure (Art. 17 GDPR),</li>
		<li>restriction of processing (Art. 18 GDPR),</li>
		<li>data portability (Art. 20 GDPR),</li>
		<li>
			<strong>objection</strong> to processing based on Art. 6(1)(f) GDPR on grounds relating to your particular
			situation (Art. 21 GDPR).
		</li>
	</ul>
	<p>An informal message to <a href="mailto:{o.email}">{o.email}</a> is sufficient.</p>

	<h2 id="complaint">9. Right to lodge a complaint</h2>
	<p>You have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR). The competent authority is:</p>
	<address class="not-italic">
		{a.name}<br />
		{a.street}<br />
		{a.zip}
		{a.city}, Germany<br />
		<a href={a.url} rel="noopener" target="_blank">{a.url.replace('https://', '')}</a>
	</address>

	<h2 id="obligation">10. Obligation to provide data, automated decisions</h2>
	<p>
		You are not obliged to provide personal data; however, the website cannot be displayed without the technically
		necessary connection data. No automated decision-making including profiling (Art. 22 GDPR) takes place.
	</p>

	<h2 id="changes">11. Changes</h2>
	<p>
		I update this privacy policy when the website or the legal situation changes. The version published here applies.
		See also the <a href={legalHref('en', 'imprint')}>legal notice</a>.
	</p>
{/if}
