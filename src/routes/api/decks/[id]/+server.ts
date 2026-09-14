import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

/** GET /api/decks/[id] - Get a single deck */
export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const result = await db.execute({
			sql: `SELECT d.*, u.username,
				CASE WHEN dv.user_id IS NOT NULL THEN 1 ELSE 0 END as user_voted
			FROM sts2_decks d
			JOIN user u ON d.user_id = u.id
			LEFT JOIN sts2_deck_votes dv ON dv.deck_id = d.id AND dv.user_id = ?
			WHERE d.id = ?`,
			args: [locals.user?.id || '', params.id]
		});

		if (result.rows.length === 0) {
			return json({ error: 'Deck not found' }, { status: 404 });
		}

		const row = result.rows[0];
		return json({
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
		});
	} catch (e) {
		console.error('Failed to fetch deck:', e);
		return json({ error: 'Failed to fetch deck' }, { status: 500 });
	}
};

/** PATCH /api/decks/[id] - Update own deck */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Login required' }, { status: 401 });
	}

	// Verify ownership
	const existing = await db.execute({
		sql: 'SELECT user_id FROM sts2_decks WHERE id = ?',
		args: [params.id]
	});

	if (existing.rows.length === 0) {
		return json({ error: 'Deck not found' }, { status: 404 });
	}

	if (existing.rows[0].user_id !== locals.user.id) {
		return json({ error: 'Not your deck' }, { status: 403 });
	}

	const { name, cardIds, relicIds, potionIds, description } = await request.json();

	const updates: string[] = [];
	const args: (string | number)[] = [];

	if (name !== undefined) {
		const cleanName = (name as string).trim().slice(0, 50);
		if (cleanName.length < 2) return json({ error: 'Name too short' }, { status: 400 });
		updates.push('name = ?');
		args.push(cleanName);
	}
	if (cardIds !== undefined) {
		if (!Array.isArray(cardIds) || cardIds.length === 0) return json({ error: 'Cards required' }, { status: 400 });
		updates.push('card_ids = ?');
		args.push(JSON.stringify(cardIds));
	}
	if (relicIds !== undefined) {
		updates.push('relic_ids = ?');
		args.push(JSON.stringify(relicIds));
	}
	if (potionIds !== undefined) {
		updates.push('potion_ids = ?');
		args.push(JSON.stringify(potionIds));
	}
	if (description !== undefined) {
		updates.push('description = ?');
		args.push((description as string).trim().slice(0, 200));
	}

	if (updates.length === 0) {
		return json({ error: 'Nothing to update' }, { status: 400 });
	}

	updates.push('updated_at = ?');
	args.push(Date.now());
	args.push(params.id);

	try {
		await db.execute({
			sql: `UPDATE sts2_decks SET ${updates.join(', ')} WHERE id = ?`,
			args
		});
		return json({ success: true });
	} catch (e) {
		console.error('Failed to update deck:', e);
		return json({ error: 'Failed to update deck' }, { status: 500 });
	}
};

/** DELETE /api/decks/[id] - Delete deck (own or admin2) */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Login required' }, { status: 401 });
	}

	const existing = await db.execute({
		sql: 'SELECT user_id FROM sts2_decks WHERE id = ?',
		args: [params.id]
	});

	if (existing.rows.length === 0) {
		return json({ error: 'Deck not found' }, { status: 404 });
	}

	// Allow deletion if owner OR admin
	const isAdmin = !!locals.user.isAdmin;
	const isOwner = existing.rows[0].user_id === locals.user.id;

	if (!isOwner && !isAdmin) {
		return json({ error: 'Not authorized' }, { status: 403 });
	}

	try {
		await db.execute({ sql: 'DELETE FROM sts2_deck_votes WHERE deck_id = ?', args: [params.id] });
		await db.execute({ sql: 'DELETE FROM sts2_decks WHERE id = ?', args: [params.id] });
		return json({ success: true });
	} catch (e) {
		console.error('Failed to delete deck:', e);
		return json({ error: 'Failed to delete deck' }, { status: 500 });
	}
};
