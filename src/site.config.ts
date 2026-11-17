export type PaymentMethod = 'Yape' | 'Plin' | 'Efectivo';

export type DeliveryZone = {
	name: string;
	districts: string[];
	fee: number;
	note: string;
};

export type OpeningRange = {
	days: string[];
	label: string;
	opens: string;
	closes: string;
};

export const siteConfig = {
	name: 'Guesa Hamburguesería',
	shortName: 'Guesa',
	legalName: 'Guesa Hamburguesería',
	tagline: 'Hamburguesas con estilo americano y alma criolla.',
	description:
		'Hamburguesas artesanales, alitas, salchipapas y combos en Miraflores, Lima. Pide por WhatsApp y recibe en casa o recoge en el local.',
	url: 'https://guesa.pe',
	locale: 'es_PE',
	currency: 'PEN',
	// TODO(owner): reemplazar por el número real en formato internacional, sin + ni espacios.
	whatsappNumber: '51999999999',
	whatsappDisplay: '+51 999 999 999',
	// TODO(owner): reemplazar por el teléfono real del local.
	phoneDisplay: '+51 999 999 999',
	email: 'hola@guesa.pe',
	address: {
		// TODO(owner): reemplazar por la dirección exacta de Google Business.
		street: 'Av. Larco 123',
		district: 'Miraflores',
		city: 'Lima',
		region: 'Lima',
		country: 'PE',
		postalCode: '15074',
		reference: 'A media cuadra del parque central de Miraflores.',
	},
	// TODO(owner): reemplazar por las coordenadas exactas del local.
	geo: { lat: -12.1219, lng: -77.0297 },
	mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Guesa+Hamburgueseria+Miraflores+Lima',
	// TODO(owner): agregar el enlace real del perfil de Google Business.
	googleBusinessUrl: '',
	socials: {
		// TODO(owner): reemplazar por las cuentas oficiales.
		instagram: 'https://instagram.com/guesaburger',
		tiktok: 'https://tiktok.com/@guesaburger',
	},
	hours: [
		{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], label: 'Lun a jue', opens: '12:00', closes: '23:00' },
		{ days: ['Friday', 'Saturday'], label: 'Vie y sáb', opens: '12:00', closes: '00:00' },
		{ days: ['Sunday'], label: 'Domingo', opens: '12:00', closes: '22:00' },
	] satisfies OpeningRange[],
	hoursSummary: 'Lun a jue 12:00–23:00 · Vie y sáb 12:00–00:00 · Dom 12:00–22:00',
	deliveryZones: [
		{
			name: 'Zona 1',
			districts: ['Miraflores', 'San Isidro'],
			// TODO(owner): confirmar tarifa real por zona.
			fee: 5,
			note: 'Delivery directo',
		},
		{
			name: 'Zona 2',
			districts: ['Barranco', 'Surquillo', 'Lince'],
			fee: 7,
			note: 'Coordina el horario por WhatsApp',
		},
		{
			name: 'Zona 3',
			districts: ['Santiago de Surco', 'San Borja', 'Jesús María'],
			fee: 9,
			note: 'Sujeto a disponibilidad',
		},
	] satisfies DeliveryZone[],
	deliveryNote: 'El costo exacto del delivery se confirma por WhatsApp según tu dirección.',
	payments: ['Yape', 'Plin', 'Efectivo'] satisfies PaymentMethod[],
	analytics: {
		// Deja vacío para no cargar analítica. Si se configura, aparece el banner de consentimiento.
		ga4Id: '',
		metaPixelId: '',
	},
	order: {
		minAdvanceMinutes: 20,
		fallbackLabel: 'Pedir por WhatsApp',
	},
	seo: {
		defaultTitle: 'Hamburguesas artesanales y salchipapas en Miraflores | Guesa',
		ogImage: '/og-guesa.jpg',
		themeColor: '#FBF6EC',
	},
} as const;

export type SiteConfig = typeof siteConfig;
