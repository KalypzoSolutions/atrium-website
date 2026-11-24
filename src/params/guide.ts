import type { ParamMatcher } from '@sveltejs/kit';

/** Lokalisierter Slug der Anleitung: /de/anleitung bzw. /en/guide. */
export const match: ParamMatcher = (p) => p === 'anleitung' || p === 'guide';
