import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('sts2:cards');

	// Always load small critical data (characters ~61KB, keywords ~8KB)
	const [characters, keywordTranslations] = await Promise.all([
		fetch('/data/sts2/characters.json').then(r => r.json()),
		fetch('/data/sts2/keywords-i18n.json').then(r => r.json()).catch(() => ({}))
	]);

	// Skip heavy card data on server (502KB + 624KB = 1.1MB would bloat SSR HTML)
	// Cards are loaded client-side after initial paint via onMount + invalidate
	if (!browser) {
		return { cards: [], characters, cardTranslations: {}, keywordTranslations };
	}

	// cards-i18n.json (624KB) only needed for non-English locales.
	// Saves ~85KB brotli download for the majority of English-speaking users.
	// Locale is already initialised by svelte-i18n when invalidate('sts2:cards')
	// fires from onMount, so get(locale) is reliable here.
	const lang = (get(locale) || navigator.language || 'en').split('-')[0];
	const needsI18n = lang !== 'en';

	const [cards, cardTranslations] = await Promise.all([
		fetch('/data/sts2/cards.json').then(r => r.json()),
		needsI18n
			? fetch('/data/sts2/cards-i18n.json').then(r => r.json()).catch(() => ({}))
			: Promise.resolve({})
	]);

	return { cards, characters, cardTranslations, keywordTranslations };
}
