/**
 * STS2 Battle Engine — Pure TS implementation
 * Replaces the Godot WASM arena with a lightweight battle simulator
 */

export interface StatusEffect {
	type: string;
	stacks: number;
}

export interface EnemyIntent {
	type: string;
	value: number;
	desc?: string;
	block?: number;
}

export interface EnemyDefinition {
	name: string;
	hp: number;
	damage: number;
	block: number;
	intents: EnemyIntent[];
}

export interface BattleCard {
	id: string;
	name: string;
	type: string;
	cost: number;
	damage: number;
	hitCount: number;
	block: number;
	description: string;
	cardsDraw: number;
	energyGain: number;
	hpLoss: number;
	exhausts: boolean;
	applyPoison: number;
	applyWeakness: number;
	applyVulnerable: number;
	applyStrength: number;
	applyDexterity: number;
	applyThorns: number;
	applyRegen: number;
	_original: unknown;
}

export interface LogEntry {
	turn: number;
	msg: string;
	ts: number;
}

export interface Animation {
	type: string;
	value: number;
	source?: string;
	block?: number;
}

export interface BattleState {
	playerHP: number;
	playerMaxHP: number;
	playerBlock: number;
	playerMana: number;
	playerMaxMana: number;
	playerStatuses: StatusEffect[];
	cardsPerTurn: number;
	drawPile: BattleCard[];
	discardPile: BattleCard[];
	exhaustPile: BattleCard[];
	hand: BattleCard[];
	enemyName: string;
	enemyHP: number;
	enemyMaxHP: number;
	enemyBlock: number;
	enemyStatuses: StatusEffect[];
	enemyIntents: EnemyIntent[];
	enemyKey: string;
	turn: number;
	phase: 'player' | 'enemy' | 'won' | 'lost';
	totalDamageDealt: number;
	log: LogEntry[];
	animations: Animation[];
}

export interface IntentDisplay {
	icon: string;
	text: string;
	color: string;
}

export interface StatusDisplay {
	icon: string;
	color: string;
	bg: string;
}

export interface EnemyListEntry {
	key: string;
	name: string;
	hp: number;
}

// Status effect types
export const StatusType: Record<string, string> = {
	POISON: 'Poison',
	STRENGTH: 'Strength',
	WEAKNESS: 'Weakness',
	VULNERABLE: 'Vulnerable',
	BLOCK_NEXT: 'BlockNext',
	REGEN: 'Regen',
	DEXTERITY: 'Dexterity',
	THORNS: 'Thorns'
};

// Enemy intent types
const IntentType: Record<string, string> = {
	ATTACK: 'attack',
	BLOCK: 'block',
	BUFF: 'buff',
	DEBUFF: 'debuff',
	ATTACK_BLOCK: 'attack_block'
};

