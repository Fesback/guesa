import { siteConfig } from '../site.config';

export type ConsentValue = 'granted' | 'denied' | null;
export type AnalyticsEventName =
	| 'view_menu'
	| 'add_to_cart'
	| 'begin_checkout'
	| 'whatsapp_click'
	| 'promo_view';

export const CONSENT_KEY = 'guesa:consent';

type AnalyticsWindow = Window & {
	dataLayer?: unknown[];
	gtag?: (...args: unknown[]) => void;
	fbq?: (...args: unknown[]) => void;
};

function analyticsWindow(): AnalyticsWindow | null {
	return typeof window === 'undefined' ? null : (window as AnalyticsWindow);
}

export function getConsent(): ConsentValue {
	const win = analyticsWindow();
	if (!win) return null;
	try {
		const value = win.localStorage.getItem(CONSENT_KEY);
		return value === 'granted' || value === 'denied' ? value : null;
	} catch {
		return null;
	}
}

export function setConsent(value: Exclude<ConsentValue, null>): void {
	const win = analyticsWindow();
	if (!win) return;
	try {
		win.localStorage.setItem(CONSENT_KEY, value);
	} catch {
		// Sin persistencia, la elección vale para esta visita.
	}
	if (value === 'granted') loadAnalytics();
	win.dispatchEvent(new CustomEvent('guesa:consent', { detail: value }));
}

export function analyticsConfigured(): boolean {
	return Boolean(siteConfig.analytics.ga4Id || siteConfig.analytics.metaPixelId);
}

export function hasAnalyticsConsent(): boolean {
	return analyticsConfigured() && getConsent() === 'granted';
}

export function loadAnalytics(): void {
	const win = analyticsWindow();
	if (!win || !hasAnalyticsConsent()) return;
	const { ga4Id, metaPixelId } = siteConfig.analytics;

	if (ga4Id && !win.gtag) {
		const script = win.document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
		win.document.head.appendChild(script);

		win.dataLayer = win.dataLayer ?? [];
		win.gtag = (...args: unknown[]) => {
			win.dataLayer?.push(args);
		};
		win.gtag('js', new Date());
		win.gtag('config', ga4Id, { anonymize_ip: true });
	}

	if (metaPixelId && !win.fbq) {
		const script = win.document.createElement('script');
		script.async = true;
		script.src = 'https://connect.facebook.net/en_US/fbevents.js';
		win.document.head.appendChild(script);
		win.fbq = (...args: unknown[]) => {
			(win.fbq as unknown as { queue?: unknown[][] }).queue ??= [];
			(win.fbq as unknown as { queue: unknown[][] }).queue.push(args);
		};
		win.fbq('init', metaPixelId);
		win.fbq('track', 'PageView');
	}
}

const META_EVENTS: Partial<Record<AnalyticsEventName, string>> = {
	add_to_cart: 'AddToCart',
	begin_checkout: 'InitiateCheckout',
	whatsapp_click: 'Contact',
	view_menu: 'ViewContent',
};

export function track(event: AnalyticsEventName, params: Record<string, unknown> = {}): void {
	const win = analyticsWindow();
	if (!win || !hasAnalyticsConsent()) return;
	win.gtag?.('event', event, params);
	const metaEvent = META_EVENTS[event];
	if (metaEvent) {
		win.fbq?.('track', metaEvent, params);
	} else {
		win.fbq?.('trackCustom', event, params);
	}
}
