async function initAnimations(): Promise<void> {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const [smoothScroll, hero, promos, menu, marquee] = await Promise.all([
		import('../smooth-scroll'),
		import('./hero'),
		import('./promos'),
		import('./menu'),
		import('./marquee'),
	]);

	smoothScroll.initSmoothScroll();
	marquee.initMarquee();
	menu.initMenuReveal();
	hero.initHero();
	promos.initPromos();
}

void initAnimations().catch(() => undefined);
