import { formatMoney } from '../../lib/money';

interface Props {
	count: number;
	total: number;
	pulse: boolean;
	onOpen: () => void;
}

export default function CartFab({ count, total, pulse, onOpen }: Props) {
	return (
		<button
			id="cart-fab"
			class={`cart-fab${pulse ? ' is-pulsing' : ''}`}
			type="button"
			onClick={onOpen}
			aria-haspopup="dialog"
			aria-label={`Ver pedido: ${count} productos, total ${formatMoney(total)}`}
		>
			<span class="cart-fab__label">
				<strong>Ver pedido</strong>
				<span>
					{count} {count === 1 ? 'producto' : 'productos'}
				</span>
			</span>
			<span class="cart-fab__amount">
				{formatMoney(total)}
				<span class="cart-fab__count">{count}</span>
			</span>
		</button>
	);
}
