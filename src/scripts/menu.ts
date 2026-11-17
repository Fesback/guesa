import { getLimaDay, getLimaDayLabel, type LimaDay } from '../lib/today';

const ADD_EVENT = 'guesa:add';

type AddDetail = {
	productId: string;
	name: string;
	variant: string | null;
	unitPrice: number;
	quantity: number;
	category: string;
	requiresBurger?: boolean;
	excludes?: string[];
	promoDay?: LimaDay;
};

function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updatePromoAvailability(): void {
	const today = getLimaDay();
	document.querySelectorAll<HTMLElement>('[data-promo-card]').forEach((card) => {
		const isToday = card.dataset.day === today;
		card.dataset.today = isToday ? 'true' : 'false';
		card.querySelectorAll<HTMLButtonElement>('[data-promo-add]').forEach((button) => {
			button.disabled = !isToday;
			const label = button.querySelector<HTMLElement>('[data-promo-label]');
			const day = (button.dataset.promoDay ?? card.dataset.day ?? 'lunes') as LimaDay;
			if (label) {
				label.textContent = isToday ? 'Agregar promo' : `Solo ${getLimaDayLabel(day).toLowerCase()}`;
			}
		});
	});
}

function animateButton(button: HTMLButtonElement): void {
	const label = button.querySelector<HTMLElement>('[data-add-label]');
	if (!label) return;
	if (!button.dataset.originalLabel) button.dataset.originalLabel = label.textContent ?? 'Agregar';
	label.textContent = 'Agregado';
	button.classList.add('btn--added');
	if (button.dataset.timer) window.clearTimeout(Number(button.dataset.timer));
	button.dataset.timer = String(
		window.setTimeout(() => {
			label.textContent = button.dataset.originalLabel ?? 'Agregar';
			button.classList.remove('btn--added');
		}, 950),
	);
}

