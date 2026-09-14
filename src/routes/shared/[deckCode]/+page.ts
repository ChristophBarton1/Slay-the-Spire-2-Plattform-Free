import { decodeDeck } from '$lib/sts2/utils/deckCode';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const decoded = decodeDeck(params.deckCode);

	if (!decoded) {
		return { error: 'Invalid deck code' };
	}

	const [cards, characters, relics, potions, relicTranslations, potionTranslations, cardTranslations] = await Promise.all([
		fetch('/data/sts2/cards.json').then(r => r.json()),
		fetch('/data/sts2/characters.json').then(r => r.json()),
		fetch('/data/sts2/relics.json').then(r => r.json()),
		fetch('/data/sts2/potions.json').then(r => r.json()),
		fetch('/data/sts2/relics-i18n.json').then(r => r.json()).catch(() => ({})),
		fetch('/data/sts2/potions-i18n.json').then(r => r.json()).catch(() => ({})),
		fetch('/data/sts2/cards-i18n.json').then(r => r.json()).catch(() => ({}))
	]);

	const character = characters.find((c: { id: string }) => c.id === decoded.characterId) || null;
	const deckCards = decoded.cardIds.map((id: string) => cards.find((c: { id: string }) => c.id === id)).filter(Boolean);
	const deckRelics = decoded.relicIds.map((id: string) => relics.find((r: { id: string }) => r.id === id)).filter(Boolean);
	const deckPotions = decoded.potionIds.map((id: string) => potions.find((p: { id: string }) => p.id === id)).filter(Boolean);

	return {
		character,
		deckCards,
		deckRelics,
		deckPotions,
		deckCode: params.deckCode,
		relicTranslations,
		potionTranslations,
		cardTranslations
	};
}
