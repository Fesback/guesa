import gsap from 'gsap';

export function initMarquee(): void {
	const track = document.querySelector<HTMLElement>('[data-marquee-track]');
	if (!track) return;

	gsap.to(track, {
		xPercent: -50,
		ease: 'none',
		duration: 26,
		repeat: -1,
	});
}
