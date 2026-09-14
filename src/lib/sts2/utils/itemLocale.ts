/**
 * Applies locale-specific translations to an item array (relics, potions, etc.).
 * Falls back to the original English values when no translation exists.
 *
 * @param items - base items from JSON (English)
 * @param translations - { de: { ITEM_ID: { name, description } }, fr: {...}, ... }
 * @param locale - current locale string e.g. 'de', 'fr-FR'
 * @returns items with translated name/description where available
 */

export interface ItemTranslation {
	name?: string;
	description?: string;
}

export interface ItemTranslationMap {
	[lang: string]: {
		[itemId: string]: ItemTranslation;
	};
}

export interface LocalizableItem {
	id: string;
	name: string;
	description?: string;
	[key: string]: unknown;
}

export function localizeItems(items: LocalizableItem[], translations: ItemTranslationMap | null, locale: string): LocalizableItem[] {
	if (!translations || !locale || locale === 'en') return items;

	const lang = locale.split('-')[0].toLowerCase();
	const langMap = translations[lang];
	if (!langMap) return items;

	return items.map(item => {
		const t = langMap[item.id];
		if (!t) return item;
		return {
			...item,
			name: t.name || item.name,
			description: t.description || item.description
		};
	});
}
