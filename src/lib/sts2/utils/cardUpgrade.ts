/**
 * Card Upgrade System
 * Computes upgraded card stats and re-renders description from description_raw templates.
 */

export interface UpgradeableCard {
	id: string;
	name: string;
	type: string;
	cost: number;
	damage?: number | null;
	block?: number | null;
	description?: string;
	description_raw?: string;
	vars?: Record<string, unknown>;
	upgrade?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface UpgradedCard extends UpgradeableCard {
	_isUpgraded: boolean;
	_addedKeywords: string[];
	_removedKeywords: string[];
	_baseCard: UpgradeableCard;
}

/**
 * Find the matching closing brace index, handling nested braces.
 */
function findClosingBrace(str: string, start: number): number {
	let depth = 1;
	for (let i = start; i < str.length; i++) {
		if (str[i] === '{') depth++;
		else if (str[i] === '}') {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

/**
 * Split a string on top-level pipe characters (not inside nested braces).
 */
function splitPipe(str: string): string[] {
	const parts: string[] = [];
	let current = '';
	let depth = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '{') depth++;
		else if (str[i] === '}') depth--;
		else if (str[i] === '|' && depth === 0) {
			parts.push(current);
			current = '';
			continue;
		}
		current += str[i];
	}
	parts.push(current);
	return parts;
}

/**
 * Find the first colon that is not inside nested braces.
 */
function findFirstColon(str: string): number {
	let depth = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === '{') depth++;
		else if (str[i] === '}') depth--;
		else if (str[i] === ':' && depth === 0) return i;
	}
	return -1;
}

/**
 * Render a description_raw template with given vars.
 * @param raw - The description_raw template string
 * @param vars - Variable values to substitute
 * @param isUpgraded - Whether to render the upgraded version
 * @returns Rendered description
 */
export function renderDescriptionRaw(raw: string, vars: Record<string, unknown>, isUpgraded: boolean): string {
	if (!raw) return '';
	let result = '';
	let i = 0;

	while (i < raw.length) {
		if (raw[i] === '{') {
			const closeIdx = findClosingBrace(raw, i + 1);
			if (closeIdx === -1) {
				result += raw[i];
				i++;
				continue;
			}
			const template = raw.substring(i + 1, closeIdx);
			result += evaluateTemplate(template, vars || {}, isUpgraded);
			i = closeIdx + 1;
		} else {
			result += raw[i];
			i++;
		}
	}

	return result;
}

/**
 * Evaluate a single template expression (content between { and }).
 */
function evaluateTemplate(template: string, vars: Record<string, unknown>, isUpgraded: boolean): string {
	const colonIdx = findFirstColon(template);

	// No format specifier — just a variable reference
	if (colonIdx === -1) {
		// Special inline tokens
		if (template === 'singleStarIcon') return '[star:1]';
		const val = vars[template];
		return val !== undefined ? String(val) : '';
	}

	const varName = template.substring(0, colonIdx);
	const format = template.substring(colonIdx + 1);

	// IfUpgraded — conditional display based on upgrade state
	if (varName === 'IfUpgraded') {
		if (format.startsWith('show:')) {
			const parts = splitPipe(format.slice(5));
			const chosen = isUpgraded ? (parts[0] || '') : (parts[1] || '');
			return renderDescriptionRaw(chosen, vars, isUpgraded);
		}
		return '';
	}

	// InCombat — dynamic combat info, strip for static display
	if (varName === 'InCombat' || varName === 'IsTargeting' || varName === 'HasRider') {
		return '';
	}

	// CardType:choose — runtime-dependent, skip
	if (varName === 'CardType') {
		return '';
	}

	const value = vars[varName] as number | undefined;

	// diff() — output numeric value; if missing from vars, it's computed at runtime (show "X")
	if (format === 'diff()' || format === 'inverseDiff()') {
		return value !== undefined ? String(value) : 'X';
	}

	// energyIcons() — render as [energy:N]
	if (format === 'energyIcons()') {
		return value !== undefined ? `[energy:${value}]` : '';
	}
	if (format.startsWith('energyIcons(')) {
		const n = format.match(/\d+/)?.[0];
		return `[energy:${n || value || 1}]`;
	}

	// starIcons() — render as [star:N] to match game format
	if (format === 'starIcons()') {
		return value !== undefined ? `[star:${value}]` : '';
	}
	if (format.startsWith('starIcons(')) {
		const n = format.match(/\d+/)?.[0];
		return `[star:${n || value || 1}]`;
	}

	// plural: — pluralization
	if (format.startsWith('plural:')) {
		const parts = splitPipe(format.slice(7));
		const singular = parts[0] || '';
		const plural = parts[1] || '';
		const chosen = value === 1 ? singular : plural;
		// Replace {} shorthand with the variable's value, and {:format()} with evaluated sub-template
		const resolved = chosen
			.replace(/\{:diff\(\)\}/g, value !== undefined ? String(value) : '')
			.replace(/\{\}/g, value !== undefined ? String(value) : '');
		return renderDescriptionRaw(resolved, vars, isUpgraded);
	}

	// cond: — conditional (e.g., cond:>1?text|text)
	if (format.startsWith('cond:')) {
		const condStr = format.slice(5);
		const match = condStr.match(/^>(\d+)\?([\s\S]*)/);
		if (match) {
			const threshold = parseInt(match[1]);
			const parts = splitPipe(match[2]);
			const chosen = (value as number) > threshold ? (parts[0] || '') : (parts[1] || '');
			return renderDescriptionRaw(chosen, vars, isUpgraded);
		}
		return '';
	}

	// choose() — type-based conditional (too complex, skip)
	if (format.startsWith('choose(')) {
		return '';
	}

	// show: — conditional show (similar to IfUpgraded but on other vars)
	if (format.startsWith('show:')) {
		const parts = splitPipe(format.slice(5));
		// Show first option if var is truthy/upgraded, else second
		const chosen = (isUpgraded || value) ? (parts[0] || '') : (parts[1] || '');
		return renderDescriptionRaw(chosen, vars, isUpgraded);
	}

	// Fallback — just output the value
	return value !== undefined ? String(value) : '';
}

