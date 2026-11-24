// Screenshots of a running Kalypzo Atrium instance for the illustrated guide on the product website.
//
//   ATRIUM_URL=http://localhost:4310 ATRIUM_EMAIL=admin@example.org ATRIUM_PASSWORD=... \
//   OUT_DIR=static/screenshots LOCALE=both node scripts/screenshots.mjs
//
// Env:
//   ATRIUM_URL       base URL of the running app (default http://localhost:4310)
//   ATRIUM_EMAIL     admin e-mail (default admin@example.org)
//   ATRIUM_PASSWORD  admin password (required)
//   OUT_DIR          output root; files land in <OUT_DIR>/<de|en>/NN-name.webp (default ../static/screenshots)
//   LOCALE           de | en | both (default both)
//   SEED             1 = create neutral demo data through the REST API before shooting (default 1)
//   MODULE_SOURCE    GitHub link loaded in the module install preview
//                    (default https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules)
//   PREVIEW_MODULES  module ids ticked for the install-preview shot (default whiteboard)
//   INSTALL_MODULES  module ids to really install first, e.g. events,tasks,notes,files (default none).
//                    The supervisor rebuilds the app for each batch (several minutes each).
//   ONLY             comma-separated file prefixes to (re)capture, e.g. 02,03
//   TOOLS_DIR        folder whose node_modules contains `playwright` and `sharp` (default: resolve normally)
//   WEBP_QUALITY     default 82
//
// PNGs are only kept in memory; only WebP files are written to OUT_DIR.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.ATRIUM_URL || 'http://localhost:4310').replace(/\/+$/, '');
const EMAIL = process.env.ATRIUM_EMAIL || 'admin@example.org';
const PASSWORD = process.env.ATRIUM_PASSWORD;
const OUT = resolve(process.env.OUT_DIR || join(here, '..', 'static', 'screenshots'));
const LOCALES = (process.env.LOCALE || 'both') === 'both' ? ['de', 'en'] : [process.env.LOCALE];
const SEED = (process.env.SEED ?? '1') !== '0';
const QUALITY = Number(process.env.WEBP_QUALITY || 82);
const MODULE_SOURCE =
	process.env.MODULE_SOURCE ||
	'https://github.com/KalypzoSolutions/atrium-basic-modules/tree/main/modules';
const PREVIEW_MODULES = (process.env.PREVIEW_MODULES ?? 'whiteboard').split(',').filter(Boolean);
const INSTALL_MODULES = (process.env.INSTALL_MODULES ?? '').split(',').filter(Boolean);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

if (!PASSWORD) {
	console.error('ATRIUM_PASSWORD is required');
	process.exit(1);
}

async function load(name) {
	if (process.env.TOOLS_DIR) {
		const req = createRequire(join(resolve(process.env.TOOLS_DIR), 'package.json'));
		return import(pathToFileURL(req.resolve(name)).href);
	}
	return import(name);
}
const pw = await load('playwright');
const chromium = pw.chromium ?? pw.default?.chromium;
const sharpMod = await load('sharp');
const sharp = sharpMod.default ?? sharpMod;

const manifest = [];
/** true, wenn eine Aufnahme mit diesem Präfix gewünscht ist (ONLY). */
const want = (prefix) => !ONLY || ONLY.some((o) => o.startsWith(prefix) || prefix.startsWith(o));

async function save(page, locale, file, route, opts = {}) {
	if (ONLY && !ONLY.some((o) => file.startsWith(o))) return;
	await page.waitForTimeout(opts.wait ?? 600);
	// Toasts would only clutter the shot
	await page
		.evaluate(() => document.querySelectorAll('[data-sonner-toast]').forEach((t) => t.remove()))
		.catch(() => {});
	let png;
	if (opts.fullPage) {
		// Grow the viewport instead of Playwright's fullPage stitching, so the sticky sidebar stays in place
		const h = await page.evaluate(() => document.documentElement.scrollHeight);
		await page.setViewportSize({ width: 1440, height: Math.max(900, h) });
		await page.waitForTimeout(500);
		png = await page.screenshot();
		await page.setViewportSize({ width: 1440, height: 900 });
	} else png = await page.screenshot();
	const dir = join(OUT, locale);
	mkdirSync(dir, { recursive: true });
	const target = join(dir, `${file}.webp`);
	const info = await sharp(png).webp({ quality: QUALITY }).toFile(target);
	console.log(`${locale}/${file}.webp ${info.width}x${info.height}`);
	if (locale === LOCALES[0]) manifest.push({ file, width: info.width, height: info.height, route });
}

