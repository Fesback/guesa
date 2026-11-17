import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

function waitForFonts(): Promise<void> {
	if (!('fonts' in document)) return Promise.resolve();
	return Promise.race([
		document.fonts.ready.then(() => undefined),
		new Promise<void>((resolve) => window.setTimeout(resolve, 700)),
	]);
}

export function initHero(): void {
	const hero = document.querySelector<HTMLElement>('.hero');
	const title = document.querySelector<HTMLElement>('[data-hero-title]');
	if (!hero || !title) return;

	const eyebrow = document.querySelector<HTMLElement>('[data-hero-eyebrow]');
	const copy = document.querySelector<HTMLElement>('[data-hero-copy]');
	const actions = document.querySelector<HTMLElement>('[data-hero-actions]');
	const meta = document.querySelector<HTMLElement>('[data-hero-meta]');
	const sticker = document.querySelector<HTMLElement>('[data-hero-sticker]');
	const label = document.querySelector<HTMLElement>('[data-hero-label]');
	const price = document.querySelector<HTMLElement>('[data-hero-price]');
	const shapes = gsap.utils.toArray<HTMLElement>('[data-hero-shape]');

	waitForFonts().then(() => {
		let split: SplitText | null = null;
		try {
			split = SplitText.create(title, {
				type: 'lines',
				linesClass: 'hero-line',
				mask: 'lines',
				aria: 'auto',
			});
		} catch {
			split = null;
		}

		const timeline = gsap.timeline({
			defaults: { ease: 'power3.out' },
			onComplete: () => {
				split?.masks.forEach((mask) => {
					if (mask instanceof HTMLElement) mask.style.overflow = 'visible';
				});
				ScrollTrigger.refresh();
			},
		});

		if (eyebrow) timeline.from(eyebrow, { y: 10, autoAlpha: 0, duration: 0.35 }, 0);
		if (split?.lines.length) {
			timeline.from(split.lines, { yPercent: 110, duration: 0.75, stagger: 0.06 }, 0.05);
		} else {
			timeline.from(title, { y: 16, autoAlpha: 0, duration: 0.7 }, 0.05);
		}
		if (copy) timeline.from(copy, { y: 12, autoAlpha: 0, duration: 0.45 }, 0.28);
		if (actions) timeline.from(actions, { y: 12, autoAlpha: 0, duration: 0.45 }, 0.38);
		if (meta) timeline.from(meta, { y: 10, autoAlpha: 0, duration: 0.4 }, 0.46);
		if (sticker) {
			timeline.from(
				sticker,
				{ y: -24, rotation: -4, scale: 0.95, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.5)' },
				0.16,
			);
		}
		if (label) timeline.from(label, { y: 10, autoAlpha: 0, duration: 0.35 }, 0.58);
		if (price) timeline.from(price, { y: 10, autoAlpha: 0, duration: 0.35 }, 0.66);

		ScrollTrigger.refresh();
	});

	gsap.matchMedia().add('(min-width: 64rem) and (prefers-reduced-motion: no-preference)', () => {
		if (shapes.length) {
			gsap.to(shapes, {
				yPercent: (index) => (index % 2 === 0 ? 16 : -12),
				ease: 'none',
				scrollTrigger: {
					trigger: hero,
					start: 'top top',
					end: 'bottom top',
					scrub: 0.8,
				},
			});
		}
		if (sticker) {
			gsap.to(sticker, {
				y: 44,
				rotation: 1.5,
				ease: 'none',
				scrollTrigger: {
					trigger: hero,
					start: 'top top',
					end: 'bottom top',
					scrub: 0.9,
				},
			});
		}
	});
}
