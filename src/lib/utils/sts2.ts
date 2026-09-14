/**
 * STS2 Utility Functions with TypeScript
 * Helper functions for Slay the Spire 2 features
 */

import type { STS2Character, CardTier } from '$lib/types';

// Valid characters for STS2
export const VALID_CHARACTERS: ReadonlySet<STS2Character> = new Set([
	'ironclad',
	'silent', 
	'defect',
	'necrobinder',
	'regent',
	'potion',
	'relic'
]);

// Valid tier ratings
export const VALID_TIERS: ReadonlySet<CardTier> = new Set([
	'S',
	'A',
	'B',
	'C',
	'D'
]);

/**
 * Validates if a character is valid
 */
export function isValidCharacter(character: string): character is STS2Character {
	return VALID_CHARACTERS.has(character as STS2Character);
}

/**
 * Validates if a tier is valid
 */
export function isValidTier(tier: string): tier is CardTier {
	return VALID_TIERS.has(tier as CardTier);
}

/**
 * Validates session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
	return (
		typeof sessionId === 'string' &&
		sessionId.length > 0 &&
		sessionId.length <= 64 &&
		/^[a-zA-Z0-9_-]+$/.test(sessionId)
	);
}

/**
 * Validates card ID format
 */
export function isValidCardId(cardId: string): boolean {
	return (
		typeof cardId === 'string' &&
		cardId.length > 0 &&
		cardId.length <= 60
	);
}
