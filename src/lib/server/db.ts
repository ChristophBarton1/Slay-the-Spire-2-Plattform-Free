import { createClient } from '@libsql/client';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

// Environment variables für Turso oder lokale SQLite
const url = dev ? 'file:local.db' : (env.TURSO_DATABASE_URL || 'file:local.db');
// Strip "Bearer " prefix if present (common mistake when copying from Turso dashboard)
const rawToken = dev ? undefined : env.TURSO_AUTH_TOKEN;
const authToken = rawToken?.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
export const db = createClient({
	url,
	authToken
});

// Initialize database schema
export async function initDB(): Promise<void> {
	await db.execute(`
		CREATE TABLE IF NOT EXISTS user (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT,
			created_at INTEGER NOT NULL,
			riot_puuid TEXT,
			riot_game_name TEXT,
			riot_tag_line TEXT,
			google_id TEXT,
			discord_id TEXT,
			email_verified INTEGER DEFAULT 0
		)
	`);
	
	// Add new columns if they don't exist (for existing databases)
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN google_id TEXT`);
	} catch (e) { /* Column exists */ }
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN discord_id TEXT`);
	} catch (e) { /* Column exists */ }
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN email_verified INTEGER DEFAULT 0`);
	} catch (e) { /* Column exists */ }
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN is_admin INTEGER DEFAULT 0`);
	} catch (e) { /* Column exists */ }
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN riot_access_token TEXT`);
	} catch (e) { /* Column exists */ }
	try {
		await db.execute(`ALTER TABLE user ADD COLUMN riot_token_expires_at INTEGER`);
	} catch (e) { /* Column exists */ }
	try {
		// Timestamp of the last champion-mastery sync — gates the 24h refresh.
		await db.execute(`ALTER TABLE user ADD COLUMN riot_mastery_synced_at INTEGER`);
	} catch (e) { /* Column exists */ }
	
	// User indexes for faster OAuth and email lookups
	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_google_id ON user(google_id)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_discord_id ON user(discord_id)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_riot_puuid ON user(riot_puuid)`);
	} catch (e) { /* Indexes exist */ }

	await db.execute(`
		CREATE TABLE IF NOT EXISTS session (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			expires_at INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES user(id)
		)
	`);
	
	// Session indexes for faster lookups
	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_session_expires ON session(expires_at)`);
	} catch (e) { /* Indexes exist */ }

	await db.execute(`
		CREATE TABLE IF NOT EXISTS password_reset_token (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			expires_at INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES user(id)
		)
	`);

	await db.execute(`
		CREATE TABLE IF NOT EXISTS email_verification_token (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			email TEXT NOT NULL,
			expires_at INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES user(id)
		)
	`);

	// User champion favorites — synced across devices when logged in
	await db.execute(`
		CREATE TABLE IF NOT EXISTS user_champion_favorites (
			user_id TEXT NOT NULL,
			champion_id TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			PRIMARY KEY (user_id, champion_id),
			FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
		)
	`);
	await db.execute(`CREATE INDEX IF NOT EXISTS idx_ucf_user ON user_champion_favorites(user_id)`);
	try {
		// 'manual' = user-starred, 'mastery' = auto-added from Riot champion mastery.
		// Lets the mastery sync replace only its own rows without touching manual favs.
		await db.execute(`ALTER TABLE user_champion_favorites ADD COLUMN source TEXT DEFAULT 'manual'`);
	} catch (e) { /* Column exists */ }

	// Champion Runes aggregated data - updated weekly
	await db.execute(`
		CREATE TABLE IF NOT EXISTS champion_runes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			champion_id TEXT NOT NULL,
			champion_name TEXT,
			region TEXT NOT NULL DEFAULT 'world',
			lane TEXT NOT NULL,
			primary_tree INTEGER,
			keystone INTEGER,
			primary_runes TEXT,
			secondary_tree INTEGER,
			secondary_runes TEXT,
			summoner_spell_1 INTEGER,
			summoner_spell_2 INTEGER,
			pick_rate REAL,
			win_rate REAL,
			games INTEGER,
			rank_filter TEXT DEFAULT 'emerald+',
			updated_at INTEGER NOT NULL,
			UNIQUE(champion_id, region, lane, keystone)
		)
	`);
	
	// Index for faster queries
	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_champion_runes_lookup ON champion_runes(champion_id, region, lane)`);
	} catch (e) { /* Index exists */ }

	// Champion Skill Orders - updated weekly
	await db.execute(`
		CREATE TABLE IF NOT EXISTS champion_skill_orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			champion_id TEXT NOT NULL,
			region TEXT NOT NULL DEFAULT 'world',
			lane TEXT NOT NULL,
			skill_order TEXT NOT NULL,
			games INTEGER DEFAULT 0,
			wins INTEGER DEFAULT 0,
			pick_rate REAL,
			win_rate REAL,
			rank_filter TEXT DEFAULT 'emerald+',
			updated_at INTEGER NOT NULL,
			UNIQUE(champion_id, region, lane, skill_order)
		)
	`);

	// Champion Matchups - updated weekly
	await db.execute(`
		CREATE TABLE IF NOT EXISTS champion_matchups (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			champion_id TEXT NOT NULL,
			enemy_champion_id TEXT NOT NULL,
			region TEXT NOT NULL DEFAULT 'world',
			lane TEXT NOT NULL,
			games INTEGER DEFAULT 0,
			wins INTEGER DEFAULT 0,
			win_rate REAL,
			rank_filter TEXT DEFAULT 'emerald+',
			updated_at INTEGER NOT NULL,
			UNIQUE(champion_id, enemy_champion_id, region, lane)
		)
	`);
	
	// Indexes
	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_skill_orders_lookup ON champion_skill_orders(champion_id, region, lane)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_matchups_lookup ON champion_matchups(champion_id, region, lane)`);
	} catch (e) { /* Indexes exist */ }

	// STS2 Saved Decks - max 5 per user
	await db.execute(`
		CREATE TABLE IF NOT EXISTS sts2_decks (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			character_id TEXT NOT NULL,
			name TEXT NOT NULL,
			card_ids TEXT NOT NULL,
			relic_ids TEXT DEFAULT '[]',
			potion_ids TEXT DEFAULT '[]',
			description TEXT DEFAULT '',
			votes INTEGER DEFAULT 0,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			FOREIGN KEY (user_id) REFERENCES user(id)
		)
	`);

	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_sts2_decks_user ON sts2_decks(user_id)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_sts2_decks_character ON sts2_decks(character_id)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_sts2_decks_votes ON sts2_decks(votes DESC)`);
	} catch (e) { /* Indexes exist */ }

	// STS2 Deck Votes - one vote per user per deck
	await db.execute(`
		CREATE TABLE IF NOT EXISTS sts2_deck_votes (
			user_id TEXT NOT NULL,
			deck_id TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			PRIMARY KEY (user_id, deck_id),
			FOREIGN KEY (user_id) REFERENCES user(id),
			FOREIGN KEY (deck_id) REFERENCES sts2_decks(id) ON DELETE CASCADE
		)
	`);

	// STS2 Card Tier Votes — anonymous community voting, one vote per card+char+session
	await db.execute(`
		CREATE TABLE IF NOT EXISTS sts2_card_tier_votes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			card_id TEXT NOT NULL,
			character TEXT NOT NULL,
			tier TEXT NOT NULL,
			session_id TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			UNIQUE(card_id, character, session_id)
		)
	`);

	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_card_tier_votes_char ON sts2_card_tier_votes(character)`);
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_card_tier_votes_card ON sts2_card_tier_votes(card_id, character)`);
		// Critical: session lookup scans all character rows without this index
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_card_tier_votes_session ON sts2_card_tier_votes(character, session_id)`);
	} catch (e) { /* Index exists */ }

	// LP History - stores rank snapshots over time (like Blitz/op.gg)
	// No UNIQUE constraint - we save on every LP change, not just once per day
	await db.execute(`
		CREATE TABLE IF NOT EXISTS lp_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			puuid TEXT NOT NULL,
			region TEXT NOT NULL,
			queue_type TEXT NOT NULL,
			tier TEXT NOT NULL,
			rank TEXT NOT NULL,
			league_points INTEGER NOT NULL,
			wins INTEGER DEFAULT 0,
			losses INTEGER DEFAULT 0,
			recorded_at INTEGER NOT NULL
		)
	`);
	
	// Index for fast lookups
	try {
		await db.execute(`CREATE INDEX IF NOT EXISTS idx_lp_history_lookup ON lp_history(puuid, queue_type, recorded_at DESC)`);
	} catch (e) { /* Index exists */ }
}
