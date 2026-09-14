import { writable, derived } from 'svelte/store';

export interface STS2Card {
	id: string;
	name: string;
	type: string;
	cost: number;
	is_x_cost?: boolean;
	damage?: number;
	block?: number;
	hit_count?: number;
	color?: string;
	rarity?: string;
	description?: string;
	description_raw?: string;
	keywords?: string[];
	powers_applied?: { power: string; amount: number }[];
	tags?: string[];
	spawns_cards?: string[];
	cards_draw?: number;
	energy_gain?: number;
	hp_loss?: number;
	star_cost?: number;
	vars?: Record<string, unknown>;
	upgrade?: Record<string, unknown>;
	_uid?: number;
	[key: string]: unknown;
}

export interface STS2Relic {
	id: string;
	name: string;
	description?: string;
	[key: string]: unknown;
}

export interface STS2Potion {
	id: string;
	name: string;
	description?: string;
	[key: string]: unknown;
}

export interface STS2Character {
	id?: string;
	name?: string;
	starting_deck?: string[];
	[key: string]: unknown;
}

export interface DeckStats {
	total: number;
	attacks: number;
	skills: number;
	powers: number;
	costs: Record<string, number>;
	avgCost: string;
	totalDamage: number;
	totalBlock: number;
}

// Selected character
export const selectedCharacter = writable<STS2Character | null>(null);

// Deck: array of card objects (can have duplicates)
export const deck = writable<STS2Card[]>([]);

// Selected relics: array of relic objects
export const selectedRelics = writable<STS2Relic[]>([]);

// Selected potions: array of potion objects (max 3)
export const selectedPotions = writable<STS2Potion[]>([]);

// Add a card to deck
export function addCard(card: STS2Card): void {
	deck.update(d => [...d, { ...card, _uid: Date.now() + Math.random() }]);
}

// Remove a card from deck by unique id
export function removeCard(uid: number): void {
	deck.update(d => d.filter(c => c._uid !== uid));
}

// Clear the deck
export function clearDeck(): void {
	deck.set([]);
	selectedRelics.set([]);
	selectedPotions.set([]);
}

const CHAR_NAMES = ['Ironclad', 'Silent', 'Defect', 'Necrobinder', 'Regent'];

// Resolve PascalCase starting_deck ID to actual card ID in cards.json
function resolveStartingId(deckId: string, cardIds: string[]): string | null {
	// Direct uppercase match (e.g. Bash -> BASH)
	const upper = deckId.toUpperCase();
	if (cardIds.includes(upper)) return upper;

	// Character-suffixed (e.g. StrikeIronclad -> STRIKE_IRONCLAD)
	for (const cn of CHAR_NAMES) {
		if (deckId.endsWith(cn)) {
			const base = deckId.slice(0, -cn.length).toUpperCase();
			const tryId = base + '_' + cn.toUpperCase();
			if (cardIds.includes(tryId)) return tryId;
		}
	}

	// General PascalCase -> SCREAMING_SNAKE (e.g. FallingStar -> FALLING_STAR)
	const snake = deckId
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.toUpperCase();
	if (cardIds.includes(snake)) return snake;

	return null;
}

// Load starting deck for a character
export function loadStartingDeck(character: STS2Character, allCards: STS2Card[]): void {
	if (!character?.starting_deck || !allCards) return;
	const cardIds = allCards.map(c => c.id);
	const cards = character.starting_deck.map(deckId => {
		const resolvedId = resolveStartingId(deckId, cardIds);
		return resolvedId ? allCards.find(c => c.id === resolvedId) : null;
	}).filter(Boolean) as STS2Card[];
	deck.set(cards.map(c => ({ ...c, _uid: Date.now() + Math.random() })));
}

// Toggle a relic
export function toggleRelic(relic: STS2Relic): void {
	selectedRelics.update(relics => {
		const idx = relics.findIndex(r => r.id === relic.id);
		if (idx >= 0) return relics.filter(r => r.id !== relic.id);
		return [...relics, relic];
	});
}

// Toggle a potion (max 3)
export function togglePotion(potion: STS2Potion): void {
	selectedPotions.update(potions => {
		const idx = potions.findIndex(p => p.id === potion.id);
		if (idx >= 0) return potions.filter(p => p.id !== potion.id);
		if (potions.length >= 3) return potions;
		return [...potions, potion];
	});
}

// Load cards by IDs (for importing from tier list, guides, etc.)
export function loadCardsByIds(characterObj: STS2Character, cardIds: string[], allCards: STS2Card[]): void {
	if (!allCards) return;
	selectedCharacter.set(characterObj);
	const cards = cardIds
		.map(id => allCards.find(c => c.id === id))
		.filter(Boolean)
		.map(c => ({ ...(c as STS2Card), _uid: Date.now() + Math.random() }));
	deck.set(cards);
	selectedRelics.set([]);
	selectedPotions.set([]);
}

// Derived: deck stats
export const deckStats = derived(deck, $deck => {
	const total = $deck.length;
	const attacks = $deck.filter(c => c.type === 'Attack').length;
	const skills = $deck.filter(c => c.type === 'Skill').length;
	const powers = $deck.filter(c => c.type === 'Power').length;
	const costs: Record<string, number> = $deck.reduce((acc, c) => {
		const cost = c.is_x_cost ? 'X' : c.cost;
		const key = String(cost);
		acc[key] = (acc[key] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);
	const avgCost = total > 0
		? ($deck.filter(c => !c.is_x_cost).reduce((sum, c) => sum + (c.cost || 0), 0) / total).toFixed(1)
		: '0.0';
	const totalDamage = $deck.reduce((sum, c) => sum + ((c.damage || 0) * (c.hit_count || 1)), 0);
	const totalBlock = $deck.reduce((sum, c) => sum + (c.block || 0), 0);

	return { total, attacks, skills, powers, costs, avgCost, totalDamage, totalBlock } as DeckStats;
});