// Enemy definitions
const ENEMIES: Record<string, EnemyDefinition> = {
	dummy: {
		name: 'Training Dummy', hp: 200, damage: 0, block: 0,
		intents: [{ type: IntentType.BLOCK, value: 0 }]
	},
	slime: {
		name: 'Slime', hp: 38, damage: 7, block: 5,
		intents: [
			{ type: IntentType.ATTACK, value: 7 },
			{ type: IntentType.BLOCK, value: 5 },
			{ type: IntentType.ATTACK, value: 10 },
			{ type: IntentType.DEBUFF, desc: 'apply_poison', value: 3 }
		]
	},
	skeleton: {
		name: 'Skeleton', hp: 46, damage: 9, block: 4,
		intents: [
			{ type: IntentType.ATTACK, value: 9 },
			{ type: IntentType.ATTACK, value: 6 },
			{ type: IntentType.BUFF, desc: 'strength', value: 2 },
			{ type: IntentType.ATTACK, value: 12 },
			{ type: IntentType.BLOCK, value: 8 }
		]
	},
	ghost: {
		name: 'Ghost', hp: 32, damage: 6, block: 3,
		intents: [
			{ type: IntentType.DEBUFF, desc: 'apply_weakness', value: 2 },
			{ type: IntentType.ATTACK, value: 6 },
			{ type: IntentType.DEBUFF, desc: 'apply_vulnerable', value: 1 },
			{ type: IntentType.ATTACK, value: 8 },
			{ type: IntentType.BLOCK, value: 6 }
		]
	},
	wolf: {
		name: 'Wolf', hp: 48, damage: 10, block: 6,
		intents: [
			{ type: IntentType.ATTACK, value: 10 },
			{ type: IntentType.ATTACK, value: 7 },
			{ type: IntentType.BUFF, desc: 'strength', value: 2 },
			{ type: IntentType.ATTACK, value: 14 },
			{ type: IntentType.BLOCK, value: 8 },
			{ type: IntentType.ATTACK, value: 10 }
		]
	},
	mushroom: {
		name: 'Mushroom', hp: 42, damage: 6, block: 8,
		intents: [
			{ type: IntentType.DEBUFF, desc: 'apply_poison', value: 4 },
			{ type: IntentType.BLOCK, value: 10 },
			{ type: IntentType.ATTACK, value: 8 },
			{ type: IntentType.DEBUFF, desc: 'apply_weakness', value: 2 },
			{ type: IntentType.ATTACK, value: 6 },
			{ type: IntentType.DEBUFF, desc: 'apply_poison', value: 6 }
		]
	},
	dragon: {
		name: 'Dragon', hp: 80, damage: 12, block: 10,
		intents: [
			{ type: IntentType.ATTACK, value: 12 },
			{ type: IntentType.BUFF, desc: 'strength', value: 3 },
			{ type: IntentType.ATTACK_BLOCK, value: 8, block: 8 },
			{ type: IntentType.ATTACK, value: 16 },
			{ type: IntentType.BLOCK, value: 14 },
			{ type: IntentType.ATTACK, value: 20 }
		]
	},
	guardian: {
		name: 'Tower Guardian', hp: 100, damage: 14, block: 12,
		intents: [
			{ type: IntentType.ATTACK, value: 10 },
			{ type: IntentType.BLOCK, value: 14 },
			{ type: IntentType.BUFF, desc: 'strength', value: 3 },
			{ type: IntentType.ATTACK, value: 16 },
			{ type: IntentType.ATTACK_BLOCK, value: 10, block: 10 },
			{ type: IntentType.DEBUFF, desc: 'apply_weakness', value: 3 },
			{ type: IntentType.ATTACK, value: 22 }
		]
	}
};

export function getEnemyList(): EnemyListEntry[] {
	return Object.entries(ENEMIES).map(([key, e]) => ({ key, name: e.name, hp: e.hp }));
}

// Shuffle array (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

interface PowerApplied {
	power: string;
	amount: number;
}

interface RawCard {
	id: string;
	name: string;
	type?: string;
	cost?: number;
	is_x_cost?: boolean;
	damage?: number;
	hit_count?: number;
	block?: number;
	description?: string;
	cards_draw?: number;
	energy_gain?: number;
	hp_loss?: number;
	powers_applied?: PowerApplied[];
}

/**
 * Map ggez.gg card format to battle format
 */
function mapCard(card: RawCard): BattleCard {
	const poisonPower = card.powers_applied?.find(p => p.power === 'Poison');
	const weakPower = card.powers_applied?.find(p => p.power === 'Weakened' || p.power === 'Weakness');
	const vulnPower = card.powers_applied?.find(p => p.power === 'Vulnerable');
	const strPower = card.powers_applied?.find(p => p.power === 'Strength');
	const dexPower = card.powers_applied?.find(p => p.power === 'Dexterity');
	const thornsPower = card.powers_applied?.find(p => p.power === 'Thorns');
	const regenPower = card.powers_applied?.find(p => p.power === 'Regen' || p.power === 'Regeneration');

	return {
		id: card.id,
		name: card.name,
		type: (card.type || 'Attack').toLowerCase(),
		cost: card.is_x_cost ? 0 : (card.cost || 0),
		damage: card.damage || 0,
		hitCount: card.hit_count || 1,
		block: card.block || 0,
		description: card.description || '',
		cardsDraw: card.cards_draw || 0,
		energyGain: card.energy_gain || 0,
		hpLoss: card.hp_loss || 0,
		exhausts: card.type === 'Power', // Powers exhaust (play once)
		applyPoison: poisonPower?.amount || 0,
		applyWeakness: weakPower?.amount || 0,
		applyVulnerable: vulnPower?.amount || 0,
		applyStrength: strPower?.amount || 0,
		applyDexterity: dexPower?.amount || 0,
		applyThorns: thornsPower?.amount || 0,
		applyRegen: regenPower?.amount || 0,
		_original: card
	};
}

/**
 * Create a new battle state
 */
