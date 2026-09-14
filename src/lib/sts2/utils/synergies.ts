// Detect deck synergies based on card keywords, types, and powers

export interface SynergyCard {
	type: string;
	cost: number;
	damage?: number;
	block?: number;
	hit_count?: number;
	is_x_cost?: boolean;
	keywords?: string[];
	powers_applied?: { power: string; amount: number }[];
	cards_draw?: number;
	energy_gain?: number;
	[key: string]: unknown;
}

export interface SynergyRelic {
	name: string;
	description?: string;
	[key: string]: unknown;
}

export interface DetectedSynergy {
	name: string;
	icon: string;
	description: string;
	strength: 'strong' | 'moderate' | 'warning';
}

export function detectSynergies(cards: SynergyCard[], relics: SynergyRelic[] = []): DetectedSynergy[] {
	const synergies: DetectedSynergy[] = [];

	const keywords: Record<string, number> = {};
	const types: Record<string, number> = { Attack: 0, Skill: 0, Power: 0 };
	const powersUsed: Record<string, number> = {};
	let totalDamage = 0;
	let totalBlock = 0;
	let exhaustCount = 0;
	let drawCount = 0;
	let energyGain = 0;

	for (const card of cards) {
		if (types[card.type] !== undefined) types[card.type]++;

		if (card.keywords) {
			for (const kw of card.keywords) {
				keywords[kw] = (keywords[kw] || 0) + 1;
			}
		}

		if (card.powers_applied) {
			for (const p of card.powers_applied) {
				powersUsed[p.power] = (powersUsed[p.power] || 0) + p.amount;
			}
		}

		totalDamage += (card.damage || 0) * (card.hit_count || 1);
		totalBlock += card.block || 0;
		if (card.keywords?.includes('Exhaust')) exhaustCount++;
		drawCount += card.cards_draw || 0;
		energyGain += card.energy_gain || 0;
	}

	// Strength archetype
	if (powersUsed['Strength'] || powersUsed['StrengthPower']) {
		synergies.push({
			name: 'Strength Scaling',
			icon: 'STR',
			description: 'Multiple Strength sources amplify Attack damage',
			strength: 'strong'
		});
	}

	// Dexterity / Block archetype
	if (powersUsed['Dexterity'] || powersUsed['DexterityPower'] || totalBlock > 30) {
		synergies.push({
			name: 'Block Engine',
			icon: 'BLK',
			description: 'High block generation with Dexterity scaling',
			strength: totalBlock > 50 ? 'strong' : 'moderate'
		});
	}

	// Exhaust archetype
	if (exhaustCount >= 3) {
		synergies.push({
			name: 'Exhaust Synergy',
			icon: 'EXH',
			description: `${exhaustCount} Exhaust cards — triggers on-exhaust effects`,
			strength: exhaustCount >= 5 ? 'strong' : 'moderate'
		});
	}

	// Poison archetype
	if (powersUsed['Poison'] || powersUsed['PoisonPower']) {
		synergies.push({
			name: 'Poison Stack',
			icon: 'PSN',
			description: 'Poison accumulates and deals damage each turn',
			strength: 'strong'
		});
	}

	// Draw engine
	if (drawCount >= 5) {
		synergies.push({
			name: 'Draw Engine',
			icon: 'DRW',
			description: `${drawCount} extra card draws per cycle — fast deck cycling`,
			strength: drawCount >= 8 ? 'strong' : 'moderate'
		});
	}

	// Energy engine
	if (energyGain >= 3) {
		synergies.push({
			name: 'Energy Generation',
			icon: 'NRG',
			description: `+${energyGain} extra energy from cards`,
			strength: energyGain >= 5 ? 'strong' : 'moderate'
		});
	}

	// Ethereal cards
	if (keywords['Ethereal'] >= 2) {
		synergies.push({
			name: 'Ethereal Package',
			icon: 'ETH',
			description: 'Ethereal cards exhaust if not played — high tempo risk/reward',
			strength: 'moderate'
		});
	}

	// Innate cards
	if (keywords['Innate'] >= 2) {
		synergies.push({
			name: 'Consistent Opener',
			icon: 'INN',
			description: `${keywords['Innate']} Innate cards guarantee strong opening hands`,
			strength: 'moderate'
		});
	}

	// Retain
	if (keywords['Retain'] >= 2) {
		synergies.push({
			name: 'Retain Value',
			icon: 'RET',
			description: 'Retained cards provide flexibility across turns',
			strength: 'moderate'
		});
	}

	// Sly
	if (keywords['Sly'] >= 2) {
		synergies.push({
			name: 'Sly Plays',
			icon: 'SLY',
			description: 'Sly cards trigger bonus effects when conditions are met',
			strength: keywords['Sly'] >= 4 ? 'strong' : 'moderate'
		});
	}

	// Thorns
	if (powersUsed['Thorns'] || powersUsed['ThornsPower']) {
		synergies.push({
			name: 'Thorns Defense',
			icon: 'THN',
			description: 'Deal damage back to attackers passively',
			strength: 'moderate'
		});
	}

	// Orb synergy (Defect)
	const orbPowers = ['Focus', 'FocusPower'];
	if (orbPowers.some(p => powersUsed[p])) {
		synergies.push({
			name: 'Orb Focus',
			icon: 'ORB',
			description: 'Focus increases all Orb passive and evoke values',
			strength: 'strong'
		});
	}

	// Relic synergies
	for (const relic of relics) {
		const relicDesc = (relic.description || '').toLowerCase();
		if (relicDesc.includes('exhaust') && exhaustCount >= 2) {
			synergies.push({
				name: `${relic.name} + Exhaust`,
				icon: '+',
				description: `${relic.name} synergizes with your ${exhaustCount} Exhaust cards`,
				strength: 'strong'
			});
		}
		if (relicDesc.includes('strength') && powersUsed['Strength']) {
			synergies.push({
				name: `${relic.name} + Strength`,
				icon: '+',
				description: `${relic.name} amplifies your Strength scaling`,
				strength: 'strong'
			});
		}
		if (relicDesc.includes('block') && totalBlock > 20) {
			synergies.push({
				name: `${relic.name} + Block`,
				icon: '+',
				description: `${relic.name} enhances your block strategy`,
				strength: 'moderate'
			});
		}
	}

	// Warnings
	if (types.Attack === 0) {
		synergies.push({
			name: 'No Attacks',
			icon: '!',
			description: 'Deck has no Attack cards — may struggle to deal damage',
			strength: 'warning'
		});
	}

	if (cards.length > 0 && types.Skill === 0) {
		synergies.push({
			name: 'No Skills',
			icon: '!',
			description: 'Deck has no Skill cards — limited defensive options',
			strength: 'warning'
		});
	}

	const avgCost = cards.length > 0
		? cards.filter(c => !c.is_x_cost).reduce((s, c) => s + (c.cost || 0), 0) / cards.length
		: 0;
	if (avgCost > 2.5 && cards.length >= 5) {
		synergies.push({
			name: 'High Cost Deck',
			icon: '!',
			description: `Average cost ${avgCost.toFixed(1)} — may have energy problems`,
			strength: 'warning'
		});
	}

	return synergies;
}
