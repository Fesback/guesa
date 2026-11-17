import { siteConfig } from '../site.config';

export type SeoMenuItem = {
	categoria: string;
	nombre: string;
	descripcion: string;
	precio: number;
};

export type SeoCombo = {
	nombre: string;
	descripcion: string;
	precio: number;
};

export type SeoFaq = {
	pregunta: string;
	respuesta: string;
};

const SECTION_NAMES: Record<string, string> = {
	hamburguesas: 'Hamburguesas',
	alitas: 'Alitas',
	infaltables: 'Infaltables',
	bebidas: 'Bebidas',
	extras: 'Extras',
};

function menuSection(name: string, items: SeoMenuItem[]) {
	return {
		'@type': 'MenuSection',
		name,
		hasMenuItem: items.map((item) => ({
			'@type': 'MenuItem',
			name: item.nombre,
			description: item.descripcion,
			offers: {
				'@type': 'Offer',
				price: item.precio.toFixed(2),
				priceCurrency: 'PEN',
			},
		})),
	};
}

export function restaurantJsonLd(menuItems: SeoMenuItem[], combos: SeoCombo[]): Record<string, unknown> {
	const sections = Object.entries(SECTION_NAMES)
		.map(([key, name]) => {
			const items = menuItems.filter((item) => item.categoria === key);
			return items.length ? menuSection(name, items) : null;
		})
		.filter(Boolean);

	const comboSection = combos.length
		? [
				{
					'@type': 'MenuSection',
					name: 'Combos',
					hasMenuItem: combos.map((combo) => ({
						'@type': 'MenuItem',
						name: combo.nombre,
						description: combo.descripcion,
						offers: {
							'@type': 'Offer',
							price: combo.precio.toFixed(2),
							priceCurrency: 'PEN',
						},
					})),
				},
			]
		: [];

	const openingHoursSpecification = siteConfig.hours.map((range) => ({
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: range.days.map((day) => `https://schema.org/${day}`),
		opens: range.opens,
		closes: range.closes,
	}));

	const sameAs = [siteConfig.socials.instagram, siteConfig.socials.tiktok].filter(Boolean);

	return {
		'@context': 'https://schema.org',
		'@type': 'Restaurant',
		'@id': `${siteConfig.url}/#restaurant`,
		name: siteConfig.name,
		alternateName: siteConfig.shortName,
		description: siteConfig.description,
		url: siteConfig.url,
		image: `${siteConfig.url}${siteConfig.seo.ogImage}`,
		telephone: siteConfig.whatsappDisplay,
		email: siteConfig.email,
		priceRange: 'S/ 8–100',
		currenciesAccepted: 'PEN',
		paymentAccepted: siteConfig.payments.join(', '),
		servesCuisine: ['Hamburguesas', 'Comida criolla', 'Americana', 'Alitas'],
		address: {
			'@type': 'PostalAddress',
			streetAddress: siteConfig.address.street,
			addressLocality: siteConfig.address.district,
			addressRegion: siteConfig.address.city,
			postalCode: siteConfig.address.postalCode,
			addressCountry: siteConfig.address.country,
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: siteConfig.geo.lat,
			longitude: siteConfig.geo.lng,
		},
		areaServed: siteConfig.deliveryZones.flatMap((zone) =>
			zone.districts.map((district) => ({ '@type': 'City', name: district })),
		),
		openingHoursSpecification,
		sameAs: sameAs.length ? sameAs : undefined,
		hasMenu: {
			'@type': 'Menu',
			name: 'Carta Guesa',
			inLanguage: 'es-PE',
			url: `${siteConfig.url}/#carta`,
			hasMenuSection: [...sections, ...comboSection],
		},
	};
}

export function faqJsonLd(faq: SeoFaq[]): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faq.map((item) => ({
			'@type': 'Question',
			name: item.pregunta,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.respuesta,
			},
		})),
	};
}

export function jsonLd(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}
