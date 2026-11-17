export type LimaDay = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	timeZone: 'America/Lima',
});

const DAY_MAP: Record<string, LimaDay> = {
	Sunday: 'domingo',
	Monday: 'lunes',
	Tuesday: 'martes',
	Wednesday: 'miercoles',
	Thursday: 'jueves',
	Friday: 'viernes',
	Saturday: 'sabado',
};

export function getLimaDay(date = new Date()): LimaDay {
	return DAY_MAP[weekdayFormatter.format(date)] ?? 'lunes';
}

export function getLimaTime(date = new Date()): string {
	return new Intl.DateTimeFormat('es-PE', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'America/Lima',
	}).format(date);
}

export function getLimaDayLabel(day: LimaDay): string {
	const labels: Record<LimaDay, string> = {
		lunes: 'Lunes',
		martes: 'Martes',
		miercoles: 'Miércoles',
		jueves: 'Jueves',
		viernes: 'Viernes',
		sabado: 'Sábado',
		domingo: 'Domingo',
	};
	return labels[day];
}
