---
title: First steps after installation
description: The first things to do in a fresh installation: sign in, change the password, set up 2FA and configure your organization.
order: 10
section: Administration
source: docs/deployment.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

This page walks you through the first minutes in a freshly installed Atrium instance – from the first sign-in to a configured organization. It assumes Atrium is running, for example after the [quick start](/en/docs/quickstart), the [Docker Compose installation](/en/docs/installation) or the [Dokploy deployment](/en/docs/dokploy).

## The first administrator

Atrium has **no self-registration**. The first account is created at startup from the environment variables `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` (password at least 12 characters) – but only as long as no administrator exists yet. You create all further accounts in the interface.

> **Important:** Remove `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from the `.env` file or the Dokploy environment after the first start. Otherwise the password stays visible in the container environment.

## Signing in

Open `https://<your-domain>/login` and sign in with your email and password. If two-factor authentication is enabled, Atrium then asks for the 6-digit code from your authenticator app.

<DocShot name="01-login" lang="en" caption="The sign-in page with email and password, plus the QR code for signing in via a phone that is already signed in." />

Further options on the sign-in page:

- **Sign in with your phone:** scan the QR code with a phone where you are already signed in and confirm there. The code renews itself regularly; only confirm if you are sitting in front of the other device yourself.
- **Language:** switch between Deutsch and English at the bottom of the page.
- **Forgot password?** requests a reset link by email (see below).

After signing in you land on the [dashboard](/en/docs/search-dashboard). The navigation is on the left; global search (<kbd>Ctrl</kbd>+<kbd>K</kbd>), the light/dark toggle and the user menu are at the top.

## Changing your password

Change the initial password right after the first sign-in: **user menu → Profile → Security → Password**. The new password must be 12 to 128 characters long. **End all other sessions** signs out all other devices at the same time.

If an administrator set your password and chose “Require change on next visit”, Atrium sends you to this page after signing in until you have set your own password.

## Setting up two-factor authentication

Two-factor authentication (2FA) is strongly recommended for administrators – the **Administration** overview even counts “Administrators without 2FA”. You need an authenticator app (TOTP), for example the one built into your password manager.

<DocShot name="12-2fa" lang="en" caption="Profile → Security: password, two-factor authentication, sessions and API keys." />

1. Open **Profile → Security** and click **Turn on** next to *Two-factor authentication*.
2. Confirm with your password and click **Next**.
3. Scan the QR code with your authenticator app.
4. Save the **backup codes** (**Copy codes**). Each code works only once, and you can only see them now.
5. Enter the **verification code** shown in the app and click **Finish activation**.

<DocShot name="12b-2fa-setup" lang="en" caption="Setting up two-factor authentication: scan the QR code, save the backup codes, confirm the code." />

> **Tip:** If you lose your device, sign in with a backup code. Another person with administration rights can also reset your 2FA on your account page (see [Users, roles and permissions](/en/docs/users-roles#password-sessions-and-2fa)).

## Forgot password

**Forgot password?** on the sign-in page requests a link. It is valid for **one hour**; after the reset all sessions are ended. The response deliberately does not reveal whether an account exists for the address. This requires configured [email delivery](/en/docs/settings#email-delivery).

<DocShot name="27-forgot-password" lang="en" />

## Setting up your organization

You configure everything business-related in the interface under **Administration** – not through environment variables. We recommend this order; the linked pages have the details:

| Step | Where | What | Details |
|---|---|---|---|
| 1 | Settings → **General** | enter the system name, language and organization, link the legal notice and privacy policy | [General](/en/docs/settings#general) |
| 2 | Settings → **Email delivery** | enter the SMTP server and send a test email | [Email delivery](/en/docs/settings#email-delivery) |
| 3 | Settings → **Storage** | enter the S3 bucket and **Test connection** | [Storage](/en/docs/settings#storage) |
| 4 | Settings → **Design** | upload a logo and choose the accent color | [Design](/en/docs/settings#design) |
| 5 | **Modules** | install and enable feature modules | [Managing modules](/en/docs/module-management) |
| 6 | **Users** and **Roles** | create accounts and assign roles following the principle of least privilege | [Users, roles and permissions](/en/docs/users-roles) |

<DocShot name="02b-admin-overview" lang="en" caption="The Administration overview: key figures and all admin areas. The search box at the top finds individual settings directly." />

## Your own profile

Under **Profile** (user menu at the top right), everyone maintains their own account:

- **Account:** profile picture (PNG, JPEG or WebP; requires configured storage), name and email address. A new address only takes effect after clicking the confirmation link sent to it.
- **Security:** password, two-factor authentication, signed-in sessions and your own API keys.
- **Appearance:** theme, light/dark/system, accent color, language, density, entries per page and the start page after signing in (see [Appearance and start page](/en/docs/search-dashboard#appearance-and-start-page)).
- **Notifications:** push on this device and the channel per notification (see [Dashboard, search and notifications](/en/docs/search-dashboard#notifications)).

<DocShot name="28-profile" lang="en" />

## Checklist

- [ ] `INITIAL_ADMIN_*` removed from the environment
- [ ] Initial password changed
- [ ] 2FA enabled for all administrators
- [ ] System name and organization entered, legal notice and privacy policy linked
- [ ] Test email sent successfully
- [ ] Storage connection tested successfully

## Next steps

- Create accounts and roles: [Users, roles and permissions](/en/docs/users-roles)
- Add feature modules: [Managing modules](/en/docs/module-management)
- Set up backups: [Backup and restore](/en/docs/backup-restore)
