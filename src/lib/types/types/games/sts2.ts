/**
 * Slay the Spire 2 Types
 */

// ============================================
// CHARACTER TYPES
// ============================================

export type STS2Character = 'ironclad' | 'silent' | 'defect' | 'necrobinder' | 'regent' | 'potion' | 'relic';
export type CardTier = 'S' | 'A' | 'B' | 'C' | 'D';
export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'SPECIAL';
export type CardType = 'ATTACK' | 'SKILL' | 'POWER' | 'STATUS' | 'CURSE';

// ============================================
// CARD TYPES
// ============================================

export interface STS2Card {
	id: string;
	name: string;
	description: string;
	descriptionRaw: string;
	cost: number;
	type: CardType;
	rarity: CardRarity;
	character: STS2Character;
	
	// Stats
	damage?: number;
	block?: number;
	magicNumber?: number;
	
	// Upgrades
	upgradable: boolean;
	upgrade?: {
		cost?: string;
		damage?: string;
		block?: string;
		magicNumber?: string;
	};
	
	// Images
	imageUrl: string;
	betaImageUrl?: string;
}

// ============================================
// DECK TYPES
// ============================================

export interface STS2Deck {
	id: string;
	userId: string;
	username: string;
	character: STS2Character;
	name: string;
	description: string;
	cards: string[]; // Array of card IDs
	votes: number;
	createdAt: number;
	updatedAt: number;
	
	// User interaction
	userVoted?: boolean;
}

export interface DeckVote {
	userId: string;
	deckId: string;
	createdAt: number;
}

// ============================================
// TIER VOTE TYPES
// ============================================

export interface CardTierVote {
	cardId: string;
	character: STS2Character;
	tier: CardTier;
	sessionId: string;
	createdAt: number;
}

export interface TierVoteAggregation {
	cardId: string;
	tier: CardTier;
	count: number;
}

export interface TierVoteResponse {
	totals: TierVoteAggregation[];
	userVotes: Record<string, CardTier>; // cardId -> tier
}

// ============================================
// EVENT TYPES
// ============================================

export interface STS2Event {
	id: string;
	name: string;
	type: 'Event' | 'Combat' | 'Shop' | 'Rest' | 'Treasure' | 'Unknown';
	act: string;
	description: string;
	options: Array<{
		id: string;
		text: string;
		result: string;
	}> | null;
}

// ============================================
// RELIC TYPES
// ============================================

export interface STS2Relic {
	id: string;
	name: string;
	description: string;
	rarity: 'STARTER' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'BOSS' | 'SPECIAL';
	character: STS2Character | 'shared';
	imageUrl: string;
}
