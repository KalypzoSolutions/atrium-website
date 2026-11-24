import type { Handle } from '@sveltejs/kit';

/** Setzt <html lang> passend zum Routen-Präfix (/de, /en). */
export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.url.pathname.startsWith('/en') ? 'en' : 'de';
	return resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', lang) });
};
