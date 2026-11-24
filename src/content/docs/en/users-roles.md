---
title: Users, roles and permissions
description: Create, invite and lock accounts, assign roles and individual permissions, understand admin-level permissions and manage passwords, sessions and 2FA.
order: 11
section: Administration
source: docs/permissions.md
---

<script>
	import DocShot from '$lib/components/docs/DocShot.svelte';
</script>

Atrium controls access through **role-based permissions** (RBAC). Only people with administration rights create accounts; there is no self-registration. This page explains how to manage accounts, how roles and individual permissions work together, and which protective rules Atrium enforces.

## The model in brief

| Term | Meaning |
|---|---|
| **Permission** | A right in the `module.resource.action` scheme, e.g. `core.users.edit`. The core and modules register their own permissions. |
| **Role** | A named set of permissions, e.g. “Treasurer”. |
| **Individual permission** | A permission assigned directly to an account, in addition to its roles. |
| **Effective permissions** | The union of roles, roles granted by modules and individual permissions. |

- Only permissions of the core and of **enabled** modules take effect. If you disable a module, every account (and API key) loses its permissions immediately.
- Checks happen exclusively on the server. The interface merely hides what you are not allowed to do.

## Managing users

**Administration → Users** lists all accounts with roles, status, 2FA and last sign-in. You can search the list, filter it by status (Active, Disabled, Email unverified, Never signed in), 2FA and role, and export it as **CSV**.

<DocShot name="09-users" lang="en" caption="Administration → Users: list with search, filters, bulk actions and CSV export." />

### Creating or inviting an account