export function createBattle(deckCards: RawCard[], enemyKey: string = 'dummy', customHP: number | null = null): BattleState {
	const enemyDef = ENEMIES[enemyKey] || ENEMIES.dummy;
	const mappedDeck = deckCards.map(mapCard);

	return {
		// Player
		playerHP: 80,
		playerMaxHP: 80,
		playerBlock: 0,
		playerMana: 3,
		playerMaxMana: 3,
		playerStatuses: [],
		cardsPerTurn: 5,

		// Deck piles
		drawPile: shuffle(mappedDeck),
		discardPile: [],
		exhaustPile: [],
		hand: [],

		// Enemy
		enemyName: enemyDef.name,
		enemyHP: customHP || enemyDef.hp,
		enemyMaxHP: customHP || enemyDef.hp,
		enemyBlock: 0,
		enemyStatuses: [],
		enemyIntents: enemyDef.intents,
		enemyKey,

		// Battle state
		turn: 0,
		phase: 'player',
		totalDamageDealt: 0,
		log: [],

		// Animation queue
		animations: []
	};
}

function addLog(state: BattleState, msg: string): void {
	state.log = [...state.log, { turn: state.turn, msg, ts: Date.now() }];
}

function getStacks(statuses: StatusEffect[], type: string): number {
	const s = statuses.find(st => st.type === type);
	return s ? s.stacks : 0;
}

function hasStatus(statuses: StatusEffect[], type: string): boolean {
	return getStacks(statuses, type) > 0;
}

function applyStatus(statuses: StatusEffect[], type: string, stacks: number): void {
	const existing = statuses.find(s => s.type === type);
	if (existing) {
		existing.stacks += stacks;
	} else {
		statuses.push({ type, stacks });
	}
}

function tickStatuses(statuses: StatusEffect[]): { damage: number; healing: number } {
	let damage = 0;
	let healing = 0;
	for (const s of statuses) {
		if (s.type === StatusType.POISON) {
			damage += s.stacks;
			s.stacks -= 1;
		} else if (s.type === StatusType.REGEN) {
			healing += s.stacks;
			s.stacks -= 1;
		} else if (s.type === StatusType.WEAKNESS || s.type === StatusType.VULNERABLE) {
			s.stacks -= 1;
		}
	}
	// Remove expired
	const filtered = statuses.filter(s => s.stacks > 0);
	statuses.length = 0;
	statuses.push(...filtered);
	return { damage, healing };
}

/**
 * Start a new turn — draw cards, restore mana, tick statuses
 */
export function startPlayerTurn(state: BattleState): BattleState {
	state.turn += 1;
	state.phase = 'player';
	state.playerBlock = 0;
	state.playerMana = state.playerMaxMana;

	// Tick player statuses
	const { damage, healing } = tickStatuses(state.playerStatuses);
	if (damage > 0) {
		state.playerHP -= damage;
		addLog(state, `You take ${damage} poison damage`);
		state.animations.push({ type: 'player_damage', value: damage, source: 'poison' });
	}
	if (healing > 0) {
		state.playerHP = Math.min(state.playerHP + healing, state.playerMaxHP);
		addLog(state, `You regenerate ${healing} HP`);
	}

	if (state.playerHP <= 0) {
		state.playerHP = 0;
		state.phase = 'lost';
		addLog(state, 'You have been defeated!');
		return state;
	}

	// Draw cards
	drawCards(state, state.cardsPerTurn);
	addLog(state, `Turn ${state.turn} — Drew ${state.hand.length} cards, ${state.playerMana} mana`);
	return state;
}

function drawCards(state: BattleState, count: number): void {
	for (let i = 0; i < count; i++) {
		if (state.drawPile.length === 0) {
			if (state.discardPile.length === 0) break;
			state.drawPile = shuffle(state.discardPile);
			state.discardPile = [];
			addLog(state, 'Shuffled discard pile into draw pile');
		}
		const card = state.drawPile.pop();
		if (card) state.hand.push(card);
	}
}

/**
 * Check if a card can be played
 */
export function canPlayCard(state: BattleState, handIndex: number): boolean {
	if (state.phase !== 'player') return false;
	const card = state.hand[handIndex];
	if (!card) return false;
	return state.playerMana >= card.cost;
}

/**
 * Play a card from hand
 */
