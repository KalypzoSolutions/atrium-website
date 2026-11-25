/**
 * Kopieren eines Installationslinks mit kurzem visuellem Feedback und Meldung für Screenreader.
 * Gemeinsam genutzt von MarketCard und MarketModuleCard.
 */
export class LinkCopy {
	state = $state<'idle' | 'copied' | 'failed'>('idle');
	/** Text für die aria-live-Region */
	message = $state('');
	#timer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Kopiert `text` in die Zwischenablage. Gelingt das nicht, wird der Link im Feld `field`
	 * markiert, damit er per Tastatur kopiert werden kann.
	 */
	async copy(text: string, field: HTMLInputElement | undefined, copiedMsg: string, failedMsg: string) {
		clearTimeout(this.#timer);
		try {
			await navigator.clipboard.writeText(text);
			this.state = 'copied';
			this.message = copiedMsg;
		} catch {
			this.state = 'failed';
			this.message = failedMsg;
			field?.focus();
			field?.select();
		}
		this.#timer = setTimeout(() => {
			this.state = 'idle';
			this.message = '';
		}, 2500);
	}

	/** Laufenden Timer beenden (beim Entfernen der Komponente aufrufen). */
	destroy() {
		clearTimeout(this.#timer);
	}
}