Click **Create user** and enter a name, email and password (at least 12 characters). The account is active immediately. Alternatively choose **Invite instead**: the person then sets their own password via a link that is valid for **7 days** – this requires configured [email delivery](/en/docs/settings#email-delivery).

The **Roles & permissions** tab of the same dialog assigns roles and individual permissions right away.

<DocShot name="26c-user-create" lang="en" />

### Bulk actions

Select several accounts (up to 500) to enable or disable them together, send a reset email, sign them out on all devices, or add or remove a role. Each account goes through the same checks as individually; accounts with more permissions than yours and your own account are skipped and reported.

### Disabling or deleting

- **Disable** signs the person out immediately and blocks sign-in until the account is active again. All data is kept – usually the better choice.
- **Delete** removes the account permanently. Modules clean up their data for this account (hook `onUserDeleted`); the confirmation dialog shows what is removed along with it.

## An account’s detail page

Clicking a name opens the detail page with the **Overview**, **Activity**, **Sessions**, **Security** and **Permissions** tabs. The overview shows figures such as last sign-in, active sessions, API keys, files and AI usage; *Activity* charts the audit entries of the last 90 days; *Permissions* lists every effective permission with its origin (role, individual permission or module).

<DocShot name="26-user-detail" lang="en" />

### Password, sessions and 2FA

The **Security** tab helps people who can no longer get into their account:

| Action | Effect |
|---|---|
| **Send reset email** | A link to the person’s address, valid for 1 hour. The old password keeps working until a new one is set. |
| **Create link** | One-time reset link, valid for 1 hour, visible only now – only give it to the person themselves. |
| **Set password** | Generated randomly (at least 16 characters) or entered manually, visible only now. All sessions and open links end. Optionally “Require change on next visit”. |
| **Resend invitation** | For invited accounts without their own password. |
| **Reset 2FA** | Removes the secret and backup codes; the person signs in with the password only and sets up 2FA again. |

In the **Sessions** tab you end individual sessions or sign the person out on every device with **Sign out everywhere**.

<DocShot name="26b-user-security" lang="en" />

> **Note:** These functions are locked for your own account – change your password, 2FA and sessions in your own [profile](/en/docs/first-steps#your-own-profile).

### Acting as a user

**Act as user** lets you see and change everything with another person’s permissions for 15, 30 or 60 minutes – for example to reproduce a problem. Strict rules apply:

- You need the admin-level permission `core.users.impersonate`, confirm with your password (and 2FA code) and give a **reason**. The reason is only shown on the detail page, not in the audit log.
- Administrators can never be the target, nor can accounts with more permissions than yours.
- Every action is recorded in the audit log with you as the acting person. The person’s password, 2FA, sessions, email and API keys stay locked.
- A banner shows the remaining time and lets you end the session early. By default the person receives an email (setting “Notify users when an administrator acts as them” under *General*).

## Roles

**Administration → Roles** bundles permissions. Each card shows the number of permissions and assigned accounts.

<DocShot name="10-roles" lang="en" />

**Create role** opens a dialog with name, description and the permission picker. Permissions are grouped by core and modules; the search box also matches permission descriptions, and “all”/“none” only affect the matches.

<DocShot name="10b-role-edit" lang="en" caption="Editing a role: permissions grouped by module, with search. Admin-level permissions are marked." />

### The Administrator role

The system role **Administrator** concretely holds **all** registered permissions – including those of new modules, which are added automatically at startup. There is no wildcard permission. System roles cannot be renamed, changed or deleted.

### Roles from modules

Modules can bring default roles (e.g. “Member”) and grant them permissions when first enabled. This happens **once**: if you deliberately remove such a permission, it does not come back. Some modules also grant roles automatically (e.g. through offices); such roles only apply while the module is enabled and appear on the detail page with the note “via module”.

### Overview of all permissions

The **Permissions** tab lists every registered permission with its description and the roles that contain it – handy for checking who may do what.

<DocShot name="23-permissions" lang="en" />

## Protection against privilege escalation

Atrium prevents anyone from gaining more permissions than they have through permission management:

- You can only **grant** permissions you hold yourself – for roles, individual permissions and API keys.
- Whoever edits, deletes or assigns a role must hold **all** of its permissions. Assigning additionally requires `core.roles.assign`.
- Accounts with permissions you don’t have can be viewed but not changed (“More permissions than you – cannot be changed”).
- The **last active administrator** cannot be disabled, deleted or stripped of the role. Disabling or deleting yourself is blocked, and you cannot remove your own individual permissions.

### Admin-level permissions

Four permissions effectively allow taking over the whole system and are therefore **admin-level**. They carry the **“Admin-level”** badge in role management and can only be granted by administrators:

| Permission | Why it is admin-level |
|---|---|
| `core.system.backup` | Full export of all data including credentials; importing a backup |
| `core.system.reset` | Deleting any data area including accounts and roles |
| `core.privacy.export` | Reads all data about a person from every module |
| `core.users.impersonate` | Acts with other people’s permissions and data |

`core.modules.install` is privileged as well: only administrators may install modules, because module code runs with full privileges (see [Managing modules](/en/docs/module-management)). An administrator is anyone who effectively holds all core permissions – the “Administrator” role always does.

## Core permissions

| Key | Meaning |
|---|---|
| `core.users.view` / `.create` / `.edit` / `.delete` | View, create, edit and disable, delete users |
| `core.users.impersonate` | Act as another user (admin-level) |
| `core.roles.view` / `.create` / `.edit` / `.delete` | View roles and permissions, create, edit, delete roles |
| `core.roles.assign` | Assign roles and individual permissions to users |
| `core.modules.view` / `.manage` | View modules, or enable and disable them |
| `core.modules.install` | Install and update modules from GitHub or ZIP (administrators only) |
| `core.jobs.manage` | View background jobs and trigger them manually |
| `core.settings.view` / `.manage` | View or change system settings |
| `core.api.view` / `.manage` | View or manage API keys |
| `core.storage.read` / `.write` / `.delete` | Read, write, delete files in the core storage area |
| `core.storage.manage` | Configure storage and manage all storage areas |
| `core.pdf.generate` / `.manage` | Generate PDFs via the API, configure PDF templates |
| `core.ai.use` / `.manage` / `.view` | Use AI, configure it, view usage |
| `core.audit.view` | View the audit log |
| `core.system.reset` | Reset data areas (admin-level) |
| `core.system.backup` | Export and import backups (admin-level) |
| `core.privacy.export` | GDPR data export (admin-level) |

The permissions of installed modules additionally appear under **Roles → Permissions**.

## Recommendations

- Work with roles rather than individual permissions – individual permissions are meant for exceptions.
- Grant permissions following the principle of least privilege and review roles regularly.
- Only give admin-level permissions to administrators, and enable two-factor authentication for every account with administration rights.

## Next steps

- Configure the system: [Settings](/en/docs/settings)
- Connect external services with API keys: [REST API](/en/docs/api)
- Who changed what? [Privacy and audit log](/en/docs/privacy)
