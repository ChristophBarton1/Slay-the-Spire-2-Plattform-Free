/**
 * League of Legends Types
 * Based on Riot Games API
 */

// ============================================
// RIOT API TYPES
// ============================================

export type RiotRegion = 'euw' | 'na' | 'kr' | 'eune' | 'br' | 'lan' | 'las' | 'oce' | 'tr' | 'ru' | 'jp';
export type RiotRole = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY';
export type DisplayRole = 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support';

export type Tier = 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER';
export type Rank = 'IV' | 'III' | 'II' | 'I';
export type QueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_TFT';

// ============================================
// SUMMONER TYPES
// ============================================

export interface Summoner {
	id: string;
	accountId: string;
	puuid: string;
	name: string;
	profileIconId: number;
	summonerLevel: number;
	revisionDate: number;
}

export interface RankedStats {
	queueType: QueueType;
	tier: Tier;
	rank: Rank;
	leaguePoints: number;
	wins: number;
	losses: number;
	hotStreak: boolean;
	veteran: boolean;
	freshBlood: boolean;
	inactive: boolean;
}

// ============================================
// CHAMPION TYPES
// ============================================

export interface Champion {
	id: number;
	name: string;
	key: string;
	title: string;
	tags: string[];
	partype: string;
}

export interface ChampionStats {
	championId: number;
	name: string;
	role: RiotRole;
	games: number;
	wins: number;
	losses: number;
	winRate: number;
	pickRate: number;
	banRate: number;
	tier: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C' | 'D';
}

// ============================================
// MATCH TYPES
// ============================================

export interface Match {
	metadata: {
		matchId: string;
		participants: string[];
	};
	info: {
		gameCreation: number;
		gameDuration: number;
		gameEndTimestamp: number;
		gameId: number;
		gameMode: string;
		gameName: string;
		gameStartTimestamp: number;
		gameType: string;
		gameVersion: string;
		mapId: number;
		participants: Participant[];
		platformId: string;
		queueId: number;
		teams: Team[];
		tournamentCode: string;
	};
}

export interface Participant {
	puuid: string;
	summonerId: string;
	summonerName: string;
	championId: number;
	championName: string;
	teamId: number;
	teamPosition: RiotRole;
	role: string;
	lane: string;
	
	// Stats
	kills: number;
	deaths: number;
	assists: number;
	goldEarned: number;
	totalMinionsKilled: number;
	neutralMinionsKilled: number;
	champLevel: number;
	
	// Items
	item0: number;
	item1: number;
	item2: number;
	item3: number;
	item4: number;
	item5: number;
	item6: number;
	
	// Runes
	perks: {
		statPerks: {
			defense: number;
			flex: number;
			offense: number;
		};
		styles: Array<{
			description: string;
			selections: Array<{
				perk: number;
				var1: number;
				var2: number;
				var3: number;
			}>;
			style: number;
		}>;
	};
	
	// Summoner Spells
	summoner1Id: number;
	summoner2Id: number;
	
	// Game Result
	win: boolean;
	gameEndedInEarlySurrender: boolean;
	gameEndedInSurrender: boolean;
	teamEarlySurrendered: boolean;
}

export interface Team {
	teamId: number;
	win: boolean;
	bans: Array<{
		championId: number;
		pickTurn: number;
	}>;
	objectives: {
		baron: { first: boolean; kills: number };
		champion: { first: boolean; kills: number };
		dragon: { first: boolean; kills: number };
		inhibitor: { first: boolean; kills: number };
		riftHerald: { first: boolean; kills: number };
		tower: { first: boolean; kills: number };
	};
}

// ============================================
// LP HISTORY TYPES
// ============================================

export interface LPHistoryEntry {
	puuid: string;
	region: RiotRegion;
	queueType: QueueType;
	tier: Tier;
	rank: Rank;
	leaguePoints: number;
	wins: number;
	losses: number;
	recordedAt: number;
}

export interface LPHistoryStats {
	trackingSince: Date | null;
	totalRecords: number;
	lpChange: number;
	peakLp: number;
	lowestLp: number;
}
