import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

/** POST /api/decks/[id]/vote - Toggle vote on a deck */
export const POST: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) {
		return json({ error: 'Login required' }, { status: 401 });
	}

	const deckId: string = params.id;
	const userId: string = locals.user.id;

	try {
		// Single query: check deck exists AND if user voted (reduces 2 queries to 1)
		const check = await db.execute({
			sql: `SELECT d.id, d.votes,
				CASE WHEN dv.user_id IS NOT NULL THEN 1 ELSE 0 END as has_voted
				FROM sts2_decks d
				LEFT JOIN sts2_deck_votes dv ON dv.deck_id = d.id AND dv.user_id = ?
				WHERE d.id = ?`,
			args: [userId, deckId]
		});

		if (check.rows.length === 0) {
			return json({ error: 'Deck not found' }, { status: 404 });
		}

		const hasVoted = check.rows[0].has_voted === 1;
		let newVotes: number;

		if (hasVoted) {
			// Remove vote (single UPDATE with RETURNING would be ideal, but D1 doesn't support it)
			await db.execute({
				sql: 'DELETE FROM sts2_deck_votes WHERE user_id = ? AND deck_id = ?',
				args: [userId, deckId]
			});
			await db.execute({
				sql: 'UPDATE sts2_decks SET votes = votes - 1 WHERE id = ?',
				args: [deckId]
			});
			newVotes = (check.rows[0].votes as number) - 1;
		} else {
			// Add vote
			await db.execute({
				sql: 'INSERT INTO sts2_deck_votes (user_id, deck_id, created_at) VALUES (?, ?, ?)',
				args: [userId, deckId, Date.now()]
			});
			await db.execute({
				sql: 'UPDATE sts2_decks SET votes = votes + 1 WHERE id = ?',
				args: [deckId]
			});
			newVotes = (check.rows[0].votes as number) + 1;
		}

		// Invalidate deck gallery cache
		if (platform?.env?.MATCH_CACHE) {
			const cacheKeys = ['decks:all:votes:50', 'decks:all:newest:50'];
			await Promise.all(cacheKeys.map(key => platform.env!.MATCH_CACHE!.delete(key)));
		}

		return json({ voted: !hasVoted, votes: newVotes });
	} catch (e) {
		console.error('Vote error:', e);
		return json({ error: 'Failed to vote' }, { status: 500 });
	}
};
