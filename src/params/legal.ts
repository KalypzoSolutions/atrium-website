import type { ParamMatcher } from '@sveltejs/kit';
export const match: ParamMatcher = (p) => ['impressum', 'datenschutz', 'legal-notice', 'privacy'].includes(p);
