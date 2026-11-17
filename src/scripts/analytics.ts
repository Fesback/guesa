import {
	analyticsConfigured,
	getConsent,
	loadAnalytics,
	setConsent,
	track,
} from '../lib/analytics';

export function initAnalytics(): void {
	if (typeof window === 'undefined' || !analyticsConfigured()) return;

	const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
	const consent = getConsent();

	if (!consent && banner) {
		banner.hidden = false;
	}

	if (consent === 'granted') {
		loadAnalytics();
	}

	banner?.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((button) => {
		button.addEventListener('click', () => {
			const value = button.dataset.consent;
			if (value !== 'granted' && value !== 'denied') return;
			setConsent(value);
			banner.hidden = true;
		});
	});

	window.addEventListener('guesa:consent', () => {
		if (banner) banner.hidden = true;
	});
}

export function trackMenuView(): void {
	track('view_menu', { section: 'carta' });
}

export function trackPromoView(): void {
	track('promo_view', { section: 'promos' });
}

export function trackWhatsApp(source: string): void {
	track('whatsapp_click', { source });
}
