/**
 * Applies locale-specific translations to a card array.
 * Falls back to the original English values when no translation exists.
 *
 * @param cards - base cards from cards.json (English)
 * @param translations - { de: { CARD_ID: { name, description } }, fr: {...}, ... }
 * @param locale - current locale string e.g. 'de', 'fr-FR'
 * @returns cards with translated name/description where available
 */

export interface CardTranslation {
	name?: string;
	description?: string;
	description_raw?: string;
}

export interface TranslationMap {
	[lang: string]: {
		[cardId: string]: CardTranslation;
	};
}

export interface LocalizableCard {
	id: string;
	name: string;
	description: string;
	description_raw?: string;
	[key: string]: unknown;
}

export function localizeCards(cards: LocalizableCard[], translations: TranslationMap | null, locale: string): LocalizableCard[] {
	if (!translations || !locale || locale === 'en') return cards;

	// Normalize locale: 'de-DE' → 'de', 'fr-FR' → 'fr'
	const lang = locale.split('-')[0].toLowerCase();
	const langMap = translations[lang];
	if (!langMap) return cards;

	return cards.map(card => {
		const t = langMap[card.id];
		if (!t) return card;
		return {
			...card,
			name: t.name || card.name,
			description: t.description || card.description,
			description_raw: t.description_raw || card.description_raw
		};
	});
}