// --- Demo data (idempotent) over the real REST API --------------------------------------------
async function seed(request) {
	const api = async (method, path, data) => {
		const r = await request.fetch(`${BASE}/api/v1${path}`, {
			method,
			headers: { origin: BASE, 'content-type': 'application/json' },
			data: data ? JSON.stringify(data) : undefined
		});
		const json = await r.json().catch(() => null);
		if (r.status() >= 400) console.warn(`seed ${method} ${path}: ${r.status()} ${JSON.stringify(json)?.slice(0, 200)}`);
		return json;
	};
	await api('PUT', '/settings', {
		values: {
			'core.organization.name': 'Musterverein e. V.',
			'core.organization.address': 'Musterstraße 1\n12345 Musterstadt',
			'core.organization.email': 'kontakt@musterverein.example',
			'core.organization.phone': '+49 123 456789',
			'core.smtp.host': 'smtp.musterverein.example',
			'core.smtp.port': 587,
			'core.smtp.user': 'noreply@musterverein.example',
			'core.smtp.from': 'Musterverein <noreply@musterverein.example>',
			'core.storage.endpoint': 'https://s3.eu-central-1.example.com',
			'core.storage.region': 'eu-central-1',
			'core.storage.bucket': 'musterverein-atrium',
			'core.storage.forcePathStyle': true,
			'core.pdf.headerText': 'Musterverein e. V.',
			'core.pdf.footerText': 'Musterstraße 1 · 12345 Musterstadt'
		}
	});
	const perms = ((await api('GET', '/permissions'))?.data ?? []).map((p) => p.key);
	const has = (k) => perms.includes(k);
	const roles = (await api('GET', '/roles'))?.data ?? [];
	const roleDefs = [
		{
			name: 'Kassenwart',
			description: 'Finanzen, PDF-Export und Audit-Log einsehen',
			permissions: ['core.pdf.generate', 'core.audit.view', 'core.users.view'].filter(has)
		},
		{
			name: 'Redaktion',
			description: 'Inhalte pflegen und PDFs erzeugen',
			permissions: ['core.pdf.generate', 'core.ai.use'].filter(has)
		},
		{
			name: 'Benutzerverwaltung',
			description: 'Konten anlegen, bearbeiten und Rollen zuweisen',
			permissions: ['core.users.view', 'core.users.create', 'core.users.edit', 'core.roles.view', 'core.roles.assign'].filter(has)
		}
	];
	const ids = {};
	for (const r of roleDefs) {
		const found = roles.find((x) => x.name === r.name);
		ids[r.name] = found ? found.id : (await api('POST', '/roles', r))?.data?.id;
	}
	const usersRes = (await api('GET', '/users?pageSize=100'))?.data;
	const users = Array.isArray(usersRes) ? usersRes : (usersRes?.items ?? []);
	for (const [name, email, role] of [
		['Erika Musterfrau', 'erika.musterfrau@example.org', 'Kassenwart'],
		['Max Mustermann', 'max.mustermann@example.org', 'Redaktion'],
		['Lena Beispiel', 'lena.beispiel@example.org', 'Benutzerverwaltung'],
		['Tom Testmann', 'tom.testmann@example.org', null]
	]) {
		if (users.some((u) => u.email === email)) continue;
		await api('POST', '/users', {
			name,
			email,
			password: 'Demo-Passwort-2026!',
			roleIds: role && ids[role] ? [ids[role]] : []
		});
	}
	const keys = (await api('GET', '/api-keys'))?.data ?? [];
	if (!keys.some((k) => k.name === 'Website (lesend)')) {
		await api('POST', '/api-keys', {
			name: 'Website (lesend)',
			scopes: ['core.users.view'].filter(has),
			expiresAt: new Date(Date.now() + 180 * 864e5).toISOString()
		});
	}
}

