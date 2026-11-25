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
		marketplace: 'Marketplace',
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
	},
	market: {
		meta: {
			title: 'Module marketplace for Kalypzo Atrium',
			description:
				'Find module sources for Kalypzo Atrium: events, files, members, treasury and more. Copy the GitHub link and install it in your instance under Administration → Modules.'
		},
		eyebrow: 'Marketplace',
		title: 'Modules for your Atrium instance',
		lead: 'Module sources from GitHub repositories – official ones by Kalypzo Solutions or from the community. Copy the link, paste it into Atrium, review the preview and install.',
		stats: (sources: number, modules: number) =>
			`${sources} ${sources === 1 ? 'source' : 'sources'} · ${modules} ${modules === 1 ? 'module' : 'modules'}`,
		registry: 'JSON registry for Atrium instances',
		registryHint: 'The same list in machine-readable form – for Atrium instances and your own tools.',
		listTitle: 'Module sources',
		discover: 'Discover modules in the marketplace',
		filters: {
			label: 'Filter sources',
			search: 'Search sources',
			placeholder: 'Name, module, tag or publisher …',
			clear: 'Clear search',
			categories: 'Categories',
			all: 'All',
			official: 'Official only',
			results: (n: number, total: number) =>
				n === total ? `${total} ${total === 1 ? 'source' : 'sources'}` : `${n} of ${total} sources`,
			reset: 'Reset filters',
			view: 'View',
			viewSources: 'Packages',
			viewModules: 'Individual modules',
			labelModules: 'Filter modules',
			searchModules: 'Search modules',
			placeholderModules: 'Module name, feature, source or publisher …',
			resultsModules: (n: number, total: number) =>
				n === total
					? `${total} ${total === 1 ? 'module' : 'modules'}`
					: `${n} of ${total} ${total === 1 ? 'module' : 'modules'}`
		},
		categories: {
			core: 'Core',
			organisation: 'Organisation',
			communication: 'Communication',
			finance: 'Finance',
			files: 'Files',
			productivity: 'Productivity',
			integration: 'Integration',
			other: 'Other'
		},
		card: {
			official: 'Official',
			officialHint: 'Published by Kalypzo Solutions',
			by: 'by',
			categories: 'Categories',
			tags: 'Tags',
			modules: (n: number) => `Included modules (${n})`,
			license: 'License',
			noLicense: 'No license specified',
			source: 'Install link',
			sourceLabel: (name: string) => `Install link of ${name}`,
			github: 'GitHub',
			githubLabel: (name: string) => `Open ${name} on GitHub`,
			homepage: 'Website',
			copy: 'Copy link',
			copied: 'Copied',
			copyLabel: (name: string) => `Copy install link of ${name}`,
			copiedMsg: (name: string) => `Install link of ${name} copied to the clipboard.`,
			copyFailed: 'Copying is not possible – the link in the field is selected, please copy it manually (e.g. with Ctrl+C).'
		},
		moduleCard: {
			fromSource: 'from package',
			showSource: (name: string) => `Show package ${name}`,
			sourceLabel: (name: string) => `Install link of the module ${name}`,
			githubLabel: (name: string) => `Open the folder of the module ${name} on GitHub`,
			copyLabel: (name: string) => `Copy install link of the module ${name}`,
			copiedMsg: (name: string) => `Install link of the module ${name} copied to the clipboard.`
		},
		empty: {
			title: 'No matching sources',
			text: 'Try a different search term or reset the filters.'
		},
		emptyModules: {
			title: 'No matching modules',
			text: 'Try a different search term or reset the filters.'
		},
		install: {
			eyebrow: 'Installation',
			title: 'Install in Atrium',
			lead: 'You install in your own instance – the marketplace only provides the link.',
			steps: [
				{ title: 'Copy the link', text: 'Click “Copy link” on the source you want.' },
				{
					title: 'Load the source',
					text: 'In Atrium, open Administration → Modules → Install, paste the link and click “Load source”.'
				},
				{
					title: 'Review the preview & install',
					text: 'Select the modules, review the preview with version, dependencies and commit, install and enable them after the rebuild.'
				}
			],
			docsManagement: 'Managing modules',
			docsMarket: 'Marketplace & registry'
		},
		security: {
			title: 'Security notice',
			text: 'Being listed in the marketplace is not a security review. After installation, module code runs with full privileges in the server process, without a sandbox. Review every source and only install modules you trust.'
		},
		submit: {
			title: 'List your own module',
			text: 'Do you maintain a module source for Atrium? Add it to src/lib/marketplace.ts and open a pull request in the website repository.',
			cta: 'List your own module',
			docs: 'How to list a module'
		}
	}
};
