import type { ParamMatcher } from '@sveltejs/kit';

/** Lokalisierter Slug des Modul-Marktplatzes: /de/marktplatz bzw. /en/marketplace. */
export const match: ParamMatcher = (p) => p === 'marktplatz' || p === 'marketplace';
