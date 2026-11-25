import { env } from '$env/dynamic/public';

export const SITE_URL = (env.PUBLIC_SITE_URL || 'https://atrium.kalypzo.de').replace(/\/$/, '');
export const SITE_NAME = 'Kalypzo Atrium';
export const GITHUB_REPO = 'KalypzoSolutions/kalypzo-atrium';
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
/** Link auf eine Datei im Atrium-Repository (für „Auf GitHub ansehen“). */
export const githubFile = (path: string) => `${GITHUB_URL}/blob/main/${path}`;
export const ORG_NAME = 'Kalypzo Solutions';
export const ORG_URL = 'https://github.com/KalypzoSolutions';

export const LANGS = ['de', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'de';

/** Pfad der Anleitung je Sprache (lokalisierte Slugs). */
export const GUIDE_SLUG: Record<Lang, string> = { de: 'anleitung', en: 'guide' };

/** Pfad des Modul-Marktplatzes je Sprache (lokalisierte Slugs). */
export const MARKET_SLUG: Record<Lang, string> = { de: 'marktplatz', en: 'marketplace' };

/** Absolute URL für einen sprachneutralen Pfad wie "/docs/quickstart". */
export const absUrl = (path: string) => SITE_URL + path;
