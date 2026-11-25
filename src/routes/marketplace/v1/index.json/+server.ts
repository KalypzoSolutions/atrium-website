import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { marketRegistry, marketSources, validateSources } from '$lib/marketplace';

export const prerender = true;

/**
 * Öffentliche Registry des Modul-Marktplatzes (/marketplace/v1/index.json).
 *
 * Atrium-Instanzen rufen diese Datei ab, um die hier gelisteten Modulquellen (GitHub-Links)
 * zur Installation anzubieten. Die Datei wird beim Build statisch erzeugt und von nginx mit
 * CORS-Headern ausgeliefert.
 *
 * Kompatibilität: `schema` darf nur bei inkompatiblen Änderungen erhöht werden (dann unter
 * neuem Pfad, z. B. /marketplace/v2/). Neue Felder dürfen jederzeit ergänzt werden – Clients
 * müssen unbekannte Felder ignorieren.
 */
export const GET: RequestHandler = () => {
	// Erneut prüfen, damit ein fehlerhafter Eintrag den Build sicher abbricht.
	validateSources(marketSources);
	return json(marketRegistry(), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
};
