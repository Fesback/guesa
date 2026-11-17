import { useEffect, useRef, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
	$cart,
	$cartTotal,
	$cartValidation,
	clearCart,
	decrementLine,
	incrementLine,
	lineLabel,
	removeLine,
} from '../../lib/cart';
import { formatMoney } from '../../lib/money';
import { siteConfig } from '../../site.config';
import { track } from '../../lib/analytics';
import { buildOrderMessage, whatsappUrl, type OrderMode } from '../../lib/whatsapp';
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, WhatsAppIcon } from './icons';

interface Props {
	open: boolean;
	onClose: () => void;
}

export default function CartSheet({ open, onClose }: Props) {
	const lines = useStore($cart);
	const total = useStore($cartTotal);
	const validation = useStore($cartValidation);

	const [mode, setMode] = useState<OrderMode>('delivery');
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [notes, setNotes] = useState('');
	const [errors, setErrors] = useState<string[]>([]);
	const [confirmClear, setConfirmClear] = useState(false);

	const panelRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const addressRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!open) return;
		const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.classList.add('body-lock');
		window.dispatchEvent(new CustomEvent('guesa:sheet-open'));
		const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
				return;
			}

			if (event.key !== 'Tab' || !panelRef.current) return;
			const focusable = Array.from(
				panelRef.current.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((element) => element.offsetParent !== null);

			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			window.clearTimeout(focusTimer);
			document.removeEventListener('keydown', handleKeyDown);
			document.body.classList.remove('body-lock');
			window.dispatchEvent(new CustomEvent('guesa:sheet-close'));
			previousFocus?.focus();
		};
	}, [open, onClose]);

	useEffect(() => {
		if (!confirmClear) return;
		const timer = window.setTimeout(() => setConfirmClear(false), 4000);
		return () => window.clearTimeout(timer);
	}, [confirmClear]);

	if (!open) return null;

	const hasLines = lines.length > 0;

	const handleSubmit = (event: Event) => {
		event.preventDefault();
		const nextErrors: string[] = [];

		if (!hasLines) nextErrors.push('Tu pedido está vacío. Agrega algo de la carta.');
		if (!name.trim()) nextErrors.push('Escribe tu nombre para confirmar el pedido.');
		if (mode === 'delivery' && !address.trim()) {
			nextErrors.push('Escribe tu dirección para coordinar el delivery.');
		}

		if (nextErrors.length || !validation.ok) {
			setErrors(nextErrors);
			if (!name.trim()) {
				nameRef.current?.focus();
			} else if (mode === 'delivery' && !address.trim()) {
				addressRef.current?.focus();
			}
			return;
		}

		setErrors([]);
		const message = buildOrderMessage(lines, mode, { name, address, notes }, total);
		const url = whatsappUrl(message);

		track('whatsapp_click', {
			source: 'order',
			value: total,
			currency: 'PEN',
			items: lines.length,
			mode,
		});

		const opened = window.open(url, '_blank', 'noopener,noreferrer');
		if (!opened) window.location.href = url;
	};

	const handleRemovePromos = () => {
		lines.filter((line) => line.requiresBurger).forEach((line) => removeLine(line.key));
	};

	return (
		<div class="sheet-root" role="presentation">
			<div class="sheet-backdrop" onClick={onClose} aria-hidden="true" />
			<div
				class="sheet-panel"
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="cart-sheet-title"
				data-lenis-prevent
			>
				<div class="sheet-header">
					<div>
						<h2 class="sheet-title" id="cart-sheet-title">Tu pedido</h2>
						<p class="text-xs font-semibold text-[color:var(--color-on-surface-variant)]">
							{lines.length} {lines.length === 1 ? 'producto' : 'productos'} en el carrito
						</p>
					</div>
					<button
						class="icon-btn"
						ref={closeRef}
						type="button"
						onClick={onClose}
						aria-label="Cerrar pedido"
					>
						<CloseIcon />
					</button>
				</div>

				<div class="sheet-body" data-lenis-prevent>
					{!hasLines ? (
						<div class="sheet-empty">
							<h3>Tu pedido está vacío.</h3>
							<p>Vuelve a la carta, elige tu Guesa y arma el combo que quieras.</p>
							<a class="btn btn--sm btn--primary" href="#carta" onClick={onClose}>
								Ver la carta
							</a>
						</div>
					) : (
						<>
							<fieldset class="delivery-toggle">
								<legend class="sr-only">Elige modalidad del pedido</legend>
								<label>
									<input
										type="radio"
										name="order-mode"
										value="delivery"
										checked={mode === 'delivery'}
										onChange={() => setMode('delivery')}
									/>
									<span>Delivery</span>
								</label>
								<label>
									<input
										type="radio"
										name="order-mode"
										value="recojo"
										checked={mode === 'recojo'}
										onChange={() => setMode('recojo')}
									/>
									<span>Recojo</span>
								</label>
							</fieldset>

							<ul class="cart-lines">
								{lines.map((line) => (
									<li class="cart-line" key={line.key}>
										<div class="min-w-0">
											<p class="cart-line__name">{line.name}</p>
											{line.variant && <p class="cart-line__variant">+ {line.variant}</p>}
											<p class="cart-line__price">{formatMoney(line.unitPrice * line.quantity)}</p>
										</div>
										<div class="qty" aria-label={`Cantidad de ${lineLabel(line)}`}>
											<button
												type="button"
												onClick={() => decrementLine(line.key)}
												aria-label={`Quitar una unidad de ${line.name}`}
											>
												<MinusIcon size={16} />
											</button>
											<span aria-live="polite">{line.quantity}</span>
											<button
												type="button"
												onClick={() => incrementLine(line.key)}
												aria-label={`Agregar una unidad de ${line.name}`}
											>
												<PlusIcon size={16} />
											</button>
										</div>
										<button
											class="cart-line__remove"
											type="button"
											onClick={() => removeLine(line.key)}
										>
											Quitar
										</button>
									</li>
								))}
							</ul>

							{!validation.ok && (
								<div class="sheet-error" role="alert">
									<div class="grid gap-2">
										{validation.errors.map((error) => (
											<p>{error}</p>
										))}
										<button class="btn btn--sm self-start" type="button" onClick={handleRemovePromos}>
											Quitar promo del martes
										</button>
									</div>
								</div>
							)}

							{errors.length > 0 && (
								<div class="sheet-error" role="alert">
									<div class="grid gap-1">
										{errors.map((error) => (
											<p>{error}</p>
										))}
									</div>
								</div>
							)}

							<form class="sheet-form" onSubmit={handleSubmit} noValidate>
								<p class="sheet-section-title">Datos del pedido</p>

								<div class="field">
									<input
										id="order-name"
										ref={nameRef}
										type="text"
										name="name"
										placeholder=" "
										autocomplete="name"
										value={name}
										onInput={(event) => {
											setName((event.currentTarget as HTMLInputElement).value);
											setErrors([]);
										}}
										aria-invalid={errors.length > 0 && !name.trim()}
									/>
									<label for="order-name">Nombre</label>
								</div>

								{mode === 'delivery' && (
									<div class="field">
										<input
											id="order-address"
											ref={addressRef}
											type="text"
											name="address"
											placeholder=" "
											autocomplete="street-address"
											value={address}
											onInput={(event) => {
												setAddress((event.currentTarget as HTMLInputElement).value);
												setErrors([]);
											}}
											aria-invalid={errors.length > 0 && !address.trim()}
										/>
										<label for="order-address">Dirección y referencia</label>
									</div>
								)}

								<div class="field">
									<textarea
										id="order-notes"
										name="notes"
										placeholder=" "
										value={notes}
										onInput={(event) => setNotes((event.currentTarget as HTMLTextAreaElement).value)}
										maxLength={400}
									/>
									<label for="order-notes">Notas (sin cebolla, salsa extra, timbre…)</label>
								</div>

								<p class="text-xs font-medium text-[color:var(--color-on-surface-variant)]">
									{siteConfig.deliveryNote} Pagas con Yape, Plin o efectivo.
								</p>

								<button
									class="btn btn--sm justify-self-start"
									type="button"
									onClick={() => {
										if (confirmClear) {
											clearCart();
											setConfirmClear(false);
											return;
										}
										setConfirmClear(true);
									}}
								>
									<TrashIcon />
									{confirmClear ? '¿Seguro? Sí, vaciar' : 'Vaciar pedido'}
								</button>
							</form>
						</>
					)}
				</div>

				{hasLines && (
					<div class="sheet-foot">
						<div class="sheet-total">
							<span>Total</span>
							<strong>{formatMoney(total)}</strong>
						</div>
						<button class="btn btn--whatsapp btn--block" type="button" onClick={handleSubmit}>
							<WhatsAppIcon size={20} />
							Enviar pedido por WhatsApp
						</button>
						<p class="text-center text-[0.68rem] font-medium text-[color:var(--color-on-surface-variant)]">
							Delivery no incluido · Se confirma por WhatsApp
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
