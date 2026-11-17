import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initPromos(): void {
	const pin = document.querySelector<HTMLElement>('[data-promo-pin]');
	const cards = gsap.utils.toArray<HTMLElement>('[data-promo-card]');
	if (!pin || cards.length < 2) return;

	gsap.matchMedia().add('(min-width: 64rem) and (min-height: 40rem)', () => {
		const timeline = gsap.timeline({
			scrollTrigger: {
				trigger: pin,
				start: 'top 24%',
				end: '+=68%',
				pin: true,
				scrub: 0.65,
				anticipatePin: 1,
				invalidateOnRefresh: true,
			},
		});

		timeline.fromTo(
			cards,
			{
				x: (index) => (index - (cards.length - 1) / 2) * 46,
				y: (index) => Math.abs(index - (cards.length - 1) / 2) * 16,
				rotation: (index) => (index - (cards.length - 1) / 2) * 2.1,
				scale: 0.97,
				transformOrigin: '50% 90%',
			},
			{
				x: 0,
				y: 0,
				rotation: 0,
				scale: 1,
				duration: 1,
				stagger: 0.07,
				ease: 'power2.out',
			},
		);
	});
}
