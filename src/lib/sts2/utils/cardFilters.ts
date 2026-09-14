export interface CardFilterOptions {
	character?: string;
	type?: string;
	rarity?: string;
	cost?: string | number | null;
	keyword?: string;
	search?: string;
}

export interface FilterableCard {
	id: string;
	name: string;
	description: string;
	type: string;
	cost: number;
	rarity: string;
	color?: string;
	is_x_cost?: boolean;
	keywords?: string[];
	[key: string]: unknown;
}

export function filterCards(cards: FilterableCard[], filters: CardFilterOptions): FilterableCard[] {
	let result = cards;

	if (filters.character) {
		result = result.filter(c => c.color === filters.character || c.color === 'colorless');
	}

	if (filters.type) {
		result = result.filter(c => c.type === filters.type);
	}

	if (filters.rarity) {
		result = result.filter(c => c.rarity === filters.rarity);
	}

	if (filters.cost !== null && filters.cost !== undefined && filters.cost !== '') {
		if (filters.cost === 'X') {
			result = result.filter(c => c.is_x_cost);
		} else {
			const costNum = parseInt(String(filters.cost));
			result = result.filter(c => c.cost === costNum && !c.is_x_cost);
		}
	}

	if (filters.keyword) {
		result = result.filter(c => c.keywords && c.keywords.includes(filters.keyword));
	}

	if (filters.search) {
		const q = filters.search.toLowerCase();
		result = result.filter(c =>
			c.name.toLowerCase().includes(q) ||
			c.description.toLowerCase().includes(q) ||
			(c.keywords && c.keywords.some(k => k.toLowerCase().includes(q)))
		);
	}

	return result;
}

export function sortCards(cards: FilterableCard[], sortBy: string = 'cost'): FilterableCard[] {
	return [...cards].sort((a, b) => {
		if (sortBy === 'cost') return (a.cost || 0) - (b.cost || 0);
		if (sortBy === 'name') return a.name.localeCompare(b.name);
		if (sortBy === 'type') return a.type.localeCompare(b.type);
		if (sortBy === 'rarity') {
			const order: Record<string, number> = { Basic: 0, Common: 1, Uncommon: 2, Rare: 3, Ancient: 4 };
			return (order[a.rarity] || 0) - (order[b.rarity] || 0);
		}
		return 0;
	});
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export function parseDescription(desc: string): string {
	if (!desc) return '';
	const escaped = escapeHtml(desc);
	return escaped
		.replace(/\[gold\]/g, '<span class="text-yellow-400 font-semibold">')
		.replace(/\[\/gold\]/g, '</span>')
		.replace(/\[blue\]/g, '<span class="text-blue-400 font-semibold">')
		.replace(/\[\/blue\]/g, '</span>')
		.replace(/\[red\]/g, '<span class="text-red-400 font-semibold">')
		.replace(/\[\/red\]/g, '</span>')
		.replace(/\[green\]/g, '<span class="text-green-400 font-semibold">')
		.replace(/\[\/green\]/g, '</span>')
		.replace(/\[aqua\]/g, '<span class="text-cyan-400 font-semibold">')
		.replace(/\[\/aqua\]/g, '</span>')
		.replace(/\[i\]/g, '<em>')
		.replace(/\[\/i\]/g, '</em>')
		.replace(/\[b\]/g, '<strong>')
		.replace(/\[\/b\]/g, '</strong>')
		.replace(/\[font_size=\d+\]/g, '')
		.replace(/\[\/font_size\]/g, '')
		.replace(/\[jitter\]/g, '')
		.replace(/\[\/jitter\]/g, '')
		.replace(/\[sine\]/g, '')
		.replace(/\[\/sine\]/g, '')
		.replace(/\[thinky_dots\]/g, '')
		.replace(/\[\/thinky_dots\]/g, '')
		.replace(/\n/g, '<br>');
}
