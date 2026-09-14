/**
 * Core Types for ggez.gg
 * These types are shared across all games and features
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
	id: string;
	username: string;
	email: string;
	passwordHash?: string;
	createdAt: number;
	
	// OAuth IDs
	googleId?: string;
	discordId?: string;
	
	// Riot Games
	riotPuuid?: string;
	riotGameName?: string;
	riotTagLine?: string;
	
	// Permissions
	emailVerified: boolean;
	isAdmin: boolean;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: number;
}

export interface AuthResponse {
	success: boolean;
	user?: {
		id: string;
		username: string;
		email: string;
	};
	error?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

// ============================================
// CACHE TYPES
// ============================================

export interface CacheOptions {
	ttl?: number; // Time to live in seconds
	key: string;
}

export interface CacheEntry<T> {
	data: T;
	cachedAt: number;
	expiresAt: number;
}
