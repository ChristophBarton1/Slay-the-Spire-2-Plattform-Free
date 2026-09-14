// Encode deck state into a shareable URL code

export interface DeckCodeData {
	characterId: string | null;
	cardIds: string[];
	relicIds: string[];
	potionIds: string[];
}

export function encodeDeck(characterId: string, cardIds: string[], relicIds: string[] = [], potionIds: string[] = []): string {
	const data = {
		c: characterId,
		d: cardIds,
		r: relicIds,
		p: potionIds
	};
	const json = JSON.stringify(data);
	if (typeof btoa !== 'undefined') {
		return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}
	return Buffer.from(json).toString('base64url');
}

// Decode a deck code back into components
export function decodeDeck(code: string): DeckCodeData | null {
	try {
		const padded = code.replace(/-/g, '+').replace(/_/g, '/');
		let json: string;
		if (typeof atob !== 'undefined') {
			json = atob(padded);
		} else {
			json = Buffer.from(padded, 'base64').toString('utf8');
		}
		const data = JSON.parse(json);
		return {
			characterId: data.c || null,
			cardIds: data.d || [],
			relicIds: data.r || [],
			potionIds: data.p || []
		};
	} catch {
		return null;
	}
}
