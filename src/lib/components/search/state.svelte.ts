/** Gemeinsamer Zustand der Suche: Header, Doku-Seitenleiste und Tastenkürzel öffnen denselben Dialog. */
export const searchUi = $state({ open: false });

export function openSearch() {
	searchUi.open = true;
}

/** Ob das Gerät ein Mac ist (für den Hinweis ⌘K statt Strg K); erst im Browser bekannt. */
// Wird nach dem Hydrieren im Header gesetzt, damit Server- und Client-HTML übereinstimmen.
export const platform = $state({ mac: false });

export const detectMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
