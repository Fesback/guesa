import { atom, computed } from 'nanostores';
import type { LimaDay } from './today';

export type CartCategory = 'hamburguesas' | 'alitas' | 'infaltables' | 'bebidas' | 'extras' | 'combos' | 'promos';

export type CartLine = {
	key: string;
	productId: string;
	name: string;
	variant: string | null;
	unitPrice: number;
	quantity: number;
	category: CartCategory;
	requiresBurger?: boolean;
	excludes?: string[];
	promoDay?: LimaDay;
};

export type AddLinePayload = Omit<CartLine, 'key' | 'quantity'> & {
	quantity?: number;
};

export type CartValidation = {
	ok: boolean;
	errors: string[];
};

export const CART_STORAGE_KEY = 'guesa:cart:v1';
export const CART_ADD_EVENT = 'guesa:add';
export const CART_SHEET_EVENT = 'guesa:sheet';

function makeKey(productId: string, variant: string | null): string {
	return `${productId}::${variant ?? 'base'}`;
}

function normalizeQuantity(value: unknown): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(parsed)) return 1;
	return Math.max(1, Math.min(99, Math.floor(parsed)));
}

function isCartLine(value: unknown): value is CartLine {
	if (!value || typeof value !== 'object') return false;
	const line = value as Partial<CartLine>;
	return (
		typeof line.key === 'string' &&
		typeof line.productId === 'string' &&
		typeof line.name === 'string' &&
		(line.variant === null || typeof line.variant === 'string') &&
		typeof line.unitPrice === 'number' &&
		Number.isFinite(line.unitPrice) &&
		typeof line.quantity === 'number' &&
		Number.isFinite(line.quantity) &&
		typeof line.category === 'string'
	);
}

function loadCart(): CartLine[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(CART_STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isCartLine).map((line) => ({
			...line,
			quantity: normalizeQuantity(line.quantity),
		}));
	} catch {
		return [];
	}
}

export const $cart = atom<CartLine[]>(loadCart());
export const $cartOpen = atom(false);

export const $cartCount = computed($cart, (lines) =>
	lines.reduce((total, line) => total + line.quantity, 0),
);

export const $cartTotalCents = computed($cart, (lines) =>
	lines.reduce((total, line) => total + Math.round(line.unitPrice * 100) * line.quantity, 0),
);

export const $cartTotal = computed($cartTotalCents, (cents) => cents / 100);

export const $cartValidation = computed($cart, (lines) => validateCart(lines));

export function addLine(payload: AddLinePayload): CartLine {
	const variant = payload.variant?.trim() ? payload.variant.trim() : null;
	const key = makeKey(payload.productId, variant);
	const quantity = normalizeQuantity(payload.quantity);
	const current = $cart.get();
	const existing = current.find((line) => line.key === key);

	if (existing) {
		const updated = current.map((line) =>
			line.key === key ? { ...line, quantity: normalizeQuantity(line.quantity + quantity) } : line,
		);
		$cart.set(updated);
		return updated.find((line) => line.key === key) as CartLine;
	}

	const line: CartLine = {
		key,
		productId: payload.productId,
		name: payload.name,
		variant,
		unitPrice: Math.max(0, payload.unitPrice),
		quantity,
		category: payload.category,
		...(payload.requiresBurger ? { requiresBurger: true } : {}),
		...(payload.excludes?.length ? { excludes: payload.excludes } : {}),
		...(payload.promoDay ? { promoDay: payload.promoDay } : {}),
	};

	$cart.set([...current, line]);
	return line;
}

export function incrementLine(key: string): void {
	$cart.set(
		$cart.get().map((line) =>
			line.key === key ? { ...line, quantity: normalizeQuantity(line.quantity + 1) } : line,
		),
	);
}

export function decrementLine(key: string): void {
	const next = $cart.get().flatMap((line) => {
		if (line.key !== key) return [line];
		if (line.quantity <= 1) return [];
		return [{ ...line, quantity: line.quantity - 1 }];
	});
	$cart.set(next);
}

export function removeLine(key: string): void {
	$cart.set($cart.get().filter((line) => line.key !== key));
}

export function clearCart(): void {
	$cart.set([]);
}

export function getLineTotalCents(line: CartLine): number {
	return Math.round(line.unitPrice * 100) * line.quantity;
}

export function lineLabel(line: CartLine): string {
	return line.variant ? `${line.name} + ${line.variant}` : line.name;
}

export function validateCart(lines: CartLine[]): CartValidation {
	const errors: string[] = [];
	const promos = lines.filter((line) => line.requiresBurger);

	for (const promo of promos) {
		const excluded = promo.excludes ?? [];
		const eligible = lines.some(
			(line) => line.category === 'hamburguesas' && !excluded.includes(line.productId),
		);
		if (!eligible) {
			errors.push(
				`La promo “${promo.name}” necesita una burger que no sea Guesa Smash ni Five Guesa. Agrega una o quita la promo.`,
			);
		}
	}

	return { ok: errors.length === 0, errors };
}

if (typeof window !== 'undefined') {
	$cart.subscribe((lines) => {
		try {
			window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
		} catch {
			// El carrito sigue funcionando en memoria.
		}
	});
}