function flyToCart(button: HTMLElement): void {
	if (prefersReducedMotion()) return;
	const start = button.getBoundingClientRect();
	const target = document.getElementById('cart-fab')?.getBoundingClientRect();
	const startX = start.left + start.width / 2;
	const startY = start.top + Math.min(start.height / 2, 26);
	const endX = target ? target.left + target.width - 32 : window.innerWidth - 48;
	const endY = target ? target.top + target.height / 2 : window.innerHeight - 96;
	const dot = document.createElement('span');
	dot.setAttribute('aria-hidden', 'true');
	dot.style.cssText = [
		'position:fixed',
		`left:${startX - 7}px`,
		`top:${startY - 7}px`,
		'width:14px',
		'height:14px',
		'border:2px solid #0F1F4D',
		'border-radius:999px',
		'background:#F2682B',
		'z-index:70',
		'pointer-events:none',
	].join(';');
	document.body.appendChild(dot);
	const dx = endX - startX;
	const dy = endY - startY;
	const animation = dot.animate(
		[
			{ transform: 'translate(0, 0) scale(1)', opacity: 1 },
			{
				transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 36}px) scale(0.9)`,
				opacity: 1,
				offset: 0.55,
			},
			{ transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0 },
		],
		{ duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' },
	);
	animation.onfinish = () => dot.remove();
}

function addFromProductButton(button: HTMLButtonElement): void {
	const card = button.closest<HTMLElement>('[data-product-card]');
	const basePrice = Number(button.dataset.price);
	if (!Number.isFinite(basePrice)) return;

	let unitPrice = basePrice;
	let variant: string | null = null;

	if (button.dataset.hasOptions === 'true' && card) {
		const selected = card.querySelector<HTMLInputElement>('input[type="radio"]:checked');
		if (selected) {
			const delta = Number(selected.dataset.optionPrice ?? 0);
			unitPrice = Math.round((basePrice + (Number.isFinite(delta) ? delta : 0)) * 100) / 100;
			variant = delta > 0 ? (selected.dataset.optionName ?? null) : null;
		}
	}

	const detail: AddDetail = {
		productId: button.dataset.productId ?? '',
		name: button.dataset.name ?? 'Producto',
		variant,
		unitPrice,
		quantity: 1,
		category: button.dataset.category ?? 'hamburguesas',
	};

	if (!detail.productId) return;
	window.dispatchEvent(new CustomEvent<AddDetail>(ADD_EVENT, { detail }));
	flyToCart(button);
	animateButton(button);
}

function addFromPromoButton(button: HTMLButtonElement): void {
	if (button.disabled) return;
	const day = (button.dataset.promoDay ?? '') as LimaDay;
	if (day !== getLimaDay()) {
		updatePromoAvailability();
		return;
	}

	let excludes: string[] = [];
	try {
		const parsed: unknown = JSON.parse(button.dataset.excludes ?? '[]');
		excludes = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
	} catch {
		excludes = [];
	}

	const detail: AddDetail = {
		productId: button.dataset.productId ?? '',
		name: button.dataset.name ?? 'Promo',
		variant: null,
		unitPrice: Number(button.dataset.price),
		quantity: 1,
		category: 'promos',
		requiresBurger: button.dataset.requiresBurger === 'true',
		excludes,
		promoDay: day,
	};

	if (!detail.productId || !Number.isFinite(detail.unitPrice)) return;
	window.dispatchEvent(new CustomEvent<AddDetail>(ADD_EVENT, { detail }));
	flyToCart(button);
	const label = button.querySelector<HTMLElement>('[data-promo-label]');
	if (label) {
		const original = label.textContent ?? 'Agregar promo';
		label.textContent = 'Agregado';
		window.setTimeout(() => {
			label.textContent = original === 'Agregado' ? 'Agregar promo' : original;
		}, 950);
	}
}

function initFilters(): void {
	const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-menu-filter]'));
	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
	const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-menu-group]'));
	if (!chips.length) return;

	const apply = (filter: string) => {
		chips.forEach((chip) => {
			const active = chip.dataset.menuFilter === filter;
			chip.classList.toggle('is-active', active);
			chip.setAttribute('aria-pressed', String(active));
		});

		cards.forEach((card) => {
			const matches = filter === 'all' || card.dataset.category === filter;
			card.classList.toggle('is-filtered', !matches);
		});

		groups.forEach((group) => {
			group.hidden = !group.querySelector('[data-product-card]:not(.is-filtered)');
		});

		if (!prefersReducedMotion()) {
			cards
				.filter((card) => !card.classList.contains('is-filtered'))
				.forEach((card) => {
					card.animate(
						[
							{ opacity: 0, transform: 'translateY(5px)' },
							{ opacity: 1, transform: 'translateY(0)' },
						],
						{ duration: 250, easing: 'cubic-bezier(.22,1,.36,1)' },
					);
				});
		}

		window.dispatchEvent(new Event('guesa:menu-filter'));
	};

	chips.forEach((chip) => {
		chip.addEventListener('click', () => apply(chip.dataset.menuFilter ?? 'all'));
	});
}

function initMobileNav(): void {
	document.querySelectorAll<HTMLAnchorElement>('.mobile-nav a').forEach((link) => {
		link.addEventListener('click', () => {
			link.closest('details')?.removeAttribute('open');
		});
	});
}

export function initMenuUi(): void {
	initFilters();
	initMobileNav();
	updatePromoAvailability();

	let currentDay = getLimaDay();
	window.setInterval(() => {
		const day = getLimaDay();
		if (day !== currentDay) {
			currentDay = day;
			updatePromoAvailability();
		}
	}, 60000);

	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const promoButton = target.closest<HTMLButtonElement>('[data-promo-add]');
		if (promoButton) {
			addFromPromoButton(promoButton);
			return;
		}

		const addButton = target.closest<HTMLButtonElement>('[data-add]');
		if (addButton) {
			addFromProductButton(addButton);
		}
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initMenuUi, { once: true });
} else {
	initMenuUi();
}
