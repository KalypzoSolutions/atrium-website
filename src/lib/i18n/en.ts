import type { de } from './de';

export const en: typeof de = {
	meta: {
		title: 'Kalypzo Atrium – modular, self-hosted administration platform',
		description:
			'Kalypzo Atrium is a modular administration platform you host yourself: 2FA, roles & permissions, REST API, PDF, AI and S3. Install feature modules from a GitHub link or ZIP. Up and running in minutes with Docker or Dokploy.'
	},
	nav: {
		features: 'Features',
		modules: 'Modules',
		docs: 'Documentation',
		quickstart: 'Quick start',
		guide: 'Guide',
		github: 'GitHub',
		skip: 'Skip to content',
		menu: 'Menu',
		close: 'Close',
		theme: 'Toggle color scheme',
		language: 'Language',
		switchTo: 'Deutsch'
	},
	footer: {
		tagline: 'Modular administration platform you host yourself.',
		product: 'Product',
		resources: 'Resources',
		community: 'Community',
		source: 'Source code',
		issues: 'Report issues',
		releases: 'Releases',
		rights: 'Private, non-commercial project.',
		legal: 'Legal',
		imprint: 'Legal notice',
		privacy: 'Privacy'
	},
	docs: {
		title: 'Documentation',
		onThisPage: 'On this page',
		editOnGithub: 'View source on GitHub',
		prev: 'Previous',
		next: 'Next',
		home: 'Home',
		navigation: 'Navigation',
		openNav: 'Open navigation',
		closeNav: 'Close navigation',
		sectionsLabel: 'Documentation sections',
		pages: 'Pages'
	},
	search: {
		label: 'Search',
		open: 'Open search',
		docs: 'Search documentation',
		placeholder: 'Search documentation …',
		loading: 'Loading search index …',
		error: 'The search index could not be loaded.',
		retry: 'Try again',
		noResults: 'No results for',
		noResultsHint: 'Check the spelling or try a more general term.',
		suggestions: 'Popular',
		results: 'Search results',
		count: (n: number) => (n === 1 ? '1 result' : `${n} results`),
		navigate: 'Select',
		select: 'Open',
		close: 'Close',
		clear: 'Clear input',
		ctrl: 'Ctrl'
	},
	common: {
		copy: 'Copy',
		copied: 'Copied',
		backHome: 'Back to home',
		notFound: 'Page not found',
		notFoundText: 'The page you requested does not exist or has moved.',
		enlarge: 'Enlarge',
		starOnGithub: 'View on GitHub'
	}
};
