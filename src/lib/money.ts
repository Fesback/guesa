export function toCents(value: number): number {
	return Math.round(value * 100);
}

export function fromCents(value: number): number {
	return value / 100;
}

export function formatMoney(value: number): string {
	const cents = toCents(value);
	const normalized = cents / 100;
	const decimals = cents % 100 === 0 ? 0 : Math.abs(cents % 10) === 0 ? 1 : 2;
	return `S/ ${normalized.toFixed(decimals)}`;
}

export function formatMoneyParts(value: number): { currency: string; amount: string } {
	const formatted = formatMoney(value);
	return { currency: 'S/', amount: formatted.replace('S/ ', '') };
}
