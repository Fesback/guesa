interface Props {
	message: string | null;
	tone: 'success' | 'error';
}

export default function Snackbar({ message, tone }: Props) {
	if (!message) return null;
	return (
		<div class="snackbar" role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
			<span
				aria-hidden="true"
				style={{
					width: '0.65rem',
					height: '0.65rem',
					flex: '0 0 auto',
					borderRadius: '999px',
					background: tone === 'error' ? '#F2682B' : '#25D366',
				}}
			/>
			<span>{message}</span>
		</div>
	);
}
