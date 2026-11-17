import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import QRCode from 'qrcode';

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<rect width="1200" height="630" fill="#FBF6EC"/>
	<rect x="16" y="16" width="1168" height="598" rx="30" fill="none" stroke="#0F1F4D" stroke-width="10"/>
	<g fill="#0F1F4D" opacity="0.18">
		${Array.from({ length: 5 }, (_, row) =>
			Array.from({ length: 8 }, (_, col) => `<circle cx="${76 + col * 22}" cy="${72 + row * 22}" r="3.4"/>`).join(''),
		).join('')}
	</g>
	<g transform="translate(82 188)">
		<rect x="0" y="0" width="286" height="54" rx="27" fill="#FFC83D" stroke="#0F1F4D" stroke-width="4"/>
		<text x="143" y="36" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" letter-spacing="2" fill="#0F1F4D">MIRAFLORES · LIMA</text>
		<text x="-6" y="170" font-family="Arial Black, Arial, sans-serif" font-size="154" font-weight="900" letter-spacing="-6" fill="#0F1F4D">GUESA</text>
		<text x="0" y="244" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#0F1F4D">Hamburguesas con estilo</text>
		<text x="0" y="294" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#C2470F">americano y alma criolla.</text>
		<text x="0" y="366" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#45506B">Pide por WhatsApp · Delivery en Miraflores</text>
		<text x="0" y="405" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="#45506B">guesa.pe</text>
	</g>
	<g transform="translate(748 126)">
		<circle cx="190" cy="190" r="184" fill="#0F1F4D" opacity="0.18"/>
		<circle cx="174" cy="174" r="184" fill="#F2682B" stroke="#0F1F4D" stroke-width="8"/>
		<g transform="translate(66 90) rotate(-4)">
			<path d="M0 62C0 24 46 0 108 0s108 24 108 62H0Z" fill="#FFC83D" stroke="#0F1F4D" stroke-width="7"/>
			<circle cx="62" cy="27" r="5" fill="#FBF6EC" opacity="0.9"/>
			<circle cx="108" cy="17" r="4" fill="#FBF6EC" opacity="0.9"/>
			<circle cx="154" cy="30" r="5" fill="#FBF6EC" opacity="0.9"/>
			<path d="M-8 78h232" stroke="#0F1F4D" stroke-width="8" stroke-linecap="round"/>
			<path d="M0 98c18 20 38 20 56 0 18 20 38 20 56 0 18 20 38 20 56 0 18 20 38 20 56 0" fill="none" stroke="#7FB54B" stroke-width="12" stroke-linecap="round"/>
			<path d="M-4 128h224" stroke="#0F1F4D" stroke-width="18" stroke-linecap="round"/>
			<path d="M0 158c22 16 44 16 66 0 22 16 44 16 66 0 22 16 44 16 66 0" fill="none" stroke="#8B4A2B" stroke-width="14" stroke-linecap="round"/>
			<path d="M0 184h216c0 30-38 52-108 52S0 214 0 184Z" fill="#FFC83D" stroke="#0F1F4D" stroke-width="7"/>
		</g>
	</g>
</svg>`;

await sharp(Buffer.from(ogSvg)).jpeg({ quality: 90, mozjpeg: true }).toFile('public/og-guesa.jpg');

await QRCode.toFile('public/qr-carta.png', 'https://guesa.pe/#carta', {
	width: 480,
	margin: 2,
	errorCorrectionLevel: 'H',
	color: { dark: '#0F1F4D', light: '#FBF6EC' },
});

const favicon = await readFile('public/favicon.svg');
await sharp(favicon)
	.resize(180, 180)
	.flatten({ background: '#FBF6EC' })
	.png()
	.toFile('public/apple-touch-icon.png');
