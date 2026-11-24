import type { Lang } from '$lib/config';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => ({ lang: params.lang as Lang });
