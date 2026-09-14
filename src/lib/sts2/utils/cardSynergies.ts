// Card-to-card synergy computation for the Synergy Explorer
// Given a selected card, find all cards that synergize with it and explain why

export interface SynergyCategory {
	label: string;
	color: string;
}

export interface SynergyReason {
	reason: string;
	category: string;
	score: number;
}

export interface SynergyResult {
	card: SynergyCard;
	reasons: SynergyReason[];
	score: number;
}

export interface SynergyGroup {
	label: string;
	color: string;
	category: string;
	cards: { card: SynergyCard; reason: string; score: number }[];
	totalScore: number;
}

export interface SynergyCard {
	id: string;
	name: string;
	type: string;
	color?: string;
	damage?: number;
	block?: number;
	hit_count?: number;
	cost: number;
	is_x_cost?: boolean;
	description?: string;
	description_raw?: string;
	keywords?: string[];
	powers_applied?: { power: string; amount: number }[];
	tags?: string[];
	spawns_cards?: string[];
	energy_gain?: number;
	cards_draw?: number;
	hp_loss?: number;
	star_cost?: number;
	[key: string]: unknown;
}

const SYNERGY_CATEGORIES: Record<string, SynergyCategory> = {
	keyword: { label: 'Keyword Synergy', color: 'purple' },
	power: { label: 'Power Synergy', color: 'red' },
	mechanic: { label: 'Mechanic Synergy', color: 'blue' },
	scaling: { label: 'Scaling Synergy', color: 'orange' },
	trigger: { label: 'Trigger Synergy', color: 'green' },
	orb: { label: 'Orb Synergy', color: 'cyan' },
	archetype: { label: 'Archetype Synergy', color: 'yellow' },
};

export { SYNERGY_CATEGORIES };

// Synergy strength scores — higher = stronger synergy
const SCORE = { PERFECT: 3, STRONG: 2, NORMAL: 1 };

/**
 * Find all cards that synergize with the given card.
 * Returns an array of { card, reasons: [{reason, category, score}], score } objects,
 * sorted by total score (best synergies first).
 */
