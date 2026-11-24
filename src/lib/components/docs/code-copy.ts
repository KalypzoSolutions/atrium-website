import type { Attachment } from 'svelte/attachments';

interface Labels {
	copy: string;
	copied: string;
}

/**
 * Attachment: ergänzt jeden `.code-block` im Element um einen Kopieren-Button.
 * Ein MutationObserver erfasst Codeblöcke, die nach clientseitiger Navigation neu gerendert werden.
 *
 * Verwendung: `<article {@attach codeCopy({ copy, copied })}>`
 */
export function codeCopy(labels: Labels): Attachment<HTMLElement> {
	return (root) => {
		const timers = new Set<ReturnType<typeof setTimeout>>();

		const enhance = (block: Element) => {
			const existing = block.querySelector<HTMLButtonElement>(':scope > .copy-btn');
			if (existing) {
				// Nach einem Sprachwechsel neu anlegen, damit Beschriftung und Handler zur Sprache passen.
				if (existing.dataset.copied || existing.textContent === labels.copy) return;
				existing.remove();
			}
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'copy-btn';
			btn.textContent = labels.copy;
			btn.setAttribute('aria-label', labels.copy);
			btn.addEventListener('click', async () => {
				const code = block.querySelector('pre code') ?? block.querySelector('pre');
				const text = code?.textContent ?? '';
				try {
					await navigator.clipboard.writeText(text.replace(/\n$/, ''));
					btn.textContent = labels.copied;
					btn.setAttribute('aria-label', labels.copied);
					btn.dataset.copied = 'true';
					const timer = setTimeout(() => {
						btn.textContent = labels.copy;
						btn.setAttribute('aria-label', labels.copy);
						delete btn.dataset.copied;
						timers.delete(timer);
					}, 2000);
					timers.add(timer);
				} catch {
					// Zwischenablage nicht verfügbar (z. B. ohne HTTPS) – Text bleibt markierbar.
				}
			});
			block.appendChild(btn);
		};

		const scan = () => root.querySelectorAll('.code-block').forEach(enhance);
		scan();

		const mo = new MutationObserver(scan);
		mo.observe(root, { childList: true, subtree: true });

		return () => {
			mo.disconnect();
			timers.forEach(clearTimeout);
		};
	};
}