// --- Session -----------------------------------------------------------------------------------
const L = (locale, de, en) => (locale === 'de' ? de : en);

async function openSession(browser, locale, { shotLogin = false, login = true } = {}) {
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 1,
		colorScheme: 'light',
		locale: L(locale, 'de-DE', 'en-US'),
		timezoneId: 'Europe/Berlin',
		extraHTTPHeaders: { 'Accept-Language': L(locale, 'de-DE,de;q=0.9', 'en-US,en;q=0.9') }
	});
	// UI language: account setting (core.user.locale, left unset) > cookie `locale` > Accept-Language
	await context.addCookies([{ name: 'locale', value: locale, url: BASE }]);
	await context.addInitScript(() => {
		try {
			localStorage.setItem('mode-watcher-mode', 'light');
		} catch {}
	});
	const page = await context.newPage();
	const go = async (path) => {
		await page.goto(BASE + path);
		await page.waitForLoadState('networkidle').catch(() => {});
	};
	if (!login) return { context, page, go };
	await go('/login');
	if (shotLogin) await save(page, locale, '01-login', '/login');
	await page.locator('input[name="email"]').fill(EMAIL);
	await page.locator('input[name="password"]').fill(PASSWORD);
	await page.locator('form button[type="submit"]').first().click();
	await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 });
	return { context, page, go };
}

async function loadSource(page, locale) {
	await page.locator('input[type="url"], input[name="url"]').first().fill(MODULE_SOURCE);
	await page.getByRole('button', { name: L(locale, 'Quelle laden', 'Load source') }).click();
	await page
		.getByRole('button', { name: L(locale, 'Vorschau anzeigen', 'Show preview') })
		.waitFor({ timeout: 90_000 });
}

async function previewModules(page, locale, ids) {
	for (const id of ids) await page.locator(`#sel-${id}`).click();
	await page.getByRole('button', { name: L(locale, 'Vorschau anzeigen', 'Show preview') }).click();
	await page.locator('#install-accept').waitFor({ timeout: 120_000 });
}

// Optional: really install modules (the supervisor rebuilds and restarts the app, takes minutes).
// Captures the rebuild progress as 04d-module-install-progress in the given locale.
async function installModules(browser, locale, ids) {
	if (!ids.length) return;
	const { context, page, go } = await openSession(browser, locale);
	await go('/admin/modules/install');
	await loadSource(page, locale);
	await previewModules(page, locale, ids);
	await page.locator('#install-accept').click();
	await page.locator('#install-password').fill(PASSWORD);
	await page
		.getByRole('button', { name: L(locale, 'Installieren', 'Install'), exact: true })
		.last()
		.click();
	await page.waitForTimeout(10_000);
	await save(page, locale, '04d-module-install-progress', '/admin/modules/install', { fullPage: true });
	const deadline = Date.now() + 30 * 60_000;
	for (;;) {
		if (Date.now() > deadline) throw new Error('module build timed out');
		await new Promise((r) => setTimeout(r, 10_000));
		const done = await page
			.getByRole('link', { name: L(locale, 'Zu den installierten Modulen', 'Go to installed modules') })
			.isVisible()
			.catch(() => false);
		if (done) break;
	}
	console.log(`installed modules: ${ids.join(', ')}`);
	await context.close();
}

