import { cdn } from '$lib/utils/imageProxy';

export interface CharacterTheme {
	name: string;
	color: string;
	colorLight: string;
	colorDark: string;
	gradient: string;
	bgGlow: string;
	borderColor: string;
	borderHover: string;
	textColor: string;
	badgeBg: string;
	description: string;
}

export interface CardTypeColor {
	bg: string;
	text: string;
	border: string;
}

export interface RarityColor {
	bg: string;
	text: string;
	border: string;
}

export const CHARACTER_THEMES: Record<string, CharacterTheme> = {
	ironclad: {
		name: 'Ironclad',
		color: '#e53935',
		colorLight: '#ff6f60',
		colorDark: '#ab000d',
		gradient: 'from-red-600 to-red-900',
		bgGlow: 'rgba(229, 57, 53, 0.15)',
		borderColor: 'border-red-500/30',
		borderHover: 'hover:border-red-500/60',
		textColor: 'text-red-400',
		badgeBg: 'bg-red-500/20',
		description: 'Strength scaling, Exhaust synergies, self-damage for power'
	},
	silent: {
		name: 'Silent',
		color: '#43a047',
		colorLight: '#76d275',
		colorDark: '#00701a',
		gradient: 'from-green-600 to-green-900',
		bgGlow: 'rgba(67, 160, 71, 0.15)',
		borderColor: 'border-green-500/30',
		borderHover: 'hover:border-green-500/60',
		textColor: 'text-green-400',
		badgeBg: 'bg-green-500/20',
		description: 'Poison, Shivs, Discard synergies, high skill ceiling'
	},
	defect: {
		name: 'Defect',
		color: '#1e88e5',
		colorLight: '#6ab7ff',
		colorDark: '#005cb2',
		gradient: 'from-blue-600 to-blue-900',
		bgGlow: 'rgba(30, 136, 229, 0.15)',
		borderColor: 'border-blue-500/30',
		borderHover: 'hover:border-blue-500/60',
		textColor: 'text-blue-400',
		badgeBg: 'bg-blue-500/20',
		description: 'Orbs (Lightning, Frost, Dark, Plasma), Focus scaling'
	},
	necrobinder: {
		name: 'Necrobinder',
		color: '#8e24aa',
		colorLight: '#c158dc',
		colorDark: '#5c007a',
		gradient: 'from-purple-600 to-purple-900',
		bgGlow: 'rgba(142, 36, 170, 0.15)',
		borderColor: 'border-purple-500/30',
		borderHover: 'hover:border-purple-500/60',
		textColor: 'text-purple-400',
		badgeBg: 'bg-purple-500/20',
		description: 'Soul binding, summoning, dark rituals'
	},
	regent: {
		name: 'Regent',
		color: '#fdd835',
		colorLight: '#ffff6b',
		colorDark: '#c6a700',
		gradient: 'from-yellow-500 to-yellow-800',
		bgGlow: 'rgba(253, 216, 53, 0.15)',
		borderColor: 'border-yellow-500/30',
		borderHover: 'hover:border-yellow-500/60',
		textColor: 'text-yellow-400',
		badgeBg: 'bg-yellow-500/20',
		description: 'Dual energy pools, Stars mechanic, royal commands'
	}
};

export const CARD_TYPE_COLORS: Record<string, CardTypeColor> = {
	Attack: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
	Skill: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
	Power: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
	Status: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
	Curse: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
};

export const RARITY_COLORS: Record<string, RarityColor> = {
	Basic: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
	Common: { bg: 'bg-gray-400/20', text: 'text-gray-300', border: 'border-gray-400/30' },
	Uncommon: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
	Rare: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
	Ancient: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
};

/**
 * Get a CDN image URL for SpireCodex assets.
 * Routes through our own CDN worker (R2 caching + WebP conversion).
 */
export function getImageUrl(relativePath: string, width?: number): string | null {
	if (!relativePath) return null;
	const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
	const widthParam = width ? `?width=${width}` : '';
	return cdn(`spirecodex/${cleanPath}${widthParam}`);
}