export function playCard(state: BattleState, handIndex: number): BattleState {
	if (!canPlayCard(state, handIndex)) return state;

	const card = state.hand[handIndex];
	state.playerMana -= card.cost;
	state.hand.splice(handIndex, 1);

	addLog(state, `Played ${card.name} (${card.cost} mana)`);

	// Deal damage
	if (card.damage > 0) {
		for (let i = 0; i < card.hitCount; i++) {
			let dmg = card.damage;
			dmg += getStacks(state.playerStatuses, StatusType.STRENGTH);
			if (hasStatus(state.playerStatuses, StatusType.WEAKNESS)) {
				dmg = Math.floor(dmg * 0.75);
			}
			if (hasStatus(state.enemyStatuses, StatusType.VULNERABLE)) {
				dmg = Math.floor(dmg * 1.5);
			}
			const actual = Math.max(dmg - state.enemyBlock, 0);
			state.enemyBlock = Math.max(state.enemyBlock - dmg, 0);
			state.enemyHP = Math.max(state.enemyHP - actual, 0);
			state.totalDamageDealt += actual;

			if (actual > 0) {
				state.animations.push({ type: 'enemy_damage', value: actual });
				addLog(state, `Dealt ${actual} damage`);
			}
		}
	}

	// Gain block
	if (card.block > 0) {
		let blk = card.block;
		blk += getStacks(state.playerStatuses, StatusType.DEXTERITY);
		state.playerBlock += blk;
		state.animations.push({ type: 'player_block', value: blk });
	}

	// Draw cards
	if (card.cardsDraw > 0) {
		drawCards(state, card.cardsDraw);
		addLog(state, `Drew ${card.cardsDraw} card(s)`);
	}

	// Energy gain
	if (card.energyGain > 0) {
		state.playerMana += card.energyGain;
	}

	// HP loss
	if (card.hpLoss > 0) {
		state.playerHP -= card.hpLoss;
	}

	// Apply status effects to enemy
	if (card.applyPoison > 0) applyStatus(state.enemyStatuses, StatusType.POISON, card.applyPoison);
	if (card.applyWeakness > 0) applyStatus(state.enemyStatuses, StatusType.WEAKNESS, card.applyWeakness);
	if (card.applyVulnerable > 0) applyStatus(state.enemyStatuses, StatusType.VULNERABLE, card.applyVulnerable);

	// Apply status effects to player
	if (card.applyStrength > 0) applyStatus(state.playerStatuses, StatusType.STRENGTH, card.applyStrength);
	if (card.applyDexterity > 0) applyStatus(state.playerStatuses, StatusType.DEXTERITY, card.applyDexterity);
	if (card.applyThorns > 0) applyStatus(state.playerStatuses, StatusType.THORNS, card.applyThorns);
	if (card.applyRegen > 0) applyStatus(state.playerStatuses, StatusType.REGEN, card.applyRegen);

	// Exhaust or discard
	if (card.exhausts) {
		state.exhaustPile.push(card);
	} else {
		state.discardPile.push(card);
	}

	// Check win
	if (state.enemyHP <= 0) {
		state.phase = 'won';
		addLog(state, 'Victory!');
	}

	return state;
}

/**
 * End player turn — discard hand, run enemy turn
 */
export function endPlayerTurn(state: BattleState): BattleState {
	if (state.phase !== 'player') return state;

	// Discard remaining hand
	state.discardPile.push(...state.hand);
	state.hand = [];

	// Enemy turn
	state.phase = 'enemy';
	state.enemyBlock = 0;

	// Tick enemy statuses
	const { damage } = tickStatuses(state.enemyStatuses);
	if (damage > 0) {
		state.enemyHP = Math.max(state.enemyHP - damage, 0);
		state.totalDamageDealt += damage;
		addLog(state, `Enemy takes ${damage} poison damage`);
		state.animations.push({ type: 'enemy_damage', value: damage, source: 'poison' });
	}

	if (state.enemyHP <= 0) {
		state.phase = 'won';
		addLog(state, 'Victory! Enemy defeated by poison.');
		return state;
	}

	// Execute enemy intent
	const intent = state.enemyIntents[(state.turn - 1) % state.enemyIntents.length];
	executeEnemyIntent(state, intent);

	if (state.playerHP <= 0) {
		state.playerHP = 0;
		state.phase = 'lost';
		addLog(state, 'You have been defeated!');
		return state;
	}

	// Start next player turn
	return startPlayerTurn(state);
}