/**
 * Apply upgrade modifiers to card vars.
 * Upgrade keys are lowercase versions of var names.
 * Values can be "+N" (relative) or N (absolute for cost).
 */
function applyUpgradeToVars(vars: Record<string, unknown> | undefined, upgrade: Record<string, unknown>): Record<string, unknown> {
	if (!vars || !upgrade) return { ...vars };

	const upgraded: Record<string, unknown> = { ...vars };

	// Build a case-insensitive lookup for vars
	const varLookup: Record<string, string> = {};
	for (const key of Object.keys(upgraded)) {
		varLookup[key.toLowerCase()] = key;
	}

	for (const [upgradeKey, upgradeVal] of Object.entries(upgrade)) {
		// Skip special flags
		if (['cost', 'add_innate', 'add_retain', 'remove_exhaust', 'remove_ethereal'].includes(upgradeKey)) {
			continue;
		}

		const varKey = varLookup[upgradeKey.toLowerCase()];
		if (varKey && typeof upgradeVal === 'string' && upgradeVal.startsWith('+')) {
			const delta = parseInt(upgradeVal.slice(1));
			if (!isNaN(delta)) {
				upgraded[varKey] = ((upgraded[varKey] as number) || 0) + delta;
			}
		} else if (varKey && typeof upgradeVal === 'number') {
			upgraded[varKey] = upgradeVal;
		} else if (!varKey) {
			// Try to find a matching var by common patterns
			// e.g., "damage" might map to "Damage", "extradamage" to "ExtraDamage"
			for (const vk of Object.keys(upgraded)) {
				if (vk.toLowerCase() === upgradeKey.toLowerCase()) {
					if (typeof upgradeVal === 'string' && upgradeVal.startsWith('+')) {
						upgraded[vk] = ((upgraded[vk] as number) || 0) + parseInt(upgradeVal.slice(1));
					}
					break;
				}
			}
		}
	}

	return upgraded;
}

/**
 * Compute the upgraded version of a card.
 * Returns a new object with upgraded stats and description.
 */
export function applyUpgrade(card: UpgradeableCard): UpgradedCard | null {
	if (!card) return null;

	const hasUpgradeObj = card.upgrade && Object.keys(card.upgrade).length > 0;
	const hasIfUpgraded = card.description_raw && card.description_raw.includes('IfUpgraded:show:');

	// No upgrade possible
	if (!hasUpgradeObj && !hasIfUpgraded) return null;

	const upgrade = card.upgrade || {};
	const upgradedVars = applyUpgradeToVars(card.vars, upgrade);

	// Compute upgraded cost
	const upgradedCost = (upgrade as Record<string, unknown>).cost !== undefined ? (upgrade as Record<string, unknown>).cost as number : card.cost;

	// Compute upgraded damage
	let upgradedDamage = card.damage;
	if ((upgrade as Record<string, unknown>).damage && card.damage != null) {
		if (typeof (upgrade as Record<string, unknown>).damage === 'string' && ((upgrade as Record<string, unknown>).damage as string).startsWith('+')) {
			upgradedDamage = card.damage + parseInt(((upgrade as Record<string, unknown>).damage as string).slice(1));
		} else {
			upgradedDamage = parseInt(String((upgrade as Record<string, unknown>).damage));
		}
	}

	// Compute upgraded block
	let upgradedBlock = card.block;
	if ((upgrade as Record<string, unknown>).block && card.block != null) {
		if (typeof (upgrade as Record<string, unknown>).block === 'string' && ((upgrade as Record<string, unknown>).block as string).startsWith('+')) {
			upgradedBlock = card.block + parseInt(((upgrade as Record<string, unknown>).block as string).slice(1));
		} else {
			upgradedBlock = parseInt(String((upgrade as Record<string, unknown>).block));
		}
	}

	// Compute upgraded description from description_raw
	let upgradedDescription = card.description;
	if (card.description_raw) {
		upgradedDescription = renderDescriptionRaw(card.description_raw, upgradedVars, true);
		// Clean up InCombat empty sections
		upgradedDescription = upgradedDescription.replace(/\[InCombat\]/g, '');
	}

	// Compute added/removed keywords
	const addedKeywords: string[] = [];
	const removedKeywords: string[] = [];
	if ((upgrade as Record<string, unknown>).add_innate) addedKeywords.push('Innate');
	if ((upgrade as Record<string, unknown>).add_retain) addedKeywords.push('Retain');
	if ((upgrade as Record<string, unknown>).remove_exhaust) removedKeywords.push('Exhaust');
	if ((upgrade as Record<string, unknown>).remove_ethereal) removedKeywords.push('Ethereal');

	return {
		...card,
		name: card.name + '+',
		cost: upgradedCost,
		damage: upgradedDamage,
		block: upgradedBlock,
		description: upgradedDescription,
		vars: upgradedVars,
		_isUpgraded: true,
		_addedKeywords: addedKeywords,
		_removedKeywords: removedKeywords,
		_baseCard: card
	};
}
