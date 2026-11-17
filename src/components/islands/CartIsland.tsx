import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
	$cart,
	$cartCount,
	$cartOpen,
	$cartTotal,
	CART_ADD_EVENT,
	CART_SHEET_EVENT,
	addLine,
	validateCart,
	type AddLinePayload,
} from '../../lib/cart';
import { track } from '../../lib/analytics';
import { generalWhatsAppUrl } from '../../lib/whatsapp';
import CartFab from './CartFab';
import CartSheet from './CartSheet';
import Snackbar from './Snackbar';
import { WhatsAppIcon } from './icons';

type SnackState = {
	id: number;
	message: string;
	tone: 'success' | 'error';
};

export default function CartIsland() {
	const count = useStore($cartCount);
	const total = useStore($cartTotal);
	const open = useStore($cartOpen);

	const [pulse, setPulse] = useState(false);
	const [snack, setSnack] = useState<SnackState | null>(null);
	const snackTimer = useRef<number | null>(null);
	const pulseTimer = useRef<number | null>(null);

	const showSnack = useCallback((message: string, tone: 'success' | 'error', duration = 3600) => {
		if (snackTimer.current) window.clearTimeout(snackTimer.current);
		setSnack({ id: Date.now(), message, tone });
		snackTimer.current = window.setTimeout(() => setSnack(null), duration);
	}, []);

	const openSheet = useCallback(() => {
		$cartOpen.set(true);
	}, []);
	const closeSheet = useCallback(() => {
		$cartOpen.set(false);
	}, []);

	useEffect(() => {
		return () => {
			if (snackTimer.current) window.clearTimeout(snackTimer.current);
			if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
		};
	}, []);

	useEffect(() => {
		const handleAdd = (event: Event) => {
			const detail = (event as CustomEvent<AddLinePayload>).detail;
			if (!detail || typeof detail.name !== 'string' || typeof detail.unitPrice !== 'number') {
				return;
			}

			addLine(detail);
			const result = validateCart($cart.get());
			if (result.ok) {
				showSnack(`Agregado: ${detail.name}`, 'success');
			} else {
				showSnack(result.errors[0] ?? 'Revisa tu promo antes de enviar.', 'error', 6500);
			}

			track('add_to_cart', {
				item_name: detail.name,
				item_category: detail.category,
				value: detail.unitPrice,
				quantity: detail.quantity ?? 1,
				currency: 'PEN',
			});

			setPulse(true);
			if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
			pulseTimer.current = window.setTimeout(() => setPulse(false), 650);
		};

		const handleSheet = (event: Event) => {
			const detail = (event as CustomEvent<{ open?: boolean }>).detail;
			$cartOpen.set(Boolean(detail?.open));
		};

		window.addEventListener(CART_ADD_EVENT, handleAdd);
		window.addEventListener(CART_SHEET_EVENT, handleSheet);
		return () => {
			window.removeEventListener(CART_ADD_EVENT, handleAdd);
			window.removeEventListener(CART_SHEET_EVENT, handleSheet);
		};
	}, [showSnack]);

	useEffect(() => {
		if (!open) return;
		track('begin_checkout', {
			value: total,
			items: count,
			currency: 'PEN',
		});
	}, [open]);

	return (
		<>
			<div class="order-dock" aria-label="Acciones de pedido">
				<a
					class="whatsapp-fab"
					href={generalWhatsAppUrl()}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Hacer una consulta por WhatsApp"
					onClick={() => track('whatsapp_click', { source: 'floating' })}
				>
					<WhatsAppIcon size={26} />
				</a>
				{count > 0 && (
					<CartFab count={count} total={total} pulse={pulse} onOpen={openSheet} />
				)}
			</div>

			<CartSheet open={open} onClose={closeSheet} />
			<Snackbar message={snack?.message ?? null} tone={snack?.tone ?? 'success'} />
		</>
	);
}
