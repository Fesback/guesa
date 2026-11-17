import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
	if (typeof window === 'undefined') return null;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
	if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
	if (lenis) return lenis;

	lenis = new Lenis({
		lerp: 0.1,
		smoothWheel: true,
		syncTouch: false,
		wheelMultiplier: 1,
	});

	lenis.on('scroll', ScrollTrigger.update);
	const tick = (time: number) => lenis?.raf(time * 1000);
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);

	const header = document.querySelector<HTMLElement>('[data-topbar]');
	const offset = -((header?.offsetHeight ?? 76) + 10);

	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
		link.addEventListener('click', (event) => {
			const href = link.getAttribute('href');
			if (!href || href === '#') return;
			const target = document.querySelector<HTMLElement>(href);
			if (!target) return;
			event.preventDefault();
			lenis?.scrollTo(target, {
				offset,
				duration: 1.05,
			});
			history.pushState(null, '', href);

			const details = link.closest('details');
			if (details) details.removeAttribute('open');
		});
	});

	window.addEventListener('guesa:sheet-open', () => lenis?.stop());
	window.addEventListener('guesa:sheet-close', () => lenis?.start());

	return lenis;
}
