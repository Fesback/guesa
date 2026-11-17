export const MENU_CATEGORIES = [
	{
		id: 'hamburguesas',
		label: 'Hamburguesas',
		title: 'Hamburguesas',
		note: 'Carne de 120 gr, pan suave y salsa Guesa. Súmale papas o chicha.',
	},
	{
		id: 'alitas',
		label: 'Alitas',
		title: 'Alitas',
		note: 'Incluyen mayonesa y ají. Elige tu salsa favorita.',
	},
	{
		id: 'infaltables',
		label: 'Infaltables',
		title: 'Infaltables',
		note: 'Papas, salchipapas y cheddar fries para compartir.',
	},
	{
		id: 'bebidas',
		label: 'Bebidas',
		title: 'Bebidas',
		note: 'Chicha morada, gaseosas y agua bien fría.',
	},
	{
		id: 'extras',
		label: 'Extras',
		title: 'Extras',
		note: 'Para los que siempre quieren un poco más.',
	},
] as const;

export type MenuCategoryId = (typeof MENU_CATEGORIES)[number]['id'];

export const MENU_CATEGORY_ORDER: MenuCategoryId[] = MENU_CATEGORIES.map((category) => category.id);

export function sortMenuByCategory<T extends { categoria: string; orden: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const categoryDiff =
			MENU_CATEGORY_ORDER.indexOf(a.categoria as MenuCategoryId) -
			MENU_CATEGORY_ORDER.indexOf(b.categoria as MenuCategoryId);
		return categoryDiff !== 0 ? categoryDiff : a.orden - b.orden;
	});
}