// --- Shots --------------------------------------------------------------------------------------
async function shoot(browser, locale) {
	const { context, page, go } = await openSession(browser, locale, { shotLogin: true });

	await go('/dashboard');
	await save(page, locale, '02-dashboard', '/dashboard');

	await go('/admin');
	await save(page, locale, '02b-admin-overview', '/admin');

	await go('/admin/modules');
	await save(page, locale, '03-modules', '/admin/modules');

	await go('/admin/modules/install');
	await save(page, locale, '04-module-install', '/admin/modules/install');
	if (want('04b') || want('04c')) try {
		await loadSource(page, locale);
		await save(page, locale, '04b-module-install-select', '/admin/modules/install', { fullPage: true });
		if (PREVIEW_MODULES.length) {
			await previewModules(page, locale, PREVIEW_MODULES);
			await save(page, locale, '04c-module-install-preview', '/admin/modules/install', { fullPage: true });
		}
	} catch (e) {
		console.warn(`module source preview failed: ${e.message}`);
	}

	await go('/admin/settings/general');
	await save(page, locale, '05-settings', '/admin/settings/general');
	await go('/admin/settings/mail');
	await save(page, locale, '06-settings-mail', '/admin/settings/mail', { fullPage: true });
	await go('/admin/settings/storage');
	await save(page, locale, '07-settings-storage', '/admin/settings/storage', { fullPage: true });
	await go('/admin/settings/pdf');
	await save(page, locale, '08-settings-pdf', '/admin/settings/pdf');

	await go('/admin/users');
	await save(page, locale, '09-users', '/admin/users');
	await go('/admin/roles');
	await save(page, locale, '10-roles', '/admin/roles');
	try {
		await page
			.getByText('Kassenwart', { exact: true })
			.first()
			.locator('xpath=ancestor::*[.//button][1]')
			.getByRole('button', { name: L(locale, 'Bearbeiten', 'Edit') })
			.click();
		await page.getByRole('dialog').waitFor();
		await save(page, locale, '10b-role-edit', '/admin/roles');
		await page.keyboard.press('Escape');
	} catch (e) {
		console.warn(`role dialog failed: ${e.message}`);
	}

	await go('/admin/api');
	await save(page, locale, '11-api-keys', '/admin/api');
	try {
		await page.getByRole('button', { name: L(locale, 'API-Key erstellen', 'Create API key') }).first().click();
		const dlg = page.getByRole('dialog');
		await dlg.waitFor();
		await dlg.locator('input').first().fill(L(locale, 'Buchhaltung-Export', 'Accounting export'));
		await save(page, locale, '11b-api-key-create', '/admin/api');
		await page.keyboard.press('Escape');
	} catch (e) {
		console.warn(`api key dialog failed: ${e.message}`);
	}

	await go('/profile?tab=security');
	await save(page, locale, '12-2fa', '/profile?tab=security');
	if (want('12b')) try {
		await page.getByRole('button', { name: L(locale, 'Aktivieren', 'Turn on'), exact: true }).first().click();
		const dlg = page.getByRole('dialog');
		await dlg.waitFor();
		await dlg.locator('input[type="password"]').fill(PASSWORD);
		await dlg.getByRole('button', { name: L(locale, 'Weiter', 'Next') }).click();
		await dlg.locator('img').first().waitFor({ timeout: 15_000 });
		await save(page, locale, '12b-2fa-setup', '/profile?tab=security');
		// cancelled before a code is entered: 2FA stays off
		await page.keyboard.press('Escape');
	} catch (e) {
		console.warn(`2fa dialog failed: ${e.message}`);
	}

	await go('/admin/audit');
	await save(page, locale, '13-audit-log', '/admin/audit');
	await go('/admin/backup');
	await save(page, locale, '14-backup', '/admin/backup');

	await go('/dashboard');
	await page.keyboard.press('Control+k');
	await page.keyboard.type('Muster', { delay: 40 });
	await page.waitForTimeout(1500);
	await save(page, locale, '15-search', '/dashboard (Ctrl+K)');
	await page.keyboard.press('Escape');

	await go('/admin/api/docs');
	await save(page, locale, '16-api-docs', '/admin/api/docs', { wait: 1500 });

	// --- Additional shots for the documentation (17+) ---------------------------------------
	await go('/admin/settings/design');
	await save(page, locale, '17-settings-design', '/admin/settings/design', { fullPage: true });
	await go('/admin/settings/mail-layout');
	await save(page, locale, '18-settings-mail-layout', '/admin/settings/mail-layout', { fullPage: true, wait: 1500 });
	await go('/admin/settings/notifications');
	await save(page, locale, '19-settings-notifications', '/admin/settings/notifications', { fullPage: true });
	await go('/admin/settings/ai');
	await save(page, locale, '20-settings-ai', '/admin/settings/ai', { fullPage: true });
	await go('/admin/settings/modules');
	await save(page, locale, '21-settings-modules', '/admin/settings/modules');
	await go('/admin/modules/history');
	await save(page, locale, '22-module-history', '/admin/modules/history');
	await go('/admin/roles/permissions');
	await save(page, locale, '23-permissions', '/admin/roles/permissions');
	await go('/admin/privacy?q=Muster');
	await save(page, locale, '24-privacy', '/admin/privacy');
	await go('/admin/reset');
	// step 1 only – nothing is selected or executed
	await save(page, locale, '25-reset', '/admin/reset', { fullPage: true });

	try {
		const r = await page.request.fetch(`${BASE}/api/v1/users?search=erika&limit=5`);
		const j = await r.json();
		const list = Array.isArray(j?.data) ? j.data : (j?.data?.items ?? []);
		const erika = list.find((u) => u.email === 'erika.musterfrau@example.org');
		if (erika) {
			await go(`/admin/users/${erika.id}`);
			await save(page, locale, '26-user-detail', '/admin/users/<id>', { wait: 1200 });
			await go(`/admin/users/${erika.id}?tab=security`);
			await save(page, locale, '26b-user-security', '/admin/users/<id>?tab=security', { fullPage: true });
		} else console.warn('demo user not found for 26-user-detail');
	} catch (e) {
		console.warn(`user detail failed: ${e.message}`);
	}
	try {
		await go('/admin/users');
		await page.getByRole('button', { name: L(locale, 'Benutzer anlegen', 'Create user') }).first().click();
		await page.getByRole('dialog').waitFor();
		await save(page, locale, '26c-user-create', '/admin/users');
		await page.keyboard.press('Escape');
	} catch (e) {
		console.warn(`user create dialog failed: ${e.message}`);
	}

	await go('/profile');
	await save(page, locale, '28-profile', '/profile');
	// headless Chromium denies notifications by default ("blocked in the browser")
	await context.grantPermissions(['notifications'], { origin: BASE }).catch(() => {});
	await go('/profile?tab=notifications');
	await save(page, locale, '29-profile-notifications', '/profile?tab=notifications', { fullPage: true });
	await go('/profile?tab=appearance');
	await save(page, locale, '29b-profile-appearance', '/profile?tab=appearance', { fullPage: true });

	try {
		await go('/dashboard');
		await page.getByRole('button', { name: L(locale, 'Anpassen', 'Customize') }).first().click();
		await page.getByRole('dialog').waitFor();
		await save(page, locale, '30-dashboard-customize', '/dashboard', { wait: 900 });
		await page.keyboard.press('Escape');
	} catch (e) {
		console.warn(`dashboard customize failed: ${e.message}`);
	}

	await go('/admin/backup?tab=import');
	await save(page, locale, '31-backup-import', '/admin/backup?tab=import');

	await context.close();

	// Logged out: password reset request page
	const anon = await openSession(browser, locale, { login: false });
	await anon.go('/forgot-password');
	await save(anon.page, locale, '27-forgot-password', '/forgot-password');
	await anon.context.close();
}