function executeEnemyIntent(state: BattleState, intent: EnemyIntent): void {
	switch (intent.type) {
		case IntentType.ATTACK: {
			const dmg = calcEnemyDamage(state, intent.value);
			applyDamageToPlayer(state, dmg);
			// Thorns
			const thorns = getStacks(state.playerStatuses, StatusType.THORNS);
			if (thorns > 0) {
				state.enemyHP = Math.max(state.enemyHP - thorns, 0);
				state.totalDamageDealt += thorns;
				addLog(state, `Thorns deal ${thorns} damage back`);
			}
			break;
		}
		case IntentType.BLOCK:
			state.enemyBlock = intent.value;
			addLog(state, `${state.enemyName} gains ${intent.value} Block`);
			break;
		case IntentType.BUFF:
			if (intent.desc === 'strength') {
				applyStatus(state.enemyStatuses, StatusType.STRENGTH, intent.value);
				addLog(state, `${state.enemyName} gains ${intent.value} Strength`);
			}
			break;
		case IntentType.DEBUFF:
			if (intent.desc === 'apply_poison') {
				applyStatus(state.playerStatuses, StatusType.POISON, intent.value);
				addLog(state, `${state.enemyName} applies ${intent.value} Poison`);
			} else if (intent.desc === 'apply_weakness') {
				applyStatus(state.playerStatuses, StatusType.WEAKNESS, intent.value);
				addLog(state, `${state.enemyName} applies ${intent.value} Weakness`);
			} else if (intent.desc === 'apply_vulnerable') {
				applyStatus(state.playerStatuses, StatusType.VULNERABLE, intent.value);
				addLog(state, `${state.enemyName} applies ${intent.value} Vulnerable`);
			}
			break;
		case IntentType.ATTACK_BLOCK: {
			const dmg = calcEnemyDamage(state, intent.value);
			applyDamageToPlayer(state, dmg);
			state.enemyBlock = intent.block || 0;
			addLog(state, `${state.enemyName} also gains ${intent.block} Block`);
			break;
		}
	}
}

function calcEnemyDamage(state: BattleState, base: number): number {
	let dmg = base + getStacks(state.enemyStatuses, StatusType.STRENGTH);
	if (hasStatus(state.enemyStatuses, StatusType.WEAKNESS)) {
		dmg = Math.floor(dmg * 0.75);
	}
	return dmg;
}

function applyDamageToPlayer(state: BattleState, dmg: number): void {
	if (hasStatus(state.playerStatuses, StatusType.VULNERABLE)) {
		dmg = Math.floor(dmg * 1.5);
	}
	const actual = Math.max(dmg - state.playerBlock, 0);
	state.playerBlock = Math.max(state.playerBlock - dmg, 0);
	state.playerHP -= actual;
	if (actual > 0) {
		state.animations.push({ type: 'player_damage', value: actual });
	}
	addLog(state, `${state.enemyName} attacks for ${actual} damage`);
}

/**
 * Get the enemy's next intent for display
 */
export function getNextIntent(state: BattleState): IntentDisplay {
	const intent = state.enemyIntents[state.turn % state.enemyIntents.length];
	switch (intent.type) {
		case IntentType.ATTACK:
			return { icon: '⚔️', text: `Attack ${calcEnemyDamage(state, intent.value)}`, color: 'text-red-400' };
		case IntentType.BLOCK:
			return { icon: '🛡️', text: `Block ${intent.value}`, color: 'text-blue-400' };
		case IntentType.BUFF:
			return { icon: '💪', text: `Buff +${intent.value}`, color: 'text-yellow-400' };
		case IntentType.DEBUFF:
			return { icon: '💀', text: `Debuff ${intent.value}`, color: 'text-purple-400' };
		case IntentType.ATTACK_BLOCK:
			return { icon: '⚔️🛡️', text: `Attack ${calcEnemyDamage(state, intent.value)} + Block ${intent.block}`, color: 'text-orange-400' };
		default:
			return { icon: '❓', text: 'Unknown', color: 'text-gray-400' };
	}
}

/**
 * Get status icon/color for display
 */
export function getStatusDisplay(status: StatusEffect): StatusDisplay {
	switch (status.type) {
		case StatusType.POISON: return { icon: '🧪', color: 'text-green-400', bg: 'bg-green-500/20' };
		case StatusType.STRENGTH: return { icon: '💪', color: 'text-red-400', bg: 'bg-red-500/20' };
		case StatusType.WEAKNESS: return { icon: '📉', color: 'text-yellow-600', bg: 'bg-yellow-500/20' };
		case StatusType.VULNERABLE: return { icon: '🎯', color: 'text-orange-400', bg: 'bg-orange-500/20' };
		case StatusType.REGEN: return { icon: '💚', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
		case StatusType.DEXTERITY: return { icon: '🏃', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
		case StatusType.THORNS: return { icon: '🌹', color: 'text-pink-400', bg: 'bg-pink-500/20' };
		default: return { icon: '?', color: 'text-gray-400', bg: 'bg-gray-500/20' };
	}
}
