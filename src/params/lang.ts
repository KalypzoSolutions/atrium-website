import type { ParamMatcher } from '@sveltejs/kit';
export const match: ParamMatcher = (p) => p === 'de' || p === 'en';
