import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'hex-gold': '#c8aa6e',
				'hex-blue': '#0ac8b9',
				'hex-dark': '#091428',
				'hex-darker': '#000',
				'hex-black': '#030305',
				'hex-surface': '#0a0a0c',
				// LoL section palette (blue-black). Mirrors --lol-* in app.html.
				'lol': {
					'bg': '#060D17',
					'bg2': '#091426',
					'card': '#0C1827',
					'raised': '#101F31',
					'hover': '#162A42',
					'line': '#233D59',
					'primary': '#1677FF',
					'primary-hover': '#338BFF',
					'link': '#58B6FF',
					'text': '#F2F5FA',
					'text2': '#A5B8D1',
					'text3': '#7E95B1',
					'pos': '#65E8C0',
					's': '#E9D88D',
				},
			},
			fontFamily: {
				'cinzel': ['Cinzel', 'serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			boxShadow: {
				'neon': '0 0 20px rgba(10, 200, 185, 0.3)',
				'neon-strong': '0 0 40px rgba(10, 200, 185, 0.5)',
			}
		}
	},
	plugins: [],
	corePlugins: {
		fontVariantNumeric: false,
		scrollSnapType: false,
		scrollSnapAlign: false,
		scrollSnapStop: false,
		contain: false,
	}
};