export function findSynergies(selectedCard: SynergyCard, allCards: SynergyCard[]): SynergyResult[] {
	if (!selectedCard || !allCards) return [];

	const validColors = [selectedCard.color, 'colorless'];
	const pool = allCards.filter(c =>
		c.id !== selectedCard.id &&
		validColors.includes(c.color) &&
		c.type !== 'Curse' &&
		c.type !== 'Status' &&
		c.type !== 'Quest'
	);

	const results = new Map<string, { card: SynergyCard; reasons: SynergyReason[] }>();

	function add(card: SynergyCard, reason: string, category: string, score: number = SCORE.NORMAL): void {
		if (!results.has(card.id)) {
			results.set(card.id, { card, reasons: [] });
		}
		const entry = results.get(card.id)!;
		if (!entry.reasons.some(r => r.reason === reason)) {
			entry.reasons.push({ reason, category, score });
		}
	}

	const desc = (selectedCard.description_raw || selectedCard.description || '').toLowerCase();
	const descOf = (c: SynergyCard): string => (c.description_raw || c.description || '').toLowerCase();
	const kws = selectedCard.keywords || [];
	const powers = (selectedCard.powers_applied || []).map(p => p.power);
	const tags = selectedCard.tags || [];
	const spawns = selectedCard.spawns_cards || [];

	// Derived semantic helpers — catch cards whose effect lives in description/custom powers
	const grantsBlock = (selectedCard.block || 0) > 0 ||
		(desc.includes('gain') && desc.includes('block'));
	const hasHpLoss = (selectedCard.hp_loss || 0) > 0 ||
		(desc.includes('lose') && (desc.includes(' hp') || desc.includes(' health')));
	const amplifiesVulnerable = desc.includes('vulnerable') &&
		(desc.includes('additional') || desc.includes('more damage'));

	// ── 1. Shared keyword synergies ──
	for (const kw of kws) {
		if (kw === 'Unplayable') continue;
		for (const c of pool) {
			if ((c.keywords || []).includes(kw)) {
				add(c, `Both have ${kw}`, 'keyword');
			}
		}
	}

	// ── 2. Exhaust triggers ──
	if (kws.includes('Exhaust')) {
		for (const c of pool) {
			const d = descOf(c);
			if (d.includes('whenever') && d.includes('exhaust')) {
				add(c, `Triggers whenever a card is Exhausted`, 'trigger', SCORE.STRONG);
			} else if (d.includes('for each') && d.includes('exhaust')) {
				add(c, `Scales with number of Exhausted cards`, 'scaling', SCORE.STRONG);
			} else if (d.includes('exhaust pile')) {
				add(c, `Interacts with the Exhaust Pile`, 'trigger', SCORE.NORMAL);
			}
		}
	}
	if ((desc.includes('whenever') && desc.includes('exhaust')) || desc.includes('exhaust pile') ||
	    (desc.includes('for each') && desc.includes('exhaust'))) {
		for (const c of pool) {
			if ((c.keywords || []).includes('Exhaust')) {
				add(c, `Exhaust card — feeds this card's effect`, 'trigger', SCORE.STRONG);
			}
		}
	}

	// ── 3. Strength synergies ──
	const givesStr = powers.includes('Strength') || powers.includes('StrengthPower');
	if (givesStr) {
		for (const c of pool) {
			if (c.type === 'Attack' && (c.hit_count || 0) > 1) {
				add(c, `Multi-hit Attack — Strength applies to each of ${c.hit_count} hits`, 'power', SCORE.PERFECT);
			} else if (c.type === 'Attack' && (c.damage || 0) > 0) {
				add(c, `Attack damage increased by Strength`, 'power');
			}
		}
	}
	if (selectedCard.type === 'Attack' && (selectedCard.hit_count || 0) > 1) {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			if (cp.includes('Strength') || cp.includes('StrengthPower')) {
				add(c, `Gives Strength — multiplied by ${selectedCard.hit_count} hits`, 'power', SCORE.PERFECT);
			}
		}
	}
	if (selectedCard.type === 'Attack' && (selectedCard.damage || 0) > 0) {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			if (cp.includes('Strength') || cp.includes('StrengthPower')) {
				add(c, `Gives Strength — boosts this Attack's damage`, 'power');
			}
		}
	}

	// ── 4. Dexterity + Block ──
	const givesDex = powers.includes('Dexterity') || powers.includes('DexterityPower');
	if (givesDex) {
		for (const c of pool) {
			const cd = descOf(c);
			const cGrantsBlock = (c.block || 0) > 0 || (cd.includes('gain') && cd.includes('block'));
			if (cGrantsBlock) {
				add(c, `Block card — Dexterity adds extra Block`, 'power', SCORE.STRONG);
			}
		}
	}
	if (grantsBlock) {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			if (cp.includes('Dexterity') || cp.includes('DexterityPower')) {
				add(c, `Gives Dexterity — increases Block gained`, 'power', SCORE.STRONG);
			}
		}
	}

	// ── 5. Vigor synergies ──
	const givesVigor = powers.includes('Vigor');
	if (givesVigor) {
		for (const c of pool) {
			if (c.type === 'Attack' && (c.damage || 0) > 0) {
				if ((c.hit_count || 0) > 1) {
					add(c, `Multi-hit Attack — Vigor bonus damage on first hit`, 'power', SCORE.STRONG);
				} else {
					add(c, `Attack — Vigor adds bonus damage to next Attack played`, 'power');
				}
			}
		}
	}
	if (selectedCard.type === 'Attack' && (selectedCard.damage || 0) > 0) {
		for (const c of pool) {
			if ((c.powers_applied || []).map(p => p.power).includes('Vigor')) {
				add(c, `Gives Vigor — adds bonus damage to this Attack`, 'power', SCORE.STRONG);
			}
		}
	}

	// ── 6. Poison synergies (Silent) ──
	const isPoison = powers.includes('Poison') || powers.includes('PoisonPower') || desc.includes('poison');
	if (isPoison) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('poison') && cd.includes('additional time')) {
				add(c, `Poison triggered additional times — massive scaling`, 'power', SCORE.PERFECT);
			} else if ((c.powers_applied || []).map(p => p.power).some(p => p === 'Poison' || p === 'PoisonPower') || cd.includes('poison')) {
				add(c, `Poison synergy — stacks compound each turn`, 'power', SCORE.STRONG);
			}
		}
	}

	// ── 7. Vulnerable / Weak ──
	if (powers.includes('Vulnerable')) {
		for (const c of pool) {
			if (c.type === 'Attack' && (c.damage || 0) >= 10) {
				add(c, `High-damage Attack deals 50% more to Vulnerable enemies`, 'power', SCORE.STRONG);
			} else if (c.type === 'Attack' && (c.damage || 0) > 0) {
				add(c, `Attack deals 50% more to Vulnerable enemies`, 'power');
			}
		}
	}
	if (selectedCard.type === 'Attack' && (selectedCard.damage || 0) > 0) {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			const cd = descOf(c);
			if (cp.includes('Vulnerable')) {
				add(c, `Applies Vulnerable — this Attack deals 50% more`, 'power', SCORE.STRONG);
			}
			if (cd.includes('vulnerable') && (cd.includes('additional') || cd.includes('more damage'))) {
				add(c, `Amplifies damage against Vulnerable enemies`, 'power', SCORE.STRONG);
			}
		}
	}
	// Vulnerable amplifiers (e.g. Cruelty) — give them synergies too
	if (amplifiesVulnerable) {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			const cd = descOf(c);
			if (cp.includes('Vulnerable') || (cd.includes('apply') && cd.includes('vulnerable'))) {
				add(c, `Applies Vulnerable — triggers the bonus damage amplification`, 'power', SCORE.PERFECT);
			}
			if (c.type === 'Attack' && (c.damage || 0) >= 10) {
				add(c, `High-damage Attack — benefits from Vulnerable damage bonus`, 'power', SCORE.STRONG);
			} else if (c.type === 'Attack' && (c.damage || 0) > 0) {
				add(c, `Attack — benefits from Vulnerable damage amplification`, 'power');
			}
		}
	}
	if (powers.includes('Weak')) {
		for (const c of pool) {
			if ((c.block || 0) >= 8) {
				add(c, `Weak enemies deal 25% less — your high Block goes even further`, 'power');
			}
		}
	}

	// ── 8. "Whenever you play X" triggers ──
	const whenAttack = desc.includes('whenever you play an attack') || desc.includes('whenever you play a attack');
	const whenSkill = desc.includes('whenever you play a skill');
	const whenPower = desc.includes('whenever you play a power');
	const whenCard = desc.includes('whenever you play a card');

	if (whenAttack || whenCard) {
		for (const c of pool) {
			if (c.type === 'Attack' && c.cost <= 1) {
				add(c, `Cheap Attack — triggers "whenever you play" often`, 'trigger', SCORE.STRONG);
			} else if (c.type === 'Attack') {
				add(c, `Triggers "whenever you play an Attack"`, 'trigger');
			}
		}
	}
	if (whenSkill || whenCard) {
		for (const c of pool) {
			if (c.type === 'Skill' && c.cost <= 1) {
				add(c, `Cheap Skill — triggers "whenever you play" often`, 'trigger', SCORE.STRONG);
			} else if (c.type === 'Skill') {
				add(c, `Triggers "whenever you play a Skill"`, 'trigger');
			}
		}
	}
	if (whenPower || whenCard) {
		for (const c of pool) {
			if (c.type === 'Power') add(c, `Triggers "whenever you play a Power"`, 'trigger');
		}
	}
	// Reverse
	if (selectedCard.type === 'Attack') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('whenever you play an attack') || cd.includes('whenever you play a attack') || cd.includes('whenever you play a card')) {
				add(c, `Triggers when you play this Attack`, 'trigger', SCORE.STRONG);
			}
		}
	}
	if (selectedCard.type === 'Skill') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('whenever you play a skill') || cd.includes('whenever you play a card')) {
				add(c, `Triggers when you play this Skill`, 'trigger', SCORE.STRONG);
			}
		}
	}
	if (selectedCard.type === 'Power') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('whenever you play a power') || cd.includes('whenever you play a card')) {
				add(c, `Triggers when you play this Power`, 'trigger', SCORE.STRONG);
			}
		}
	}

	// ── 9. Shiv archetype (Silent) ──
	const isShivCard = desc.includes('shiv') || spawns.includes('SHIV') || (tags.includes('Shiv'));
	if (isShivCard) {
		for (const c of pool) {
			const cd = descOf(c);
			const cSpawns = c.spawns_cards || [];
			const cTags = c.tags || [];
			if (cd.includes('shiv') || cSpawns.includes('SHIV') || cTags.includes('Shiv')) {
				const cp = (c.powers_applied || []).map(p => p.power);
				if (cp.includes('Accuracy') || cd.includes('shivs deal') || cd.includes('shivs now') || cd.includes('shivs gain')) {
					add(c, `Shiv enhancer — directly powers up Shivs`, 'archetype', SCORE.PERFECT);
				} else if (cd.includes('add') && cd.includes('shiv')) {
					add(c, `Generates Shivs — builds the Shiv engine`, 'archetype', SCORE.STRONG);
				} else {
					add(c, `Shiv synergy — part of the Shiv archetype`, 'archetype', SCORE.NORMAL);
				}
			}
		}
	}

	// ── 10. Osty / Minion archetype (Necrobinder) ──
	const isOstyCard = tags.includes('OstyAttack') || desc.includes('osty');
	if (isOstyCard) {
		for (const c of pool) {
			const cTags = c.tags || [];
			const cd = descOf(c);
			if (cTags.includes('OstyAttack') || cd.includes('osty')) {
				const cp = (c.powers_applied || []).map(p => p.power);
				if (cp.includes('Calcify') || cd.includes('osty') && (cd.includes('additional damage') || cd.includes('deal') && cd.includes('more'))) {
					add(c, `Osty enhancer — buffs Osty's attacks`, 'archetype', SCORE.PERFECT);
				} else {
					add(c, `Osty card — commands your skeletal companion`, 'archetype', SCORE.STRONG);
				}
			}
		}
	}
	// Summon synergies (Necrobinder)
	const isSummon = desc.includes('summon') && selectedCard.color === 'necrobinder';
	if (isSummon) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('summon') && c.color === 'necrobinder') {
				add(c, `Summon synergy — builds minion board presence`, 'archetype', SCORE.STRONG);
			}
			if ((c.tags || []).includes('Minion')) {
				add(c, `Minion — benefits from Summon effects`, 'archetype', SCORE.STRONG);
			}
		}
	}

	// ── 11. Soul archetype (Necrobinder) ──
	const isSoulCard = desc.includes('soul') && selectedCard.color === 'necrobinder';
	if (isSoulCard) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('soul') && c.color === 'necrobinder') {
				add(c, `Soul synergy — generates or consumes Souls`, 'archetype', SCORE.STRONG);
			}
		}
	}

	// ── 12. Doom archetype (Necrobinder) ──
	const isDoom = powers.includes('Doom') || desc.includes('doom');
	if (isDoom && selectedCard.color === 'necrobinder') {
		for (const c of pool) {
			const cp = (c.powers_applied || []).map(p => p.power);
			const cd = descOf(c);
			if (cp.includes('Doom') || cd.includes('doom')) {
				add(c, `Doom synergy — stacks compound for massive damage`, 'archetype', SCORE.STRONG);
			}
		}
	}

	// ── 13. Ethereal archetype (Necrobinder) ──
	if (kws.includes('Ethereal') || desc.includes('ethereal')) {
		for (const c of pool) {
			const cd = descOf(c);
			const ckws = c.keywords || [];
			if (ckws.includes('Ethereal') && !kws.includes('Ethereal')) {
				add(c, `Ethereal card — interacts with Ethereal effects`, 'keyword', SCORE.NORMAL);
			}
			if (cd.includes('ethereal') && !ckws.includes('Ethereal')) {
				add(c, `Benefits from or interacts with Ethereal cards`, 'keyword', SCORE.STRONG);
			}
		}
	}

	// ── 14. Star archetype (Regent) ──
	const isStar = (desc.includes('star') || (selectedCard.star_cost || 0) > 0) && selectedCard.color === 'regent';
	if (isStar) {
		for (const c of pool) {
			const cd = descOf(c);
			if ((cd.includes('star') || (c.star_cost || 0) > 0) && c.color === 'regent') {
				if (cd.includes('whenever you spend') || cd.includes('whenever you gain') || cd.includes('for each')) {
					add(c, `Star scaling — triggers on Star spending/gaining`, 'archetype', SCORE.PERFECT);
				} else if ((c.star_cost || 0) > 0) {
					add(c, `Star cost card — both spend Stars`, 'archetype', SCORE.NORMAL);
				} else {
					add(c, `Star synergy — generates or spends Stars`, 'archetype', SCORE.STRONG);
				}
			}
		}
	}

	// ── 15. Forge / Sovereign Blade (Regent) ──
	const isForge = desc.includes('forge') || desc.includes('sovereign blade');
	if (isForge && selectedCard.color === 'regent') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('forge') || cd.includes('sovereign blade')) {
				if (cd.includes('sovereign blade')) {
					add(c, `Sovereign Blade — the payoff for Forging`, 'archetype', SCORE.PERFECT);
				} else {
					add(c, `Forge synergy — powers up Sovereign Blade`, 'archetype', SCORE.STRONG);
				}
			}
		}
	}

	// ── 16. Colorless card synergy (Regent) ──
	const caresAboutColorless = desc.includes('colorless card') || desc.includes('colorless');
	if (caresAboutColorless && selectedCard.color === 'regent') {
		for (const c of pool) {
			if (c.color === 'colorless') {
				add(c, `Colorless card — triggers Colorless-card effects`, 'archetype', SCORE.STRONG);
			}
		}
	}
	if (selectedCard.color === 'colorless') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('colorless') && c.color === 'regent') {
				add(c, `Triggers when you play Colorless cards like this one`, 'archetype', SCORE.STRONG);
			}
		}
	}

	// ── 17. Discard synergies (Silent) ──
	const doesDiscard = desc.includes('discard') && !desc.includes('discard pile') && selectedCard.color === 'silent';
	const caresAboutDiscard = desc.includes('whenever') && desc.includes('discard');
	if (doesDiscard) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('whenever') && cd.includes('discard')) {
				add(c, `Triggers when you discard cards`, 'trigger', SCORE.PERFECT);
			}
			if ((c.keywords || []).includes('Retain')) {
				add(c, `Retain protects this card from being discarded`, 'keyword');
			}
		}
	}
	if (caresAboutDiscard) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('discard') && !cd.includes('discard pile')) {
				add(c, `Discards cards — triggers this card's effect`, 'trigger', SCORE.STRONG);
			}
		}
	}

	// ── 18. Orb synergies (Defect) ──
	const isOrbCard = (desc.includes('channel') || desc.includes('evoke') || desc.includes('focus')) && selectedCard.color === 'defect';
	if (isOrbCard) {
		for (const c of pool) {
			const cd = descOf(c);
			const cp = (c.powers_applied || []).map(p => p.power);
			if (cp.includes('Focus') || cp.includes('FocusPower')) {
				add(c, `Gives Focus — powers up all Orb passive and evoke effects`, 'orb', SCORE.PERFECT);
			} else if (cd.includes('channel') || cd.includes('evoke') || cd.includes('orb') || cd.includes('focus')) {
				add(c, `Orb synergy — Channel, Focus, and Evoke work together`, 'orb', SCORE.STRONG);
			}
		}
	}
	const givesFocus = powers.includes('Focus') || powers.includes('FocusPower');
	if (givesFocus) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('channel') || cd.includes('orb')) {
				add(c, `Focus increases all Orb passive and evoke values`, 'orb', SCORE.PERFECT);
			}
		}
	}

	// ── 19. Block retention (Barricade / Blur) ──
	const retainsBlock = desc.includes('block') && desc.includes('not removed');
	if (retainsBlock) {
		for (const c of pool) {
			const cd = descOf(c);
			const cGrantsBlock = (c.block || 0) > 0 || (cd.includes('gain') && cd.includes('block'));
			if (cGrantsBlock) {
				add(c, `Block card — Block carries over between turns with this`, 'scaling', SCORE.PERFECT);
			}
			const cp = (c.powers_applied || []).map(p => p.power);
			if (cp.includes('Dexterity') || cp.includes('DexterityPower')) {
				add(c, `Dexterity + Block retention = infinite Block scaling`, 'scaling', SCORE.PERFECT);
			}
		}
	}
	if (grantsBlock) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('block') && cd.includes('not removed')) {
				add(c, `Block retention — your Block carries over between turns`, 'scaling', SCORE.PERFECT);
			}
		}
	}

	// ── 20. Thorns synergies ──
	const givesThorns = powers.includes('Thorns');
	if (givesThorns) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('thorns') || (c.powers_applied || []).map(p => p.power).includes('Thorns')) {
				add(c, `More Thorns — stacks for higher retaliation damage`, 'power', SCORE.STRONG);
			}
		}
	}

	// ── 21. Plating synergies ──
	const givesPlating = powers.includes('Plating');
	if (givesPlating || desc.includes('plating')) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('plating') || (c.powers_applied || []).map(p => p.power).includes('Plating')) {
				add(c, `Plating synergy — stacks permanent armor`, 'power', SCORE.STRONG);
			}
		}
	}

	// ── 22. Intangible synergies ──
	const givesIntangible = powers.includes('Intangible') || desc.includes('intangible');
	if (givesIntangible) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('intangible') || (c.powers_applied || []).map(p => p.power).includes('Intangible')) {
				add(c, `Intangible synergy — reduces all damage to 1`, 'power', SCORE.PERFECT);
			}
		}
	}

	// ── 23. Energy generation + expensive cards ──
	if ((selectedCard.energy_gain || 0) > 0) {
		for (const c of pool) {
			if (c.is_x_cost) {
				add(c, `X-cost card — extra Energy means bigger effect`, 'mechanic', SCORE.PERFECT);
			} else if (c.cost >= 3) {
				add(c, `Expensive card (${c.cost} Energy) benefits from extra Energy`, 'mechanic', SCORE.STRONG);
			} else if (c.cost >= 2) {
				add(c, `Moderate cost card benefits from extra Energy`, 'mechanic');
			}
		}
	}
	if (selectedCard.is_x_cost) {
		for (const c of pool) {
			if ((c.energy_gain || 0) > 0) {
				add(c, `Generates Energy — bigger X-cost effect`, 'mechanic', SCORE.PERFECT);
			}
		}
	} else if (selectedCard.cost >= 3) {
		for (const c of pool) {
			if ((c.energy_gain || 0) > 0) {
				add(c, `Generates Energy to help play this expensive card`, 'mechanic', SCORE.STRONG);
			}
		}
	}

	// ── 24. Cost reduction synergies ──
	const reducesCost = desc.includes('cost') && (desc.includes('reduce') || desc.includes('less') || desc.includes('costs 0'));
	if (reducesCost) {
		for (const c of pool) {
			if (c.cost >= 2 || c.is_x_cost) {
				add(c, `Expensive card — benefits from cost reduction`, 'mechanic', SCORE.STRONG);
			}
		}
	}
	if (selectedCard.cost >= 3 || selectedCard.is_x_cost) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('cost') && (cd.includes('reduce') || cd.includes('less'))) {
				add(c, `Reduces card costs — helps play expensive cards`, 'mechanic', SCORE.STRONG);
			}
		}
	}

	// ── 25. Card draw synergies ──
	if ((selectedCard.cards_draw || 0) >= 2) {
		for (const c of pool) {
			if (c.type === 'Power') {
				add(c, `Power — extra draw helps find it faster`, 'mechanic');
			}
		}
	}

	// ── 26. Retain synergies ──
	if (kws.includes('Retain')) {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('retain') && !(c.keywords || []).includes('Retain')) {
				add(c, `Benefits from or interacts with Retained cards`, 'keyword', SCORE.STRONG);
			}
		}
	}

	// ── 27. "For each" scaling ──
	if (desc.includes('for each') && desc.includes('exhaust')) {
		for (const c of pool) {
			if ((c.keywords || []).includes('Exhaust')) {
				add(c, `Exhaust card — increases "for each Exhausted" scaling`, 'scaling', SCORE.STRONG);
			}
		}
	}
	if (desc.includes('for each') && (desc.includes('orb') || desc.includes('channel'))) {
		for (const c of pool) {
			if (descOf(c).includes('channel')) {
				add(c, `Channels Orbs — increases "for each Orb" scaling`, 'scaling', SCORE.STRONG);
			}
		}
	}
	if (desc.includes('for each') && desc.includes('card')) {
		for (const c of pool) {
			if ((c.cards_draw || 0) > 0) {
				add(c, `Draw cards — increases "for each card" scaling`, 'scaling', SCORE.STRONG);
			}
		}
	}

	// ── 28. Self-damage / HP loss (Ironclad) ──
	if (hasHpLoss && selectedCard.color === 'ironclad') {
		for (const c of pool) {
			const cd = descOf(c);
			const cHasHpLoss = (c.hp_loss || 0) > 0 ||
				(cd.includes('lose') && (cd.includes(' hp') || cd.includes(' health')));
			if (cHasHpLoss) {
				add(c, `Self-damage synergy — both pay HP for powerful effects`, 'mechanic', SCORE.STRONG);
			}
		}
	}

	// ── 29. Sly keyword (Silent) ──
	if (kws.includes('Sly')) {
		for (const c of pool) {
			if ((c.keywords || []).includes('Sly')) {
				// Already caught by shared keywords, but boost score
			}
			const cd = descOf(c);
			if (cd.includes('sly') && !(c.keywords || []).includes('Sly')) {
				add(c, `Interacts with Sly cards`, 'keyword', SCORE.STRONG);
			}
		}
	}

	// ── 30. Transform synergies (Regent) ──
	if (desc.includes('transform') && selectedCard.color === 'regent') {
		for (const c of pool) {
			const cd = descOf(c);
			if (cd.includes('transform') && c.color === 'regent') {
				add(c, `Transform synergy — changes cards for better options`, 'archetype', SCORE.STRONG);
			}
		}
	}

	// Convert map to sorted array — sorted by total score (best synergies first)
	const arr: SynergyResult[] = Array.from(results.values()).map(entry => {
		const totalScore = entry.reasons.reduce((sum, r) => sum + r.score, 0);
		return { ...entry, score: totalScore };
	});
	arr.sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length);
	return arr;
}

/**
 * Group synergy results by category for display.
 * Each group's cards are sorted by their synergy score within that category.
 */
export function groupSynergiesByCategory(synergies: SynergyResult[]): SynergyGroup[] {
	const groups: Record<string, SynergyGroup> = {};
	for (const entry of synergies) {
		for (const { reason, category, score } of entry.reasons) {
			if (!groups[category]) {
				groups[category] = {
					...SYNERGY_CATEGORIES[category],
					category,
					cards: [],
					totalScore: 0
				};
			}
			const existing = groups[category].cards.find(c => c.card.id === entry.card.id);
			if (!existing) {
				groups[category].cards.push({ card: entry.card, reason, score: score || SCORE.NORMAL });
			} else if ((score || SCORE.NORMAL) > existing.score) {
				existing.reason = reason;
				existing.score = score || SCORE.NORMAL;
			}
		}
	}
	// Sort cards within each group by score, then sort groups by total score
	for (const g of Object.values(groups)) {
		g.cards.sort((a, b) => b.score - a.score);
		g.totalScore = g.cards.reduce((sum, c) => sum + c.score, 0);
	}
	return Object.values(groups).sort((a, b) => b.totalScore - a.totalScore || b.cards.length - a.cards.length);
}