// One browser per UI language so native controls (date inputs, file picker) match it
const browsers = {};
const browserFor = async (locale) =>
	(browsers[locale] ??= await chromium.launch({ args: [`--lang=${L(locale, 'de-DE', 'en-US')}`] }));
const browser = {
	newContext: async (o) => (await browserFor(o.locale.slice(0, 2))).newContext(o),
	close: async () => Promise.all(Object.values(browsers).map((b) => b.close()))
};
try {
	if (SEED) {
		const { context, page } = await openSession(browser, LOCALES[0]);
		await seed(page.request);
		await context.close();
	}
	// INSTALL_MODULES: with both locales the first installs all but the last module and the second the
	// last one, so the rebuild-progress shot exists in both languages.
	if (INSTALL_MODULES.length) {
		if (LOCALES.length > 1 && INSTALL_MODULES.length > 1) {
			await installModules(browser, LOCALES[0], INSTALL_MODULES.slice(0, -1));
			await installModules(browser, LOCALES[1], INSTALL_MODULES.slice(-1));
		} else await installModules(browser, LOCALES[0], INSTALL_MODULES);
	}
	for (const locale of LOCALES) await shoot(browser, locale);
} finally {
	await browser.close();
}
if (process.env.WRITE_MANIFEST === '1') {
	writeFileSync(join(OUT, 'manifest.raw.json'), JSON.stringify(manifest, null, '\t'));
}
