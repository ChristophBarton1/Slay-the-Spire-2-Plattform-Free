import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import type { CardTier } from '$lib/types';

const VALID_TIERS: ReadonlySet<string> = new Set(['S', 'A', 'B', 'C', 'D']);
const VALID_CHARS: ReadonlySet<string> = new Set(['ironclad', 'silent', 'defect', 'necrobinder', 'regent', 'potion', 'relic']);
const CACHE_TTL = 1800; // 30 minutes cache (votes change slowly)
const TIERS: CardTier[] = ['S', 'A', 'B', 'C', 'D'];

interface VoteCounts {
	S: number;
	A: number;
	B: number;
	C: number;
	D: number;
	total: number;
	community_tier?: CardTier;
}

function getTopTier(v: VoteCounts): CardTier {
	return TIERS.reduce((best, t) => v[t] > v[best] ? t : best, 'S' as CardTier);
}

/**
 * GET /api/tier-votes?character=ironclad&session=UUID
 * Returns aggregated vote counts per card for the given character.
 * Also returns the session's own vote for each card if session param given.
 */
export const GET: RequestHandler = async ({ url, platform }) => {
	const character = url.searchParams.get('character')?.toLowerCase();
	const sessionId = url.searchParams.get('session') || '';

	if (!character || !VALID_CHARS.has(character)) {
		return json({ error: 'Invalid character' }, { status: 400 });
	}

	try {
		const cacheKey = `tier-votes:${character}`;
		let totals: { rows: any[] } | null = null;

		// Try KV cache first (reduces D1 reads by ~95%)
		if (platform?.env?.MATCH_CACHE) {
			const cached = await platform.env.MATCH_CACHE.get(cacheKey, 'json');
			if (cached) {
				totals = { rows: cached as any[] };
			}
		}

		// Cache miss - query D1
		if (!totals) {
			totals = await db.execute({
				sql: `SELECT card_id, tier, COUNT(*) as count
					FROM sts2_card_tier_votes
					WHERE character = ?
					GROUP BY card_id, tier`,
				args: [character]
			});

			// Store in KV cache
			if (platform?.env?.MATCH_CACHE && totals.rows) {
				await platform.env.MATCH_CACHE.put(cacheKey, JSON.stringify(totals.rows), {
					expirationTtl: CACHE_TTL
				});
			}
		}

		// Get this session's votes
		let sessionVotes: { rows: any[] } = { rows: [] };
		if (sessionId) {
			sessionVotes = await db.execute({
				sql: `SELECT card_id, tier FROM sts2_card_tier_votes WHERE character = ? AND session_id = ?`,
				args: [character, sessionId]
			});
		}

		// Build result map
		const result: Record<string, VoteCounts> = {};
		for (const row of totals.rows) {
			if (!result[row.card_id]) result[row.card_id] = { S: 0, A: 0, B: 0, C: 0, D: 0, total: 0 };
			result[row.card_id][row.tier as CardTier] = Number(row.count);
			result[row.card_id].total += Number(row.count);
		}

		// Add community_tier (tier with most votes)
		for (const cardId of Object.keys(result)) {
			result[cardId].community_tier = getTopTier(result[cardId]);
		}

		// Add user's own vote per card
		const myVotes: Record<string, CardTier> = {};
		for (const row of sessionVotes.rows) {
			myVotes[row.card_id] = row.tier as CardTier;
		}

		return json({ votes: result, myVotes });
	} catch (e) {
		console.error('Tier votes GET error:', e);
		return json({ votes: {}, myVotes: {} });
	}
};

/**
 * POST /api/tier-votes
 * Body: { card_id, character, tier, session_id }
 * Upserts a vote (allows changing your mind).
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	let body: { card_id?: string; character?: string; tier?: string; session_id?: string };
	try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, { status: 400 }); }

	const { card_id, character, tier, session_id } = body;

	if (!card_id || typeof card_id !== 'string' || card_id.length > 60) return json({ error: 'Invalid card_id' }, { status: 400 });
	if (!VALID_CHARS.has(character?.toLowerCase() ?? '')) return json({ error: 'Invalid character' }, { status: 400 });
	if (!tier || !VALID_TIERS.has(tier)) return json({ error: 'Invalid tier' }, { status: 400 });
	if (!session_id || typeof session_id !== 'string' || session_id.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(session_id)) return json({ error: 'Invalid session' }, { status: 400 });

	try {
		// Upsert: if same card+char+session already voted, update tier
		await db.execute({
			sql: `INSERT INTO sts2_card_tier_votes (card_id, character, tier, session_id, created_at)
				VALUES (?, ?, ?, ?, ?)
				ON CONFLICT(card_id, character, session_id) DO UPDATE SET tier = excluded.tier`,
			args: [card_id.toUpperCase(), character!.toLowerCase(), tier, session_id, Date.now()]
		});

		// Invalidate cache for this character
		if (platform?.env?.MATCH_CACHE) {
			await platform.env.MATCH_CACHE.delete(`tier-votes:${character!.toLowerCase()}`);
		}

		// Return updated counts for this card
		const counts = await db.execute({
			sql: `SELECT tier, COUNT(*) as count FROM sts2_card_tier_votes WHERE card_id = ? AND character = ? GROUP BY tier`,
			args: [card_id.toUpperCase(), character!.toLowerCase()]
		});

		const result: VoteCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, total: 0 };
		for (const row of counts.rows) {
			result[row.tier as CardTier] = Number(row.count);
			result.total += Number(row.count);
		}
		result.community_tier = getTopTier(result);

		return json({ ok: true, counts: result });
	} catch (e) {
		console.error('Tier vote POST error:', e);
		return json({ error: 'Failed to save vote' }, { status: 500 });
	}
};
