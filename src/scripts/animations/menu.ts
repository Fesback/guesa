import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMenuReveal(): void {
	const cards = gsap.utils.toArray<HTMLElement>('[data-product-card]');
	if (!cards.length) return;

	gsap.set(cards, { y: 14, autoAlpha: 0 });

	ScrollTrigger.batch(cards, {
		start: 'top 92%',
		once: true,
		onEnter: (batch) => {
			gsap.to(batch, {
				y: 0,
				autoAlpha: 1,
				duration: 0.45,
				stagger: 0.055,
				ease: 'power2.out',
				overwrite: true,
			});
		},
	});

	window.addEventListener('guesa:menu-filter', () => {
		ScrollTrigger.refresh();
	});
}
