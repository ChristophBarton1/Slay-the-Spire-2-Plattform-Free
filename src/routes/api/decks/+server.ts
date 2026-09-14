import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { nanoid } from 'nanoid';

const MAX_DECKS_PER_USER = 5;
const KV_CACHE_TTL = 900; // 15 min KV cache (was 300)
const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

interface DeckRow {
	id: string;
	user_id: string;
	username: string;
	character_id: string;
	name: string;
	card_ids: string;
	relic_ids: string | null;
	potion_ids: string | null;
	description: string | null;
	votes: number;
	user_voted: number;
	created_at: number;
	updated_at: number;
}

interface DeckResponse {
	id: string;
	userId: string;
	username: string;
	characterId: string;
	name: string;
	cardIds: string[];
	relicIds: string[];
	potionIds: string[];
	description: string;
	votes: number;
	userVoted: boolean;
	createdAt: number;
	updatedAt: number;
}

/** GET /api/decks - List decks (public gallery or user's decks) */
export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const character = url.searchParams.get('character');
	const userId = url.searchParams.get('user');
	const sort = url.searchParams.get('sort') || 'votes'; // votes | newest
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
	const offset = parseInt(url.searchParams.get('offset') || '0');

	// Only cache public gallery (not user-specific queries)
	const isPublicGallery = !userId && offset === 0;
	const cacheKey = isPublicGallery ? `decks:${character || 'all'}:${sort}:${limit}` : null;
	let result: { rows: any[] } | null = null;

	// Try KV cache for public gallery
	if (cacheKey && platform?.env?.MATCH_CACHE) {
		const cached = await platform.env.MATCH_CACHE.get(cacheKey, 'json') as DeckResponse[] | null;
		if (cached) {
			// Still need to check user votes from D1
			if (locals.user) {
				const deckIds = cached.map(d => d.id);
				if (deckIds.length > 0) {
					const votes = await db.execute({
						sql: `SELECT deck_id FROM sts2_deck_votes WHERE user_id = ? AND deck_id IN (${deckIds.map(() => '?').join(',')})`,
						args: [locals.user.id, ...deckIds]
					});
					const votedIds = new Set(votes.rows.map(r => r.deck_id as string));
					cached.forEach(deck => {
						deck.userVoted = votedIds.has(deck.id);
					});
				}
			}
			return json({ decks: cached });
		}
	}

	let query = `
		SELECT d.*, u.username,
			CASE WHEN dv.user_id IS NOT NULL THEN 1 ELSE 0 END as user_voted
		FROM sts2_decks d
		JOIN user u ON d.user_id = u.id
		LEFT JOIN sts2_deck_votes dv ON dv.deck_id = d.id AND dv.user_id = ?
	`;
	const params: (string | number)[] = [locals.user?.id || ''];
	const conditions: string[] = [];

	if (character) {
		conditions.push('d.character_id = ?');
		params.push(character.toLowerCase());
	}

	if (userId === 'me' && locals.user) {
		conditions.push('d.user_id = ?');
		params.push(locals.user.id);
	} else if (userId) {
		conditions.push('d.user_id = ?');
		params.push(userId);
	}

	if (conditions.length > 0) {
		query += ' WHERE ' + conditions.join(' AND ');
	}

	query += sort === 'newest' ? ' ORDER BY d.created_at DESC' : ' ORDER BY d.votes DESC, d.created_at DESC';
	query += ' LIMIT ? OFFSET ?';
	params.push(limit, offset);

	try {
		result = await db.execute({ sql: query, args: params });

		const decks: DeckResponse[] = result.rows.map(row => ({
			id: row.id as string,
			userId: row.user_id as string,
			username: row.username as string,
			characterId: row.character_id as string,
			name: row.name as string,
			cardIds: JSON.parse(row.card_ids as string),
			relicIds: JSON.parse((row.relic_ids as string) || '[]'),
			potionIds: JSON.parse((row.potion_ids as string) || '[]'),
			description: (row.description as string) || '',
			votes: row.votes as number,
			userVoted: !!row.user_voted,
			createdAt: row.created_at as number,
			updatedAt: row.updated_at as number
		}));

		if (cacheKey && platform?.env?.MATCH_CACHE) {
			await platform.env.MATCH_CACHE.put(cacheKey, JSON.stringify(decks), {
				expirationTtl: KV_CACHE_TTL
			});
		}

		// Edge-cache public gallery for anonymous users (s-maxage matches KV TTL)
		const isAnonymous = !locals.user && isPublicGallery;
		return json({ decks }, {
			headers: isAnonymous
				? { 'Cache-Control': `public, s-maxage=${KV_CACHE_TTL}, stale-while-revalidate=86400` }
				: { 'Cache-Control': 'private, no-store' }
		});
	} catch (e) {
		console.error('Failed to fetch decks:', e);
		return json({ error: 'Failed to fetch decks' }, { status: 500 });
	}
};

/** POST /api/decks - Save a new deck */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Login required' }, { status: 401 });
	}

	const { characterId, name, cardIds, relicIds, potionIds, description } = await request.json();

	// Validation
	if (!characterId || !name || !cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
		return json({ error: 'Character, name, and at least one card required' }, { status: 400 });
	}

	const cleanName: string = (name as string).trim().slice(0, MAX_NAME_LENGTH);
	const cleanDesc: string = ((description || '') as string).trim().slice(0, MAX_DESCRIPTION_LENGTH);

	if (cleanName.length < 2) {
		return json({ error: 'Deck name must be at least 2 characters' }, { status: 400 });
	}

	// Check deck limit
	try {
		const countResult = await db.execute({
			sql: 'SELECT COUNT(*) as count FROM sts2_decks WHERE user_id = ?',
			args: [locals.user.id]
		});

		if ((countResult.rows[0].count as number) >= MAX_DECKS_PER_USER) {
			return json({ error: `Maximum ${MAX_DECKS_PER_USER} decks allowed. Delete one to save a new one.` }, { status: 403 });
		}

		const id = nanoid(12);
		const now = Date.now();

		await db.execute({
			sql: `INSERT INTO sts2_decks (id, user_id, character_id, name, card_ids, relic_ids, potion_ids, description, votes, created_at, updated_at)
				  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
			args: [
				id,
				locals.user.id,
				(characterId as string).toLowerCase(),
				cleanName,
				JSON.stringify(cardIds),
				JSON.stringify(relicIds || []),
				JSON.stringify(potionIds || []),
				cleanDesc,
				now,
				now
			]
		});

		return json({ id, name: cleanName });
	} catch (e) {
		console.error('Failed to save deck:', e);
		return json({ error: 'Failed to save deck' }, { status: 500 });
	}
};
