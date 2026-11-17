import { lineLabel, type CartLine } from './cart';
import { formatMoney } from './money';
import { siteConfig } from '../site.config';

export type OrderMode = 'delivery' | 'recojo';

export type OrderCustomer = {
	name: string;
	address: string;
	notes: string;
};

export function buildOrderMessage(
	lines: CartLine[],
	mode: OrderMode,
	customer: OrderCustomer,
	total: number,
): string {
	const items = lines.map(
		(line) =>
			`• ${line.quantity}x ${lineLabel(line)} — ${formatMoney(line.unitPrice * line.quantity)}`,
	);

	const message = [
		'Hola Guesa 👋, quiero hacer un pedido:',
		...items,
		'',
		`Total: ${formatMoney(total)}`,
		`Modalidad: ${mode === 'delivery' ? 'Delivery' : 'Recojo'}`,
		`Nombre: ${customer.name.trim()}`,
	];

	if (mode === 'delivery') {
		message.push(`Dirección: ${customer.address.trim() || 'Por confirmar por WhatsApp'}`);
		message.push('Delivery: se confirma por WhatsApp.');
	} else {
		message.push('Recojo en el local.');
	}

	if (customer.notes.trim()) {
		message.push(`Notas: ${customer.notes.trim()}`);
	}

	return message.join('\n');
}

export function whatsappUrl(text: string): string {
	return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function generalWhatsAppUrl(): string {
	return whatsappUrl('Hola Guesa 👋, tengo una consulta sobre la carta.');
}

export function promoWhatsAppUrl(promoName: string): string {
	return whatsappUrl(`Hola Guesa 👋, quiero consultar por la promo “${promoName}”.`);
}

export function openWhatsApp(url: string): void {
	if (typeof window === 'undefined') return;
	window.open(url, '_blank', 'noopener,noreferrer');
}
